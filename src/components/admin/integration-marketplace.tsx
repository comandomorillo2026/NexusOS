'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import {
  Plug,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  ExternalLink,
  Settings,
  Trash2,
  ChevronRight,
  Zap,
  Building2,
  CreditCard,
  Calendar,
  Mail,
  FileText,
  Video,
  Cloud,
  Lock,
  Globe,
  TrendingUp,
  AlertCircle,
  Link2,
  Unlink,
  Sync,
  Shield,
  Key
} from 'lucide-react';

// ============================================
// TYPES
// ============================================
type IntegrationStatus = 'connected' | 'disconnected' | 'pending' | 'error';
type IntegrationCategory = 'accounting' | 'calendar' | 'email' | 'documents' | 'payments' | 'communication' | 'storage';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: IntegrationCategory;
  logo: string;
  status: IntegrationStatus;
  features: string[];
  lastSync?: string;
  syncStatus?: 'synced' | 'syncing' | 'error';
  error?: string;
  website: string;
  popularity: number; // 1-100
  isPopular?: boolean;
  isNew?: boolean;
  oauthUrl?: string;
  apiDocUrl?: string;
}

interface ConnectedIntegration extends Integration {
  connectedAt: string;
  syncEnabled: boolean;
  lastSyncAt?: string;
  syncInterval: number; // minutes
  credentials?: {
    hasValidCredentials: boolean;
    expiresAt?: string;
  };
}

