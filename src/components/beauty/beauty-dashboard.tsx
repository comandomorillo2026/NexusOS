"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Scissors,
  Clock,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Package,
  RefreshCw,
  Loader2,
  Plus,
} from "lucide-react";

// Types
interface BeautyAppointment {
  id: string;
  appointmentNumber: string;
  clientName: string;
  clientPhone: string;
  date: string;
  startTime: string;
  endTime: string;
  services: string;
  staffName: string;
  status: string;
}

interface DashboardStats {
  todaySales: number;
  yesterdaySales: number;
  salesChange: number;
  clientsToday: number;
  scheduledAppointments: number;
  averageTicket: number;
  servicesCompleted: number;
  productsSold: number;
}

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down";
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}

function StatCard({ title, value, change, trend, icon, color, loading }: StatCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            {loading ? (
              <div className="h-8 w-20 bg-gray-200 animate-pulse rounded mt-1" />
            ) : (
              <p className="text-2xl font-bold mt-1">{value}</p>
            )}
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
                  {change}
                </span>
                <span className="text-sm text-gray-400">vs ayer</span>
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

interface AppointmentRowProps {
  time: string;
  client: string;
  service: string;
  staff: string;
  status: "confirmed" | "pending" | "in-progress" | "completed" | "cancelled";
}

function AppointmentRow({
  time,
  client,
  service,
  staff,
  status,
}: AppointmentRowProps) {
  const statusConfig: Record<string, { label: string; color: string }> = {
    confirmed: { label: "Confirmada", color: "bg-green-100 text-green-700" },
    pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-700" },
    "in-progress": { label: "En Progreso", color: "bg-blue-100 text-blue-700" },
    completed: { label: "Completada", color: "bg-purple-100 text-purple-700" },
    cancelled: { label: "Cancelada", color: "bg-red-100 text-red-700" },
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-4">
        <div className="w-16 text-sm font-medium text-gray-600">{time}</div>
        <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
          <span className="text-pink-600 font-medium text-sm">
            {client
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)}
          </span>
        </div>
        <div>
          <p className="font-medium text-gray-900">{client}</p>
          <p className="text-sm text-gray-500">{service}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">{staff}</span>
        <Badge className={statusConfig[status]?.color || statusConfig.pending.color}>
          {statusConfig[status]?.label || "Pendiente"}
        </Badge>
      </div>
    </div>
  );
}

interface StaffPerformanceProps {
  name: string;
  role: string;
  clients: number;
  revenue: number;
  commission: number;
  rating: number;
  avatar: string;
}

function StaffPerformance({
  name,
  role,
  clients,
  revenue,
  commission,
  rating,
  avatar,
}: StaffPerformanceProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium">
          {avatar}
        </div>
        <div>
          <p className="font-medium text-gray-900">{name}</p>
          <p className="text-sm text-gray-500">{role}</p>
        </div>
      </div>
      <div className="flex items-center gap-6 text-sm">
        <div className="text-center">
          <p className="font-medium">{clients}</p>
          <p className="text-gray-500">Clientes</p>
        </div>
        <div className="text-center">
          <p className="font-medium">TT${revenue.toLocaleString()}</p>
          <p className="text-gray-500">Ventas</p>
        </div>
        <div className="text-center">
          <p className="font-medium text-green-600">TT${commission}</p>
          <p className="text-gray-500">Comisión</p>
        </div>
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 text-yellow-400 fill-current" />
          <span className="font-medium">{rating}</span>
        </div>
      </div>
    </div>
  );
}

