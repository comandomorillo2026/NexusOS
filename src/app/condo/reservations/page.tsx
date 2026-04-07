'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Calendar,
  Clock,
  Users,
  DollarSign,
  Plus,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Waves,
  Dumbbell,
  PartyPopper,
  UtensilsCrossed,
  Building2,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuroraBackground, CondoHeader, StatCard, StatusBadge, PageLoader, CondoCard } from '@/components/condo';

// Types
interface Amenity {
  id: string;
  name: string;
  type: string;
  description?: string;
  location?: string;
  capacity?: number;
  openTime?: string;
  closeTime?: string;
  requiresReservation: boolean;
  maxReservationHours?: number;
  reservationFee: number;
  depositRequired: number;
  rules?: string;
  isActive: boolean;
  isUnderMaintenance: boolean;
  _count?: { reservations: number };
}

interface Reservation {
  id: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
  numberOfGuests: number;
  purpose?: string;
  status: string;
  feeAmount: number;
  depositAmount: number;
  amenity: { name: string; type: string };
  resident: { firstName: string; lastName: string; unit?: { unitNumber: string } };
}

// Amenity icon mapping
const getAmenityIcon = (type: string) => {
  const icons: Record<string, React.ElementType> = {
    pool: Waves,
    gym: Dumbbell,
    party_room: PartyPopper,
    bbq_area: UtensilsCrossed,
    meeting_room: Building2,
    tennis: Users,
  };
  return icons[type] || Building2;
};

// Time slots for the day
const generateTimeSlots = (start: string = '06:00', end: string = '22:00') => {
  const slots = [];
  let [startHour] = start.split(':').map(Number);
  const [endHour] = end.split(':').map(Number);
  
  while (startHour < endHour) {
    const hour = startHour.toString().padStart(2, '0');
    slots.push(`${hour}:00`);
    slots.push(`${hour}:30`);
    startHour++;
  }
  return slots;
};

