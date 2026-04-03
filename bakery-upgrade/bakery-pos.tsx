'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Banknote,
  Receipt,
  Clock,
  User,
  Package,
  Calendar,
  Tag as TagIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

// ============================================
// BAKERY POS - PUNTO DE VENTA OFFLINE-FIRST
// ============================================

interface CartItem {
  id: string;
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  basePrice: number;
  imageUrl?: string;
  isCustomizable: boolean;
  stockQuantity?: number;
  variants?: ProductVariant[];
}

interface ProductVariant {
  id: string;
  name: string;
  priceModifier: number;
}

interface Customer {
  id?: string;
  name: string;
  phone: string;
  email?: string;
}

// IndexedDB Schema
const DB_NAME = 'bakery_pos_db';
const DB_VERSION = 1;

const STORES = {
  products: 'id, sku, name, category, basePrice, imageUrl, isCustomizable, stockQuantity',
  variants: 'id, productId, name, priceModifier',
  customers: 'id, name, phone, email, loyaltyPoints',
  pendingOrders: 'id, data, timestamp',
  lastSync: 'id, timestamp'
};

// ============================================
// HOOK PARA INDEXEDDB (OFFLINE STORAGE)
// ============================================
export function useOfflineDB() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);

  const loadPendingOrders = useCallback(async () => {
    try {
      const db = await indexedDB.open(DB_NAME, DB_VERSION);
      const tx = db.transaction('readonly');
      const store = tx.objectStore('pendingOrders');
      const orders = await store.getAll();
      setPendingOrders(orders);
    } catch (error) {
      console.error('Error loading pending orders:', error);
    }
  }, []);

  useEffect(() => {
    // Initialize IndexedDB
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    // Create object stores
    for (const [storeName, keyPath] of Object.entries(STORES)) {
      if (!request.objectStoreNames.contains(storeName)) {
        request.createObjectStore(storeName, { keyPath });
      }
    }
    
    // Load pending orders
    loadPendingOrders();
    
    // Listen for online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loadPendingOrders]);

  const saveOrderOffline = async (orderData: any) => {
    try {
      const db = await indexedDB.open(DB_NAME, DB_VERSION);
      const tx = db.transaction('readwrite');
      const store = tx.objectStore('pendingOrders');
      
      const order = {
        id: `order_${Date.now()}`,
        data: orderData,
        timestamp: new Date().toISOString()
      };
      
      await store.add(order);
      setPendingOrders(prev => [...prev, order]);
      
      toast.success('Pedido guardado offline');
    } catch (error) {
      console.error('Error saving order offline:', error);
      toast.error('Error al guardar pedido');
    }
  };

  const syncPendingOrders = async () => {
    if (!isOnline || pendingOrders.length === 0) return;
    
    try {
      const db = await indexedDB.open(DB_NAME, DB_VERSION);
      
      for (const order of pendingOrders) {
        // Send to server
        const response = await fetch('/api/bakery/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(order.data)
        });
        
        if (response.ok) {
          // Remove from IndexedDB
          const tx = db.transaction('readwrite');
          const store = tx.objectStore('pendingOrders');
          await store.delete(order.id);
        }
      }
      
      setPendingOrders([]);
      toast.success(`${pendingOrders.length} pedidos sincronizados`);
    } catch (error) {
      console.error('Error syncing orders:', error);
    }
  };

  return {
    isOnline,
    pendingOrders,
    saveOrderOffline,
    syncPendingOrders,
    loadPendingOrders
  };
}

// ============================================
// COMPONENTE: BAKERY POS
// ============================================
interface BakeryPOSProps {
  tenantId: string;
  onOrderComplete?: (order: any) => void;
}

