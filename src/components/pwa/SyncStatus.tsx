'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, RefreshCw, Clock, Cloud, CloudOff, X } from 'lucide-react';
import { syncManager, type SyncEvent } from '@/lib/offline/sync';
import { Button } from '@/components/ui/button';

interface SyncStatusProps {
  className?: string;
  showDetails?: boolean;
  onDismiss?: () => void;
}

export function SyncStatus({ className = '', showDetails = false, onDismiss }: SyncStatusProps) {
  const [status, setStatus] = useState({
    isOnline: navigator.onLine,
    pending: 0,
    syncing: false,
    lastSync: null as string | null,
    error: null as string | null,
  });
  
  const [showFullStatus, setShowFullStatus] = useState(showDetails);

  useEffect(() => {
    // Get initial status
    syncManager.getStatus().then(s => {
      setStatus(prev => ({ ...prev, pending: s.pending }));
    });

    // Listen for online/offline
    const handleOnline = () => setStatus(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setStatus(prev => ({ ...prev, isOnline: false }));
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Subscribe to sync events
    const unsubscribe = syncManager.subscribe((event: SyncEvent) => {
      switch (event.type) {
        case 'sync-started':
          setStatus(prev => ({ ...prev, syncing: true, error: null }));
          break;
        case 'sync-complete':
          setStatus(prev => ({ 
            ...prev, 
            syncing: false, 
            pending: (event.total || 0) - (event.successful || 0),
            lastSync: new Date().toISOString(),
          }));
          break;
        case 'sync-error':
          setStatus(prev => ({ 
            ...prev, 
            syncing: false, 
            error: event.error || 'Sync failed' 
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

  const handleSync = async () => {
    if (status.isOnline && !status.syncing) {
      await syncManager.sync();
    }
  };

  const formatLastSync = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;
    
    return date.toLocaleDateString('es-ES', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Compact status
  if (!showFullStatus) {
    return (
      <button
        onClick={() => setShowFullStatus(true)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all ${
          status.syncing 
            ? 'bg-blue-500/20 text-blue-400'
            : status.pending > 0 
              ? 'bg-amber-500/20 text-amber-400'
              : status.isOnline
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-gray-500/20 text-gray-400'
        } ${className}`}
      >
        {status.syncing ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Sincronizando...</span>
          </>
        ) : status.pending > 0 ? (
          <>
            <Clock className="w-3.5 h-3.5" />
            <span>{status.pending} pendiente{status.pending !== 1 ? 's' : ''}</span>
          </>
        ) : status.isOnline ? (
          <>
            <Cloud className="w-3.5 h-3.5" />
            <span>Sincronizado</span>
          </>
        ) : (
          <>
            <CloudOff className="w-3.5 h-3.5" />
            <span>Sin conexión</span>
          </>
        )}
      </button>
    );
  }

  // Full status panel
  return (
    <div className={`bg-[#0A0820] border border-[rgba(167,139,250,0.2)] rounded-2xl overflow-hidden ${className}`}>
      <div className="p-4 border-b border-[rgba(167,139,250,0.1)] flex items-center justify-between">
        <h3 className="font-semibold text-[#EDE9FE]">Estado de Sincronización</h3>
        <div className="flex items-center gap-2">
          {onDismiss && (
            <button onClick={onDismiss} className="p-1 rounded hover:bg-white/10">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Conexión</span>
          <div className={`flex items-center gap-1.5 text-sm ${
            status.isOnline ? 'text-emerald-400' : 'text-amber-400'
          }`}>
            {status.isOnline ? (
              <>
                <Cloud className="w-4 h-4" />
                <span>En línea</span>
              </>
            ) : (
              <>
                <CloudOff className="w-4 h-4" />
                <span>Sin conexión</span>
              </>
            )}
          </div>
        </div>

        {/* Sync Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Estado</span>
          <div className={`flex items-center gap-1.5 text-sm ${
            status.syncing 
              ? 'text-blue-400' 
              : status.pending > 0 
                ? 'text-amber-400'
                : 'text-emerald-400'
          }`}>
            {status.syncing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Sincronizando...</span>
              </>
            ) : status.pending > 0 ? (
              <>
                <Clock className="w-4 h-4" />
                <span>{status.pending} pendiente{status.pending !== 1 ? 's' : ''}</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Actualizado</span>
              </>
            )}
          </div>
        </div>

        {/* Last Sync */}
        {status.lastSync && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Última sync</span>
            <span className="text-sm text-[#9D7BEA]">{formatLastSync(status.lastSync)}</span>
          </div>
        )}

        {/* Error Message */}
        {status.error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{status.error}</p>
          </div>
        )}

        {/* Sync Button */}
        {status.isOnline && status.pending > 0 && (
          <Button
            onClick={handleSync}
            disabled={status.syncing}
            className="w-full bg-[#6C3FCE] hover:bg-[#5B36B0] text-white"
          >
            {status.syncing ? (
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
        )}
      </div>
    </div>
  );
}

// Progress bar for sync
export function SyncProgressBar() {
  const [progress, setProgress] = useState({ current: 0, total: 0, syncing: false });

  useEffect(() => {
    const unsubscribe = syncManager.subscribe((event) => {
      if (event.type === 'sync-progress' && event.total && event.total > 0) {
        setProgress({
          current: event.processed || 0,
          total: event.total,
          syncing: true,
        });
      } else if (event.type === 'sync-complete') {
        setProgress({ current: 0, total: 0, syncing: false });
      }
    });

    return unsubscribe;
  }, []);

  if (!progress.syncing || progress.total === 0) return null;

  const percentage = Math.round((progress.current / progress.total) * 100);

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-gray-800">
      <div 
        className="h-full bg-gradient-to-r from-[#6C3FCE] to-[#C026D3] transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">
        Sincronizando {progress.current} de {progress.total}...
      </div>
    </div>
  );
}

export default SyncStatus;