// ============================================
// AVAILABLE INTEGRATIONS
// ============================================
const AVAILABLE_INTEGRATIONS: Integration[] = [
  // Accounting
  {
    id: 'quickbooks',
    name: 'QuickBooks Online',
    description: 'Sync invoices, payments, and financial data with QuickBooks accounting software.',
    category: 'accounting',
    logo: 'quickbooks',
    status: 'disconnected',
    features: ['Invoice Sync', 'Payment Tracking', 'Client Sync', 'Tax Reports'],
    website: 'https://quickbooks.intuit.com',
    popularity: 95,
    isPopular: true,
    apiDocUrl: 'https://developer.intuit.com/app/developer/qbo/docs/api',
  },
  {
    id: 'xero',
    name: 'Xero',
    description: 'Connect with Xero for seamless accounting and financial management.',
    category: 'accounting',
    logo: 'xero',
    status: 'disconnected',
    features: ['Invoice Sync', 'Bank Feeds', 'Contact Sync', 'Financial Reports'],
    website: 'https://xero.com',
    popularity: 85,
    isPopular: true,
    apiDocUrl: 'https://developer.xero.com/documentation',
  },
  
  // Calendar & Email
  {
    id: 'google_workspace',
    name: 'Google Workspace',
    description: 'Integrate with Google Calendar and Gmail for seamless scheduling and communication.',
    category: 'calendar',
    logo: 'google',
    status: 'disconnected',
    features: ['Calendar Sync', 'Gmail Integration', 'Contact Sync', 'Drive Integration'],
    website: 'https://workspace.google.com',
    popularity: 98,
    isPopular: true,
    apiDocUrl: 'https://developers.google.com/workspace',
  },
  {
    id: 'microsoft_outlook',
    name: 'Microsoft Outlook',
    description: 'Connect with Microsoft 365 for calendar and email synchronization.',
    category: 'email',
    logo: 'microsoft',
    status: 'disconnected',
    features: ['Outlook Calendar', 'Email Sync', 'Contact Sync', 'Teams Integration'],
    website: 'https://microsoft.com/outlook',
    popularity: 90,
    isPopular: true,
    apiDocUrl: 'https://docs.microsoft.com/graph',
  },
  
  // Documents
  {
    id: 'docusign',
    name: 'DocuSign',
    description: 'Send documents for electronic signature directly from your cases.',
    category: 'documents',
    logo: 'docusign',
    status: 'disconnected',
    features: ['E-Signatures', 'Document Tracking', 'Templates', 'Status Updates'],
    website: 'https://docusign.com',
    popularity: 88,
    isPopular: true,
    apiDocUrl: 'https://developers.docusign.com',
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'Store and sync documents with Dropbox cloud storage.',
    category: 'storage',
    logo: 'dropbox',
    status: 'disconnected',
    features: ['File Storage', 'Document Sync', 'Sharing', 'Version History'],
    website: 'https://dropbox.com',
    popularity: 82,
    apiDocUrl: 'https://developers.dropbox.com',
  },
  {
    id: 'googledrive',
    name: 'Google Drive',
    description: 'Store and manage documents with Google Drive integration.',
    category: 'storage',
    logo: 'google-drive',
    status: 'disconnected',
    features: ['File Storage', 'Real-time Collaboration', 'Sharing', 'Search'],
    website: 'https://drive.google.com',
    popularity: 92,
    apiDocUrl: 'https://developers.google.com/drive',
  },
  
  // Payments
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Accept online payments and manage subscriptions with Stripe.',
    category: 'payments',
    logo: 'stripe',
    status: 'disconnected',
    features: ['Payment Processing', 'Subscriptions', 'Invoicing', 'Financial Reports'],
    website: 'https://stripe.com',
    popularity: 94,
    isPopular: true,
    apiDocUrl: 'https://stripe.com/docs',
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Accept payments globally with PayPal integration.',
    category: 'payments',
    logo: 'paypal',
    status: 'disconnected',
    features: ['Payment Processing', 'Invoicing', 'International Payments', 'Refunds'],
    website: 'https://paypal.com',
    popularity: 89,
    apiDocUrl: 'https://developer.paypal.com',
  },
  
  // Communication
  {
    id: 'zoom',
    name: 'Zoom',
    description: 'Schedule and host Zoom meetings directly from appointments.',
    category: 'communication',
    logo: 'zoom',
    status: 'disconnected',
    features: ['Meeting Scheduling', 'Video Calls', 'Recordings', 'Webinars'],
    website: 'https://zoom.us',
    popularity: 91,
    isPopular: true,
    apiDocUrl: 'https://developers.zoom.us',
  },
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'Send SMS notifications and enable voice communications.',
    category: 'communication',
    logo: 'twilio',
    status: 'disconnected',
    features: ['SMS Notifications', 'Voice Calls', 'WhatsApp', 'Two-Factor Auth'],
    website: 'https://twilio.com',
    popularity: 78,
    apiDocUrl: 'https://twilio.com/docs',
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'Professional email delivery with analytics and templates.',
    category: 'email',
    logo: 'sendgrid',
    status: 'disconnected',
    features: ['Email Delivery', 'Templates', 'Analytics', 'Webhooks'],
    website: 'https://sendgrid.com',
    popularity: 76,
    apiDocUrl: 'https://sendgrid.com/docs',
  },
  
  // Automation
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect NexusOS with 5,000+ apps through automated workflows.',
    category: 'communication',
    logo: 'zapier',
    status: 'disconnected',
    features: ['5,000+ Apps', 'No-Code Automation', 'Triggers', 'Actions'],
    website: 'https://zapier.com',
    popularity: 96,
    isPopular: true,
    isNew: true,
    apiDocUrl: 'https://zapier.com/developer',
  },
  
  // Legal-specific
  {
    id: 'clio',
    name: 'Clio',
    description: 'Import data from Clio practice management software.',
    category: 'documents',
    logo: 'clio',
    status: 'disconnected',
    features: ['Data Import', 'Matter Sync', 'Contact Import', 'Time Entries'],
    website: 'https://clio.com',
    popularity: 65,
    apiDocUrl: 'https://developers.clio.com',
  },
];

// Mock connected integrations
const MOCK_CONNECTED: ConnectedIntegration[] = [
  {
    ...AVAILABLE_INTEGRATIONS.find(i => i.id === 'google_workspace')!,
    status: 'connected',
    connectedAt: new Date(Date.now() - 30 * 24 * 3600000).toISOString(),
    syncEnabled: true,
    lastSyncAt: new Date(Date.now() - 3600000).toISOString(),
    syncInterval: 15,
    syncStatus: 'synced',
    credentials: {
      hasValidCredentials: true,
      expiresAt: new Date(Date.now() + 180 * 24 * 3600000).toISOString(),
    },
  },
  {
    ...AVAILABLE_INTEGRATIONS.find(i => i.id === 'stripe')!,
    status: 'connected',
    connectedAt: new Date(Date.now() - 14 * 24 * 3600000).toISOString(),
    syncEnabled: true,
    lastSyncAt: new Date(Date.now() - 7200000).toISOString(),
    syncInterval: 30,
    syncStatus: 'synced',
    credentials: {
      hasValidCredentials: true,
    },
  },
];

