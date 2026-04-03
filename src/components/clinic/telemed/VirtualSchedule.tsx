'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar,
  Clock,
  Video,
  Plus,
  Search,
  Filter,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CalendarDays,
  Phone
} from 'lucide-react';

interface VirtualAppointment {
  id: string;
  patientName: string;
  patientId: string;
  patientPhone: string;
  doctorName: string;
  doctorId: string;
  date: string;
  time: string;
  duration: number;
  type: 'video' | 'phone';
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  reason: string;
  notes?: string;
  roomCode?: string;
}

interface VirtualScheduleProps {
  onCreateRoom: (appointment: VirtualAppointment) => void;
  userRole: 'doctor' | 'staff';
}

// Demo appointments
const DEMO_APPOINTMENTS: VirtualAppointment[] = [
  {
    id: '1',
    patientName: 'María González',
    patientId: 'PAT-001',
    patientPhone: '+1 868 555-0001',
    doctorName: 'Dr. Carlos Pérez',
    doctorId: 'DOC-001',
    date: '2026-03-21',
    time: '09:00',
    duration: 30,
    type: 'video',
    status: 'scheduled',
    reason: 'Follow-up consultation',
    notes: 'Review blood test results',
  },
  {
    id: '2',
    patientName: 'Carlos Rodríguez',
    patientId: 'PAT-002',
    patientPhone: '+1 868 555-0002',
    doctorName: 'Dr. Carlos Pérez',
    doctorId: 'DOC-001',
    date: '2026-03-21',
    time: '09:30',
    duration: 30,
    type: 'video',
    status: 'confirmed',
    reason: 'Initial consultation',
    roomCode: 'ABCD1234',
  },
  {
    id: '3',
    patientName: 'Ana Martínez',
    patientId: 'PAT-003',
    patientPhone: '+1 868 555-0003',
    doctorName: 'Dr. Carlos Pérez',
    doctorId: 'DOC-001',
    date: '2026-03-21',
    time: '10:00',
    duration: 45,
    type: 'video',
    status: 'in-progress',
    reason: 'Chronic condition follow-up',
    roomCode: 'EFGH5678',
  },
  {
    id: '4',
    patientName: 'José Pérez',
    patientId: 'PAT-004',
    patientPhone: '+1 868 555-0004',
    doctorName: 'Dr. Carlos Pérez',
    doctorId: 'DOC-001',
    date: '2026-03-21',
    time: '11:00',
    duration: 30,
    type: 'phone',
    status: 'scheduled',
    reason: 'Medication refill',
  },
  {
    id: '5',
    patientName: 'Laura Sánchez',
    patientId: 'PAT-005',
    patientPhone: '+1 868 555-0005',
    doctorName: 'Dr. Carlos Pérez',
    doctorId: 'DOC-001',
    date: '2026-03-20',
    time: '14:00',
    duration: 30,
    type: 'video',
    status: 'completed',
    reason: 'Post-surgery follow-up',
    notes: 'Recovery progressing well',
  },
];

