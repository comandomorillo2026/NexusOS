'use client';

import React, { useState, useEffect } from 'react';
import {
  Eye,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Users,
  Package,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  RefreshCw,
  Download,
  ChevronDown,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CatalogAnalytics {
  totalViews: number;
  uniqueVisitors: number;
  viewsToday: number;
  viewsThisWeek: number;
  viewsChange: number;
  topProducts: Array<{
    id: string;
    name: string;
    views: number;
    addToCartCount: number;
  }>;
  topCategories: Array<{
    name: string;
    views: number;
    percentage: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: 'view' | 'order' | 'contact';
    timestamp: string;
    details: string;
  }>;
  ordersReceived: number;
  contactClicks: number;
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  peakHours: Array<{
    hour: number;
    views: number;
  }>;
}

interface CatalogNotification {
  id: string;
  type: 'view' | 'order' | 'contact' | 'favorite';
  message: string;
  timestamp: string;
  read: boolean;
}

// Demo data
const demoAnalytics: CatalogAnalytics = {
  totalViews: 1847,
  uniqueVisitors: 892,
  viewsToday: 156,
  viewsThisWeek: 743,
  viewsChange: 12.5,
  topProducts: [
    { id: '1', name: 'Torta de Chocolate', views: 234, addToCartCount: 45 },
    { id: '2', name: 'Pan de Agua Fresco', views: 198, addToCartCount: 67 },
    { id: '3', name: 'Tres Leches Premium', views: 167, addToCartCount: 32 },
    { id: '4', name: 'Brownie Artesanal', views: 145, addToCartCount: 28 },
    { id: '5', name: 'Golfeados Tachireños', views: 123, addToCartCount: 19 },
  ],
  topCategories: [
    { name: 'Panes', views: 456, percentage: 28 },
    { name: 'Tortas', views: 378, percentage: 23 },
    { name: 'Postres', views: 298, percentage: 18 },
    { name: 'Dulces', views: 245, percentage: 15 },
    { name: 'Salados', views: 189, percentage: 12 },
    { name: 'Bebidas', views: 81, percentage: 5 },
  ],
  recentActivity: [
    { id: '1', type: 'order', timestamp: new Date(Date.now() - 5 * 60000).toISOString(), details: 'María García realizó un pedido de TT$125' },
    { id: '2', type: 'view', timestamp: new Date(Date.now() - 12 * 60000).toISOString(), details: 'Nueva visita al catálogo' },
    { id: '3', type: 'contact', timestamp: new Date(Date.now() - 25 * 60000).toISOString(), details: 'Cliente usó WhatsApp desde el catálogo' },
    { id: '4', type: 'order', timestamp: new Date(Date.now() - 45 * 60000).toISOString(), details: 'Carlos López realizó un pedido de TT$350' },
    { id: '5', type: 'view', timestamp: new Date(Date.now() - 60 * 60000).toISOString(), details: 'Nueva visita al catálogo' },
    { id: '6', type: 'favorite', timestamp: new Date(Date.now() - 90 * 60000).toISOString(), details: 'Producto agregado a favoritos: Torta Tres Leches' },
  ],
  ordersReceived: 23,
  contactClicks: 67,
  deviceBreakdown: {
    mobile: 68,
    desktop: 25,
    tablet: 7
  },
  peakHours: [
    { hour: 8, views: 45 },
    { hour: 9, views: 67 },
    { hour: 10, views: 89 },
    { hour: 11, views: 112 },
    { hour: 12, views: 134 },
    { hour: 13, views: 98 },
    { hour: 14, views: 76 },
    { hour: 15, views: 65 },
    { hour: 16, views: 78 },
    { hour: 17, views: 92 },
    { hour: 18, views: 145 },
    { hour: 19, views: 123 },
  ]
};

const demoNotifications: CatalogNotification[] = [
  { id: '1', type: 'order', message: '🛒 Nuevo pedido recibido: TT$125', timestamp: new Date(Date.now() - 5 * 60000).toISOString(), read: false },
  { id: '2', type: 'view', message: '👀 Alguien está viendo tu catálogo', timestamp: new Date(Date.now() - 30 * 60000).toISOString(), read: false },
  { id: '3', type: 'contact', message: '📱 Cliente usó WhatsApp desde el catálogo', timestamp: new Date(Date.now() - 60 * 60000).toISOString(), read: true },
];

export function CatalogAnalytics() {
  const [analytics, setAnalytics] = useState<CatalogAnalytics>(demoAnalytics);
  const [notifications, setNotifications] = useState<CatalogNotification[]>(demoNotifications);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('week');
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 500);

    // Simulate real-time notifications
    const interval = setInterval(() => {
      // In production, this would poll the API
      // For demo, we'll just show the concept
    }, 30000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const markNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes}m`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours}h`;

    return date.toLocaleDateString('es-TT', { day: 'numeric', month: 'short' });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="w-4 h-4 text-green-500" />;
      case 'view':
        return <Eye className="w-4 h-4 text-blue-500" />;
      case 'contact':
        return <MessageCircle className="w-4 h-4 text-emerald-500" />;
      case 'favorite':
        return <Package className="w-4 h-4 text-rose-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F97316]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-cormorant)' }}>
            Analytics del Catálogo
          </h2>
          <p className="text-[var(--text-dim)] text-sm">
            Estadísticas de visitas y pedidos de tu portal público
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Range Filter */}
          <div className="flex gap-1 bg-[var(--glass)] rounded-lg p-1">
            {(['today', 'week', 'month'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-[#F97316] text-white'
                    : 'text-[var(--text-mid)] hover:text-[var(--text-primary)]'
                }`}
              >
                {range === 'today' ? 'Hoy' : range === 'week' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg bg-[var(--glass)] hover:bg-[var(--glass-border)] transition-colors"
            >
              <Activity className="w-5 h-5 text-[var(--text-mid)]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#DC2626] text-white text-xs flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-[var(--obsidian)] rounded-xl shadow-xl border border-[var(--glass-border)] z-50 overflow-hidden">
                <div className="p-3 border-b border-[var(--glass-border)]">
                  <h3 className="font-semibold text-[var(--text-primary)]">Notificaciones</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`p-3 border-b border-[var(--glass-border)] cursor-pointer hover:bg-[var(--glass)] transition-colors ${
                        !notif.read ? 'bg-[var(--glass)]/50' : ''
                      }`}
                    >
                      <p className="text-sm text-[var(--text-primary)]">{notif.message}</p>
                      <p className="text-xs text-[var(--text-dim)] mt-1">{formatTime(notif.timestamp)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Views */}
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-dim)]">Visitas Totales</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{analytics.totalViews.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  {analytics.viewsChange > 0 ? (
                    <TrendingUp className="w-3 h-3 text-green-500" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-500" />
                  )}
                  <span className={`text-xs ${analytics.viewsChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {analytics.viewsChange > 0 ? '+' : ''}{analytics.viewsChange}%
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Unique Visitors */}
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-dim)]">Visitantes Únicos</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{analytics.uniqueVisitors.toLocaleString()}</p>
                <p className="text-xs text-[var(--text-dim)] mt-1">
                  {timeRange === 'today' ? 'Hoy' : timeRange === 'week' ? 'Esta semana' : 'Este mes'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders */}
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-dim)]">Pedidos Recibidos</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{analytics.ordersReceived}</p>
                <p className="text-xs text-green-500 mt-1">Desde el catálogo</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Clicks */}
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-dim)]">Contactos</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{analytics.contactClicks}</p>
                <p className="text-xs text-[var(--text-dim)] mt-1">WhatsApp/Teléfono</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Package className="w-5 h-5 text-[#F97316]" />
              Productos Más Vistos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-[#FBBF24] text-black' :
                    index === 1 ? 'bg-gray-300 text-black' :
                    index === 2 ? 'bg-amber-600 text-white' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--text-primary)] text-sm truncate">{product.name}</p>
                    <p className="text-xs text-[var(--text-dim)]">{product.views} vistas • {product.addToCartCount} al carrito</p>
                  </div>
                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#F97316] to-[#FBBF24] rounded-full"
                      style={{ width: `${(product.views / analytics.topProducts[0].views) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Categories Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <PieChart className="w-5 h-5 text-[#F97316]" />
              Categorías Populares
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topCategories.map((cat) => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-primary)]">{cat.name}</span>
                    <span className="text-[var(--text-dim)]">{cat.views} vistas ({cat.percentage}%)</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#F97316] to-[#FBBF24] rounded-full transition-all"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity and Device Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#F97316]" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {analytics.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--glass)] transition-colors">
                  <div className="w-8 h-8 rounded-full bg-[var(--glass)] flex items-center justify-center">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--text-primary)]">{activity.details}</p>
                  </div>
                  <span className="text-xs text-[var(--text-dim)] whitespace-nowrap">
                    {formatTime(activity.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#F97316]" />
              Dispositivos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Mobile */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-[var(--text-primary)]">📱 Móvil</span>
                  <span className="text-sm font-bold text-[var(--text-primary)]">{analytics.deviceBreakdown.mobile}%</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] rounded-full"
                    style={{ width: `${analytics.deviceBreakdown.mobile}%` }}
                  />
                </div>
              </div>

              {/* Desktop */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-[var(--text-primary)]">💻 Desktop</span>
                  <span className="text-sm font-bold text-[var(--text-primary)]">{analytics.deviceBreakdown.desktop}%</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] rounded-full"
                    style={{ width: `${analytics.deviceBreakdown.desktop}%` }}
                  />
                </div>
              </div>

              {/* Tablet */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-[var(--text-primary)]">📟 Tablet</span>
                  <span className="text-sm font-bold text-[var(--text-primary)]">{analytics.deviceBreakdown.tablet}%</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#10B981] to-[#34D399] rounded-full"
                    style={{ width: `${analytics.deviceBreakdown.tablet}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Peak Hours */}
            <div className="mt-6 pt-4 border-t border-[var(--glass-border)]">
              <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3">Hora Pico</h4>
              <div className="flex items-end gap-1 h-16">
                {analytics.peakHours.map((hour) => {
                  const maxViews = Math.max(...analytics.peakHours.map(h => h.views));
                  const height = (hour.views / maxViews) * 100;
                  const isPeak = hour.views === maxViews;
                  return (
                    <div
                      key={hour.hour}
                      className={`flex-1 rounded-t transition-all ${
                        isPeak ? 'bg-[#F97316]' : 'bg-[#F97316]/30'
                      }`}
                      style={{ height: `${height}%` }}
                      title={`${hour.hour}:00 - ${hour.views} vistas`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-[var(--text-dim)]">
                <span>8am</span>
                <span>7pm</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Banner */}
      <Card className="bg-gradient-to-r from-[#F97316]/10 to-[#FBBF24]/10 border-[#F97316]/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <div>
                <p className="font-medium text-[var(--text-primary)]">Monitoreo en tiempo real activo</p>
                <p className="text-xs text-[var(--text-dim)]">
                  Recibirás notificaciones cuando alguien vea tu catálogo o haga un pedido
                </p>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
              EN VIVO
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
