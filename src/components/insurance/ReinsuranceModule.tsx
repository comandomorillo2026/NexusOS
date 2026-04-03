'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Shield,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Globe,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building2,
  FileText,
  RefreshCw,
  Plus,
  Eye,
  Calculator,
  Send,
  X,
  AlertCircle,
  Info,
  Loader2,
} from 'lucide-react';

// Types
interface Treaty {
  id: string;
  treatyNumber: string;
  treatyName: string;
  treatyType: 'QUOTA_SHARE' | 'SURPLUS' | 'EXCESS_OF_LOSS' | 'FACULTATIVE';
  reinsurerName: string;
  reinsurerRating?: string;
  lineOfBusiness: string;
  effectiveDate: string;
  expiryDate: string;
  cedingPercentage?: number;
  retentionLimit?: number;
  cedingCommission?: number;
  attachmentPoint?: number;
  limit?: number;
  premiumRate?: number;
  annualAggregateLimit?: number;
  status: string;
  treatyMappings?: { productCode: string; productName: string }[];
  _count?: { claimRecoveries: number; bordereaux: number };
}

interface Recovery {
  id: string;
  recoveryNumber: string;
  recoveryType: string;
  recoveryAmount: number;
  reportedDate: string;
  receivedDate?: string;
  dueDate?: string;
  status: string;
  amountReceived: number;
  amountOutstanding: number;
  InsReinsuranceTreaty?: {
    treatyNumber: string;
    treatyName: string;
    reinsurerName: string;
  };
}

interface Statistics {
  totalTreaties: number;
  activeTreaties: number;
  totalPremiumCeded: number;
  totalRecoveries: number;
  uniqueReinsurers: number;
  byType: Record<string, number>;
  byLineOfBusiness: Record<string, number>;
}

interface CedingPreview {
  cessionAmount: number;
  retentionAmount: number;
  commissionAmount: number;
  formula: string;
}

// Treaty Type Labels
const TREATY_TYPE_LABELS: Record<string, string> = {
  QUOTA_SHARE: 'Quota Share',
  SURPLUS: 'Surplus',
  EXCESS_OF_LOSS: 'Excess of Loss',
  FACULTATIVE: 'Facultative',
};

const LINE_OF_BUSINESS_LABELS: Record<string, string> = {
  ALL: 'All Lines',
  LIFE: 'Life',
  HEALTH: 'Health',
  'P&C': 'Property & Casualty',
  MOTOR: 'Motor',
  PROPERTY: 'Property',
  MARINE: 'Marine',
};

