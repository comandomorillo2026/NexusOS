'use client';

import React, { useState } from 'react';
import { useTheme } from '@/contexts/theme-context';
import {
  TrendingUp,
  DollarSign,
  Users,
  ShoppingBag,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ============================================
// TRANSLATIONS
// ============================================
const translations = {
  en: {
    reports: 'Reports',
    salesReport: 'Sales Report',
    topItems: 'Top Selling Items',
    hourlySales: 'Hourly Sales',
    tablePerformance: 'Table Performance',
    exportReport: 'Export Report',
    today: 'Today',
    yesterday: 'Yesterday',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    totalSales: 'Total Sales',
    orders: 'Orders',
    avgTicket: 'Avg Ticket',
    customers: 'Customers',
    growth: 'Growth',
    vsPrevious: 'vs previous period',
    item: 'Item',
    quantity: 'Qty',
    revenue: 'Revenue',
    table: 'Table',
    turnover: 'Turnover',
    avgOrder: 'Avg Order',
    time: 'Time',
    peakHours: 'Peak Hours',
    noData: 'No data available',
  },
  es: {
    reports: 'Reportes',
    salesReport: 'Reporte de Ventas',
    topItems: 'Artículos Más Vendidos',
    hourlySales: 'Ventas por Hora',
    tablePerformance: 'Rendimiento de Mesas',
    exportReport: 'Exportar Reporte',
    today: 'Hoy',
    yesterday: 'Ayer',
    thisWeek: 'Esta Semana',
    thisMonth: 'Este Mes',
    totalSales: 'Ventas Totales',
    orders: 'Pedidos',
    avgTicket: 'Ticket Promedio',
    customers: 'Clientes',
    growth: 'Crecimiento',
    vsPrevious: 'vs período anterior',
    item: 'Artículo',
    quantity: 'Cant',
    revenue: 'Ingresos',
    table: 'Mesa',
    turnover: 'Rotación',
    avgOrder: 'Pedido Prom',
    time: 'Hora',
    peakHours: 'Horas Pico',
    noData: 'Sin datos disponibles',
  },
};

// ============================================
// DEMO DATA
// ============================================
const salesData = {
  today: { total: 4580.50, orders: 87, avgTicket: 52.65, customers: 142, growth: 17.7 },
  yesterday: { total: 3890.25, orders: 72, avgTicket: 54.03, customers: 118, growth: -5.2 },
  thisWeek: { total: 28450.75, orders: 523, avgTicket: 54.40, customers: 856, growth: 12.3 },
  thisMonth: { total: 125680.00, orders: 2340, avgTicket: 53.71, customers: 3892, growth: 8.5 },
};

const topItems = [
  { rank: 1, name: 'Hamburguesa Especial', quantity: 145, revenue: 9425.00 },
  { rank: 2, name: 'Pasta Carbonara', quantity: 128, revenue: 7040.00 },
  { rank: 3, name: 'Ribeye Steak', quantity: 85, revenue: 10200.00 },
  { rank: 4, name: 'Mojito Clásico', quantity: 210, revenue: 5880.00 },
  { rank: 5, name: 'Tacos al Pastor', quantity: 195, revenue: 6825.00 },
  { rank: 6, name: 'Grilled Salmon', quantity: 72, revenue: 6120.00 },
  { rank: 7, name: 'Tiramisú', quantity: 98, revenue: 3136.00 },
  { rank: 8, name: 'Cerveza Nacional', quantity: 380, revenue: 6840.00 },
];

const hourlyData = [
  { hour: '11:00', sales: 450.00, orders: 8 },
  { hour: '12:00', sales: 1250.00, orders: 22 },
  { hour: '13:00', sales: 1580.00, orders: 28 },
  { hour: '14:00', sales: 1120.00, orders: 18 },
  { hour: '15:00', sales: 680.00, orders: 12 },
  { hour: '16:00', sales: 420.00, orders: 7 },
  { hour: '17:00', sales: 890.00, orders: 15 },
  { hour: '18:00', sales: 1650.00, orders: 28 },
  { hour: '19:00', sales: 2100.00, orders: 35 },
  { hour: '20:00', sales: 1890.00, orders: 32 },
  { hour: '21:00', sales: 1450.00, orders: 25 },
  { hour: '22:00', sales: 780.00, orders: 14 },
];

const tablePerformance = [
  { table: 12, turnover: 4.2, avgOrder: 185.00, revenue: 7770.00 },
  { table: 8, turnover: 3.8, avgOrder: 125.00, revenue: 4750.00 },
  { table: 5, turnover: 3.5, avgOrder: 145.00, revenue: 5075.00 },
  { table: 15, turnover: 3.2, avgOrder: 165.00, revenue: 5280.00 },
  { table: 3, turnover: 3.0, avgOrder: 95.00, revenue: 2850.00 },
];

// ============================================
// MAIN REPORTS COMPONENT
// ============================================
export function RestaurantReports() {
  const { language } = useTheme();
  const t = translations[language];
  const [period, setPeriod] = useState<'today' | 'yesterday' | 'thisWeek' | 'thisMonth'>('today');

  const data = salesData[period];

  const formatCurrency = (amount: number) =>
    `TT$${amount.toLocaleString('en-TT', { minimumFractionDigits: 2 })}`;

  const maxHourlySales = Math.max(...hourlyData.map(h => h.sales));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <h2 className="text-xl font-bold">{t.reports}</h2>
        <div className="flex gap-2">
          <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">{t.today}</SelectItem>
              <SelectItem value="yesterday">{t.yesterday}</SelectItem>
              <SelectItem value="thisWeek">{t.thisWeek}</SelectItem>
              <SelectItem value="thisMonth">{t.thisMonth}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            {t.exportReport}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.totalSales}</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(data.total)}</p>
                <div className="flex items-center gap-1 mt-2">
                  {data.growth >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                  <span className={data.growth >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {Math.abs(data.growth)}%
                  </span>
                  <span className="text-muted-foreground text-sm">{t.vsPrevious}</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#EF4444] text-white">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.orders}</p>
                <p className="text-2xl font-bold mt-1">{data.orders}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500 text-white">
                <ShoppingBag className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.avgTicket}</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(data.avgTicket)}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-500 text-white">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.customers}</p>
                <p className="text-2xl font-bold mt-1">{data.customers}</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500 text-white">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different reports */}
      <Tabs defaultValue="topItems" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="topItems">{t.topItems}</TabsTrigger>
          <TabsTrigger value="hourly">{t.hourlySales}</TabsTrigger>
          <TabsTrigger value="tables">{t.tablePerformance}</TabsTrigger>
        </TabsList>

        {/* Top Items Tab */}
        <TabsContent value="topItems">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#EF4444]" />
                {t.topItems}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <table className="w-full">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="text-left p-3 font-medium">#</th>
                      <th className="text-left p-3 font-medium">{t.item}</th>
                      <th className="text-right p-3 font-medium">{t.quantity}</th>
                      <th className="text-right p-3 font-medium">{t.revenue}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topItems.map((item) => (
                      <tr key={item.rank} className="border-t hover:bg-muted/30">
                        <td className="p-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                            item.rank === 1 ? 'bg-yellow-500' : item.rank === 2 ? 'bg-gray-400' : item.rank === 3 ? 'bg-amber-600' : 'bg-muted'
                          }`}>
                            {item.rank}
                          </div>
                        </td>
                        <td className="p-3 font-medium">{item.name}</td>
                        <td className="p-3 text-right">{item.quantity}</td>
                        <td className="p-3 text-right font-bold text-[#EF4444]">{formatCurrency(item.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hourly Sales Tab */}
        <TabsContent value="hourly">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-[#EF4444]" />
                {t.hourlySales}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <div className="space-y-4">
                  {hourlyData.map((hour) => {
                    const percentage = (hour.sales / maxHourlySales) * 100;
                    const isPeak = hour.sales === maxHourlySales;
                    return (
                      <div key={hour.hour} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="font-medium w-16">{hour.hour}</span>
                            {isPeak && (
                              <Badge className="bg-[#EF4444]">{t.peakHours}</Badge>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-[#EF4444]">{formatCurrency(hour.sales)}</span>
                            <span className="text-muted-foreground ml-2">({hour.orders} {t.orders.toLowerCase()})</span>
                          </div>
                        </div>
                        <Progress value={percentage} className={`h-3 ${isPeak ? 'bg-red-200' : ''}`} />
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Table Performance Tab */}
        <TabsContent value="tables">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#EF4444]" />
                {t.tablePerformance}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <table className="w-full">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="text-left p-3 font-medium">{t.table}</th>
                      <th className="text-center p-3 font-medium">{t.turnover}</th>
                      <th className="text-right p-3 font-medium">{t.avgOrder}</th>
                      <th className="text-right p-3 font-medium">{t.revenue}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tablePerformance.map((table) => (
                      <tr key={table.table} className="border-t hover:bg-muted/30">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-[#EF4444] text-white flex items-center justify-center font-bold">
                              {table.table}
                            </div>
                            <span className="font-medium">{t.table} {table.table}</span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant="outline">{table.turnover}x</Badge>
                        </td>
                        <td className="p-3 text-right">{formatCurrency(table.avgOrder)}</td>
                        <td className="p-3 text-right font-bold text-[#EF4444]">{formatCurrency(table.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
