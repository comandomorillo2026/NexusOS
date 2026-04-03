'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Scale,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
  Building2,
  Download,
  Upload,
  Plus,
  Globe,
  ChevronDown,
  Search,
  Filter,
  Bell,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Shield,
  Users,
  PieChart,
  FileSpreadsheet,
  PenTool,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Send,
  RefreshCw,
  X,
  Check,
  Info,
  DollarSign,
  Percent,
  BarChart3,
  Activity,
} from 'lucide-react';
import { ALL_JURISDICTIONS, REGIONS, JurisdictionConfig, FilingRequirement, getNextDueDate, getDaysUntilDue } from '@/lib/insurance/jurisdictions';

// Types
interface Filing {
  id: string;
  type: string;
  name: string;
  jurisdiction: string;
  jurisdictionName: string;
  regulator: string;
  dueDate: Date;
  daysUntilDue: number;
  status: 'submitted' | 'draft' | 'pending' | 'approved' | 'overdue';
  submittedAt?: Date;
  dataFormat: string;
  penalty?: number;
  penaltyCurrency?: string;
}

interface ComplianceMetric {
  id: string;
  code: string;
  name: string;
  requirement: string;
  jurisdiction: string;
  status: 'compliant' | 'warning' | 'non_compliant';
  current?: string;
  required?: string;
  progress?: number;
}

interface Alert {
  id: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  jurisdiction: string;
  createdAt: Date;
  acknowledged: boolean;
}

// Mock data generators
const generateMockFilings = (jurisdictions: JurisdictionConfig[]): Filing[] => {
  const filings: Filing[] = [];
  const now = new Date();
  
  jurisdictions.slice(0, 10).forEach((j, idx) => {
    j.filingRequirements.forEach((f, fIdx) => {
      const dueDate = getNextDueDate(f);
      const daysUntilDue = getDaysUntilDue(f);
      
      filings.push({
        id: `FIL-${idx}-${fIdx}`,
        type: f.type,
        name: f.name,
        jurisdiction: j.code,
        jurisdictionName: j.name,
        regulator: j.regulator.shortName,
        dueDate,
        daysUntilDue,
        status: daysUntilDue < 0 ? 'overdue' : daysUntilDue < 30 ? 'pending' : Math.random() > 0.5 ? 'draft' : 'submitted',
        submittedAt: Math.random() > 0.5 ? new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000) : undefined,
        dataFormat: f.dataFormat,
        penalty: f.penaltyAmount,
        penaltyCurrency: f.penaltyCurrency,
      });
    });
  });
  
  return filings.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
};

const generateMockComplianceMetrics = (jurisdictions: JurisdictionConfig[]): ComplianceMetric[] => {
  const metrics: ComplianceMetric[] = [];
  
  jurisdictions.slice(0, 5).forEach(j => {
    metrics.push({
      id: `CAP-${j.code}`,
      code: 'CAP-RATIO-001',
      name: 'Capital Adequacy Ratio',
      requirement: `Minimum ${j.capitalRequirements.solvencyMarginPercent}% solvency margin`,
      jurisdiction: j.code,
      status: Math.random() > 0.8 ? 'warning' : 'compliant',
      current: `${(j.capitalRequirements.solvencyMarginPercent + Math.random() * 50).toFixed(0)}%`,
      required: `≥${j.capitalRequirements.solvencyMarginPercent}%`,
      progress: 75 + Math.random() * 25,
    });
    
    metrics.push({
      id: `INV-${j.code}`,
      code: 'INVEST-001',
      name: 'Investment Restrictions',
      requirement: `Max ${j.investmentLimits.maxEquityPercent}% equities, ${j.investmentLimits.maxSingleIssuerPercent}% single issuer`,
      jurisdiction: j.code,
      status: 'compliant',
      current: `${(j.investmentLimits.maxEquityPercent * 0.7).toFixed(0)}% equities`,
    });
    
    metrics.push({
      id: `GOV-${j.code}`,
      code: 'GOV-001',
      name: 'Corporate Governance',
      requirement: `Min ${j.governanceRequirements.minBoardMembers} board members, ${j.governanceRequirements.independentDirectorsPercent}% independent`,
      jurisdiction: j.code,
      status: 'compliant',
    });
  });
  
  return metrics;
};

