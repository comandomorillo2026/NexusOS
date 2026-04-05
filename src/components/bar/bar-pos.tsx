'use client';

import React, { useState, useEffect } from 'react';
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
  Beer,
  Wine,
  GlassWater,
  Coffee
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from '@/contexts/theme-context';

// ============================================
// TRANSLATIONS
// ============================================
const translations = {
  en: {
    searchPlaceholder: "Search drink or SKU...",
    all: "All",
    beer: "Beer",
    wine: "Wine",
    spirits: "Spirits",
    cocktails: "Cocktails",
    softDrinks: "Soft Drinks",
    cart: "Cart",
    items: "items",
    emptyCart: "Empty cart",
    offlineMode: "Offline Mode - Will sync later",
    customerName: "Customer name",
    phone: "Phone",
    cash: "Cash",
    card: "Card",
    transfer: "Transfer",
    subtotal: "Subtotal:",
    tax: "Tax (10%):",
    total: "TOTAL:",
    charge: "Charge",
    processing: "Processing...",
    addedToCart: "added to cart",
    emptyCartError: "Cart is empty",
    customerRequired: "Customer data required",
    orderComplete: "Order completed!",
    orderSavedOffline: "Order saved. Will sync when connected.",
    stock: "Stock",
  },
  es: {
    searchPlaceholder: "Buscar bebida o SKU...",
    all: "Todos",
    beer: "Cerveza",
    wine: "Vino",
    spirits: "Licores",
    cocktails: "Cocteles",
    softDrinks: "Refrescos",
    cart: "Carrito",
    items: "items",
    emptyCart: "Carrito vacio",
    offlineMode: "Modo Offline - Se sincronizara despues",
    customerName: "Nombre del cliente",
    phone: "Telefono",
    cash: "Efectivo",
    card: "Tarjeta",
    transfer: "Transfer",
    subtotal: "Subtotal:",
    tax: "ITBIS (10%):",
    total: "TOTAL:",
    charge: "Cobrar",
    processing: "Procesando...",
    addedToCart: "agregado al carrito",
    emptyCartError: "Carrito vacio",
    customerRequired: "Datos del cliente requeridos",
    orderComplete: "Orden completada!",
    orderSavedOffline: "Orden guardada. Se sincronizara cuando haya conexion.",
    stock: "Stock",
  },
};

// ============================================
// INTERFACES
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

interface Beverage {
  id: string;
  sku: string;
  name: string;
  category: string;
  brand?: string;
  basePrice: number;
  imageUrl?: string;
  stockQuantity?: number;
  alcoholContent?: string;
  volume?: string;
}

interface Customer {
  id?: string;
  name: string;
  phone: string;
  email?: string;
}

