"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Wine,
  Beer,
  GlassWater,
  AlertCircle,
} from "lucide-react";
import { useTheme } from "@/contexts/theme-context";

// ============================================
// TRANSLATIONS
// ============================================
const translations = {
  en: {
    todaySales: "Today's Sales",
    vsYesterday: "vs yesterday",
    drinksSold: "Drinks Sold",
    pendingOrders: "Pending Orders",
    customersToday: "Customers Today",
    popularDrinks: "Popular Drinks",
    lowStockAlerts: "Low Stock Alerts",
    unitsLeft: "units left",
    reorder: "Reorder",
    recentTransactions: "Recent Transactions",
    noRecentTransactions: "No recent transactions",
    noLowStock: "All items in stock",
    noPopularDrinks: "No sales data yet",
    systemAlerts: "System Alerts",
    inventoryWarning: "Inventory Warning",
    productsLowStock: "products with low stock",
    pendingPayments: "Pending Payments",
    paymentsPending: "payments pending verification",
    happyHour: "Happy Hour Active",
    happyHourActive: "Happy hour specials running now",
    viewAll: "View All",
  },
  es: {
    todaySales: "Ventas de Hoy",
    vsYesterday: "vs ayer",
    drinksSold: "Bebidas Vendidas",
    pendingOrders: "Pedidos Pendientes",
    customersToday: "Clientes Hoy",
    popularDrinks: "Bebidas Populares",
    lowStockAlerts: "Alertas de Stock Bajo",
    unitsLeft: "unidades restantes",
    reorder: "Reordenar",
    recentTransactions: "Transacciones Recientes",
    noRecentTransactions: "Sin transacciones recientes",
    noLowStock: "Todo en stock",
    noPopularDrinks: "Sin datos de ventas",
    systemAlerts: "Alertas del Sistema",
    inventoryWarning: "Alerta de Inventario",
    productsLowStock: "productos con stock bajo",
    pendingPayments: "Pagos Pendientes",
    paymentsPending: "pagos pendientes de verificacion",
    happyHour: "Happy Hour Activo",
    happyHourActive: "Ofertas de happy hour activas",
    viewAll: "Ver Todos",
  },
};

// ============================================
// INTERFACES
// ============================================
interface DashboardMetrics {
  todaySales: number;
  yesterdaySales: number;
  salesChange: string;
  drinksSoldToday: number;
  pendingOrders: number;
  customersToday: number;
}

interface PopularDrink {
  id: string;
  name: string;
  category: string;
  soldToday: number;
  revenue: number;
}

interface LowStockItem {
  id: string;
  name: string;
  brand: string;
  quantityInStock: number;
  reorderLevel: number;
  category: string;
}

interface RecentTransaction {
  id: string;
  transactionNumber: string;
  customerName: string;
  total: number;
  paymentMethod: string;
  createdAt: string;
  items: number;
}

// ============================================
// DEMO DATA
// ============================================
const DEMO_METRICS: DashboardMetrics = {
  todaySales: 4875.50,
  yesterdaySales: 4125.00,
  salesChange: "18.2",
  drinksSoldToday: 234,
  pendingOrders: 7,
  customersToday: 89,
};

const DEMO_POPULAR_DRINKS: PopularDrink[] = [
  { id: "1", name: "Mojito Clasico", category: "Cocktails", soldToday: 28, revenue: 420.00 },
  { id: "2", name: "Heineken", category: "Beer", soldToday: 45, revenue: 337.50 },
  { id: "3", name: "Pina Colada", category: "Cocktails", soldToday: 22, revenue: 385.00 },
  { id: "4", name: "Corona Extra", category: "Beer", soldToday: 38, revenue: 285.00 },
  { id: "5", name: "Cuba Libre", category: "Cocktails", soldToday: 19, revenue: 285.00 },
  { id: "6", name: "Coca Cola", category: "Soft Drinks", soldToday: 32, revenue: 96.00 },
];

const DEMO_LOW_STOCK: LowStockItem[] = [
  { id: "1", name: "Ron Bacardi Carta Blanca", brand: "Bacardi", quantityInStock: 3, reorderLevel: 10, category: "Spirits" },
  { id: "2", name: "Vodka Smirnoff", brand: "Smirnoff", quantityInStock: 5, reorderLevel: 8, category: "Spirits" },
  { id: "3", name: "Cerveza Presidente", brand: "Presidente", quantityInStock: 12, reorderLevel: 24, category: "Beer" },
  { id: "4", name: "Gin Tanqueray", brand: "Tanqueray", quantityInStock: 2, reorderLevel: 6, category: "Spirits" },
];

const DEMO_TRANSACTIONS: RecentTransaction[] = [
  { id: "1", transactionNumber: "TXN-2024-001", customerName: "Maria Garcia", total: 85.50, paymentMethod: "card", createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), items: 4 },
  { id: "2", transactionNumber: "TXN-2024-002", customerName: "Carlos Rodriguez", total: 125.00, paymentMethod: "cash", createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), items: 6 },
  { id: "3", transactionNumber: "TXN-2024-003", customerName: "Ana Martinez", total: 67.25, paymentMethod: "card", createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(), items: 3 },
  { id: "4", transactionNumber: "TXN-2024-004", customerName: "Luis Fernandez", total: 210.00, paymentMethod: "transfer", createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), items: 8 },
  { id: "5", transactionNumber: "TXN-2024-005", customerName: "Walk-in Customer", total: 45.00, paymentMethod: "cash", createdAt: new Date(Date.now() - 1000 * 60 * 150).toISOString(), items: 2 },
];

