'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// Service Worker Registration Component
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('[PWA] Service Worker registered:', registration.scope);

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (
                  newWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  // New content available, notify user
                  console.log('[PWA] New content available, refresh to update');
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('[PWA] Service Worker registration failed:', error);
        });

      // Listen for controller change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[PWA] Controller changed, reloading...');
        window.location.reload();
      });
    }
  }, []);

  return null;
}

// PWA Meta Tags Component
export function PWAMetaTags() {
  return (
    <>
      <link rel="manifest" href="/manifest.json" />
      <meta name="theme-color" content="#6C3FCE" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="NexusOS" />
      <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="application-name" content="NexusOS" />
      <meta name="msapplication-TileColor" content="#6C3FCE" />
      <meta name="msapplication-tap-highlight" content="no" />
    </>
  );
}

// Safe Area Padding Component for iOS
export function SafeAreaPadding() {
  return (
    <style jsx global>{`
      :root {
        --safe-area-inset-top: env(safe-area-inset-top, 0px);
        --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
        --safe-area-inset-left: env(safe-area-inset-left, 0px);
        --safe-area-inset-right: env(safe-area-inset-right, 0px);
      }
      
      .pb-safe {
        padding-bottom: env(safe-area-inset-bottom, 0px);
      }
      
      .pt-safe {
        padding-top: env(safe-area-inset-top, 0px);
      }
      
      .touch-target {
        min-height: 44px;
        min-width: 44px;
      }
    `}</style>
  );
}

// Offline Banner Component
export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showBanner) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[100] py-2 px-4 text-center text-sm text-white transition-transform duration-300 ${
        isOnline ? 'bg-emerald-600' : 'bg-amber-600'
      }`}
    >
      {isOnline ? (
        <span>✓ Conexión restaurada. Sincronizando datos...</span>
      ) : (
        <span>⚠ Sin conexión. Los cambios se guardarán localmente.</span>
      )}
    </div>
  );
}

// PWA Update Prompt Component
export function PWAUpdatePrompt() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);
        
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                setShowUpdate(true);
              }
            });
          }
        });
      });
    }
  }, []);

  const handleUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      setShowUpdate(false);
    }
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[90] md:left-auto md:right-4 md:w-96">
      <div className="bg-[#6C3FCE] rounded-xl p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-white mb-1">Actualización Disponible</h4>
            <p className="text-sm text-white/80 mb-3">
              Una nueva versión de NexusOS está lista para instalar.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                className="px-4 py-2 rounded-lg bg-white text-[#6C3FCE] font-medium text-sm hover:bg-white/90 transition-colors"
              >
                Actualizar Ahora
              </button>
              <button
                onClick={() => setShowUpdate(false)}
                className="px-4 py-2 rounded-lg bg-white/20 text-white font-medium text-sm hover:bg-white/30 transition-colors"
              >
                Después
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Network Status Hook for use in components
export function useNetworkStatus() {
  const [status, setStatus] = useState({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    effectiveType: '4g' as string,
    downlink: 10 as number,
    rtt: 50 as number,
  });

  useEffect(() => {
    const updateStatus = () => {
      setStatus({
        isOnline: navigator.onLine,
        effectiveType: (navigator.connection as { effectiveType?: string })?.effectiveType || '4g',
        downlink: (navigator.connection as { downlink?: number })?.downlink || 10,
        rtt: (navigator.connection as { rtt?: number })?.rtt || 50,
      });
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    // Network Information API
    if ('connection' in navigator) {
      const connection = navigator.connection as EventTarget;
      connection.addEventListener('change', updateStatus);
    }

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
      if ('connection' in navigator) {
        const connection = navigator.connection as EventTarget;
        connection.removeEventListener('change', updateStatus);
      }
    };
  }, []);

  return status;
}

export default ServiceWorkerRegistration;