export default function ReservationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId') || 'default';

  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('amenities');
  
  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>('');
  
  // Reservation dialog
  const [showReservationDialog, setShowReservationDialog] = useState(false);
  const [reservationForm, setReservationForm] = useState({
    startTime: '',
    endTime: '',
    numberOfGuests: 1,
    purpose: '',
    specialRequests: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalAmenities: 0,
    available: 0,
    totalReservations: 0,
    pendingReservations: 0,
  });

  useEffect(() => {
    fetchData();
  }, [propertyId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [amenitiesRes, reservationsRes] = await Promise.all([
        fetch(`/api/condo/amenities?propertyId=${propertyId}`),
        fetch(`/api/condo/reservations?propertyId=${propertyId}&startDate=${getMonthStart()}&endDate=${getMonthEnd()}`),
      ]);
      
      const amenitiesData = await amenitiesRes.json();
      const reservationsData = await reservationsRes.json();
      
      setAmenities(amenitiesData.amenities || []);
      setStats(amenitiesData.stats || {});
      setReservations(reservationsData.reservations || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMonthStart = () => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    return date.toISOString().split('T')[0];
  };

  const getMonthEnd = () => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    return date.toISOString().split('T')[0];
  };

  const handleCreateReservation = async () => {
    if (!selectedAmenity || !selectedDate) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/condo/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          amenityId: selectedAmenity.id,
          residentId: 'demo-resident', // In production, get from auth
          reservationDate: selectedDate,
          ...reservationForm,
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setShowReservationDialog(false);
        setSelectedAmenity(null);
        setReservationForm({
          startTime: '',
          endTime: '',
          numberOfGuests: 1,
          purpose: '',
          specialRequests: '',
        });
        fetchData();
      } else {
        alert(data.error || 'Error al crear reservación');
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getReservationsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return reservations.filter(r => r.reservationDate === dateStr);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-[#050410]">
      <AuroraBackground />
      
      <CondoHeader 
        title="Reservaciones" 
        subtitle="Amenidades y áreas comunes"
        rightContent={
          <Button 
            onClick={() => {
              setSelectedAmenity(amenities[0] || null);
              setSelectedDate(new Date().toISOString().split('T')[0]);
              setShowReservationDialog(true);
            }}
            className="btn-nexus"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Reservación
          </Button>
        }
      />

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Amenidades"
            value={stats.totalAmenities}
            icon={Building2}
            color="violet"
          />
          <StatCard
            title="Disponibles"
            value={stats.available}
            icon={Check}
            color="green"
          />
          <StatCard
            title="Reservaciones"
            value={reservations.length}
            icon={Calendar}
            color="cyan"
          />
          <StatCard
            title="Pendientes"
            value={stats.pendingReservations || 0}
            icon={Clock}
            color="gold"
          />
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[#0A0820] border border-[rgba(167,139,250,0.2)] mb-6">
            <TabsTrigger value="amenities">Amenidades</TabsTrigger>
            <TabsTrigger value="calendar">Calendario</TabsTrigger>
            <TabsTrigger value="my-reservations">Mis Reservaciones</TabsTrigger>
          </TabsList>

          {/* Amenities Tab */}
          <TabsContent value="amenities">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {amenities.map(amenity => {
                const Icon = getAmenityIcon(amenity.type);
                return (
                  <Card 
                    key={amenity.id}
                    className="bg-[#0A0820]/80 border-[rgba(167,139,250,0.2)] hover:border-[rgba(167,139,250,0.4)] transition-all cursor-pointer group"
                    onClick={() => {
                      setSelectedAmenity(amenity);
                      setSelectedDate(new Date().toISOString().split('T')[0]);
                      setShowReservationDialog(true);
                    }}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6C3FCE] to-[#C026D3] flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-[#EDE9FE]">{amenity.name}</CardTitle>
                            <CardDescription className="text-[#9D7BEA]">
                              {amenity.location}
                            </CardDescription>
                          </div>
                        </div>
                        {amenity.isUnderMaintenance && (
                          <Badge className="bg-[#F0B429]/20 text-[#F0B429]">En Mantenimiento</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#9D7BEA]">Capacidad:</span>
                          <span className="text-[#EDE9FE]">{amenity.capacity || 'N/A'} personas</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#9D7BEA]">Horario:</span>
                          <span className="text-[#EDE9FE]">
                            {amenity.openTime || '06:00'} - {amenity.closeTime || '22:00'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#9D7BEA]">Costo:</span>
                          <span className="text-[#F0B429]">
                            {amenity.reservationFee > 0 ? `$${amenity.reservationFee}` : 'Gratuito'}
                          </span>
                        </div>
                        {amenity._count && (
                          <div className="pt-2 border-t border-[rgba(167,139,250,0.1)]">
                            <span className="text-xs text-[#9D7BEA]">
                              {amenity._count.reservations} reservaciones activas
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {amenities.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Building2 className="w-16 h-16 text-[#6C3FCE] mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold text-[#EDE9FE] mb-2">No hay amenidades</h3>
                  <p className="text-[#9D7BEA]">Configure las amenidades de la propiedad</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar">
            <CondoCard title="Calendario de Reservaciones" icon={Calendar}>
              <div className="p-4">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="ghost"
                    onClick={() => navigateMonth('prev')}
                    className="text-[#9D7BEA]"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <h3 className="text-lg font-semibold text-[#EDE9FE]">
                    {currentDate.toLocaleString('es', { month: 'long', year: 'numeric' })}
                  </h3>
                  <Button
                    variant="ghost"
                    onClick={() => navigateMonth('next')}
                    className="text-[#9D7BEA]"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                    <div key={day} className="text-center py-2 text-sm font-medium text-[#9D7BEA]">
                      {day}
                    </div>
                  ))}
                  
                  {getDaysInMonth().map((date, index) => {
                    if (!date) {
                      return <div key={`empty-${index}`} className="h-24" />;
                    }

                    const dayReservations = getReservationsForDate(date);
                    const isToday = date.toDateString() === new Date().toDateString();
                    const isSelected = selectedDate === date.toISOString().split('T')[0];

                    return (
                      <div
                        key={date.toISOString()}
                        onClick={() => setSelectedDate(date.toISOString().split('T')[0])}
                        className={`h-24 p-1 rounded-lg border cursor-pointer transition-all ${
                          isToday 
                            ? 'border-[#6C3FCE] bg-[#6C3FCE]/10' 
                            : isSelected 
                              ? 'border-[#C026D3] bg-[#C026D3]/10'
                              : 'border-[rgba(167,139,250,0.1)] hover:border-[rgba(167,139,250,0.3)]'
                        }`}
                      >
                        <div className={`text-sm font-medium ${isToday ? 'text-[#B197FC]' : 'text-[#EDE9FE]'}`}>
                          {date.getDate()}
                        </div>
                        <div className="mt-1 space-y-0.5 overflow-hidden">
                          {dayReservations.slice(0, 2).map(res => (
                            <div
                              key={res.id}
                              className="text-[10px] truncate px-1 py-0.5 rounded bg-[#6C3FCE]/20 text-[#B197FC]"
                            >
                              {res.startTime} - {res.amenity.name}
                            </div>
                          ))}
                          {dayReservations.length > 2 && (
                            <div className="text-[10px] text-[#9D7BEA]">
                              +{dayReservations.length - 2} más
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Date Reservations */}
                {selectedDate && (
                  <div className="mt-6 pt-6 border-t border-[rgba(167,139,250,0.1)]">
                    <h4 className="text-md font-semibold text-[#EDE9FE] mb-3">
                      Reservaciones del {new Date(selectedDate).toLocaleDateString('es')}
                    </h4>
                    {getReservationsForDate(new Date(selectedDate)).length > 0 ? (
                      <div className="space-y-2">
                        {getReservationsForDate(new Date(selectedDate)).map(res => (
                          <div
                            key={res.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-[rgba(108,63,206,0.1)]"
                          >
                            <div>
                              <p className="text-[#EDE9FE] font-medium">{res.amenity.name}</p>
                              <p className="text-sm text-[#9D7BEA]">
                                {res.startTime} - {res.endTime} | {res.resident.firstName} {res.resident.lastName}
                              </p>
                            </div>
                            <StatusBadge status={res.status} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[#9D7BEA]">No hay reservaciones para esta fecha</p>
                    )}
                  </div>
                )}
              </div>
            </CondoCard>
          </TabsContent>

          {/* My Reservations Tab */}
          <TabsContent value="my-reservations">
            <CondoCard title="Mis Reservaciones" icon={Calendar}>
              <div className="space-y-4">
                {reservations.length > 0 ? (
                  reservations.map(res => (
                    <div
                      key={res.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-[rgba(108,63,206,0.1)] border border-[rgba(167,139,250,0.1)]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6C3FCE] to-[#C026D3] flex items-center justify-center">
                          {React.createElement(getAmenityIcon(res.amenity.type), { className: 'w-6 h-6 text-white' })}
                        </div>
                        <div>
                          <p className="text-[#EDE9FE] font-medium">{res.amenity.name}</p>
                          <p className="text-sm text-[#9D7BEA]">
                            {new Date(res.reservationDate).toLocaleDateString('es')} | {res.startTime} - {res.endTime}
                          </p>
                          {res.purpose && (
                            <p className="text-xs text-[#9D7BEA] mt-1">{res.purpose}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-[#F0B429] font-medium">
                            {res.feeAmount > 0 ? `$${res.feeAmount}` : 'Gratuito'}
                          </p>
                          <p className="text-xs text-[#9D7BEA]">
                            {res.numberOfGuests} invitados
                          </p>
                        </div>
                        <StatusBadge status={res.status} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-[#6C3FCE] mx-auto mb-4 opacity-50" />
                    <p className="text-[#9D7BEA]">No tienes reservaciones</p>
                  </div>
                )}
              </div>
            </CondoCard>
          </TabsContent>
        </Tabs>
      </main>

      {/* Reservation Dialog */}
      <Dialog open={showReservationDialog} onOpenChange={setShowReservationDialog}>
        <DialogContent className="bg-[#0A0820] border-[rgba(167,139,250,0.2)] text-[#EDE9FE] max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#EDE9FE]">Nueva Reservación</DialogTitle>
            <DialogDescription className="text-[#9D7BEA]">
              {selectedAmenity?.name} - {selectedDate && new Date(selectedDate).toLocaleDateString('es')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Amenity Selection */}
            <div className="space-y-2">
              <Label className="text-[#9D7BEA]">Amenidad</Label>
              <Select
                value={selectedAmenity?.id}
                onValueChange={(id) => {
                  const amenity = amenities.find(a => a.id === id);
                  setSelectedAmenity(amenity || null);
                }}
              >
                <SelectTrigger className="bg-[#050410] border-[rgba(167,139,250,0.2)]">
                  <SelectValue placeholder="Seleccionar amenidad" />
                </SelectTrigger>
                <SelectContent className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
                  {amenities.filter(a => !a.isUnderMaintenance).map(a => (
                    <SelectItem key={a.id} value={a.id} className="text-[#EDE9FE]">
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
              <Label className="text-[#9D7BEA]">Fecha</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="bg-[#050410] border-[rgba(167,139,250,0.2)]"
              />
            </div>

            {/* Time Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#9D7BEA]">Hora Inicio</Label>
                <Select
                  value={reservationForm.startTime}
                  onValueChange={(v) => setReservationForm(prev => ({ ...prev, startTime: v }))}
                >
                  <SelectTrigger className="bg-[#050410] border-[rgba(167,139,250,0.2)]">
                    <SelectValue placeholder="Inicio" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
                    {generateTimeSlots(selectedAmenity?.openTime, selectedAmenity?.closeTime).map(slot => (
                      <SelectItem key={slot} value={slot} className="text-[#EDE9FE]">
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[#9D7BEA]">Hora Fin</Label>
                <Select
                  value={reservationForm.endTime}
                  onValueChange={(v) => setReservationForm(prev => ({ ...prev, endTime: v }))}
                >
                  <SelectTrigger className="bg-[#050410] border-[rgba(167,139,250,0.2)]">
                    <SelectValue placeholder="Fin" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
                    {generateTimeSlots(selectedAmenity?.openTime, selectedAmenity?.closeTime).map(slot => (
                      <SelectItem key={slot} value={slot} className="text-[#EDE9FE]">
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Number of Guests */}
            <div className="space-y-2">
              <Label className="text-[#9D7BEA]">Número de Invitados</Label>
              <Input
                type="number"
                min="1"
                max={selectedAmenity?.capacity || 50}
                value={reservationForm.numberOfGuests}
                onChange={(e) => setReservationForm(prev => ({ ...prev, numberOfGuests: parseInt(e.target.value) || 1 }))}
                className="bg-[#050410] border-[rgba(167,139,250,0.2)]"
              />
            </div>

            {/* Purpose */}
            <div className="space-y-2">
              <Label className="text-[#9D7BEA]">Propósito (Opcional)</Label>
              <Input
                value={reservationForm.purpose}
                onChange={(e) => setReservationForm(prev => ({ ...prev, purpose: e.target.value }))}
                placeholder="Ej: Cumpleaños, Reunión familiar..."
                className="bg-[#050410] border-[rgba(167,139,250,0.2)]"
              />
            </div>

            {/* Special Requests */}
            <div className="space-y-2">
              <Label className="text-[#9D7BEA]">Solicitudes Especiales</Label>
              <Textarea
                value={reservationForm.specialRequests}
                onChange={(e) => setReservationForm(prev => ({ ...prev, specialRequests: e.target.value }))}
                placeholder="Cualquier requerimiento especial..."
                className="bg-[#050410] border-[rgba(167,139,250,0.2)]"
                rows={2}
              />
            </div>

            {/* Cost Summary */}
            {selectedAmenity && (selectedAmenity.reservationFee > 0 || selectedAmenity.depositRequired > 0) && (
              <div className="p-4 rounded-lg bg-[rgba(108,63,206,0.1)] border border-[rgba(167,139,250,0.2)]">
                <h4 className="font-medium text-[#EDE9FE] mb-2">Resumen de Costos</h4>
                {selectedAmenity.reservationFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#9D7BEA]">Costo de reservación:</span>
                    <span className="text-[#F0B429]">${selectedAmenity.reservationFee}</span>
                  </div>
                )}
                {selectedAmenity.depositRequired > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#9D7BEA]">Depósito (reembolsable):</span>
                    <span className="text-[#F0B429]">${selectedAmenity.depositRequired}</span>
                  </div>
                )}
              </div>
            )}

            {/* Rules */}
            {selectedAmenity?.rules && (
              <div className="p-3 rounded-lg bg-[rgba(240,180,41,0.1)] border border-[rgba(240,180,41,0.2)]">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-[#F0B429] mt-0.5" />
                  <div className="text-xs text-[#F0B429]">{selectedAmenity.rules}</div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowReservationDialog(false)}
                className="border-[rgba(167,139,250,0.2)] text-[#9D7BEA]"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateReservation}
                disabled={!selectedAmenity || !selectedDate || !reservationForm.startTime || !reservationForm.endTime || submitting}
                className="btn-nexus"
              >
                {submitting ? 'Procesando...' : 'Confirmar Reservación'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
