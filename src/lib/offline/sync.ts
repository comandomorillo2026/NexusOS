// ============================================
// NexusOS Sync Manager - Background Sync
// ============================================

import { STORES, initDB, getUnsyncedItems, updateItem, type SyncQueueItem, type OfflineRecord } from './db';

// Sync event types
export type SyncEventType = 
  | 'sync-started'
  | 'sync-progress'
  | 'sync-complete'
  | 'sync-error'
  | 'item-synced'
  | 'item-failed';

export interface SyncEvent {
  type: SyncEventType;
  total?: number;
  processed?: number;
  successful?: number;
  failed?: number;
  item?: SyncQueueItem;
  error?: string;
}

type SyncListener = (event: SyncEvent) => void;

class SyncManager {
  private listeners: Set<SyncListener> = new Set();
  private syncing = false;
  private syncInterval: NodeJS.Timeout | null = null;
  
  // Subscribe to sync events
  subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  // Emit sync event
  private emit(event: SyncEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('[SyncManager] Listener error:', error);
      }
    });
  }
  
  // Check if online
  isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }
  
  // Add item to sync queue
  async addToQueue(
    url: string,
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    storeName: string,
    recordId: string,
    data: unknown
  ): Promise<SyncQueueItem> {
    const db = await initDB();
    
    const item: SyncQueueItem = {
      id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      url,
      method,
      storeName,
      recordId,
      data,
      retries: 0,
      createdAt: new Date().toISOString(),
    };
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
      const store = transaction.objectStore(STORES.SYNC_QUEUE);
      const request = store.add(item);
      
      request.onsuccess = () => resolve(item);
      request.onerror = () => reject(request.error);
    });
  }
  
  // Get sync queue
  async getQueue(): Promise<SyncQueueItem[]> {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.SYNC_QUEUE, 'readonly');
      const store = transaction.objectStore(STORES.SYNC_QUEUE);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }
  
  // Remove item from queue
  async removeFromQueue(id: string): Promise<void> {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
      const store = transaction.objectStore(STORES.SYNC_QUEUE);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  
  // Update item in queue
  async updateQueueItem(item: SyncQueueItem): Promise<void> {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
      const store = transaction.objectStore(STORES.SYNC_QUEUE);
      const request = store.put(item);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  
  // Process sync queue
  async sync(): Promise<{
    successful: number;
    failed: number;
    total: number;
  }> {
    if (this.syncing || !this.isOnline()) {
      return { successful: 0, failed: 0, total: 0 };
    }
    
    this.syncing = true;
    this.emit({ type: 'sync-started' });
    
    const queue = await this.getQueue();
    const total = queue.length;
    let processed = 0;
    let successful = 0;
    let failed = 0;
    
    for (const item of queue) {
      processed++;
      this.emit({ 
        type: 'sync-progress', 
        total, 
        processed, 
        successful, 
        failed 
      });
      
      try {
        const response = await this.syncItem(item);
        
        if (response.ok) {
          successful++;
          
          // Mark the record as synced
          try {
            const record = await this.getRecord(item.storeName, item.recordId);
            if (record) {
              record._synced = true;
              await updateItem(item.storeName, record);
            }
          } catch (error) {
            console.error('[SyncManager] Failed to mark record as synced:', error);
          }
          
          // Remove from queue
          await this.removeFromQueue(item.id);
          
          this.emit({ type: 'item-synced', item });
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        failed++;
        
        // Update retry count
        item.retries++;
        item.lastAttempt = new Date().toISOString();
        item.error = error instanceof Error ? error.message : 'Unknown error';
        
        // Keep in queue if retries < 5
        if (item.retries < 5) {
          await this.updateQueueItem(item);
        } else {
          // Remove after max retries
          await this.removeFromQueue(item.id);
        }
        
        this.emit({ type: 'item-failed', item, error: item.error });
      }
    }
    
    this.syncing = false;
    this.emit({ 
      type: 'sync-complete', 
      total, 
      processed, 
      successful, 
      failed 
    });
    
    return { successful, failed, total };
  }
  
  // Sync single item
  private async syncItem(item: SyncQueueItem): Promise<Response> {
    const options: RequestInit = {
      method: item.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item.data),
    };
    
    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth-token');
      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }
    
    return fetch(item.url, options);
  }
  
  // Get record from store
  private async getRecord(storeName: string, id: string): Promise<OfflineRecord | null> {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }
  
  // Start periodic sync
  startPeriodicSync(intervalMs: number = 60000): void {
    if (this.syncInterval) {
      this.stopPeriodicSync();
    }
    
    // Initial sync
    if (this.isOnline()) {
      this.sync();
    }
    
    // Periodic sync
    this.syncInterval = setInterval(() => {
      if (this.isOnline()) {
        this.sync();
      }
    }, intervalMs);
    
    // Listen for online event
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
    }
  }
  
  // Stop periodic sync
  stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
    }
  }
  
  // Handle online event
  private handleOnline = (): void => {
    console.log('[SyncManager] Back online, starting sync...');
    this.sync();
  };
  
  // Get sync status
  async getStatus(): Promise<{
    pending: number;
    oldestItem?: string;
  }> {
    const queue = await this.getQueue();
    
    let oldestItem: string | undefined;
    if (queue.length > 0) {
      const sorted = [...queue].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      oldestItem = sorted[0].createdAt;
    }
    
    return {
      pending: queue.length,
      oldestItem,
    };
  }
  
  // Clear sync queue
  async clearQueue(): Promise<void> {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
      const store = transaction.objectStore(STORES.SYNC_QUEUE);
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  
  // Register for background sync (if supported)
  async registerBackgroundSync(): Promise<void> {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('nexusos-sync');
        console.log('[SyncManager] Background sync registered');
      } catch (error) {
        console.error('[SyncManager] Failed to register background sync:', error);
      }
    }
  }
}

