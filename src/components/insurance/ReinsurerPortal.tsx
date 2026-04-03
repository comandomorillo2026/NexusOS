'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Shield,
  Building2,
  DollarSign,
  FileText,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Eye,
  Globe,
  Users,
  BarChart3,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Settings,
  MessageSquare,
  Calculator,
  Briefcase,
  Activity,
} from 'lucide-react';

// ============================================================================
// MOCK DATA
// ============================================================================

const TREATIES = [
  {
    id: '1',
    treatyNumber: 'TXL-2024-001',
    treatyName: 'Quota Share Life Treaty',
    treatyType: 'QUOTA_SHARE',
    reinsurer: {
      name: 'Munich Re',
      rating: 'AA-',
      country: 'Germany',
    },
    effectiveDate: '2024-01-01',
    expiryDate: '2024-12-31',
    cedingPercentage: 40,
    retentionLimit: 5000000,
    cedingCommission: 32.5,
    premiumCeded: 1138916,
    claimsRecoverable: 356780,
    status: 'active',
    utilizationPercent: 72,
  },
  {
    id: '2',
    treatyNumber: 'XOL-2024-002',
    treatyName: 'Property XOL Program',
    treatyType: 'EXCESS_OF_LOSS',
    reinsurer: {
      name: 'Swiss Re',
      rating: 'AA',
      country: 'Switzerland',
    },
    effectiveDate: '2024-01-01',
    expiryDate: '2024-12-31',
    attachmentPoint: 1000000,
    limit: 10000000,
    premiumCeded: 245000,
    claimsRecoverable: 0,
    status: 'active',
    utilizationPercent: 0,
  },
  {
    id: '3',
    treatyNumber: 'FAC-2024-003',
    treatyName: 'Facultative Motor Treaty',
    treatyType: 'FACULTATIVE',
    reinsurer: {
      name: 'Hannover Re',
      rating: 'AA-',
      country: 'Germany',
    },
    effectiveDate: '2024-06-01',
    expiryDate: '2025-05-31',
    cedingPercentage: 50,
    premiumCeded: 156780,
    claimsRecoverable: 45000,
    status: 'active',
    utilizationPercent: 28,
  },
];

const REINSURERS = [
  {
    id: '1',
    name: 'Munich Re',
    shortName: 'MRe',
    country: 'Germany',
    rating: 'AA-',
    ratingAgency: 'S&P',
    totalPremium: 1138916,
    totalRecoveries: 356780,
    outstandingBalance: 89450,
    treaties: 2,
    relationshipSince: '2018',
    creditLimit: 5000000,
    creditUsed: 356780,
  },
  {
    id: '2',
    name: 'Swiss Re',
    shortName: 'SRe',
    country: 'Switzerland',
    rating: 'AA',
    ratingAgency: 'S&P',
    totalPremium: 245000,
    totalRecoveries: 0,
    outstandingBalance: 0,
    treaties: 1,
    relationshipSince: '2019',
    creditLimit: 8000000,
    creditUsed: 0,
  },
  {
    id: '3',
    name: 'Hannover Re',
    shortName: 'HRe',
    country: 'Germany',
    rating: 'AA-',
    ratingAgency: 'AM Best',
    totalPremium: 156780,
    totalRecoveries: 45000,
    outstandingBalance: 12000,
    treaties: 1,
    relationshipSince: '2020',
    creditLimit: 3000000,
    creditUsed: 45000,
  },
  {
    id: '4',
    name: 'SCOR',
    shortName: 'SCOR',
    country: 'France',
    rating: 'A+',
    ratingAgency: 'S&P',
    totalPremium: 89000,
    totalRecoveries: 23450,
    outstandingBalance: 5600,
    treaties: 1,
    relationshipSince: '2021',
    creditLimit: 2000000,
    creditUsed: 23450,
  },
];

const BORDEREAUX = [
  {
    period: '2024-Q3',
    treatyNumber: 'TXL-2024-001',
    treatyName: 'Quota Share Life Treaty',
    totalPremium: 284729,
    totalClaims: 89195,
    totalCommission: 92537,
    recordCount: 342,
    status: 'submitted',
    submittedAt: '2024-10-15',
    confirmedAt: null,
  },
  {
    period: '2024-Q3',
    treatyNumber: 'XOL-2024-002',
    treatyName: 'Property XOL Program',
    totalPremium: 61250,
    totalClaims: 0,
    totalCommission: 0,
    recordCount: 0,
    status: 'draft',
    submittedAt: null,
    confirmedAt: null,
  },
  {
    period: '2024-Q2',
    treatyNumber: 'TXL-2024-001',
    treatyName: 'Quota Share Life Treaty',
    totalPremium: 269845,
    totalClaims: 78450,
    totalCommission: 87700,
    recordCount: 318,
    status: 'confirmed',
    submittedAt: '2024-07-12',
    confirmedAt: '2024-07-18',
  },
];

