// ============================================
// NexusOS IndexedDB - Offline Data Storage
// ============================================

const DB_NAME = 'nexusos-offline';
const DB_VERSION = 1;

// Database store names
export const STORES = {
  // Generic data stores for each industry
  CLINIC_PATIENTS: 'clinic-patients',
  CLINIC_APPOINTMENTS: 'clinic-appointments',
  CLINIC_VITALS: 'clinic-vitals',
  CLINIC_NOTES: 'clinic-notes',
  
  NURSE_VISITS: 'nurse-visits',
  NURSE_MEDICATIONS: 'nurse-medications',
  NURSE_VITALS: 'nurse-vitals',
  
  LAW_CASES: 'law-cases',
  LAW_CLIENTS: 'law-clients',
  LAW_TIME_ENTRIES: 'law-time-entries',
  LAW_NOTES: 'law-notes',
  
  BEAUTY_APPOINTMENTS: 'beauty-appointments',
  BEAUTY_CLIENTS: 'beauty-clients',
  BEAUTY_SALES: 'beauty-sales',
  
  // Sync queue
  SYNC_QUEUE: 'sync-queue',
  
  // Attachments (photos, signatures, documents)
  ATTACHMENTS: 'attachments',
  
  // Form drafts
  FORM_DRAFTS: 'form-drafts',
  
  // Cached API responses
  API_CACHE: 'api-cache',
} as const;

// Types
export interface OfflineRecord {
  id: string;
  _offlineId?: string;
  _synced?: boolean;
  _createdAt: string;
  _updatedAt: string;
}

export interface SyncQueueItem {
  id: string;
  url: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  storeName: string;
  recordId: string;
  data: unknown;
  retries: number;
  createdAt: string;
  lastAttempt?: string;
  error?: string;
}

export interface Attachment {
  id: string;
  type: 'photo' | 'signature' | 'document';
  mimeType: string;
  data: Blob;
  filename: string;
  recordType?: string;
  recordId?: string;
  createdAt: string;
  synced: boolean;
}

export interface FormDraft {
  id: string;
  formType: string;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ApiCacheEntry {
  key: string;
  data: unknown;
  cachedAt: string;
  expiresIn: number;
}

// Database instance
let dbInstance: IDBDatabase | null = null;

// Initialize database
export async function initDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores for each data type
      Object.values(STORES).forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          const store = db.createObjectStore(storeName, { keyPath: 'id' });
          
          // Add indexes based on store type
          if (storeName.includes('patients') || storeName.includes('clients')) {
            store.createIndex('name', 'name', { unique: false });
            store.createIndex('synced', '_synced', { unique: false });
          }
          
          if (storeName.includes('appointments') || storeName.includes('visits')) {
            store.createIndex('date', 'date', { unique: false });
            store.createIndex('status', 'status', { unique: false });
            store.createIndex('synced', '_synced', { unique: false });
          }
          
          if (storeName === STORES.SYNC_QUEUE) {
            store.createIndex('createdAt', 'createdAt', { unique: false });
          }
          
          if (storeName === STORES.ATTACHMENTS) {
            store.createIndex('type', 'type', { unique: false });
            store.createIndex('recordId', 'recordId', { unique: false });
            store.createIndex('synced', 'synced', { unique: false });
          }
          
          if (storeName === STORES.FORM_DRAFTS) {
            store.createIndex('formType', 'formType', { unique: false });
          }
          
          if (storeName === STORES.API_CACHE) {
            store.createIndex('cachedAt', 'cachedAt', { unique: false });
          }
        }
      });
    };
  });
}

// Generic CRUD operations
export async function addItem<T extends OfflineRecord>(
  storeName: string,
  item: T
): Promise<T> {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    
    const itemWithMeta = {
      ...item,
      _synced: false,
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
    };
    
    const request = store.add(itemWithMeta);
    
    request.onsuccess = () => resolve(itemWithMeta);
    request.onerror = () => reject(request.error);
  });
}

