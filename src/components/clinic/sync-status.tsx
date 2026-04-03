'use client';

import React, { useState, useEffect } from 'react';
import { 
  Cloud, CloudOff, RefreshCw, CheckCircle, AlertCircle, 
  Clock, Database, Wifi, WifiOff, Trash2, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { syncManager, type SyncEvent } from '@/lib/offline/sync';
import { getStorageEstimate, STORES, getAllItems } from '@/lib/offline/db';

// Types
interface SyncStatusData {
  isOnline: boolean;
  isSyncing: boolean;
  pending: number;
  lastSync: string | null;
  error: string | null;
}

interface StorageData {
  usage: number;
  quota: number;
  percentUsed: number;
}

interface SyncItem {
  id: string;
  url: string;
  method: string;
  createdAt: string;
  retries: number;
  error?: string;
}

export function ClinicSyncStatus() {
  // State
  const [status, setStatus] = useState<SyncStatusData>({
    isOnline: navigator.onLine,
    isSyncing: false,
    pending: 0,
    lastSync: null,
    error: null,
  });
  const [storage, setStorage] = useState<StorageData>({ usage: 0, quota: 0, percentUsed: 0 });
  const [syncItems, setSyncItems] = useState<SyncItem[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [offlineStats, setOfflineStats] = useState({
    patients: 0,
    appointments: 0,
    vitals: 0,
    notes: 0,
  });

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      // Get sync status
      const syncStatus = await syncManager.getStatus();
      setStatus(prev => ({
        ...prev,
        pending: syncStatus.pending,
        lastSync: syncStatus.oldestItem || null,
      }));

      // Get sync queue items
      const queue = await syncManager.getQueue();
      setSyncItems(queue);

      // Get storage estimate
      const storageEstimate = await getStorageEstimate();
      setStorage(storageEstimate);

      // Get offline data stats
      try {
        const patients = await getAllItems(STORES.CLINIC_PATIENTS);
        const appointments = await getAllItems(STORES.CLINIC_APPOINTMENTS);
        const vitals = await getAllItems(STORES.CLINIC_VITALS);
        const notes = await getAllItems(STORES.CLINIC_NOTES);
        
        setOfflineStats({
          patients: patients.length,
          appointments: appointments.length,
          vitals: vitals.length,
          notes: notes.length,
        });
      } catch (err) {
        console.error('Error loading offline stats:', err);
      }
    };

    loadData();

    // Listen for online/offline
    const handleOnline = () => setStatus(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setStatus(prev => ({ ...prev, isOnline: false }));
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Subscribe to sync events
    const unsubscribe = syncManager.subscribe((event: SyncEvent) => {
      switch (event.type) {
        case 'sync-started':
          setStatus(prev => ({ ...prev, isSyncing: true, error: null }));
          break;
        case 'sync-complete':
          setStatus(prev => ({
            ...prev,
            isSyncing: false,
            pending: (event.total || 0) - (event.successful || 0),
            lastSync: new Date().toISOString(),
          }));
          // Refresh items
          loadData();
          break;
        case 'sync-error':
          setStatus(prev => ({
            ...prev,
            isSyncing: false,
            error: event.error || 'Sync failed',
          }));
          break;
        case 'sync-progress':
          setStatus(prev => ({
            ...prev,
            pending: (event.total || 0) - (event.processed || 0),
          }));
          break;
      }
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  // Handle manual sync
  const handleSync = async () => {
    if (status.isOnline && !status.isSyncing) {
      await syncManager.sync();
    }
  };

  // Handle clear queue
  const handleClearQueue = async () => {
    await syncManager.clearQueue();
    setSyncItems([]);
    setStatus(prev => ({ ...prev, pending: 0 }));
  };

  // Format bytes
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format time ago
  const formatTimeAgo = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays} días`;
  };

  return (
    <div className="space-y-4">
      {/* Connection Status Card */}
      <div className={`rounded-2xl p-4 ${
        status.isOnline 
          ? 'bg-emerald-500/10 border border-emerald-500/20' 
          : 'bg-amber-500/10 border border-amber-500/20'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            status.isOnline ? 'bg-emerald-500/20' : 'bg-amber-500/20'
          }`}>
            {status.isOnline ? (
              <Wifi className="w-6 h-6 text-emerald-400" />
            ) : (
              <WifiOff className="w-6 h-6 text-amber-400" />
            )}
          </div>
          <div className="flex-1">
            <h3 className={`font-semibold ${
              status.isOnline ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {status.isOnline ? 'En Línea' : 'Sin Conexión'}
            </h3>
            <p className="text-sm text-gray-400">
              {status.isOnline 
                ? 'Los datos se sincronizarán automáticamente'
                : 'Los datos se guardarán localmente'}
            </p>
          </div>
        </div>
      </div>

      {/* Sync Status */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Estado de Sincronización</h3>
          <Badge className={
            status.isSyncing 
              ? 'bg-blue-500/20 text-blue-400'
              : status.pending > 0 
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-emerald-500/20 text-emerald-400'
          }>
            {status.isSyncing ? (
              <>
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                Sincronizando
              </>
            ) : status.pending > 0 ? (
              <>
                <Clock className="w-3 h-3 mr-1" />
                {status.pending} pendiente{status.pending !== 1 ? 's' : ''}
              </>
            ) : (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Sincronizado
              </>
            )}
          </Badge>
        </div>

        {/* Progress */}
        {status.isSyncing && (
          <div className="mb-4">
            <Progress value={50} className="h-2" />
            <p className="text-xs text-gray-400 mt-1">Sincronizando datos...</p>
          </div>
        )}

        {/* Error */}
        {status.error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-400">Error de sincronización</p>
                <p className="text-sm text-red-400/70">{status.error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Last Sync */}
        {status.lastSync && (
          <div className="flex items-center justify-between text-sm mb-4">
            <span className="text-gray-400">Última sincronización</span>
            <span className="text-violet-400">{formatTimeAgo(status.lastSync)}</span>
          </div>
        )}

        {/* Sync Button */}
        <Button
          onClick={handleSync}
          disabled={!status.isOnline || status.isSyncing}
          className="w-full bg-violet-500 hover:bg-violet-600 text-white"
        >
          {status.isSyncing ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Sincronizando...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Sincronizar Ahora
            </>
          )}
        </Button>
      </div>

      {/* Offline Data Stats */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
        <h3 className="font-semibold text-white mb-3">Datos Offline</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-white/5">
            <p className="text-2xl font-bold text-white">{offlineStats.patients}</p>
            <p className="text-sm text-gray-400">Pacientes</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5">
            <p className="text-2xl font-bold text-white">{offlineStats.appointments}</p>
            <p className="text-sm text-gray-400">Citas</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5">
            <p className="text-2xl font-bold text-white">{offlineStats.vitals}</p>
            <p className="text-sm text-gray-400">Vitales</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5">
            <p className="text-2xl font-bold text-white">{offlineStats.notes}</p>
            <p className="text-sm text-gray-400">Notas</p>
          </div>
        </div>
      </div>

      {/* Storage Usage */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-white">Almacenamiento</h3>
          <span className="text-sm text-gray-400">
            {formatBytes(storage.usage)} / {formatBytes(storage.quota)}
          </span>
        </div>
        <Progress value={storage.percentUsed} className="h-2" />
        <p className="text-xs text-gray-500 mt-2">
          {storage.percentUsed.toFixed(1)}% utilizado
        </p>
      </div>

      {/* Sync Queue Details */}
      {syncItems.length > 0 && (
        <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full p-4 flex items-center justify-between"
          >
            <h3 className="font-semibold text-white">Cola de Sincronización</h3>
            {showDetails ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
          
          {showDetails && (
            <div className="p-4 pt-0 space-y-2">
              {syncItems.map((item) => (
                <div key={item.id} className="p-3 rounded-xl bg-white/5 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white">{item.method}</span>
                    <span className="text-gray-500 text-xs">
                      {formatTimeAgo(item.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-400 truncate text-xs">{item.url}</p>
                  {item.error && (
                    <p className="text-red-400 text-xs mt-1">{item.error}</p>
                  )}
                </div>
              ))}
              
              <Button
                onClick={handleClearQueue}
                variant="outline"
                className="w-full mt-2 border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpiar Cola
              </Button>
            </div>
          )}
        </div>
      )}

      {/* PWA Install Info */}
      <div className="rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center flex-shrink-0">
            <Database className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Modo PWA Activo</h3>
            <p className="text-sm text-gray-400 mt-1">
              Esta aplicación funciona sin conexión. Los datos se guardan localmente 
              y se sincronizan automáticamente cuando vuelves a estar en línea.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClinicSyncStatus;
