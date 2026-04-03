'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface OfflineState {
  isOnline: boolean;
  wasOffline: boolean;
  lastOnlineTime: Date | null;
  lastOfflineTime: Date | null;
}

export function useOffline() {
  const [state, setState] = useState<OfflineState>(() => ({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    wasOffline: false,
    lastOnlineTime: typeof navigator !== 'undefined' && navigator.onLine ? new Date() : null,
    lastOfflineTime: typeof navigator !== 'undefined' && !navigator.onLine ? new Date() : null,
  }));

  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({
        ...prev,
        isOnline: true,
        wasOffline: true, // Mark that we were offline (useful for showing "reconnected" message)
        lastOnlineTime: new Date(),
      }));
      
      // Reset wasOffline after showing message
      setTimeout(() => {
        setState(prev => ({ ...prev, wasOffline: false }));
      }, 5000);
    };

    const handleOffline = () => {
      setState(prev => ({
        ...prev,
        isOnline: false,
        lastOfflineTime: new Date(),
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Time since last online (useful for showing "offline for X minutes")
  const getOfflineDuration = useCallback(() => {
    if (state.isOnline || !state.lastOnlineTime) return null;
    
    const diffMs = Date.now() - state.lastOnlineTime.getTime();
    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  }, [state.isOnline, state.lastOnlineTime]);

  return {
    ...state,
    getOfflineDuration,
  };
}

// Hook for form submission with offline support
export function useOfflineForm<T>(
  onSubmit: (data: T) => Promise<void>,
  onSaveOffline: (data: T) => Promise<void>
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOffline, setIsOffline] = useState(() => typeof navigator !== 'undefined' ? !navigator.onLine : false);
  const [savedOffline, setSavedOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const submit = async (data: T) => {
    setIsSubmitting(true);
    setSavedOffline(false);

    try {
      if (navigator.onLine) {
        await onSubmit(data);
      } else {
        await onSaveOffline(data);
        setSavedOffline(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submit,
    isSubmitting,
    isOffline,
    savedOffline,
  };
}

// Hook for offline data fetching
export function useOfflineData<T>(
  fetchOnline: () => Promise<T>,
  fetchOffline: () => Promise<T>,
  options: {
    cacheKey?: string;
    autoSync?: boolean;
  } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const { cacheKey, autoSync = true } = options;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (navigator.onLine) {
        const onlineData = await fetchOnline();
        setData(onlineData);
        setIsFromCache(false);

        // Cache data if cacheKey provided
        if (cacheKey) {
          try {
            localStorage.setItem(cacheKey, JSON.stringify(onlineData));
          } catch {
            // Storage full, ignore
          }
        }
      } else {
        const offlineData = await fetchOffline();
        setData(offlineData);
        setIsFromCache(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));

      // Try cache on error
      if (cacheKey) {
        try {
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            setData(JSON.parse(cached));
            setIsFromCache(true);
          }
        } catch {
          // Cache read failed, ignore
        }
      }
    } finally {
      setLoading(false);
    }
  }, [fetchOnline, fetchOffline, cacheKey]);

  useEffect(() => {
    fetchData();

    // Auto-sync when coming back online
    if (autoSync) {
      const handleOnline = () => {
        fetchData();
      };

      window.addEventListener('online', handleOnline);
      return () => window.removeEventListener('online', handleOnline);
    }
  }, [fetchData, autoSync]);

  const refresh = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    isFromCache,
    refresh,
  };
}

export default useOffline;