const RECOVERIES = [
  {
    id: 'REC-2024-001',
    claimNumber: 'CLM-2024-000342',
    treatyNumber: 'TXL-2024-001',
    claimAmount: 125000,
    recoveryAmount: 50000,
    status: 'received',
    reportedDate: '2024-09-15',
    receivedDate: '2024-10-02',
  },
  {
    id: 'REC-2024-002',
    claimNumber: 'CLM-2024-000356',
    treatyNumber: 'TXL-2024-001',
    claimAmount: 89000,
    recoveryAmount: 35600,
    status: 'billed',
    reportedDate: '2024-10-01',
    receivedDate: null,
  },
  {
    id: 'REC-2024-003',
    claimNumber: 'CLM-2024-000361',
    treatyNumber: 'FAC-2024-003',
    claimAmount: 45000,
    recoveryAmount: 22500,
    status: 'pending',
    reportedDate: '2024-10-20',
    receivedDate: null,
  },
];

const ACTIVITY_LOG = [
  {
    date: '2024-10-22',
    type: 'bordereaux',
    description: 'Q3 2024 bordereaux submitted to Munich Re',
    user: 'System',
  },
  {
    date: '2024-10-20',
    type: 'recovery',
    description: 'Recovery TT$50,000 received for CLM-2024-000342',
    user: 'Maria Garcia',
  },
  {
    date: '2024-10-18',
    type: 'treaty',
    description: 'Treaty TXL-2024-001 renewal offer sent',
    user: 'Carlos Rodriguez',
  },
  {
    date: '2024-10-15',
    type: 'communication',
    description: 'Quarterly review call with Swiss Re',
    user: 'John Smith',
  },
];

// ============================================================================
// COMPONENTS
// ============================================================================

interface TreatyCardProps {
  treaty: typeof TREATIES[0];
}

