/**
 * Timer Sync Service
 * Provides real-time timer synchronization across browser tabs using BroadcastChannel API
 * with localStorage fallback for older browsers
 */

export interface TimerSyncMessage {
  type: 'start' | 'pause' | 'resume' | 'stop' | 'update' | 'sync_request' | 'sync_response';
  payload: {
    caseId?: string;
    caseName?: string;
    startTime?: string;
    accumulatedSeconds?: number;
    isPaused?: boolean;
    isBillable?: boolean;
    hourlyRate?: number;
    activityType?: string;
    description?: string;
    roundingRule?: 'none' | '6min' | '15min';
    lastActivityAt?: string;
    userId?: string;
  };
  timestamp: string;
  source: string; // tab ID
}

export interface TimerSyncState {
  isRunning: boolean;
  isPaused: boolean;
  startTime: string | null;
  accumulatedSeconds: number;
  caseId: string | null;
  caseName: string | null;
  description: string;
  activityType: string;
  isBillable: boolean;
  roundingRule: 'none' | '6min' | '15min';
  hourlyRate: number;
  lastActivityAt: string | null;
  userId: string | null;
}

type TimerSyncCallback = (state: TimerSyncState) => void;

class TimerSyncService {
  private channel: BroadcastChannel | null = null;
  private tabId: string;
  private storageKey: string;
  private callbacks: Set<TimerSyncCallback> = new Set();
  private storageListener: ((e: StorageEvent) => void) | null = null;

  constructor(storageKey: string = 'lawfirm_timer_sync') {
    this.storageKey = storageKey;
    this.tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.initChannel();
  }

