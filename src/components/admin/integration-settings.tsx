'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import {
  Settings,
  Link2,
  Unlink,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Key,
  Globe,
  Shield,
  Activity,
  Trash2,
  Plus,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  Zap
} from 'lucide-react';

// ============================================
// TYPES
// ============================================
interface ConnectedApp {
  id: string;
  name: string;
  provider: string;
  status: 'connected' | 'disconnected' | 'error';
  connectedAt: string;
  lastSyncAt?: string;
  syncEnabled: boolean;
  syncInterval: number;
  credentials: {
    hasValidCredentials: boolean;
    expiresAt?: string;
  };
  error?: string;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  prefix: string;
  createdAt: string;
  lastUsedAt?: string;
  expiresAt?: string;
  permissions: string[];
}

// ============================================
// MOCK DATA
// ============================================
const MOCK_CONNECTED_APPS: ConnectedApp[] = [
  {
    id: 'conn_001',
    name: 'Google Workspace',
    provider: 'google_workspace',
    status: 'connected',
    connectedAt: new Date(Date.now() - 30 * 24 * 3600000).toISOString(),
    lastSyncAt: new Date(Date.now() - 3600000).toISOString(),
    syncEnabled: true,
    syncInterval: 15,
    credentials: {
      hasValidCredentials: true,
      expiresAt: new Date(Date.now() + 180 * 24 * 3600000).toISOString(),
    },
  },
  {
    id: 'conn_002',
    name: 'Stripe',
    provider: 'stripe',
    status: 'connected',
    connectedAt: new Date(Date.now() - 14 * 24 * 3600000).toISOString(),
    lastSyncAt: new Date(Date.now() - 7200000).toISOString(),
    syncEnabled: true,
    syncInterval: 30,
    credentials: {
      hasValidCredentials: true,
    },
  },
  {
    id: 'conn_003',
    name: 'QuickBooks Online',
    provider: 'quickbooks',
    status: 'error',
    connectedAt: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
    lastSyncAt: new Date(Date.now() - 86400000).toISOString(),
    syncEnabled: false,
    syncInterval: 60,
    credentials: {
      hasValidCredentials: false,
      expiresAt: new Date(Date.now() - 86400000).toISOString(),
    },
    error: 'OAuth token expired',
  },
];

const MOCK_API_KEYS: ApiKey[] = [
  {
    id: 'key_001',
    name: 'Production API Key',
    key: 'nxos_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
    prefix: 'nxos_live_...',
    createdAt: new Date(Date.now() - 90 * 24 * 3600000).toISOString(),
    lastUsedAt: new Date(Date.now() - 3600000).toISOString(),
    permissions: ['read', 'write'],
  },
  {
    id: 'key_002',
    name: 'Zapier Integration',
    key: 'nxos_test_z1y2x3w4v5u6t7s8r9q0p1o2n3m4l5k6',
    prefix: 'nxos_test_...',
    createdAt: new Date(Date.now() - 30 * 24 * 3600000).toISOString(),
    lastUsedAt: new Date(Date.now() - 86400000).toISOString(),
    permissions: ['read'],
    expiresAt: new Date(Date.now() + 60 * 24 * 3600000).toISOString(),
  },
];