export async function updateItem<T extends OfflineRecord>(
  storeName: string,
  item: T
): Promise<T> {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    
    const itemWithMeta = {
      ...item,
      _synced: false,
      _updatedAt: new Date().toISOString(),
    };
    
    const request = store.put(itemWithMeta);
    
    request.onsuccess = () => resolve(itemWithMeta);
    request.onerror = () => reject(request.error);
  });
}

export async function getItem<T>(
  storeName: string,
  id: string
): Promise<T | null> {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);
    
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllItems<T>(
  storeName: string
): Promise<T[]> {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteItem(
  storeName: string,
  id: string
): Promise<void> {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getItemsByIndex<T>(
  storeName: string,
  indexName: string,
  value: IDBValidKey
): Promise<T[]> {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);
    
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function getUnsyncedItems<T>(
  storeName: string
): Promise<T[]> {
  return getItemsByIndex<T>(storeName, 'synced', false);
}

// Attachment operations (for photos, signatures)
export async function saveAttachment(
  type: 'photo' | 'signature' | 'document',
  data: Blob,
  filename: string,
  recordType?: string,
  recordId?: string
): Promise<Attachment> {
  const db = await initDB();
  
  const attachment: Attachment = {
    id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    mimeType: data.type,
    data,
    filename,
    recordType,
    recordId,
    createdAt: new Date().toISOString(),
    synced: false,
  };
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.ATTACHMENTS, 'readwrite');
    const store = transaction.objectStore(STORES.ATTACHMENTS);
    const request = store.add(attachment);
    
    request.onsuccess = () => resolve(attachment);
    request.onerror = () => reject(request.error);
  });
}

export async function getAttachment(id: string): Promise<Attachment | null> {
  return getItem<Attachment>(STORES.ATTACHMENTS, id);
}

export async function getAttachmentsByRecord(
  recordId: string
): Promise<Attachment[]> {
  return getItemsByIndex<Attachment>(STORES.ATTACHMENTS, 'recordId', recordId);
}

// Form draft operations
export async function saveFormDraft(
  formType: string,
  data: Record<string, unknown>
): Promise<FormDraft> {
  const db = await initDB();
  
  const draft: FormDraft = {
    id: `draft-${formType}-${Date.now()}`,
    formType,
    data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.FORM_DRAFTS, 'readwrite');
    const store = transaction.objectStore(STORES.FORM_DRAFTS);
    const request = store.put(draft);
    
    request.onsuccess = () => resolve(draft);
    request.onerror = () => reject(request.error);
  });
}

export async function getFormDrafts(formType: string): Promise<FormDraft[]> {
  return getItemsByIndex<FormDraft>(STORES.FORM_DRAFTS, 'formType', formType);
}

export async function deleteFormDraft(id: string): Promise<void> {
  return deleteItem(STORES.FORM_DRAFTS, id);
}

// API Cache operations
export async function cacheApiResponse(
  key: string,
  data: unknown,
  expiresInMs: number = 5 * 60 * 1000 // 5 minutes default
): Promise<void> {
  const db = await initDB();
  
  const entry: ApiCacheEntry = {
    key,
    data,
    cachedAt: new Date().toISOString(),
    expiresIn: expiresInMs,
  };
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.API_CACHE, 'readwrite');
    const store = transaction.objectStore(STORES.API_CACHE);
    const request = store.put(entry);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getCachedApiResponse<T>(key: string): Promise<T | null> {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.API_CACHE, 'readonly');
    const store = transaction.objectStore(STORES.API_CACHE);
    const request = store.get(key);
    
    request.onsuccess = () => {
      const entry = request.result as ApiCacheEntry | undefined;
      
      if (!entry) {
        resolve(null);
        return;
      }
      
      const cachedTime = new Date(entry.cachedAt).getTime();
      const expiresAt = cachedTime + entry.expiresIn;
      
      if (Date.now() > expiresAt) {
        // Cache expired
        resolve(null);
        return;
      }
      
      resolve(entry.data as T);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function clearApiCache(): Promise<void> {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.API_CACHE, 'readwrite');
    const store = transaction.objectStore(STORES.API_CACHE);
    const request = store.clear();
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Clear all offline data
export async function clearAllOfflineData(): Promise<void> {
  const db = await initDB();
  
  const clearPromises = Object.values(STORES).map((storeName) => {
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
  
  await Promise.all(clearPromises);
}

// Get storage estimate
export async function getStorageEstimate(): Promise<{
  usage: number;
  quota: number;
  percentUsed: number;
}> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage || 0,
      quota: estimate.quota || 0,
      percentUsed: estimate.quota ? ((estimate.usage || 0) / estimate.quota) * 100 : 0,
    };
  }
  
  return { usage: 0, quota: 0, percentUsed: 0 };
}

