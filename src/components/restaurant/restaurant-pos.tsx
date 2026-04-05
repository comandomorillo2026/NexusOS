'use client';

import React, { useState, useCallback } from 'react';
import { useTheme } from '@/contexts/theme-context';
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
  LayoutGrid,
  SplitSquareHorizontal,
  X,
  Check,
  UtensilsCrossed,
  Wine,
  Cake,
  Salad,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

// ============================================
// TRANSLATIONS
// ============================================
const translations = {
  en: {
    pos: 'Point of Sale',
    search: 'Search menu items...',
    cart: 'Cart',
    items: 'items',
    emptyCart: 'Empty cart',
    addToCart: 'Tap to add',
    customerName: 'Customer Name',
    tableNumber: 'Table',
    selectTable: 'Select Table',
    paymentMethod: 'Payment Method',
    cash: 'Cash',
    card: 'Card',
    transfer: 'Transfer',
    subtotal: 'Subtotal',
    tax: 'VAT (12.5%)',
    discount: 'Discount',
    total: 'TOTAL',
    charge: 'Charge',
    processing: 'Processing...',
    orderComplete: 'Order Complete!',
    splitBill: 'Split Bill',
    splitOptions: 'Split Options',
    equalSplit: 'Equal Split',
    customSplit: 'Custom Split',
    byItem: 'By Item',
    numberOfPeople: 'Number of People',
    perPerson: 'Per Person',
    cancel: 'Cancel',
    confirm: 'Confirm',
    receipt: 'Receipt',
    newOrder: 'New Order',
    appetizers: 'Appetizers',
    mainCourse: 'Main Course',
    desserts: 'Desserts',
    drinks: 'Drinks',
    notes: 'Notes',
    addNote: 'Add note...',
  },
  es: {
    pos: 'Punto de Venta',
    search: 'Buscar en el menú...',
    cart: 'Carrito',
    items: 'artículos',
    emptyCart: 'Carrito vacío',
    addToCart: 'Toca para agregar',
    customerName: 'Nombre del Cliente',
    tableNumber: 'Mesa',
    selectTable: 'Seleccionar Mesa',
    paymentMethod: 'Método de Pago',
    cash: 'Efectivo',
    card: 'Tarjeta',
    transfer: 'Transferencia',
    subtotal: 'Subtotal',
    tax: 'IVA (12.5%)',
    discount: 'Descuento',
    total: 'TOTAL',
    charge: 'Cobrar',
    processing: 'Procesando...',
    orderComplete: '¡Orden Completada!',
    splitBill: 'Dividir Cuenta',
    splitOptions: 'Opciones de División',
    equalSplit: 'División Igual',
    customSplit: 'División Personalizada',
    byItem: 'Por Artículo',
    numberOfPeople: 'Número de Personas',
    perPerson: 'Por Persona',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    receipt: 'Recibo',
    newOrder: 'Nueva Orden',
    appetizers: 'Entradas',
    mainCourse: 'Plato Principal',
    desserts: 'Postres',
    drinks: 'Bebidas',
    notes: 'Notas',
    addNote: 'Agregar nota...',
  },
};

// ============================================
// INTERFACES
// ============================================
interface MenuItem {
  id: string;
  name: string;
  category: 'appetizers' | 'mainCourse' | 'desserts' | 'drinks';
  price: number;
  description: string;
  available: boolean;
  imageUrl?: string;
}

interface CartItem extends MenuItem {
  quantity: number;
  notes?: string;
}