const generateMockAlerts = (): Alert[] => {
  return [
    {
      id: '1',
      type: 'DEADLINE',
      severity: 'HIGH',
      title: 'Q2 Quarterly Return Due Soon',
      message: 'TT Quarterly Return due in 5 days. Please submit before deadline.',
      jurisdiction: 'TT',
      createdAt: new Date(),
      acknowledged: false,
    },
    {
      id: '2',
      type: 'CAPITAL',
      severity: 'CRITICAL',
      title: 'Solvency Margin Warning',
      message: 'Jamaica solvency margin at 115%, below recommended 150% buffer.',
      jurisdiction: 'JM',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      acknowledged: false,
    },
    {
      id: '3',
      type: 'GOVERNANCE',
      severity: 'MEDIUM',
      title: 'Board Meeting Overdue',
      message: 'No board meeting recorded in the last 90 days for Barbados entity.',
      jurisdiction: 'BB',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      acknowledged: true,
    },
  ];
};

export default function RegulatoryCompliance() {
  // State
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filings, setFilings] = useState<Filing[]>([]);
  const [complianceMetrics, setComplianceMetrics] = useState<ComplianceMetric[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showNewFilingDialog, setShowNewFilingDialog] = useState(false);
  const [showJurisdictionDialog, setShowJurisdictionDialog] = useState(false);
  const [selectedFiling, setSelectedFiling] = useState<Filing | null>(null);
  const [selectedJurisdictionData, setSelectedJurisdictionData] = useState<JurisdictionConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize data
  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setFilings(generateMockFilings(ALL_JURISDICTIONS));
      setComplianceMetrics(generateMockComplianceMetrics(ALL_JURISDICTIONS));
      setAlerts(generateMockAlerts());
      setIsLoading(false);
    }, 500);
  }, []);

  // Filtered jurisdictions
  const filteredJurisdictions = useMemo(() => {
    let result = ALL_JURISDICTIONS;
    
    if (selectedRegion !== 'all') {
      result = result.filter(j => j.region === selectedRegion);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(j => 
        j.code.toLowerCase().includes(term) ||
        j.name.toLowerCase().includes(term) ||
        j.regulator.shortName.toLowerCase().includes(term)
      );
    }
    
    return result;
  }, [selectedRegion, searchTerm]);

  // Stats
  const stats = useMemo(() => {
    const submitted = filings.filter(f => f.status === 'submitted').length;
    const pending = filings.filter(f => f.status === 'pending' || f.status === 'draft').length;
    const overdue = filings.filter(f => f.status === 'overdue').length;
    const compliant = complianceMetrics.filter(m => m.status === 'compliant').length;
    const totalCompliance = complianceMetrics.length;
    const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL' && !a.acknowledged).length;
    
    return { submitted, pending, overdue, compliant, totalCompliance, criticalAlerts };
  }, [filings, complianceMetrics, alerts]);

  // Handlers
  const handleNewFiling = () => {
    setShowNewFilingDialog(true);
  };

  const handleViewJurisdiction = (code: string) => {
    const jurisdiction = ALL_JURISDICTIONS.find(j => j.code === code);
    if (jurisdiction) {
      setSelectedJurisdictionData(jurisdiction);
      setShowJurisdictionDialog(true);
    }
  };

  const handleGenerateDocument = (filing: Filing, format: string) => {
    console.log(`Generating ${format} for filing ${filing.id}`);
    // In production, this would call the API
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, acknowledged: true } : a
    ));
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'HIGH': return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
      case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      default: return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
      case 'compliant':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
      case 'draft':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      case 'pending':
      case 'warning':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
      case 'overdue':
      case 'non_compliant':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/50';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Scale className="w-6 h-6 text-purple-400" />
            Enterprise Regulatory Filing System
          </h2>
          <p className="text-slate-400 mt-1">
            Multi-jurisdiction compliance management for {ALL_JURISDICTIONS.length}+ jurisdictions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
            <Bell className="w-4 h-4 mr-2" />
            Alerts
            {stats.criticalAlerts > 0 && (
              <Badge className="ml-2 bg-red-500 text-white">{stats.criticalAlerts}</Badge>
            )}
          </Button>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={handleNewFiling}>
            <Plus className="w-4 h-4 mr-2" />New Filing
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Jurisdictions</p>
                <p className="text-2xl font-bold text-white">{ALL_JURISDICTIONS.length}</p>
              </div>
              <Globe className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-xs text-slate-500 mt-2">{REGIONS.length} regions covered</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Pending Filings</p>
                <p className="text-2xl font-bold text-white">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-400" />
            </div>
            <p className="text-xs text-slate-500 mt-2">{stats.overdue} overdue</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Compliance Rate</p>
                <p className="text-2xl font-bold text-white">
                  {stats.totalCompliance > 0 
                    ? Math.round((stats.compliant / stats.totalCompliance) * 100) 
                    : 0}%
                </p>
              </div>
              <Shield className="w-8 h-8 text-emerald-400" />
            </div>
            <Progress 
              value={stats.totalCompliance > 0 ? (stats.compliant / stats.totalCompliance) * 100 : 0} 
              className="h-1 mt-2 bg-slate-600" 
            />
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Submitted (YTD)</p>
                <p className="text-2xl font-bold text-white">{stats.submitted}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> 12% vs last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="jurisdictions" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            Jurisdictions
          </TabsTrigger>
          <TabsTrigger value="filings" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            Filings
          </TabsTrigger>
          <TabsTrigger value="calendar" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            Calendar
          </TabsTrigger>
          <TabsTrigger value="compliance" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            Compliance
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Alerts Section */}
          {alerts.filter(a => !a.acknowledged).length > 0 && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="border-b border-slate-700">
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  Active Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {alerts.filter(a => !a.acknowledged).map(alert => (
                    <div 
                      key={alert.id}
                      className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {alert.severity === 'CRITICAL' ? (
                            <AlertCircle className="w-5 h-5 mt-0.5" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 mt-0.5" />
                          )}
                          <div>
                            <p className="font-medium">{alert.title}</p>
                            <p className="text-sm opacity-80">{alert.message}</p>
                            <p className="text-xs opacity-60 mt-1">
                              {alert.jurisdiction} • {alert.createdAt.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleAcknowledgeAlert(alert.id)}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Access Jurisdictions */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="border-b border-slate-700">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-400" />
                  Active Jurisdictions
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('jurisdictions')}>
                  View All <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filteredJurisdictions.slice(0, 6).map(j => (
                  <div 
                    key={j.code}
                    className="p-4 rounded-lg bg-slate-700/30 border border-slate-600/50 cursor-pointer hover:bg-slate-700/50 transition-colors"
                    onClick={() => handleViewJurisdiction(j.code)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{j.name}</p>
                        <p className="text-slate-400 text-sm">{j.regulator.shortName}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">{j.filingRequirements.length} filings</span>
                      <Badge className={getStatusColor('compliant')}>
                        Active
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Filings & Compliance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Filings */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="border-b border-slate-700">
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  Upcoming Filings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ScrollArea className="h-80">
                  <div className="space-y-3">
                    {filings.filter(f => f.daysUntilDue >= 0 && f.status !== 'submitted').slice(0, 10).map(filing => (
                      <div 
                        key={filing.id}
                        className="p-3 rounded-lg bg-slate-700/30 border border-slate-600/50 hover:bg-slate-700/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedFiling(filing)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              filing.daysUntilDue <= 7 ? 'bg-red-500/20' : 
                              filing.daysUntilDue <= 30 ? 'bg-orange-500/20' : 'bg-blue-500/20'
                            }`}>
                              <FileText className={`w-5 h-5 ${
                                filing.daysUntilDue <= 7 ? 'text-red-400' : 
                                filing.daysUntilDue <= 30 ? 'text-orange-400' : 'text-blue-400'
                              }`} />
                            </div>
                            <div>
                              <p className="text-white font-medium text-sm">{filing.name}</p>
                              <p className="text-slate-400 text-xs">{filing.jurisdictionName}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-medium ${
                              filing.daysUntilDue <= 7 ? 'text-red-400' : 
                              filing.daysUntilDue <= 30 ? 'text-orange-400' : 'text-slate-300'
                            }`}>
                              {filing.daysUntilDue === 0 ? 'Due Today' : 
                               filing.daysUntilDue === 1 ? 'Due Tomorrow' :
                               `${filing.daysUntilDue} days`}
                            </p>
                            <Badge className={`${getStatusColor(filing.status)} text-xs`}>
                              {filing.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Compliance Overview */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="border-b border-slate-700">
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-400" />
                  Compliance Monitor
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ScrollArea className="h-80">
                  <div className="space-y-3">
                    {complianceMetrics.map(metric => (
                      <div 
                        key={metric.id}
                        className="p-3 rounded-lg bg-slate-700/30 border border-slate-600/50"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-white font-medium text-sm">{metric.name}</p>
                            <p className="text-slate-400 text-xs">{metric.code} | {metric.jurisdiction}</p>
                          </div>
                          <Badge className={getStatusColor(metric.status)}>
                            {metric.status === 'compliant' ? (
                              <><CheckCircle className="w-3 h-3 mr-1" />Compliant</>
                            ) : metric.status === 'warning' ? (
                              <><AlertTriangle className="w-3 h-3 mr-1" />Warning</>
                            ) : (
                              <><AlertCircle className="w-3 h-3 mr-1" />Non-Compliant</>
                            )}
                          </Badge>
                        </div>
                        <p className="text-slate-300 text-xs mb-2">{metric.requirement}</p>
                        {metric.progress !== undefined && (
                          <div className="flex items-center gap-2">
                            <Progress value={metric.progress} className="h-1.5 flex-1 bg-slate-600" />
                            <span className="text-xs text-slate-400">{metric.progress.toFixed(0)}%</span>
                          </div>
                        )}
                        {metric.current && (
                          <p className="text-xs text-slate-400 mt-1">
                            Current: <span className="text-emerald-400">{metric.current}</span>
                            {metric.required && <> | Required: {metric.required}</>}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Jurisdictions Tab */}
        <TabsContent value="jurisdictions" className="space-y-6">
          {/* Filters */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search jurisdictions, regulators..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {REGIONS.map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.name} ({r.jurisdictionCount})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Jurisdictions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredJurisdictions.map(j => (
              <Card 
                key={j.code} 
                className="bg-slate-800/50 border-slate-700 cursor-pointer hover:bg-slate-700/50 transition-colors"
                onClick={() => handleViewJurisdiction(j.code)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                      <Globe className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{j.name}</p>
                      <p className="text-slate-400 text-sm">{j.code}</p>
                    </div>
                    <Badge variant="outline" className="text-slate-400 border-slate-600">
                      {j.region}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Regulator</span>
                      <span className="text-white">{j.regulator.shortName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Currency</span>
                      <span className="text-white">{j.currency}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Filings Required</span>
                      <span className="text-white">{j.filingRequirements.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">E-Filing</span>
                      <Badge className={j.electronicSubmissionEnabled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-500/20 text-slate-300'}>
                        {j.electronicSubmissionEnabled ? 'Enabled' : 'Manual'}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <p className="text-xs text-slate-400">Min. Capital</p>
                        <p className="text-sm text-white font-medium">
                          {j.capitalRequirements.minimumCapital.toLocaleString()} {j.currency}
                        </p>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-slate-400">Solvency Margin</p>
                        <p className="text-sm text-white font-medium">
                          ≥{j.capitalRequirements.solvencyMarginPercent}%
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Filings Tab */}
        <TabsContent value="filings" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="border-b border-slate-700">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  Regulatory Filings
                </CardTitle>
                <div className="flex items-center gap-3">
                  <Select value={selectedJurisdiction} onValueChange={setSelectedJurisdiction}>
                    <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="All Jurisdictions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Jurisdictions</SelectItem>
                      {ALL_JURISDICTIONS.slice(0, 20).map(j => (
                        <SelectItem key={j.code} value={j.code}>{j.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={handleNewFiling}>
                    <Plus className="w-4 h-4 mr-2" />New Filing
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {filings
                    .filter(f => !selectedJurisdiction || f.jurisdiction === selectedJurisdiction)
                    .map(filing => (
                      <div 
                        key={filing.id}
                        className="p-4 rounded-lg bg-slate-700/30 border border-slate-600/50 hover:bg-slate-700/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                              filing.status === 'submitted' ? 'bg-emerald-500/20' : 
                              filing.status === 'draft' ? 'bg-blue-500/20' : 
                              filing.status === 'overdue' ? 'bg-red-500/20' : 'bg-orange-500/20'
                            }`}>
                              {filing.status === 'submitted' ? (
                                <CheckCircle className="w-6 h-6 text-emerald-400" />
                              ) : filing.status === 'draft' ? (
                                <FileText className="w-6 h-6 text-blue-400" />
                              ) : filing.status === 'overdue' ? (
                                <AlertCircle className="w-6 h-6 text-red-400" />
                              ) : (
                                <Clock className="w-6 h-6 text-orange-400" />
                              )}
                            </div>
                            <div>
                              <p className="text-white font-medium">{filing.name}</p>
                              <p className="text-slate-400 text-sm">
                                {filing.regulator} | {filing.jurisdictionName}
                              </p>
                              <div className="flex items-center gap-3 mt-2">
                                <Badge variant="outline" className="text-slate-400 border-slate-600">
                                  {filing.type}
                                </Badge>
                                <Badge variant="outline" className="text-slate-400 border-slate-600">
                                  {filing.dataFormat}
                                </Badge>
                                {filing.penalty && (
                                  <span className="text-xs text-red-400">
                                    Penalty: {filing.penalty.toLocaleString()} {filing.penaltyCurrency}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right mr-4">
                              <p className="text-slate-400 text-xs">Due Date</p>
                              <p className={`text-sm font-medium ${
                                filing.daysUntilDue < 0 ? 'text-red-400' :
                                filing.daysUntilDue <= 7 ? 'text-orange-400' : 'text-white'
                              }`}>
                                {filing.dueDate.toLocaleDateString()}
                              </p>
                              {filing.submittedAt && (
                                <p className="text-xs text-emerald-400 mt-1">
                                  Submitted: {filing.submittedAt.toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <Badge className={getStatusColor(filing.status)}>
                              {filing.status}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-slate-400">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                                <DropdownMenuItem className="text-slate-300 focus:bg-slate-700">
                                  <Eye className="w-4 h-4 mr-2" /> View Details
                                </DropdownMenuItem>
                                {filing.status === 'draft' && (
                                  <DropdownMenuItem className="text-slate-300 focus:bg-slate-700">
                                    <Edit className="w-4 h-4 mr-2" /> Edit Filing
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator className="bg-slate-700" />
                                <DropdownMenuItem 
                                  className="text-slate-300 focus:bg-slate-700"
                                  onClick={() => handleGenerateDocument(filing, 'XML')}
                                >
                                  <Download className="w-4 h-4 mr-2" /> Export XML
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-slate-300 focus:bg-slate-700"
                                  onClick={() => handleGenerateDocument(filing, 'PDF')}
                                >
                                  <Download className="w-4 h-4 mr-2" /> Export PDF
                                </DropdownMenuItem>
                                {filing.status === 'draft' && (
                                  <>
                                    <DropdownMenuSeparator className="bg-slate-700" />
                                    <DropdownMenuItem className="text-emerald-400 focus:bg-slate-700">
                                      <Send className="w-4 h-4 mr-2" /> Submit
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="border-b border-slate-700">
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                Filing Calendar 2024
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Quarterly Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {['Q1', 'Q2', 'Q3', 'Q4'].map((q, idx) => {
                  const quarterFilings = filings.filter(f => {
                    const month = f.dueDate.getMonth();
                    const quarter = Math.floor(month / 3);
                    return quarter === idx;
                  });
                  const submitted = quarterFilings.filter(f => f.status === 'submitted').length;
                  const total = quarterFilings.length;
                  
                  return (
                    <div 
                      key={q}
                      className="p-4 rounded-lg bg-slate-700/30 border border-slate-600/50"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-white font-bold text-lg">{q} 2024</p>
                        <Badge className={submitted === total && total > 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'}>
                          {submitted}/{total} Complete
                        </Badge>
                      </div>
                      <Progress 
                        value={total > 0 ? (submitted / total) * 100 : 0} 
                        className="h-2 bg-slate-600" 
                      />
                      <p className="text-slate-400 text-sm mt-2">
                        Due: {q === 'Q1' ? 'Apr 30' : q === 'Q2' ? 'Jul 31' : q === 'Q3' ? 'Oct 31' : 'Jan 31'}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Monthly View */}
              <h3 className="text-white font-medium mb-4">Monthly Filing Schedule</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: 12 }, (_, i) => {
                  const month = new Date(2024, i, 1);
                  const monthFilings = filings.filter(f => f.dueDate.getMonth() === i);
                  
                  return (
                    <div 
                      key={i}
                      className="p-4 rounded-lg bg-slate-700/30 border border-slate-600/50"
                    >
                      <p className="text-white font-medium mb-2">
                        {month.toLocaleDateString('en-US', { month: 'long' })}
                      </p>
                      {monthFilings.length > 0 ? (
                        <div className="space-y-2">
                          {monthFilings.slice(0, 3).map(f => (
                            <div 
                              key={f.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-slate-300 truncate flex-1">{f.name}</span>
                              <Badge className={`${getStatusColor(f.status)} text-xs ml-2`}>
                                {f.status}
                              </Badge>
                            </div>
                          ))}
                          {monthFilings.length > 3 && (
                            <p className="text-slate-400 text-xs">+{monthFilings.length - 3} more</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-slate-500 text-sm">No filings due</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Capital Adequacy */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="border-b border-slate-700">
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  Capital Adequacy
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {complianceMetrics.filter(m => m.code.includes('CAP')).slice(0, 3).map(metric => (
                    <div key={metric.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 text-sm">{metric.jurisdiction}</span>
                        <Badge className={getStatusColor(metric.status)}>
                          {metric.current}
                        </Badge>
                      </div>
                      <Progress value={metric.progress || 0} className="h-2 bg-slate-600" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Investment Limits */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="border-b border-slate-700">
                <CardTitle className="text-white flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-blue-400" />
                  Investment Limits
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {complianceMetrics.filter(m => m.code.includes('INV')).slice(0, 3).map(metric => (
                    <div key={metric.id} className="flex items-center justify-between p-2 rounded bg-slate-700/30">
                      <div>
                        <p className="text-slate-300 text-sm">{metric.jurisdiction}</p>
                        <p className="text-slate-400 text-xs">{metric.current}</p>
                      </div>
                      <Badge className={getStatusColor(metric.status)}>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        OK
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Governance */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="border-b border-slate-700">
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  Governance
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {complianceMetrics.filter(m => m.code.includes('GOV')).slice(0, 3).map(metric => (
                    <div key={metric.id} className="flex items-center justify-between p-2 rounded bg-slate-700/30">
                      <div>
                        <p className="text-slate-300 text-sm">{metric.jurisdiction}</p>
                        <p className="text-slate-400 text-xs">Board & Committees</p>
                      </div>
                      <Badge className={getStatusColor(metric.status)}>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        OK
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Compliance Table */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="border-b border-slate-700">
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                Compliance Details by Jurisdiction
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  <div className="grid grid-cols-5 gap-4 p-2 bg-slate-700/50 rounded text-sm font-medium text-slate-300">
                    <span>Jurisdiction</span>
                    <span>Capital</span>
                    <span>Investments</span>
                    <span>Governance</span>
                    <span>Overall</span>
                  </div>
                  {filteredJurisdictions.slice(0, 15).map(j => {
                    const capitalMetric = complianceMetrics.find(m => m.id === `CAP-${j.code}`);
                    const investMetric = complianceMetrics.find(m => m.id === `INV-${j.code}`);
                    const govMetric = complianceMetrics.find(m => m.id === `GOV-${j.code}`);
                    
                    return (
                      <div 
                        key={j.code}
                        className="grid grid-cols-5 gap-4 p-3 rounded bg-slate-700/30 hover:bg-slate-700/50 cursor-pointer"
                        onClick={() => handleViewJurisdiction(j.code)}
                      >
                        <div>
                          <p className="text-white font-medium">{j.name}</p>
                          <p className="text-slate-400 text-xs">{j.code}</p>
                        </div>
                        <Badge className={getStatusColor(capitalMetric?.status || 'compliant')}>
                          {capitalMetric?.status || 'compliant'}
                        </Badge>
                        <Badge className={getStatusColor(investMetric?.status || 'compliant')}>
                          {investMetric?.status || 'compliant'}
                        </Badge>
                        <Badge className={getStatusColor(govMetric?.status || 'compliant')}>
                          {govMetric?.status || 'compliant'}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <Progress value={85 + Math.random() * 15} className="h-2 flex-1 bg-slate-600" />
                          <span className="text-xs text-slate-400">92%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Jurisdiction Detail Dialog */}
      <Dialog open={showJurisdictionDialog} onOpenChange={setShowJurisdictionDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-400" />
              {selectedJurisdictionData?.name} ({selectedJurisdictionData?.code})
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {selectedJurisdictionData?.regulator.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedJurisdictionData && (
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-6 p-4">
                {/* Regulator Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-slate-800/50">
                    <p className="text-slate-400 text-sm">Regulator</p>
                    <p className="text-white font-medium">{selectedJurisdictionData.regulator.shortName}</p>
                    <a 
                      href={selectedJurisdictionData.regulator.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 text-sm hover:underline"
                    >
                      {selectedJurisdictionData.regulator.website}
                    </a>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-800/50">
                    <p className="text-slate-400 text-sm">Contact</p>
                    <p className="text-white text-sm">{selectedJurisdictionData.regulator.email}</p>
                    <p className="text-white text-sm">{selectedJurisdictionData.regulator.phone}</p>
                  </div>
                </div>

                {/* Capital Requirements */}
                <div className="p-4 rounded-lg bg-slate-800/50">
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    Capital Requirements
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-slate-400 text-xs">Minimum Capital</p>
                      <p className="text-white font-medium">
                        {selectedJurisdictionData.capitalRequirements.minimumCapital.toLocaleString()} {selectedJurisdictionData.currency}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Solvency Margin</p>
                      <p className="text-white font-medium">
                        ≥{selectedJurisdictionData.capitalRequirements.solvencyMarginPercent}%
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Capital Adequacy Ratio</p>
                      <p className="text-white font-medium">
                        ≥{selectedJurisdictionData.capitalRequirements.capitalAdequacyRatio.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Investment Limits */}
                <div className="p-4 rounded-lg bg-slate-800/50">
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-blue-400" />
                    Investment Limits
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-slate-400 text-xs">Max Equity</p>
                      <p className="text-white font-medium">{selectedJurisdictionData.investmentLimits.maxEquityPercent}%</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Max Single Issuer</p>
                      <p className="text-white font-medium">{selectedJurisdictionData.investmentLimits.maxSingleIssuerPercent}%</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Max Property</p>
                      <p className="text-white font-medium">{selectedJurisdictionData.investmentLimits.maxPropertyPercent}%</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Max Foreign</p>
                      <p className="text-white font-medium">{selectedJurisdictionData.investmentLimits.maxForeignInvestmentPercent}%</p>
                    </div>
                  </div>
                  {selectedJurisdictionData.investmentLimits.restrictedAssets.length > 0 && (
                    <p className="text-red-400 text-sm mt-2">
                      Restricted: {selectedJurisdictionData.investmentLimits.restrictedAssets.join(', ')}
                    </p>
                  )}
                </div>

                {/* Governance Requirements */}
                <div className="p-4 rounded-lg bg-slate-800/50">
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    Governance Requirements
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-slate-400 text-xs">Min Board Members</p>
                      <p className="text-white font-medium">{selectedJurisdictionData.governanceRequirements.minBoardMembers}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Independent Directors</p>
                      <p className="text-white font-medium">≥{selectedJurisdictionData.governanceRequirements.independentDirectorsPercent}%</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Audit Committee</p>
                      <Badge className={selectedJurisdictionData.governanceRequirements.auditCommitteeRequired ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-500/20 text-slate-300'}>
                        {selectedJurisdictionData.governanceRequirements.auditCommitteeRequired ? 'Required' : 'Optional'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Risk Committee</p>
                      <Badge className={selectedJurisdictionData.governanceRequirements.riskCommitteeRequired ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-500/20 text-slate-300'}>
                        {selectedJurisdictionData.governanceRequirements.riskCommitteeRequired ? 'Required' : 'Optional'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Appointed Actuary</p>
                      <Badge className={selectedJurisdictionData.governanceRequirements.actuaryRequired ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-500/20 text-slate-300'}>
                        {selectedJurisdictionData.governanceRequirements.actuaryRequired ? 'Required' : 'Optional'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Compliance Officer</p>
                      <Badge className={selectedJurisdictionData.governanceRequirements.complianceOfficerRequired ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-500/20 text-slate-300'}>
                        {selectedJurisdictionData.governanceRequirements.complianceOfficerRequired ? 'Required' : 'Optional'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Filing Requirements */}
                <div className="p-4 rounded-lg bg-slate-800/50">
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    Filing Requirements ({selectedJurisdictionData.filingRequirements.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedJurisdictionData.filingRequirements.map(filing => (
                      <div key={filing.id} className="p-3 rounded bg-slate-700/30 border border-slate-600/50">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-white font-medium text-sm">{filing.name}</p>
                            <p className="text-slate-400 text-xs">{filing.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-slate-400 border-slate-600">
                              {filing.type}
                            </Badge>
                            <Badge variant="outline" className="text-slate-400 border-slate-600">
                              {filing.dataFormat}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                          <span>Due: Day {filing.dueDay}{filing.dueMonth ? `, Month ${filing.dueMonth}` : ''}</span>
                          {filing.penaltyAmount && (
                            <span className="text-red-400">
                              Penalty: {filing.penaltyAmount.toLocaleString()} {filing.penaltyCurrency}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowJurisdictionDialog(false)}>
              Close
            </Button>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              <Plus className="w-4 h-4 mr-2" /> Create Filing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Filing Dialog */}
      <Dialog open={showNewFilingDialog} onOpenChange={setShowNewFilingDialog}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Filing</DialogTitle>
            <DialogDescription className="text-slate-400">
              Select a jurisdiction and filing type to create a new regulatory filing.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Jurisdiction</label>
                <Select>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select jurisdiction" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_JURISDICTIONS.map(j => (
                      <SelectItem key={j.code} value={j.code}>{j.name} ({j.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Filing Type</label>
                <Select>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select filing type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="QUARTERLY">Quarterly Return</SelectItem>
                    <SelectItem value="ANNUAL">Annual Statement</SelectItem>
                    <SelectItem value="SEMI_ANNUAL">Semi-Annual Report</SelectItem>
                    <SelectItem value="ADHOC">Ad-hoc Filing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Reporting Period</label>
              <div className="grid grid-cols-2 gap-4">
                <Input type="date" className="bg-slate-700 border-slate-600 text-white" />
                <Input type="date" className="bg-slate-700 border-slate-600 text-white" />
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">Notes</label>
              <Textarea 
                placeholder="Add any notes or instructions for this filing..."
                className="bg-slate-700 border-slate-600 text-white min-h-24"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFilingDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              Create Filing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
