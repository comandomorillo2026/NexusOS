"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  ShoppingCart,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Calendar,
  ChefHat,
  Package,
  Truck,
  MessageCircle,
  Phone,
  MapPin,
  User,
  DollarSign,
  Printer,
  RefreshCw,
  MoreVertical,
  Play,
  Pause,
  CheckCircle2,
  AlertCircle,
  Send,
  CreditCard,
  Banknote,
  Smartphone,
  Timer,
  ArrowRight
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variantName?: string;
  notes?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  orderType: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  deliveryAddress?: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  notes?: string;
  pickupDate?: string;
  pickupTime?: string;
  deliveryFee?: number;
  estimatedDelivery?: string;
  createdAt: string;
  items: OrderItem[];
}

// Status timeline configuration
const STATUS_FLOW = [
  { id: 'pending', label: 'Pendiente', icon: Clock, color: 'yellow' },
  { id: 'confirmed', label: 'Confirmado', icon: CheckCircle, color: 'blue' },
  { id: 'preparing', label: 'Preparando', icon: ChefHat, color: 'orange' },
  { id: 'ready', label: 'Listo', icon: Package, color: 'green' },
  { id: 'delivered', label: 'Entregado', icon: CheckCircle2, color: 'emerald' },
];

// Demo orders for display
const DEMO_ORDERS: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2026-0001',
    orderType: 'preorder',
    customerName: 'María García',
    customerPhone: '+1 868 123 4567',
    customerEmail: 'maria@email.com',
    subtotal: 250,
    discount: 0,
    tax: 31.25,
    total: 281.25,
    paymentMethod: 'card',
    paymentStatus: 'paid',
    status: 'preparing',
    pickupDate: '2026-04-03',
    pickupTime: '10:00',
    notes: 'Sin azúcar en el pastel',
    createdAt: new Date().toISOString(),
    items: [
      { id: '1', productName: 'Pastel de Chocolate', quantity: 1, unitPrice: 200, totalPrice: 200 },
      { id: '2', productName: 'Donas x6', quantity: 1, unitPrice: 50, totalPrice: 50 },
    ]
  },
  {
    id: '2',
    orderNumber: 'ORD-2026-0002',
    orderType: 'delivery',
    customerName: 'Carlos Rodríguez',
    customerPhone: '+1 868 987 6543',
    deliveryAddress: '123 Frederick Street, Port of Spain',
    subtotal: 150,
    discount: 15,
    tax: 16.88,
    deliveryFee: 25,
    total: 176.88,
    paymentMethod: 'transfer',
    paymentStatus: 'paid',
    status: 'confirmed',
    estimatedDelivery: '45 min',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    items: [
      { id: '1', productName: 'Pan de Queso x12', quantity: 2, unitPrice: 60, totalPrice: 120 },
      { id: '2', productName: 'Croissants x4', quantity: 1, unitPrice: 30, totalPrice: 30 },
    ]
  },
  {
    id: '3',
    orderNumber: 'ORD-2026-0003',
    orderType: 'POS',
    customerName: 'Cliente Mostrador',
    customerPhone: '',
    subtotal: 75,
    discount: 0,
    tax: 9.38,
    total: 84.38,
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    status: 'completed',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    items: [
      { id: '1', productName: 'Empanadas x6', quantity: 1, unitPrice: 45, totalPrice: 45 },
      { id: '2', productName: 'Café Grande', quantity: 2, unitPrice: 15, totalPrice: 30 },
    ]
  },
];

