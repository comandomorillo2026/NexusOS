'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, Clock, User, ChevronRight, Phone, 
  RefreshCw, CloudOff, Filter, CheckCircle, XCircle,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { ClinicDB, STORES, type OfflineRecord } from '@/lib/offline/db';
import { syncManager } from '@/lib/offline/sync';

// Types
interface Appointment extends OfflineRecord {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  duration: number; // minutes
  type: 'consultation' | 'follow-up' | 'emergency' | 'procedure';
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  doctorId?: string;
  doctorName?: string;
  _synced?: boolean;
}

interface OfflineAppointmentsProps {
  onSelectPatient: (patient: {id: string; name: string}) => void;
}

// Mock appointments for today
const mockAppointments: Appointment[] = [
  {
    id: 'A001',
    patientId: 'P001',
    patientName: 'María González',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    duration: 30,
    type: 'consultation',
    status: 'scheduled',
    doctorName: 'Dr. Rafael Mendez',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
  },
  {
    id: 'A002',
    patientId: 'P002',
    patientName: 'Carlos Rodríguez',
    date: new Date().toISOString().split('T')[0],
    time: '09:30',
    duration: 30,
    type: 'follow-up',
    status: 'confirmed',
    doctorName: 'Dr. Rafael Mendez',
    notes: 'Control de presión arterial',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
  },
  {
    id: 'A003',
    patientId: 'P003',
    patientName: 'Ana Martínez',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    duration: 45,
    type: 'procedure',
    status: 'completed',
    doctorName: 'Dr. Rafael Mendez',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
  },
  {
    id: 'A004',
    patientId: 'P004',
    patientName: 'José Pérez',
    date: new Date().toISOString().split('T')[0],
    time: '10:30',
    duration: 30,
    type: 'consultation',
    status: 'in-progress',
    doctorName: 'Dr. Rafael Mendez',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
  },
  {
    id: 'A005',
    patientId: 'P005',
    patientName: 'Laura Fernández',
    date: new Date().toISOString().split('T')[0],
    time: '11:00',
    duration: 20,
    type: 'follow-up',
    status: 'scheduled',
    doctorName: 'Dr. Rafael Mendez',
    notes: 'Revisión de laboratorios',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
  },
  {
    id: 'A006',
    patientId: 'P006',
    patientName: 'Miguel Santos',
    date: new Date().toISOString().split('T')[0],
    time: '11:30',
    duration: 30,
    type: 'emergency',
    status: 'scheduled',
    doctorName: 'Dr. Rafael Mendez',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
  },
];

