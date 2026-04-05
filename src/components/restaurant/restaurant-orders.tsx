'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/contexts/theme-context';
import { toast } from 'sonner';
import {
  Clock,
  ChefHat,
  CheckCircle2,
  XCircle,
  Timer,
  RefreshCw,
  Bell,
  LayoutGrid,
  Filter,
  Volume2,
  Utensils,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

// ============================================
// TRANSLATIONS
// ============================================
const translations = {
  en: {
    kitchenOrders: 'Kitchen Orders',
    pending: 'Pending',
    preparing: 'Preparing',
    ready: 'Ready',
    served: 'Served',
    allOrders: 'All Orders',
    orderNumber: 'Order',
    table: 'Table',
    items: 'items',
    time: 'Time',
    minutes: 'min',
    seconds: 'sec',
    markPreparing: 'Start Preparing',
    markReady: 'Mark Ready',
    markServed: 'Mark Served',
    cancelOrder: 'Cancel',
    noOrders: 'No orders in this category',
    refresh: 'Refresh',
    soundAlert: 'Sound Alert',
    avgTime: 'Avg Time',
    queueStatus: 'Queue Status',
    urgent: 'Urgent',
    normal: 'Normal',
    priority: 'Priority',
    viewDetails: 'View Details',
    notes: 'Notes',
    noNotes: 'No special notes',
    itemQty: 'x',
  },
  es: {
    kitchenOrders: 'Pedidos de Cocina',
    pending: 'Pendiente',
    preparing: 'Preparando',
    ready: 'Listo',
    served: 'Servido',
    allOrders: 'Todos los Pedidos',
    orderNumber: 'Orden',
    table: 'Mesa',
    items: 'artículos',
    time: 'Tiempo',
    minutes: 'min',
    seconds: 'seg',
    markPreparing: 'Comenzar a Preparar',
    markReady: 'Marcar Listo',
    markServed: 'Marcar Servido',
    cancelOrder: 'Cancelar',
    noOrders: 'No hay pedidos en esta categoría',
    refresh: 'Actualizar',
    soundAlert: 'Alerta de Sonido',
    avgTime: 'Tiempo Promedio',
    queueStatus: 'Estado de Cola',
    urgent: 'Urgente',
    normal: 'Normal',
    priority: 'Prioridad',
    viewDetails: 'Ver Detalles',
    notes: 'Notas',
    noNotes: 'Sin notas especiales',
    itemQty: 'x',
  },
};

// ============================================
// INTERFACES
// ============================================
interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
}

interface KitchenOrder {
  id: string;
  orderNumber: string;
  tableNumber: number;
  items: OrderItem[];
  status: 'pending' | 'preparing' | 'ready' | 'served';
  createdAt: Date;
  priority: 'normal' | 'urgent';
  notes?: string;
}

// ============================================
// DEMO DATA
// ============================================
const generateDemoOrders = (): KitchenOrder[] => [
  {
    id: '1',
    orderNumber: 'ORD-045',
    tableNumber: 5,
    items: [
      { id: 'i1', name: 'Hamburguesa Especial', quantity: 2, notes: 'Sin cebolla' },
      { id: 'i2', name: 'Papas Fritas', quantity: 2 },
      { id: 'i3', name: 'Coca Cola', quantity: 2 },
    ],
    status: 'pending',
    createdAt: new Date(Date.now() - 3 * 60 * 1000),
    priority: 'normal',
  },
  {
    id: '2',
    orderNumber: 'ORD-044',
    tableNumber: 12,
    items: [
      { id: 'i4', name: 'Pasta Carbonara', quantity: 3 },
      { id: 'i5', name: 'Ensalada César', quantity: 2 },
      { id: 'i6', name: 'Vino Tinto', quantity: 1 },
    ],
    status: 'preparing',
    createdAt: new Date(Date.now() - 12 * 60 * 1000),
    priority: 'normal',
    notes: 'Cliente alérgico al mariscos',
  },
  {
    id: '3',
    orderNumber: 'ORD-043',
    tableNumber: 8,
    items: [
      { id: 'i7', name: 'Ribeye Steak', quantity: 1, notes: 'Término medio' },
      { id: 'i8', name: 'Grilled Salmon', quantity: 1 },
      { id: 'i9', name: 'Mojito', quantity: 2 },
    ],
    status: 'ready',
    createdAt: new Date(Date.now() - 18 * 60 * 1000),
    priority: 'urgent',
  },
  {
    id: '4',
    orderNumber: 'ORD-042',
    tableNumber: 3,
    items: [
      { id: 'i10', name: 'Tacos al Pastor', quantity: 6 },
      { id: 'i11', name: 'Nachos Supreme', quantity: 1 },
      { id: 'i12', name: 'Cerveza', quantity: 3 },
    ],
    status: 'preparing',
    createdAt: new Date(Date.now() - 8 * 60 * 1000),
    priority: 'normal',
  },
  {
    id: '5',
    orderNumber: 'ORD-041',
    tableNumber: 15,
    items: [
      { id: 'i13', name: 'Seafood Paella', quantity: 2 },
      { id: 'i14', name: 'Sangría', quantity: 1 },
    ],
    status: 'pending',
    createdAt: new Date(Date.now() - 1 * 60 * 1000),
    priority: 'urgent',
    notes: 'Aniversario - decorar plato',
  },
  {
    id: '6',
    orderNumber: 'ORD-040',
    tableNumber: 7,
    items: [
      { id: 'i15', name: 'Chicken Wings', quantity: 2 },
      { id: 'i16', name: 'Pizza Pepperoni', quantity: 1 },
    ],
    status: 'served',
    createdAt: new Date(Date.now() - 35 * 60 * 1000),
    priority: 'normal',
  },
  {
    id: '7',
    orderNumber: 'ORD-039',
    tableNumber: 2,
    items: [
      { id: 'i17', name: 'Tiramisú', quantity: 2 },
      { id: 'i18', name: 'Café Expresso', quantity: 2 },
    ],
    status: 'ready',
    createdAt: new Date(Date.now() - 25 * 60 * 1000),
    priority: 'normal',
  },
];

