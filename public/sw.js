// ============================================
// NexusOS Service Worker - PWA Offline Support
// ============================================

const CACHE_NAME = 'nexusos-v1';
const OFFLINE_CACHE = 'nexusos-offline-v1';
const SYNC_QUEUE = 'nexusos-sync-queue';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/logo.svg',
  // Core pages
  '/clinic',
  '/lawfirm',
  '/beauty',
  '/nurse',
  '/admin',
  '/login',
  '/portal',
];

// API patterns to cache with network-first strategy
const API_PATTERNS = [
  /\/api\/clinic/,
  /\/api\/lawfirm/,
  /\/api\/beauty/,
  /\/api\/nurse/,
  /\/api\/patients/,
  /\/api\/cases/,
  /\/api\/appointments/,
];

// Static asset patterns to cache with cache-first strategy
const STATIC_PATTERNS = [
  /\.(?:js|css|woff2?|ttf|eot)$/,
  /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
];

// Install event - precache essential assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching assets...');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('[SW] Precache complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Precache failed:', error);
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== OFFLINE_CACHE)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients...');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests with various strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests for caching (they'll be handled by sync queue)
  if (request.method !== 'GET') {
    event.respondWith(handleNonGetRequest(event));
    return;
  }
  
  // Handle API requests - Network first, fall back to cache
  if (API_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // Handle static assets - Cache first, fall back to network
  if (STATIC_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // Handle navigation requests - Network first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirst(request)
        .catch(() => caches.match('/') || caches.match('/offline'))
    );
    return;
  }
  
  // Default: Stale while revalidate
  event.respondWith(staleWhileRevalidate(request));
});

// Network First Strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for API requests
    if (API_PATTERNS.some(pattern => pattern.test(new URL(request.url).pathname))) {
      return new Response(
        JSON.stringify({ 
          error: 'offline', 
          message: 'No hay conexión. Los datos se guardarán localmente.' 
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    throw error;
  }
}

// Cache First Strategy
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Cache and network failed for:', request.url);
    throw error;
  }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, networkResponse.clone());
        });
      }
      return networkResponse;
    })
    .catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

// Handle non-GET requests (POST, PUT, DELETE, PATCH)
async function handleNonGetRequest(event) {
  const { request } = event;
  
  try {
    // Try to send to network
    const response = await fetch(request);
    return response;
  } catch (error) {
    // Network failed - queue for background sync
    console.log('[SW] Network failed, queuing for sync:', request.url);
    
    // Clone request data before storing
    const requestData = await cloneRequest(request);
    
    // Store in IndexedDB sync queue
    await storeInSyncQueue({
      id: Date.now(),
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: requestData,
      timestamp: new Date().toISOString(),
      retries: 0
    });
    
    // Notify the client
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_QUEUED',
        data: {
          url: request.url,
          method: request.method,
          timestamp: new Date().toISOString()
        }
      });
    });
    
    // Return success response to avoid breaking the app
    return new Response(
      JSON.stringify({
        success: true,
        offline: true,
        message: 'Datos guardados localmente. Se sincronizarán cuando vuelva la conexión.'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Clone request data for storage
async function cloneRequest(request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      return await request.json();
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const entries = {};
      for (const [key, value] of formData.entries()) {
        entries[key] = value;
      }
      return entries;
    } else {
      return await request.text();
    }
  } catch {
    return null;
  }
}

// Store request in sync queue (using Cache API as simple storage)
async function storeInSyncQueue(data) {
  const cache = await caches.open(SYNC_QUEUE);
  const key = `sync-${data.id}`;
  await cache.put(key, new Response(JSON.stringify(data)));
  console.log('[SW] Stored in sync queue:', key);
}

// Background Sync Event
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'nexusos-sync') {
    event.waitUntil(processSyncQueue());
  }
});

// Process sync queue
async function processSyncQueue() {
  console.log('[SW] Processing sync queue...');
  
  const cache = await caches.open(SYNC_QUEUE);
  const keys = await cache.keys();
  
  const failedItems = [];
  
  for (const key of keys) {
    if (!key.url.includes('sync-')) continue;
    
    const response = await cache.match(key);
    const data = await response.json();
    
    try {
      // Reconstruct and send request
      const fetchOptions = {
        method: data.method,
        headers: data.headers,
      };
      
      if (data.body) {
        fetchOptions.body = JSON.stringify(data.body);
        fetchOptions.headers['Content-Type'] = 'application/json';
      }
      
      const networkResponse = await fetch(data.url, fetchOptions);
      
      if (networkResponse.ok) {
        console.log('[SW] Sync successful:', key.url);
        await cache.delete(key);
        
        // Notify client of successful sync
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'SYNC_COMPLETE',
            data: {
              url: data.url,
              method: data.method
            }
          });
        });
      } else {
        throw new Error(`HTTP ${networkResponse.status}`);
      }
    } catch (error) {
      console.error('[SW] Sync failed for:', key.url, error);
      
      // Update retry count
      data.retries = (data.retries || 0) + 1;
      
      // Keep in queue if retries < 5
      if (data.retries < 5) {
        failedItems.push(data);
        await cache.put(key, new Response(JSON.stringify(data)));
      } else {
        // Give up after 5 retries
        console.error('[SW] Giving up on sync after 5 retries:', key.url);
        await cache.delete(key);
        
        // Notify client of failed sync
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'SYNC_FAILED',
            data: {
              url: data.url,
              method: data.method,
              error: 'Max retries exceeded'
            }
          });
        });
      }
    }
  }
  
  console.log('[SW] Sync complete. Remaining items:', failedItems.length);
}

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);
  
  let data = { title: 'NexusOS', body: 'Nueva notificación' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }
  
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      timestamp: Date.now()
    },
    actions: [
      { action: 'open', title: 'Abrir' },
      { action: 'dismiss', title: 'Descartar' }
    ],
    tag: data.tag || 'nexusos-notification',
    renotify: true
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return;
  }
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        // Check if there's already a window open
        for (const client of clients) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window if none found
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      })
  );
});

// Message event - handle messages from main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'GET_SYNC_STATUS') {
    getSyncQueueStatus().then(status => {
      event.ports[0]?.postMessage(status);
    });
  }
  
  if (event.data.type === 'CLEAR_SYNC_QUEUE') {
    clearSyncQueue().then(() => {
      event.ports[0]?.postMessage({ success: true });
    });
  }
  
  if (event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => cache.addAll(event.data.urls))
    );
  }
});

// Get sync queue status
async function getSyncQueueStatus() {
  const cache = await caches.open(SYNC_QUEUE);
  const keys = await cache.keys();
  const items = [];
  
  for (const key of keys) {
    if (key.url.includes('sync-')) {
      const response = await cache.match(key);
      const data = await response.json();
      items.push(data);
    }
  }
  
  return {
    pending: items.length,
    items: items
  };
}

// Clear sync queue
async function clearSyncQueue() {
  const cache = await caches.open(SYNC_QUEUE);
  const keys = await cache.keys();
  
  for (const key of keys) {
    await cache.delete(key);
  }
  
  console.log('[SW] Sync queue cleared');
}

console.log('[SW] Service Worker loaded');
