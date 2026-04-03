'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Webhook,
  Plus,
  Trash2,
  Edit3,
  Copy,
  RefreshCw,
  Play,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Send,
  Code,
  History,
  Settings,
  Key,
  Globe,
  Shield,
  Zap,
  MoreVertical,
  ChevronRight,
  Activity,
  ArrowLeft,
  Search,
  Filter
} from 'lucide-react';

// ============================================
// TYPES
// ============================================
type WebhookStatus = 'active' | 'inactive' | 'error';
type EventStatus = 'pending' | 'sent' | 'failed' | 'retrying';

interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  secret: string;
  events: string[];
  status: WebhookStatus;
  lastTriggeredAt?: string;
  failureCount: number;
  lastError?: string;
  headers?: Record<string, string>;
  retryPolicy?: {
    maxAttempts: number;
    initialDelayMs: number;
    maxDelayMs: number;
    backoffMultiplier: number;
  };
  createdAt: string;
}

interface WebhookLog {
  id: string;
  endpointId: string;
  endpointName: string;
  eventType: string;
  payload: string;
  status: EventStatus;
  attemptCount: number;
  responseCode?: number;
  responseBody?: string;
  lastError?: string;
  createdAt: string;
}

// ============================================
// EVENT TYPES
// ============================================
const AVAILABLE_EVENTS = [
  // Case Events
  { value: 'case.created', label: 'Case Created', category: 'Cases', description: 'When a new case is created' },
  { value: 'case.updated', label: 'Case Updated', category: 'Cases', description: 'When case details are modified' },
  { value: 'case.closed', label: 'Case Closed', category: 'Cases', description: 'When a case is marked as closed' },
  { value: 'case.deleted', label: 'Case Deleted', category: 'Cases', description: 'When a case is deleted' },
  
  // Invoice Events
  { value: 'invoice.created', label: 'Invoice Created', category: 'Billing', description: 'When a new invoice is generated' },
  { value: 'invoice.paid', label: 'Invoice Paid', category: 'Billing', description: 'When an invoice is fully paid' },
  { value: 'invoice.overdue', label: 'Invoice Overdue', category: 'Billing', description: 'When an invoice becomes overdue' },
  { value: 'payment.received', label: 'Payment Received', category: 'Billing', description: 'When a payment is received' },
  
  // Document Events
  { value: 'document.uploaded', label: 'Document Uploaded', category: 'Documents', description: 'When a document is uploaded' },
  { value: 'document.shared', label: 'Document Shared', category: 'Documents', description: 'When a document is shared externally' },
  { value: 'document.deleted', label: 'Document Deleted', category: 'Documents', description: 'When a document is deleted' },
  
  // Appointment Events
  { value: 'appointment.scheduled', label: 'Appointment Scheduled', category: 'Appointments', description: 'When a new appointment is created' },
  { value: 'appointment.confirmed', label: 'Appointment Confirmed', category: 'Appointments', description: 'When an appointment is confirmed' },
  { value: 'appointment.cancelled', label: 'Appointment Cancelled', category: 'Appointments', description: 'When an appointment is cancelled' },
  { value: 'appointment.completed', label: 'Appointment Completed', category: 'Appointments', description: 'When an appointment is completed' },
  
  // Patient/Client Events
  { value: 'patient.created', label: 'Patient Created', category: 'Patients', description: 'When a new patient is registered' },
  { value: 'patient.updated', label: 'Patient Updated', category: 'Patients', description: 'When patient info is updated' },
  { value: 'client.created', label: 'Client Created', category: 'Clients', description: 'When a new client is added' },
  { value: 'client.updated', label: 'Client Updated', category: 'Clients', description: 'When client info is updated' },
];

const EVENT_CATEGORIES = [...new Set(AVAILABLE_EVENTS.map(e => e.category))];

