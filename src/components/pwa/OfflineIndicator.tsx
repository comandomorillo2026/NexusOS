'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { syncManager } from '@/lib/offline/sync';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Show nothing when online (unless just reconnected)
  if (isOnline && !showReconnected) return null;

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-[100] transition-transform duration-300 ${
        showReconnected ? 'bg-emerald-600' : 'bg-amber-600'
      }`}
      style={{ transform: isOnline || showReconnected ? 'translateY(0)' : 'translateY(-100%)' }}
    >
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2 text-white text-sm">
        {isOnline ? (
          <>
            <Cloud className="w-4 h-4" />
            <span>Conexión restaurada. Sincronizando datos...</span>
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span>Sin conexión. Los cambios se guardarán localmente.</span>
          </>
        )}
      </div>
    </div>
  );
}

// Compact inline indicator
export function OfflineIndicatorCompact() {
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${
      isOnline 
        ? 'bg-emerald-500/20 text-emerald-400' 
        : 'bg-amber-500/20 text-amber-400'
    }`}>
      {isOnline ? (
        <>
          <Wifi className="w-3 h-3" />
          <span>En línea</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3" />
          <span>Sin conexión</span>
        </>
      )}
    </div>
  );
}

// Full page offline fallback
export function OfflineFallback() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-[#050410] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-500/20 flex items-center justify-center">
          <CloudOff className="w-10 h-10 text-amber-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Sin Conexión</h2>
        <p className="text-gray-400 mb-6">
          No tienes conexión a internet. Los datos que ingreses se guardarán 
          localmente y se sincronizarán cuando vuelvas a estar en línea.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 rounded-xl bg-[#6C3FCE] text-white font-medium hover:bg-[#5B36B0] transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </button>
          <p className="text-xs text-gray-500">
            Verifica tu conexión a internet
          </p>
        </div>
      </div>
    </div>
  );
}

// Offline data status badge
export function OfflineDataStatus() {
  const [pending, setPending] = useState(0);
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const updateStatus = async () => {
      const status = await syncManager.getStatus();
      setPending(status.pending);
    };

    updateStatus();

    const handleOnline = () => {
      setIsOnline(true);
      updateStatus();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Subscribe to sync events
    const unsubscribe = syncManager.subscribe((event) => {
      if (event.type === 'sync-complete') {
        updateStatus();
      }
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  if (pending === 0 || isOnline) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 md:left-auto md:right-4 md:w-80">
      <div className="bg-amber-500/90 backdrop-blur rounded-xl p-3 flex items-center gap-3 text-white shadow-lg">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <CloudOff className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">Datos pendientes</p>
          <p className="text-xs text-white/80">
            {pending} {pending === 1 ? 'cambio' : 'cambios'} esperando sincronización
          </p>
        </div>
      </div>
    </div>
  );
}

export default OfflineIndicator;