// Industry-specific helpers
export const ClinicDB = {
  async savePatient(patient: Record<string, unknown>) {
    return addItem(STORES.CLINIC_PATIENTS, patient as unknown as OfflineRecord);
  },
  async getPatients() {
    return getAllItems(STORES.CLINIC_PATIENTS);
  },
  async saveAppointment(appointment: Record<string, unknown>) {
    return addItem(STORES.CLINIC_APPOINTMENTS, appointment as unknown as OfflineRecord);
  },
  async getAppointments() {
    return getAllItems(STORES.CLINIC_APPOINTMENTS);
  },
  async saveVitals(vitals: Record<string, unknown>) {
    return addItem(STORES.CLINIC_VITALS, vitals as unknown as OfflineRecord);
  },
  async getVitals() {
    return getAllItems(STORES.CLINIC_VITALS);
  },
  async saveNote(note: Record<string, unknown>) {
    return addItem(STORES.CLINIC_NOTES, note as unknown as OfflineRecord);
  },
  async getNotes() {
    return getAllItems(STORES.CLINIC_NOTES);
  },
};

export const NurseDB = {
  async saveVisit(visit: Record<string, unknown>) {
    return addItem(STORES.NURSE_VISITS, visit as unknown as OfflineRecord);
  },
  async getVisits() {
    return getAllItems(STORES.NURSE_VISITS);
  },
  async saveMedication(med: Record<string, unknown>) {
    return addItem(STORES.NURSE_MEDICATIONS, med as unknown as OfflineRecord);
  },
  async getMedications() {
    return getAllItems(STORES.NURSE_MEDICATIONS);
  },
  async saveVitals(vitals: Record<string, unknown>) {
    return addItem(STORES.NURSE_VITALS, vitals as unknown as OfflineRecord);
  },
  async getVitals() {
    return getAllItems(STORES.NURSE_VITALS);
  },
};

export const LawDB = {
  async saveCase(caseItem: Record<string, unknown>) {
    return addItem(STORES.LAW_CASES, caseItem as unknown as OfflineRecord);
  },
  async getCases() {
    return getAllItems(STORES.LAW_CASES);
  },
  async saveClient(client: Record<string, unknown>) {
    return addItem(STORES.LAW_CLIENTS, client as unknown as OfflineRecord);
  },
  async getClients() {
    return getAllItems(STORES.LAW_CLIENTS);
  },
  async saveTimeEntry(entry: Record<string, unknown>) {
    return addItem(STORES.LAW_TIME_ENTRIES, entry as unknown as OfflineRecord);
  },
  async getTimeEntries() {
    return getAllItems(STORES.LAW_TIME_ENTRIES);
  },
  async saveNote(note: Record<string, unknown>) {
    return addItem(STORES.LAW_NOTES, note as unknown as OfflineRecord);
  },
  async getNotes() {
    return getAllItems(STORES.LAW_NOTES);
  },
};

export const BeautyDB = {
  async saveAppointment(appointment: Record<string, unknown>) {
    return addItem(STORES.BEAUTY_APPOINTMENTS, appointment as unknown as OfflineRecord);
  },
  async getAppointments() {
    return getAllItems(STORES.BEAUTY_APPOINTMENTS);
  },
  async saveClient(client: Record<string, unknown>) {
    return addItem(STORES.BEAUTY_CLIENTS, client as unknown as OfflineRecord);
  },
  async getClients() {
    return getAllItems(STORES.BEAUTY_CLIENTS);
  },
  async saveSale(sale: Record<string, unknown>) {
    return addItem(STORES.BEAUTY_SALES, sale as unknown as OfflineRecord);
  },
  async getSales() {
    return getAllItems(STORES.BEAUTY_SALES);
  },
};
