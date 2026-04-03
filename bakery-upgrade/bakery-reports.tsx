"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  DollarSign,
  Package,
  Users,
  ShoppingCart,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

export function BakeryReports() {
  const [period, setPeriod] = useState("week");

  const salesData = [
    { day: "Lun", sales: 2500, orders: 28 },
    { day: "Mar", sales: 3200, orders: 35 },
    { day: "Mie", sales: 2800, orders: 32 },
    { day: "Jue", sales: 3500, orders: 40 },
    { day: "Vie", sales: 4200, orders: 48 },
    { day: "Sab", sales: 5800, orders: 65 },
    { day: "Dom", sales: 4100, orders: 52 },
  ];

  const topProducts = [
    { name: "Pan Frances", quantity: 450, revenue: 2250 },
    { name: "Pan Dulce", quantity: 320, revenue: 1920 },
    { name: "Quesillo", quantity: 180, revenue: 2700 },
    { name: "Pastelitos", quantity: 150, revenue: 1500 },
    { name: "Pan de Agua", quantity: 120, revenue: 600 },
  ];

  const categoryData = [
    { category: "Panes", sales: 5500, percentage: 45 },
    { category: "Dulces", sales: 3200, percentage: 26 },
    { category: "Salados", sales: 2100, percentage: 17 },
    { category: "Bebidas", sales: 1500, percentage: 12 },
  ];

  const totalSales = salesData.reduce((sum, d) => sum + d.sales, 0);
  const totalOrders = salesData.reduce((sum, d) => sum + d.orders, 0);
  const avgTicket = totalSales / totalOrders;

  const formatCurrency = (amount: number) => {
    return `TT$${amount.toLocaleString("en-TT", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reportes</h2>
          <p className="text-gray-500">Analisis y metricas del negocio</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoy</SelectItem>
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="month">Este Mes</SelectItem>
              <SelectItem value="quarter">Este Trimestre</SelectItem>
              <SelectItem value="year">Este Ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Ventas Totales</p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(totalSales)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-500">+12.5%</span>
                  <span className="text-sm text-gray-400">vs periodo anterior</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#F97316] text-white">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pedidos</p>
                <p className="text-2xl font-bold mt-1">{totalOrders}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-500">+8.3%</span>
                  <span className="text-sm text-gray-400">vs periodo anterior</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-blue-500 text-white">
                <ShoppingCart className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Ticket Promedio</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(avgTicket)}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-500">+3.8%</span>
                  <span className="text-sm text-gray-400">vs periodo anterior</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-green-500 text-white">
                <BarChart3 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Clientes Unicos</p>
                <p className="text-2xl font-bold mt-1">156</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-500">+15.2%</span>
                  <span className="text-sm text-gray-400">nuevos clientes</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-purple-500 text-white">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ventas por Dia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {salesData.map((day, index) => {
              const maxSales = Math.max(...salesData.map((d) => d.sales));
              const percentage = (day.sales / maxSales) * 100;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{day.day}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-500">{day.orders} pedidos</span>
                      <span className="font-bold text-[#F97316]">
                        {formatCurrency(day.sales)}
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={percentage}
                    className="h-3 bg-gray-200 [&>div]:bg-[#F97316]"
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5 text-[#F97316]" />
              Productos Mas Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-sm font-bold text-[#F97316]">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">
                        {product.quantity} unidades
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-[#F97316]">
                    {formatCurrency(product.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ventas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryData.map((cat, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">
                      {cat.category}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-500">{cat.percentage}%</span>
                      <span className="font-bold text-[#F97316]">
                        {formatCurrency(cat.sales)}
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={cat.percentage}
                    className="h-2 bg-gray-200"
                    style={{
                      // @ts-ignore
                      "--progress-background": `hsl(${30 + index * 20}, 90%, 50%)`,
                    }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Metricas de Rendimiento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-[#F97316]">98.5%</p>
              <p className="text-sm text-gray-500">Tasa de Entrega</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">4.8</p>
              <p className="text-sm text-gray-500">Calificacion Cliente</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-blue-600">15 min</p>
              <p className="text-sm text-gray-500">Tiempo Promedio</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-purple-600">2.3%</p>
              <p className="text-sm text-gray-500">Tasa Devoluciones</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
