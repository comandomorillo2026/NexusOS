'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useTimer } from '@/hooks/useTimer';

// Types
export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  caseId?: string;
  caseName?: string;
  timestamp: string;
  duration: number; // seconds
  isAutoCaptured: boolean;
  metadata?: Record<string, any>;
  status?: 'active' | 'completed' | 'paused';
  wasConvertedToTimeEntry?: boolean;
  timeEntryId?: string;
}

export type ActivityType =
  | 'document_opened'
  | 'document_edited'
  | 'document_closed'
  | 'email_sent'
  | 'email_read'
  | 'call_made'
  | 'call_received'
  | 'meeting_joined'
  | 'meeting_left'
  | 'research_started'
  | 'research_stopped'
  | 'case_viewed'
  | 'case_edited'
  | 'timer_started'
  | 'timer_stopped'
  | 'timer_paused';

interface ActivityTrackingConfig {
  autoCaptureDocuments: boolean;
  autoCaptureEmails: boolean;
  autoCaptureCalls: boolean;
  autoCaptureCaseViews: boolean;
  autoPauseAfterMinutes: number;
  billingIncrement: 'none' | '6min' | '15min';
  defaultHourlyRate: number;
}

interface ActivityTrackingContextValue {
  activities: Activity[];
  currentActivity: Activity | null;
  config: ActivityTrackingConfig;
  isTracking: boolean;
  
  // Actions
  startActivity: (type: ActivityType, data: Partial<Activity>) => void;
  endActivity: (id: string, metadata?: Record<string, any>) => void;
  logActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
  convertToTimeEntry: (activityId: string, timeEntryData?: Partial<TimeEntryConversion>) => Promise<void>;
  clearActivities: () => void;
  updateConfig: (config: Partial<ActivityTrackingConfig>) => void;
  
  // Activity helpers
  logDocumentOpen: (documentId: string, documentName: string, caseId?: string, caseName?: string) => void;
  logDocumentEdit: (documentId: string, documentName: string, caseId?: string, caseName?: string) => void;
  logDocumentClose: (documentId: string, documentName: string, duration: number) => void;
  logEmailSent: (to: string, subject: string, caseId?: string, caseName?: string) => void;
  logCall: (phoneNumber: string, contactName: string, duration: number, direction: 'incoming' | 'outgoing', caseId?: string, caseName?: string) => void;
  logCaseView: (caseId: string, caseName: string, caseNumber: string) => void;
  
  // Stats
  getTodayStats: () => ActivityStats;
  getWeekStats: () => ActivityStats;
}

interface TimeEntryConversion {
  caseId: string;
  description: string;
  activityType: string;
  isBillable: boolean;
  hourlyRate: number;
}

interface ActivityStats {
  totalActivities: number;
  totalDuration: number;
  autoCapturedCount: number;
  convertedCount: number;
  billableHours: number;
  byType: Record<ActivityType, number>;
}

const STORAGE_KEY_ACTIVITIES = 'lawfirm_activities';
const STORAGE_KEY_CONFIG = 'lawfirm_activity_config';

const DEFAULT_CONFIG: ActivityTrackingConfig = {
  autoCaptureDocuments: true,
  autoCaptureEmails: true,
  autoCaptureCalls: true,
  autoCaptureCaseViews: true,
  autoPauseAfterMinutes: 5,
  billingIncrement: 'none',
  defaultHourlyRate: 850,
};

// Helper function to calculate stats (moved outside component)
function calculateStats(activityList: Activity[]): ActivityStats {
  const byType = activityList.reduce((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + 1;
    return acc;
  }, {} as Record<ActivityType, number>);

  return {
    totalActivities: activityList.length,
    totalDuration: activityList.reduce((sum, a) => sum + a.duration, 0),
    autoCapturedCount: activityList.filter((a) => a.isAutoCaptured).length,
    convertedCount: activityList.filter((a) => a.wasConvertedToTimeEntry).length,
    billableHours: activityList
      .filter((a) => a.caseId)
      .reduce((sum, a) => sum + a.duration, 0) / 3600,
    byType,
  };
}

// Map activity type to time entry code (moved outside component)
function mapActivityToCode(type: ActivityType): string {
  const mapping: Record<ActivityType, string> = {
    document_opened: 'review',
    document_edited: 'drafting',
    document_closed: 'review',
    email_sent: 'research',
    email_read: 'research',
    call_made: 'calls',
    call_received: 'calls',
    meeting_joined: 'meeting',
    meeting_left: 'meeting',
    research_started: 'research',
    research_stopped: 'research',
    case_viewed: 'review',
    case_edited: 'review',
    timer_started: 'general',
    timer_stopped: 'general',
    timer_paused: 'general',
  };
  return mapping[type] || 'general';
}

const ActivityTrackingContext = createContext<ActivityTrackingContextValue | null>(null);

