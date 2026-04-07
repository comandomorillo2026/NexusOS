/**
 * Condo Offline-First System - AETHEL OS
 * 
 * This module provides offline capabilities for the Condo Management System
 * using IndexedDB for data persistence and background sync.
 */

// IndexedDB Configuration
const DB_NAME = 'condo_offline_db';
const DB_VERSION = 1;

// Store names
const STORES = {
  PROPERTIES: 'properties',
  UNITS: 'units',
  RESIDENTS: 'residents',
  INVOICES: 'invoices',
  PAYMENTS: 'payments',
  RESERVATIONS: 'reservations',
  MAINTENANCE: 'maintenance',
  ANNOUNCEMENTS: 'announcements',
  SYNC_QUEUE: 'sync_queue',
} as const;

// Types
export interface OfflineData {
  id: string;
  data: unknown;
  timestamp: number;
  synced: boolean;
  checksum?: string;
}

export interface SyncQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  entity: string;
  entityId: string;
  data: unknown;
  timestamp: number;
  retries: number;
  lastError?: string;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSync: number | null;
  pendingItems: number;
  isSyncing: boolean;
}

// Database initialization
let db: IDBDatabase | null = null;

export async function initOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Failed to open IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Create object stores
      Object.values(STORES).forEach(storeName => {
        if (!database.objectStoreNames.contains(storeName)) {
          const store = database.createObjectStore(storeName, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('synced', 'synced', { unique: false });
        }
      });
    };
  });
}

// Generic CRUD operations
export async function saveOfflineData<T>(
  storeName: string,
  id: string,
  data: T
): Promise<void> {
  const database = await initOfflineDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    const offlineData: OfflineData = {
      id,
      data,
      timestamp: Date.now(),
      synced: false,
    };

    const request = store.put(offlineData);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getOfflineData<T>(
  storeName: string,
  id: string
): Promise<T | null> {
  const database = await initOfflineDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    request.onsuccess = () => {
      const result = request.result as OfflineData | undefined;
      resolve(result ? (result.data as T) : null);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getAllOfflineData<T>(storeName: string): Promise<T[]> {
  const database = await initOfflineDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => {
      const results = request.result as OfflineData[];
      resolve(results.map(r => r.data as T));
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deleteOfflineData(
  storeName: string,
  id: string
): Promise<void> {
  const database = await initOfflineDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Sync Queue Operations
export async function addToSyncQueue(
  action: SyncQueueItem['action'],
  entity: string,
  entityId: string,
  data: unknown
): Promise<void> {
  const database = await initOfflineDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.SYNC_QUEUE], 'readwrite');
    const store = transaction.objectStore(STORES.SYNC_QUEUE);
    
    const item: SyncQueueItem = {
      id: `${entity}_${entityId}_${Date.now()}`,
      action,
      entity,
      entityId,
      data,
      timestamp: Date.now(),
      retries: 0,
    };

    const request = store.add(item);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  return getAllOfflineData<SyncQueueItem>(STORES.SYNC_QUEUE);
}

export async function removeFromSyncQueue(id: string): Promise<void> {
  return deleteOfflineData(STORES.SYNC_QUEUE, id);
}

export async function updateSyncQueueItem(
  id: string,
  updates: Partial<SyncQueueItem>
): Promise<void> {
  const database = await initOfflineDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.SYNC_QUEUE], 'readwrite');
    const store = transaction.objectStore(STORES.SYNC_QUEUE);
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const item = getRequest.result as SyncQueueItem;
      if (item) {
        const updated = { ...item, ...updates };
        store.put(updated);
      }
      resolve();
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

// Sync Process
export async function processSyncQueue(
  apiEndpoints: Record<string, (data: unknown) => Promise<Response>>
): Promise<{ success: number; failed: number; errors: string[] }> {
  const queue = await getSyncQueue();
  const results = { success: 0, failed: 0, errors: [] as string[] };

  for (const item of queue) {
    try {
      const endpoint = apiEndpoints[`${item.entity}_${item.action}`];
      if (!endpoint) {
        throw new Error(`No endpoint for ${item.entity}_${item.action}`);
      }

      const response = await endpoint(item.data);
      
      if (response.ok) {
        await removeFromSyncQueue(item.id);
        results.success++;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      results.failed++;
      results.errors.push(`${item.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Update retry count
      await updateSyncQueueItem(item.id, {
        retries: item.retries + 1,
        lastError: error instanceof Error ? error.message : 'Unknown error',
      });

      // Remove if too many retries
      if (item.retries >= 3) {
        await removeFromSyncQueue(item.id);
      }
    }
  }

  return results;
}

// Online/Offline Detection
export function isOnline(): boolean {
  return navigator.onLine;
}

export function addOnlineListener(callback: () => void): () => void {
  window.addEventListener('online', callback);
  return () => window.removeEventListener('online', callback);
}

export function addOfflineListener(callback: () => void): () => void {
  window.addEventListener('offline', callback);
  return () => window.removeEventListener('offline', callback);
}

// Sync Status
export async function getSyncStatus(): Promise<SyncStatus> {
  const queue = await getSyncQueue();
  
  return {
    isOnline: isOnline(),
    lastSync: localStorage.getItem('lastSync') 
      ? parseInt(localStorage.getItem('lastSync')!) 
      : null,
    pendingItems: queue.length,
    isSyncing: false, // This would be managed by the sync context
  };
}

export function setLastSyncTime(timestamp: number): void {
  localStorage.setItem('lastSync', timestamp.toString());
}

// Conflict Resolution
export type ConflictResolution = 'server' | 'client' | 'merge';

export function resolveConflict<T>(
  serverData: T,
  clientData: T,
  strategy: ConflictResolution
): T {
  switch (strategy) {
    case 'server':
      return serverData;
    case 'client':
      return clientData;
    case 'merge':
      // Simple merge - in production this would be more sophisticated
      return { ...serverData, ...clientData };
    default:
      return serverData;
  }
}

// Data Cache Manager
export class CondoDataCache {
  private static instance: CondoDataCache;
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private ttl: number = 5 * 60 * 1000; // 5 minutes

  static getInstance(): CondoDataCache {
    if (!CondoDataCache.instance) {
      CondoDataCache.instance = new CondoDataCache();
    }
    return CondoDataCache.instance;
  }

  set(key: string, data: unknown): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidateAll(): void {
    this.cache.clear();
  }
}

// React Hook for Offline Data
export function useOfflineStatus() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = React.useState<SyncStatus | null>(null);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Get initial sync status
    getSyncStatus().then(setSyncStatus);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, syncStatus };
}

// Need to import React for the hook
import React from 'react';

// Export utilities
export const offlineUtils = {
  initDB: initOfflineDB,
  save: saveOfflineData,
  get: getOfflineData,
  getAll: getAllOfflineData,
  delete: deleteOfflineData,
  addToQueue: addToSyncQueue,
  getQueue: getSyncQueue,
  processQueue: processSyncQueue,
  getStatus: getSyncStatus,
  cache: CondoDataCache.getInstance(),
};

export default offlineUtils;