function TreatyCard({ treaty }: TreatyCardProps) {
  const typeColors = {
    QUOTA_SHARE: 'bg-blue-500/20 text-blue-300',
    EXCESS_OF_LOSS: 'bg-purple-500/20 text-purple-300',
    FACULTATIVE: 'bg-amber-500/20 text-amber-300',
    SURPLUS: 'bg-emerald-500/20 text-emerald-300',
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white font-bold">{treaty.treatyNumber}</span>
              <Badge className={typeColors[treaty.treatyType as keyof typeof typeColors]}>
                {treaty.treatyType.replace(/_/g, ' ')}
              </Badge>
            </div>
            <p className="text-slate-400 text-sm">{treaty.treatyName}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${treaty.status === 'active' ? 'bg-emerald-400' : 'bg-slate-400'}`} />
            <span className="text-slate-400 capitalize">{treaty.status}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4 p-3 rounded-lg bg-slate-700/30">
          <Building2 className="w-8 h-8 text-blue-400" />
          <div>
            <p className="text-white font-medium">{treaty.reinsurer.name}</p>
            <p className="text-slate-400 text-sm">{treaty.reinsurer.country} • Rating: {treaty.reinsurer.rating}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-slate-500 text-xs uppercase mb-1">Premium Ceded</p>
            <p className="text-emerald-400 font-bold">TT${(treaty.premiumCeded / 1000).toFixed(0)}K</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs uppercase mb-1">Claims Recoverable</p>
            <p className="text-amber-400 font-bold">TT${(treaty.claimsRecoverable / 1000).toFixed(0)}K</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-400">Utilization</span>
            <span className="text-white">{treaty.utilizationPercent}%</span>
          </div>
          <Progress value={treaty.utilizationPercent} className="h-2" />
        </div>

        <div className="flex items-center justify-between text-sm text-slate-400">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{treaty.effectiveDate} → {treaty.expiryDate}</span>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white flex-1">
            <Eye className="w-4 h-4 mr-2" />View Details
          </Button>
          <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
            <FileText className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface ReinsurerCardProps {
  reinsurer: typeof REINSURERS[0];
}

function ReinsurerCard({ reinsurer }: ReinsurerCardProps) {
  const creditUtilization = (reinsurer.creditUsed / reinsurer.creditLimit) * 100;

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-white font-medium">{reinsurer.name}</p>
              <p className="text-slate-400 text-sm">{reinsurer.country}</p>
            </div>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-300">{reinsurer.rating}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="p-2 rounded bg-slate-700/30">
            <p className="text-slate-500 text-xs">Premium YTD</p>
            <p className="text-emerald-400 font-medium">TT${(reinsurer.totalPremium / 1000).toFixed(0)}K</p>
          </div>
          <div className="p-2 rounded bg-slate-700/30">
            <p className="text-slate-500 text-xs">Recoveries</p>
            <p className="text-blue-400 font-medium">TT${(reinsurer.totalRecoveries / 1000).toFixed(0)}K</p>
          </div>
        </div>

        <div className="mb-2">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-500">Credit Utilization</span>
            <span className="text-slate-400">{creditUtilization.toFixed(1)}%</span>
          </div>
          <Progress value={creditUtilization} className="h-1.5" />
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">{reinsurer.treaties} active treaties</span>
          <span className="text-slate-400">Since {reinsurer.relationshipSince}</span>
        </div>
      </CardContent>
    </Card>
  );
}

interface BordereauxRowProps {
  item: typeof BORDEREAUX[0];
}

function BordereauxRow({ item }: BordereauxRowProps) {
  const statusColors = {
    draft: 'bg-slate-500/20 text-slate-300',
    submitted: 'bg-blue-500/20 text-blue-300',
    confirmed: 'bg-emerald-500/20 text-emerald-300',
  };

  return (
    <div className="p-4 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="text-white font-medium">{item.period}</span>
          <Badge className={statusColors[item.status as keyof typeof statusColors]}>
            {item.status}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
            <Eye className="w-4 h-4 mr-1" />View
          </Button>
          <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
            <Download className="w-4 h-4 mr-1" />Export
          </Button>
        </div>
      </div>
      <p className="text-slate-400 text-sm mb-2">{item.treatyName} ({item.treatyNumber})</p>
      <div className="grid grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-slate-500 text-xs">Premium</p>
          <p className="text-emerald-400">TT${(item.totalPremium / 1000).toFixed(1)}K</p>
        </div>
        <div>
          <p className="text-slate-500 text-xs">Claims</p>
          <p className="text-amber-400">TT${(item.totalClaims / 1000).toFixed(1)}K</p>
        </div>
        <div>
          <p className="text-slate-500 text-xs">Commission</p>
          <p className="text-blue-400">TT${(item.totalCommission / 1000).toFixed(1)}K</p>
        </div>
        <div>
          <p className="text-slate-500 text-xs">Records</p>
          <p className="text-white">{item.recordCount}</p>
        </div>
      </div>
    </div>
  );
}

interface RecoveryRowProps {
  recovery: typeof RECOVERIES[0];
}

function RecoveryRow({ recovery }: RecoveryRowProps) {
  const statusColors = {
    received: 'bg-emerald-500/20 text-emerald-300',
    billed: 'bg-blue-500/20 text-blue-300',
    pending: 'bg-amber-500/20 text-amber-300',
  };

  return (
    <div className="p-4 rounded-lg bg-slate-700/30">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="text-white font-medium">{recovery.id}</span>
          <Badge className={statusColors[recovery.status as keyof typeof statusColors]}>
            {recovery.status}
          </Badge>
        </div>
        <span className="text-slate-400 text-sm">{recovery.reportedDate}</span>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">Claim: {recovery.claimNumber}</p>
          <p className="text-slate-500 text-xs">Treaty: {recovery.treatyNumber}</p>
        </div>
        <div className="text-right">
          <p className="text-emerald-400 font-bold">TT${recovery.recoveryAmount.toLocaleString()}</p>
          <p className="text-slate-500 text-xs">of TT${recovery.claimAmount.toLocaleString()} claim</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ReinsurerPortal() {
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  const totalPremiumCeded = TREATIES.reduce((sum, t) => sum + t.premiumCeded, 0);
  const totalRecoveries = TREATIES.reduce((sum, t) => sum + t.claimsRecoverable, 0);
  const activeTreaties = TREATIES.filter(t => t.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-400" />
            Reinsurance Management Portal
          </h2>
          <p className="text-slate-400">Treaty administration, bordereaux, and recovery tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-slate-600 text-slate-300">
            <Bell className="w-4 h-4 mr-2" />Notifications
          </Button>
          <Button variant="outline" className="border-slate-600 text-slate-300">
            <Settings className="w-4 h-4 mr-2" />Settings
          </Button>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white">
            <FileText className="w-4 h-4 mr-2" />New Treaty
          </Button>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Premium Ceded YTD</p>
                <p className="text-xl font-bold text-white">TT${(totalPremiumCeded / 1000000).toFixed(2)}M</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Recoveries YTD</p>
                <p className="text-xl font-bold text-white">TT${(totalRecoveries / 1000).toFixed(0)}K</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Active Treaties</p>
                <p className="text-xl font-bold text-white">{activeTreaties}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Reinsurer Partners</p>
                <p className="text-xl font-bold text-white">{REINSURERS.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="treaties" className="space-y-6">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="treaties" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <Shield className="w-4 h-4 mr-2" />Treaties
          </TabsTrigger>
          <TabsTrigger value="reinsurers" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <Building2 className="w-4 h-4 mr-2" />Reinsurers
          </TabsTrigger>
          <TabsTrigger value="bordereaux" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <FileText className="w-4 h-4 mr-2" />Bordereaux
          </TabsTrigger>
          <TabsTrigger value="recoveries" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <DollarSign className="w-4 h-4 mr-2" />Recoveries
          </TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <Activity className="w-4 h-4 mr-2" />Activity
          </TabsTrigger>
          <TabsTrigger value="communications" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <MessageSquare className="w-4 h-4 mr-2" />Communications
          </TabsTrigger>
        </TabsList>

        {/* Treaties Tab */}
        <TabsContent value="treaties">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {TREATIES.map((treaty) => (
              <TreatyCard key={treaty.id} treaty={treaty} />
            ))}
          </div>
        </TabsContent>

        {/* Reinsurers Tab */}
        <TabsContent value="reinsurers">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {REINSURERS.map((reinsurer) => (
              <ReinsurerCard key={reinsurer.id} reinsurer={reinsurer} />
            ))}
          </div>
        </TabsContent>

        {/* Bordereaux Tab */}
        <TabsContent value="bordereaux">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Bordereaux Reports</CardTitle>
                <div className="flex items-center gap-3">
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Periods</SelectItem>
                      <SelectItem value="2024-Q3">2024 Q3</SelectItem>
                      <SelectItem value="2024-Q2">2024 Q2</SelectItem>
                      <SelectItem value="2024-Q1">2024 Q1</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                    <Download className="w-4 h-4 mr-2" />Generate Report
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {BORDEREAUX.map((item, i) => (
                  <BordereauxRow key={i} item={item} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recoveries Tab */}
        <TabsContent value="recoveries">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Recovery Tracking</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {RECOVERIES.map((recovery, i) => (
                      <RecoveryRow key={i} recovery={recovery} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Recovery Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-emerald-400 text-sm">Received This Month</p>
                    <p className="text-2xl font-bold text-white">TT$50,000</p>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <p className="text-blue-400 text-sm">Billed (Awaiting Payment)</p>
                    <p className="text-2xl font-bold text-white">TT$35,600</p>
                  </div>
                  <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <p className="text-amber-400 text-sm">Pending Processing</p>
                    <p className="text-2xl font-bold text-white">TT$22,500</p>
                  </div>
                  <div className="pt-4 border-t border-slate-700">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Recovery Rate</span>
                      <span className="text-emerald-400">92.4%</span>
                    </div>
                    <Progress value={92.4} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {ACTIVITY_LOG.map((activity, i) => (
                  <div key={i} className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-700/30 transition-colors">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      activity.type === 'bordereaux' ? 'bg-blue-500/10' :
                      activity.type === 'recovery' ? 'bg-emerald-500/10' :
                      activity.type === 'treaty' ? 'bg-purple-500/10' :
                      'bg-amber-500/10'
                    }`}>
                      {activity.type === 'bordereaux' ? <FileText className="w-5 h-5 text-blue-400" /> :
                       activity.type === 'recovery' ? <DollarSign className="w-5 h-5 text-emerald-400" /> :
                       activity.type === 'treaty' ? <Shield className="w-5 h-5 text-purple-400" /> :
                       <MessageSquare className="w-5 h-5 text-amber-400" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-white">{activity.description}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-slate-500 text-sm">{activity.date}</span>
                        <span className="text-slate-600 text-sm">•</span>
                        <span className="text-slate-400 text-sm">{activity.user}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communications Tab */}
        <TabsContent value="communications">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Send Communication</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-slate-400 text-sm block mb-2">To Reinsurer</label>
                    <Select>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Select reinsurer" />
                      </SelectTrigger>
                      <SelectContent>
                        {REINSURERS.map((r) => (
                          <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-slate-400 text-sm block mb-2">Subject</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder:text-slate-500"
                      placeholder="Enter subject..."
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-sm block mb-2">Message</label>
                    <textarea 
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder:text-slate-500 h-32"
                      placeholder="Enter message..."
                    />
                  </div>
                  <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                    <MessageSquare className="w-4 h-4 mr-2" />Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Communications</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {[
                    { reinsurer: 'Munich Re', subject: 'Q3 Bordereaux Submission', date: '2024-10-22', status: 'sent' },
                    { reinsurer: 'Swiss Re', subject: 'Treaty Renewal Discussion', date: '2024-10-18', status: 'sent' },
                    { reinsurer: 'Hannover Re', subject: 'Recovery Request', date: '2024-10-15', status: 'replied' },
                  ].map((comm, i) => (
                    <div key={i} className="p-3 rounded-lg bg-slate-700/30">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-medium">{comm.subject}</span>
                        <Badge className={comm.status === 'replied' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'}>
                          {comm.status}
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-sm">To: {comm.reinsurer}</p>
                      <p className="text-slate-500 text-xs">{comm.date}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
