"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Beer,
  Wine,
  GlassWater,
  Download,
  Calendar,
  Clock,
  Target,
  Award,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "@/contexts/theme-context";

// ============================================
// TRANSLATIONS
// ============================================
const translations = {
  en: {
    title: "Reports & Analytics",
    subtitle: "Insights for your bar business",
    today: "Today",
    thisWeek: "This Week",
    thisMonth: "This Month",
    thisYear: "This Year",
    export: "Export Report",
    salesPerformance: "Sales Performance",
    totalRevenue: "Total Revenue",
    vsLastPeriod: "vs last period",
    totalOrders: "Total Orders",
    averageOrder: "Avg. Order",
    customersServed: "Customers Served",
    topCategories: "Top Categories",
    revenue: "Revenue",
    sold: "sold",
    hourlySales: "Hourly Sales",
    peakHours: "Peak Hours",
    bestSellers: "Best Sellers",
    salesGoals: "Sales Goals",
    monthlyTarget: "Monthly Target",
    achieved: "achieved",
    weeklyTrends: "Weekly Trends",
    revenueGrowth: "Revenue Growth",
    ordersGrowth: "Orders Growth",
  },
  es: {
    title: "Reportes y Analiticas",
    subtitle: "Informacion para tu negocio de bar",
    today: "Hoy",
    thisWeek: "Esta Semana",
    thisMonth: "Este Mes",
    thisYear: "Este Ano",
    export: "Exportar Reporte",
    salesPerformance: "Rendimiento de Ventas",
    totalRevenue: "Ingresos Totales",
    vsLastPeriod: "vs periodo anterior",
    totalOrders: "Total Ordenes",
    averageOrder: "Orden Promedio",
    customersServed: "Clientes Atendidos",
    topCategories: "Categorias Principales",
    revenue: "Ingresos",
    sold: "vendidos",
    hourlySales: "Ventas por Hora",
    peakHours: "Horas Pico",
    bestSellers: "Mas Vendidos",
    salesGoals: "Metas de Ventas",
    monthlyTarget: "Meta Mensual",
    achieved: "alcanzado",
    weeklyTrends: "Tendencias Semanales",
    revenueGrowth: "Crecimiento Ingresos",
    ordersGrowth: "Crecimiento Ordenes",
  },
};

// ============================================
// DEMO DATA
// ============================================
const DEMO_CATEGORIES = [
  { name: "Beer", revenue: 45000, sold: 320, icon: Beer, color: "#F59E0B" },
  { name: "Cocktails", revenue: 38500, sold: 145, icon: GlassWater, color: "#8B5CF6" },
  { name: "Spirits", revenue: 28000, sold: 85, icon: GlassWater, color: "#EF4444" },
  { name: "Wine", revenue: 18000, sold: 42, icon: Wine, color: "#EC4899" },
  { name: "Soft Drinks", revenue: 8500, sold: 156, icon: GlassWater, color: "#10B981" },
];

const DEMO_HOURLY_SALES = [
  { hour: "12:00", sales: 2500, orders: 8 },
  { hour: "13:00", sales: 3800, orders: 12 },
  { hour: "14:00", sales: 4200, orders: 15 },
  { hour: "15:00", sales: 3100, orders: 10 },
  { hour: "16:00", sales: 2800, orders: 9 },
  { hour: "17:00", sales: 4500, orders: 16 },
  { hour: "18:00", sales: 6200, orders: 22 },
  { hour: "19:00", sales: 8500, orders: 28 },
  { hour: "20:00", sales: 9800, orders: 35 },
  { hour: "21:00", sales: 7500, orders: 25 },
  { hour: "22:00", sales: 5200, orders: 18 },
  { hour: "23:00", sales: 3800, orders: 12 },
];

const DEMO_BEST_SELLERS = [
  { name: "Presidente", category: "Beer", sold: 85, revenue: 10200 },
  { name: "Mojito Clasico", category: "Cocktails", sold: 62, revenue: 21700 },
  { name: "Ron Brugal", category: "Spirits", sold: 45, revenue: 42750 },
  { name: "Heineken", category: "Beer", sold: 38, revenue: 5700 },
  { name: "Pina Colada", category: "Cocktails", sold: 35, revenue: 13300 },
];

const DEMO_WEEKLY_DATA = [
  { day: "Mon", revenue: 28000, orders: 95 },
  { day: "Tue", revenue: 32000, orders: 110 },
  { day: "Wed", revenue: 35000, orders: 120 },
  { day: "Thu", revenue: 38000, orders: 130 },
  { day: "Fri", revenue: 52000, orders: 180 },
  { day: "Sat", revenue: 68000, orders: 220 },
  { day: "Sun", revenue: 45000, orders: 155 },
];

