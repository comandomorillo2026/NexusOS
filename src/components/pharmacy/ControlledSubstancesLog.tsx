'use client';

import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  FileText,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  User,
  Building,
  Phone,
  Hash,
  Trash2,
  Edit,
  Eye,
  Download,
  Filter,
  AlertCircle,
  Lock,
  Unlock,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// DEA Schedule configurations
const deaSchedules = {
  'II': {
    label: 'Schedule II',
    color: 'bg-red-500/20 text-red-300 border-red-500/30',
    description: 'High potential for abuse. No refills permitted.',
    examples: 'Oxycodone, Fentanyl, Adderall, Ritalin'
  },
  'III': {
    label: 'Schedule III',
    color: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    description: 'Moderate abuse potential. Up to 5 refills in 6 months.',
    examples: 'Testosterone, Ketamine, Suboxone'
  },
  'IV': {
    label: 'Schedule IV',
    color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    description: 'Low abuse potential. Up to 5 refills in 6 months.',
    examples: 'Alprazolam, Diazepam, Zolpidem'
  },
  'V': {
    label: 'Schedule V',
    color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    description: 'Lowest abuse potential. Some OTC in certain jurisdictions.',
    examples: 'Promethazine w/ Codeine, Pregabalin'
  }
};

// Mock controlled substance inventory
const mockInventory = [
  { id: '1', ndc: '00406-0512-01', drugName: 'Oxycodone 10mg', deaSchedule: 'II', onHand: 250, vaultLocation: 'A1', lastCount: '2024-01-15', status: 'balanced' },
  { id: '2', ndc: '00591-5631-01', drugName: 'Fentanyl 25mcg/hr Patch', deaSchedule: 'II', onHand: 48, vaultLocation: 'A2', lastCount: '2024-01-15', status: 'balanced' },
  { id: '3', ndc: '54092-0383-01', drugName: 'Alprazolam 1mg', deaSchedule: 'IV', onHand: 500, vaultLocation: 'B1', lastCount: '2024-01-15', status: 'balanced' },
  { id: '4', ndc: '00115-1721-01', drugName: 'Methylphenidate 20mg', deaSchedule: 'II', onHand: 180, vaultLocation: 'A3', lastCount: '2024-01-15', status: 'discrepancy' },
  { id: '5', ndc: '00591-0873-01', drugName: 'Diazepam 5mg', deaSchedule: 'IV', onHand: 320, vaultLocation: 'B2', lastCount: '2024-01-15', status: 'balanced' },
  { id: '6', ndc: '00406-8813-01', drugName: 'Hydrocodone 10/325mg', deaSchedule: 'II', onHand: 380, vaultLocation: 'A4', lastCount: '2024-01-15', status: 'balanced' },
  { id: '7', ndc: '00574-0155-01', drugName: 'Testosterone Cypionate 200mg/mL', deaSchedule: 'III', onHand: 25, vaultLocation: 'C1', lastCount: '2024-01-15', status: 'balanced' },
];