// ============================================
// CONNECTED APP CARD
// ============================================
function ConnectedAppCard({
  app,
  onDisconnect,
  onConfigure,
  onSync
}: {
  app: ConnectedApp;
  onDisconnect: () => void;
  onConfigure: () => void;
  onSync: () => void;
}) {
  const statusColors = {
    connected: 'bg-[var(--success)]/10 text-[var(--success)]',
    disconnected: 'bg-[var(--text-dim)]/10 text-[var(--text-mid)]',
    error: 'bg-[var(--error)]/10 text-[var(--error)]',
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    return d.toLocaleString();
  };

  return (
    <div className="p-4 rounded-xl bg-[var(--glass)] border border-[var(--glass-border)]">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--nexus-violet)]/20 flex items-center justify-center">
            <Link2 className="w-5 h-5 text-[var(--nexus-violet-lite)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-[var(--text-primary)]">{app.name}</h3>
              <span className={`px-2 py-0.5 rounded text-xs ${statusColors[app.status]}`}>
                {app.status}
              </span>
            </div>
            <p className="text-sm text-[var(--text-dim)]">
              Connected {formatTime(app.connectedAt)}
            </p>
            
            {/* Sync Info */}
            <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-dim)]">
              {app.lastSyncAt && (
                <span className="flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" />
                  Last sync: {formatTime(app.lastSyncAt)}
                </span>
              )}
              {app.syncEnabled && (
                <span>Sync every {app.syncInterval} min</span>
              )}
            </div>

            {/* Error */}
            {app.error && (
              <div className="mt-2 p-2 rounded bg-[var(--error)]/10 text-xs text-[var(--error)]">
                {app.error}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Switch
            checked={app.syncEnabled}
            onCheckedChange={onConfigure}
          />
          <Button variant="outline" size="sm" onClick={onSync}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onDisconnect} className="text-[var(--error)]">
            <Unlink className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// API KEY CARD
// ============================================
function ApiKeyCard({
  apiKey,
  onRevoke,
  onCopy
}: {
  apiKey: ApiKey;
  onRevoke: () => void;
  onCopy: () => void;
}) {
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="p-4 rounded-xl bg-[var(--glass)] border border-[var(--glass-border)]">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-[var(--text-primary)]">{apiKey.name}</h3>
          <code className="text-sm text-[var(--text-mid)] font-mono">
            {showKey ? apiKey.key : apiKey.prefix}
          </code>
          
          <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-dim)]">
            <span>Created {new Date(apiKey.createdAt).toLocaleDateString()}</span>
            {apiKey.lastUsedAt && (
              <span>Last used {new Date(apiKey.lastUsedAt).toLocaleDateString()}</span>
            )}
            {apiKey.expiresAt && (
              <span>Expires {new Date(apiKey.expiresAt).toLocaleDateString()}</span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-2">
            {apiKey.permissions.map((perm) => (
              <Badge key={perm} variant="outline" className="text-xs">
                {perm}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowKey(!showKey)}>
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={onCopy}>
            <Copy className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onRevoke} className="text-[var(--error)]">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// CREATE API KEY DIALOG
// ============================================
function CreateApiKeyDialog({
  onClose,
  onCreate
}: {
  onClose: () => void;
  onCreate: (data: { name: string; permissions: string[]; expiresIn?: number }) => void;
}) {
  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState<string[]>(['read']);
  const [expiresIn, setExpiresIn] = useState<string>('never');

  const handleCreate = () => {
    onCreate({
      name,
      permissions,
      expiresIn: expiresIn === 'never' ? undefined : parseInt(expiresIn),
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-[#0A0820] border border-[rgba(167,139,250,0.2)]">
        <DialogHeader>
          <DialogTitle className="text-[var(--text-primary)]">Create API Key</DialogTitle>
          <DialogDescription className="text-[var(--text-mid)]">
            Generate a new API key for programmatic access.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-[var(--text-mid)]">Key Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Production API Key"
              className="bg-[var(--glass)] border-[var(--glass-border)]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[var(--text-mid)]">Permissions</Label>
            <div className="flex gap-2">
              {['read', 'write', 'admin'].map((perm) => (
                <button
                  key={perm}
                  onClick={() => {
                    setPermissions(prev =>
                      prev.includes(perm)
                        ? prev.filter(p => p !== perm)
                        : [...prev, perm]
                    );
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    permissions.includes(perm)
                      ? 'bg-[var(--nexus-gold)] text-white'
                      : 'bg-[var(--glass)] text-[var(--text-mid)]'
                  }`}
                >
                  {perm}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[var(--text-mid)]">Expiration</Label>
            <Select value={expiresIn} onValueChange={setExpiresIn}>
              <SelectTrigger className="bg-[var(--glass)] border-[var(--glass-border)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Never</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="365">1 year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-3 rounded-lg bg-[rgba(240,180,41,0.05)] border border-[var(--nexus-gold)]/20">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-[var(--nexus-gold)] mt-0.5" />
              <div className="text-xs text-[var(--text-mid)]">
                <p>Store your API key securely. It will only be shown once.</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="btn-gold" onClick={handleCreate} disabled={!name}>
            <Key className="w-4 h-4 mr-2" />
            Generate Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export function IntegrationSettings() {
  const [connectedApps, setConnectedApps] = useState<ConnectedApp[]>(MOCK_CONNECTED_APPS);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(MOCK_API_KEYS);
  const [showCreateKey, setShowCreateKey] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);

  const handleDisconnect = (id: string) => {
    if (confirm('Are you sure you want to disconnect this integration?')) {
      setConnectedApps(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleSync = (id: string) => {
    console.log('Syncing:', id);
    // Simulate sync
  };

  const handleCreateKey = (data: { name: string; permissions: string[]; expiresIn?: number }) => {
    const newApiKey: ApiKey = {
      id: `key_${Date.now()}`,
      name: data.name,
      key: `nxos_live_${Math.random().toString(36).substring(2, 18)}${Math.random().toString(36).substring(2, 18)}`,
      prefix: 'nxos_live_...',
      createdAt: new Date().toISOString(),
      permissions: data.permissions,
      expiresAt: data.expiresIn ? new Date(Date.now() + data.expiresIn * 24 * 3600000).toISOString() : undefined,
    };
    setApiKeys(prev => [...prev, newApiKey]);
    setNewKey(newApiKey.key);
    setShowCreateKey(false);
  };

  const handleRevokeKey = (id: string) => {
    if (confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      setApiKeys(prev => prev.filter(k => k.id !== id));
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Settings className="w-6 h-6 text-[var(--nexus-violet-lite)]" />
            Integration Settings
          </h2>
          <p className="text-sm text-[var(--text-mid)]">Manage connected apps and API keys</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[var(--glass)] border border-[var(--glass-border)]">
          <p className="text-sm text-[var(--text-mid)]">Connected Apps</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{connectedApps.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-[var(--glass)] border border-[var(--glass-border)]">
          <p className="text-sm text-[var(--text-mid)]">Active</p>
          <p className="text-2xl font-bold text-[var(--success)]">
            {connectedApps.filter(a => a.status === 'connected').length}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-[var(--glass)] border border-[var(--glass-border)]">
          <p className="text-sm text-[var(--text-mid)]">API Keys</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{apiKeys.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="apps">
        <TabsList className="bg-[var(--glass)]">
          <TabsTrigger value="apps" className="data-[state=active]:bg-[var(--nexus-gold)] data-[state=active]:text-white">
            <Link2 className="w-4 h-4 mr-2" />
            Connected Apps
          </TabsTrigger>
          <TabsTrigger value="apikeys" className="data-[state=active]:bg-[var(--nexus-gold)] data-[state=active]:text-white">
            <Key className="w-4 h-4 mr-2" />
            API Keys
          </TabsTrigger>
        </TabsList>

        {/* Connected Apps Tab */}
        <TabsContent value="apps" className="space-y-4 mt-4">
          {connectedApps.map((app) => (
            <ConnectedAppCard
              key={app.id}
              app={app}
              onDisconnect={() => handleDisconnect(app.id)}
              onConfigure={() => console.log('Configure:', app.id)}
              onSync={() => handleSync(app.id)}
            />
          ))}

          {connectedApps.length === 0 && (
            <div className="text-center py-12">
              <Link2 className="w-12 h-12 mx-auto text-[var(--text-dim)]" />
              <p className="text-[var(--text-mid)] mt-4">No connected apps</p>
              <p className="text-sm text-[var(--text-dim)] mt-1">
                Visit the Marketplace to connect your first integration
              </p>
            </div>
          )}
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="apikeys" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowCreateKey(true)} className="btn-gold">
              <Plus className="w-4 h-4 mr-2" />
              Create API Key
            </Button>
          </div>

          {apiKeys.map((apiKey) => (
            <ApiKeyCard
              key={apiKey.id}
              apiKey={apiKey}
              onRevoke={() => handleRevokeKey(apiKey.id)}
              onCopy={() => handleCopyKey(apiKey.key)}
            />
          ))}

          {apiKeys.length === 0 && (
            <div className="text-center py-12">
              <Key className="w-12 h-12 mx-auto text-[var(--text-dim)]" />
              <p className="text-[var(--text-mid)] mt-4">No API keys</p>
              <Button onClick={() => setShowCreateKey(true)} className="btn-gold mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First API Key
              </Button>
            </div>
          )}

          {/* Zapier Integration Info */}
          <div className="p-4 rounded-xl bg-[rgba(255,79,0,0.05)] border border-[#FF4F00]/20">
            <div className="flex items-start gap-3">
              <Zap className="w-6 h-6 text-[#FF4F00]" />
              <div>
                <h3 className="font-semibold text-[var(--text-primary)]">Zapier Integration</h3>
                <p className="text-sm text-[var(--text-mid)] mt-1">
                  Connect NexusOS with 5,000+ apps through Zapier. Use your API key to authenticate.
                </p>
                <a 
                  href="https://zapier.com/apps/nexusos/integrations" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-[#FF4F00] hover:underline mt-2"
                >
                  View on Zapier <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create API Key Dialog */}
      {showCreateKey && (
        <CreateApiKeyDialog
          onClose={() => setShowCreateKey(false)}
          onCreate={handleCreateKey}
        />
      )}

      {/* Show New Key Dialog */}
      {newKey && (
        <Dialog open onOpenChange={() => setNewKey(null)}>
          <DialogContent className="max-w-md bg-[#0A0820] border border-[rgba(167,139,250,0.2)]">
            <DialogHeader>
              <DialogTitle className="text-[var(--text-primary)]">API Key Created</DialogTitle>
              <DialogDescription className="text-[var(--text-mid)]">
                Copy your API key now. It will not be shown again.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="p-3 rounded-lg bg-[var(--glass)] border border-[var(--glass-border)] font-mono text-sm break-all text-[var(--text-primary)]">
                {newKey}
              </div>
              <Button
                variant="outline"
                className="w-full mt-3"
                onClick={() => navigator.clipboard.writeText(newKey)}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy to Clipboard
              </Button>
            </div>

            <DialogFooter>
              <Button onClick={() => setNewKey(null)} className="btn-gold">
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default IntegrationSettings;