export function BeautyDashboard() {
  const [period, setPeriod] = useState<"today" | "week" | "month">("today");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Data states
  const [appointments, setAppointments] = useState<BeautyAppointment[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 0,
    yesterdaySales: 0,
    salesChange: 0,
    clientsToday: 0,
    scheduledAppointments: 0,
    averageTicket: 0,
    servicesCompleted: 0,
    productsSold: 0,
  });

  // Get tenant ID from localStorage
  const getTenantId = useCallback(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('nexus_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.tenantId || 'demo-tenant';
      }
    }
    return 'demo-tenant';
  }, []);

  // Fetch dashboard data
  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const tenantId = getTenantId();
      const today = new Date().toISOString().split('T')[0];

      // Fetch appointments
      const appointmentsRes = await fetch(`/api/beauty/appointments?tenantId=${tenantId}&date=${today}`);
      const appointmentsData = await appointmentsRes.json();
      
      if (appointmentsData.success && appointmentsData.appointments) {
        setAppointments(appointmentsData.appointments);
        
        // Calculate stats from appointments
        const todayCount = appointmentsData.appointments.length;
        const completed = appointmentsData.appointments.filter(
          (a: BeautyAppointment) => a.status === 'completed'
        ).length;
        
        setStats(prev => ({
          ...prev,
          scheduledAppointments: todayCount,
          servicesCompleted: completed,
          clientsToday: todayCount,
        }));
      }

      // Fetch staff
      const staffRes = await fetch(`/api/beauty/staff?tenantId=${tenantId}`);
      // Note: Staff data would be used to show staff performance

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Use demo data on error
      setStats({
        todaySales: 7850,
        yesterdaySales: 7000,
        salesChange: 12.5,
        clientsToday: 41,
        scheduledAppointments: 28,
        averageTicket: 191,
        servicesCompleted: 23,
        productsSold: 12,
      });
      setAppointments([
        { id: '1', appointmentNumber: 'APT-001', clientName: 'María González', clientPhone: '+1 868 555-0001', date: today, startTime: '09:00', endTime: '10:00', services: 'Corte + Tinte', staffName: 'Ana García', status: 'confirmed' },
        { id: '2', appointmentNumber: 'APT-002', clientName: 'Carlos Pérez', clientPhone: '+1 868 555-0002', date: today, startTime: '10:30', endTime: '11:00', services: 'Corte Caballero', staffName: 'Pedro López', status: 'in-progress' },
        { id: '3', appointmentNumber: 'APT-003', clientName: 'Laura Rodríguez', clientPhone: '+1 868 555-0003', date: today, startTime: '11:00', endTime: '12:00', services: 'Manicure + Pedicure', staffName: 'Sofía Martínez', status: 'pending' },
        { id: '4', appointmentNumber: 'APT-004', clientName: 'Ana Martínez', clientPhone: '+1 868 555-0004', date: today, startTime: '12:00', endTime: '13:00', services: 'Tratamiento Facial', staffName: 'Carmen Ruiz', status: 'confirmed' },
        { id: '5', appointmentNumber: 'APT-005', clientName: 'Roberto Silva', clientPhone: '+1 868 555-0005', date: today, startTime: '14:30', endTime: '15:00', services: 'Barba + Corte', staffName: 'Pedro López', status: 'pending' },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getTenantId]);

  // Load data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const staffPerformance = [
    {
      name: "Ana García",
      role: "Estilista Senior",
      clients: 12,
      revenue: 2400,
      commission: 480,
      rating: 4.9,
      avatar: "AG",
    },
    {
      name: "Pedro López",
      role: "Barbero",
      clients: 15,
      revenue: 1800,
      commission: 360,
      rating: 4.8,
      avatar: "PL",
    },
    {
      name: "Sofía Martínez",
      role: "Técnica de Uñas",
      clients: 8,
      revenue: 1600,
      commission: 320,
      rating: 5.0,
      avatar: "SM",
    },
    {
      name: "Carmen Ruiz",
      role: "Esteticista",
      clients: 6,
      revenue: 1200,
      commission: 240,
      rating: 4.7,
      avatar: "CR",
    },
  ];

  // Calculate percentage for progress bars
  const occupationPercent = stats.scheduledAppointments > 0 
    ? Math.min((stats.servicesCompleted / stats.scheduledAppointments) * 100, 100) 
    : 0;
  
  const salesGoal = 10000;
  const salesPercent = (stats.todaySales / salesGoal) * 100;

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => fetchData(true)}
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Ventas del Día"
          value={`TT$${stats.todaySales.toLocaleString()}`}
          change={`${Math.abs(stats.salesChange).toFixed(1)}%`}
          trend={stats.salesChange >= 0 ? "up" : "down"}
          icon={<DollarSign className="h-6 w-6" />}
          color="#EC4899"
          loading={loading}
        />
        <StatCard
          title="Clientes Hoy"
          value={stats.clientsToday.toString()}
          change={`+${stats.clientsToday}`}
          trend="up"
          icon={<Users className="h-6 w-6" />}
          color="#8B5CF6"
          loading={loading}
        />
        <StatCard
          title="Citas Programadas"
          value={stats.scheduledAppointments.toString()}
          icon={<Calendar className="h-6 w-6" />}
          color="#F59E0B"
          loading={loading}
        />
        <StatCard
          title="Ticket Promedio"
          value={`TT$${stats.averageTicket}`}
          change="+5.2%"
          trend="up"
          icon={<CreditCard className="h-6 w-6" />}
          color="#10B981"
          loading={loading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Appointments */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-pink-500" />
              Citas de Hoy
            </CardTitle>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Nueva Cita
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-pink-500" />
                <p className="text-gray-500 mt-4">Cargando citas...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No hay citas programadas para hoy</p>
                <Button className="mt-4 bg-pink-500 hover:bg-pink-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Agendar Cita
                </Button>
              </div>
            ) : (
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {appointments.map((apt) => (
                  <AppointmentRow 
                    key={apt.id}
                    time={apt.startTime}
                    client={apt.clientName}
                    service={apt.services}
                    staff={apt.staffName}
                    status={apt.status as any}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">
              Resumen del Día
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Ocupación</span>
                <span className="font-medium">{occupationPercent.toFixed(0)}%</span>
              </div>
              <Progress value={occupationPercent} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Servicios Completados</span>
                <span className="font-medium">{stats.servicesCompleted}/{stats.scheduledAppointments || stats.clientsToday}</span>
              </div>
              <Progress value={occupationPercent} className="h-2 bg-gray-200 [&>div]:bg-green-500" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Meta de Ventas</span>
                <span className="font-medium">TT$${stats.todaySales.toLocaleString()} / TT$${salesGoal.toLocaleString()}</span>
              </div>
              <Progress value={salesPercent} className="h-2 bg-gray-200 [&>div]:bg-pink-500" />
            </div>

            <div className="pt-4 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-pink-50 rounded-lg">
                  <Scissors className="h-5 w-5 mx-auto text-pink-500 mb-1" />
                  <p className="text-2xl font-bold text-gray-900">{stats.servicesCompleted}</p>
                  <p className="text-xs text-gray-500">Servicios</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <Package className="h-5 w-5 mx-auto text-purple-500 mb-1" />
                  <p className="text-2xl font-bold text-gray-900">{stats.productsSold}</p>
                  <p className="text-xs text-gray-500">Productos</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff Performance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-500" />
            Rendimiento del Equipo
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={period === "today" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("today")}
              className={period === "today" ? "bg-pink-500 hover:bg-pink-600" : ""}
            >
              Hoy
            </Button>
            <Button
              variant={period === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("week")}
              className={period === "week" ? "bg-pink-500 hover:bg-pink-600" : ""}
            >
              Semana
            </Button>
            <Button
              variant={period === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("month")}
              className={period === "month" ? "bg-pink-500 hover:bg-pink-600" : ""}
            >
              Mes
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {staffPerformance.map((staff, index) => (
              <StaffPerformance key={index} {...staff} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Expense Alerts & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              Alertas de Gastos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div>
                <p className="font-medium text-red-700">Alquiler - Vence en 3 días</p>
                <p className="text-sm text-red-600">TT$8,500 mensual</p>
              </div>
              <Button size="sm" variant="outline" className="border-red-200 text-red-700">
                Pagar
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="font-medium text-yellow-700">Electricidad - Por vencer</p>
                <p className="text-sm text-yellow-600">TT$1,200 estimado</p>
              </div>
              <Button size="sm" variant="outline" className="border-yellow-200 text-yellow-700">
                Ver
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-blue-700">Mantenimiento AC - Programado</p>
                <p className="text-sm text-blue-600">TT$800 - 15 del mes</p>
              </div>
              <Button size="sm" variant="outline" className="border-blue-200 text-blue-700">
                Detalles
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-500" />
              Stock Bajo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Package className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Shampoo Profesional 1L</p>
                  <p className="text-sm text-orange-600">Quedan 2 unidades</p>
                </div>
              </div>
              <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                Reordenar
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Package className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Tinte Rubio Ceniza</p>
                  <p className="text-sm text-orange-600">Quedan 3 unidades</p>
                </div>
              </div>
              <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                Reordenar
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Package className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Esmalte Rojo Classic</p>
                  <p className="text-sm text-orange-600">Quedan 5 unidades</p>
                </div>
              </div>
              <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                Reordenar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
