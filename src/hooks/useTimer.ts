'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Types
export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  startTime: string | null;
  pausedAt: string | null;
  accumulatedSeconds: number;
  caseId: string | null;
  caseName: string | null;
  description: string;
  activityType: string;
  isBillable: boolean;
  roundingRule: 'none' | '6min' | '15min';
  hourlyRate: number;
  lastActivityAt: string | null;
  autoPauseAfterMinutes: number;
  autoPauseTriggered?: boolean;
  endTime?: string;
}

export interface UseTimerOptions {
  autoPauseAfterMinutes?: number;
  onAutoPause?: () => void;
  onActivityDetected?: (type: string) => void;
  storageKey?: string;
}

const DEFAULT_STATE: TimerState = {
  isRunning: false,
  isPaused: false,
  startTime: null,
  pausedAt: null,
  accumulatedSeconds: 0,
  caseId: null,
  caseName: null,
  description: '',
  activityType: 'general',
  isBillable: true,
  roundingRule: 'none',
  hourlyRate: 850,
  lastActivityAt: null,
  autoPauseAfterMinutes: 5,
  autoPauseTriggered: false,
};

const STORAGE_KEY = 'lawfirm_timer_state';

export function useTimer(options: UseTimerOptions = {}) {
  const {
    autoPauseAfterMinutes = 5,
    onAutoPause,
    onActivityDetected,
    storageKey = STORAGE_KEY,
  } = options;

  const [state, setState] = useState<TimerState>(DEFAULT_STATE);
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const onAutoPauseRef = useRef(onAutoPause);
  const onActivityDetectedRef = useRef(onActivityDetected);

  // Keep refs updated
  useEffect(() => {
    onAutoPauseRef.current = onAutoPause;
    onActivityDetectedRef.current = onActivityDetected;
  }, [onAutoPause, onActivityDetected]);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as TimerState;
        if (parsed.isRunning && parsed.startTime) {
          // Calculate elapsed time since timer was started
          const start = new Date(parsed.startTime).getTime();
          const now = Date.now();
          const elapsed = Math.floor((now - start) / 1000);
          
          if (parsed.isPaused && parsed.pausedAt) {
            // Timer was paused, don't add elapsed time
            setState(parsed);
            setCurrentSeconds(parsed.accumulatedSeconds);
          } else {
            // Timer was running, continue from where it left off
            setState({
              ...parsed,
              lastActivityAt: new Date().toISOString(),
            });
            setCurrentSeconds(parsed.accumulatedSeconds + elapsed);
          }
        } else {
          setState(parsed);
          setCurrentSeconds(parsed.accumulatedSeconds);
        }
      }
    } catch (error) {
      console.error('Error loading timer state:', error);
    }
  }, [storageKey]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving timer state:', error);
    }
  }, [state, storageKey]);

  // Timer interval
  useEffect(() => {
    if (state.isRunning && !state.isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrentSeconds((s) => s + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isRunning, state.isPaused]);

  // Start the timer
  const start = useCallback((params: {
    caseId: string;
    caseName: string;
    description?: string;
    activityType?: string;
    isBillable?: boolean;
    roundingRule?: 'none' | '6min' | '15min';
    hourlyRate?: number;
  }) => {
    const now = new Date();
    setState({
      ...DEFAULT_STATE,
      isRunning: true,
      isPaused: false,
      startTime: now.toISOString(),
      pausedAt: null,
      accumulatedSeconds: 0,
      caseId: params.caseId,
      caseName: params.caseName,
      description: params.description || '',
      activityType: params.activityType || 'general',
      isBillable: params.isBillable ?? true,
      roundingRule: params.roundingRule || 'none',
      hourlyRate: params.hourlyRate || 850,
      lastActivityAt: now.toISOString(),
      autoPauseAfterMinutes,
    });
    setCurrentSeconds(0);
    lastActivityRef.current = Date.now();
  }, [autoPauseAfterMinutes]);

  // Pause the timer
  const pause = useCallback((isAutoPause = false) => {
    setCurrentSeconds((currentSecs) => {
      setState((prev) => ({
        ...prev,
        isPaused: true,
        pausedAt: new Date().toISOString(),
        accumulatedSeconds: currentSecs,
        autoPauseTriggered: isAutoPause,
      }));
      return currentSecs;
    });
  }, []);

  // Resume the timer
  const resume = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isPaused: false,
      pausedAt: null,
      lastActivityAt: new Date().toISOString(),
      autoPauseTriggered: false,
    }));
    lastActivityRef.current = Date.now();
  }, []);

  // Stop the timer and return final state
  const stop = useCallback(() => {
    const finalState = {
      ...state,
      accumulatedSeconds: currentSeconds,
      endTime: new Date().toISOString(),
    };

    // Clear the stored state
    localStorage.removeItem(storageKey);

    // Reset state
    setState(DEFAULT_STATE);
    setCurrentSeconds(0);

    return finalState;
  }, [state, currentSeconds, storageKey]);

  // Update timer details without stopping
  const updateDetails = useCallback((updates: Partial<TimerState>) => {
    setState((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  // Activity detection for auto-pause
  useEffect(() => {
    if (!state.isRunning || state.isPaused) return;

    const handleActivity = () => {
      lastActivityRef.current = Date.now();
      setState((prev) => ({
        ...prev,
        lastActivityAt: new Date().toISOString(),
      }));
      
      if (onActivityDetectedRef.current) {
        onActivityDetectedRef.current('user_interaction');
      }
    };

    // Listen for user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'focus'];
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Check for inactivity
    const checkInactivity = () => {
      const inactiveFor = (Date.now() - lastActivityRef.current) / 1000 / 60;
      if (inactiveFor >= autoPauseAfterMinutes) {
        pause(true);
        if (onAutoPauseRef.current) {
          onAutoPauseRef.current();
        }
      }
    };

    inactivityRef.current = setInterval(checkInactivity, 30000); // Check every 30 seconds

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (inactivityRef.current) {
        clearInterval(inactivityRef.current);
      }
    };
  }, [state.isRunning, state.isPaused, autoPauseAfterMinutes, pause]);

  // Apply rounding to seconds
  const getRoundedDuration = useCallback((seconds: number): number => {
    const minutes = Math.ceil(seconds / 60);
    
    switch (state.roundingRule) {
      case '6min':
        return Math.ceil(minutes / 6) * 6 * 60;
      case '15min':
        return Math.ceil(minutes / 15) * 15 * 60;
      default:
        return seconds;
    }
  }, [state.roundingRule]);

  // Calculate billable amount
  const calculateAmount = useCallback((seconds: number, rate?: number): number => {
    if (!state.isBillable) return 0;
    const hours = getRoundedDuration(seconds) / 3600;
    return hours * (rate || state.hourlyRate);
  }, [state.isBillable, state.hourlyRate, getRoundedDuration]);

  // Format time for display
  const formatTime = useCallback((seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Format duration in hours and minutes
  const formatDuration = useCallback((seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  }, []);

  return {
    // State
    ...state,
    currentSeconds,
    
    // Computed values
    formattedTime: formatTime(currentSeconds),
    formattedDuration: formatDuration(currentSeconds),
    roundedSeconds: getRoundedDuration(currentSeconds),
    roundedDuration: formatDuration(getRoundedDuration(currentSeconds)),
    billableAmount: calculateAmount(currentSeconds),
    
    // Actions
    start,
    pause,
    resume,
    stop,
    updateDetails,
    
    // Utilities
    formatTime,
    formatDuration,
    getRoundedDuration,
    calculateAmount,
  };
}

export default useTimer;