// ============================================
// DEMO BEVERAGES DATA
// ============================================
const DEMO_BEVERAGES: Beverage[] = [
  // BEER
  { id: 'b1', sku: 'BER-001', name: 'Presidente', category: 'Beer', brand: 'Presidente', basePrice: 120, stockQuantity: 48, alcoholContent: '5%', volume: '12oz' },
  { id: 'b2', sku: 'BER-002', name: 'Presidente Light', category: 'Beer', brand: 'Presidente', basePrice: 100, stockQuantity: 36, alcoholContent: '4.2%', volume: '12oz' },
  { id: 'b3', sku: 'BER-003', name: 'Heineken', category: 'Beer', brand: 'Heineken', basePrice: 150, stockQuantity: 24, alcoholContent: '5%', volume: '12oz' },
  { id: 'b4', sku: 'BER-004', name: 'Corona Extra', category: 'Beer', brand: 'Corona', basePrice: 140, stockQuantity: 30, alcoholContent: '4.6%', volume: '12oz' },
  { id: 'b5', sku: 'BER-005', name: 'Budweiser', category: 'Beer', brand: 'Budweiser', basePrice: 110, stockQuantity: 42, alcoholContent: '5%', volume: '12oz' },
  { id: 'b6', sku: 'BER-006', name: 'Bohemia', category: 'Beer', brand: 'Bohemia', basePrice: 130, stockQuantity: 18, alcoholContent: '5.2%', volume: '12oz' },
  
  // WINE
  { id: 'w1', sku: 'VIN-001', name: 'Vino Tinto Reserva', category: 'Wine', brand: 'Casillero del Diablo', basePrice: 650, stockQuantity: 12, alcoholContent: '13.5%', volume: '750ml' },
  { id: 'w2', sku: 'VIN-002', name: 'Vino Blanco Chardonnay', category: 'Wine', brand: 'Concha y Toro', basePrice: 550, stockQuantity: 8, alcoholContent: '13%', volume: '750ml' },
  { id: 'w3', sku: 'VIN-003', name: 'Vino Rosado', category: 'Wine', brand: 'Barefoot', basePrice: 480, stockQuantity: 6, alcoholContent: '9%', volume: '750ml' },
  { id: 'w4', sku: 'VIN-004', name: 'Champagne Brut', category: 'Wine', brand: 'Moet', basePrice: 1800, stockQuantity: 4, alcoholContent: '12%', volume: '750ml' },
  { id: 'w5', sku: 'VIN-005', name: 'Vino Tinto Merlot', category: 'Wine', brand: 'Gato Negro', basePrice: 420, stockQuantity: 15, alcoholContent: '12.5%', volume: '750ml' },
  
  // SPIRITS
  { id: 's1', sku: 'SPI-001', name: 'Ron Brugal Extra Viejo', category: 'Spirits', brand: 'Brugal', basePrice: 950, stockQuantity: 10, alcoholContent: '38%', volume: '750ml' },
  { id: 's2', sku: 'SPI-002', name: 'Ron Bacardi Carta Blanca', category: 'Spirits', brand: 'Bacardi', basePrice: 650, stockQuantity: 8, alcoholContent: '40%', volume: '750ml' },
  { id: 's3', sku: 'SPI-003', name: 'Vodka Smirnoff', category: 'Spirits', brand: 'Smirnoff', basePrice: 720, stockQuantity: 12, alcoholContent: '40%', volume: '750ml' },
  { id: 's4', sku: 'SPI-004', name: 'Whisky Johnnie Walker Red', category: 'Spirits', brand: 'Johnnie Walker', basePrice: 1350, stockQuantity: 6, alcoholContent: '40%', volume: '750ml' },
  { id: 's5', sku: 'SPI-005', name: 'Tequila Jose Cuervo Gold', category: 'Spirits', brand: 'Jose Cuervo', basePrice: 890, stockQuantity: 7, alcoholContent: '38%', volume: '750ml' },
  { id: 's6', sku: 'SPI-006', name: 'Gin Tanqueray', category: 'Spirits', brand: 'Tanqueray', basePrice: 1150, stockQuantity: 5, alcoholContent: '47.3%', volume: '750ml' },
  
  // COCKTAILS
  { id: 'c1', sku: 'COK-001', name: 'Mojito Clasico', category: 'Cocktails', basePrice: 350, stockQuantity: null, alcoholContent: '~12%' },
  { id: 'c2', sku: 'COK-002', name: 'Pina Colada', category: 'Cocktails', basePrice: 380, stockQuantity: null, alcoholContent: '~15%' },
  { id: 'c3', sku: 'COK-003', name: 'Cuba Libre', category: 'Cocktails', basePrice: 320, stockQuantity: null, alcoholContent: '~10%' },
  { id: 'c4', sku: 'COK-004', name: 'Daiquiri de Fresa', category: 'Cocktails', basePrice: 360, stockQuantity: null, alcoholContent: '~14%' },
  { id: 'c5', sku: 'COK-005', name: 'Margarita', category: 'Cocktails', basePrice: 390, stockQuantity: null, alcoholContent: '~18%' },
  { id: 'c6', sku: 'COK-006', name: 'Sangria', category: 'Cocktails', basePrice: 280, stockQuantity: null, alcoholContent: '~10%' },
  { id: 'c7', sku: 'COK-007', name: 'Sex on the Beach', category: 'Cocktails', basePrice: 420, stockQuantity: null, alcoholContent: '~16%' },
  { id: 'c8', sku: 'COK-008', name: 'Tequila Sunrise', category: 'Cocktails', basePrice: 380, stockQuantity: null, alcoholContent: '~14%' },
  
  // SOFT DRINKS
  { id: 'sd1', sku: 'SFT-001', name: 'Coca Cola', category: 'Soft Drinks', brand: 'Coca Cola', basePrice: 60, stockQuantity: 60, volume: '12oz' },
  { id: 'sd2', sku: 'SFT-002', name: 'Sprite', category: 'Soft Drinks', brand: 'Sprite', basePrice: 60, stockQuantity: 48, volume: '12oz' },
  { id: 'sd3', sku: 'SFT-003', name: 'Jugo de Naranja Natural', category: 'Soft Drinks', basePrice: 120, stockQuantity: 20, volume: '12oz' },
  { id: 'sd4', sku: 'SFT-004', name: 'Agua Mineral', category: 'Soft Drinks', brand: 'Dasani', basePrice: 50, stockQuantity: 72, volume: '16oz' },
  { id: 'sd5', sku: 'SFT-005', name: 'Limonada', category: 'Soft Drinks', basePrice: 90, stockQuantity: 30, volume: '12oz' },
  { id: 'sd6', sku: 'SFT-006', name: 'Cafe Americano', category: 'Soft Drinks', basePrice: 150, stockQuantity: null, volume: '8oz' },
];