export default function ReinsuranceModule() {
  const [activeTab, setActiveTab] = useState('treaties');
  const [treaties, setTreaties] = useState<Treaty[]>([]);
  const [recoveries, setRecoveries] = useState<Recovery[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [newTreatyDialog, setNewTreatyDialog] = useState(false);
  const [cedingCalcDialog, setCedingCalcDialog] = useState(false);
  const [selectedTreaty, setSelectedTreaty] = useState<Treaty | null>(null);
  const [viewTreatyDialog, setViewTreatyDialog] = useState(false);

  // Form states
  const [treatyForm, setTreatyForm] = useState({
    treatyNumber: '',
    treatyName: '',
    treatyType: 'QUOTA_SHARE' as 'QUOTA_SHARE' | 'SURPLUS' | 'EXCESS_OF_LOSS' | 'FACULTATIVE',
    reinsurerName: '',
    reinsurerRating: '',
    effectiveDate: '',
    expiryDate: '',
    lineOfBusiness: 'ALL',
    cedingPercentage: 40,
    retentionLimit: 0,
    cedingCommission: 35,
    attachmentPoint: 0,
    limit: 0,
  });

  // Ceding calculator states
  const [cedingForm, setCedingForm] = useState({
    claimAmount: 0,
    sumInsured: 0,
    treatyType: 'QUOTA_SHARE' as 'QUOTA_SHARE' | 'SURPLUS' | 'EXCESS_OF_LOSS' | 'FACULTATIVE',
    cedingPercentage: 40,
    retentionLimit: 500000,
    attachmentPoint: 2000000,
    limit: 10000000,
    cedingCommission: 35,
  });
  const [cedingPreview, setCedingPreview] = useState<CedingPreview | null>(null);
  const [calculating, setCalculating] = useState(false);

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [treatiesRes, recoveriesRes] = await Promise.all([
        fetch('/api/insurance/reinsurance/treaties'),
        fetch('/api/insurance/reinsurance/recoveries?includeSummary=true'),
      ]);

      if (treatiesRes.ok) {
        const treatiesData = await treatiesRes.json();
        setTreaties(treatiesData.data || []);
        
        // Calculate statistics
        const activeTreaties = (treatiesData.data || []).filter((t: Treaty) => t.status === 'active');
        const uniqueReinsurers = new Set((treatiesData.data || []).map((t: Treaty) => t.reinsurerName));
        
        const byType: Record<string, number> = {};
        const byLineOfBusiness: Record<string, number> = {};
        (treatiesData.data || []).forEach((t: Treaty) => {
          byType[t.treatyType] = (byType[t.treatyType] || 0) + 1;
          byLineOfBusiness[t.lineOfBusiness] = (byLineOfBusiness[t.lineOfBusiness] || 0) + 1;
        });

        setStatistics({
          totalTreaties: treatiesData.data?.length || 0,
          activeTreaties: activeTreaties.length,
          totalPremiumCeded: 0,
          totalRecoveries: 0,
          uniqueReinsurers: uniqueReinsurers.size,
          byType,
          byLineOfBusiness,
        });
      }

      if (recoveriesRes.ok) {
        const recoveriesData = await recoveriesRes.json();
        setRecoveries(recoveriesData.data || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load reinsurance data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate ceding preview
  const calculateCedingPreview = async () => {
    setCalculating(true);
    try {
      const response = await fetch('/api/insurance/reinsurance/calculate-ceding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'preview',
          ...cedingForm,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCedingPreview(data.data);
      }
    } catch (err) {
      console.error('Error calculating ceding:', err);
    } finally {
      setCalculating(false);
    }
  };

  // Create treaty
  const createTreaty = async () => {
    try {
      const response = await fetch('/api/insurance/reinsurance/treaties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(treatyForm),
      });

      if (response.ok) {
        setNewTreatyDialog(false);
        fetchData();
        // Reset form
        setTreatyForm({
          treatyNumber: '',
          treatyName: '',
          treatyType: 'QUOTA_SHARE',
          reinsurerName: '',
          reinsurerRating: '',
          effectiveDate: '',
          expiryDate: '',
          lineOfBusiness: 'ALL',
          cedingPercentage: 40,
          retentionLimit: 0,
          cedingCommission: 35,
          attachmentPoint: 0,
          limit: 0,
        });
      }
    } catch (err) {
      console.error('Error creating treaty:', err);
    }
  };

  // Generate bordereaux
  const generateBordereaux = async (treatyId: string) => {
    const today = new Date();
    const period = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    try {
      const response = await fetch('/api/insurance/reinsurance/bordereaux', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          treatyId,
          reportingPeriod: period,
          reportType: 'PREMIUM',
        }),
      });

      if (response.ok) {
        alert('Bordereaux generated successfully!');
      }
    } catch (err) {
      console.error('Error generating bordereaux:', err);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TT', {
      style: 'currency',
      currency: 'TTD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-TT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      active: 'bg-emerald-500/20 text-emerald-300',
      draft: 'bg-slate-500/20 text-slate-300',
      expired: 'bg-orange-500/20 text-orange-300',
      cancelled: 'bg-red-500/20 text-red-300',
      pending: 'bg-orange-500/20 text-orange-300',
      received: 'bg-emerald-500/20 text-emerald-300',
      billed: 'bg-blue-500/20 text-blue-300',
      partial: 'bg-yellow-500/20 text-yellow-300',
    };

    return (
      <Badge className={statusColors[status] || 'bg-slate-500/20 text-slate-300'}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400">{error}</p>
          <Button onClick={fetchData} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-indigo-500/5 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-indigo-400" />
              <div>
                <p className="text-2xl font-bold text-white">{statistics?.activeTreaties || 0}</p>
                <p className="text-xs text-indigo-300/60">Active Treaties</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-cyan-500/5 border-cyan-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingDown className="w-8 h-8 text-cyan-400" />
              <div>
                <p className="text-2xl font-bold text-white">TT$2.02M</p>
                <p className="text-xs text-cyan-300/60">Premium Ceded YTD</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-emerald-400" />
              <div>
                <p className="text-2xl font-bold text-white">TT$560K</p>
                <p className="text-xs text-emerald-300/60">Recoveries YTD</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Globe className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-white">{statistics?.uniqueReinsurers || 0}</p>
                <p className="text-xs text-purple-300/60">Reinsurers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-orange-500/5 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-orange-400" />
              <div>
                <p className="text-2xl font-bold text-white">{recoveries.filter(r => r.status === 'pending').length}</p>
                <p className="text-xs text-orange-300/60">Pending Recoveries</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="treaties" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white">
            Treaties
          </TabsTrigger>
          <TabsTrigger value="recoveries" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white">
            Recoveries
          </TabsTrigger>
          <TabsTrigger value="calculator" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white">
            Calculator
          </TabsTrigger>
          <TabsTrigger value="bordereaux" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white">
            Bordereaux
          </TabsTrigger>
        </TabsList>

        {/* Treaties Tab */}
        <TabsContent value="treaties">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="border-b border-slate-700">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-400" />
                  Treaty Management
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={fetchData}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                  </Button>
                  <Dialog open={newTreatyDialog} onOpenChange={setNewTreatyDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-indigo-500 hover:bg-indigo-600 text-white">
                        <Plus className="w-4 h-4 mr-2" />New Treaty
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-white">Create New Treaty</DialogTitle>
                        <DialogDescription className="text-slate-400">
                          Configure a new reinsurance treaty
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                          <Label className="text-slate-300">Treaty Number</Label>
                          <Input
                            value={treatyForm.treatyNumber}
                            onChange={(e) => setTreatyForm({ ...treatyForm, treatyNumber: e.target.value })}
                            placeholder="QS-2024-001"
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-300">Treaty Name</Label>
                          <Input
                            value={treatyForm.treatyName}
                            onChange={(e) => setTreatyForm({ ...treatyForm, treatyName: e.target.value })}
                            placeholder="Quota Share Life Treaty"
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-300">Treaty Type</Label>
                          <Select value={treatyForm.treatyType} onValueChange={(value: 'QUOTA_SHARE' | 'SURPLUS' | 'EXCESS_OF_LOSS' | 'FACULTATIVE') => setTreatyForm({ ...treatyForm, treatyType: value })}>
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-700 border-slate-600">
                              <SelectItem value="QUOTA_SHARE">Quota Share</SelectItem>
                              <SelectItem value="SURPLUS">Surplus</SelectItem>
                              <SelectItem value="EXCESS_OF_LOSS">Excess of Loss</SelectItem>
                              <SelectItem value="FACULTATIVE">Facultative</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-300">Line of Business</Label>
                          <Select value={treatyForm.lineOfBusiness} onValueChange={(value) => setTreatyForm({ ...treatyForm, lineOfBusiness: value })}>
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-700 border-slate-600">
                              <SelectItem value="ALL">All Lines</SelectItem>
                              <SelectItem value="LIFE">Life</SelectItem>
                              <SelectItem value="HEALTH">Health</SelectItem>
                              <SelectItem value="P&C">Property & Casualty</SelectItem>
                              <SelectItem value="MOTOR">Motor</SelectItem>
                              <SelectItem value="PROPERTY">Property</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-300">Reinsurer Name</Label>
                          <Input
                            value={treatyForm.reinsurerName}
                            onChange={(e) => setTreatyForm({ ...treatyForm, reinsurerName: e.target.value })}
                            placeholder="Munich Re"
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-300">Reinsurer Rating</Label>
                          <Input
                            value={treatyForm.reinsurerRating}
                            onChange={(e) => setTreatyForm({ ...treatyForm, reinsurerRating: e.target.value })}
                            placeholder="AA-"
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-300">Effective Date</Label>
                          <Input
                            type="date"
                            value={treatyForm.effectiveDate}
                            onChange={(e) => setTreatyForm({ ...treatyForm, effectiveDate: e.target.value })}
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-300">Expiry Date</Label>
                          <Input
                            type="date"
                            value={treatyForm.expiryDate}
                            onChange={(e) => setTreatyForm({ ...treatyForm, expiryDate: e.target.value })}
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        
                        {(treatyForm.treatyType === 'QUOTA_SHARE' || treatyForm.treatyType === 'FACULTATIVE') && (
                          <>
                            <div className="space-y-2">
                              <Label className="text-slate-300">Ceding Percentage (%)</Label>
                              <Input
                                type="number"
                                value={treatyForm.cedingPercentage}
                                onChange={(e) => setTreatyForm({ ...treatyForm, cedingPercentage: parseFloat(e.target.value) })}
                                className="bg-slate-700 border-slate-600 text-white"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-slate-300">Ceding Commission (%)</Label>
                              <Input
                                type="number"
                                value={treatyForm.cedingCommission}
                                onChange={(e) => setTreatyForm({ ...treatyForm, cedingCommission: parseFloat(e.target.value) })}
                                className="bg-slate-700 border-slate-600 text-white"
                              />
                            </div>
                          </>
                        )}
                        
                        {treatyForm.treatyType === 'SURPLUS' && (
                          <div className="space-y-2">
                            <Label className="text-slate-300">Retention Limit (TT$)</Label>
                            <Input
                              type="number"
                              value={treatyForm.retentionLimit}
                              onChange={(e) => setTreatyForm({ ...treatyForm, retentionLimit: parseFloat(e.target.value) })}
                              className="bg-slate-700 border-slate-600 text-white"
                            />
                          </div>
                        )}
                        
                        {treatyForm.treatyType === 'EXCESS_OF_LOSS' && (
                          <>
                            <div className="space-y-2">
                              <Label className="text-slate-300">Attachment Point (TT$)</Label>
                              <Input
                                type="number"
                                value={treatyForm.attachmentPoint}
                                onChange={(e) => setTreatyForm({ ...treatyForm, attachmentPoint: parseFloat(e.target.value) })}
                                className="bg-slate-700 border-slate-600 text-white"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-slate-300">Limit (TT$)</Label>
                              <Input
                                type="number"
                                value={treatyForm.limit}
                                onChange={(e) => setTreatyForm({ ...treatyForm, limit: parseFloat(e.target.value) })}
                                className="bg-slate-700 border-slate-600 text-white"
                              />
                            </div>
                          </>
                        )}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setNewTreatyDialog(false)} className="border-slate-600 text-slate-300">
                          Cancel
                        </Button>
                        <Button onClick={createTreaty} className="bg-indigo-500 hover:bg-indigo-600">
                          Create Treaty
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {treaties.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400">No treaties found. Create your first treaty to get started.</p>
                  </div>
                ) : (
                  treaties.map((treaty) => (
                    <div key={treaty.id} className="p-4 rounded-lg bg-slate-700/30 border border-slate-600/50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-indigo-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{treaty.treatyName}</p>
                            <p className="text-slate-400 text-sm">{treaty.treatyNumber} | {TREATY_TYPE_LABELS[treaty.treatyType]}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(treaty.status)}
                          <Button variant="ghost" size="sm" onClick={() => { setSelectedTreaty(treaty); setViewTreatyDialog(true); }}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400 text-xs">Reinsurer</p>
                          <p className="text-white">{treaty.reinsurerName} {treaty.reinsurerRating && `(${treaty.reinsurerRating})`}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs">Line of Business</p>
                          <p className="text-white">{LINE_OF_BUSINESS_LABELS[treaty.lineOfBusiness] || treaty.lineOfBusiness}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs">Period</p>
                          <p className="text-white">{formatDate(treaty.effectiveDate)} - {formatDate(treaty.expiryDate)}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs">Recoveries</p>
                          <p className="text-emerald-400">{treaty._count?.claimRecoveries || 0} records</p>
                        </div>
                      </div>
                      {treaty.treatyType === 'QUOTA_SHARE' && treaty.cedingPercentage && (
                        <div className="mt-3 pt-3 border-t border-slate-600/50">
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-slate-400">Ceding: <span className="text-white">{treaty.cedingPercentage}%</span></span>
                            {treaty.retentionLimit && <span className="text-slate-400">Retention: <span className="text-white">{formatCurrency(treaty.retentionLimit)}</span></span>}
                            {treaty.cedingCommission && <span className="text-slate-400">Commission: <span className="text-white">{treaty.cedingCommission}%</span></span>}
                          </div>
                        </div>
                      )}
                      {treaty.treatyType === 'EXCESS_OF_LOSS' && treaty.attachmentPoint && (
                        <div className="mt-3 pt-3 border-t border-slate-600/50">
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-slate-400">Attachment: <span className="text-white">{formatCurrency(treaty.attachmentPoint)}</span></span>
                            <span className="text-slate-400">Limit: <span className="text-white">{formatCurrency(treaty.limit || 0)}</span></span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recoveries Tab */}
        <TabsContent value="recoveries">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Reinsurance Recoveries
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {recoveries.length === 0 ? (
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400">No recoveries found.</p>
                  </div>
                ) : (
                  recoveries.map((recovery) => (
                    <div key={recovery.id} className="p-4 rounded-lg bg-slate-700/30 border border-slate-600/50 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${recovery.status === 'received' ? 'bg-emerald-500/10' : recovery.status === 'billed' ? 'bg-blue-500/10' : 'bg-orange-500/10'}`}>
                          {recovery.status === 'received' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : recovery.status === 'billed' ? <Send className="w-5 h-5 text-blue-400" /> : <Clock className="w-5 h-5 text-orange-400" />}
                        </div>
                        <div>
                          <p className="text-white font-medium">{recovery.recoveryNumber}</p>
                          <p className="text-slate-400 text-sm">{recovery.InsReinsuranceTreaty?.treatyName || 'Unknown Treaty'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-emerald-400 font-mono text-lg">{formatCurrency(recovery.recoveryAmount)}</p>
                          <p className="text-slate-400 text-sm">{recovery.status === 'received' ? `Received ${recovery.receivedDate ? formatDate(recovery.receivedDate) : ''}` : recovery.status === 'billed' ? 'Billed' : 'Pending'}</p>
                        </div>
                        {getStatusBadge(recovery.status)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calculator Tab */}
        <TabsContent value="calculator">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calculator className="w-5 h-5 text-cyan-400" />
                Ceding Calculator
              </CardTitle>
              <CardDescription className="text-slate-400">
                Calculate cession amounts for different treaty types
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Form */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Claim Amount (TT$)</Label>
                      <Input
                        type="number"
                        value={cedingForm.claimAmount}
                        onChange={(e) => setCedingForm({ ...cedingForm, claimAmount: parseFloat(e.target.value) || 0 })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Sum Insured (TT$)</Label>
                      <Input
                        type="number"
                        value={cedingForm.sumInsured}
                        onChange={(e) => setCedingForm({ ...cedingForm, sumInsured: parseFloat(e.target.value) || 0 })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">Treaty Type</Label>
                    <Select value={cedingForm.treatyType} onValueChange={(value: 'QUOTA_SHARE' | 'SURPLUS' | 'EXCESS_OF_LOSS' | 'FACULTATIVE') => setCedingForm({ ...cedingForm, treatyType: value })}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="QUOTA_SHARE">Quota Share</SelectItem>
                        <SelectItem value="SURPLUS">Surplus</SelectItem>
                        <SelectItem value="EXCESS_OF_LOSS">Excess of Loss</SelectItem>
                        <SelectItem value="FACULTATIVE">Facultative</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(cedingForm.treatyType === 'QUOTA_SHARE' || cedingForm.treatyType === 'FACULTATIVE') && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-slate-300">Ceding Percentage (%)</Label>
                        <Input
                          type="number"
                          value={cedingForm.cedingPercentage}
                          onChange={(e) => setCedingForm({ ...cedingForm, cedingPercentage: parseFloat(e.target.value) || 0 })}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300">Commission (%)</Label>
                        <Input
                          type="number"
                          value={cedingForm.cedingCommission}
                          onChange={(e) => setCedingForm({ ...cedingForm, cedingCommission: parseFloat(e.target.value) || 0 })}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                    </div>
                  )}

                  {cedingForm.treatyType === 'SURPLUS' && (
                    <div className="space-y-2">
                      <Label className="text-slate-300">Retention Limit (TT$)</Label>
                      <Input
                        type="number"
                        value={cedingForm.retentionLimit}
                        onChange={(e) => setCedingForm({ ...cedingForm, retentionLimit: parseFloat(e.target.value) || 0 })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  )}

                  {cedingForm.treatyType === 'EXCESS_OF_LOSS' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-slate-300">Attachment Point (TT$)</Label>
                        <Input
                          type="number"
                          value={cedingForm.attachmentPoint}
                          onChange={(e) => setCedingForm({ ...cedingForm, attachmentPoint: parseFloat(e.target.value) || 0 })}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300">Limit (TT$)</Label>
                        <Input
                          type="number"
                          value={cedingForm.limit}
                          onChange={(e) => setCedingForm({ ...cedingForm, limit: parseFloat(e.target.value) || 0 })}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                    </div>
                  )}

                  <Button onClick={calculateCedingPreview} disabled={calculating} className="w-full bg-cyan-500 hover:bg-cyan-600">
                    {calculating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Calculator className="w-4 h-4 mr-2" />}
                    Calculate Cession
                  </Button>
                </div>

                {/* Results */}
                <div className="bg-slate-700/30 rounded-lg p-6 border border-slate-600/50">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <Info className="w-4 h-4 text-cyan-400" />
                    Calculation Results
                  </h3>
                  
                  {cedingPreview ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-800/50 rounded-lg p-4">
                          <p className="text-slate-400 text-sm">Cession Amount</p>
                          <p className="text-2xl font-bold text-cyan-400">{formatCurrency(cedingPreview.cessionAmount)}</p>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-4">
                          <p className="text-slate-400 text-sm">Retention Amount</p>
                          <p className="text-2xl font-bold text-white">{formatCurrency(cedingPreview.retentionAmount)}</p>
                        </div>
                      </div>
                      
                      <div className="bg-slate-800/50 rounded-lg p-4">
                        <p className="text-slate-400 text-sm">Commission Amount</p>
                        <p className="text-xl font-bold text-emerald-400">{formatCurrency(cedingPreview.commissionAmount)}</p>
                      </div>

                      <div className="bg-indigo-500/10 rounded-lg p-4 border border-indigo-500/20">
                        <p className="text-slate-400 text-sm mb-2">Formula</p>
                        <p className="text-white text-sm font-mono">{cedingPreview.formula}</p>
                      </div>

                      <div className="pt-4 border-t border-slate-600">
                        <Progress 
                          value={(cedingPreview.cessionAmount / (cedingForm.claimAmount || 1)) * 100} 
                          className="h-3"
                        />
                        <div className="flex justify-between mt-2 text-xs text-slate-400">
                          <span>Ceded: {((cedingPreview.cessionAmount / (cedingForm.claimAmount || 1)) * 100).toFixed(1)}%</span>
                          <span>Retained: {((cedingPreview.retentionAmount / (cedingForm.claimAmount || 1)) * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Enter values and click Calculate to see results</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bordereaux Tab */}
        <TabsContent value="bordereaux">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                Bordereaux Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400">Generate monthly bordereaux reports for reinsurers</p>
                <div className="mt-6 space-y-3 max-w-md mx-auto">
                  {treaties.filter(t => t.status === 'active').slice(0, 3).map((treaty) => (
                    <div key={treaty.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div className="text-left">
                        <p className="text-white text-sm font-medium">{treaty.treatyNumber}</p>
                        <p className="text-slate-400 text-xs">{treaty.treatyName}</p>
                      </div>
                      <Button size="sm" onClick={() => generateBordereaux(treaty.id)} className="bg-blue-500 hover:bg-blue-600">
                        <FileText className="w-4 h-4 mr-2" /> Generate
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Treaty Dialog */}
      <Dialog open={viewTreatyDialog} onOpenChange={setViewTreatyDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">{selectedTreaty?.treatyName}</DialogTitle>
            <DialogDescription className="text-slate-400">
              {selectedTreaty?.treatyNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedTreaty && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Treaty Type</p>
                  <p className="text-white">{TREATY_TYPE_LABELS[selectedTreaty.treatyType]}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Status</p>
                  {getStatusBadge(selectedTreaty.status)}
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Reinsurer</p>
                  <p className="text-white">{selectedTreaty.reinsurerName} {selectedTreaty.reinsurerRating && `(${selectedTreaty.reinsurerRating})`}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Line of Business</p>
                  <p className="text-white">{LINE_OF_BUSINESS_LABELS[selectedTreaty.lineOfBusiness] || selectedTreaty.lineOfBusiness}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Effective Date</p>
                  <p className="text-white">{formatDate(selectedTreaty.effectiveDate)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Expiry Date</p>
                  <p className="text-white">{formatDate(selectedTreaty.expiryDate)}</p>
                </div>
              </div>
              
              {selectedTreaty.cedingPercentage && (
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <p className="text-slate-400 text-sm mb-2">Ceding Terms</p>
                  <div className="flex gap-6 text-sm">
                    <span className="text-slate-300">Ceding: <span className="text-white font-medium">{selectedTreaty.cedingPercentage}%</span></span>
                    {selectedTreaty.cedingCommission && <span className="text-slate-300">Commission: <span className="text-white font-medium">{selectedTreaty.cedingCommission}%</span></span>}
                    {selectedTreaty.retentionLimit && <span className="text-slate-300">Retention: <span className="text-white font-medium">{formatCurrency(selectedTreaty.retentionLimit)}</span></span>}
                  </div>
                </div>
              )}

              {selectedTreaty.attachmentPoint && (
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <p className="text-slate-400 text-sm mb-2">XOL Terms</p>
                  <div className="flex gap-6 text-sm">
                    <span className="text-slate-300">Attachment: <span className="text-white font-medium">{formatCurrency(selectedTreaty.attachmentPoint)}</span></span>
                    <span className="text-slate-300">Limit: <span className="text-white font-medium">{formatCurrency(selectedTreaty.limit || 0)}</span></span>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewTreatyDialog(false)} className="border-slate-600 text-slate-300">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
