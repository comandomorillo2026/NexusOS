'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { ClinicLayout } from '@/components/clinic/clinic-layout';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Video,
  Calendar,
  Clock,
  Users,
  Plus,
  Search,
  Phone,
  CheckCircle2,
  AlertCircle,
  Activity,
  Stethoscope,
  ClipboardList,
  Settings,
  ArrowRight,
  Monitor,
  Zap
} from 'lucide-react';
import { VirtualSchedule } from '@/components/clinic/telemed/VirtualSchedule';

// Demo data
const DEMO_STATS = {
  todayAppointments: 8,
  inProgress: 2,
  completed: 15,
  waitingRoom: 3,
};

const DEMO_WAITING_PATIENTS = [
  { id: '1', name: 'Carlos Rodríguez', time: '09:15', waitTime: 5, status: 'ready' },
  { id: '2', name: 'Ana Martínez', time: '09:30', waitTime: 12, status: 'ready' },
  { id: '3', name: 'José Pérez', time: '09:45', waitTime: 18, status: 'connecting' },
];

const DEMO_ACTIVE_ROOMS = [
  { id: '1', roomCode: 'ABCD1234', patient: 'María González', startedAt: '09:00', duration: 15 },
];

export default function TelemedDashboard() {
  const { user, tenantId } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNewRoomDialog, setShowNewRoomDialog] = useState(false);
  const [newRoomData, setNewRoomData] = useState({
    patientId: '',
    patientName: '',
    patientPhone: '',
    scheduledStart: '',
    notes: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Create new room
  const handleCreateRoom = async () => {
    if (!newRoomData.patientName || !newRoomData.patientId || !tenantId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/clinic/telemed/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: user?.id || 'doctor-1',
          doctorName: user?.name || 'Doctor',
          patientId: newRoomData.patientId,
          patientName: newRoomData.patientName,
          tenantId,
          scheduledStart: newRoomData.scheduledStart || new Date().toISOString(),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        router.push(`/clinic/telemed/room/${data.room.roomCode}`);
      }
    } catch (error) {
      console.error('Error creating room:', error);
    } finally {
      setIsLoading(false);
      setShowNewRoomDialog(false);
    }
  };

  // Start consultation from schedule
  const handleStartConsultation = async (appointment: { patientId: string; patientName: string; patientPhone?: string }) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/clinic/telemed/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: user?.id || 'doctor-1',
          doctorName: user?.name || 'Doctor',
          patientId: appointment.patientId,
          patientName: appointment.patientName,
          tenantId: tenantId || 'demo-tenant',
          scheduledStart: new Date().toISOString(),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        router.push(`/clinic/telemed/room/${data.room.roomCode}`);
      }
    } catch (error) {
      console.error('Error starting consultation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ClinicLayout activeTab="telemed">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Telemedicine</h1>
            <p className="text-[var(--text-mid)]">Manage virtual consultations and appointments</p>
          </div>
          
          <Dialog open={showNewRoomDialog} onOpenChange={setShowNewRoomDialog}>
            <DialogTrigger asChild>
              <Button className="btn-gold">
                <Video className="w-4 h-4 mr-2" />
                Start New Consultation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start New Consultation</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Patient Name *</Label>
                  <Input
                    value={newRoomData.patientName}
                    onChange={(e) => setNewRoomData(prev => ({ ...prev, patientName: e.target.value }))}
                    placeholder="Enter patient name"
                  />
                </div>
                <div>
                  <Label>Patient ID *</Label>
                  <Input
                    value={newRoomData.patientId}
                    onChange={(e) => setNewRoomData(prev => ({ ...prev, patientId: e.target.value }))}
                    placeholder="Enter patient ID"
                  />
                </div>
                <div>
                  <Label>Patient Phone</Label>
                  <Input
                    value={newRoomData.patientPhone}
                    onChange={(e) => setNewRoomData(prev => ({ ...prev, patientPhone: e.target.value }))}
                    placeholder="+1 868 XXX-XXXX"
                  />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Input
                    value={newRoomData.notes}
                    onChange={(e) => setNewRoomData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Reason for consultation"
                  />
                </div>
                <Button 
                  className="w-full btn-gold" 
                  onClick={handleCreateRoom}
                  disabled={isLoading || !newRoomData.patientName || !newRoomData.patientId}
                >
                  {isLoading ? 'Creating...' : 'Create Room'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Calendar className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-[var(--text-dim)]">Today</p>
                  <p className="text-xl font-bold text-[var(--text-primary)]">{DEMO_STATS.todayAppointments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <Activity className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-xs text-[var(--text-dim)]">In Progress</p>
                  <p className="text-xl font-bold text-[var(--text-primary)]">{DEMO_STATS.inProgress}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-[var(--text-dim)]">Completed</p>
                  <p className="text-xl font-bold text-[var(--text-primary)]">{DEMO_STATS.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Users className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-[var(--text-dim)]">Waiting</p>
                  <p className="text-xl font-bold text-[var(--text-primary)]">{DEMO_STATS.waitingRoom}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--nexus-violet)]/20">
                  <Monitor className="w-5 h-5 text-[var(--nexus-violet)]" />
                </div>
                <div>
                  <p className="text-xs text-[var(--text-dim)]">Active Rooms</p>
                  <p className="text-xl font-bold text-[var(--text-primary)]">{DEMO_ACTIVE_ROOMS.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[var(--obsidian-2)]">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="waiting">Waiting Room</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Active Rooms */}
              <div className="lg:col-span-2">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="w-5 h-5 text-[var(--nexus-violet)]" />
                      Active Consultations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {DEMO_ACTIVE_ROOMS.length === 0 ? (
                      <div className="text-center py-8 text-[var(--text-dim)]">
                        <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No active consultations</p>
                        <Button className="mt-4 btn-gold" onClick={() => setShowNewRoomDialog(true)}>
                          Start New Consultation
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {DEMO_ACTIVE_ROOMS.map((room) => (
                          <div 
                            key={room.id}
                            className="p-4 rounded-lg bg-[var(--glass)] flex items-center justify-between"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-lg bg-[var(--nexus-violet)]/20 flex items-center justify-center">
                                <Video className="w-6 h-6 text-[var(--nexus-violet)]" />
                              </div>
                              <div>
                                <p className="font-medium text-[var(--text-primary)]">{room.patient}</p>
                                <div className="flex items-center gap-3 text-sm text-[var(--text-dim)]">
                                  <span className="font-mono">Room: {room.roomCode}</span>
                                  <span>•</span>
                                  <span>{room.duration} min</span>
                                </div>
                              </div>
                            </div>
                            <Button 
                              className="bg-yellow-600 hover:bg-yellow-700"
                              onClick={() => router.push(`/clinic/telemed/room/${room.roomCode}`)}
                            >
                              Join Room
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Waiting Room */}
              <div>
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-500" />
                      Waiting Room
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {DEMO_WAITING_PATIENTS.map((patient) => (
                        <div 
                          key={patient.id}
                          className="p-3 rounded-lg bg-[var(--glass)]"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-[var(--text-primary)]">{patient.name}</span>
                            <Badge className={
                              patient.status === 'ready' ? 'bg-green-600' : 'bg-yellow-600'
                            }>
                              {patient.status === 'ready' ? 'Ready' : 'Connecting'}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-[var(--text-dim)]">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {patient.time}
                            </span>
                            <span className="text-[var(--text-dim)]">
                              Waiting {patient.waitTime} min
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={() => setActiveTab('waiting')}
                    >
                      View All
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Quick Actions */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setShowNewRoomDialog(true)}>
                    <Video className="w-6 h-6 text-[var(--nexus-violet)]" />
                    <span>Start Consultation</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                    <Phone className="w-6 h-6 text-[var(--nexus-aqua)]" />
                    <span>Phone Call</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setActiveTab('schedule')}>
                    <Calendar className="w-6 h-6 text-[var(--nexus-gold)]" />
                    <span>Schedule</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                    <ClipboardList className="w-6 h-6 text-green-500" />
                    <span>View Records</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule">
            <VirtualSchedule 
              onCreateRoom={handleStartConsultation}
              userRole="doctor"
            />
          </TabsContent>

          {/* Waiting Room Tab */}
          <TabsContent value="waiting">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  Patient Waiting Room
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {DEMO_WAITING_PATIENTS.map((patient) => (
                    <div 
                      key={patient.id}
                      className="p-4 rounded-lg bg-[var(--glass)] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--nexus-violet)] to-[var(--nexus-fuchsia)] flex items-center justify-center">
                          <span className="text-white font-bold">
                            {patient.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">{patient.name}</p>
                          <div className="flex items-center gap-3 text-sm text-[var(--text-dim)]">
                            <span>Scheduled: {patient.time}</span>
                            <span>•</span>
                            <span>Waiting: {patient.waitTime} min</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={
                          patient.status === 'ready' ? 'bg-green-600' : 'bg-yellow-600 animate-pulse'
                        }>
                          {patient.status === 'ready' ? 'Ready' : 'Connecting'}
                        </Badge>
                        <Button 
                          className="btn-gold"
                          onClick={() => handleStartConsultation({ 
                            patientId: patient.id, 
                            patientName: patient.name 
                          })}
                          disabled={patient.status !== 'ready'}
                        >
                          <Video className="w-4 h-4 mr-2" />
                          Start
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Consultation History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-[var(--text-dim)]">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>View past consultations and their notes</p>
                  <p className="text-sm mt-2">Coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ClinicLayout>
  );
}
