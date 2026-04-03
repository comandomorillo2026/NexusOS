'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface ServiceWorkerStatus {
  isSupported: boolean;
  isRegistered: boolean;
  isUpdateAvailable: boolean;
  isControlling: boolean;
  registration: ServiceWorkerRegistration | null;
}

interface ServiceWorkerMessage {
  type: string;
  data?: unknown;
}

export function useServiceWorker() {
  const [status, setStatus] = useState<ServiceWorkerStatus>({
    isSupported: typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
    isRegistered: false,
    isUpdateAvailable: false,
    isControlling: false,
    registration: null,
  });

  const [message, setMessage] = useState<ServiceWorkerMessage | null>(null);

  // Register service worker
  const register = useCallback(async () => {
    if (!status.isSupported) {
      console.log('[SW] Service workers not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('[SW] Service worker registered:', registration.scope);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              setStatus(prev => ({
                ...prev,
                isUpdateAvailable: true,
              }));
            }
          });
        }
      });

      setStatus(prev => ({
        ...prev,
        isRegistered: true,
        isControlling: !!navigator.serviceWorker.controller,
        registration,
      }));

      return registration;
    } catch (error) {
      console.error('[SW] Registration failed:', error);
      return null;
    }
  }, [status.isSupported]);

  // Update service worker
  const update = useCallback(async () => {
    if (status.registration) {
      try {
        await status.registration.update();
        console.log('[SW] Service worker update triggered');
      } catch (error) {
        console.error('[SW] Update failed:', error);
      }
    }
  }, [status.registration]);

  // Activate new service worker (skip waiting)
  const activateUpdate = useCallback(() => {
    if (status.isUpdateAvailable && status.registration?.waiting) {
      status.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, [status.isUpdateAvailable, status.registration]);

  // Send message to service worker
  const sendMessage = useCallback((type: string, data?: unknown) => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type, data });
    }
  }, []);

  // Cache URLs
  const cacheUrls = useCallback((urls: string[]) => {
    sendMessage('CACHE_URLS', urls);
  }, [sendMessage]);

  // Clear cache
  const clearCache = useCallback(() => {
    sendMessage('CLEAR_CACHE');
  }, [sendMessage]);

  // Get sync queue status
  const getSyncStatus = useCallback(() => {
    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data);
      };
      
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage(
          { type: 'GET_SYNC_STATUS' },
          [messageChannel.port2]
        );
      } else {
        resolve({ pending: 0, items: [] });
      }
    });
  }, []);

  // Clear sync queue
  const clearSyncQueue = useCallback(() => {
    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = () => {
        resolve(true);
      };
      
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage(
          { type: 'CLEAR_SYNC_QUEUE' },
          [messageChannel.port2]
        );
      } else {
        resolve(true);
      }
    });
  }, []);

  // Listen for messages from service worker
  useEffect(() => {
    if (!status.isSupported) return;

    const handleMessage = (event: MessageEvent) => {
      setMessage(event.data);
      
      // Handle specific message types
      if (event.data.type === 'SYNC_QUEUED') {
        console.log('[SW] Data queued for sync:', event.data.data);
      } else if (event.data.type === 'SYNC_COMPLETE') {
        console.log('[SW] Sync complete:', event.data.data);
      } else if (event.data.type === 'SYNC_FAILED') {
        console.error('[SW] Sync failed:', event.data.data);
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, [status.isSupported]);

  // Check for controller change
  useEffect(() => {
    if (!status.isSupported) return;

    const handleControllerChange = () => {
      console.log('[SW] Controller changed');
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, [status.isSupported]);

  // Auto-register on mount
  useEffect(() => {
    if (status.isSupported && !status.isRegistered) {
      register();
    }
  }, [status.isSupported, status.isRegistered, register]);

  return {
    ...status,
    message,
    register,
    update,
    activateUpdate,
    sendMessage,
    cacheUrls,
    clearCache,
    getSyncStatus,
    clearSyncQueue,
  };
}

// Hook for background sync
export function useBackgroundSync() {
  const [isSupported, setIsSupported] = useState(false);
  const [syncTags, setSyncTags] = useState<string[]>([]);

  useEffect(() => {
    setIsSupported(
      'serviceWorker' in navigator && 
      'SyncManager' in window
    );
  }, []);

  const registerSync = useCallback(async (tag: string = 'nexusos-sync') => {
    if (!isSupported) {
      console.log('[BackgroundSync] Not supported');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register(tag);
      
      setSyncTags(prev => {
        if (!prev.includes(tag)) {
          return [...prev, tag];
        }
        return prev;
      });

      console.log('[BackgroundSync] Registered:', tag);
      return true;
    } catch (error) {
      console.error('[BackgroundSync] Registration failed:', error);
      return false;
    }
  }, [isSupported]);

  return {
    isSupported,
    syncTags,
    registerSync,
  };
}

// Hook for push notifications
export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    setIsSupported(
      'serviceWorker' in navigator && 
      'PushManager' in window
    );
    setPermission(Notification.permission);
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('[Push] Permission request failed:', error);
      return false;
    }
  }, [isSupported]);

  const subscribe = useCallback(async (vapidPublicKey?: string) => {
    if (!isSupported || permission !== 'granted') return null;

    try {
      const registration = await navigator.serviceWorker.ready;
      
      const options: PushSubscriptionOptionsInit = {
        userVisibleOnly: true,
      };
      
      if (vapidPublicKey) {
        options.applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
      }

      const sub = await registration.pushManager.subscribe(options);
      setSubscription(sub);
      setIsSubscribed(true);
      
      console.log('[Push] Subscribed:', sub.endpoint);
      return sub;
    } catch (error) {
      console.error('[Push] Subscription failed:', error);
      return null;
    }
  }, [isSupported, permission]);

  const unsubscribe = useCallback(async () => {
    if (!subscription) return false;

    try {
      await subscription.unsubscribe();
      setSubscription(null);
      setIsSubscribed(false);
      console.log('[Push] Unsubscribed');
      return true;
    } catch (error) {
      console.error('[Push] Unsubscribe failed:', error);
      return false;
    }
  }, [subscription]);

  const getSubscription = useCallback(async () => {
    if (!isSupported) return null;

    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      
      if (sub) {
        setSubscription(sub);
        setIsSubscribed(true);
      }
      
      return sub;
    } catch (error) {
      console.error('[Push] Get subscription failed:', error);
      return null;
    }
  }, [isSupported]);

  return {
    isSupported,
    isSubscribed,
    subscription,
    permission,
    requestPermission,
    subscribe,
    unsubscribe,
    getSubscription,
  };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default useServiceWorker;