export function ActivityTrackingProvider({
  children,
  tenantId = 'demo-tenant',
  userId = 'demo-user',
  userName = 'Demo Attorney',
}: {
  children: React.ReactNode;
  tenantId?: string;
  userId?: string;
  userName?: string;
}) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [config, setConfig] = useState<ActivityTrackingConfig>(DEFAULT_CONFIG);
  const [isTracking, setIsTracking] = useState(true);
  
  const activityStartTimes = useRef<Map<string, Date>>(new Map());
  const activeDocumentRef = useRef<string | null>(null);
  const activeCaseRef = useRef<string | null>(null);

  // Load activities and config from localStorage
  useEffect(() => {
    try {
      const storedActivities = localStorage.getItem(STORAGE_KEY_ACTIVITIES);
      if (storedActivities) {
        const parsed = JSON.parse(storedActivities) as Activity[];
        // Only load activities from today
        const today = new Date().toDateString();
        const todayActivities = parsed.filter(
          (a) => new Date(a.timestamp).toDateString() === today
        );
        setActivities(todayActivities);
      }

      const storedConfig = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (storedConfig) {
        setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(storedConfig) });
      }
    } catch (error) {
      console.error('Error loading activity data:', error);
    }
  }, []);

  // Save activities to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(activities));
    } catch (error) {
      console.error('Error saving activities:', error);
    }
  }, [activities]);

  // Save config to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    } catch (error) {
      console.error('Error saving config:', error);
    }
  }, [config]);

  // Generate unique ID
  const generateId = () => `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Log activity to API
  const logToApi = useCallback(async (activity: Activity) => {
    try {
      await fetch('/api/lawfirm/time/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          userId,
          caseId: activity.caseId,
          activityType: activity.type,
          duration: activity.duration,
          metadata: {
            ...activity.metadata,
            title: activity.title,
            description: activity.description,
            isAutoCaptured: activity.isAutoCaptured,
          },
        }),
      });
    } catch (error) {
      console.error('Error logging activity to API:', error);
    }
  }, [tenantId, userId]);

  // Start a new activity
  const startActivity = useCallback((type: ActivityType, data: Partial<Activity>) => {
    const id = generateId();
    const now = new Date();
    
    const activity: Activity = {
      id,
      type,
      title: data.title || type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      description: data.description,
      caseId: data.caseId,
      caseName: data.caseName,
      timestamp: now.toISOString(),
      duration: 0,
      isAutoCaptured: data.isAutoCaptured ?? true,
      metadata: data.metadata,
      status: 'active',
    };

    activityStartTimes.current.set(id, now);
    setCurrentActivity(activity);
    setActivities((prev) => [activity, ...prev]);

    // Auto-start timer for certain activities
    if (config.autoCaptureDocuments && ['document_opened', 'document_edited'].includes(type)) {
      // Timer will be handled by the useTimer hook in the parent component
    }
  }, [config.autoCaptureDocuments]);

  // End an activity
  const endActivity = useCallback((id: string, metadata?: Record<string, any>) => {
    const startTime = activityStartTimes.current.get(id);
    if (!startTime) return;

    const duration = Math.floor((Date.now() - startTime.getTime()) / 1000);
    activityStartTimes.current.delete(id);

    setActivities((prev) =>
      prev.map((activity) => {
        if (activity.id === id) {
          const updated = {
            ...activity,
            duration,
            status: 'completed' as const,
            metadata: { ...activity.metadata, ...metadata },
          };
          // Log to API
          logToApi(updated);
          return updated;
        }
        return activity;
      })
    );

    setCurrentActivity((current) => (current?.id === id ? null : current));
  }, [logToApi]);

  // Log a completed activity directly
  const logActivity = useCallback((activity: Omit<Activity, 'id' | 'timestamp'>) => {
    const newActivity: Activity = {
      ...activity,
      id: generateId(),
      timestamp: new Date().toISOString(),
    };

    setActivities((prev) => [newActivity, ...prev]);
    logToApi(newActivity);
  }, [logToApi]);

  // Convert activity to time entry
  const convertToTimeEntry = useCallback(async (
    activityId: string,
    timeEntryData?: Partial<TimeEntryConversion>
  ) => {
    const activity = activities.find((a) => a.id === activityId);
    if (!activity) return;

    const durationMinutes = Math.ceil(activity.duration / 60);
    const hourlyRate = timeEntryData?.hourlyRate || config.defaultHourlyRate;
    const amount = (durationMinutes / 60) * hourlyRate;

    try {
      const response = await fetch('/api/lawfirm/time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          caseId: timeEntryData?.caseId || activity.caseId,
          attorneyId: userId,
          date: new Date(activity.timestamp).toISOString().split('T')[0],
          startTime: new Date(activity.timestamp).toTimeString().slice(0, 5),
          durationMinutes,
          description: timeEntryData?.description || activity.description || activity.title,
          activityCode: timeEntryData?.activityType || mapActivityToCode(activity.type),
          rate: hourlyRate,
          billable: timeEntryData?.isBillable ?? true,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setActivities((prev) =>
          prev.map((a) =>
            a.id === activityId
              ? { ...a, wasConvertedToTimeEntry: true, timeEntryId: result.data?.id }
              : a
          )
        );
      }
    } catch (error) {
      console.error('Error converting activity to time entry:', error);
    }
  }, [activities, tenantId, userId, config.defaultHourlyRate]);

  // Clear activities
  const clearActivities = useCallback(() => {
    setActivities([]);
    activityStartTimes.current.clear();
    localStorage.removeItem(STORAGE_KEY_ACTIVITIES);
  }, []);

  // Update config
  const updateConfig = useCallback((updates: Partial<ActivityTrackingConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  // Activity helpers
  const logDocumentOpen = useCallback((
    documentId: string,
    documentName: string,
    caseId?: string,
    caseName?: string
  ) => {
    if (!config.autoCaptureDocuments) return;
    
    activeDocumentRef.current = documentId;
    startActivity('document_opened', {
      title: documentName,
      caseId,
      caseName,
      metadata: { documentId, documentName },
    });
  }, [config.autoCaptureDocuments, startActivity]);

  const logDocumentEdit = useCallback((
    documentId: string,
    documentName: string,
    caseId?: string,
    caseName?: string
  ) => {
    if (!config.autoCaptureDocuments) return;
    
    startActivity('document_edited', {
      title: documentName,
      caseId,
      caseName,
      metadata: { documentId, documentName },
    });
  }, [config.autoCaptureDocuments, startActivity]);

  const logDocumentClose = useCallback((
    documentId: string,
    documentName: string,
    duration: number
  ) => {
    if (!config.autoCaptureDocuments) return;
    
    if (activeDocumentRef.current === documentId) {
      activeDocumentRef.current = null;
    }
    
    logActivity({
      type: 'document_closed',
      title: documentName,
      duration,
      isAutoCaptured: true,
      metadata: { documentId },
    });
  }, [config.autoCaptureDocuments, logActivity]);

  const logEmailSent = useCallback((
    to: string,
    subject: string,
    caseId?: string,
    caseName?: string
  ) => {
    if (!config.autoCaptureEmails) return;
    
    logActivity({
      type: 'email_sent',
      title: subject,
      description: `To: ${to}`,
      caseId,
      caseName,
      duration: 60, // Estimate 1 min for email
      isAutoCaptured: true,
      metadata: { to, subject },
    });
  }, [config.autoCaptureEmails, logActivity]);

  const logCall = useCallback((
    phoneNumber: string,
    contactName: string,
    duration: number,
    direction: 'incoming' | 'outgoing',
    caseId?: string,
    caseName?: string
  ) => {
    if (!config.autoCaptureCalls) return;
    
    logActivity({
      type: direction === 'incoming' ? 'call_received' : 'call_made',
      title: `Call with ${contactName}`,
      description: phoneNumber,
      caseId,
      caseName,
      duration,
      isAutoCaptured: false, // Calls are always manual
      metadata: { phoneNumber, contactName, direction },
    });
  }, [config.autoCaptureCalls, logActivity]);

  const logCaseView = useCallback((
    caseId: string,
    caseName: string,
    caseNumber: string
  ) => {
    if (!config.autoCaptureCaseViews) return;
    
    activeCaseRef.current = caseId;
    startActivity('case_viewed', {
      title: caseName,
      caseId,
      caseName,
      metadata: { caseNumber },
    });
  }, [config.autoCaptureCaseViews, startActivity]);

  // Get stats
  const getTodayStats = useCallback((): ActivityStats => {
    const today = new Date().toDateString();
    const todayActivities = activities.filter(
      (a) => new Date(a.timestamp).toDateString() === today
    );
    return calculateStats(todayActivities);
  }, [activities]);

  const getWeekStats = useCallback((): ActivityStats => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekActivities = activities.filter(
      (a) => new Date(a.timestamp) >= weekAgo
    );
    return calculateStats(weekActivities);
  }, [activities]);

  const value: ActivityTrackingContextValue = {
    activities,
    currentActivity,
    config,
    isTracking,
    startActivity,
    endActivity,
    logActivity,
    convertToTimeEntry,
    clearActivities,
    updateConfig,
    logDocumentOpen,
    logDocumentEdit,
    logDocumentClose,
    logEmailSent,
    logCall,
    logCaseView,
    getTodayStats,
    getWeekStats,
  };

  return (
    <ActivityTrackingContext.Provider value={value}>
      {children}
    </ActivityTrackingContext.Provider>
  );
}

export function useActivityTracking() {
  const context = useContext(ActivityTrackingContext);
  if (!context) {
    throw new Error('useActivityTracking must be used within ActivityTrackingProvider');
  }
  return context;
}

export default ActivityTrackingContext;