// ============================================
// CATEGORY CONFIG
// ============================================
const CATEGORY_CONFIG: Record<IntegrationCategory, { label: string; icon: React.ElementType; color: string }> = {
  accounting: { label: 'Accounting', icon: CreditCard, color: '#10B981' },
  calendar: { label: 'Calendar', icon: Calendar, color: '#6366F1' },
  email: { label: 'Email', icon: Mail, color: '#EC4899' },
  documents: { label: 'Documents', icon: FileText, color: '#F59E0B' },
  payments: { label: 'Payments', icon: CreditCard, color: '#8B5CF6' },
  communication: { label: 'Communication', icon: Video, color: '#22D3EE' },
  storage: { label: 'Storage', icon: Cloud, color: '#34D399' },
};

// ============================================
// INTEGRATION LOGO COMPONENT
// ============================================
function IntegrationLogo({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const logoColors: Record<string, string> = {
    quickbooks: '#2CA01C',
    xero: '#13B5EA',
    google: '#4285F4',
    microsoft: '#00A4EF',
    docusign: '#FFCC00',
    dropbox: '#0061FF',
    'google-drive': '#4285F4',
    stripe: '#635BFF',
    paypal: '#00457C',
    zoom: '#2D8CFF',
    twilio: '#F22F46',
    sendgrid: '#1A82E2',
    zapier: '#FF4F00',
    clio: '#5C66C4',
  };

  return (
    <div className={`${sizeClasses[size]} rounded-xl flex items-center justify-center`} 
         style={{ backgroundColor: `${logoColors[name] || '#6366F1'}20` }}>
      <span className="font-bold text-white" style={{ color: logoColors[name] || '#6366F1' }}>
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

// ============================================
// INTEGRATION CARD COMPONENT
// ============================================
function IntegrationCard({
  integration,
  onConnect,
  onDisconnect,
  onConfigure
}: {
  integration: Integration | ConnectedIntegration;
  onConnect: () => void;
  onDisconnect: () => void;
  onConfigure: () => void;
}) {
  const isConnected = integration.status === 'connected';
  const connectedInt = integration as ConnectedIntegration;
  
  const categoryConfig = CATEGORY_CONFIG[integration.category];
  const CategoryIcon = categoryConfig.icon;

  const statusColors: Record<IntegrationStatus, string> = {
    connected: 'bg-[var(--success)]/10 text-[var(--success)]',
    disconnected: 'bg-[var(--text-dim)]/10 text-[var(--text-mid)]',
    pending: 'bg-[var(--nexus-gold)]/10 text-[var(--nexus-gold)]',
    error: 'bg-[var(--error)]/10 text-[var(--error)]',
  };

  return (
    <div className="p-4 rounded-xl bg-[var(--glass)] border border-[var(--glass-border)] hover:border-[rgba(167,139,250,0.3)] transition-all">
      <div className="flex items-start gap-4">
        <IntegrationLogo name={integration.logo} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-[var(--text-primary)]">{integration.name}</h3>
            {integration.isPopular && (
              <Badge variant="outline" className="text-xs bg-[var(--nexus-gold)]/10 text-[var(--nexus-gold)] border-[var(--nexus-gold)]/20">
                Popular
              </Badge>
            )}
            {integration.isNew && (
              <Badge variant="outline" className="text-xs bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20">
                New
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-[var(--text-mid)] mt-1 line-clamp-2">{integration.description}</p>
          
          {/* Features */}
          <div className="flex flex-wrap gap-1 mt-2">
            {integration.features.slice(0, 3).map((feature) => (
              <Badge key={feature} variant="outline" className="text-xs">
                {feature}
              </Badge>
            ))}
            {integration.features.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{integration.features.length - 3}
              </Badge>
            )}
          </div>
          
          {/* Connected Info */}
          {isConnected && (
            <div className="mt-3 flex items-center gap-4 text-xs text-[var(--text-dim)]">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-[var(--success)]" />
                Connected {new Date(connectedInt.connectedAt).toLocaleDateString()}
              </span>
              {connectedInt.lastSyncAt && (
                <span className="flex items-center gap-1">
                  <Sync className="w-3 h-3" />
                  Synced {new Date(connectedInt.lastSyncAt).toLocaleString()}
                </span>
              )}
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex flex-col gap-2">
          {isConnected ? (
            <>
              <Button variant="outline" size="sm" onClick={onConfigure}>
                <Settings className="w-4 h-4 mr-1" />
                Configure
              </Button>
              <Button variant="outline" size="sm" onClick={onDisconnect} className="text-[var(--error)]">
                <Unlink className="w-4 h-4 mr-1" />
                Disconnect
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={onConnect} className="btn-gold">
              <Link2 className="w-4 h-4 mr-1" />
              Connect
            </Button>
          )}
        </div>
      </div>
      
      {/* Category Badge */}
      <div className="mt-3 pt-3 border-t border-[var(--glass-border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CategoryIcon className="w-4 h-4" style={{ color: categoryConfig.color }} />
          <span className="text-xs text-[var(--text-mid)]">{categoryConfig.label}</span>
        </div>
        <a 
          href={integration.website} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-[var(--nexus-violet-lite)] hover:underline flex items-center gap-1"
        >
          Learn more <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

// ============================================
// CONNECT DIALOG
// ============================================
function ConnectDialog({
  integration,
  onClose,
  onConnect
}: {
  integration: Integration;
  onClose: () => void;
  onConnect: () => void;
}) {
  const [step, setStep] = useState<'info' | 'oauth' | 'config'>('info');
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [syncInterval, setSyncInterval] = useState('15');

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-[#0A0820] border border-[rgba(167,139,250,0.2)]">
        <DialogHeader>
          <DialogTitle className="text-[var(--text-primary)] flex items-center gap-2">
            <IntegrationLogo name={integration.logo} size="sm" />
            Connect {integration.name}
          </DialogTitle>
          <DialogDescription className="text-[var(--text-mid)]">
            {integration.description}
          </DialogDescription>
        </DialogHeader>

        {step === 'info' && (
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-[var(--glass)] space-y-3">
              <h4 className="font-medium text-[var(--text-primary)]">What you'll get:</h4>
              <ul className="space-y-2">
                {integration.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-[var(--text-mid)]">
                    <CheckCircle className="w-4 h-4 text-[var(--success)]" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-[rgba(240,180,41,0.05)] border border-[var(--nexus-gold)]/20">
              <div className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-[var(--nexus-gold)] mt-0.5" />
                <div>
                  <p className="text-sm text-[var(--text-primary)] font-medium">Secure Connection</p>
                  <p className="text-xs text-[var(--text-mid)] mt-1">
                    Your credentials are encrypted and stored securely. We never store passwords.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--glass)]">
              <div className="flex items-center gap-2">
                <Sync className="w-4 h-4 text-[var(--text-mid)]" />
                <span className="text-sm text-[var(--text-primary)]">Enable automatic sync</span>
              </div>
              <Switch checked={syncEnabled} onCheckedChange={setSyncEnabled} />
            </div>
          </div>
        )}

        {step === 'oauth' && (
          <div className="py-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-[var(--nexus-violet)]/20 flex items-center justify-center mb-4">
              <Key className="w-8 h-8 text-[var(--nexus-violet-lite)]" />
            </div>
            <p className="text-[var(--text-mid)] mb-4">
              You'll be redirected to {integration.name} to authorize access.
            </p>
            <Button className="btn-gold" onClick={() => setStep('config')}>
              Continue to {integration.name}
            </Button>
          </div>
        )}

        {step === 'config' && (
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-[var(--success)]/10 border border-[var(--success)]/20">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[var(--success)]" />
                <span className="text-[var(--text-primary)]">Successfully connected!</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[var(--text-mid)]">Sync Interval</Label>
              <Select value={syncInterval} onValueChange={setSyncInterval}>
                <SelectTrigger className="bg-[var(--glass)] border-[var(--glass-border)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">Every 5 minutes</SelectItem>
                  <SelectItem value="15">Every 15 minutes</SelectItem>
                  <SelectItem value="30">Every 30 minutes</SelectItem>
                  <SelectItem value="60">Every hour</SelectItem>
                  <SelectItem value="360">Every 6 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 'info' && (
            <>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button className="btn-gold" onClick={() => setStep('oauth')}>
                Continue
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </>
          )}
          {step === 'oauth' && (
            <Button variant="outline" onClick={() => setStep('info')}>
              Back
            </Button>
          )}
          {step === 'config' && (
            <>
              <Button variant="outline" onClick={onClose}>Skip</Button>
              <Button className="btn-gold" onClick={onConnect}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Setup
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// CONFIGURE DIALOG
// ============================================
function ConfigureDialog({
  integration,
  onClose,
  onSave
}: {
  integration: ConnectedIntegration;
  onClose: () => void;
  onSave: () => void;
}) {
  const [syncEnabled, setSyncEnabled] = useState(integration.syncEnabled);
  const [syncInterval, setSyncInterval] = useState(String(integration.syncInterval));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-[#0A0820] border border-[rgba(167,139,250,0.2)]">
        <DialogHeader>
          <DialogTitle className="text-[var(--text-primary)] flex items-center gap-2">
            <IntegrationLogo name={integration.logo} size="sm" />
            Configure {integration.name}
          </DialogTitle>
          <DialogDescription className="text-[var(--text-mid)]">
            Manage your integration settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Connection Status */}
          <div className="p-4 rounded-lg bg-[var(--glass)]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[var(--text-mid)]">Connection Status</span>
              <Badge className="bg-[var(--success)]/10 text-[var(--success)]">
                <CheckCircle className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            </div>
            <div className="text-xs text-[var(--text-dim)]">
              Connected on {new Date(integration.connectedAt).toLocaleDateString()}
            </div>
          </div>

          {/* Sync Settings */}
          <div className="space-y-4">
            <h4 className="font-medium text-[var(--text-primary)]">Sync Settings</h4>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--glass)]">
              <div>
                <p className="text-sm text-[var(--text-primary)]">Automatic Sync</p>
                <p className="text-xs text-[var(--text-dim)]">Keep your data synchronized</p>
              </div>
              <Switch checked={syncEnabled} onCheckedChange={setSyncEnabled} />
            </div>

            <div className="space-y-2">
              <Label className="text-[var(--text-mid)]">Sync Interval</Label>
              <Select value={syncInterval} onValueChange={setSyncInterval}>
                <SelectTrigger className="bg-[var(--glass)] border-[var(--glass-border)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">Every 5 minutes</SelectItem>
                  <SelectItem value="15">Every 15 minutes</SelectItem>
                  <SelectItem value="30">Every 30 minutes</SelectItem>
                  <SelectItem value="60">Every hour</SelectItem>
                  <SelectItem value="360">Every 6 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sync History */}
          {integration.lastSyncAt && (
            <div className="space-y-3">
              <h4 className="font-medium text-[var(--text-primary)]">Last Sync</h4>
              <div className="p-3 rounded-lg bg-[var(--glass)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sync className="w-4 h-4 text-[var(--success)]" />
                  <span className="text-sm text-[var(--text-primary)]">
                    {new Date(integration.lastSyncAt).toLocaleString()}
                  </span>
                </div>
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Sync Now
                </Button>
              </div>
            </div>
          )}

          {/* Danger Zone */}
          <div className="pt-4 border-t border-[var(--glass-border)]">
            <Button variant="outline" className="w-full text-[var(--error)] hover:text-[var(--error)]">
              <Unlink className="w-4 h-4 mr-2" />
              Disconnect Integration
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="btn-gold" onClick={onSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export function IntegrationMarketplace() {
  const [integrations, setIntegrations] = useState<Integration[]>(AVAILABLE_INTEGRATIONS);
  const [connected, setConnected] = useState<ConnectedIntegration[]>(MOCK_CONNECTED);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<IntegrationCategory | 'all'>('all');
  const [showConnected, setShowConnected] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | ConnectedIntegration | null>(null);
  const [showConnect, setShowConnect] = useState(false);
  const [showConfigure, setShowConfigure] = useState(false);

  // Filter integrations
  const filteredIntegrations = integrations.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          i.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || i.category === categoryFilter;
    const matchesConnected = !showConnected || connected.some(c => c.id === i.id);
    return matchesSearch && matchesCategory && matchesConnected;
  });

  // Sort by popularity
  const sortedIntegrations = [...filteredIntegrations].sort((a, b) => b.popularity - a.popularity);

  // Handlers
  const handleConnect = (integration: Integration) => {
    setSelectedIntegration(integration);
    setShowConnect(true);
  };

  const handleDisconnect = (id: string) => {
    if (confirm('Are you sure you want to disconnect this integration?')) {
      setConnected(prev => prev.filter(c => c.id !== id));
      setIntegrations(prev => prev.map(i => 
        i.id === id ? { ...i, status: 'disconnected' as IntegrationStatus } : i
      ));
    }
  };

  const handleConfigure = (integration: ConnectedIntegration) => {
    setSelectedIntegration(integration);
    setShowConfigure(true);
  };

  const completeConnect = () => {
    if (selectedIntegration) {
      const newConnected: ConnectedIntegration = {
        ...selectedIntegration,
        status: 'connected',
        connectedAt: new Date().toISOString(),
        syncEnabled: true,
        syncInterval: 15,
        syncStatus: 'synced',
        credentials: {
          hasValidCredentials: true,
        },
      };
      setConnected(prev => [...prev, newConnected]);
      setIntegrations(prev => prev.map(i => 
        i.id === selectedIntegration.id ? { ...i, status: 'connected' as IntegrationStatus } : i
      ));
    }
    setShowConnect(false);
    setSelectedIntegration(null);
  };

  // Stats
  const stats = {
    total: integrations.length,
    connected: connected.length,
    categories: Object.keys(CATEGORY_CONFIG).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Plug className="w-6 h-6 text-[var(--nexus-violet-lite)]" />
            Integration Marketplace
          </h2>
          <p className="text-sm text-[var(--text-mid)]">Connect NexusOS with your favorite tools and services</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-[var(--nexus-gold)]/10 text-[var(--nexus-gold)]">
            {stats.connected} Connected
          </Badge>
        </div>
      </div>

      {/* Connected Integrations Summary */}
      {connected.length > 0 && (
        <div className="p-4 rounded-xl bg-[var(--glass)] border border-[var(--glass-border)]">
          <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">Connected Services</h3>
          <div className="flex flex-wrap gap-3">
            {connected.map((int) => (
              <button
                key={int.id}
                onClick={() => handleConfigure(int)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--obsidian-3)] hover:bg-[var(--glass)] transition-colors"
              >
                <IntegrationLogo name={int.logo} size="sm" />
                <span className="text-sm text-[var(--text-primary)]">{int.name}</span>
                <CheckCircle className="w-4 h-4 text-[var(--success)]" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search integrations..."
            className="pl-10 bg-[var(--glass)] border-[var(--glass-border)]"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={categoryFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter('all')}
            className={categoryFilter === 'all' ? 'bg-[var(--nexus-gold)] text-white' : ''}
          >
            All
          </Button>
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
            <Button
              key={key}
              variant={categoryFilter === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategoryFilter(key as IntegrationCategory)}
              className={categoryFilter === key ? 'bg-[var(--nexus-gold)] text-white' : ''}
            >
              <config.icon className="w-4 h-4 mr-1" style={{ color: categoryFilter === key ? 'white' : config.color }} />
              {config.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Show Connected Toggle */}
      <div className="flex items-center gap-2">
        <Switch checked={showConnected} onCheckedChange={setShowConnected} />
        <span className="text-sm text-[var(--text-mid)]">Show only connected</span>
      </div>

      {/* Integrations Grid */}
      <div className="grid gap-4">
        {sortedIntegrations.map((integration) => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            onConnect={() => handleConnect(integration)}
            onDisconnect={() => handleDisconnect(integration.id)}
            onConfigure={() => {
              const conn = connected.find(c => c.id === integration.id);
              if (conn) handleConfigure(conn);
            }}
          />
        ))}
      </div>

      {sortedIntegrations.length === 0 && (
        <div className="text-center py-12">
          <Plug className="w-12 h-12 mx-auto text-[var(--text-dim)]" />
          <p className="text-[var(--text-mid)] mt-4">No integrations found</p>
          <Button variant="outline" className="mt-4" onClick={() => { setSearchQuery(''); setCategoryFilter('all'); }}>
            Clear Filters
          </Button>
        </div>
      )}

      {/* Dialogs */}
      {showConnect && selectedIntegration && (
        <ConnectDialog
          integration={selectedIntegration}
          onClose={() => { setShowConnect(false); setSelectedIntegration(null); }}
          onConnect={completeConnect}
        />
      )}

      {showConfigure && selectedIntegration && 'connectedAt' in selectedIntegration && (
        <ConfigureDialog
          integration={selectedIntegration as ConnectedIntegration}
          onClose={() => { setShowConfigure(false); setSelectedIntegration(null); }}
          onSave={() => { setShowConfigure(false); setSelectedIntegration(null); }}
        />
      )}
    </div>
  );
}

export default IntegrationMarketplace;
