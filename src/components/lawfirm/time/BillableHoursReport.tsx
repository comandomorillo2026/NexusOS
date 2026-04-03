'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import {
  Download,
  FileText,
  DollarSign,
  Clock,
  Users,
  Briefcase,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Printer,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
} from 'lucide-react';

// Types
interface TimeEntry {
  id: string;
  caseId: string;
  caseName: string;
  caseNumber: string;
  clientName: string;
  attorneyId: string;
  attorneyName: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  description: string;
  activityType: string;
  hourlyRate: number;
  amount: number;
  isBillable: boolean;
  isBilled: boolean;
  invoiceId?: string;
}

interface ReportSummary {
  totalHours: number;
  totalAmount: number;
  billableHours: number;
  billableAmount: number;
  unbilledHours: number;
  unbilledAmount: number;
  billedHours: number;
  billedAmount: number;
  averageRate: number;
  entryCount: number;
}

// Mock data
const mockTimeEntries: TimeEntry[] = [
  {
    id: '1',
    caseId: '1',
    caseName: 'Smith vs. Johnson Holdings',
    caseNumber: 'CS-2026-001',
    clientName: 'Robert Smith',
    attorneyId: 'att-1',
    attorneyName: 'Dr. James Rodriguez',
    date: '2026-03-27',
    startTime: '09:00',
    endTime: '12:30',
    durationMinutes: 210,
    description: 'Document review and legal research',
    activityType: 'research',
    hourlyRate: 850,
    amount: 2975,
    isBillable: true,
    isBilled: false,
  },
  {
    id: '2',
    caseId: '3',
    caseName: 'TT Corp Contract Dispute',
    caseNumber: 'CS-2026-003',
    clientName: 'TT Corporation Ltd.',
    attorneyId: 'att-1',
    attorneyName: 'Dr. James Rodriguez',
    date: '2026-03-27',
    startTime: '14:00',
    endTime: '16:00',
    durationMinutes: 120,
    description: 'Client meeting - strategy discussion',
    activityType: 'meeting',
    hourlyRate: 1200,
    amount: 2400,
    isBillable: true,
    isBilled: false,
  },
  {
    id: '3',
    caseId: '4',
    caseName: 'Garcia - Divorce Proceedings',
    caseNumber: 'CS-2026-004',
    clientName: 'Ana Garcia',
    attorneyId: 'att-2',
    attorneyName: 'Sarah Johnson',
    date: '2026-03-26',
    startTime: '10:00',
    endTime: '14:00',
    durationMinutes: 240,
    description: 'Mediation preparation',
    activityType: 'drafting',
    hourlyRate: 900,
    amount: 3600,
    isBillable: true,
    isBilled: false,
  },
  {
    id: '4',
    caseId: '5',
    caseName: 'R. Singh - Criminal Defense',
    caseNumber: 'CS-2026-005',
    clientName: 'Rajesh Singh',
    attorneyId: 'att-3',
    attorneyName: 'David Singh',
    date: '2026-03-25',
    startTime: '08:00',
    endTime: '13:00',
    durationMinutes: 300,
    description: 'Witness interviews',
    activityType: 'investigation',
    hourlyRate: 800,
    amount: 4000,
    isBillable: true,
    isBilled: false,
  },
  {
    id: '5',
    caseId: '1',
    caseName: 'Smith vs. Johnson Holdings',
    caseNumber: 'CS-2026-001',
    clientName: 'Robert Smith',
    attorneyId: 'att-1',
    attorneyName: 'Dr. James Rodriguez',
    date: '2026-03-24',
    startTime: '09:00',
    endTime: '17:00',
    durationMinutes: 480,
    description: 'Court preparation and filing',
    activityType: 'court',
    hourlyRate: 850,
    amount: 6800,
    isBillable: true,
    isBilled: true,
    invoiceId: 'INV-2026-002',
  },
  {
    id: '6',
    caseId: '2',
    caseName: 'Estate of Williams',
    caseNumber: 'CS-2026-002',
    clientName: 'Williams Family',
    attorneyId: 'att-2',
    attorneyName: 'Sarah Johnson',
    date: '2026-03-23',
    startTime: '14:00',
    endTime: '18:00',
    durationMinutes: 240,
    description: 'Estate document preparation',
    activityType: 'drafting',
    hourlyRate: 900,
    amount: 3600,
    isBillable: true,
    isBilled: true,
    invoiceId: 'INV-2026-001',
  },
];

const COLORS = ['#1E3A5F', '#C4A35A', '#22D3EE', '#34D399', '#EC4899', '#8B5CF6'];

interface BillableHoursReportProps {
  tenantId?: string;
  onExport?: (format: 'pdf' | 'csv' | 'excel') => void;
}