// Export singleton
export const syncManager = new SyncManager();

// Utility function to save offline and queue for sync
export async function saveOfflineAndSync<T extends OfflineRecord>(
  storeName: string,
  apiEndpoint: string,
  method: 'POST' | 'PUT' | 'PATCH',
  data: T
): Promise<{ saved: T; queued: boolean }> {
  // Save to IndexedDB
  const saved = await updateItem(storeName, data);
  
  // If offline, add to sync queue
  const queued = !navigator.onLine;
  
  if (queued) {
    await syncManager.addToQueue(
      apiEndpoint,
      method,
      storeName,
      data.id,
      data
    );
  } else {
    // Try to sync immediately
    try {
      const response = await fetch(apiEndpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        saved._synced = true;
        await updateItem(storeName, saved);
      } else {
        // Queue for later
        await syncManager.addToQueue(
          apiEndpoint,
          method,
          storeName,
          data.id,
          data
        );
        return { saved, queued: true };
      }
    } catch {
      // Queue for later
      await syncManager.addToQueue(
        apiEndpoint,
        method,
        storeName,
        data.id,
        data
      );
      return { saved, queued: true };
    }
  }
  
  return { saved, queued };
}

// Hook for React components
export function useSyncStatus() {
  const [status, setStatus] = React.useState({
    isOnline: true,
    pending: 0,
    syncing: false,
  });
  
  React.useEffect(() => {
    // Initial status
    setStatus(prev => ({ ...prev, isOnline: navigator.onLine }));
    
    // Listen for online/offline
    const handleOnline = () => setStatus(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setStatus(prev => ({ ...prev, isOnline: false }));
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Subscribe to sync events
    const unsubscribe = syncManager.subscribe((event) => {
      if (event.type === 'sync-started') {
        setStatus(prev => ({ ...prev, syncing: true }));
      } else if (event.type === 'sync-complete') {
        setStatus(prev => ({ ...prev, syncing: false }));
      }
    });
    
    // Get pending count
    syncManager.getStatus().then(s => {
      setStatus(prev => ({ ...prev, pending: s.pending }));
    });
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);
  
  return status;
}

import React from 'react';
