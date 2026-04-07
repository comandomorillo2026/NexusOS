// CondoOS - Push Notifications System
// Real-time notifications with sound alerts

// Notification types
export type NotificationType = 
  | 'invoice_created'
  | 'payment_reminder'
  | 'payment_overdue'
  | 'payment_confirmed'
  | 'reservation_confirmed'
  | 'reservation_cancelled'
  | 'maintenance_update'
  | 'announcement'
  | 'vote_invitation'
  | 'vote_reminder'
  | 'package_arrived'
  | 'visitor_announced';

export interface CondoNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  propertyId: string;
  unitId?: string;
  residentId?: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: Date;
}

// Sound configurations for different notification types
export const NOTIFICATION_SOUNDS: Record<NotificationType, { sound: string; vibration: number[] }> = {
  invoice_created: { sound: '/sounds/notification-gentle.mp3', vibration: [200] },
  payment_reminder: { sound: '/sounds/notification-alert.mp3', vibration: [200, 100, 200] },
  payment_overdue: { sound: '/sounds/notification-urgent.mp3', vibration: [300, 100, 300, 100, 300] },
  payment_confirmed: { sound: '/sounds/success.mp3', vibration: [100] },
  reservation_confirmed: { sound: '/sounds/success.mp3', vibration: [100] },
  reservation_cancelled: { sound: '/sounds/notification-alert.mp3', vibration: [200, 100] },
  maintenance_update: { sound: '/sounds/notification-gentle.mp3', vibration: [150] },
  announcement: { sound: '/sounds/announcement.mp3', vibration: [200, 50, 200] },
  vote_invitation: { sound: '/sounds/vote.mp3', vibration: [300, 100, 300] },
  vote_reminder: { sound: '/sounds/notification-alert.mp3', vibration: [200, 100, 200] },
  package_arrived: { sound: '/sounds/package.mp3', vibration: [100, 50, 100, 50, 100] },
  visitor_announced: { sound: '/sounds/doorbell.mp3', vibration: [500] },
};

// Play notification sound
export function playNotificationSound(type: NotificationType): void {
  if (typeof window === 'undefined') return;
  
  const config = NOTIFICATION_SOUNDS[type];
  if (!config) return;
  
  // Create audio element
  const audio = new Audio(config.sound);
  audio.volume = 0.7;
  
  // Play sound
  audio.play().catch(err => {
    console.log('Could not play notification sound:', err);
  });
  
  // Vibrate if supported
  if ('vibrate' in navigator) {
    navigator.vibrate(config.vibration);
  }
}

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
}

// Show browser notification
export async function showBrowserNotification(
  title: string,
  options: {
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: Record<string, unknown>;
    type: NotificationType;
  }
): Promise<Notification | null> {
  const hasPermission = await requestNotificationPermission();
  
  if (!hasPermission) {
    console.log('Notification permission not granted');
    return null;
  }
  
  // Play sound
  playNotificationSound(options.type);
  
  // Create notification
  const notification = new Notification(title, {
    body: options.body,
    icon: options.icon || '/icons/icon-192x192.png',
    badge: options.badge || '/icons/badge-72x72.png',
    tag: options.tag,
    data: options.data,
    requireInteraction: ['payment_overdue', 'vote_invitation'].includes(options.type),
  });
  
  // Handle click
  notification.onclick = () => {
    window.focus();
    notification.close();
    
    // Navigate to relevant page
    if (options.data?.url) {
      window.location.href = options.data.url as string;
    }
  };
  
  return notification;
}

// In-app notification toast
export interface ToastNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Notification queue for offline support
interface QueuedNotification {
  notification: CondoNotification;
  attempts: number;
  lastAttempt?: Date;
}

const notificationQueue: QueuedNotification[] = [];

// Add notification to queue (for offline support)
export function queueNotification(notification: CondoNotification): void {
  notificationQueue.push({
    notification,
    attempts: 0,
  });
}

// Process queued notifications
export async function processNotificationQueue(): Promise<void> {
  if (!navigator.onLine) return;
  
  while (notificationQueue.length > 0) {
    const item = notificationQueue[0];
    
    try {
      // Attempt to send notification
      await sendNotificationToServer(item.notification);
      notificationQueue.shift();
    } catch (error) {
      item.attempts++;
      item.lastAttempt = new Date();
      
      // Remove if too many attempts
      if (item.attempts >= 3) {
        notificationQueue.shift();
      }
      break;
    }
  }
}

// Send notification to server
async function sendNotificationToServer(notification: CondoNotification): Promise<void> {
  const response = await fetch('/api/condo/notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(notification),
  });
  
  if (!response.ok) {
    throw new Error('Failed to send notification');
  }
}

// Notification badge count
export function updateNotificationBadge(count: number): void {
  if ('setAppBadge' in navigator) {
    (navigator as Navigator & { setAppBadge: (count: number) => Promise<void> }).setAppBadge(count);
  }
  
  // Update document title
  if (count > 0) {
    document.title = `(${count}) CondoOS`;
  } else {
    document.title = 'CondoOS';
  }
}

// Clear notification badge
export function clearNotificationBadge(): void {
  if ('clearAppBadge' in navigator) {
    (navigator as Navigator & { clearAppBadge: () => Promise<void> }).clearAppBadge();
  }
  document.title = 'CondoOS';
}

// Subscribe to push notifications
export async function subscribeToPushNotifications(
  propertyId: string,
  residentId: string
): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push notifications not supported');
    return null;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      return subscription;
    }
    
    // Create new subscription
    // Note: In production, this VAPID key should come from environment
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    
    if (!vapidPublicKey) {
      console.log('VAPID public key not configured');
      return null;
    }
    
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });
    
    // Send subscription to server
    await fetch('/api/condo/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyId,
        residentId,
        subscription: subscription.toJSON(),
      }),
    });
    
    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return null;
  }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      
      // Notify server
      await fetch('/api/condo/notifications/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return false;
  }
}

// Helper to convert VAPID key
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

// Notification settings
export interface NotificationSettings {
  invoice_created: boolean;
  payment_reminder: boolean;
  payment_overdue: boolean;
  payment_confirmed: boolean;
  reservation_confirmed: boolean;
  maintenance_update: boolean;
  announcement: boolean;
  vote_invitation: boolean;
  package_arrived: boolean;
  visitor_announced: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  invoice_created: true,
  payment_reminder: true,
  payment_overdue: true,
  payment_confirmed: true,
  reservation_confirmed: true,
  maintenance_update: true,
  announcement: true,
  vote_invitation: true,
  package_arrived: true,
  visitor_announced: true,
  soundEnabled: true,
  vibrationEnabled: true,
};

// Save notification settings
export function saveNotificationSettings(settings: NotificationSettings): void {
  localStorage.setItem('condo-notification-settings', JSON.stringify(settings));
}

// Load notification settings
export function loadNotificationSettings(): NotificationSettings {
  const saved = localStorage.getItem('condo-notification-settings');
  if (saved) {
    return JSON.parse(saved);
  }
  return DEFAULT_NOTIFICATION_SETTINGS;
}