// ============================================
// MAIN COMPONENT
// ============================================
export function BarReports() {
  const [period, setPeriod] = useState("week");
  const { language } = useTheme();
  
  const t = translations[language];

  const formatCurrency = (amount: number) => {
    return `RD$${amount.toLocaleString("es-DO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  // Calculate totals
  const totalRevenue = DEMO_WEEKLY_DATA.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = DEMO_WEEKLY_DATA.reduce((sum, d) => sum + d.orders, 0);
  const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Sales goal progress
  const monthlyTarget = 500000;
  const currentProgress = 298000;
  const progressPercent = (currentProgress / monthlyTarget) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t.title}</h2>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">{t.today}</SelectItem>
              <SelectItem value="week">{t.thisWeek}</SelectItem>
              <SelectItem value="month">{t.thisMonth}</SelectItem>
              <SelectItem value="year">{t.thisYear}</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-[#8B5CF6] hover:bg-[#7C3AED]">
            <Download className="h-4 w-4 mr-2" />
            {t.export}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.totalRevenue}</p>
                <p className="text-2xl font-bold text-[#8B5CF6]">{formatCurrency(totalRevenue)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">+12.5% {t.vsLastPeriod}</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-[#8B5CF6]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.totalOrders}</p>
                <p className="text-2xl font-bold">{totalOrders}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">+8.2% {t.vsLastPeriod}</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.averageOrder}</p>
                <p className="text-2xl font-bold">{formatCurrency(avgOrder)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">+4.1% {t.vsLastPeriod}</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Target className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.customersServed}</p>
                <p className="text-2xl font-bold">847</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">+15.3% {t.vsLastPeriod}</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Users className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#8B5CF6]" />
              {t.topCategories}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {DEMO_CATEGORIES.map((cat) => {
              const IconComponent = cat.icon;
              const maxRevenue = Math.max(...DEMO_CATEGORIES.map(c => c.revenue));
              const percentage = (cat.revenue / maxRevenue) * 100;
              
              return (
                <div key={cat.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${cat.color}20` }}
                      >
                        <IconComponent className="h-4 w-4" style={{ color: cat.color }} />
                      </div>
                      <span className="font-medium">{cat.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">{formatCurrency(cat.revenue)}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {cat.sold} {t.sold}
                      </span>
                    </div>
                  </div>
                  <Progress 
                    value={percentage} 
                    className="h-2"
                    style={{ 
                      backgroundColor: 'transparent',
                    }}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Hourly Sales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#8B5CF6]" />
              {t.hourlySales}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-end justify-between h-40 gap-1">
                {DEMO_HOURLY_SALES.map((hour, i) => {
                  const maxSales = Math.max(...DEMO_HOURLY_SALES.map(h => h.sales));
                  const height = (hour.sales / maxSales) * 100;
                  const isPeak = hour.sales >= 8000;
                  
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div 
                        className="w-full rounded-t transition-all hover:opacity-80"
                        style={{ 
                          height: `${height}%`,
                          backgroundColor: isPeak ? '#8B5CF6' : '#A78BFA',
                          opacity: isPeak ? 1 : 0.6,
                        }}
                      />
                      <span className="text-xs text-muted-foreground rotate-0">{hour.hour.split(':')[0]}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-center gap-4 pt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-[#8B5CF6]" />
                  <span>{t.peakHours}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Best Sellers & Sales Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Sellers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-[#8B5CF6]" />
              {t.bestSellers}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {DEMO_BEST_SELLERS.map((item, i) => (
                <div 
                  key={item.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#8B5CF6]">{formatCurrency(item.revenue)}</p>
                    <p className="text-xs text-muted-foreground">{item.sold} {t.sold}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sales Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-[#8B5CF6]" />
              {t.salesGoals}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-[#8B5CF6]">{formatCurrency(currentProgress)}</p>
              <p className="text-muted-foreground">{t.monthlyTarget}: {formatCurrency(monthlyTarget)}</p>
            </div>
            
            <Progress value={progressPercent} className="h-4" />
            
            <div className="text-center">
              <span className="text-2xl font-bold">{progressPercent.toFixed(1)}%</span>
              <span className="text-muted-foreground"> {t.achieved}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-center">
                <TrendingUp className="h-5 w-5 mx-auto text-green-600 mb-1" />
                <p className="text-sm font-medium">{t.revenueGrowth}</p>
                <p className="text-lg font-bold text-green-600">+12.5%</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center">
                <ShoppingCart className="h-5 w-5 mx-auto text-blue-600 mb-1" />
                <p className="text-sm font-medium">{t.ordersGrowth}</p>
                <p className="text-lg font-bold text-blue-600">+8.2%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#8B5CF6]" />
            {t.weeklyTrends}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-48 gap-2">
            {DEMO_WEEKLY_DATA.map((day, i) => {
              const maxRevenue = Math.max(...DEMO_WEEKLY_DATA.map(d => d.revenue));
              const height = (day.revenue / maxRevenue) * 100;
              
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="flex-1 w-full flex items-end">
                    <div 
                      className="w-full rounded-t bg-gradient-to-t from-[#8B5CF6] to-[#A78BFA] transition-all hover:opacity-80"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">{day.day}</p>
                    <p className="text-xs text-muted-foreground">{day.orders} orders</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
