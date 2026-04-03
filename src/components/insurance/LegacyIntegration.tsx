'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Server,
  Plus,
  RefreshCw,
  Play,
  Pause,
  Trash2,
  Eye,
  ArrowRightLeft,
  Database,
  FileText,
  Cloud,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Upload,
  Download,
  Settings,
  Terminal,
  Zap,
} from 'lucide-react';

// Types
interface Integration {
  id: string;
  name: string;
  type: 'mainframe' | 'as400' | 'file' | 'api';
  enabled: boolean;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  health: 'healthy' | 'unhealthy' | 'unknown';
  lastConnected?: string;
  latency?: number;
  lastError?: string;
}

interface SyncOperation {
  syncId: string;
  integrationId: string;
  entityType: string;
  direction: 'import' | 'export' | 'bidirectional';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'partial';
  progress: number;
  startedAt?: string;
  totalRecords?: number;
  processedRecords?: number;
  successCount?: number;
  errorCount?: number;
}

interface EntityMapping {
  name: string;
  sourceSystem: string;
  sourceEntity: string;
  targetEntity: string;
  fieldCount: number;
}

interface AuditEntry {
  timestamp: string;
  action: string;
  details: Record<string, unknown>;
}

// Mock data
const mockIntegrations: Integration[] = [
  {
    id: 'mf-001',
    name: 'Mainframe Policy System',
    type: 'mainframe',
    enabled: true,
    status: 'connected',
    health: 'healthy',
    lastConnected: new Date().toISOString(),
    latency: 45,
  },
  {
    id: 'as400-001',
    name: 'AS/400 Claims System',
    type: 'as400',
    enabled: true,
    status: 'connected',
    health: 'healthy',
    lastConnected: new Date().toISOString(),
    latency: 32,
  },
  {
    id: 'file-001',
    name: 'EDI File Gateway',
    type: 'file',
    enabled: true,
    status: 'connected',
    health: 'healthy',
    lastConnected: new Date().toISOString(),
    latency: 15,
  },
  {
    id: 'api-001',
    name: 'Legacy API Bridge',
    type: 'api',
    enabled: false,
    status: 'disconnected',
    health: 'unknown',
    lastError: 'Authentication failed',
  },
];

const mockMappings: EntityMapping[] = [
  { name: 'Policy', sourceSystem: 'mainframe', sourceEntity: 'POLICY_MASTER', targetEntity: 'Policy', fieldCount: 25 },
  { name: 'Claim', sourceSystem: 'as400', sourceEntity: 'CLAIMS_MAST', targetEntity: 'Claim', fieldCount: 20 },
  { name: 'Customer', sourceSystem: 'file', sourceEntity: 'CUSTOMER_MAST', targetEntity: 'Customer', fieldCount: 30 },
  { name: 'Financial', sourceSystem: 'mainframe', sourceEntity: 'FIN_TRANS', targetEntity: 'FinancialTransaction', fieldCount: 18 },
];

const mockAuditLog: AuditEntry[] = [
  { timestamp: new Date().toISOString(), action: 'connection_established', details: { integrationId: 'mf-001' } },
  { timestamp: new Date(Date.now() - 60000).toISOString(), action: 'sync_import_started', details: { entityType: 'Policy', recordCount: 100 } },
  { timestamp: new Date(Date.now() - 120000).toISOString(), action: 'sync_import_completed', details: { successCount: 98, errorCount: 2 } },
];

// Status configurations
const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  connected: { label: 'Connected', color: 'bg-emerald-500/20 text-emerald-300', icon: CheckCircle },
  disconnected: { label: 'Disconnected', color: 'bg-slate-500/20 text-slate-300', icon: XCircle },
  connecting: { label: 'Connecting', color: 'bg-yellow-500/20 text-yellow-300', icon: Clock },
  error: { label: 'Error', color: 'bg-red-500/20 text-red-300', icon: AlertTriangle },
};

const healthConfig: Record<string, { label: string; color: string }> = {
  healthy: { label: 'Healthy', color: 'text-emerald-400' },
  unhealthy: { label: 'Unhealthy', color: 'text-red-400' },
  unknown: { label: 'Unknown', color: 'text-slate-400' },
};

const typeConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  mainframe: { icon: Terminal, color: 'text-cyan-400', label: 'Mainframe' },
  as400: { icon: Server, color: 'text-blue-400', label: 'AS/400' },
  file: { icon: FileText, color: 'text-orange-400', label: 'File-Based' },
  api: { icon: Cloud, color: 'text-purple-400', label: 'API Gateway' },
};