export function BakeryOrders() {
  const [orders, setOrders] = useState<Order[]>(DEMO_ORDERS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    // In production, fetch from API
    // fetchOrders();
  }, [statusFilter, activeTab]);

  const formatCurrency = (amount: number) => {
    return `TT$${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      confirmed: "bg-blue-100 text-blue-700 border-blue-200",
      preparing: "bg-orange-100 text-orange-700 border-orange-200",
      ready: "bg-green-100 text-green-700 border-green-200",
      delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
      completed: "bg-gray-100 text-gray-700 border-gray-200",
      cancelled: "bg-red-100 text-red-700 border-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pendiente",
      confirmed: "Confirmado",
      preparing: "Preparando",
      ready: "Listo",
      delivered: "Entregado",
      completed: "Completado",
      cancelled: "Cancelado",
    };
    return labels[status] || status;
  };

  const getOrderTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      POS: "Mostrador",
      preorder: "Pre-orden",
      delivery: "Delivery",
      wholesale: "Mayorista",
    };
    return labels[type] || type;
  };

  const getOrderTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      POS: "bg-purple-100 text-purple-700",
      preorder: "bg-blue-100 text-blue-700",
      delivery: "bg-green-100 text-green-700",
      wholesale: "bg-amber-100 text-amber-700",
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "cash": return <Banknote className="w-4 h-4" />;
      case "card": return <CreditCard className="w-4 h-4" />;
      case "transfer": return <Smartphone className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  // Send WhatsApp message
  const sendWhatsApp = (phone: string, order: Order) => {
    const message = `🧁 *NexusOS Bakery*\n\n` +
      `Hola ${order.customerName}! Tu pedido *${order.orderNumber}* está siendo procesado.\n\n` +
      `📦 *Estado:* ${getStatusLabel(order.status)}\n` +
      `💰 *Total:* ${formatCurrency(order.total)}\n\n` +
      `¡Gracias por tu compra! 🙏`;
    
    const cleanPhone = phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    toast.success('Abriendo WhatsApp...');
  };

  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, status: newStatus } : o
    ));
    toast.success(`Estado actualizado a "${getStatusLabel(newStatus)}"`);
  };

  // Print order
  const printOrder = (order: Order) => {
    const content = `
========================================
         NEXUSOS BAKERY
========================================
Orden: ${order.orderNumber}
Fecha: ${formatDate(order.createdAt)}
Cliente: ${order.customerName}
Tel: ${order.customerPhone || 'N/A'}
----------------------------------------
${order.items.map(item => 
  `${item.productName} x${item.quantity}  TT$${item.totalPrice.toFixed(2)}`
).join('\n')}
----------------------------------------
Subtotal:    TT$${order.subtotal.toFixed(2)}
${order.discount > 0 ? `Descuento:   -TT$${order.discount.toFixed(2)}\n` : ''}VAT (12.5%): TT$${order.tax.toFixed(2)}
${order.deliveryFee ? `Delivery:    TT$${order.deliveryFee.toFixed(2)}\n` : ''}----------------------------------------
TOTAL:       TT$${order.total.toFixed(2)}
========================================
      ¡Gracias por su compra!
========================================
    `;
    
    navigator.clipboard.writeText(content);
    toast.success('Recibo copiado al portapapeles');
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.customerName.toLowerCase().includes(search.toLowerCase()) ||
      (order.customerPhone && order.customerPhone.includes(search));
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'active' && ['pending', 'confirmed', 'preparing'].includes(order.status)) ||
      (activeTab === 'ready' && order.status === 'ready') ||
      (activeTab === 'completed' && ['completed', 'delivered'].includes(order.status));
    
    return matchesSearch && matchesStatus && matchesTab;
  });

  // Stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    todayRevenue: orders.reduce((sum, o) => sum + o.total, 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-yellow-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        <div className="p-4 rounded-xl bg-orange-50 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-orange-600">Preparando</p>
              <p className="text-2xl font-bold text-orange-700">{stats.preparing}</p>
            </div>
            <ChefHat className="w-8 h-8 text-orange-400" />
          </div>
        </div>
        <div className="p-4 rounded-xl bg-green-50 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-600">Listos</p>
              <p className="text-2xl font-bold text-green-700">{stats.ready}</p>
            </div>
            <Package className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-600">Total Hoy</p>
              <p className="text-2xl font-bold text-purple-700">{stats.total}</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        <div className="p-4 rounded-xl bg-[#F97316]/10 border border-[#F97316]/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#F97316]">Ingresos Hoy</p>
              <p className="text-2xl font-bold text-[#F97316]">{formatCurrency(stats.todayRevenue)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-[#F97316]" />
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pedidos</h2>
          <p className="text-gray-500">Gestión completa de pedidos con WhatsApp</p>
        </div>
        <Button onClick={() => toast.success('Actualizado')} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Tabs & Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="active">Activos</TabsTrigger>
                <TabsTrigger value="ready">Listos</TabsTrigger>
                <TabsTrigger value="completed">Completados</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por número, cliente o teléfono..."
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="preparing">Preparando</SelectItem>
                  <SelectItem value="ready">Listo</SelectItem>
                  <SelectItem value="delivered">Entregado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Grid */}
      <div className="grid gap-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="flex flex-col md:flex-row">
              {/* Status Bar */}
              <div className={`w-full md:w-2 h-2 md:h-auto ${
                order.status === 'pending' ? 'bg-yellow-400' :
                order.status === 'confirmed' ? 'bg-blue-400' :
                order.status === 'preparing' ? 'bg-orange-400' :
                order.status === 'ready' ? 'bg-green-400' :
                order.status === 'delivered' ? 'bg-emerald-400' :
                'bg-gray-400'
              }`} />
              
              <div className="flex-1 p-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#F97316]/10 flex items-center justify-center">
                      {order.orderType === 'delivery' ? (
                        <Truck className="w-6 h-6 text-[#F97316]" />
                      ) : order.orderType === 'preorder' ? (
                        <Calendar className="w-6 h-6 text-[#F97316]" />
                      ) : (
                        <ShoppingCart className="w-6 h-6 text-[#F97316]" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-mono font-bold text-gray-900">{order.orderNumber}</p>
                        <Badge className={getOrderTypeColor(order.orderType)}>
                          {getOrderTypeLabel(order.orderType)}
                        </Badge>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {order.customerName}
                        </span>
                        {order.customerPhone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {order.customerPhone}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          {getPaymentIcon(order.paymentMethod)}
                          {order.paymentMethod === 'cash' ? 'Efectivo' : 
                           order.paymentMethod === 'card' ? 'Tarjeta' : 'Transfer'}
                        </span>
                      </div>
                      {order.pickupDate && (
                        <p className="text-sm text-gray-500 mt-1">
                          📅 Recogida: {order.pickupDate} a las {order.pickupTime}
                        </p>
                      )}
                      {order.deliveryAddress && (
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {order.deliveryAddress}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Total & Actions */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{order.items.length} items</p>
                      <p className="text-2xl font-bold text-[#F97316]">{formatCurrency(order.total)}</p>
                    </div>
                    <div className="flex gap-2">
                      {order.status === 'pending' && (
                        <Button 
                          size="sm" 
                          className="bg-blue-500 hover:bg-blue-600"
                          onClick={() => updateOrderStatus(order.id, 'confirmed')}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Confirmar
                        </Button>
                      )}
                      {order.status === 'confirmed' && (
                        <Button 
                          size="sm" 
                          className="bg-orange-500 hover:bg-orange-600"
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                        >
                          <ChefHat className="w-4 h-4 mr-1" />
                          Preparar
                        </Button>
                      )}
                      {order.status === 'preparing' && (
                        <Button 
                          size="sm" 
                          className="bg-green-500 hover:bg-green-600"
                          onClick={() => updateOrderStatus(order.id, 'ready')}
                        >
                          <Package className="w-4 h-4 mr-1" />
                          Listo
                        </Button>
                      )}
                      {order.status === 'ready' && (
                        <Button 
                          size="sm" 
                          className="bg-emerald-500 hover:bg-emerald-600"
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Entregado
                        </Button>
                      )}
                      {order.customerPhone && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => sendWhatsApp(order.customerPhone!, order)}
                          className="border-green-300 text-green-600 hover:bg-green-50"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => printOrder(order)}
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {order.items.slice(0, 4).map((item) => (
                      <span 
                        key={item.id}
                        className="px-2 py-1 rounded-lg bg-gray-100 text-sm text-gray-600"
                      >
                        {item.productName} x{item.quantity}
                      </span>
                    ))}
                    {order.items.length > 4 && (
                      <span className="px-2 py-1 rounded-lg bg-gray-100 text-sm text-gray-500">
                        +{order.items.length - 4} más
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {filteredOrders.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-64 text-gray-500">
              <ShoppingCart className="h-12 w-12 mb-4 text-gray-300" />
              <p>No se encontraron pedidos</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Order Detail Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Pedido {selectedOrder?.orderNumber}</span>
              {selectedOrder && (
                <Badge className={getStatusColor(selectedOrder.status)}>
                  {getStatusLabel(selectedOrder.status)}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              {/* Status Timeline */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                {STATUS_FLOW.map((step, index) => {
                  const currentIndex = STATUS_FLOW.findIndex(s => s.id === selectedOrder.status);
                  const isActive = index <= currentIndex;
                  const isCurrent = step.id === selectedOrder.status;
                  
                  return (
                    <div key={step.id} className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isActive 
                          ? step.color === 'yellow' ? 'bg-yellow-400 text-white' :
                            step.color === 'blue' ? 'bg-blue-400 text-white' :
                            step.color === 'orange' ? 'bg-orange-400 text-white' :
                            step.color === 'green' ? 'bg-green-400 text-white' :
                            'bg-emerald-400 text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}>
                        <step.icon className="w-4 h-4" />
                      </div>
                      <p className={`text-xs mt-1 ${isActive ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Cliente</p>
                  <p className="font-medium">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Teléfono</p>
                  <p className="font-medium">{selectedOrder.customerPhone || "-"}</p>
                </div>
                {selectedOrder.pickupDate && (
                  <div>
                    <p className="text-sm text-gray-500">Fecha de Recogida</p>
                    <p className="font-medium">{selectedOrder.pickupDate}</p>
                  </div>
                )}
                {selectedOrder.pickupTime && (
                  <div>
                    <p className="text-sm text-gray-500">Hora de Recogida</p>
                    <p className="font-medium">{selectedOrder.pickupTime}</p>
                  </div>
                )}
              </div>

              {/* Items */}
              <div>
                <h4 className="font-medium mb-2">Items del Pedido</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-3 bg-white border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        {item.variantName && (
                          <p className="text-sm text-gray-500">{item.variantName}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {item.quantity} x {formatCurrency(item.unitPrice)}
                        </p>
                        <p className="font-bold text-[#F97316]">
                          {formatCurrency(item.totalPrice)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Descuento</span>
                    <span className="text-green-600">-{formatCurrency(selectedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">VAT (12.5%)</span>
                  <span>{formatCurrency(selectedOrder.tax)}</span>
                </div>
                {selectedOrder.deliveryFee && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Delivery</span>
                    <span>{formatCurrency(selectedOrder.deliveryFee)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span className="text-[#F97316]">{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm font-medium text-yellow-700">Notas:</p>
                  <p className="text-sm text-yellow-600">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                {selectedOrder.customerPhone && (
                  <Button 
                    className="flex-1 bg-green-500 hover:bg-green-600"
                    onClick={() => sendWhatsApp(selectedOrder.customerPhone!, selectedOrder)}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => printOrder(selectedOrder)}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