// ============================================
// STAT CARD COMPONENT
// ============================================
interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down";
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
                {trend === "up" ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
                <span
                  className={`text-sm font-medium ${
                    trend === "up" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {change}%
                </span>
                <span className="text-sm text-muted-foreground">vs ayer</span>
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
// MAIN COMPONENT
// ============================================
export function BarDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [popularDrinks, setPopularDrinks] = useState<PopularDrink[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useTheme();
  
  const t = translations[language];

  useEffect(() => {
    // Simulate loading demo data
    const loadData = () => {
      setTimeout(() => {
        setMetrics(DEMO_METRICS);
        setPopularDrinks(DEMO_POPULAR_DRINKS);
        setLowStockItems(DEMO_LOW_STOCK);
        setRecentTransactions(DEMO_TRANSACTIONS);
        setLoading(false);
      }, 500);
    };
    
    loadData();
  }, []);

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "beer":
        return <Beer className="h-4 w-4" />;
      case "wine":
        return <Wine className="h-4 w-4" />;
      case "cocktails":
        return <GlassWater className="h-4 w-4" />;
      case "spirits":
        return <GlassWater className="h-4 w-4" />;
      default:
        return <GlassWater className="h-4 w-4" />;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: language === "es" ? "Efectivo" : "Cash",
      card: language === "es" ? "Tarjeta" : "Card",
      transfer: language === "es" ? "Transferencia" : "Transfer",
    };
    return labels[method] || method;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5CF6]" />
      </div>
    );
  }

  const salesChangeNum = metrics ? parseFloat(metrics.salesChange) : 0;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t.todaySales}
          value={formatCurrency(metrics?.todaySales || 0)}
          change={`${Math.abs(salesChangeNum).toFixed(1)}`}
          trend={salesChangeNum >= 0 ? "up" : "down"}
          icon={<DollarSign className="h-6 w-6" />}
          color="#8B5CF6"
        />
        <StatCard
          title={t.drinksSold}
          value={metrics?.drinksSoldToday?.toString() || "0"}
          icon={<GlassWater className="h-6 w-6" />}
          color="#A78BFA"
        />
        <StatCard
          title={t.pendingOrders}
          value={metrics?.pendingOrders?.toString() || "0"}
          icon={<Clock className="h-6 w-6" />}
          color="#F59E0B"
        />
        <StatCard
          title={t.customersToday}
          value={metrics?.customersToday?.toString() || "0"}
          icon={<Users className="h-6 w-6" />}
          color="#10B981"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Popular Drinks */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#8B5CF6]" />
              {t.popularDrinks}
            </CardTitle>
            <Button variant="outline" size="sm">
              {t.viewAll}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {popularDrinks.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {t.noPopularDrinks}
                </p>
              ) : (
                popularDrinks.map((drink, index) => {
                  const maxSold = Math.max(...popularDrinks.map(d => d.soldToday));
                  const percentage = maxSold > 0 ? (drink.soldToday / maxSold) * 100 : 0;
                  
                  return (
                    <div key={drink.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-[#8B5CF6]">
                            {getCategoryIcon(drink.category)}
                          </div>
                          <div>
                            <p className="font-medium">{drink.name}</p>
                            <p className="text-xs text-muted-foreground">{drink.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#8B5CF6]">{formatCurrency(drink.revenue)}</p>
                          <p className="text-xs text-muted-foreground">{drink.soldToday} {language === "es" ? "vendidos" : "sold"}</p>
                        </div>
                      </div>
                      <Progress
                        value={percentage}
                        className="h-2 bg-gray-200 dark:bg-gray-700 [&>div]:bg-[#8B5CF6]"
                      />
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {t.lowStockAlerts}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {lowStockItems.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {t.noLowStock}
              </p>
            ) : (
              lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        {item.quantityInStock} {t.unitsLeft}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" className="bg-[#8B5CF6] hover:bg-[#7C3AED]">
                    {t.reorder}
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-[#8B5CF6]" />
            {t.recentTransactions}
          </CardTitle>
          <Button variant="outline" size="sm">
            {t.viewAll}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {recentTransactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {t.noRecentTransactions}
              </p>
            ) : (
              recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-[#8B5CF6]" />
                    </div>
                    <div>
                      <p className="font-medium">{transaction.transactionNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.customerName} - {transaction.items} {language === "es" ? "items" : "items"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-[#8B5CF6]">
                      {formatCurrency(transaction.total)}
                    </span>
                    <Badge variant="outline">
                      {getPaymentMethodLabel(transaction.paymentMethod)}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-200 dark:bg-amber-800 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-700 dark:text-amber-300" />
              </div>
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">{t.inventoryWarning}</p>
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  {lowStockItems.length} {t.productsLowStock}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-200 dark:bg-blue-800 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-700 dark:text-blue-300" />
              </div>
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-200">{t.pendingPayments}</p>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  3 {t.paymentsPending}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-200 dark:bg-green-800 flex items-center justify-center">
                <Clock className="h-5 w-5 text-green-700 dark:text-green-300" />
              </div>
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">{t.happyHour}</p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {t.happyHourActive}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
