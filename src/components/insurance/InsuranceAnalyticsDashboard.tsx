'use client';

import React, { useState, useMemo } from 'react';
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
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Users,
  AlertTriangle,
  CheckCircle,
  Activity,
  Shield,
  Brain,
  LineChart,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Download,
  Filter,
  Calendar,
  Globe,
  Target,
  Zap,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface KPIData {
  current: number;
  previous: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  target?: number;
}

interface ChartDataPoint {
  label: string;
  value: number;
  previousValue?: number;
  color?: string;
}

interface DrillDownData {
  category: string;
  subcategories: {
    name: string;
    value: number;
    percentage: number;
  }[];
}

// ============================================================================
// MOCK DATA (In production, this would come from API)
// ============================================================================

const KPIS = {
  gwp: { current: 8547290, previous: 7823450, change: 9.2, trend: 'up' as const, target: 9000000 },
  claimsRatio: { current: 42.3, previous: 45.8, change: -3.5, trend: 'down' as const, target: 40 },
  combinedRatio: { current: 89.7, previous: 92.1, change: -2.4, trend: 'down' as const, target: 85 },
  renewalRate: { current: 87.5, previous: 84.2, change: 3.3, trend: 'up' as const, target: 90 },
  newBusiness: { current: 342, previous: 298, change: 14.8, trend: 'up' as const, target: 400 },
  avgPremium: { current: 6890, previous: 6450, change: 6.8, trend: 'up' as const },
  solvencyRatio: { current: 185, previous: 172, change: 7.6, trend: 'up' as const, target: 150 },
  expenses: { current: 1245000, previous: 1189000, change: 4.7, trend: 'up' as const },
};

const PREMIUM_BY_LOB: ChartDataPoint[] = [
  { label: 'Life', value: 2847290, color: '#EC4899' },
  { label: 'Health', value: 1923450, color: '#10B981' },
  { label: 'Motor', value: 2134560, color: '#3B82F6' },
  { label: 'Property', value: 1234560, color: '#F59E0B' },
  { label: 'Marine', value: 289000, color: '#06B6D4' },
  { label: 'Liability', value: 118430, color: '#8B5CF6' },
];

const CLAIMS_BY_TYPE: ChartDataPoint[] = [
  { label: 'Motor', value: 892450, color: '#3B82F6' },
  { label: 'Health', value: 534200, color: '#10B981' },
  { label: 'Property', value: 298700, color: '#F59E0B' },
  { label: 'Life', value: 145600, color: '#EC4899' },
  { label: 'Marine', value: 42500, color: '#06B6D4' },
];

const MONTHLY_TREND: ChartDataPoint[] = [
  { label: 'Jan', value: 680000, previousValue: 620000 },
  { label: 'Feb', value: 720000, previousValue: 680000 },
  { label: 'Mar', value: 690000, previousValue: 650000 },
  { label: 'Apr', value: 750000, previousValue: 710000 },
  { label: 'May', value: 780000, previousValue: 740000 },
  { label: 'Jun', value: 810000, previousValue: 770000 },
  { label: 'Jul', value: 840000, previousValue: 790000 },
  { label: 'Aug', value: 820000, previousValue: 780000 },
  { label: 'Sep', value: 860000, previousValue: 810000 },
  { label: 'Oct', value: 890000, previousValue: 840000 },
  { label: 'Nov', value: 910000, previousValue: 860000 },
  { label: 'Dec', value: 698290, previousValue: 656450 },
];

const DRILL_DOWN_DATA: DrillDownData[] = [
  {
    category: 'Motor Insurance',
    subcategories: [
      { name: 'Private Cars', value: 1234560, percentage: 57.9 },
      { name: 'Commercial Vehicles', value: 612340, percentage: 28.7 },
      { name: 'Motorcycles', value: 156780, percentage: 7.4 },
      { name: 'Fleet', value: 130880, percentage: 6.1 },
    ],
  },
  {
    category: 'Life Insurance',
    subcategories: [
      { name: 'Term Life', value: 1423650, percentage: 50.0 },
      { name: 'Whole Life', value: 712340, percentage: 25.0 },
      { name: 'Endowment', value: 426890, percentage: 15.0 },
      { name: 'Group Life', value: 284410, percentage: 10.0 },
    ],
  },
];

const TOP_AGENTS = [
  { name: 'María García', policies: 89, premium: 456780, conversion: 78 },
  { name: 'John Smith', policies: 76, premium: 398450, conversion: 72 },
  { name: 'Raj Patel', policies: 68, premium: 356890, conversion: 81 },
  { name: 'Sarah Williams', policies: 62, premium: 312340, conversion: 69 },
  { name: 'Carlos Rodríguez', policies: 54, premium: 289560, conversion: 75 },
];

