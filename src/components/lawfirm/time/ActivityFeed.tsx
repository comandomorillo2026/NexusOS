'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  FileText,
  Mail,
  Phone,
  Users,
  Clock,
  Video,
  Search,
  Edit3,
  Eye,
  Send,
  PhoneIncoming,
  PhoneOutgoing,
  CheckCircle,
  AlertCircle,
  Timer,
  MoreHorizontal,
  Filter,
  RefreshCw,
} from 'lucide-react';

// Types
interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  caseId?: string;
  caseName?: string;
  timestamp: string;
  duration?: number; // seconds
  isAutoCaptured: boolean;
  metadata?: Record<string, any>;
  status?: 'active' | 'completed' | 'paused';
}

type ActivityType = 
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
  | 'timer_started'
  | 'timer_stopped'
  | 'timer_paused';

// Activity type configurations
const activityConfig: Record<ActivityType, {
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}> = {
  document_opened: {
    label: 'Document Opened',
    icon: <Eye className="w-4 h-4" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  document_edited: {
    label: 'Document Edited',
    icon: <Edit3 className="w-4 h-4" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  document_closed: {
    label: 'Document Closed',
    icon: <FileText className="w-4 h-4" />,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  },
  email_sent: {
    label: 'Email Sent',
    icon: <Send className="w-4 h-4" />,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  email_read: {
    label: 'Email Read',
    icon: <Mail className="w-4 h-4" />,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
  },
  call_made: {
    label: 'Outgoing Call',
    icon: <PhoneOutgoing className="w-4 h-4" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  call_received: {
    label: 'Incoming Call',
    icon: <PhoneIncoming className="w-4 h-4" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
  },
  meeting_joined: {
    label: 'Meeting Started',
    icon: <Video className="w-4 h-4" />,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
  },
  meeting_left: {
    label: 'Meeting Ended',
    icon: <Users className="w-4 h-4" />,
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
  },
  research_started: {
    label: 'Research Started',
    icon: <Search className="w-4 h-4" />,
    color: 'text-teal-600',
    bgColor: 'bg-teal-100',
  },
  research_stopped: {
    label: 'Research Stopped',
    icon: <Search className="w-4 h-4" />,
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
  },
  timer_started: {
    label: 'Timer Started',
    icon: <Timer className="w-4 h-4" />,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  timer_stopped: {
    label: 'Timer Stopped',
    icon: <CheckCircle className="w-4 h-4" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  timer_paused: {
    label: 'Timer Paused',
    icon: <AlertCircle className="w-4 h-4" />,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
};

// Format time ago
function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString();
}

// Format duration
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return `${hours}h ${remainMins}m`;
}

// Mock activities for demo
const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'timer_started',
    title: 'Started time tracking',
    caseId: '1',
    caseName: 'Smith vs. Johnson Holdings',
    timestamp: new Date().toISOString(),
    isAutoCaptured: false,
    status: 'active',
  },
  {
    id: '2',
    type: 'document_opened',
    title: 'Contract_Agreement_v3.docx',
    description: 'Opened for review',
    caseId: '1',
    caseName: 'Smith vs. Johnson Holdings',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    duration: 180,
    isAutoCaptured: true,
    metadata: { documentId: 'doc-123', pageCount: 24 },
  },
  {
    id: '3',
    type: 'email_sent',
    title: 'Re: Settlement Offer',
    description: 'To: opposing.counsel@lawfirm.tt',
    caseId: '1',
    caseName: 'Smith vs. Johnson Holdings',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    isAutoCaptured: true,
    metadata: { emailId: 'email-456' },
  },
  {
    id: '4',
    type: 'call_made',
    title: 'Call with Client',
    description: 'Robert Smith',
    caseId: '1',
    caseName: 'Smith vs. Johnson Holdings',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    duration: 1200, // 20 mins
    isAutoCaptured: true,
    metadata: { phoneNumber: '+1-868-XXX-XXXX' },
  },
  {
    id: '5',
    type: 'research_started',
    title: 'Legal Research',
    description: 'Contract breach precedents in TT',
    caseId: '1',
    caseName: 'Smith vs. Johnson Holdings',
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    duration: 3600, // 1 hour
    isAutoCaptured: true,
  },
  {
    id: '6',
    type: 'document_edited',
    title: 'Motion_to_Dismiss.docx',
    description: 'Made 12 edits',
    caseId: '3',
    caseName: 'TT Corp Contract Dispute',
    timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
    duration: 2700, // 45 mins
    isAutoCaptured: true,
    metadata: { editCount: 12, wordCount: 2500 },
  },
  {
    id: '7',
    type: 'meeting_joined',
    title: 'Strategy Meeting',
    description: 'With Sarah Johnson, David Singh',
    caseId: '3',
    caseName: 'TT Corp Contract Dispute',
    timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
    duration: 5400, // 1.5 hours
    isAutoCaptured: true,
    metadata: { participants: 3, meetingType: 'video' },
  },
];

interface ActivityFeedProps {
  tenantId?: string;
  userId?: string;
  maxItems?: number;
  showHeader?: boolean;
  onActivityClick?: (activity: Activity) => void;
  onConvertToEntry?: (activity: Activity) => void;
}

export function ActivityFeed({
  tenantId = 'demo-tenant',
  userId = 'demo-user',
  maxItems = 20,
  showHeader = true,
  onActivityClick,
  onConvertToEntry,
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>(mockActivities);
  const [filter, setFilter] = useState<'all' | 'auto' | 'manual'>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Load activities
  const loadActivities = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/lawfirm/time/activity?tenantId=${tenantId}&userId=${userId}&limit=${maxItems}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setActivities(data.data);
        }
      }
    } catch (error) {
      console.error('Error loading activities:', error);
      // Keep mock data on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Load activities on mount
    // In production, uncomment this:
    // loadActivities();
  }, [tenantId, userId, maxItems]);

  // Filter activities
  const filteredActivities = activities.filter((activity) => {
    if (filter === 'auto') return activity.isAutoCaptured;
    if (filter === 'manual') return !activity.isAutoCaptured;
    return true;
  });

  // Group activities by date
  const groupedActivities = filteredActivities.reduce((groups, activity) => {
    const date = new Date(activity.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, Activity[]>);

  return (
    <Card className="h-full">
      {showHeader && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#C4A35A]" />
              Activity Feed
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8"
                onClick={loadActivities}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex gap-1 mt-2">
            {(['all', 'auto', 'manual'] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'ghost'}
                size="sm"
                className={`h-7 text-xs ${
                  filter === f 
                    ? 'bg-[#1E3A5F] text-white' 
                    : 'text-gray-600'
                }`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : f === 'auto' ? 'Auto' : 'Manual'}
              </Button>
            ))}
          </div>
        </CardHeader>
      )}
      
      <CardContent className="pt-0">
        <ScrollArea className="h-[400px] pr-4">
          {Object.entries(groupedActivities).map(([date, dateActivities]) => (
            <div key={date} className="mb-6 last:mb-0">
              {/* Date Header */}
              <div className="sticky top-0 bg-white z-10 py-1 mb-2">
                <p className="text-xs font-medium text-gray-500 uppercase">
                  {date === new Date().toDateString() ? 'Today' : date}
                </p>
              </div>

              {/* Activities */}
              <div className="space-y-2">
                <AnimatePresence>
                  {dateActivities.map((activity, index) => {
                    const config = activityConfig[activity.type];
                    
                    return (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                          activity.status === 'active'
                            ? 'border-green-300 bg-green-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                        onClick={() => onActivityClick?.(activity)}
                      >
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bgColor}`}>
                            <span className={config.color}>{config.icon}</span>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-sm text-gray-900 truncate">
                                {activity.title}
                              </p>
                              {activity.isAutoCaptured && (
                                <Badge variant="secondary" className="text-[10px] h-4 px-1">
                                  Auto
                                </Badge>
                              )}
                              {activity.status === 'active' && (
                                <Badge className="text-[10px] h-4 px-1 bg-green-500">
                                  Active
                                </Badge>
                              )}
                            </div>
                            
                            {activity.description && (
                              <p className="text-xs text-gray-500 truncate">
                                {activity.description}
                              </p>
                            )}

                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-gray-400">
                                {formatTimeAgo(activity.timestamp)}
                              </span>
                              {activity.duration && activity.duration > 0 && (
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDuration(activity.duration)}
                                </span>
                              )}
                              {activity.caseName && (
                                <span className="text-xs text-[#C4A35A] truncate max-w-[120px]">
                                  {activity.caseName}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              onConvertToEntry?.(activity);
                            }}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          ))}

          {filteredActivities.length === 0 && (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No activities yet</p>
              <p className="text-gray-400 text-xs mt-1">
                Activities will appear here as you work
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default ActivityFeed;