// Mock DEA log entries
const mockDeaLog = [
  {
    id: '1',
    date: '2024-01-15',
    time: '09:30',
    transactionType: 'received',
    drugName: 'Oxycodone 10mg',
    ndc: '00406-0512-01',
    deaSchedule: 'II',
    quantity: 100,
    supplier: 'McKesson Corp',
    supplierDea: 'MJ1234567',
    invoiceNumber: 'INV-2024-001234',
    receivedBy: 'John Smith, RPh',
    verifiedBy: 'Sarah Johnson, RPh',
    runningBalance: 250,
    notes: 'Monthly order received',
  },
  {
    id: '2',
    date: '2024-01-15',
    time: '10:15',
    transactionType: 'dispensed',
    drugName: 'Oxycodone 10mg',
    ndc: '00406-0512-01',
    deaSchedule: 'II',
    quantity: 30,
    patientName: 'Maria Garcia',
    prescriptionNumber: 'RX-2024-001234',
    prescriber: 'Dr. James Wilson',
    prescriberDea: 'AW9876543',
    dispensedBy: 'John Smith, RPh',
    runningBalance: 220,
    notes: '',
  },
  {
    id: '3',
    date: '2024-01-15',
    time: '11:00',
    transactionType: 'dispensed',
    drugName: 'Alprazolam 1mg',
    ndc: '54092-0383-01',
    deaSchedule: 'IV',
    quantity: 30,
    patientName: 'Carlos Rodriguez',
    prescriptionNumber: 'RX-2024-001235',
    prescriber: 'Dr. Sarah Chen',
    prescriberDea: 'SC1234567',
    dispensedBy: 'John Smith, RPh',
    runningBalance: 470,
    notes: '',
  },
  {
    id: '4',
    date: '2024-01-15',
    time: '14:30',
    transactionType: 'dispensed',
    drugName: 'Hydrocodone 10/325mg',
    ndc: '00406-8813-01',
    deaSchedule: 'II',
    quantity: 60,
    patientName: 'Ana Martinez',
    prescriptionNumber: 'RX-2024-001236',
    prescriber: 'Dr. Michael Brown',
    prescriberDea: 'MB7654321',
    dispensedBy: 'Sarah Johnson, RPh',
    runningBalance: 320,
    notes: 'Partial fill - remaining 30 due in 3 days',
  },
  {
    id: '5',
    date: '2024-01-14',
    time: '16:00',
    transactionType: 'destroyed',
    drugName: 'Fentanyl 25mcg/hr Patch',
    ndc: '00591-5631-01',
    deaSchedule: 'II',
    quantity: 2,
    reason: 'Expired - Beyond use date',
    destructionMethod: 'Incineration',
    witnessedBy: 'John Smith, RPh, Sarah Johnson, RPh',
    authorizedBy: 'Pharmacy Board TT',
    runningBalance: 48,
    notes: 'Witnessed destruction as per TT Pharmacy Board regulations',
  },
];

// Mock discrepancy reports
const mockDiscrepancies = [
  {
    id: '1',
    date: '2024-01-15',
    drugName: 'Methylphenidate 20mg',
    expected: 185,
    actual: 180,
    discrepancy: 5,
    status: 'investigating',
    reportedBy: 'Sarah Johnson, RPh',
    notes: 'Daily count revealed 5 tablets short. Reviewing dispensing logs.',
  },
];

interface LogEntry {
  id: string;
  date: string;
  time: string;
  transactionType: string;
  drugName: string;
  ndc: string;
  deaSchedule: string;
  quantity: number;
  runningBalance: number;
  notes?: string;
  [key: string]: unknown; // For additional fields
}

const transactionTypeConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  received: { label: 'Received', color: 'bg-emerald-500/20 text-emerald-300', icon: <TrendingUp className="w-4 h-4" /> },
  dispensed: { label: 'Dispensed', color: 'bg-blue-500/20 text-blue-300', icon: <Minus className="w-4 h-4" /> },
  destroyed: { label: 'Destroyed', color: 'bg-red-500/20 text-red-300', icon: <Trash2 className="w-4 h-4" /> },
  returned: { label: 'Returned', color: 'bg-orange-500/20 text-orange-300', icon: <TrendingDown className="w-4 h-4" /> },
  transfer_in: { label: 'Transfer In', color: 'bg-purple-500/20 text-purple-300', icon: <TrendingUp className="w-4 h-4" /> },
  transfer_out: { label: 'Transfer Out', color: 'bg-pink-500/20 text-pink-300', icon: <TrendingDown className="w-4 h-4" /> },
  adjustment: { label: 'Adjustment', color: 'bg-yellow-500/20 text-yellow-300', icon: <Edit className="w-4 h-4" /> },
};