// ============================================
// DEMO DATA
// ============================================
const demoMenuItems: MenuItem[] = [
  // Appetizers
  { id: '1', name: 'Tacos al Pastor', category: 'appetizers', price: 35.00, description: '3 tacos with marinated pork', available: true },
  { id: '2', name: 'Nachos Supreme', category: 'appetizers', price: 45.00, description: 'Loaded with cheese, guacamole, salsa', available: true },
  { id: '3', name: 'Chicken Wings', category: 'appetizers', price: 55.00, description: 'Buffalo or BBQ style', available: true },
  { id: '4', name: 'Quesadillas', category: 'appetizers', price: 42.00, description: 'Cheese, chicken or beef', available: true },
  { id: '5', name: 'Ceviche', category: 'appetizers', price: 48.00, description: 'Fresh fish marinated in lime', available: false },
  // Main Course
  { id: '6', name: 'Hamburguesa Especial', category: 'mainCourse', price: 65.00, description: 'Angus beef, bacon, special sauce', available: true },
  { id: '7', name: 'Pasta Carbonara', category: 'mainCourse', price: 55.00, description: 'Creamy bacon pasta', available: true },
  { id: '8', name: 'Grilled Salmon', category: 'mainCourse', price: 85.00, description: 'With seasonal vegetables', available: true },
  { id: '9', name: 'Ribeye Steak', category: 'mainCourse', price: 120.00, description: '12oz prime cut', available: true },
  { id: '10', name: 'Chicken Parmesan', category: 'mainCourse', price: 58.00, description: 'Breaded chicken with marinara', available: true },
  { id: '11', name: 'Seafood Paella', category: 'mainCourse', price: 95.00, description: 'Traditional Spanish rice dish', available: true },
  // Desserts
  { id: '12', name: 'Tiramisú', category: 'desserts', price: 32.00, description: 'Classic Italian dessert', available: true },
  { id: '13', name: 'Chocolate Lava Cake', category: 'desserts', price: 35.00, description: 'With vanilla ice cream', available: true },
  { id: '14', name: 'Cheesecake', category: 'desserts', price: 28.00, description: 'New York style', available: true },
  { id: '15', name: 'Flan', category: 'desserts', price: 25.00, description: 'Traditional caramel custard', available: true },
  // Drinks
  { id: '16', name: 'Mojito Clásico', category: 'drinks', price: 28.00, description: 'White rum, mint, lime', available: true },
  { id: '17', name: 'Piña Colada', category: 'drinks', price: 30.00, description: 'Rum, pineapple, coconut', available: true },
  { id: '18', name: 'Cerveza Nacional', category: 'drinks', price: 18.00, description: 'Local beer', available: true },
  { id: '19', name: 'Limonada', category: 'drinks', price: 15.00, description: 'Fresh limeade', available: true },
  { id: '20', name: 'Café Expresso', category: 'drinks', price: 12.00, description: 'Double shot', available: true },
  { id: '21', name: 'Sangría', category: 'drinks', price: 25.00, description: 'Red wine punch', available: true },
];

const tables = Array.from({ length: 20 }, (_, i) => ({
  id: `table-${i + 1}`,
  number: i + 1,
  capacity: i < 10 ? 4 : 6,
  status: i < 12 ? 'occupied' : 'available',
}));