// ============================================
// MOCK DATA
// ============================================
const MOCK_WEBHOOKS: WebhookEndpoint[] = [
  {
    id: 'wh_001',
    name: 'Zapier Integration',
    url: 'https://hooks.zapier.com/hooks/catch/12345/abcde',
    secret: 'whsec_abc123def456ghi789',
    events: ['case.created', 'invoice.paid', 'document.uploaded'],
    status: 'active',
    lastTriggeredAt: new Date(Date.now() - 3600000).toISOString(),
    failureCount: 0,
    createdAt: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
  },
  {
    id: 'wh_002',
    name: 'Slack Notifications',
    url: 'https://hooks.slack.com/services/T00/B00/XXX',
    secret: 'whsec_slack_secret_key',
    events: ['case.created', 'appointment.scheduled'],
    status: 'active',
    lastTriggeredAt: new Date(Date.now() - 7200000).toISOString(),
    failureCount: 2,
    lastError: 'Connection timeout',
    createdAt: new Date(Date.now() - 14 * 24 * 3600000).toISOString(),
  },
  {
    id: 'wh_003',
    name: 'QuickBooks Sync',
    url: 'https://api.quickbooks.com/webhooks/receive',
    secret: 'whsec_qb_secret',
    events: ['invoice.created', 'invoice.paid', 'payment.received'],
    status: 'error',
    lastTriggeredAt: new Date(Date.now() - 86400000).toISOString(),
    failureCount: 5,
    lastError: 'HTTP 401: Unauthorized',
    createdAt: new Date(Date.now() - 30 * 24 * 3600000).toISOString(),
  },
];