export function OfflineAppointments({ onSelectPatient }: OfflineAppointmentsProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activeTab, setActiveTab] = useState('today');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Load appointments
  useEffect(() => {
    const loadAppointments = async () => {
      setLoading(true);
      try {
        // Try to get from IndexedDB first
        const offlineAppointments = await ClinicDB.getAppointments() as Appointment[];
        
        if (offlineAppointments.length > 0) {
          setAppointments(offlineAppointments);
        } else {
          // Use mock data and save to IndexedDB
          for (const appointment of mockAppointments) {
            await ClinicDB.saveAppointment(appointment);
          }
          setAppointments(mockAppointments);
        }
      } catch (error) {
        console.error('Error loading appointments:', error);
        setAppointments(mockAppointments);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();

    // Listen for online/offline
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Group appointments by status
  const groupedAppointments = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(a => a.date === today);
    
    return {
      scheduled: todayAppointments.filter(a => a.status === 'scheduled'),
      confirmed: todayAppointments.filter(a => a.status === 'confirmed'),
      inProgress: todayAppointments.filter(a => a.status === 'in-progress'),
      completed: todayAppointments.filter(a => a.status === 'completed'),
      cancelled: todayAppointments.filter(a => a.status === 'cancelled' || a.status === 'no-show'),
      all: todayAppointments,
    };
  }, [appointments]);

  // Get appointments for current tab
  const currentAppointments = useMemo(() => {
    switch (activeTab) {
      case 'scheduled':
        return [...groupedAppointments.scheduled, ...groupedAppointments.confirmed];
      case 'in-progress':
        return groupedAppointments.inProgress;
      case 'completed':
        return groupedAppointments.completed;
      default:
        return groupedAppointments.all;
    }
  }, [activeTab, groupedAppointments]);

  // Status color mapping
  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500/20 text-blue-400';
      case 'confirmed': return 'bg-violet-500/20 text-violet-400';
      case 'in-progress': return 'bg-amber-500/20 text-amber-400';
      case 'completed': return 'bg-emerald-500/20 text-emerald-400';
      case 'cancelled':
      case 'no-show': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  // Type color mapping
  const getTypeColor = (type: Appointment['type']) => {
    switch (type) {
      case 'consultation': return 'text-blue-400';
      case 'follow-up': return 'text-violet-400';
      case 'emergency': return 'text-red-400';
      case 'procedure': return 'text-amber-400';
      default: return 'text-gray-400';
    }
  };

  // Handle appointment click
  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetails(true);
  };

  // Handle start appointment
  const handleStartAppointment = async (appointment: Appointment) => {
    const updated = { ...appointment, status: 'in-progress' as const };
    await ClinicDB.saveAppointment(updated);
    setAppointments(prev => prev.map(a => a.id === appointment.id ? updated : a));
    onSelectPatient({ id: appointment.patientId, name: appointment.patientName });
  };

  // Handle complete appointment
  const handleCompleteAppointment = async (appointment: Appointment) => {
    const updated = { ...appointment, status: 'completed' as const };
    await ClinicDB.saveAppointment(updated);
    setAppointments(prev => prev.map(a => a.id === appointment.id ? updated : a));
    setShowDetails(false);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0A0820]/95 backdrop-blur-md p-4 border-b border-[rgba(167,139,250,0.2)]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-white">Citas de Hoy</h2>
          <div className="flex items-center gap-2">
            {!isOnline && (
              <Badge className="bg-amber-500/20 text-amber-400 text-xs">
                <CloudOff className="w-3 h-3 mr-1" />
                Offline
              </Badge>
            )}
            <Badge className="bg-violet-500/20 text-violet-400">
              {groupedAppointments.all.length} citas
            </Badge>
          </div>
        </div>

        {/* Date Display */}
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Calendar className="w-4 h-4" />
          <span>
            {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-4 bg-white/5">
            <TabsTrigger value="today" className="text-xs">
              Todas ({groupedAppointments.all.length})
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="text-xs">
              Pendientes ({groupedAppointments.scheduled.length + groupedAppointments.confirmed.length})
            </TabsTrigger>
            <TabsTrigger value="in-progress" className="text-xs">
              En Curso ({groupedAppointments.inProgress.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs">
              Listas ({groupedAppointments.completed.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 text-violet-500 animate-spin" />
              </div>
            ) : currentAppointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">No hay citas en esta categoría</p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentAppointments
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((appointment) => (
                    <button
                      key={appointment.id}
                      onClick={() => handleAppointmentClick(appointment)}
                      className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors touch-manipulation text-left"
                    >
                      <div className="flex items-start gap-3">
                        {/* Time */}
                        <div className="text-center min-w-[60px]">
                          <p className="text-2xl font-bold text-white">
                            {appointment.time}
                          </p>
                          <p className="text-xs text-gray-500">
                            {appointment.duration} min
                          </p>
                        </div>

                        {/* Divider */}
                        <div className="w-px h-14 bg-white/10" />

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white truncate">
                              {appointment.patientName}
                            </p>
                            <Badge className={`${getStatusColor(appointment.status)} text-xs`}>
                              {appointment.status === 'in-progress' ? 'En curso' : 
                               appointment.status === 'completed' ? 'Completada' :
                               appointment.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-sm ${getTypeColor(appointment.type)}`}>
                              {appointment.type === 'consultation' ? 'Consulta' :
                               appointment.type === 'follow-up' ? 'Control' :
                               appointment.type === 'emergency' ? 'Emergencia' : 'Procedimiento'}
                            </span>
                            {appointment.notes && (
                              <>
                                <span className="text-gray-600">•</span>
                                <span className="text-sm text-gray-400 truncate">
                                  {appointment.notes}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Arrow */}
                        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      </div>
                    </button>
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Appointment Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="bg-[#0A0820] border-[rgba(167,139,250,0.2)] max-w-lg mx-4">
          <DialogHeader>
            <DialogTitle className="text-white">Detalles de la Cita</DialogTitle>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-4">
              {/* Patient Info */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {selectedAppointment.patientName.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-white">{selectedAppointment.patientName}</p>
                  <p className="text-sm text-gray-400">ID: {selectedAppointment.patientId}</p>
                </div>
              </div>

              {/* Appointment Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/5">
                  <p className="text-xs text-gray-500 mb-1">Hora</p>
                  <p className="font-semibold text-white">{selectedAppointment.time}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <p className="text-xs text-gray-500 mb-1">Duración</p>
                  <p className="font-semibold text-white">{selectedAppointment.duration} min</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <p className="text-xs text-gray-500 mb-1">Tipo</p>
                  <p className={`font-semibold ${getTypeColor(selectedAppointment.type)}`}>
                    {selectedAppointment.type === 'consultation' ? 'Consulta' :
                     selectedAppointment.type === 'follow-up' ? 'Control' :
                     selectedAppointment.type === 'emergency' ? 'Emergencia' : 'Procedimiento'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <p className="text-xs text-gray-500 mb-1">Estado</p>
                  <Badge className={getStatusColor(selectedAppointment.status)}>
                    {selectedAppointment.status === 'in-progress' ? 'En curso' : 
                     selectedAppointment.status === 'completed' ? 'Completada' :
                     selectedAppointment.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                  </Badge>
                </div>
              </div>

              {/* Notes */}
              {selectedAppointment.notes && (
                <div className="p-3 rounded-xl bg-white/5">
                  <p className="text-xs text-gray-500 mb-1">Notas</p>
                  <p className="text-sm text-gray-300">{selectedAppointment.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {selectedAppointment.status === 'scheduled' || selectedAppointment.status === 'confirmed' ? (
                  <Button
                    onClick={() => handleStartAppointment(selectedAppointment)}
                    className="flex-1 bg-violet-500 hover:bg-violet-600 text-white"
                  >
                    Iniciar Consulta
                  </Button>
                ) : selectedAppointment.status === 'in-progress' ? (
                  <Button
                    onClick={() => handleCompleteAppointment(selectedAppointment)}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Completar
                  </Button>
                ) : null}
                <Button
                  variant="outline"
                  onClick={() => onSelectPatient({ 
                    id: selectedAppointment.patientId, 
                    name: selectedAppointment.patientName 
                  })}
                  className="border-white/20 text-white"
                >
                  Ver Paciente
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default OfflineAppointments;