// ============================================
// MAIN POS COMPONENT
// ============================================
export function RestaurantPOS() {
  const { language } = useTheme();
  const t = translations[language];

  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSplitDialog, setShowSplitDialog] = useState(false);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [splitType, setSplitType] = useState<'equal' | 'custom' | 'items'>('equal');
  const [splitPeople, setSplitPeople] = useState(2);

  // Categories with icons
  const categories = [
    { id: 'all', label: language === 'en' ? 'All' : 'Todos', icon: LayoutGrid },
    { id: 'appetizers', label: t.appetizers, icon: Salad },
    { id: 'mainCourse', label: t.mainCourse, icon: UtensilsCrossed },
    { id: 'desserts', label: t.desserts, icon: Cake },
    { id: 'drinks', label: t.drinks, icon: Wine },
  ];

  // Cart operations
  const addToCart = useCallback((item: MenuItem) => {
    if (!item.available) {
      toast.error(language === 'en' ? 'Item not available' : 'Artículo no disponible');
      return;
    }

    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    toast.success(`${item.name} ${language === 'en' ? 'added' : 'agregado'}`);
  }, [language]);

  const removeFromCart = useCallback((itemId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          const newQuantity = item.quantity + delta;
          return newQuantity <= 0 ? null : { ...item, quantity: newQuantity };
        })
        .filter(Boolean) as CartItem[]
    );
  }, []);

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.125;
  const total = subtotal + tax - discount;

  // Process order
  const processOrder = async () => {
    if (cart.length === 0) {
      toast.error(language === 'en' ? 'Cart is empty' : 'Carrito vacío');
      return;
    }

    if (!selectedTable) {
      toast.error(language === 'en' ? 'Please select a table' : 'Por favor seleccione una mesa');
      return;
    }

    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setShowReceiptDialog(true);
    toast.success(t.orderComplete);
  };

  // Split bill calculation
  const splitAmount = total / splitPeople;

  // Filter menu items
  const filteredItems = demoMenuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Format currency
  const formatCurrency = (amount: number) =>
    `TT$${amount.toLocaleString('en-TT', { minimumFractionDigits: 2 })}`;

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Menu Panel */}
      <div className="flex-1 flex flex-col">
        {/* Search & Categories */}
        <div className="p-4 border-b bg-card">
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.search}
                className="pl-10"
              />
            </div>
          </div>
          <ScrollArea className="whitespace-nowrap">
            <div className="flex gap-2 pb-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={selectedCategory === cat.id ? 'bg-[#EF4444] hover:bg-red-600 text-white' : ''}
                  >
                    <Icon className="h-4 w-4 mr-1" />
                    {cat.label}
                  </Button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Menu Items Grid */}
        <ScrollArea className="flex-1 p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                disabled={!item.available}
                className={`p-3 rounded-xl border transition-all text-left ${
                  item.available
                    ? 'hover:border-[#EF4444] hover:shadow-md'
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="aspect-square rounded-lg bg-muted mb-2 flex items-center justify-center">
                  {item.category === 'appetizers' && <Salad className="w-8 h-8 text-muted-foreground" />}
                  {item.category === 'mainCourse' && <UtensilsCrossed className="w-8 h-8 text-muted-foreground" />}
                  {item.category === 'desserts' && <Cake className="w-8 h-8 text-muted-foreground" />}
                  {item.category === 'drinks' && <Wine className="w-8 h-8 text-muted-foreground" />}
                </div>
                <p className="font-medium text-sm truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                <p className="text-[#EF4444] font-bold mt-1">{formatCurrency(item.price)}</p>
                {!item.available && (
                  <Badge variant="destructive" className="mt-1 text-xs">
                    {language === 'en' ? 'Unavailable' : 'No disponible'}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Cart Panel */}
      <div className="w-96 flex flex-col bg-card border-l">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">{t.cart}</h3>
            <Badge variant="secondary">{cart.length} {t.items}</Badge>
          </div>
        </div>

        {/* Table Selection */}
        <div className="p-4 border-b">
          <label className="text-sm font-medium mb-2 block">{t.selectTable}</label>
          <ScrollArea className="whitespace-nowrap">
            <div className="flex gap-2 pb-2">
              {tables.slice(0, 10).map((table) => (
                <Button
                  key={table.id}
                  variant={selectedTable === table.number ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTable(table.number)}
                  className={selectedTable === table.number ? 'bg-[#EF4444] hover:bg-red-600' : ''}
                >
                  {table.number}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Cart Items */}
        <ScrollArea className="flex-1 p-4">
          {cart.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>{t.emptyCart}</p>
              <p className="text-sm">{t.addToCart}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="p-3 rounded-lg border">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(item.price)}</p>
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
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <span className="font-bold text-[#EF4444]">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Payment Section */}
        <div className="p-4 border-t space-y-3">
          {/* Payment Method */}
          <div className="flex gap-2">
            {(['cash', 'card', 'transfer'] as const).map((method) => (
              <Button
                key={method}
                variant={paymentMethod === method ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPaymentMethod(method)}
                className={`flex-1 ${paymentMethod === method ? 'bg-[#EF4444] hover:bg-red-600' : ''}`}
              >
                {method === 'cash' && <Banknote className="w-4 h-4 mr-1" />}
                {method === 'card' && <CreditCard className="w-4 h-4 mr-1" />}
                {method === 'transfer' && <Receipt className="w-4 h-4 mr-1" />}
                {method === 'cash' ? t.cash : method === 'card' ? t.card : t.transfer}
              </Button>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>{t.subtotal}:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>{t.tax}:</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-500">
                <span>{t.discount}:</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-lg">
              <span>{t.total}:</span>
              <span className="text-[#EF4444]">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Split Bill Button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setShowSplitDialog(true)}
          >
            <SplitSquareHorizontal className="w-4 h-4 mr-2" />
            {t.splitBill}
          </Button>

          {/* Process Button */}
          <Button
            onClick={processOrder}
            disabled={cart.length === 0 || isProcessing || !selectedTable}
            className="w-full bg-[#EF4444] hover:bg-red-600 text-white py-6 text-lg"
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

      {/* Split Bill Dialog */}
      <Dialog open={showSplitDialog} onOpenChange={setShowSplitDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <SplitSquareHorizontal className="w-5 h-5 text-[#EF4444]" />
              {t.splitBill}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={splitType === 'equal' ? 'default' : 'outline'}
                onClick={() => setSplitType('equal')}
                className={`flex-1 ${splitType === 'equal' ? 'bg-[#EF4444] hover:bg-red-600' : ''}`}
              >
                {t.equalSplit}
              </Button>
              <Button
                variant={splitType === 'custom' ? 'default' : 'outline'}
                onClick={() => setSplitType('custom')}
                className={`flex-1 ${splitType === 'custom' ? 'bg-[#EF4444] hover:bg-red-600' : ''}`}
              >
                {t.customSplit}
              </Button>
              <Button
                variant={splitType === 'items' ? 'default' : 'outline'}
                onClick={() => setSplitType('items')}
                className={`flex-1 ${splitType === 'items' ? 'bg-[#EF4444] hover:bg-red-600' : ''}`}
              >
                {t.byItem}
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t.numberOfPeople}</label>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSplitPeople(Math.max(2, splitPeople - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-2xl font-bold w-8 text-center">{splitPeople}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSplitPeople(splitPeople + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Card className="bg-muted">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{t.perPerson}:</p>
                <p className="text-2xl font-bold text-[#EF4444]">{formatCurrency(splitAmount)}</p>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSplitDialog(false)}>
              {t.cancel}
            </Button>
            <Button className="bg-[#EF4444] hover:bg-red-600" onClick={() => setShowSplitDialog(false)}>
              {t.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#EF4444]" />
              {t.receipt}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center border-b pb-4">
              <h3 className="font-bold text-lg">AETHEL Restaurant</h3>
              <p className="text-sm text-muted-foreground">Mesa #{selectedTable}</p>
              <p className="text-sm text-muted-foreground">{new Date().toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.quantity}x {item.name}
                  </span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <Separator />
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>{t.subtotal}</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t.tax}</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2">
                <span>{t.total}</span>
                <span className="text-[#EF4444]">{formatCurrency(total)}</span>
              </div>
            </div>
            <div className="text-center text-sm text-muted-foreground pt-4 border-t">
              <p>¡Gracias por su visita!</p>
              <p>Thank you for your visit!</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              className="w-full bg-[#EF4444] hover:bg-red-600"
              onClick={() => {
                setShowReceiptDialog(false);
                setCart([]);
                setSelectedTable(null);
                setCustomerName('');
              }}
            >
              {t.newOrder}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
