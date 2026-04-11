'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Calendar, DollarSign, Clock, AlertCircle, Loader2, RefreshCw, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Appointment {
  id: string;
  patientName: string;
  startTime: string;
  type: string;
  status: string;
  date: string;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  patientNumber: string;
  updatedAt: string;
}

interface DashboardStats {
  todayAppointments: number;
  pendingAppointments: number;
  totalPatients: number;
  newPatientsThisMonth: number;
  monthlyRevenue: number;
  revenueChange: number;
  averageWaitTime: number;
}

function StatCard({ title, value, subtitle, icon: Icon, color, loading }: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  color: 'violet' | 'gold' | 'aqua' | 'success';
  loading?: boolean;
}) {
  const colors = {
    violet: 'from-[var(--nexus-violet)] to-[var(--nexus-fuchsia)]',
    gold: 'from-[var(--nexus-gold)] to-[#d97706]',
    aqua: 'from-[var(--nexus-aqua)] to-[var(--nexus-blue)]',
    success: 'from-[var(--success)] to-[#059669]',
  };

  return (
    <div className="glass-card p-4 md:p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[var(--text-mid)] text-sm">{title}</p>
          {loading ? (
            <div className="h-8 w-20 bg-[var(--glass)] animate-pulse rounded mt-1" />
          ) : (
            <p className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mt-1" style={{ fontFamily: 'var(--font-dm-mono)' }}>
              {value}
            </p>
          )}
          {subtitle && <p className="text-xs text-[var(--text-dim)] mt-1">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center`}>
          <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function TodayAppointments({ appointments, loading, onNewAppointment }: { 
  appointments: Appointment[]; 
  loading: boolean;
  onNewAppointment: () => void;
}) {
  const statusColors: Record<string, string> = {
    confirmed: 'bg-[var(--success)]/10 text-[var(--success)]',
    scheduled: 'bg-[var(--nexus-gold)]/10 text-[var(--nexus-gold)]',
    pending: 'bg-[var(--nexus-gold)]/10 text-[var(--nexus-gold)]',
    completed: 'bg-[var(--nexus-violet)]/10 text-[var(--nexus-violet-lite)]',
    cancelled: 'bg-[var(--error)]/10 text-[var(--error)]',
  };

  const statusLabels: Record<string, string> = {
    confirmed: 'Confirmada',
    scheduled: 'Programada',
    pending: 'Pendiente',
    completed: 'Completada',
    cancelled: 'Cancelada',
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' });

  return (
    <div className="glass-card p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Citas de Hoy</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--text-dim)]">{today}</span>
          <Button size="sm" variant="outline" onClick={onNewAppointment}>
            <Plus className="w-4 h-4 mr-1" />
            Nueva
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-[var(--glass)]">
              <div className="w-14 h-5 bg-[var(--glass-border)] animate-pulse rounded" />
              <div className="flex-1">
                <div className="h-4 w-32 bg-[var(--glass-border)] animate-pulse rounded mb-1" />
                <div className="h-3 w-24 bg-[var(--glass-border)] animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 mx-auto text-[var(--text-dim)] mb-3" />
          <p className="text-[var(--text-mid)]">No hay citas programadas para hoy</p>
          <Button variant="outline" className="mt-3" onClick={onNewAppointment}>
            <Plus className="w-4 h-4 mr-2" />
            Agendar Cita
          </Button>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {appointments.map((apt) => (
            <div key={apt.id} className="flex items-center gap-4 p-3 rounded-lg bg-[var(--glass)] hover:bg-[var(--nexus-violet)]/5 transition-colors cursor-pointer">
              <div className="w-14 text-center">
                <span className="text-sm font-mono text-[var(--nexus-violet-lite)]">
                  {apt.startTime || '--:--'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {apt.patientName || 'Paciente'}
                </p>
                <p className="text-xs text-[var(--text-dim)]">{apt.type || 'Consulta'}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${statusColors[apt.status] || statusColors.pending}`}>
                {statusLabels[apt.status] || 'Pendiente'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RecentPatients({ patients, loading }: { patients: Patient[]; loading: boolean }) {
  const getInitials = (patient: Patient) => {
    if (patient.firstName && patient.lastName) {
      return `${patient.firstName[0]}${patient.lastName[0]}`;
    }
    if (patient.fullName) {
      return patient.fullName.split(' ').map(n => n[0]).join('').substring(0, 2);
    }
    return 'P';
  };

  const getLastVisit = (updatedAt: string) => {
    const date = new Date(updatedAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="glass-card p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Pacientes Recientes</h3>
      </div>
      
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-[var(--glass-border)] animate-pulse" />
              <div className="flex-1">
                <div className="h-4 w-32 bg-[var(--glass-border)] animate-pulse rounded mb-1" />
                <div className="h-3 w-20 bg-[var(--glass-border)] animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : patients.length === 0 ? (
        <div className="text-center py-6">
          <Users className="w-10 h-10 mx-auto text-[var(--text-dim)] mb-2" />
          <p className="text-sm text-[var(--text-mid)]">No hay pacientes registrados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {patients.slice(0, 5).map((patient) => (
            <div key={patient.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--glass)] transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--nexus-violet)] to-[var(--nexus-fuchsia)] flex items-center justify-center">
                <span className="text-white font-medium text-sm">{getInitials(patient)}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {patient.fullName || `${patient.firstName} ${patient.lastName}`}
                </p>
                <p className="text-xs text-[var(--text-dim)]">
                  Última visita: {getLastVisit(patient.updatedAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function QuickActions({ onAction }: { onAction: (action: string) => void }) {
  const actions = [
    { label: 'Nueva Cita', icon: Calendar, action: 'appointment', color: 'nexus-violet' },
    { label: 'Nuevo Paciente', icon: Users, action: 'patient', color: 'nexus-aqua' },
    { label: 'Nueva Factura', icon: DollarSign, action: 'invoice', color: 'nexus-gold' },
  ];

  return (
    <div className="glass-card p-4 md:p-6">
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Acciones Rápidas</h3>
      <div className="space-y-2">
        {actions.map((action) => (
          <button
            key={action.action}
            onClick={() => onAction(action.action)}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-[var(--glass)] hover:bg-[var(--nexus-violet)]/10 transition-colors text-left"
          >
            <div className={`w-10 h-10 rounded-lg bg-[var(--${action.color})]/20 flex items-center justify-center`}>
              <action.icon className="w-5 h-5 text-[var(--${action.color})]" />
            </div>
            <span className="text-[var(--text-primary)]">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Alerts({ pendingConfirmations, overdueInvoices, pendingLabs }: { 
  pendingConfirmations: number; 
  overdueInvoices: number; 
  pendingLabs: number; 
}) {
  if (pendingConfirmations === 0 && overdueInvoices === 0 && pendingLabs === 0) {
    return null;
  }

  return (
    <div className="glass-card p-4 border-l-4 border-l-[var(--nexus-gold)] bg-[var(--nexus-gold)]/5">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-[var(--nexus-gold)] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">Recordatorios</p>
          <ul className="text-xs text-[var(--text-mid)] mt-1 space-y-1">
            {pendingConfirmations > 0 && (
              <li>• {pendingConfirmations} paciente{pendingConfirmations !== 1 ? 's' : ''} con citas pendientes de confirmar</li>
            )}
            {overdueInvoices > 0 && (
              <li>• {overdueInvoices} factura{overdueInvoices !== 1 ? 's' : ''} vencidas por cobrar</li>
            )}
            {pendingLabs > 0 && (
              <li>• {pendingLabs} resultado{pendingLabs !== 1 ? 's' : ''} de laboratorio pendiente{pendingLabs !== 1 ? 's' : ''}</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function ClinicDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    pendingAppointments: 0,
    totalPatients: 0,
    newPatientsThisMonth: 0,
    monthlyRevenue: 0,
    revenueChange: 0,
    averageWaitTime: 12,
  });

  // Get tenant ID from localStorage
  const getTenantId = () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('nexus_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.tenantId || 'demo-tenant';
      }
    }
    return 'demo-tenant';
  };

  // Fetch dashboard data
  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const tenantId = getTenantId();
      const today = new Date().toISOString().split('T')[0];

      // Fetch appointments for today
      const appointmentsRes = await fetch(`/api/clinic/appointments?tenantId=${tenantId}&date=${today}`);
      const appointmentsData = await appointmentsRes.json();
      
      if (appointmentsData.success && appointmentsData.appointments) {
        setAppointments(appointmentsData.appointments.map((apt: any) => ({
          id: apt.id,
          patientName: apt.patientName || apt.patient?.fullName || 'Paciente',
          startTime: apt.startTime,
          type: apt.type || apt.title || 'Consulta',
          status: apt.status,
          date: apt.date,
        })));
      }

      // Fetch recent patients
      const patientsRes = await fetch(`/api/clinic/patients?tenantId=${tenantId}`);
      const patientsData = await patientsRes.json();
      
      if (patientsData.success && patientsData.patients) {
        setPatients(patientsData.patients);
        
        // Calculate stats
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const newThisMonth = patientsData.patients.filter((p: Patient) => {
          const created = new Date(p.updatedAt);
          return created >= firstDayOfMonth;
        }).length;

        setStats(prev => ({
          ...prev,
          todayAppointments: appointmentsData.appointments?.length || 0,
          pendingAppointments: appointmentsData.appointments?.filter((a: any) => 
            a.status === 'scheduled' || a.status === 'pending'
          ).length || 0,
          totalPatients: patientsData.patients.length,
          newPatientsThisMonth: newThisMonth,
        }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Use demo data on error
      setAppointments([
        { id: '1', patientName: 'María González', startTime: '09:00', type: 'Consulta General', status: 'confirmed', date: today },
        { id: '2', patientName: 'Carlos Rodríguez', startTime: '10:30', type: 'Seguimiento', status: 'confirmed', date: today },
        { id: '3', patientName: 'Ana Martínez', startTime: '11:00', type: 'Laboratorio', status: 'pending', date: today },
        { id: '4', patientName: 'José Pérez', startTime: '14:00', type: 'Consulta Especializada', status: 'confirmed', date: today },
        { id: '5', patientName: 'Laura Sánchez', startTime: '15:30', type: 'Revisión', status: 'pending', date: today },
      ]);
      setStats({
        todayAppointments: 12,
        pendingAppointments: 3,
        totalPatients: 487,
        newPatientsThisMonth: 15,
        monthlyRevenue: 24500,
        revenueChange: 8,
        averageWaitTime: 12,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Handle quick actions
  const handleQuickAction = (action: string) => {
    // Dispatch custom event to notify parent component
    window.dispatchEvent(new CustomEvent('clinic-quick-action', { detail: action }));
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchData(true);
  };

  return (
    <>
      {/* Header with refresh button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Alerts */}
      <div className="mb-6">
        <Alerts 
          pendingConfirmations={stats.pendingAppointments}
          overdueInvoices={0}
          pendingLabs={0}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard
          title="Citas Hoy"
          value={stats.todayAppointments.toString()}
          subtitle={stats.pendingAppointments > 0 ? `${stats.pendingAppointments} pendientes` : 'Todas confirmadas'}
          icon={Calendar}
          color="violet"
          loading={loading}
        />
        <StatCard
          title="Pacientes"
          value={stats.totalPatients.toString()}
          subtitle={`+${stats.newPatientsThisMonth} este mes`}
          icon={Users}
          color="aqua"
          loading={loading}
        />
        <StatCard
          title="Ingresos Mes"
          value={`TT$${stats.monthlyRevenue.toLocaleString()}`}
          subtitle={stats.revenueChange > 0 ? `+${stats.revenueChange}% vs anterior` : 'Sin cambios'}
          icon={DollarSign}
          color="gold"
          loading={loading}
        />
        <StatCard
          title="Tiempo Espera"
          value={`${stats.averageWaitTime} min`}
          subtitle="Promedio"
          icon={Clock}
          color="success"
          loading={loading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          <TodayAppointments 
            appointments={appointments} 
            loading={loading}
            onNewAppointment={() => handleQuickAction('appointment')}
          />
        </div>
        <div className="space-y-4 md:space-y-6">
          <QuickActions onAction={handleQuickAction} />
          <RecentPatients patients={patients} loading={loading} />
        </div>
      </div>
    </>
  );
}