export function BillableHoursReport({
  tenantId = 'demo-tenant',
  onExport,
}: BillableHoursReportProps) {
  const [entries, setEntries] = useState<TimeEntry[]>(mockTimeEntries);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year' | 'custom'>('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedAttorney, setSelectedAttorney] = useState<string>('all');
  const [selectedCase, setSelectedCase] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);

  // Filter entries
  const filteredEntries = useMemo(() => {
    let filtered = [...entries];

    // Date filter
    const now = new Date();
    if (dateRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((e) => new Date(e.date) >= weekAgo);
    } else if (dateRange === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((e) => new Date(e.date) >= monthAgo);
    } else if (dateRange === 'quarter') {
      const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((e) => new Date(e.date) >= quarterAgo);
    } else if (dateRange === 'year') {
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((e) => new Date(e.date) >= yearAgo);
    } else if (dateRange === 'custom' && startDate && endDate) {
      filtered = filtered.filter(
        (e) => new Date(e.date) >= new Date(startDate) && new Date(e.date) <= new Date(endDate)
      );
    }

    // Attorney filter
    if (selectedAttorney !== 'all') {
      filtered = filtered.filter((e) => e.attorneyId === selectedAttorney);
    }

    // Case filter
    if (selectedCase !== 'all') {
      filtered = filtered.filter((e) => e.caseId === selectedCase);
    }

    // Client filter
    if (selectedClient !== 'all') {
      filtered = filtered.filter((e) => e.clientName === selectedClient);
    }

    return filtered;
  }, [entries, dateRange, startDate, endDate, selectedAttorney, selectedCase, selectedClient]);

  // Calculate summary
  const summary: ReportSummary = useMemo(() => {
    const totalMinutes = filteredEntries.reduce((sum, e) => sum + e.durationMinutes, 0);
    const totalAmount = filteredEntries.reduce((sum, e) => sum + e.amount, 0);
    const billableEntries = filteredEntries.filter((e) => e.isBillable);
    const billableMinutes = billableEntries.reduce((sum, e) => sum + e.durationMinutes, 0);
    const billableAmount = billableEntries.reduce((sum, e) => sum + e.amount, 0);
    const unbilledEntries = filteredEntries.filter((e) => e.isBillable && !e.isBilled);
    const unbilledMinutes = unbilledEntries.reduce((sum, e) => sum + e.durationMinutes, 0);
    const unbilledAmount = unbilledEntries.reduce((sum, e) => sum + e.amount, 0);
    const billedEntries = filteredEntries.filter((e) => e.isBilled);
    const billedMinutes = billedEntries.reduce((sum, e) => sum + e.durationMinutes, 0);
    const billedAmount = billedEntries.reduce((sum, e) => sum + e.amount, 0);

    return {
      totalHours: totalMinutes / 60,
      totalAmount,
      billableHours: billableMinutes / 60,
      billableAmount,
      unbilledHours: unbilledMinutes / 60,
      unbilledAmount,
      billedHours: billedMinutes / 60,
      billedAmount,
      averageRate: billableMinutes > 0 ? billableAmount / (billableMinutes / 60) : 0,
      entryCount: filteredEntries.length,
    };
  }, [filteredEntries]);

  // Chart data - by attorney
  const attorneyData = useMemo(() => {
    const byAttorney: Record<string, { name: string; hours: number; amount: number }> = {};
    filteredEntries.forEach((e) => {
      if (!byAttorney[e.attorneyId]) {
        byAttorney[e.attorneyId] = {
          name: e.attorneyName,
          hours: 0,
          amount: 0,
        };
      }
      byAttorney[e.attorneyId].hours += e.durationMinutes / 60;
      byAttorney[e.attorneyId].amount += e.amount;
    });
    return Object.values(byAttorney);
  }, [filteredEntries]);

  // Chart data - by case
  const caseData = useMemo(() => {
    const byCase: Record<string, { name: string; hours: number; amount: number }> = {};
    filteredEntries.forEach((e) => {
      if (!byCase[e.caseId]) {
        byCase[e.caseId] = {
          name: e.caseName,
          hours: 0,
          amount: 0,
        };
      }
      byCase[e.caseId].hours += e.durationMinutes / 60;
      byCase[e.caseId].amount += e.amount;
    });
    return Object.values(byCase).slice(0, 5); // Top 5
  }, [filteredEntries]);

  // Chart data - by activity
  const activityData = useMemo(() => {
    const byActivity: Record<string, { name: string; value: number; hours: number }> = {};
    filteredEntries.forEach((e) => {
      const label = e.activityType.charAt(0).toUpperCase() + e.activityType.slice(1);
      if (!byActivity[e.activityType]) {
        byActivity[e.activityType] = {
          name: label,
          value: 0,
          hours: 0,
        };
      }
      byActivity[e.activityType].value += e.amount;
      byActivity[e.activityType].hours += e.durationMinutes / 60;
    });
    return Object.values(byActivity);
  }, [filteredEntries]);

  // Chart data - daily trend
  const dailyTrendData = useMemo(() => {
    const byDate: Record<string, { date: string; hours: number; amount: number }> = {};
    filteredEntries
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .forEach((e) => {
        if (!byDate[e.date]) {
          byDate[e.date] = {
            date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            hours: 0,
            amount: 0,
          };
        }
        byDate[e.date].hours += e.durationMinutes / 60;
        byDate[e.date].amount += e.amount;
      });
    return Object.values(byDate);
  }, [filteredEntries]);

  // Format duration
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `TT$ ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Get unique values for filters
  const attorneys = [...new Set(entries.map((e) => ({ id: e.attorneyId, name: e.attorneyName })))];
  const cases = [...new Set(entries.map((e) => ({ id: e.caseId, name: e.caseName })))];
  const clients = [...new Set(entries.map((e) => e.clientName))];

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#C4A35A]" />
                Billable Hours Report
              </CardTitle>
              <CardDescription>
                Analyze time entries and billing performance
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <Select value={dateRange} onValueChange={(v: any) => setDateRange(v)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dateRange === 'custom' && (
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-36"
                />
                <span className="text-gray-400">to</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-36"
                />
              </div>
            )}

            <Select value={selectedAttorney} onValueChange={setSelectedAttorney}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Attorneys" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Attorneys</SelectItem>
                {attorneys.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCase} onValueChange={setSelectedCase}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Cases" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cases</SelectItem>
                {cases.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.totalHours.toFixed(1)}h</p>
                <p className="text-xs text-gray-500">Total Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#C4A35A]">
                  {formatCurrency(summary.billableAmount)}
                </p>
                <p className="text-xs text-gray-500">Billable Amount</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.unbilledHours.toFixed(1)}h</p>
                <p className="text-xs text-gray-500">Unbilled Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(summary.averageRate)}/hr</p>
                <p className="text-xs text-gray-500">Avg Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="by-attorney">
            <Users className="w-4 h-4 mr-2" />
            By Attorney
          </TabsTrigger>
          <TabsTrigger value="by-case">
            <Briefcase className="w-4 h-4 mr-2" />
            By Case
          </TabsTrigger>
          <TabsTrigger value="trend">
            <Activity className="w-4 h-4 mr-2" />
            Trend
          </TabsTrigger>
          <TabsTrigger value="details">
            <FileText className="w-4 h-4 mr-2" />
            Details
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Hours by Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Hours by Activity Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={activityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="hours"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {activityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Amount by Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Amount by Activity Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tickFormatter={(v) => `TT$${v / 1000}k`} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Bar dataKey="value" fill="#1E3A5F" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* By Attorney Tab */}
        <TabsContent value="by-attorney">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hours & Revenue by Attorney</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attorneyData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(v) => `${v}h`} />
                  <YAxis type="category" dataKey="name" width={120} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="hours" name="Hours" fill="#1E3A5F" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                {attorneyData.map((att, index) => (
                  <div key={index} className="p-3 rounded-lg bg-gray-50">
                    <p className="font-medium">{att.name}</p>
                    <p className="text-sm text-gray-500">{att.hours.toFixed(1)} hours</p>
                    <p className="text-sm font-semibold text-[#C4A35A]">{formatCurrency(att.amount)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* By Case Tab */}
        <TabsContent value="by-case">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Cases by Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={caseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis tickFormatter={(v) => `${v}h`} />
                  <Tooltip formatter={(v: number) => `${v.toFixed(1)} hours`} />
                  <Bar dataKey="hours" name="Hours" fill="#C4A35A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Case</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {caseData.map((c, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell>{c.hours.toFixed(1)}h</TableCell>
                        <TableCell className="text-[#C4A35A]">{formatCurrency(c.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trend Tab */}
        <TabsContent value="trend">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Daily Hours Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(v) => `${v}h`} />
                  <Tooltip formatter={(v: number) => `${v.toFixed(1)} hours`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="hours"
                    name="Hours"
                    stroke="#1E3A5F"
                    strokeWidth={2}
                    dot={{ fill: '#1E3A5F', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Time Entries Detail</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Case</TableHead>
                      <TableHead>Attorney</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntries.map((entry) => (
                      <TableRow
                        key={entry.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => {
                          setSelectedEntry(entry);
                          setShowDetailDialog(true);
                        }}
                      >
                        <TableCell className="text-sm">{entry.date}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{entry.caseName}</p>
                            <p className="text-xs text-gray-500">{entry.clientName}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{entry.attorneyName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {entry.activityType}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {formatDuration(entry.durationMinutes)}
                        </TableCell>
                        <TableCell className="text-sm">TT${entry.hourlyRate}</TableCell>
                        <TableCell className="font-medium text-[#C4A35A]">
                          {formatCurrency(entry.amount)}
                        </TableCell>
                        <TableCell>
                          {entry.isBilled ? (
                            <Badge className="bg-green-100 text-green-700">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Billed
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-700">
                              <Clock className="w-3 h-3 mr-1" />
                              Unbilled
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Entry Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Time Entry Details</DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Case</p>
                  <p className="font-medium">{selectedEntry.caseName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Client</p>
                  <p className="font-medium">{selectedEntry.clientName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="font-medium">{selectedEntry.date}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="font-medium">{formatDuration(selectedEntry.durationMinutes)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Attorney</p>
                  <p className="font-medium">{selectedEntry.attorneyName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Amount</p>
                  <p className="font-medium text-[#C4A35A]">{formatCurrency(selectedEntry.amount)}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500">Description</p>
                <p className="font-medium">{selectedEntry.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default BillableHoursReport;