const MOCK_LOGS: WebhookLog[] = [
  {
    id: 'log_001',
    endpointId: 'wh_001',
    endpointName: 'Zapier Integration',
    eventType: 'case.created',
    payload: JSON.stringify({ id: 'case_123', title: 'New Case', clientId: 'client_456' }, null, 2),
    status: 'sent',
    attemptCount: 1,
    responseCode: 200,
    responseBody: '{"status": "accepted"}',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'log_002',
    endpointId: 'wh_002',
    endpointName: 'Slack Notifications',
    eventType: 'appointment.scheduled',
    payload: JSON.stringify({ id: 'apt_789', patientName: 'John Doe', time: '10:00 AM' }, null, 2),
    status: 'sent',
    attemptCount: 1,
    responseCode: 200,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'log_003',
    endpointId: 'wh_003',
    endpointName: 'QuickBooks Sync',
    eventType: 'invoice.paid',
    payload: JSON.stringify({ id: 'inv_999', amount: 1500.00, currency: 'TTD' }, null, 2),
    status: 'failed',
    attemptCount: 3,
    lastError: 'HTTP 401: Unauthorized',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'log_004',
    endpointId: 'wh_001',
    endpointName: 'Zapier Integration',
    eventType: 'document.uploaded',
    payload: JSON.stringify({ id: 'doc_111', name: 'contract.pdf', size: 245678 }, null, 2),
    status: 'retrying',
    attemptCount: 2,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
];

// ============================================
// STAT CARD COMPONENT
// ============================================
function StatCard({ title, value, subtitle, icon: Icon, color }: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-[var(--glass)] border border-[var(--glass-border)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[var(--text-mid)]">{title}</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{value}</p>
          {subtitle && <p className="text-xs text-[var(--text-dim)] mt-1">{subtitle}</p>}
        </div>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
    </div>
  );
}

// ============================================
// WEBHOOK CARD COMPONENT
// ============================================
function WebhookCard({
  webhook,
  onEdit,
  onDelete,
  onTest,
  onToggle
}: {
  webhook: WebhookEndpoint;
  onEdit: () => void;
  onDelete: () => void;
  onTest: () => void;
  onToggle: () => void;
}) {
  const [showSecret, setShowSecret] = useState(false);
  
  const statusColors: Record<WebhookStatus, string> = {
    active: 'bg-[var(--success)]/10 text-[var(--success)]',
    inactive: 'bg-[var(--text-dim)]/10 text-[var(--text-mid)]',
    error: 'bg-[var(--error)]/10 text-[var(--error)]',
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="p-4 rounded-xl bg-[var(--glass)] border border-[var(--glass-border)] hover:border-[rgba(167,139,250,0.3)] transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--nexus-violet)]/20 flex items-center justify-center">
            <Webhook className="w-5 h-5 text-[var(--nexus-violet-lite)]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-[var(--text-primary)]">{webhook.name}</h3>
              <span className={`px-2 py-0.5 rounded text-xs ${statusColors[webhook.status]}`}>
                {webhook.status}
              </span>
            </div>
            <p className="text-sm text-[var(--text-dim)] truncate max-w-md">{webhook.url}</p>
            
            {/* Events */}
            <div className="flex flex-wrap gap-1 mt-2">
              {webhook.events.slice(0, 3).map((event) => (
                <Badge key={event} variant="outline" className="text-xs">
                  {event}
                </Badge>
              ))}
              {webhook.events.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{webhook.events.length - 3} more
                </Badge>
              )}
            </div>
            
            {/* Stats */}
            <div className="flex items-center gap-4 mt-3 text-xs text-[var(--text-dim)]">
              {webhook.lastTriggeredAt && (
                <span>Last: {formatTime(webhook.lastTriggeredAt)}</span>
              )}
              {webhook.failureCount > 0 && (
                <span className="text-[var(--error)]">{webhook.failureCount} failures</span>
              )}
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          <Switch
            checked={webhook.status === 'active'}
            onCheckedChange={onToggle}
          />
          <Button variant="ghost" size="sm" onClick={onTest} title="Test webhook">
            <Play className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onEdit} title="Edit webhook">
            <Edit3 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} className="text-[var(--error)]" title="Delete webhook">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Secret (collapsible) */}
      <div className="mt-3 pt-3 border-t border-[var(--glass-border)]">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-[var(--text-dim)]" />
          <span className="text-xs text-[var(--text-mid)]">Secret:</span>
          <code className="text-xs font-mono text-[var(--text-primary)] flex-1">
            {showSecret ? webhook.secret : '••••••••••••••••'}
          </code>
          <Button variant="ghost" size="sm" onClick={() => setShowSecret(!showSecret)}>
            {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(webhook.secret)}>
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// WEBHOOK LOG ITEM COMPONENT
// ============================================
function WebhookLogItem({ log, onClick }: { log: WebhookLog; onClick: () => void }) {
  const statusIcons: Record<EventStatus, React.ElementType> = {
    pending: Clock,
    sent: CheckCircle,
    failed: XCircle,
    retrying: RefreshCw,
  };
  
  const statusColors: Record<EventStatus, string> = {
    pending: 'text-[var(--text-mid)]',
    sent: 'text-[var(--success)]',
    failed: 'text-[var(--error)]',
    retrying: 'text-[var(--nexus-gold)]',
  };

  const StatusIcon = statusIcons[log.status];

  return (
    <div
      className="p-3 rounded-lg bg-[var(--glass)] border border-[var(--glass-border)] hover:border-[rgba(167,139,250,0.3)] cursor-pointer transition-all"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <StatusIcon className={`w-4 h-4 ${statusColors[log.status]}`} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-[var(--text-primary)]">{log.eventType}</span>
              <Badge variant="outline" className="text-xs">{log.endpointName}</Badge>
            </div>
            <span className="text-xs text-[var(--text-dim)]">
              {new Date(log.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {log.responseCode && (
            <span className={`text-xs font-mono ${log.responseCode < 400 ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
              {log.responseCode}
            </span>
          )}
          <span className="text-xs text-[var(--text-dim)]">
            {log.attemptCount} attempt{log.attemptCount > 1 ? 's' : ''}
          </span>
          <ChevronRight className="w-4 h-4 text-[var(--text-dim)]" />
        </div>
      </div>
    </div>
  );
}

// ============================================
// CREATE/EDIT WEBHOOK DIALOG
// ============================================
function WebhookDialog({
  webhook,
  onClose,
  onSave
}: {
  webhook?: WebhookEndpoint | null;
  onClose: () => void;
  onSave: (data: Partial<WebhookEndpoint>) => void;
}) {
  const [name, setName] = useState(webhook?.name || '');
  const [url, setUrl] = useState(webhook?.url || '');
  const [secret, setSecret] = useState(webhook?.secret || '');
  const [selectedEvents, setSelectedEvents] = useState<string[]>(webhook?.events || []);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showSecret, setShowSecret] = useState(false);
  const [customHeader, setCustomHeader] = useState({ key: '', value: '' });
  const [headers, setHeaders] = useState<Record<string, string>>(webhook?.headers || {});

  const generateSecret = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    setSecret('whsec_' + Array.from(array, b => b.toString(16).padStart(2, '0')).join(''));
  };

  const toggleEvent = (event: string) => {
    setSelectedEvents(prev =>
      prev.includes(event)
        ? prev.filter(e => e !== event)
        : [...prev, event]
    );
  };

  const addHeader = () => {
    if (customHeader.key && customHeader.value) {
      setHeaders(prev => ({ ...prev, [customHeader.key]: customHeader.value }));
      setCustomHeader({ key: '', value: '' });
    }
  };

  const filteredEvents = selectedCategory === 'all'
    ? AVAILABLE_EVENTS
    : AVAILABLE_EVENTS.filter(e => e.category === selectedCategory);

  const handleSave = () => {
    onSave({
      name,
      url,
      secret,
      events: selectedEvents,
      headers,
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0A0820] border border-[rgba(167,139,250,0.2)]">
        <DialogHeader>
          <DialogTitle className="text-[var(--text-primary)]">
            {webhook ? 'Edit Webhook' : 'Create New Webhook'}
          </DialogTitle>
          <DialogDescription className="text-[var(--text-mid)]">
            Configure your webhook endpoint and select events to subscribe to.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[var(--text-mid)]">Webhook Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Zapier Integration"
                className="bg-[var(--glass)] border-[var(--glass-border)]"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-[var(--text-mid)]">Endpoint URL</Label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-endpoint.com/webhook"
                className="bg-[var(--glass)] border-[var(--glass-border)] font-mono text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-[var(--text-mid)]">Signing Secret</Label>
                <Button variant="outline" size="sm" onClick={generateSecret}>
                  <Key className="w-4 h-4 mr-2" />
                  Generate
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  type={showSecret ? 'text' : 'password'}
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="whsec_..."
                  className="bg-[var(--glass)] border-[var(--glass-border)] font-mono text-sm"
                />
                <Button variant="outline" size="icon" onClick={() => setShowSecret(!showSecret)}>
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-[var(--text-dim)]">
                Use this secret to verify webhook signatures using HMAC-SHA256
              </p>
            </div>
          </div>

          {/* Events Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-[var(--text-mid)]">Events to Subscribe</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedEvents(AVAILABLE_EVENTS.map(e => e.value))}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedEvents([])}
                >
                  Clear
                </Button>
              </div>
            </div>
            
            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
                className={selectedCategory === 'all' ? 'bg-[var(--nexus-gold)] text-white' : ''}
              >
                All
              </Button>
              {EVENT_CATEGORIES.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? 'bg-[var(--nexus-gold)] text-white' : ''}
                >
                  {category}
                </Button>
              ))}
            </div>
            
            {/* Events List */}
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
              {filteredEvents.map((event) => (
                <button
                  key={event.value}
                  onClick={() => toggleEvent(event.value)}
                  className={`flex items-start gap-2 p-3 rounded-lg border text-left transition-all ${
                    selectedEvents.includes(event.value)
                      ? 'border-[var(--nexus-gold)] bg-[rgba(240,180,41,0.1)]'
                      : 'border-[var(--glass-border)] hover:border-[rgba(167,139,250,0.3)]'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center mt-0.5 ${
                    selectedEvents.includes(event.value)
                      ? 'border-[var(--nexus-gold)] bg-[var(--nexus-gold)]'
                      : 'border-[var(--text-dim)]'
                  }`}>
                    {selectedEvents.includes(event.value) && (
                      <CheckCircle className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-primary)]">{event.label}</p>
                    <p className="text-xs text-[var(--text-dim)]">{event.description}</p>
                  </div>
                </button>
              ))}
            </div>
            
            {selectedEvents.length > 0 && (
              <p className="text-sm text-[var(--text-mid)]">
                {selectedEvents.length} event{selectedEvents.length > 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          {/* Custom Headers */}
          <div className="space-y-4">
            <Label className="text-[var(--text-mid)]">Custom Headers (Optional)</Label>
            <div className="flex gap-2">
              <Input
                value={customHeader.key}
                onChange={(e) => setCustomHeader(prev => ({ ...prev, key: e.target.value }))}
                placeholder="Header name"
                className="bg-[var(--glass)] border-[var(--glass-border)]"
              />
              <Input
                value={customHeader.value}
                onChange={(e) => setCustomHeader(prev => ({ ...prev, value: e.target.value }))}
                placeholder="Header value"
                className="bg-[var(--glass)] border-[var(--glass-border)]"
              />
              <Button variant="outline" onClick={addHeader}>Add</Button>
            </div>
            
            {Object.keys(headers).length > 0 && (
              <div className="space-y-2">
                {Object.entries(headers).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 p-2 rounded bg-[var(--glass)]">
                    <code className="text-xs text-[var(--text-primary)]">{key}:</code>
                    <code className="text-xs text-[var(--text-mid)]">{value}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setHeaders(prev => {
                        const newHeaders = { ...prev };
                        delete newHeaders[key];
                        return newHeaders;
                      })}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSave}
            className="btn-gold"
            disabled={!name || !url || !secret || selectedEvents.length === 0}
          >
            {webhook ? 'Save Changes' : 'Create Webhook'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// LOG DETAIL DIALOG
// ============================================
function LogDetailDialog({ log, onClose }: { log: WebhookLog; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0A0820] border border-[rgba(167,139,250,0.2)]">
        <DialogHeader>
          <DialogTitle className="text-[var(--text-primary)] flex items-center gap-2">
            Webhook Delivery Log
            <Badge variant={log.status === 'sent' ? 'default' : 'destructive'}>
              {log.status}
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-[var(--text-mid)]">
            {log.eventType} - {log.endpointName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Status Info */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-[var(--glass)]">
              <p className="text-xs text-[var(--text-dim)]">Status</p>
              <p className={`text-lg font-semibold ${log.status === 'sent' ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                {log.status.toUpperCase()}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[var(--glass)]">
              <p className="text-xs text-[var(--text-dim)]">Response Code</p>
              <p className="text-lg font-semibold text-[var(--text-primary)]">
                {log.responseCode || 'N/A'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[var(--glass)]">
              <p className="text-xs text-[var(--text-dim)]">Attempts</p>
              <p className="text-lg font-semibold text-[var(--text-primary)]">
                {log.attemptCount}
              </p>
            </div>
          </div>

          {/* Timestamp */}
          <div className="p-3 rounded-lg bg-[var(--glass)]">
            <p className="text-xs text-[var(--text-dim)]">Timestamp</p>
            <p className="text-[var(--text-primary)]">{new Date(log.createdAt).toLocaleString()}</p>
          </div>

          {/* Error */}
          {log.lastError && (
            <div className="p-3 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20">
              <p className="text-xs text-[var(--error)]">Error</p>
              <p className="text-[var(--text-primary)] font-mono text-sm">{log.lastError}</p>
            </div>
          )}

          {/* Payload */}
          <div className="space-y-2">
            <Label className="text-[var(--text-mid)]">Request Payload</Label>
            <pre className="p-4 rounded-lg bg-[var(--obsidian-3)] border border-[var(--glass-border)] overflow-x-auto text-sm text-[var(--text-primary)] font-mono">
              {log.payload}
            </pre>
          </div>

          {/* Response */}
          {log.responseBody && (
            <div className="space-y-2">
              <Label className="text-[var(--text-mid)]">Response Body</Label>
              <pre className="p-4 rounded-lg bg-[var(--obsidian-3)] border border-[var(--glass-border)] overflow-x-auto text-sm text-[var(--text-primary)] font-mono">
                {log.responseBody}
              </pre>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => navigator.clipboard.writeText(log.payload)}>
            <Copy className="w-4 h-4 mr-2" />
            Copy Payload
          </Button>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export function IntegrationManager() {
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>(MOCK_WEBHOOKS);
  const [logs, setLogs] = useState<WebhookLog[]>(MOCK_LOGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | WebhookStatus>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookEndpoint | null>(null);
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);
  const [activeTab, setActiveTab] = useState<'webhooks' | 'logs'>('webhooks');

  // Stats
  const stats = {
    total: webhooks.length,
    active: webhooks.filter(w => w.status === 'active').length,
    failed: logs.filter(l => l.status === 'failed').length,
    delivered: logs.filter(l => l.status === 'sent').length,
  };

  // Filtered webhooks
  const filteredWebhooks = webhooks.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          w.url.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handlers
  const handleCreate = (data: Partial<WebhookEndpoint>) => {
    const newWebhook: WebhookEndpoint = {
      id: `wh_${Date.now()}`,
      name: data.name || 'New Webhook',
      url: data.url || '',
      secret: data.secret || '',
      events: data.events || [],
      status: 'active',
      failureCount: 0,
      headers: data.headers,
      createdAt: new Date().toISOString(),
    };
    setWebhooks(prev => [...prev, newWebhook]);
    setShowCreateDialog(false);
  };

  const handleUpdate = (data: Partial<WebhookEndpoint>) => {
    if (editingWebhook) {
      setWebhooks(prev => prev.map(w =>
        w.id === editingWebhook.id
          ? { ...w, ...data }
          : w
      ));
      setEditingWebhook(null);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this webhook?')) {
      setWebhooks(prev => prev.filter(w => w.id !== id));
    }
  };

  const handleTest = async (id: string) => {
    // Simulate test
    alert(`Testing webhook ${id}... Check the logs for results.`);
  };

  const handleToggle = (id: string) => {
    setWebhooks(prev => prev.map(w =>
      w.id === id
        ? { ...w, status: w.status === 'active' ? 'inactive' : 'active' }
        : w
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Webhook className="w-6 h-6 text-[var(--nexus-violet-lite)]" />
            Webhook Manager
          </h2>
          <p className="text-sm text-[var(--text-mid)]">Manage webhooks for real-time event notifications</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="btn-gold">
          <Plus className="w-4 h-4 mr-2" />
          Create Webhook
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Webhooks" value={stats.total} icon={Webhook} color="#A78BFA" />
        <StatCard title="Active" value={stats.active} icon={CheckCircle} color="#34D399" />
        <StatCard title="Delivered" value={stats.delivered} icon={Send} color="#22D3EE" />
        <StatCard title="Failed" value={stats.failed} icon={AlertCircle} color="#EF4444" />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="bg-[var(--glass)]">
          <TabsTrigger value="webhooks" className="data-[state=active]:bg-[var(--nexus-gold)] data-[state=active]:text-white">
            <Webhook className="w-4 h-4 mr-2" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="logs" className="data-[state=active]:bg-[var(--nexus-gold)] data-[state=active]:text-white">
            <History className="w-4 h-4 mr-2" />
            Delivery Logs
          </TabsTrigger>
        </TabsList>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search webhooks..."
                className="pl-10 bg-[var(--glass)] border-[var(--glass-border)]"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'active', 'inactive', 'error'].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status as typeof statusFilter)}
                  className={statusFilter === status ? 'bg-[var(--nexus-gold)] text-white' : ''}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Webhooks List */}
          <div className="space-y-4">
            {filteredWebhooks.map((webhook) => (
              <WebhookCard
                key={webhook.id}
                webhook={webhook}
                onEdit={() => setEditingWebhook(webhook)}
                onDelete={() => handleDelete(webhook.id)}
                onTest={() => handleTest(webhook.id)}
                onToggle={() => handleToggle(webhook.id)}
              />
            ))}
          </div>

          {filteredWebhooks.length === 0 && (
            <div className="text-center py-12">
              <Webhook className="w-12 h-12 mx-auto text-[var(--text-dim)]" />
              <p className="text-[var(--text-mid)] mt-4">No webhooks found</p>
              <Button onClick={() => setShowCreateDialog(true)} className="btn-gold mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Webhook
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Recent Deliveries</h3>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
          
          <div className="space-y-2">
            {logs.map((log) => (
              <WebhookLogItem key={log.id} log={log} onClick={() => setSelectedLog(log)} />
            ))}
          </div>

          {logs.length === 0 && (
            <div className="text-center py-12">
              <History className="w-12 h-12 mx-auto text-[var(--text-dim)]" />
              <p className="text-[var(--text-mid)] mt-4">No delivery logs yet</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {showCreateDialog && (
        <WebhookDialog onClose={() => setShowCreateDialog(false)} onSave={handleCreate} />
      )}
      
      {editingWebhook && (
        <WebhookDialog webhook={editingWebhook} onClose={() => setEditingWebhook(null)} onSave={handleUpdate} />
      )}
      
      {selectedLog && (
        <LogDetailDialog log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </div>
  );
}

export default IntegrationManager;
