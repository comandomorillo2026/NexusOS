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
  ChefHat,
  Globe,
  ExternalLink,
  Eye,
  Store,
  Calendar,
  RefreshCw,
  Plus,
  MessageCircle,
  Phone,
  CreditCard,
  Banknote,
  Truck,
  CheckCircle,
  Timer,
  Target,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";
import Link from "next/link";

interface DashboardMetrics {
  todaySales: number;
  yesterdaySales: number;
  salesChange: number;
  productsSoldToday: number;
  pendingOrders: number;
  customersToday: number;
  averageTicket: number;
  deliveryOrders: number;
}

interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  quantityInStock: number;
  reorderLevel: number | null;
  category: string;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  orderType: string;
  createdAt: string;
  items: Array<{
    productName: string;
    quantity: number;
    totalPrice: number;
  }>;
}

interface SalesChartData {
  date: string;
  totalSales: number;
  orderCount: number;
}

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down";
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

function StatCard({ title, value, change, trend, icon, color, subtitle }: StatCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow border-l-4" style={{ borderLeftColor: color }}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {change && (
              <div className="flex items-center gap-1 mt-1">
                {trend === "up" ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500" />
                )}
                <span className={`text-xs font-medium ${trend === "up" ? "text-green-500" : "text-red-500"}`}>
                  {change}
                </span>
                <span className="text-xs text-gray-400">vs ayer</span>
              </div>
            )}
            {subtitle && (
              <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>
          <div className="p-2 rounded-xl text-white" style={{ backgroundColor: color }}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Mini chart component for sales visualization
function MiniChart({ data }: { data: { value: number }[] }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="flex items-end gap-1 h-8">
      {data.map((d, i) => (
        <div
          key={i}
          className="flex-1 bg-[#F97316]/20 rounded-t"
          style={{ height: `${(d.value / max) * 100}%` }}
        />
      ))}
    </div>
  );
}

export function BakeryDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [salesChart, setSalesChart] = useState<SalesChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setMetrics({
        todaySales: 4580.50,
        yesterdaySales: 3890.25,
        salesChange: 17.8,
        productsSoldToday: 156,
        pendingOrders: 5,
        customersToday: 42,
        averageTicket: 109.06,
        deliveryOrders: 8,
      });
      
      setLowStockProducts([
        { id: '1', name: 'Harina de Trigo', sku: 'HAR-001', quantityInStock: 5, reorderLevel: 20, category: 'Ingredientes' },
        { id: '2', name: 'Levadura Fresca', sku: 'LEV-001', quantityInStock: 3, reorderLevel: 10, category: 'Ingredientes' },
        { id: '3', name: 'Mantequilla', sku: 'MAN-001', quantityInStock: 2, reorderLevel: 8, category: 'Ingredientes' },
      ]);
      
      setRecentOrders([
        { id: '1', orderNumber: 'ORD-2026-0001', customerName: 'María García', total: 281.25, status: 'preparing', orderType: 'preorder', createdAt: new Date().toISOString(), items: [{ productName: 'Pastel Chocolate', quantity: 1, totalPrice: 200 }] },
        { id: '2', orderNumber: 'ORD-2026-0002', customerName: 'Carlos Rodríguez', total: 176.88, status: 'pending', orderType: 'delivery', createdAt: new Date().toISOString(), items: [{ productName: 'Pan de Queso', quantity: 2, totalPrice: 120 }] },
        { id: '3', orderNumber: 'ORD-2026-0003', customerName: 'Ana López', total: 89.50, status: 'ready', orderType: 'POS', createdAt: new Date().toISOString(), items: [{ productName: 'Donas x6', quantity: 2, totalPrice: 100 }] },
        { id: '4', orderNumber: 'ORD-2026-0004', customerName: 'Pedro Martínez', total: 345.00, status: 'pending', orderType: 'preorder', createdAt: new Date().toISOString(), items: [{ productName: 'Tres Leches', quantity: 1, totalPrice: 250 }] },
      ]);
      
      setSalesChart([
        { date: '2026-03-28', totalSales: 3200, orderCount: 28 },
        { date: '2026-03-29', totalSales: 4100, orderCount: 35 },
        { date: '2026-03-30', totalSales: 2800, orderCount: 24 },
        { date: '2026-03-31', totalSales: 5600, orderCount: 48 },
        { date: '2026-04-01', totalSales: 4800, orderCount: 42 },
        { date: '2026-04-02', totalSales: 3890, orderCount: 33 },
        { date: '2026-04-03', totalSales: 4580, orderCount: 42 },
      ]);
      
      setLoading(false);
    }, 500);
  }, []);

  const formatCurrency = (amount: number) => {
    return `TT$${amount.toLocaleString("en-TT", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700",
      confirmed: "bg-blue-100 text-blue-700",
      preparing: "bg-orange-100 text-orange-700",
      ready: "bg-green-100 text-green-700",
      completed: "bg-gray-100 text-gray-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pendiente",
      confirmed: "Confirmado",
      preparing: "Preparando",
      ready: "Listo",
      completed: "Completado",
      cancelled: "Cancelado",
    };
    return labels[status] || status;
  };

  const getOrderTypeIcon = (type: string) => {
    switch (type) {
      case 'delivery': return <Truck className="w-3 h-3" />;
      case 'preorder': return <Calendar className="w-3 h-3" />;
      default: return <ShoppingCart className="w-3 h-3" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F97316]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions Bar */}
      <div className="flex items-center justify-between bg-gradient-to-r from-[#F97316]/10 to-[#FBBF24]/10 p-4 rounded-xl border border-[#F97316]/20">
        <div className="flex items-center gap-3">
          <ChefHat className="w-8 h-8 text-[#F97316]" />
          <div>
            <h2 className="font-bold text-gray-900">¡Buen día, Panadero!</h2>
            <p className="text-sm text-gray-600">Tienes {metrics?.pendingOrders} pedidos pendientes de procesar</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/bakery?tab=pos">
            <Button className="bg-[#F97316] hover:bg-[#EA580C]">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Venta
            </Button>
          </Link>
          <Link href="/bakery?tab=orders">
            <Button variant="outline" className="border-[#F97316]/30">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Ver Pedidos
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Ventas del Día"
          value={formatCurrency(metrics?.todaySales || 0)}
          change={`${Math.abs(metrics?.salesChange || 0).toFixed(1)}%`}
          trend={(metrics?.salesChange || 0) >= 0 ? "up" : "down"}
          icon={<DollarSign className="h-5 w-5" />}
          color="#F97316"
          subtitle={`${metrics?.orderCount || 0} transacciones`}
        />
        <StatCard
          title="Productos Vendidos"
          value={metrics?.productsSoldToday?.toString() || "0"}
          icon={<Package className="h-5 w-5" />}
          color="#FBBF24"
          subtitle="Unidades hoy"
        />
        <StatCard
          title="Pedidos Pendientes"
          value={metrics?.pendingOrders?.toString() || "0"}
          icon={<Clock className="h-5 w-5" />}
          color="#3B82F6"
          subtitle="Requieren atención"
        />
        <StatCard
          title="Clientes Hoy"
          value={metrics?.customersToday?.toString() || "0"}
          icon={<Users className="h-5 w-5" />}
          color="#10B981"
          subtitle={`Ticket prom: ${formatCurrency(metrics?.averageTicket || 0)}`}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Pedidos Delivery</p>
                <p className="text-3xl font-bold text-green-700">{metrics?.deliveryOrders || 0}</p>
                <p className="text-xs text-green-500">En camino o programados</p>
              </div>
              <Truck className="w-12 h-12 text-green-300" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Ticket Promedio</p>
                <p className="text-3xl font-bold text-blue-700">{formatCurrency(metrics?.averageTicket || 0)}</p>
                <p className="text-xs text-blue-500">Por transacción</p>
              </div>
              <Target className="w-12 h-12 text-blue-300" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Meta Semanal</p>
                <p className="text-3xl font-bold text-purple-700">72%</p>
                <p className="text-xs text-purple-500">TT$28,400 / TT$40,000</p>
              </div>
              <Activity className="w-12 h-12 text-purple-300" />
            </div>
            <Progress value={72} className="mt-3 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-[#F97316]" />
              Pedidos Recientes
            </CardTitle>
            <Link href="/bakery?tab=orders">
              <Button variant="outline" size="sm">
                Ver Todos
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentOrders.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No hay pedidos recientes</p>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#F97316]/10 flex items-center justify-center">
                        {order.orderType === 'delivery' ? (
                          <Truck className="h-5 w-5 text-[#F97316]" />
                        ) : order.orderType === 'preorder' ? (
                          <Calendar className="h-5 w-5 text-[#F97316]" />
                        ) : (
                          <ChefHat className="h-5 w-5 text-[#F97316]" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-mono font-medium text-gray-900">{order.orderNumber}</p>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusLabel(order.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          {order.customerName} • {order.items.length} items
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-[#F97316]">{formatCurrency(order.total)}</p>
                        <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Stock Bajo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowStockProducts.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No hay productos con stock bajo</p>
            ) : (
              lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-3 bg-orange-50 rounded-xl border border-orange-100"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Package className="h-5 w-5 text-[#F97316]" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-orange-600">{product.quantityInStock} uds</p>
                      <p className="text-xs text-gray-400">Mín: {product.reorderLevel}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Progress 
                      value={(product.quantityInStock / (product.reorderLevel || 10)) * 100} 
                      className="h-1.5 bg-orange-200"
                    />
                  </div>
                </div>
              ))
            )}
            <Link href="/bakery?tab=products">
              <Button variant="outline" className="w-full mt-2" size="sm">
                Ver Inventario
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#F97316]" />
              Ventas - Últimos 7 Días
            </CardTitle>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[#F97316]" />
                <span className="text-gray-500">Ventas</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[#FBBF24]" />
                <span className="text-gray-500">Pedidos</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {salesChart.map((day, index) => {
              const maxSales = Math.max(...salesChart.map((d) => d.totalSales));
              const percentage = maxSales > 0 ? (day.totalSales / maxSales) * 100 : 0;
              const date = new Date(day.date);
              const dayName = date.toLocaleDateString("es-ES", { weekday: "short" });
              const formattedDate = date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
              const isToday = index === salesChart.length - 1;

              return (
                <div key={index} className={`space-y-2 ${isToday ? 'bg-[#F97316]/5 p-3 rounded-lg -mx-3' : ''}`}>
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${isToday ? 'text-[#F97316]' : 'text-gray-700'}`}>
                        {dayName} {formattedDate}
                      </span>
                      {isToday && <Badge className="bg-[#F97316] text-white text-xs">Hoy</Badge>}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-500">{day.orderCount} pedidos</span>
                      <span className="font-bold text-[#F97316]">{formatCurrency(day.totalSales)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={percentage}
                      className="h-2 flex-1 bg-gray-200 [&>div]:bg-gradient-to-r [&>div]:from-[#F97316] [&>div]:to-[#FBBF24]"
                    />
                    <span className="text-xs text-gray-400 w-10">{percentage.toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Weekly Summary */}
          <div className="mt-6 pt-4 border-t grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500">Total Semana</p>
              <p className="text-lg font-bold text-[#F97316]">
                {formatCurrency(salesChart.reduce((sum, d) => sum + d.totalSales, 0))}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Promedio Diario</p>
              <p className="text-lg font-bold text-gray-700">
                {formatCurrency(salesChart.reduce((sum, d) => sum + d.totalSales, 0) / salesChart.length)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Pedidos Totales</p>
              <p className="text-lg font-bold text-gray-700">
                {salesChart.reduce((sum, d) => sum + d.orderCount, 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Public Portal Card */}
      <Card className="bg-gradient-to-r from-[#F97316]/10 to-[#FBBF24]/10 border-[#F97316]/30">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F97316] to-[#EA580C] flex items-center justify-center shadow-lg">
                <Store className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Tu Portal de Productos</h3>
                <p className="text-sm text-gray-600">
                  Tu catálogo público donde los clientes pueden ver productos y contactarte
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/bakery/mi-panaderia/catalog"
                target="_blank"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-[#F97316]/30 text-[#F97316] hover:bg-[#F97316]/5 transition-colors"
              >
                <Eye className="h-4 w-4" />
                Ver Portal
                <ExternalLink className="h-3 w-3" />
              </Link>
              <Link
                href="/bakery?tab=catalog"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F97316] text-white hover:bg-[#EA580C] transition-colors"
              >
                <Globe className="h-4 w-4" />
                Configurar
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Production & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-[#F97316]" />
              Producción de Hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium text-green-700">Pan de Agua</p>
                    <p className="text-sm text-green-600">50 unidades - Completado</p>
                  </div>
                </div>
                <Badge className="bg-green-500 text-white">100%</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                <div className="flex items-center gap-3">
                  <ChefHat className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="font-medium text-orange-700">Pan Dulce</p>
                    <p className="text-sm text-orange-600">30 unidades - En proceso</p>
                  </div>
                </div>
                <Badge className="bg-orange-500 text-white">60%</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-700">Pastel de Bodas</p>
                    <p className="text-sm text-gray-500">Programado: 4:00 PM</p>
                  </div>
                </div>
                <Badge className="bg-gray-400 text-white">Pendiente</Badge>
              </div>
            </div>
            <Link href="/bakery?tab=production">
              <Button variant="outline" className="w-full mt-4">
                Ver Plan de Producción
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Alertas del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="font-medium text-red-700">Inventario por vencer</p>
                  <p className="text-sm text-red-600">3 productos próximos a vencer</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="border-red-200 text-red-700">
                Ver
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="font-medium text-yellow-700">Pedidos sin procesar</p>
                  <p className="text-sm text-yellow-600">{metrics?.pendingOrders || 0} pedidos pendientes</p>
                </div>
              </div>
              <Link href="/bakery?tab=orders">
                <Button size="sm" variant="outline" className="border-yellow-200 text-yellow-700">
                  Procesar
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium text-blue-700">Entregas programadas</p>
                  <p className="text-sm text-blue-600">2 deliveries para hoy</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="border-blue-200 text-blue-700">
                Ver
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