const CATEGORIES = [
  { id: 'all', label: 'all', icon: Package },
  { id: 'Beer', label: 'beer', icon: Beer },
  { id: 'Wine', label: 'wine', icon: Wine },
  { id: 'Spirits', label: 'spirits', icon: GlassWater },
  { id: 'Cocktails', label: 'cocktails', icon: GlassWater },
  { id: 'Soft Drinks', label: 'softDrinks', icon: Coffee },
];

// ============================================
// MAIN COMPONENT
// ============================================
interface BarPOSProps {
  tenantId: string;
  onOrderComplete?: (order: unknown) => void;
}

export function BarPOS({ tenantId, onOrderComplete }: BarPOSProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [beverages, setBeverages] = useState<Beverage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customer, setCustomer] = useState<Customer>({ name: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  
  const { language } = useTheme();
  const t = translations[language];

  // Load beverages
  useEffect(() => {
    setBeverages(DEMO_BEVERAGES);
  }, [tenantId]);

  // Cart operations
  const addToCart = (beverage: Beverage) => {
    const existingItem = cart.find(item => item.productId === beverage.id);

    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === beverage.id
          ? { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * item.unitPrice }
          : item
      ));
    } else {
      setCart([...cart, {
        id: `cart_${Date.now()}`,
        productId: beverage.id,
        productName: beverage.name,
        quantity: 1,
        unitPrice: beverage.basePrice,
        totalPrice: beverage.basePrice
      }]);
    }
    
    toast.success(`${beverage.name} ${t.addedToCart}`);
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
  const tax = (subtotal - discountAmount) * 0.10; // 10% tax
  const total = subtotal - discountAmount + tax;

  // Process order
  const processOrder = async () => {
    if (cart.length === 0) {
      toast.error(t.emptyCartError);
      return;
    }

    if (!customer.name || !customer.phone) {
      toast.error(t.customerRequired);
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
      currency: 'DOP'
    };

    try {
      if (isOnline) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast.success(t.orderComplete);
        onOrderComplete?.(orderData);
      } else {
        toast.info(t.orderSavedOffline);
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

  // Filter beverages
  const filteredBeverages = beverages.filter(beverage => {
    const matchesSearch = beverage.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          beverage.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (beverage.brand?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || beverage.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Beer': return <Beer className="h-4 w-4" />;
      case 'Wine': return <Wine className="h-4 w-4" />;
      case 'Spirits': return <GlassWater className="h-4 w-4" />;
      case 'Cocktails': return <GlassWater className="h-4 w-4" />;
      default: return <Coffee className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return `RD$${amount.toLocaleString("es-DO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-4">
      {/* Products Panel */}
      <div className="flex-1 flex flex-col">
        {/* Search & Categories */}
        <div className="p-4 border-b border-border bg-card">
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="pl-10"
              />
            </div>
          </div>
          <ScrollArea className="whitespace-nowrap">
            <div className="flex gap-2 pb-2">
              {CATEGORIES.map(cat => {
                const IconComponent = cat.icon;
                return (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={selectedCategory === cat.id ? 'bg-[#8B5CF6] text-white hover:bg-[#7C3AED]' : ''}
                  >
                    <IconComponent className="h-4 w-4 mr-1" />
                    {t[cat.label as keyof typeof t] || cat.label}
                  </Button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Products Grid */}
        <ScrollArea className="flex-1 p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredBeverages.map(beverage => (
              <Card
                key={beverage.id}
                className="cursor-pointer hover:shadow-lg hover:border-[#8B5CF6] transition-all"
                onClick={() => addToCart(beverage)}
              >
                <CardContent className="p-3">
                  <div className="aspect-square rounded-lg bg-muted mb-2 flex items-center justify-center">
                    <div className="text-[#8B5CF6]">
                      {getCategoryIcon(beverage.category)}
                    </div>
                  </div>
                  <p className="font-medium text-sm truncate">{beverage.name}</p>
                  {beverage.brand && (
                    <p className="text-xs text-muted-foreground truncate">{beverage.brand}</p>
                  )}
                  <p className="text-[#8B5CF6] font-bold mt-1">{formatCurrency(beverage.basePrice)}</p>
                  {beverage.stockQuantity !== null && beverage.stockQuantity !== undefined && beverage.stockQuantity <= 10 && (
                    <Badge variant="destructive" className="mt-1 text-xs">
                      {t.stock}: {beverage.stockQuantity}
                    </Badge>
                  )}
                  {beverage.alcoholContent && (
                    <p className="text-xs text-muted-foreground mt-1">{beverage.alcoholContent}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Cart Panel */}
      <div className="w-80 flex flex-col bg-card border-l border-border">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">{t.cart}</h3>
            <Badge variant="secondary">{cart.length} {t.items}</Badge>
          </div>
          {!isOnline && (
            <div className="mt-2 p-2 rounded bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-xs flex items-center gap-2">
              <Clock className="w-3 h-3" />
              {t.offlineMode}
            </div>
          )}
        </div>

        {/* Cart Items */}
        <ScrollArea className="flex-1 p-4">
          {cart.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>{t.emptyCart}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.id} className="p-3 rounded-lg bg-muted border border-border">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-sm">{item.productName}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-muted-foreground hover:text-red-500"
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
                    <span className="font-bold text-[#8B5CF6]">{formatCurrency(item.totalPrice)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Customer & Payment */}
        <div className="p-4 border-t border-border space-y-3">
          {/* Customer */}
          <div className="space-y-2">
            <Input
              placeholder={t.customerName}
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
            />
            <Input
              placeholder={t.phone}
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
                className={paymentMethod === method ? 'bg-[#8B5CF6] text-white flex-1' : 'flex-1'}
              >
                {method === 'cash' && <Banknote className="w-4 h-4 mr-1" />}
                {method === 'card' && <CreditCard className="w-4 h-4 mr-1" />}
                {method === 'transfer' && <Receipt className="w-4 h-4 mr-1" />}
                {t[method]}
              </Button>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>{t.subtotal}</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>{t.tax}</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
              <span>{t.total}</span>
              <span className="text-[#8B5CF6]">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Process Button */}
          <Button
            onClick={processOrder}
            disabled={cart.length === 0 || isProcessing}
            className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white py-6 text-lg"
          >
            {isProcessing ? (
              <>
                <Clock className="w-5 h-5 mr-2 animate-spin" />
                {t.processing}
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5 mr-2" />
                {t.charge} {formatCurrency(total)}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
