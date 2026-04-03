'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, Calendar, Heart, Activity, Search, Wifi, WifiOff, 
  Plus, Clock, ChevronRight, User, RefreshCw, Menu, X,
  Bell, Settings, LogOut, Moon, Sun, Mic, Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle,
  DrawerTrigger 
} from '@/components/ui/drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SyncStatus, SyncProgressBar } from '@/components/pwa';
import { OfflineIndicatorCompact } from '@/components/pwa/OfflineIndicator';
import { OfflinePatientList } from '@/components/clinic/offline-patient-list';
import { OfflineAppointments } from '@/components/clinic/offline-appointments';
import { OfflineVitalsForm } from '@/components/clinic/offline-vitals-form';
import { ClinicSyncStatus } from '@/components/clinic/sync-status';
import { syncManager } from '@/lib/offline/sync';
import { ClinicDB } from '@/lib/offline/db';

// Types
interface QuickStat {
  label: string;
  value: number | string;
  color: string;
  icon: React.ReactNode;
}

interface VitalsQueueItem {
  id: string;
  patientName: string;
  patientId: string;
  appointmentTime: string;
  type: 'pending' | 'completed';
}

export default function MobileClinicPage() {
  // State
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<{id: string; name: string} | null>(null);
  const [pendingSync, setPendingSync] = useState(0);
  const [vitalsQueue, setVitalsQueue] = useState<VitalsQueueItem[]>([]);

  // Quick stats
  const quickStats: QuickStat[] = [
    { 
      label: 'Pacientes Hoy', 
      value: 12, 
      color: 'bg-violet-500',
      icon: <Users className="w-5 h-5" />
    },
    { 
      label: 'Citas Pendientes', 
      value: 5, 
      color: 'bg-amber-500',
      icon: <Calendar className="w-5 h-5" />
    },
    { 
      label: 'Vitales Tomados', 
      value: 7, 
      color: 'bg-emerald-500',
      icon: <Heart className="w-5 h-5" />
    },
    { 
      label: 'En Espera', 
      value: 3, 
      color: 'bg-blue-500',
      icon: <Clock className="w-5 h-5" />
    },
  ];

  // Quick actions for the home screen
  const quickActions = [
    { 
      label: 'Tomar Vitales', 
      icon: <Heart className="w-6 h-6" />,
      color: 'bg-gradient-to-br from-rose-500 to-pink-600',
      action: () => setActiveTab('vitals')
    },
    { 
      label: 'Ver Pacientes', 
      icon: <Users className="w-6 h-6" />,
      color: 'bg-gradient-to-br from-violet-500 to-purple-600',
      action: () => setActiveTab('patients')
    },
    { 
      label: 'Mis Citas', 
      icon: <Calendar className="w-6 h-6" />,
      color: 'bg-gradient-to-br from-blue-500 to-cyan-600',
      action: () => setActiveTab('appointments')
    },
    { 
      label: 'Búsqueda', 
      icon: <Search className="w-6 h-6" />,
      color: 'bg-gradient-to-br from-amber-500 to-orange-600',
      action: () => document.getElementById('search-input')?.focus()
    },
  ];

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Get pending sync count
    syncManager.getStatus().then(status => {
      setPendingSync(status.pending);
    });

    // Subscribe to sync events
    const unsubscribe = syncManager.subscribe((event) => {
      if (event.type === 'sync-complete') {
        syncManager.getStatus().then(status => {
          setPendingSync(status.pending);
        });
      }
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  // Load vitals queue
  useEffect(() => {
    const loadVitalsQueue = async () => {
      // In a real app, this would come from API or IndexedDB
      const queue: VitalsQueueItem[] = [
        { id: '1', patientName: 'María González', patientId: 'P001', appointmentTime: '09:00', type: 'pending' },
        { id: '2', patientName: 'Carlos Rodríguez', patientId: 'P002', appointmentTime: '09:30', type: 'pending' },
        { id: '3', patientName: 'Ana Martínez', patientId: 'P003', appointmentTime: '10:00', type: 'completed' },
        { id: '4', patientName: 'José Pérez', patientId: 'P004', appointmentTime: '10:30', type: 'pending' },
      ];
      setVitalsQueue(queue);
    };
    loadVitalsQueue();
  }, []);

  // Handle patient select for vitals
  const handlePatientSelect = (patient: {id: string; name: string}) => {
    setSelectedPatient(patient);
    setShowVitalsModal(true);
  };

  // Handle vitals saved
  const handleVitalsSaved = async () => {
    setShowVitalsModal(false);
    setSelectedPatient(null);
    // Refresh queue
    // In production, would refresh from source
  };

  // Trigger manual sync
  const handleSync = async () => {
    if (isOnline) {
      await syncManager.sync();
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0A0820]' : 'bg-gray-50'}`}>
      <SyncProgressBar />
      
      {/* Header */}
      <header className={`sticky top-0 z-50 ${darkMode ? 'bg-[#0A0820]/95' : 'bg-white/95'} backdrop-blur-md border-b ${darkMode ? 'border-[rgba(167,139,250,0.2)]' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between px-4 py-3">
          {/* Menu Button */}
          <button 
            onClick={() => setMenuOpen(true)}
            className={`p-2 rounded-xl ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
          >
            <Menu className={`w-6 h-6 ${darkMode ? 'text-white' : 'text-gray-800'}`} />
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Clinic Mobile
            </span>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center gap-2">
            <OfflineIndicatorCompact />
            {pendingSync > 0 && (
              <Badge className="bg-amber-500 text-white text-xs">
                {pendingSync}
              </Badge>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <Input
              id="search-input"
              type="text"
              placeholder="Buscar paciente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 h-12 text-base ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-500' : 'bg-gray-100 border-gray-200'}`}
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-lg bg-violet-500">
              <Mic className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-24">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="home" className="m-0">
            <div className="p-4 space-y-6">
              {/* Sync Status Banner */}
              {!isOnline && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center gap-3">
                  <WifiOff className="w-6 h-6 text-amber-500 flex-shrink-0" />
                  <div>
                    <p className={`font-medium ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                      Modo Sin Conexión
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-amber-400/70' : 'text-amber-600/70'}`}>
                      Los datos se guardarán localmente
                    </p>
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                {quickStats.map((stat, idx) => (
                  <div
                    key={idx}
                    className={`rounded-2xl p-4 ${darkMode ? 'bg-white/5' : 'bg-white'} border ${darkMode ? 'border-white/10' : 'border-gray-200'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-2`}>
                      {stat.icon}
                    </div>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {stat.value}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Acciones Rápidas
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {quickActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={action.action}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl ${action.color} text-white touch-manipulation`}
                    >
                      {action.icon}
                      <span className="text-xs mt-2 font-medium">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Vitals Queue */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Cola de Vitales
                  </h3>
                  <span className={`text-xs ${darkMode ? 'text-violet-400' : 'text-violet-600'}`}>
                    {vitalsQueue.filter(v => v.type === 'pending').length} pendientes
                  </span>
                </div>
                <div className="space-y-2">
                  {vitalsQueue.filter(v => v.type === 'pending').slice(0, 4).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handlePatientSelect({ id: item.patientId, name: item.patientName })}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl ${darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-white hover:bg-gray-50'} border ${darkMode ? 'border-white/10' : 'border-gray-200'} touch-manipulation`}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {item.patientName.charAt(0)}
                      </div>
                      <div className="flex-1 text-left">
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {item.patientName}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Cita: {item.appointmentTime}
                        </p>
                      </div>
                      <ChevronRight className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="patients" className="m-0">
            <OfflinePatientList 
              onSelectPatient={handlePatientSelect}
              searchQuery={searchQuery}
            />
          </TabsContent>

          <TabsContent value="appointments" className="m-0">
            <OfflineAppointments 
              onSelectPatient={handlePatientSelect}
            />
          </TabsContent>

          <TabsContent value="vitals" className="m-0">
            <div className="p-4">
              <OfflineVitalsForm 
                patient={selectedPatient}
                onSave={handleVitalsSaved}
              />
            </div>
          </TabsContent>

          <TabsContent value="sync" className="m-0">
            <div className="p-4">
              <ClinicSyncStatus />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Bottom Navigation */}
      <nav className={`fixed bottom-0 left-0 right-0 z-50 ${darkMode ? 'bg-[#0A0820]/95' : 'bg-white/95'} backdrop-blur-md border-t ${darkMode ? 'border-[rgba(167,139,250,0.2)]' : 'border-gray-200'}`}>
        <div className="flex items-center justify-around py-2">
          {[
            { id: 'home', icon: <Activity className="w-6 h-6" />, label: 'Inicio' },
            { id: 'patients', icon: <Users className="w-6 h-6" />, label: 'Pacientes' },
            { id: 'appointments', icon: <Calendar className="w-6 h-6" />, label: 'Citas' },
            { id: 'vitals', icon: <Heart className="w-6 h-6" />, label: 'Vitales' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center py-2 px-4 rounded-xl touch-manipulation ${
                activeTab === item.id 
                  ? 'text-violet-400' 
                  : darkMode ? 'text-gray-500' : 'text-gray-400'
              }`}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Side Menu */}
      <Drawer open={menuOpen} onOpenChange={setMenuOpen}>
        <DrawerContent className={`${darkMode ? 'bg-[#0A0820]' : 'bg-white'}`}>
          <DrawerHeader>
            <DrawerTitle className={`${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Menú
            </DrawerTitle>
          </DrawerHeader>
          <div className="p-4 space-y-2">
            {/* User Info */}
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  DR
                </div>
                <div>
                  <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    Dr. Rafael Mendez
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Medicina General
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            {[
              { icon: <SyncStatus showDetails={false} />, label: 'Sincronización', action: () => { setActiveTab('sync'); setMenuOpen(false); } },
              { icon: darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />, label: darkMode ? 'Modo Oscuro' : 'Modo Claro', action: () => setDarkMode(!darkMode) },
              { icon: <Bell className="w-5 h-5" />, label: 'Notificaciones' },
              { icon: <Settings className="w-5 h-5" />, label: 'Configuración' },
              { icon: <LogOut className="w-5 h-5" />, label: 'Cerrar Sesión', danger: true },
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={item.action}
                className={`w-full flex items-center gap-3 p-4 rounded-xl ${
                  item.danger 
                    ? 'text-red-400 hover:bg-red-500/10' 
                    : darkMode 
                      ? 'text-gray-300 hover:bg-white/5' 
                      : 'text-gray-700 hover:bg-gray-100'
                } touch-manipulation`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Vitals Modal */}
      <Dialog open={showVitalsModal} onOpenChange={setShowVitalsModal}>
        <DialogContent className={`${darkMode ? 'bg-[#0A0820] border-[rgba(167,139,250,0.2)]' : 'bg-white'} max-w-lg mx-4`}>
          <DialogHeader>
            <DialogTitle className={`${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Tomar Vitales
            </DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-violet-500/10 mb-4">
              <div className="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center text-white font-bold">
                {selectedPatient.name.charAt(0)}
              </div>
              <div>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {selectedPatient.name}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  ID: {selectedPatient.id}
                </p>
              </div>
            </div>
          )}
          <OfflineVitalsForm 
            patient={selectedPatient}
            onSave={handleVitalsSaved}
            compact
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