const REGULATORY_STATUS = [
  { jurisdiction: 'Trinidad & Tobago', status: 'compliant', lastFiling: '2024-Q3', dueDate: '2024-Q4', daysLeft: 45 },
  { jurisdiction: 'Jamaica', status: 'compliant', lastFiling: '2024-Q3', dueDate: '2024-Q4', daysLeft: 42 },
  { jurisdiction: 'Barbados', status: 'pending', lastFiling: '2024-Q2', dueDate: '2024-Q3', daysLeft: 5 },
  { jurisdiction: 'Bahamas', status: 'compliant', lastFiling: '2024-Q3', dueDate: '2024-Q4', daysLeft: 50 },
];

// ============================================================================
// COMPONENTS
// ============================================================================

interface KPICardProps {
  title: string;
  kpi: KPIData;
  format: 'currency' | 'number' | 'percent';
  icon: React.ReactNode;
  color: string;
}

function KPICard({ title, kpi, format, icon, color }: KPICardProps) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return `TT$${(val / 1000000).toFixed(2)}M`;
      case 'percent':
        return `${val.toFixed(1)}%`;
      default:
        return val.toLocaleString();
    }
  };

  const progressToTarget = kpi.target ? (kpi.current / kpi.target) * 100 : null;

  return (
    <Card className={`bg-slate-800/50 border-slate-700 hover:border-${color}-500/50 transition-colors`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400 text-sm">{title}</span>
          <div className={`w-8 h-8 rounded-lg bg-${color}-500/10 flex items-center justify-center`}>
            {icon}
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold text-white">{formatValue(kpi.current)}</p>
            <div className="flex items-center gap-1 mt-1">
              {kpi.trend === 'up' ? (
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-400" />
              )}
              <span className={`text-sm ${kpi.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                {Math.abs(kpi.change)}%
              </span>
              <span className="text-slate-500 text-sm">vs last period</span>
            </div>
          </div>
        </div>
        {progressToTarget !== null && (
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500">Target: {format === 'currency' ? `TT$${(kpi.target! / 1000000).toFixed(1)}M` : format === 'percent' ? `${kpi.target}%` : kpi.target!.toLocaleString()}</span>
              <span className="text-slate-400">{progressToTarget.toFixed(0)}%</span>
            </div>
            <Progress value={Math.min(progressToTarget, 100)} className="h-1.5" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface MiniChartProps {
  data: ChartDataPoint[];
  type: 'bar' | 'line' | 'donut';
  height?: number;
}

function MiniChart({ data, type, height = 120 }: MiniChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  
  if (type === 'bar') {
    return (
      <div className="flex items-end justify-between h-full gap-1" style={{ height }}>
        {data.map((point, i) => (
          <div key={i} className="flex flex-col items-center flex-1">
            <div 
              className="w-full rounded-t transition-all hover:opacity-80"
              style={{ 
                height: `${(point.value / maxValue) * (height - 20)}px`,
                backgroundColor: point.color || '#3B82F6',
              }}
            />
            <span className="text-xs text-slate-500 mt-1 truncate w-full text-center">
              {point.label}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'donut') {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    let cumulativePercent = 0;
    
    return (
      <div className="flex items-center gap-4">
        <div className="relative" style={{ width: height, height }}>
          <svg viewBox="0 0 36 36" className="w-full h-full">
            {data.map((point, i) => {
              const percent = (point.value / total) * 100;
              const strokeDasharray = `${percent} ${100 - percent}`;
              const strokeDashoffset = -cumulativePercent;
              cumulativePercent += percent;
              
              return (
                <circle
                  key={i}
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke={point.color || '#3B82F6'}
                  strokeWidth="3"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all hover:stroke-width-4"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-sm">{data.length}</span>
          </div>
        </div>
        <div className="flex-1 space-y-1">
          {data.slice(0, 4).map((point, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: point.color }} />
                <span className="text-slate-300">{point.label}</span>
              </div>
              <span className="text-white font-medium">{((point.value / total) * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

interface DrillDownTableProps {
  data: DrillDownData[];
}

function DrillDownTable({ data }: DrillDownTableProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      {data.map((item) => (
        <div key={item.category} className="rounded-lg border border-slate-700 bg-slate-800/30 overflow-hidden">
          <button
            className="w-full p-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
            onClick={() => setExpanded(expanded === item.category ? null : item.category)}
          >
            <div className="flex items-center gap-3">
              <Target className={`w-5 h-5 text-cyan-400 transition-transform ${expanded === item.category ? 'rotate-90' : ''}`} />
              <span className="text-white font-medium">{item.category}</span>
            </div>
            <Badge className="bg-slate-600 text-slate-300">
              {item.subcategories.length} segments
            </Badge>
          </button>
          {expanded === item.category && (
            <div className="px-4 pb-4">
              <div className="space-y-2">
                {item.subcategories.map((sub, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-700/20">
                    <span className="text-slate-300">{sub.name}</span>
                    <div className="flex items-center gap-4">
                      <div className="w-32">
                        <Progress value={sub.percentage} className="h-2" />
                      </div>
                      <span className="text-white font-medium w-24 text-right">
                        TT${(sub.value / 1000).toFixed(0)}K
                      </span>
                      <span className="text-slate-400 w-12 text-right">
                        {sub.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function InsuranceAnalyticsDashboard() {
  const [period, setPeriod] = useState('year');
  const [lob, setLob] = useState('all');
  const [region, setRegion] = useState('all');

  const formatCurrency = (val: number) => 
    val >= 1000000 ? `TT$${(val / 1000000).toFixed(2)}M` : `TT$${(val / 1000).toFixed(0)}K`;

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Enterprise Analytics</h2>
          <p className="text-slate-400">Real-time insurance performance metrics with drill-down analysis</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32 bg-slate-800 border-slate-700 text-white">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={lob} onValueChange={setLob}>
            <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Lines</SelectItem>
              <SelectItem value="life">Life</SelectItem>
              <SelectItem value="health">Health</SelectItem>
              <SelectItem value="motor">Motor</SelectItem>
              <SelectItem value="property">Property</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <KPICard title="GWP" kpi={KPIS.gwp} format="currency" icon={<DollarSign className="w-4 h-4 text-emerald-400" />} color="emerald" />
        <KPICard title="Claims Ratio" kpi={KPIS.claimsRatio} format="percent" icon={<AlertTriangle className="w-4 h-4 text-amber-400" />} color="amber" />
        <KPICard title="Combined Ratio" kpi={KPIS.combinedRatio} format="percent" icon={<BarChart3 className="w-4 h-4 text-blue-400" />} color="blue" />
        <KPICard title="Renewal Rate" kpi={KPIS.renewalRate} format="percent" icon={<CheckCircle className="w-4 h-4 text-green-400" />} color="green" />
        <KPICard title="New Business" kpi={KPIS.newBusiness} format="number" icon={<FileText className="w-4 h-4 text-cyan-400" />} color="cyan" />
        <KPICard title="Avg Premium" kpi={KPIS.avgPremium} format="currency" icon={<TrendingUp className="w-4 h-4 text-pink-400" />} color="pink" />
        <KPICard title="Solvency" kpi={KPIS.solvencyRatio} format="percent" icon={<Shield className="w-4 h-4 text-purple-400" />} color="purple" />
        <KPICard title="Expenses" kpi={KPIS.expenses} format="currency" icon={<Activity className="w-4 h-4 text-orange-400" />} color="orange" />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <BarChart3 className="w-4 h-4 mr-2" />Overview
          </TabsTrigger>
          <TabsTrigger value="premium" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <DollarSign className="w-4 h-4 mr-2" />Premium
          </TabsTrigger>
          <TabsTrigger value="claims" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <AlertTriangle className="w-4 h-4 mr-2" />Claims
          </TabsTrigger>
          <TabsTrigger value="distribution" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <Users className="w-4 h-4 mr-2" />Distribution
          </TabsTrigger>
          <TabsTrigger value="regulatory" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <Globe className="w-4 h-4 mr-2" />Regulatory
          </TabsTrigger>
          <TabsTrigger value="ai" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <Brain className="w-4 h-4 mr-2" />AI Insights
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trend */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-blue-400" />
                  Premium Trend (YoY Comparison)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {MONTHLY_TREND.map((month, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-slate-400 w-8 text-sm">{month.label}</span>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 h-4 bg-slate-700/50 rounded-full overflow-hidden flex">
                          <div 
                            className="h-full bg-blue-500/30 rounded-l-full"
                            style={{ width: `${(month.previousValue! / 1000000) * 10}%` }}
                          />
                          <div 
                            className="h-full bg-blue-500 rounded-r-full"
                            style={{ width: `${(month.value / 1000000) * 10}%` }}
                          />
                        </div>
                        <span className="text-white text-sm w-20 text-right">
                          {formatCurrency(month.value)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-700">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-slate-400 text-sm">Current Year</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500/30" />
                    <span className="text-slate-400 text-sm">Previous Year</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Premium by Line */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-cyan-400" />
                  Premium by Line of Business
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <MiniChart data={PREMIUM_BY_LOB} type="donut" height={150} />
              </CardContent>
            </Card>
          </div>

          {/* Drill Down Section */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-400" />
                Drill-Down Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <DrillDownTable data={DRILL_DOWN_DATA} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Premium Tab */}
        <TabsContent value="premium" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Premium Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <MiniChart data={PREMIUM_BY_LOB} type="bar" height={200} />
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Premium Metrics</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-emerald-400 text-sm">Collected YTD</p>
                  <p className="text-2xl font-bold text-white">TT$7.23M</p>
                  <p className="text-emerald-300 text-sm">+12.4% vs target</p>
                </div>
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <p className="text-blue-400 text-sm">Outstanding</p>
                  <p className="text-2xl font-bold text-white">TT$1.32M</p>
                  <p className="text-blue-300 text-sm">1,234 policies</p>
                </div>
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-amber-400 text-sm">Overdue (30+ days)</p>
                  <p className="text-2xl font-bold text-white">TT$234K</p>
                  <p className="text-amber-300 text-sm">156 policies</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Claims Tab */}
        <TabsContent value="claims" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Claims by Type</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <MiniChart data={CLAIMS_BY_TYPE} type="donut" height={150} />
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Claims Performance</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center p-3 rounded bg-slate-700/30">
                  <span className="text-slate-400">Settlement Ratio</span>
                  <span className="text-emerald-400 font-bold">94.2%</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded bg-slate-700/30">
                  <span className="text-slate-400">Avg Settlement Time</span>
                  <span className="text-white font-bold">12.4 days</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded bg-slate-700/30">
                  <span className="text-slate-400">Pending Claims</span>
                  <span className="text-amber-400 font-bold">47</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded bg-slate-700/30">
                  <span className="text-slate-400">Fraud Detection Rate</span>
                  <span className="text-purple-400 font-bold">94.2%</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded bg-slate-700/30">
                  <span className="text-slate-400">Fraud Prevented YTD</span>
                  <span className="text-cyan-400 font-bold">TT$1.2M</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Distribution Tab */}
        <TabsContent value="distribution" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Top Performing Agents</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {TOP_AGENTS.map((agent, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-white font-medium">{agent.name}</p>
                        <p className="text-slate-400 text-sm">{agent.policies} policies</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-emerald-400 font-medium">{formatCurrency(agent.premium)}</p>
                        <p className="text-slate-500 text-sm">Premium</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">{agent.conversion}%</p>
                        <p className="text-slate-500 text-sm">Conversion</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Regulatory Tab */}
        <TabsContent value="regulatory" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" />
                Multi-Jurisdiction Compliance Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {REGULATORY_STATUS.map((jurisdiction, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-slate-700/30">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        jurisdiction.status === 'compliant' ? 'bg-emerald-500/20' : 'bg-amber-500/20'
                      }`}>
                        {jurisdiction.status === 'compliant' ? (
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-amber-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">{jurisdiction.jurisdiction}</p>
                        <p className="text-slate-400 text-sm">Last: {jurisdiction.lastFiling}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-slate-400 text-sm">Due: {jurisdiction.dueDate}</p>
                        <p className={`font-medium ${jurisdiction.daysLeft <= 7 ? 'text-red-400' : 'text-white'}`}>
                          {jurisdiction.daysLeft} days
                        </p>
                      </div>
                      <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="ai" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  AI Predictions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-400 font-medium">Lapse Prediction</span>
                  </div>
                  <p className="text-white">156 policies at high risk of lapse in next 90 days</p>
                  <p className="text-purple-300 text-sm">Potential premium at risk: TT$234K</p>
                </div>
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-400 font-medium">Fraud Alerts</span>
                  </div>
                  <p className="text-white">12 claims flagged for review</p>
                  <p className="text-amber-300 text-sm">Estimated fraud prevention: TT$89K</p>
                </div>
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Cross-sell Opportunities</span>
                  </div>
                  <p className="text-white">342 customers identified for product upsell</p>
                  <p className="text-emerald-300 text-sm">Projected additional premium: TT$156K</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  Model Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[
                    { name: 'Fraud Detection', accuracy: 94.2, precision: 91.8 },
                    { name: 'Underwriting Risk', accuracy: 87.5, precision: 85.2 },
                    { name: 'Lapse Prediction', accuracy: 82.3, precision: 79.8 },
                    { name: 'Claim Severity', accuracy: 78.9, precision: 76.4 },
                  ].map((model, i) => (
                    <div key={i} className="p-3 rounded bg-slate-700/30">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-medium">{model.name}</span>
                        <span className="text-emerald-400 font-mono text-sm">{model.accuracy}%</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Accuracy</span>
                          <span className="text-slate-300">{model.accuracy}%</span>
                        </div>
                        <Progress value={model.accuracy} className="h-1.5" />
                        <div className="flex justify-between text-xs mt-2">
                          <span className="text-slate-400">Precision</span>
                          <span className="text-slate-300">{model.precision}%</span>
                        </div>
                        <Progress value={model.precision} className="h-1.5" />
                      </div>
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

export type { KPIData, ChartDataPoint, DrillDownData };