// ============================================
// ORDER CARD COMPONENT
// ============================================
interface OrderCardProps {
  order: KitchenOrder;
  t: typeof translations.en;
  onStatusChange: (orderId: string, newStatus: KitchenOrder['status']) => void;
  elapsedMinutes: number;
}

function OrderCard({ order, t, onStatusChange, elapsedMinutes }: OrderCardProps) {
  const statusConfig = {
    pending: {
      color: 'border-yellow-500',
      bg: 'bg-yellow-50 dark:bg-yellow-950/20',
      badge: 'bg-yellow-500',
      icon: Clock,
    },
    preparing: {
      color: 'border-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-950/20',
      badge: 'bg-blue-500',
      icon: ChefHat,
    },
    ready: {
      color: 'border-green-500',
      bg: 'bg-green-50 dark:bg-green-950/20',
      badge: 'bg-green-500',
      icon: CheckCircle2,
    },
    served: {
      color: 'border-gray-400',
      bg: 'bg-gray-50 dark:bg-gray-950/20',
      badge: 'bg-gray-400',
      icon: CheckCircle2,
    },
  };

  const config = statusConfig[order.status];
  const StatusIcon = config.icon;
  const isUrgent = elapsedMinutes > 15 && order.status !== 'ready' && order.status !== 'served';

  return (
    <Card className={`${config.color} border-l-4 ${isUrgent ? 'ring-2 ring-red-500 ring-opacity-50' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full ${config.badge} flex items-center justify-center text-white`}>
              <StatusIcon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {t.table} {order.tableNumber}
              </p>
            </div>
          </div>
          <div className="text-right">
            <Badge variant={isUrgent ? 'destructive' : 'outline'} className="mb-1">
              <Timer className="h-3 w-3 mr-1" />
              {elapsedMinutes} {t.minutes}
            </Badge>
            {order.priority === 'urgent' && (
              <Badge variant="destructive" className="ml-1">
                {t.urgent}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Items */}
        <div className="space-y-1">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.quantity} {t.itemQty} {item.name}
              </span>
              {item.notes && (
                <span className="text-muted-foreground text-xs italic">({item.notes})</span>
              )}
            </div>
          ))}
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="p-2 bg-yellow-50 dark:bg-yellow-950/30 rounded text-sm text-yellow-700 dark:text-yellow-300">
            <strong>{t.notes}:</strong> {order.notes}
          </div>
        )}

        {/* Timer Progress */}
        {order.status !== 'served' && (
          <div className="space-y-1">
            <Progress
              value={Math.min((elapsedMinutes / 30) * 100, 100)}
              className={`h-1 ${elapsedMinutes > 20 ? 'bg-red-200' : ''}`}
            />
          </div>
        )}

        {/* Actions */}
        {order.status !== 'served' && (
          <>
            <Separator />
            <div className="flex gap-2">
              {order.status === 'pending' && (
                <Button
                  size="sm"
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                  onClick={() => onStatusChange(order.id, 'preparing')}
                >
                  <ChefHat className="w-4 h-4 mr-1" />
                  {t.markPreparing}
                </Button>
              )}
              {order.status === 'preparing' && (
                <Button
                  size="sm"
                  className="flex-1 bg-green-500 hover:bg-green-600"
                  onClick={() => onStatusChange(order.id, 'ready')}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  {t.markReady}
                </Button>
              )}
              {order.status === 'ready' && (
                <Button
                  size="sm"
                  className="flex-1 bg-[#EF4444] hover:bg-red-600"
                  onClick={() => onStatusChange(order.id, 'served')}
                >
                  <Utensils className="w-4 h-4 mr-1" />
                  {t.markServed}
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => onStatusChange(order.id, 'served')}
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// MAIN KITCHEN ORDERS COMPONENT
// ============================================
export function RestaurantOrders() {
  const { language } = useTheme();
  const t = translations[language];

  // Initialize with demo data directly to avoid setState in effect
  const [orders, setOrders] = useState<KitchenOrder[]>(() => generateDemoOrders());
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate elapsed time in minutes
  const getElapsedMinutes = (createdAt: Date) => {
    return Math.floor((currentTime.getTime() - createdAt.getTime()) / 60000);
  };

  // Handle status change
  const handleStatusChange = useCallback((orderId: string, newStatus: KitchenOrder['status']) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );

    const statusMessages = {
      pending: language === 'en' ? 'Order marked as pending' : 'Orden marcada como pendiente',
      preparing: language === 'en' ? 'Started preparing order' : 'Comenzó a preparar orden',
      ready: language === 'en' ? 'Order is ready!' : '¡Orden lista!',
      served: language === 'en' ? 'Order served' : 'Orden servida',
    };

    toast.success(statusMessages[newStatus]);

    // Play sound for ready orders
    if (newStatus === 'ready' && soundEnabled) {
      // In a real app, play a notification sound
      console.log('Play notification sound');
    }
  }, [language, soundEnabled]);

  // Filter orders by tab
  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });

  // Calculate stats
  const stats = {
    pending: orders.filter((o) => o.status === 'pending').length,
    preparing: orders.filter((o) => o.status === 'preparing').length,
    ready: orders.filter((o) => o.status === 'ready').length,
    served: orders.filter((o) => o.status === 'served').length,
    avgTime: Math.round(
      orders
        .filter((o) => o.status === 'served')
        .reduce((sum, o) => sum + getElapsedMinutes(o.createdAt), 0) /
        Math.max(orders.filter((o) => o.status === 'served').length, 1)
    ),
  };

  // Refresh orders
  const handleRefresh = () => {
    setOrders(generateDemoOrders());
    toast.success(language === 'en' ? 'Orders refreshed' : 'Pedidos actualizados');
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">{t.pending}</p>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">{t.preparing}</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.preparing}</p>
              </div>
              <ChefHat className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">{t.ready}</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.ready}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t.served}</p>
                <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{stats.served}</p>
              </div>
              <Utensils className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 dark:text-red-400">{t.avgTime}</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.avgTime} {t.minutes}</p>
              </div>
              <Timer className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{t.kitchenOrders}</h2>
        <div className="flex gap-2">
          <Button
            variant={soundEnabled ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={soundEnabled ? 'bg-[#EF4444] hover:bg-red-600' : ''}
          >
            <Volume2 className="w-4 h-4 mr-2" />
            {t.soundAlert}
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            {t.refresh}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pending" className="relative">
            {t.pending}
            {stats.pending > 0 && (
              <Badge className="ml-2 bg-yellow-500">{stats.pending}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="preparing" className="relative">
            {t.preparing}
            {stats.preparing > 0 && (
              <Badge className="ml-2 bg-blue-500">{stats.preparing}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="ready" className="relative">
            {t.ready}
            {stats.ready > 0 && (
              <Badge className="ml-2 bg-green-500">{stats.ready}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="served">{t.served}</TabsTrigger>
          <TabsTrigger value="all">{t.allOrders}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <LayoutGrid className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t.noOrders}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrders
                .sort((a, b) => {
                  // Sort by priority first, then by time
                  if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
                  if (a.priority !== 'urgent' && b.priority === 'urgent') return 1;
                  return a.createdAt.getTime() - b.createdAt.getTime();
                })
                .map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    t={t}
                    onStatusChange={handleStatusChange}
                    elapsedMinutes={getElapsedMinutes(order.createdAt)}
                  />
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