export function VirtualSchedule({ onCreateRoom, userRole }: VirtualScheduleProps) {
  const [appointments, setAppointments] = useState<VirtualAppointment[]>(DEMO_APPOINTMENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newAppointment, setNewAppointment] = useState<Partial<VirtualAppointment>>({
    type: 'video',
    duration: 30,
    status: 'scheduled',
  });

  // Filter appointments
  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.patientId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Group by date
  const groupedAppointments = filteredAppointments.reduce((groups, apt) => {
    const date = apt.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(apt);
    return groups;
  }, {} as Record<string, VirtualAppointment[]>);

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-blue-600">Scheduled</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-600">Confirmed</Badge>;
      case 'in-progress':
        return <Badge className="bg-yellow-600 animate-pulse">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-gray-600">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-600">Cancelled</Badge>;
      case 'no-show':
        return <Badge className="bg-orange-600">No Show</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  // Create new appointment
  const handleCreateAppointment = () => {
    const appointment: VirtualAppointment = {
      id: Date.now().toString(),
      patientName: newAppointment.patientName || '',
      patientId: newAppointment.patientId || '',
      patientPhone: newAppointment.patientPhone || '',
      doctorName: newAppointment.doctorName || '',
      doctorId: newAppointment.doctorId || '',
      date: newAppointment.date || '',
      time: newAppointment.time || '',
      duration: newAppointment.duration || 30,
      type: newAppointment.type || 'video',
      status: 'scheduled',
      reason: newAppointment.reason || '',
    };
    
    setAppointments(prev => [...prev, appointment]);
    setShowNewDialog(false);
    setNewAppointment({
      type: 'video',
      duration: 30,
      status: 'scheduled',
    });
  };

  // Start consultation
  const handleStartConsultation = (appointment: VirtualAppointment) => {
    onCreateRoom(appointment);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Virtual Schedule</h1>
          <p className="text-[var(--text-mid)]">Manage telemedicine appointments</p>
        </div>
        
        <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
          <DialogTrigger asChild>
            <Button className="btn-gold">
              <Plus className="w-4 h-4 mr-2" />
              New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule Virtual Appointment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Patient Name</Label>
                <Input
                  value={newAppointment.patientName || ''}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, patientName: e.target.value }))}
                  placeholder="Patient name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={newAppointment.date || ''}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={newAppointment.time || ''}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select
                    value={newAppointment.type}
                    onValueChange={(value) => setNewAppointment(prev => ({ ...prev, type: value as 'video' | 'phone' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video Call</SelectItem>
                      <SelectItem value="phone">Phone Call</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Duration (min)</Label>
                  <Select
                    value={newAppointment.duration?.toString()}
                    onValueChange={(value) => setNewAppointment(prev => ({ ...prev, duration: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 min</SelectItem>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="45">45 min</SelectItem>
                      <SelectItem value="60">60 min</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Reason for Visit</Label>
                <Input
                  value={newAppointment.reason || ''}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Reason for consultation"
                />
              </div>
              <Button className="w-full btn-gold" onClick={handleCreateAppointment}>
                Schedule Appointment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <CalendarDays className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-dim)]">Today</p>
                <p className="text-xl font-bold text-[var(--text-primary)]">
                  {appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Video className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-dim)]">Video Calls</p>
                <p className="text-xl font-bold text-[var(--text-primary)]">
                  {appointments.filter(a => a.type === 'video').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-dim)]">In Progress</p>
                <p className="text-xl font-bold text-[var(--text-primary)]">
                  {appointments.filter(a => a.status === 'in-progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <CheckCircle2 className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-dim)]">Completed</p>
                <p className="text-xl font-bold text-[var(--text-primary)]">
                  {appointments.filter(a => a.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search patients..."
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Appointments List */}
      <div className="space-y-6">
        {Object.entries(groupedAppointments).map(([date, apts]) => (
          <div key={date}>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[var(--nexus-violet)]" />
              {formatDate(date)}
            </h3>
            
            <div className="space-y-3">
              {apts.map((appointment) => (
                <Card key={appointment.id} className="glass-card hover:border-[var(--nexus-violet)]/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          appointment.type === 'video' 
                            ? 'bg-[var(--nexus-violet)]/20' 
                            : 'bg-[var(--nexus-aqua)]/20'
                        }`}>
                          {appointment.type === 'video' ? (
                            <Video className={`w-6 h-6 text-[var(--nexus-violet)]`} />
                          ) : (
                            <Phone className="w-6 h-6 text-[var(--nexus-aqua)]" />
                          )}
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-semibold text-[var(--text-primary)]">
                              {appointment.patientName}
                            </h4>
                            {getStatusBadge(appointment.status)}
                          </div>
                          <p className="text-sm text-[var(--text-mid)] mb-2">
                            {appointment.reason}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-[var(--text-dim)]">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {appointment.time} ({appointment.duration} min)
                            </span>
                            {appointment.roomCode && (
                              <span className="flex items-center gap-1 font-mono text-xs">
                                Room: {appointment.roomCode}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                          <Button
                            className="btn-gold"
                            onClick={() => handleStartConsultation(appointment)}
                          >
                            <Video className="w-4 h-4 mr-2" />
                            Start
                          </Button>
                        )}
                        {appointment.status === 'in-progress' && (
                          <Button className="bg-yellow-600 hover:bg-yellow-700">
                            <Video className="w-4 h-4 mr-2" />
                            Join
                          </Button>
                        )}
                        {appointment.status === 'completed' && (
                          <Button variant="outline" size="sm">
                            View Notes
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {filteredAppointments.length === 0 && (
          <div className="text-center py-12">
            <Video className="w-12 h-12 text-[var(--text-dim)] mx-auto mb-4" />
            <p className="text-[var(--text-mid)]">No appointments found</p>
          </div>
        )}
      </div>
    </div>
  );
}