export default function ControlledSubstancesLog() {
  const [activeTab, setActiveTab] = useState('log');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState('all');
  const [selectedEntry, setSelectedEntry] = useState<LogEntry | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showNewEntry, setShowNewEntry] = useState(false);

  // Filter log entries
  const filteredLog = useMemo(() => {
    return mockDeaLog.filter(entry => {
      const matchesSearch =
        entry.drugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.ndc.includes(searchTerm) ||
        (entry.patientName && entry.patientName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesSchedule = selectedSchedule === 'all' || entry.deaSchedule === selectedSchedule;
      return matchesSearch && matchesSchedule;
    });
  }, [searchTerm, selectedSchedule]);

  // Calculate stats
  const stats = useMemo(() => {
    const scheduleII = mockInventory.filter(i => i.deaSchedule === 'II');
    const scheduleIII = mockInventory.filter(i => i.deaSchedule === 'III');
    const scheduleIV = mockInventory.filter(i => i.deaSchedule === 'IV');
    const discrepancies = mockInventory.filter(i => i.status === 'discrepancy');
    
    return {
      scheduleIICount: scheduleII.length,
      scheduleIIITotal: scheduleIII.reduce((sum, i) => sum + i.onHand, 0),
      scheduleIVTotal: scheduleIV.reduce((sum, i) => sum + i.onHand, 0),
      discrepancies: discrepancies.length,
      todayTransactions: mockDeaLog.filter(l => l.date === '2024-01-15').length,
    };
  }, []);

  // View entry details
  const viewEntryDetails = (entry: LogEntry) => {
    setSelectedEntry(entry);
    setShowDetails(true);
  };

  return (
    <div className="min-h-screen bg-[#050410] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
            Controlled Substances Log
          </h1>
          <p className="text-red-400/70 text-sm mt-1">
            DEA-compliant tracking for Schedule II-V drugs | TT Pharmacy Board Regulations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-red-500/30 text-red-400">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={() => setShowNewEntry(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Entry
          </Button>
        </div>
      </div>

      {/* DEA Schedule Legend */}
      <Card className="bg-[rgba(239,68,68,0.03)] border-[rgba(239,68,68,0.15)] mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(deaSchedules).map(([key, schedule]) => (
              <div key={key} className={`p-3 rounded-lg border ${schedule.color}`}>
                <p className="font-medium">{schedule.label}</p>
                <p className="text-xs mt-1 opacity-70">{schedule.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="bg-[rgba(239,68,68,0.05)] border-[rgba(239,68,68,0.2)]">
          <CardContent className="p-4 text-center">
            <Lock className="w-5 h-5 text-red-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.scheduleIICount}</p>
            <p className="text-xs text-red-400/70">Schedule II Items</p>
          </CardContent>
        </Card>
        <Card className="bg-[rgba(249,115,22,0.05)] border-[rgba(249,115,22,0.2)]">
          <CardContent className="p-4 text-center">
            <Activity className="w-5 h-5 text-orange-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.scheduleIIITotal}</p>
            <p className="text-xs text-orange-400/70">Schedule III Units</p>
          </CardContent>
        </Card>
        <Card className="bg-[rgba(234,179,8,0.05)] border-[rgba(234,179,8,0.2)]">
          <CardContent className="p-4 text-center">
            <Unlock className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.scheduleIVTotal}</p>
            <p className="text-xs text-yellow-400/70">Schedule IV Units</p>
          </CardContent>
        </Card>
        <Card className="bg-[rgba(239,68,68,0.05)] border-[rgba(239,68,68,0.2)]">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-5 h-5 text-red-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-400">{stats.discrepancies}</p>
            <p className="text-xs text-red-400/70">Discrepancies</p>
          </CardContent>
        </Card>
        <Card className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)]">
          <CardContent className="p-4 text-center">
            <FileText className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.todayTransactions}</p>
            <p className="text-xs text-emerald-400/70">Today&apos;s Transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[rgba(239,68,68,0.1)] mb-4">
          <TabsTrigger value="log" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
            Transaction Log
          </TabsTrigger>
          <TabsTrigger value="inventory" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
            Vault Inventory
          </TabsTrigger>
          <TabsTrigger value="discrepancies" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
            Discrepancies
          </TabsTrigger>
          <TabsTrigger value="destruction" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
            Destruction Records
          </TabsTrigger>
        </TabsList>

        {/* Transaction Log Tab */}
        <TabsContent value="log">
          <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
            <CardHeader className="border-b border-[rgba(16,185,129,0.1)]">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-red-400" />
                  DEA Transaction Log
                </CardTitle>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                    <Input
                      placeholder="Search drug, NDC, patient..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64 bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white placeholder:text-white/40"
                    />
                  </div>
                  <Select value={selectedSchedule} onValueChange={setSelectedSchedule}>
                    <SelectTrigger className="w-40 bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white">
                      <SelectValue placeholder="All Schedules" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Schedules</SelectItem>
                      <SelectItem value="II">Schedule II</SelectItem>
                      <SelectItem value="III">Schedule III</SelectItem>
                      <SelectItem value="IV">Schedule IV</SelectItem>
                      <SelectItem value="V">Schedule V</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-[rgba(16,185,129,0.1)] hover:bg-transparent">
                      <TableHead className="text-white/60 text-xs">Date/Time</TableHead>
                      <TableHead className="text-white/60 text-xs">Type</TableHead>
                      <TableHead className="text-white/60 text-xs">Drug (NDC)</TableHead>
                      <TableHead className="text-white/60 text-xs">Schedule</TableHead>
                      <TableHead className="text-white/60 text-xs">Qty</TableHead>
                      <TableHead className="text-white/60 text-xs">Balance</TableHead>
                      <TableHead className="text-white/60 text-xs">Details</TableHead>
                      <TableHead className="text-white/60 text-xs w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLog.map((entry) => (
                      <TableRow key={entry.id} className="border-b border-[rgba(16,185,129,0.05)] hover:bg-[rgba(16,185,129,0.02)]">
                        <TableCell className="text-white text-sm">
                          <div>
                            <p>{entry.date}</p>
                            <p className="text-white/50 text-xs">{entry.time}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={transactionTypeConfig[entry.transactionType]?.color || 'bg-gray-500/20'}>
                            <span className="flex items-center gap-1">
                              {transactionTypeConfig[entry.transactionType]?.icon}
                              {transactionTypeConfig[entry.transactionType]?.label}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white text-sm">
                          <div>
                            <p>{entry.drugName}</p>
                            <p className="text-white/50 text-xs font-mono">{entry.ndc}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={deaSchedules[entry.deaSchedule as keyof typeof deaSchedules]?.color || 'bg-gray-500/20'}>
                            {entry.deaSchedule}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white font-mono">
                          {entry.transactionType === 'received' || entry.transactionType === 'transfer_in' ? (
                            <span className="text-emerald-400">+{entry.quantity}</span>
                          ) : (
                            <span className="text-red-400">-{entry.quantity}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-white font-mono">{entry.runningBalance}</TableCell>
                        <TableCell className="text-white/60 text-xs max-w-[200px] truncate">
                          {entry.patientName || entry.supplier || entry.reason}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-[#10B981] hover:text-white hover:bg-[rgba(16,185,129,0.1)]"
                            onClick={() => viewEntryDetails(entry)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vault Inventory Tab */}
        <TabsContent value="inventory">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Inventory List */}
            <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
              <CardHeader className="border-b border-[rgba(16,185,129,0.1)]">
                <CardTitle className="text-white flex items-center gap-2">
                  <Lock className="w-5 h-5 text-red-400" />
                  Vault Inventory
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {mockInventory.map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 rounded-lg border ${
                          item.status === 'discrepancy'
                            ? 'bg-red-500/5 border-red-500/20'
                            : 'bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.1)]'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-white font-medium">{item.drugName}</p>
                            <p className="text-white/50 text-xs font-mono">{item.ndc}</p>
                          </div>
                          <Badge className={deaSchedules[item.deaSchedule as keyof typeof deaSchedules]?.color}>
                            {item.deaSchedule}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div>
                            <span className="text-white/60">On Hand: </span>
                            <span className="text-white font-mono">{item.onHand}</span>
                          </div>
                          <div>
                            <span className="text-white/60">Location: </span>
                            <span className="text-white">{item.vaultLocation}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-white/40 text-xs">Last Count: {item.lastCount}</span>
                          {item.status === 'discrepancy' ? (
                            <Badge className="bg-red-500/20 text-red-300">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Discrepancy
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-500/20 text-emerald-300">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Balanced
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Count Sheet */}
            <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
              <CardHeader className="border-b border-[rgba(16,185,129,0.1)]">
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#10B981]" />
                  Record Count
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-white/60 uppercase mb-2 block">Select Drug</label>
                    <Select>
                      <SelectTrigger className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white">
                        <SelectValue placeholder="Select controlled substance" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockInventory.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.drugName} ({item.deaSchedule})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-white/60 uppercase mb-2 block">Expected Count</label>
                      <Input
                        className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white"
                        value="250"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/60 uppercase mb-2 block">Actual Count</label>
                      <Input
                        type="number"
                        className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white"
                        placeholder="Enter count"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-white/60 uppercase mb-2 block">Counted By</label>
                    <Input
                      className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white"
                      placeholder="Pharmacist name, license"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/60 uppercase mb-2 block">Notes</label>
                    <Textarea
                      className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white"
                      placeholder="Notes or discrepancy explanation..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-[#10B981] hover:bg-[#10B981]/80 text-white">
                      Record Count
                    </Button>
                    <Button variant="outline" className="border-red-500/30 text-red-400">
                      Report Discrepancy
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Discrepancies Tab */}
        <TabsContent value="discrepancies">
          <Card className="bg-[rgba(239,68,68,0.03)] border-[rgba(239,68,68,0.15)]">
            <CardHeader className="border-b border-[rgba(239,68,68,0.1)]">
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Discrepancy Reports
                <Badge className="bg-red-500 text-white ml-2">{mockDiscrepancies.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {mockDiscrepancies.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                  <p className="text-emerald-400 font-medium">No Active Discrepancies</p>
                  <p className="text-white/40 text-sm mt-2">All controlled substance counts are balanced.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {mockDiscrepancies.map((discrepancy) => (
                    <div
                      key={discrepancy.id}
                      className="p-4 rounded-lg bg-red-500/5 border border-red-500/20"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-white font-medium">{discrepancy.drugName}</p>
                          <p className="text-white/50 text-sm">{discrepancy.date}</p>
                        </div>
                        <Badge className="bg-orange-500/20 text-orange-300">
                          {discrepancy.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                        <div>
                          <p className="text-white/40 text-xs">Expected</p>
                          <p className="text-white font-mono">{discrepancy.expected}</p>
                        </div>
                        <div>
                          <p className="text-white/40 text-xs">Actual</p>
                          <p className="text-white font-mono">{discrepancy.actual}</p>
                        </div>
                        <div>
                          <p className="text-white/40 text-xs">Discrepancy</p>
                          <p className="text-red-400 font-mono font-bold">-{discrepancy.discrepancy}</p>
                        </div>
                      </div>
                      <p className="text-white/60 text-sm">{discrepancy.notes}</p>
                      <p className="text-white/40 text-xs mt-2">Reported by: {discrepancy.reportedBy}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Destruction Records Tab */}
        <TabsContent value="destruction">
          <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
            <CardHeader className="border-b border-[rgba(16,185,129,0.1)]">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-red-400" />
                  Destruction Records
                </CardTitle>
                <Button className="bg-red-500 hover:bg-red-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Record Destruction
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {mockDeaLog.filter(l => l.transactionType === 'destroyed').map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 rounded-lg bg-red-500/5 border border-red-500/20"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-white font-medium">{entry.drugName}</p>
                        <p className="text-white/50 text-xs font-mono">{entry.ndc}</p>
                      </div>
                      <Badge className="bg-red-500/20 text-red-300">
                        DESTROYED
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                      <div>
                        <p className="text-white/40 text-xs">Quantity Destroyed</p>
                        <p className="text-white font-mono">{entry.quantity} units</p>
                      </div>
                      <div>
                        <p className="text-white/40 text-xs">Method</p>
                        <p className="text-white">{entry.destructionMethod}</p>
                      </div>
                      <div>
                        <p className="text-white/40 text-xs">Witnessed By</p>
                        <p className="text-white text-xs">{entry.witnessedBy}</p>
                      </div>
                      <div>
                        <p className="text-white/40 text-xs">Authorized By</p>
                        <p className="text-white text-xs">{entry.authorizedBy}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <Calendar className="w-3 h-3" />
                      {entry.date} at {entry.time}
                    </div>
                    <p className="text-white/60 text-sm mt-2">{entry.notes}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Entry Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="bg-[#0A0820] border-[rgba(16,185,129,0.2)] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#10B981]" />
              Transaction Details
            </DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2">
                <Badge className={transactionTypeConfig[selectedEntry.transactionType]?.color}>
                  {transactionTypeConfig[selectedEntry.transactionType]?.label}
                </Badge>
                <Badge className={deaSchedules[selectedEntry.deaSchedule as keyof typeof deaSchedules]?.color}>
                  Schedule {selectedEntry.deaSchedule}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.1)]">
                  <p className="text-xs text-white/40 uppercase mb-1">Drug</p>
                  <p className="text-white">{selectedEntry.drugName}</p>
                  <p className="text-white/50 text-xs font-mono">{selectedEntry.ndc}</p>
                </div>
                <div className="p-3 rounded-lg bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.1)]">
                  <p className="text-xs text-white/40 uppercase mb-1">Date/Time</p>
                  <p className="text-white">{selectedEntry.date}</p>
                  <p className="text-white/50 text-xs">{selectedEntry.time}</p>
                </div>
                <div className="p-3 rounded-lg bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.1)]">
                  <p className="text-xs text-white/40 uppercase mb-1">Quantity</p>
                  <p className="text-white font-mono text-xl">{selectedEntry.quantity}</p>
                </div>
                <div className="p-3 rounded-lg bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.1)]">
                  <p className="text-xs text-white/40 uppercase mb-1">Running Balance</p>
                  <p className="text-white font-mono text-xl">{selectedEntry.runningBalance}</p>
                </div>
              </div>

              {/* Transaction-specific details */}
              {selectedEntry.transactionType === 'received' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-white/40 uppercase mb-1">Supplier</p>
                    <p className="text-white">{selectedEntry.supplier}</p>
                    <p className="text-white/50 text-xs">DEA: {selectedEntry.supplierDea}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase mb-1">Invoice</p>
                    <p className="text-white">{selectedEntry.invoiceNumber}</p>
                  </div>
                </div>
              )}

              {selectedEntry.transactionType === 'dispensed' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-white/40 uppercase mb-1">Patient</p>
                    <p className="text-white">{selectedEntry.patientName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase mb-1">Prescription</p>
                    <p className="text-white font-mono">{selectedEntry.prescriptionNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase mb-1">Prescriber</p>
                    <p className="text-white">{selectedEntry.prescriber}</p>
                    <p className="text-white/50 text-xs">DEA: {selectedEntry.prescriberDea}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase mb-1">Dispensed By</p>
                    <p className="text-white">{selectedEntry.dispensedBy}</p>
                  </div>
                </div>
              )}

              {selectedEntry.notes && (
                <div className="p-3 rounded-lg bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.1)]">
                  <p className="text-xs text-white/40 uppercase mb-1">Notes</p>
                  <p className="text-white text-sm">{selectedEntry.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="border-[rgba(16,185,129,0.3)] text-[#10B981]" onClick={() => setShowDetails(false)}>
              Close
            </Button>
            <Button className="bg-[#10B981] hover:bg-[#10B981]/80 text-white">
              <Download className="w-4 h-4 mr-2" />
              Print Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Entry Dialog */}
      <Dialog open={showNewEntry} onOpenChange={setShowNewEntry}>
        <DialogContent className="bg-[#0A0820] border-[rgba(16,185,129,0.2)] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#10B981]" />
              New Controlled Substance Entry
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/40 uppercase mb-2 block">Transaction Type</label>
                <Select>
                  <SelectTrigger className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="dispensed">Dispensed</SelectItem>
                    <SelectItem value="destroyed">Destroyed</SelectItem>
                    <SelectItem value="returned">Returned to Supplier</SelectItem>
                    <SelectItem value="transfer_in">Transfer In</SelectItem>
                    <SelectItem value="transfer_out">Transfer Out</SelectItem>
                    <SelectItem value="adjustment">Adjustment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-white/40 uppercase mb-2 block">Drug</label>
                <Select>
                  <SelectTrigger className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white">
                    <SelectValue placeholder="Select drug" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockInventory.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.drugName} (Schedule {item.deaSchedule})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-white/40 uppercase mb-2 block">Quantity</label>
                <Input
                  type="number"
                  className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white"
                  placeholder="Enter quantity"
                />
              </div>
              <div>
                <label className="text-xs text-white/40 uppercase mb-2 block">Performed By</label>
                <Input
                  className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white"
                  placeholder="Pharmacist name, RPh"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase mb-2 block">Notes/Reference</label>
              <Textarea
                className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white"
                placeholder="Invoice #, Prescription #, or notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-[rgba(16,185,129,0.3)] text-[#10B981]" onClick={() => setShowNewEntry(false)}>
              Cancel
            </Button>
            <Button className="bg-red-500 hover:bg-red-600 text-white">
              Record Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