export function BakeryPOS({ tenantId, onOrderComplete }: BakeryPOSProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customer, setCustomer] = useState<Customer>({ name: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { isOnline, saveOrderOffline, syncPendingOrders } = useOfflineDB();

  // Load products
  useEffect(() => {
    loadProducts();
  }, [tenantId]);

  const loadProducts = async () => {
    try {
      const response = await fetch(`/api/bakery/products?tenantId=${tenantId}`);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Error al cargar productos');
    }
  };

  // Cart operations
  const addToCart = (product: Product, variant?: ProductVariant) => {
    const existingItem = cart.find(
      item => item.productId === product.id && item.variantId === variant?.id
    );

    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === product.id && item.variantId === variant?.id
          ? { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * item.unitPrice }
          : item
      ));
    } else {
      const price = variant 
        ? product.basePrice + variant.priceModifier 
        : product.basePrice;
      
      setCart([...cart, {
        id: `cart_${Date.now()}`,
        productId: product.id,
        productName: product.name,
        variantId: variant?.id,
        variantName: variant?.name,
        quantity: 1,
        unitPrice: price,
        totalPrice: price
      }]);
    }
    
    toast.success(`${product.name} agregado`);
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === itemId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { 
          ...item, 
          quantity: newQuantity, 
          totalPrice: newQuantity * item.unitPrice 
        };
      }
      return item;
    }));
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const discountAmount = discount;
  const tax = (subtotal - discountAmount) * 0.125; // 12.5% VAT Trinidad
  const total = subtotal - discountAmount + tax;

  // Process order
  const processOrder = async () => {
    if (cart.length === 0) {
      toast.error('Carrito vacío');
      return;
    }

    if (!customer.name || !customer.phone) {
      toast.error('Datos del cliente requeridos');
      return;
    }

    setIsProcessing(true);

    const orderData = {
      tenantId,
      orderType: 'POS',
      customer,
      items: cart,
      subtotal,
      discount: discountAmount,
      tax,
      total,
      paymentMethod,
      notes,
      currency: 'TTD'
    };

    try {
      if (isOnline) {
        const response = await fetch('/api/bakery/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        });

        if (!response.ok) throw new Error('Error al procesar orden');

        const result = await response.json();
        
        // Print receipt
        printReceipt(result.order);
        
        toast.success('¡Orden completada!');
        onOrderComplete?.(result.order);
      } else {
        // Save offline
        await saveOrderOffline(orderData);
        toast.info('Pedido guardado. Se sincronizará cuando haya conexión.');
      }

      // Reset
      setCart([]);
      setCustomer({ name: '', phone: '' });
      setDiscount(0);
      setNotes('');
      
    } catch (error) {
      console.error('Error processing order:', error);
      toast.error('Error al procesar orden');
    } finally {
      setIsProcessing(false);
    }
  };

  const printReceipt = (order: any) => {
    // Generate receipt content
    const receiptContent = `
========================================
         ${order.bakeryName || 'NexusOS Bakery'}
========================================
Orden: ${order.orderNumber}
Fecha: ${new Date().toLocaleString()}
----------------------------------------
Cliente: ${customer.name}
Tel: ${customer.phone}
----------------------------------------
${cart.map(item => 
  `${item.productName}${item.variantName ? ` (${item.variantName})` : ''} x${item.quantity}  TT$${item.totalPrice.toFixed(2)}`
).join('\n')}
----------------------------------------
Subtotal:        TT$${subtotal.toFixed(2)}
Descuento:       TT$${discountAmount.toFixed(2)}
VAT (12.5%):      TT$${tax.toFixed(2)}
----------------------------------------
TOTAL:           TT$${total.toFixed(2)}
========================================
      ¡Gracias por su compra!
========================================
    `;
    
    // In production, send to printer
    console.log('Receipt:', receiptContent);
    
    // For now, show in a toast
    navigator.clipboard?.writeText(receiptContent);
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(products.map(p => p.category))];

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4">
      {/* Products Panel */}
      <div className="flex-1 flex flex-col">
        {/* Search & Categories */}
        <div className="p-4 border-b border-[var(--glass-border)] bg-[var(--glass)]">
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar producto o SKU..."
                className="pl-10"
              />
            </div>
          </div>
          <ScrollArea className="whitespace-nowrap">
            <div className="flex gap-2 pb-2">
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className={selectedCategory === cat ? 'bg-[#F97316] text-white' : ''}
                >
                  {cat === 'all' ? 'Todos' : cat}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Products Grid */}
        <ScrollArea className="flex-1 p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="p-3 rounded-xl bg-[var(--glass)] border border-[var(--glass-border)] hover:border-[#F97316] transition-all text-left"
              >
                <div className="aspect-square rounded-lg bg-[var(--obsidian)] mb-2 overflow-hidden">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-[var(--text-dim)]" />
                    </div>
                  )}
                </div>
                <p className="font-medium text-[var(--text-primary)] text-sm truncate">{product.name}</p>
                <p className="text-xs text-[var(--text-dim)]">{product.sku}</p>
                <p className="text-[#F97316] font-bold mt-1">TT${product.basePrice.toFixed(2)}</p>
                {product.stockQuantity !== undefined && product.stockQuantity <= 5 && (
                  <Badge variant="destructive" className="mt-1 text-xs">
                    Stock: {product.stockQuantity}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Cart Panel */}
      <div className="w-80 flex flex-col bg-[var(--glass)] border-l border-[var(--glass-border)]">
        {/* Header */}
        <div className="p-4 border-b border-[var(--glass-border)]">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[var(--text-primary)]">Carrito</h3>
            <Badge variant="secondary">{cart.length} items</Badge>
          </div>
          {!isOnline && (
            <div className="mt-2 p-2 rounded bg-yellow-500/10 text-yellow-500 text-xs flex items-center gap-2">
              <Clock className="w-3 h-3" />
              Modo Offline - Se sincronizará después
            </div>
          )}
        </div>

        {/* Cart Items */}
        <ScrollArea className="flex-1 p-4">
          {cart.length === 0 ? (
            <div className="text-center py-8 text-[var(--text-dim)]">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Carrito vacío</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.id} className="p-3 rounded-lg bg-[var(--obsidian)] border border-[var(--glass-border)]">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-[var(--text-primary)] text-sm">{item.productName}</p>
                      {item.variantName && (
                        <p className="text-xs text-[var(--text-dim)]">{item.variantName}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-[var(--text-dim)] hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <span className="font-bold text-[#F97316]">TT${item.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Customer & Payment */}
        <div className="p-4 border-t border-[var(--glass-border)] space-y-3">
          {/* Customer */}
          <div className="space-y-2">
            <Input
              placeholder="Nombre del cliente"
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
            />
            <Input
              placeholder="Teléfono"
              value={customer.phone}
              onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
            />
          </div>

          {/* Payment Method */}
          <div className="flex gap-2">
            {(['cash', 'card', 'transfer'] as const).map(method => (
              <Button
                key={method}
                variant={paymentMethod === method ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPaymentMethod(method)}
                className={paymentMethod === method ? 'bg-[#F97316] text-white' : 'flex-1'}
              >
                {method === 'cash' && <Banknote className="w-4 h-4 mr-1" />}
                {method === 'card' && <CreditCard className="w-4 h-4 mr-1" />}
                {method === 'transfer' && <Receipt className="w-4 h-4 mr-1" />}
                {method === 'cash' ? 'Efectivo' : method === 'card' ? 'Tarjeta' : 'Transfer'}
              </Button>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-[var(--text-dim)]">
              <span>Subtotal:</span>
              <span>TT${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[var(--text-dim)]">
              <span>VAT (12.5%):</span>
              <span>TT${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-[var(--glass-border)]">
              <span className="text-[var(--text-primary)]">TOTAL:</span>
              <span className="text-[#F97316]">TT${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Process Button */}
          <Button
            onClick={processOrder}
            disabled={cart.length === 0 || isProcessing}
            className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white py-6 text-lg"
          >
            {isProcessing ? (
              <>
                <Clock className="w-5 h-5 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5 mr-2" />
                Cobrar TT${total.toFixed(2)}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
