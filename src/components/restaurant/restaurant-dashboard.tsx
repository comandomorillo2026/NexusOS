'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/theme-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  UtensilsCrossed,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  ChefHat,
  LayoutGrid,
  Wine,
  ShoppingBag,
  Timer,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

// ============================================
// TRANSLATIONS
// ============================================
const translations = {
  en: {
    todaySales: "Today's Sales",
    yesterdaySales: 'vs yesterday',
    activeTables: 'Active Tables',
    kitchenQueue: 'Kitchen Queue',
    customersToday: 'Customers Today',
    avgTicket: 'Avg Ticket',
    popularItems: 'Popular Items',
    lowStock: 'Low Stock Alert',
    recentOrders: 'Recent Orders',
    pending: 'Pending',
    preparing: 'Preparing',
    ready: 'Ready',
    served: 'Served',
    viewAll: 'View All',
    reorder: 'Reorder',
    unitsLeft: 'units left',
    items: 'items',
    tables: 'tables',
    orders: 'orders',
    minutes: 'min',
    noOrders: 'No recent orders',
    noLowStock: 'No low stock items',
    noPopularItems: 'No popular items data',
    quickStats: 'Quick Stats',
    avgServiceTime: 'Avg Service Time',
    tableTurnover: 'Table Turnover',
    drinksSold: 'Drinks Sold',
    foodSold: 'Food Sold',
  },
  es: {
    todaySales: 'Ventas de Hoy',
    yesterdaySales: 'vs ayer',
    activeTables: 'Mesas Activas',
    kitchenQueue: 'Cola de Cocina',
    customersToday: 'Clientes Hoy',
    avgTicket: 'Ticket Promedio',
    popularItems: 'Artículos Populares',
    lowStock: 'Alerta de Stock Bajo',
    recentOrders: 'Pedidos Recientes',
    pending: 'Pendiente',
    preparing: 'Preparando',
    ready: 'Listo',
    served: 'Servido',
    viewAll: 'Ver Todo',
    reorder: 'Reordenar',
    unitsLeft: 'unidades restantes',
    items: 'artículos',
    tables: 'mesas',
    orders: 'pedidos',
    minutes: 'min',
    noOrders: 'No hay pedidos recientes',
    noLowStock: 'No hay artículos con stock bajo',
    noPopularItems: 'Sin datos de artículos populares',
    quickStats: 'Estadísticas Rápidas',
    avgServiceTime: 'Tiempo Promedio',
    tableTurnover: 'Rotación de Mesas',
    drinksSold: 'Bebidas Vendidas',
    foodSold: 'Comida Vendida',
  },
};

// ============================================
// INTERFACES
// ============================================
interface DashboardMetrics {
  todaySales: number;
  yesterdaySales: number;
  salesChange: number;
  activeTables: number;
  totalTables: number;
  kitchenQueue: number;
  customersToday: number;
  avgTicket: number;
  avgServiceTime: number;
  tableTurnover: number;
  drinksSold: number;
  foodSold: number;
}

interface PopularItem {
  id: string;
  name: string;
  category: string;
  quantitySold: number;
  revenue: number;
}

interface LowStockItem {
  id: string;
  name: string;
  quantityInStock: number;
  reorderLevel: number;
  category: string;
}

interface KitchenOrder {
  id: string;
  orderNumber: string;
  tableNumber: number;
  items: number;
  status: 'pending' | 'preparing' | 'ready' | 'served';
  createdAt: Date;
  elapsedTime: number;
}