export default function LegacyIntegration() {
  const [integrations, setIntegrations] = useState<Integration[]>(mockIntegrations);
  const [mappings, setMappings] = useState<EntityMapping[]>(mockMappings);
  const [syncOperations, setSyncOperations] = useState<SyncOperation[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(mockAuditLog);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [showNewConnection, setShowNewConnection] = useState(false);
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [showMappingDialog, setShowMappingDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'connections' | 'sync' | 'mappings' | 'audit'>('connections');

  // New connection form state
  const [newConnection, setNewConnection] = useState({
    name: '',
    type: 'mainframe' as const,
    host: '',
    port: '',
    username: '',
    password: '',
  });

  // Sync form state
  const [syncForm, setSyncForm] = useState({
    integrationId: '',
    entityType: 'Policy',
    direction: 'import' as const,
    batchSize: 100,
  });

  // Fetch integration status
  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/insurance/integration/status');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          if (data.data.integrations) {
            setIntegrations(data.data.integrations);
          }
          if (data.data.activeSyncOperations) {
            setSyncOperations(data.data.activeSyncOperations);
          }
          if (data.data.availableMappings) {
            setMappings(data.data.availableMappings);
          }
          if (data.data.auditLog) {
            setAuditLog(data.data.auditLog);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchStatus]);

  // Handle connection action
  const handleConnectionAction = async (integrationId: string, action: 'connect' | 'disconnect' | 'test') => {
    setLoading(true);
    try {
      const response = await fetch('/api/insurance/integration/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrationId, action }),
      });

      if (response.ok) {
        await fetchStatus();
      }
    } catch (error) {
      console.error('Error performing connection action:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle create connection
  const handleCreateConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/insurance/integration/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newConnection.name,
          type: newConnection.type,
          connectionConfig: {
            host: newConnection.host,
            port: parseInt(newConnection.port) || undefined,
            username: newConnection.username,
            password: newConnection.password,
          },
        }),
      });

      if (response.ok) {
        await fetchStatus();
        setShowNewConnection(false);
        setNewConnection({ name: '', type: 'mainframe', host: '', port: '', username: '', password: '' });
      }
    } catch (error) {
      console.error('Error creating connection:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle sync operation
  const handleSync = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/insurance/integration/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          integrationId: syncForm.integrationId,
          entityType: syncForm.entityType,
          direction: syncForm.direction,
          options: { batchSize: syncForm.batchSize },
        }),
      });

      if (response.ok) {
        await fetchStatus();
        setShowSyncDialog(false);
      }
    } catch (error) {
      console.error('Error starting sync:', error);
    } finally {
      setLoading(false);
    }
  };

  // Stats calculation
  const stats = {
    totalIntegrations: integrations.length,
    connected: integrations.filter(i => i.status === 'connected').length,
    healthy: integrations.filter(i => i.health === 'healthy').length,
    activeSyncs: syncOperations.filter(s => s.status === 'running').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Server className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalIntegrations}</p>
                <p className="text-xs text-blue-300/60">Total Connections</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.connected}</p>
                <p className="text-xs text-emerald-300/60">Connected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-cyan-500/5 border-cyan-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-cyan-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.healthy}</p>
                <p className="text-xs text-cyan-300/60">Healthy</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <RefreshCw className={`w-8 h-8 text-purple-400 ${stats.activeSyncs > 0 ? 'animate-spin' : ''}`} />
              <div>
                <p className="text-2xl font-bold text-white">{stats.activeSyncs}</p>
                <p className="text-xs text-purple-300/60">Active Syncs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="border-b border-slate-700">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-blue-400" />
              Legacy System Integration Hub
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="border-slate-600 text-slate-300" onClick={fetchStatus}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => setShowNewConnection(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Connection
              </Button>
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <Button
              variant={activeTab === 'connections' ? 'default' : 'ghost'}
              size="sm"
              className={activeTab === 'connections' ? 'bg-blue-500 text-white' : 'text-slate-400'}
              onClick={() => setActiveTab('connections')}
            >
              <Server className="w-4 h-4 mr-2" />
              Connections
            </Button>
            <Button
              variant={activeTab === 'sync' ? 'default' : 'ghost'}
              size="sm"
              className={activeTab === 'sync' ? 'bg-blue-500 text-white' : 'text-slate-400'}
              onClick={() => setActiveTab('sync')}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync Operations
            </Button>
            <Button
              variant={activeTab === 'mappings' ? 'default' : 'ghost'}
              size="sm"
              className={activeTab === 'mappings' ? 'bg-blue-500 text-white' : 'text-slate-400'}
              onClick={() => setActiveTab('mappings')}
            >
              <Database className="w-4 h-4 mr-2" />
              Mappings
            </Button>
            <Button
              variant={activeTab === 'audit' ? 'default' : 'ghost'}
              size="sm"
              className={activeTab === 'audit' ? 'bg-blue-500 text-white' : 'text-slate-400'}
              onClick={() => setActiveTab('audit')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Audit Trail
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Connections Tab */}
          {activeTab === 'connections' && (
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-700 hover:bg-transparent">
                    <TableHead className="text-slate-400">Name</TableHead>
                    <TableHead className="text-slate-400">Type</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400">Health</TableHead>
                    <TableHead className="text-slate-400">Latency</TableHead>
                    <TableHead className="text-slate-400">Last Connected</TableHead>
                    <TableHead className="text-slate-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {integrations.map((integration) => {
                    const TypeIcon = typeConfig[integration.type]?.icon || Server;
                    const StatusIcon = statusConfig[integration.status]?.icon || XCircle;

                    return (
                      <TableRow key={integration.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <TypeIcon className={`w-4 h-4 ${typeConfig[integration.type]?.color}`} />
                            <div>
                              <p className="text-white font-medium">{integration.name}</p>
                              <p className="text-slate-400 text-xs">{integration.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-slate-600/50 text-slate-300">
                            {typeConfig[integration.type]?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusConfig[integration.status]?.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig[integration.status]?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={healthConfig[integration.health]?.color}>
                            {healthConfig[integration.health]?.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-white">
                          {integration.latency ? `${integration.latency}ms` : '-'}
                        </TableCell>
                        <TableCell className="text-slate-300 text-sm">
                          {integration.lastConnected
                            ? new Date(integration.lastConnected).toLocaleString()
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {integration.status === 'connected' ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-yellow-400 hover:text-white hover:bg-yellow-500/10"
                                  onClick={() => handleConnectionAction(integration.id, 'test')}
                                >
                                  <Zap className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-400 hover:text-white hover:bg-red-500/10"
                                  onClick={() => handleConnectionAction(integration.id, 'disconnect')}
                                >
                                  <Pause className="w-4 h-4" />
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-emerald-400 hover:text-white hover:bg-emerald-500/10"
                                onClick={() => handleConnectionAction(integration.id, 'connect')}
                              >
                                <Play className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-blue-400 hover:text-white hover:bg-blue-500/10"
                              onClick={() => {
                                setSelectedIntegration(integration);
                                setSyncForm({ ...syncForm, integrationId: integration.id });
                                setShowSyncDialog(true);
                              }}
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          )}

          {/* Sync Operations Tab */}
          {activeTab === 'sync' && (
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-white font-medium">Active & Recent Sync Operations</h3>
                <Button
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={() => {
                    if (integrations.length > 0) {
                      setSyncForm({ ...syncForm, integrationId: integrations[0].id });
                    }
                    setShowSyncDialog(true);
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Start Sync
                </Button>
              </div>

              {syncOperations.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <RefreshCw className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No sync operations yet</p>
                  <p className="text-sm">Start a sync to see progress here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {syncOperations.map((sync) => (
                    <Card key={sync.syncId} className="bg-slate-700/30 border-slate-600">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Badge className={sync.status === 'running' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-emerald-500/20 text-emerald-300'}>
                              {sync.status}
                            </Badge>
                            <span className="text-white">{sync.entityType}</span>
                            <span className="text-slate-400">
                              {sync.direction === 'import' ? <Download className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                            </span>
                          </div>
                          <span className="text-slate-400 text-sm">
                            {sync.startedAt ? new Date(sync.startedAt).toLocaleString() : '-'}
                          </span>
                        </div>
                        <Progress value={sync.progress} className="h-2" />
                        <div className="flex justify-between mt-2 text-xs text-slate-400">
                          <span>{sync.processedRecords || 0} / {sync.totalRecords || 0} records</span>
                          <span>{sync.successCount || 0} success, {sync.errorCount || 0} errors</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Mappings Tab */}
          {activeTab === 'mappings' && (
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-700 hover:bg-transparent">
                    <TableHead className="text-slate-400">Mapping Name</TableHead>
                    <TableHead className="text-slate-400">Source System</TableHead>
                    <TableHead className="text-slate-400">Source Entity</TableHead>
                    <TableHead className="text-slate-400">Target Entity</TableHead>
                    <TableHead className="text-slate-400">Fields</TableHead>
                    <TableHead className="text-slate-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mappings.map((mapping, index) => (
                    <TableRow key={index} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <TableCell className="text-white font-medium">{mapping.name}</TableCell>
                      <TableCell>
                        <Badge className="bg-slate-600/50 text-slate-300">
                          {mapping.sourceSystem}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300 font-mono text-sm">{mapping.sourceEntity}</TableCell>
                      <TableCell className="text-slate-300 font-mono text-sm">{mapping.targetEntity}</TableCell>
                      <TableCell className="text-white">{mapping.fieldCount} fields</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-400 hover:text-white hover:bg-blue-500/10"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-emerald-400 hover:text-white hover:bg-emerald-500/10"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}

          {/* Audit Trail Tab */}
          {activeTab === 'audit' && (
            <ScrollArea className="h-[500px]">
              <div className="p-4">
                {auditLog.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No audit entries yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {auditLog.map((entry, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-slate-700/30">
                        <div className="w-2 h-2 mt-2 rounded-full bg-blue-400" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-white font-medium">{entry.action}</span>
                            <span className="text-slate-400 text-xs">
                              {new Date(entry.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <pre className="text-slate-400 text-xs mt-1 overflow-auto">
                            {JSON.stringify(entry.details, null, 2)}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* New Connection Dialog */}
      <Dialog open={showNewConnection} onOpenChange={setShowNewConnection}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-400" />
              New Integration Connection
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-xs text-slate-400 uppercase mb-2 block">Connection Name</label>
              <Input
                className="bg-slate-800/50 border-slate-600 text-white"
                placeholder="e.g., Mainframe Policy System"
                value={newConnection.name}
                onChange={(e) => setNewConnection({ ...newConnection, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase mb-2 block">Connection Type</label>
              <Select
                value={newConnection.type}
                onValueChange={(value) => setNewConnection({ ...newConnection, type: value as 'mainframe' | 'as400' | 'file' | 'api' })}
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mainframe">Mainframe (TCP/IP + 3270)</SelectItem>
                  <SelectItem value="as400">AS/400 (IBM i)</SelectItem>
                  <SelectItem value="file">File-Based (FTP/SFTP)</SelectItem>
                  <SelectItem value="api">API Gateway (REST/SOAP)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 uppercase mb-2 block">Host</label>
                <Input
                  className="bg-slate-800/50 border-slate-600 text-white"
                  placeholder="hostname or IP"
                  value={newConnection.host}
                  onChange={(e) => setNewConnection({ ...newConnection, host: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase mb-2 block">Port</label>
                <Input
                  className="bg-slate-800/50 border-slate-600 text-white"
                  placeholder="port number"
                  value={newConnection.port}
                  onChange={(e) => setNewConnection({ ...newConnection, port: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 uppercase mb-2 block">Username</label>
                <Input
                  className="bg-slate-800/50 border-slate-600 text-white"
                  placeholder="username"
                  value={newConnection.username}
                  onChange={(e) => setNewConnection({ ...newConnection, username: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase mb-2 block">Password</label>
                <Input
                  type="password"
                  className="bg-slate-800/50 border-slate-600 text-white"
                  placeholder="password"
                  value={newConnection.password}
                  onChange={(e) => setNewConnection({ ...newConnection, password: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-slate-600 text-slate-300" onClick={() => setShowNewConnection(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={handleCreateConnection}
              disabled={loading || !newConnection.name}
            >
              {loading ? 'Creating...' : 'Create Connection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sync Dialog */}
      <Dialog open={showSyncDialog} onOpenChange={setShowSyncDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-blue-400" />
              Start Synchronization
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-xs text-slate-400 uppercase mb-2 block">Integration</label>
              <Select
                value={syncForm.integrationId}
                onValueChange={(value) => setSyncForm({ ...syncForm, integrationId: value })}
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                  <SelectValue placeholder="Select integration" />
                </SelectTrigger>
                <SelectContent>
                  {integrations.filter(i => i.status === 'connected').map((integration) => (
                    <SelectItem key={integration.id} value={integration.id}>
                      {integration.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase mb-2 block">Entity Type</label>
              <Select
                value={syncForm.entityType}
                onValueChange={(value) => setSyncForm({ ...syncForm, entityType: value })}
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Policy">Policy</SelectItem>
                  <SelectItem value="Claim">Claim</SelectItem>
                  <SelectItem value="Customer">Customer</SelectItem>
                  <SelectItem value="Financial">Financial Transaction</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase mb-2 block">Direction</label>
              <Select
                value={syncForm.direction}
                onValueChange={(value) => setSyncForm({ ...syncForm, direction: value as 'import' | 'export' | 'bidirectional' })}
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="import">Import (Legacy → NexusOS)</SelectItem>
                  <SelectItem value="export">Export (NexusOS → Legacy)</SelectItem>
                  <SelectItem value="bidirectional">Bidirectional Sync</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase mb-2 block">Batch Size</label>
              <Input
                type="number"
                className="bg-slate-800/50 border-slate-600 text-white"
                value={syncForm.batchSize}
                onChange={(e) => setSyncForm({ ...syncForm, batchSize: parseInt(e.target.value) || 100 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-slate-600 text-slate-300" onClick={() => setShowSyncDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={handleSync}
              disabled={loading || !syncForm.integrationId}
            >
              {loading ? 'Starting...' : 'Start Sync'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
