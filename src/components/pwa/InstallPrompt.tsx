'use client';

import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallPromptProps {
  onInstall?: () => void;
  onDismiss?: () => void;
}

export function InstallPrompt({ onInstall, onDismiss }: InstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  // Initialize state with computed values to avoid setState in effect
  const [isIOS] = useState(() => /iPad|iPhone|iPod/.test(typeof navigator !== 'undefined' ? navigator.userAgent : '') && !(typeof window !== 'undefined' ? (window as Window & { MSStream?: unknown }).MSStream : false));
  const [isStandalone] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  });

  useEffect(() => {
    // Listen for beforeinstallprompt event (non-iOS)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Check if user has dismissed before
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      const dismissedTime = dismissed ? parseInt(dismissed, 10) : 0;
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      
      // Show prompt if not dismissed recently
      if (!dismissed || dismissedTime < oneWeekAgo) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show prompt after a delay if not standalone
    if (isIOS && !isStandalone) {
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      const dismissedTime = dismissed ? parseInt(dismissed, 10) : 0;
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      
      if (!dismissed || dismissedTime < oneWeekAgo) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isIOS, isStandalone]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          setShowPrompt(false);
          onInstall?.();
        }
      } catch (error) {
        console.error('Install prompt error:', error);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    onDismiss?.();
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe">
      <div className="max-w-md mx-auto bg-gradient-to-r from-[#6C3FCE] to-[#C026D3] rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-4 relative">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            
            <div className="flex-1 pr-6">
              <h3 className="text-white font-semibold text-lg mb-1">
                Instalar NexusOS
              </h3>
              <p className="text-white/80 text-sm mb-3">
                {isIOS ? (
                  <>
                    Toca <span className="inline-flex items-center px-1">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z"/>
                      </svg>
                    </span> y luego "Añadir a pantalla de inicio"
                  </>
                ) : (
                  'Instala la app para acceso rápido y funciona sin conexión.'
                )}
              </p>
              
              {!isIOS && (
                <Button
                  onClick={handleInstall}
                  className="bg-white text-[#6C3FCE] hover:bg-white/90 font-medium"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Instalar Ahora
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline mini prompt for header
export function InstallPromptMini() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (!showPrompt) return null;

  return (
    <button
      onClick={handleInstall}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F0B429]/20 text-[#F0B429] text-sm hover:bg-[#F0B429]/30 transition-colors"
    >
      <Download className="w-3.5 h-3.5" />
      Instalar App
    </button>
  );
}

export default InstallPrompt;