// ============================================
// STAT CARD COMPONENT
// ============================================
interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down';
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, change, trend, icon, color }: StatCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {change && (
              <div className="flex items-center gap-1 mt-2">
                {trend === 'up' ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
                <span
                  className={`text-sm font-medium ${
                    trend === 'up' ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {change}
                </span>
              </div>
            )}
          </div>
          <div
            className="p-3 rounded-xl text-white"
            style={{ backgroundColor: color }}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// KITCHEN ORDER CARD COMPONENT
// ============================================
interface KitchenOrderCardProps {
  order: KitchenOrder;
  t: typeof translations.en;
}

function KitchenOrderCard({ order, t }: KitchenOrderCardProps) {
  const statusConfig = {
    pending: { color: 'bg-yellow-500', label: t.pending, icon: Clock },
    preparing: { color: 'bg-blue-500', label: t.preparing, icon: ChefHat },
    ready: { color: 'bg-green-500', label: t.ready, icon: CheckCircle2 },
    served: { color: 'bg-gray-500', label: t.served, icon: CheckCircle2 },
  };

  const config = statusConfig[order.status];
  const StatusIcon = config.icon;

  return (
    <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full ${config.color} flex items-center justify-center text-white`}>
          <StatusIcon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium">#{order.orderNumber}</p>
          <p className="text-sm text-muted-foreground">
            Mesa {order.tableNumber} • {order.items} {t.items}
          </p>
        </div>
      </div>
      <div className="text-right">
        <Badge variant="outline" className="mb-1">
          <Timer className="h-3 w-3 mr-1" />
          {order.elapsedTime} {t.minutes}
        </Badge>
        <Badge className={config.color}>{config.label}</Badge>
      </div>
    </div>
  );
}

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================
export function RestaurantDashboard() {
  const { language } = useTheme();
  const t = translations[language];

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [popularItems, setPopularItems] = useState<PopularItem[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [kitchenOrders, setKitchenOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading dashboard data
    const loadData = async () => {
      // Demo data
      setMetrics({
        todaySales: 4580.50,
        yesterdaySales: 3890.25,
        salesChange: 17.7,
        activeTables: 12,
        totalTables: 20,
        kitchenQueue: 8,
        customersToday: 87,
        avgTicket: 52.65,
        avgServiceTime: 24,
        tableTurnover: 3.2,
        drinksSold: 145,
        foodSold: 203,
      });

      setPopularItems([
        { id: '1', name: 'Hamburguesa Especial', category: 'Main Course', quantitySold: 45, revenue: 675.00 },
        { id: '2', name: 'Pasta Carbonara', category: 'Main Course', quantitySold: 38, revenue: 532.00 },
        { id: '3', name: 'Mojito Clásico', category: 'Drinks', quantitySold: 52, revenue: 416.00 },
        { id: '4', name: 'Tacos al Pastor', category: 'Appetizers', quantitySold: 67, revenue: 402.00 },
        { id: '5', name: 'Tiramisú', category: 'Desserts', quantitySold: 29, revenue: 261.00 },
      ]);

      setLowStockItems([
        { id: '1', name: 'Carne de Res', quantityInStock: 5, reorderLevel: 10, category: 'Ingredients' },
        { id: '2', name: 'Queso Mozzarella', quantityInStock: 3, reorderLevel: 8, category: 'Ingredients' },
        { id: '3', name: 'Ron Blanco', quantityInStock: 2, reorderLevel: 5, category: 'Beverages' },
      ]);

      setKitchenOrders([
        { id: '1', orderNumber: 'ORD-045', tableNumber: 5, items: 4, status: 'pending', createdAt: new Date(), elapsedTime: 5 },
        { id: '2', orderNumber: 'ORD-044', tableNumber: 12, items: 6, status: 'preparing', createdAt: new Date(), elapsedTime: 12 },
        { id: '3', orderNumber: 'ORD-043', tableNumber: 8, items: 3, status: 'ready', createdAt: new Date(), elapsedTime: 18 },
        { id: '4', orderNumber: 'ORD-042', tableNumber: 3, items: 2, status: 'preparing', createdAt: new Date(), elapsedTime: 8 },
        { id: '5', orderNumber: 'ORD-041', tableNumber: 15, items: 5, status: 'pending', createdAt: new Date(), elapsedTime: 3 },
      ]);

      setLoading(false);
    };

    loadData();
  }, []);

  const formatCurrency = (amount: number) => {
    return `TT$${amount.toLocaleString('en-TT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EF4444]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t.todaySales}
          value={formatCurrency(metrics?.todaySales || 0)}
          change={`${Math.abs(metrics?.salesChange || 0).toFixed(1)}% ${t.yesterdaySales}`}
          trend={(metrics?.salesChange || 0) >= 0 ? 'up' : 'down'}
          icon={<DollarSign className="h-6 w-6" />}
          color="#EF4444"
        />
        <StatCard
          title={t.activeTables}
          value={`${metrics?.activeTables}/${metrics?.totalTables}`}
          icon={<LayoutGrid className="h-6 w-6" />}
          color="#F97316"
        />
        <StatCard
          title={t.kitchenQueue}
          value={`${metrics?.kitchenQueue} ${t.orders}`}
          icon={<ChefHat className="h-6 w-6" />}
          color="#3B82F6"
        />
        <StatCard
          title={t.customersToday}
          value={`${metrics?.customersToday}`}
          icon={<Users className="h-6 w-6" />}
          color="#10B981"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kitchen Queue */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-[#EF4444]" />
              {t.kitchenQueue}
            </CardTitle>
            <Button variant="outline" size="sm">
              {t.viewAll}
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-3">
                {kitchenOrders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">{t.noOrders}</p>
                ) : (
                  kitchenOrders.map((order) => (
                    <KitchenOrderCard key={order.id} order={order} t={t} />
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#EF4444]" />
              {t.quickStats}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-[#EF4444]" />
                <span className="text-sm font-medium">{t.avgTicket}</span>
              </div>
              <span className="font-bold text-[#EF4444]">
                {formatCurrency(metrics?.avgTicket || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Timer className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium">{t.avgServiceTime}</span>
              </div>
              <span className="font-bold text-blue-500">
                {metrics?.avgServiceTime} {t.minutes}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
              <div className="flex items-center gap-3">
                <LayoutGrid className="h-5 w-5 text-orange-500" />
                <span className="text-sm font-medium">{t.tableTurnover}</span>
              </div>
              <span className="font-bold text-orange-500">
                {metrics?.tableTurnover}x
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Wine className="h-5 w-5 text-purple-500" />
                <span className="text-sm font-medium">{t.drinksSold}</span>
              </div>
              <span className="font-bold text-purple-500">{metrics?.drinksSold}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="flex items-center gap-3">
                <UtensilsCrossed className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">{t.foodSold}</span>
              </div>
              <span className="font-bold text-green-500">{metrics?.foodSold}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Items */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#EF4444]" />
              {t.popularItems}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              {popularItems.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">{t.noPopularItems}</p>
              ) : (
                <div className="space-y-3">
                  {popularItems.map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#EF4444] text-white flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#EF4444]">{formatCurrency(item.revenue)}</p>
                        <p className="text-sm text-muted-foreground">{item.quantitySold} {t.items}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              {t.lowStock}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              {lowStockItems.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">{t.noLowStock}</p>
              ) : (
                <div className="space-y-3">
                  {lowStockItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                          <ShoppingBag className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-orange-600">
                            {item.quantityInStock} {t.unitsLeft}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" className="bg-[#EF4444] hover:bg-red-600">
                        {t.reorder}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