  private initChannel() {
    // Try to use BroadcastChannel API (modern browsers)
    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel(this.storageKey);
      this.channel.onmessage = (event) => {
        this.handleMessage(event.data as TimerSyncMessage);
      };
    } else {
      // Fallback to localStorage for older browsers
      this.storageListener = (e: StorageEvent) => {
        if (e.key === this.storageKey && e.newValue) {
          try {
            const message = JSON.parse(e.newValue) as TimerSyncMessage;
            // Only process messages from other tabs
            if (message.source !== this.tabId) {
              this.handleMessage(message);
            }
          } catch (error) {
            console.error('Error parsing sync message:', error);
          }
        }
      };
      window.addEventListener('storage', this.storageListener);
    }
  }

  private handleMessage(message: TimerSyncMessage) {
    // Ignore messages from self
    if (message.source === this.tabId) return;

    switch (message.type) {
      case 'start':
      case 'pause':
      case 'resume':
      case 'stop':
      case 'update':
        this.notifyCallbacks({
          isRunning: message.type !== 'stop',
          isPaused: message.type === 'pause' || message.payload?.isPaused || false,
          startTime: message.payload?.startTime || null,
          accumulatedSeconds: message.payload?.accumulatedSeconds || 0,
          caseId: message.payload?.caseId || null,
          caseName: message.payload?.caseName || null,
          description: message.payload?.description || '',
          activityType: message.payload?.activityType || 'general',
          isBillable: message.payload?.isBillable ?? true,
          roundingRule: message.payload?.roundingRule || 'none',
          hourlyRate: message.payload?.hourlyRate || 850,
          lastActivityAt: message.payload?.lastActivityAt || null,
          userId: message.payload?.userId || null,
        });
        break;

      case 'sync_request':
        // Another tab is asking for current state, we respond if we have an active timer
        const currentState = this.loadState();
        if (currentState?.isRunning) {
          this.broadcast('sync_response', {
            ...currentState,
            startTime: currentState.startTime || undefined,
            caseId: currentState.caseId || undefined,
            caseName: currentState.caseName || undefined,
            description: currentState.description || undefined,
            activityType: currentState.activityType,
            isBillable: currentState.isBillable,
            roundingRule: currentState.roundingRule,
            hourlyRate: currentState.hourlyRate,
            lastActivityAt: currentState.lastActivityAt || undefined,
            userId: currentState.userId || undefined,
          });
        }
        break;

      case 'sync_response':
        // Received state from another tab
        if (message.payload) {
          this.notifyCallbacks({
            isRunning: true,
            isPaused: message.payload.isPaused || false,
            startTime: message.payload.startTime || null,
            accumulatedSeconds: message.payload.accumulatedSeconds || 0,
            caseId: message.payload.caseId || null,
            caseName: message.payload.caseName || null,
            description: message.payload.description || '',
            activityType: message.payload.activityType || 'general',
            isBillable: message.payload.isBillable ?? true,
            roundingRule: message.payload.roundingRule || 'none',
            hourlyRate: message.payload.hourlyRate || 850,
            lastActivityAt: message.payload.lastActivityAt || null,
            userId: message.payload.userId || null,
          });
        }
        break;
    }
  }

  private broadcast(type: TimerSyncMessage['type'], payload: TimerSyncMessage['payload']) {
    const message: TimerSyncMessage = {
      type,
      payload,
      timestamp: new Date().toISOString(),
      source: this.tabId,
    };

    // Use BroadcastChannel if available
    if (this.channel) {
      this.channel.postMessage(message);
    } else {
      // Fallback to localStorage
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(message));
        // Remove immediately to allow future events
        setTimeout(() => localStorage.removeItem(this.storageKey), 100);
      } catch (error) {
        console.error('Error broadcasting via localStorage:', error);
      }
    }
  }

  private notifyCallbacks(state: TimerSyncState) {
    this.callbacks.forEach((callback) => {
      try {
        callback(state);
      } catch (error) {
        console.error('Error in sync callback:', error);
      }
    });
  }

  // Save state to localStorage for persistence
  private saveState(state: TimerSyncState) {
    try {
      localStorage.setItem(`${this.storageKey}_state`, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving timer state:', error);
    }
  }

  // Load state from localStorage
  private loadState(): TimerSyncState | null {
    try {
      const stored = localStorage.getItem(`${this.storageKey}_state`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading timer state:', error);
    }
    return null;
  }

  // Public API

  /**
   * Subscribe to timer sync events
   */
  subscribe(callback: TimerSyncCallback): () => void {
    this.callbacks.add(callback);
    return () => {
      this.callbacks.delete(callback);
    };
  }

  /**
   * Broadcast timer start
   */
  startTimer(payload: TimerSyncMessage['payload']) {
    const state: TimerSyncState = {
      isRunning: true,
      isPaused: false,
      startTime: payload?.startTime || new Date().toISOString(),
      accumulatedSeconds: 0,
      caseId: payload?.caseId || null,
      caseName: payload?.caseName || null,
      description: payload?.description || '',
      activityType: payload?.activityType || 'general',
      isBillable: payload?.isBillable ?? true,
      roundingRule: payload?.roundingRule || 'none',
      hourlyRate: payload?.hourlyRate || 850,
      lastActivityAt: new Date().toISOString(),
      userId: payload?.userId || null,
    };
    this.saveState(state);
    this.broadcast('start', payload);
  }

  /**
   * Broadcast timer pause
   */
  pauseTimer(payload: TimerSyncMessage['payload']) {
    this.broadcast('pause', payload);
    const currentState = this.loadState();
    if (currentState) {
      this.saveState({ ...currentState, isPaused: true, ...payload });
    }
  }

  /**
   * Broadcast timer resume
   */
  resumeTimer(payload: TimerSyncMessage['payload']) {
    this.broadcast('resume', payload);
    const currentState = this.loadState();
    if (currentState) {
      this.saveState({ ...currentState, isPaused: false, ...payload });
    }
  }

  /**
   * Broadcast timer stop
   */
  stopTimer() {
    this.broadcast('stop', {});
    localStorage.removeItem(`${this.storageKey}_state`);
  }

  /**
   * Broadcast timer update
   */
  updateTimer(payload: TimerSyncMessage['payload']) {
    this.broadcast('update', payload);
    const currentState = this.loadState();
    if (currentState) {
      this.saveState({ ...currentState, ...payload });
    }
  }

  /**
   * Request sync from other tabs
   */
  requestSync() {
    this.broadcast('sync_request', {});
  }

  /**
   * Get current persisted state
   */
  getState(): TimerSyncState | null {
    return this.loadState();
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    if (this.storageListener) {
      window.removeEventListener('storage', this.storageListener);
      this.storageListener = null;
    }
    this.callbacks.clear();
  }
}

// Singleton instance
let timerSyncInstance: TimerSyncService | null = null;

export function getTimerSyncService(storageKey?: string): TimerSyncService {
  if (!timerSyncInstance) {
    timerSyncInstance = new TimerSyncService(storageKey);
  }
  return timerSyncInstance;
}

export default TimerSyncService;
