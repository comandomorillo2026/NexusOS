'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  MoreHorizontal,
  FileText,
  DollarSign,
  Calendar,
  User,
  Briefcase,
  Filter,
  Download,
  Send,
  Eye,
  MessageSquare,
  AlertCircle,
  Check,
  ArrowRight,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
} from 'lucide-react';
import { TimeEntryForm, TimeEntryData } from './TimeEntryForm';

// Types
interface TimeEntry {
  id: string;
  caseId: string;
  caseNumber: string;
  caseName: string;
  clientName: string;
  attorneyId: string;
  attorneyName: string;
  date: string;
  startTime: string;
  endTime: string | null;
  durationMinutes: number;
  description: string;
  activityCode: string;
  rate: number;
  amount: number;
  isBillable: boolean;
  isBilled: boolean;
  invoiceId: string | null;
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  approvalNotes: string | null;
  isAutoCaptured: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TimeEntryReviewProps {
  tenantId?: string;
  userId?: string;
  userRole?: 'attorney' | 'partner' | 'admin';
  onConvertToInvoice?: (entryIds: string[]) => void;
}

// Activity code colors
const activityCodeColors: Record<string, string> = {
  research: 'bg-blue-100 text-blue-700',
  drafting: 'bg-purple-100 text-purple-700',
  meeting: 'bg-green-100 text-green-700',
  court: 'bg-red-100 text-red-700',
  calls: 'bg-yellow-100 text-yellow-700',
  review: 'bg-indigo-100 text-indigo-700',
  investigation: 'bg-orange-100 text-orange-700',
  negotiation: 'bg-teal-100 text-teal-700',
  consultation: 'bg-pink-100 text-pink-700',
  general: 'bg-gray-100 text-gray-700',
};

const activityCodeLabels: Record<string, string> = {
  research: 'Legal Research',
  drafting: 'Document Drafting',
  meeting: 'Client Meeting',
  court: 'Court Appearance',
  calls: 'Phone Calls',
  review: 'Document Review',
  investigation: 'Investigation',
  negotiation: 'Negotiation',
  consultation: 'Consultation',
  general: 'General Work',
};

// Mock time entries for demo
const mockTimeEntries: TimeEntry[] = [
  {
    id: '1',
    caseId: 'case-1',
    caseNumber: 'CS-2026-001',
    caseName: 'Smith vs. Johnson Holdings',
    clientName: 'Robert Smith',
    attorneyId: 'atty-1',
    attorneyName: 'Dr. James Rodriguez',
    date: '2026-03-27',
    startTime: '09:00',
    endTime: '12:30',
    durationMinutes: 210,
    description: 'Document review and legal research for settlement negotiations',
    activityCode: 'research',
    rate: 850,
    amount: 2975,
    isBillable: true,
    isBilled: false,
    invoiceId: null,
    approvalStatus: 'pending',
    approvalNotes: null,
    isAutoCaptured: true,
    createdAt: '2026-03-27T09:00:00Z',
    updatedAt: '2026-03-27T12:30:00Z',
  },
  {
    id: '2',
    caseId: 'case-3',
    caseNumber: 'CS-2026-003',
    caseName: 'TT Corp Contract Dispute',
    clientName: 'TT Corporation Ltd.',
    attorneyId: 'atty-1',
    attorneyName: 'Dr. James Rodriguez',
    date: '2026-03-27',
    startTime: '14:00',
    endTime: '16:00',
    durationMinutes: 120,
    description: 'Client meeting - strategy discussion',
    activityCode: 'meeting',
    rate: 1200,
    amount: 2400,
    isBillable: true,
    isBilled: false,
    invoiceId: null,
    approvalStatus: 'pending',
    approvalNotes: null,
    isAutoCaptured: true,
    createdAt: '2026-03-27T14:00:00Z',
    updatedAt: '2026-03-27T16:00:00Z',
  },
  {
    id: '3',
    caseId: 'case-4',
    caseNumber: 'CS-2026-004',
    caseName: 'Garcia - Divorce Proceedings',
    clientName: 'Ana Garcia',
    attorneyId: 'atty-2',
    attorneyName: 'Sarah Johnson',
    date: '2026-03-26',
    startTime: '10:00',
    endTime: '14:00',
    durationMinutes: 240,
    description: 'Mediation preparation and document drafting',
    activityCode: 'drafting',
    rate: 900,
    amount: 3600,
    isBillable: true,
    isBilled: false,
    invoiceId: null,
    approvalStatus: 'approved',
    approvalNotes: 'Excellent work on the mediation brief.',
    isAutoCaptured: true,
    createdAt: '2026-03-26T10:00:00Z',
    updatedAt: '2026-03-26T14:00:00Z',
  },
  {
    id: '4',
    caseId: 'case-5',
    caseNumber: 'CS-2026-005',
    caseName: 'R. Singh - Criminal Defense',
    clientName: 'Rajesh Singh',
    attorneyId: 'atty-3',
    attorneyName: 'David Singh',
    date: '2026-03-25',
    startTime: '08:00',
    endTime: '13:00',
    durationMinutes: 300,
    description: 'Witness interviews and evidence review',
    activityCode: 'investigation',
    rate: 800,
    amount: 4000,
    isBillable: true,
    isBilled: false,
    invoiceId: null,
    approvalStatus: 'needs_revision',
    approvalNotes: 'Please add more detail about witness interviews.',
    isAutoCaptured: false,
    createdAt: '2026-03-25T08:00:00Z',
    updatedAt: '2026-03-25T13:00:00Z',
  },
  {
    id: '5',
    caseId: 'case-1',
    caseNumber: 'CS-2026-001',
    caseName: 'Smith vs. Johnson Holdings',
    clientName: 'Robert Smith',
    attorneyId: 'atty-1',
    attorneyName: 'Dr. James Rodriguez',
    date: '2026-03-24',
    startTime: '09:00',
    endTime: '17:00',
    durationMinutes: 480,
    description: 'Court preparation and filing',
    activityCode: 'court',
    rate: 850,
    amount: 6800,
    isBillable: true,
    isBilled: true,
    invoiceId: 'INV-2026-002',
    approvalStatus: 'approved',
    approvalNotes: null,
    isAutoCaptured: false,
    createdAt: '2026-03-24T09:00:00Z',
    updatedAt: '2026-03-24T17:00:00Z',
  },
];

export function TimeEntryReview({
  tenantId = 'demo-tenant',
  userId = 'demo-user',
  userRole = 'partner',
  onConvertToInvoice,
}: TimeEntryReviewProps) {
  const [entries, setEntries] = useState<TimeEntry[]>(mockTimeEntries);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterBillable, setFilterBillable] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editEntry, setEditEntry] = useState<TimeEntry | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [entryToProcess, setEntryToProcess] = useState<string | null>(null);
  const [showLedesExport, setShowLedesExport] = useState(false);

  // Load entries from API
  const loadEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/lawfirm/time?tenantId=${tenantId}&billed=false`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setEntries(data.data);
        }
      }
    } catch (error) {
      console.error('Error loading time entries:', error);
      // Keep mock data on error
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  // Filter entries
  const filteredEntries = entries.filter((entry) => {
    const matchesStatus =
      filterStatus === 'all' || entry.approvalStatus === filterStatus;
    const matchesBillable =
      filterBillable === 'all' ||
      (filterBillable === 'billable' && entry.isBillable) ||
      (filterBillable === 'nonbillable' && !entry.isBillable);
    const matchesSearch =
      searchQuery === '' ||
      entry.caseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesBillable && matchesSearch;
  });

  // Calculate totals
  const selectedTotal = entries
    .filter((e) => selectedEntries.includes(e.id))
    .reduce((sum, e) => sum + e.amount, 0);
  const pendingTotal = entries
    .filter((e) => e.approvalStatus === 'pending')
    .reduce((sum, e) => sum + e.amount, 0);
  const approvedTotal = entries
    .filter((e) => e.approvalStatus === 'approved' && !e.isBilled)
    .reduce((sum, e) => sum + e.amount, 0);

  // Handle select entry
  const toggleSelectEntry = (id: string) => {
    setSelectedEntries((prev) =>
      prev.includes(id) ? prev.filter((eid) => eid !== id) : [...prev, id]
    );
  };

  // Handle select all
  const toggleSelectAll = () => {
    if (selectedEntries.length === filteredEntries.length) {
      setSelectedEntries([]);
    } else {
      setSelectedEntries(filteredEntries.map((e) => e.id));
    }
  };

  // Handle approve
  const handleApprove = async (entryId: string) => {
    try {
      const response = await fetch('/api/lawfirm/time/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          timeEntryId: entryId,
          status: 'approved',
          notes: approvalNotes,
          reviewedBy: userId,
        }),
      });

      if (response.ok) {
        setEntries((prev) =>
          prev.map((e) =>
            e.id === entryId
              ? { ...e, approvalStatus: 'approved', approvalNotes }
              : e
          )
        );
      }
    } catch (error) {
      console.error('Error approving entry:', error);
    } finally {
      setShowApproveDialog(false);
      setApprovalNotes('');
      setEntryToProcess(null);
    }
  };

  // Handle reject
  const handleReject = async (entryId: string) => {
    try {
      const response = await fetch('/api/lawfirm/time/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          timeEntryId: entryId,
          status: 'rejected',
          notes: approvalNotes,
          reviewedBy: userId,
        }),
      });

      if (response.ok) {
        setEntries((prev) =>
          prev.map((e) =>
            e.id === entryId
              ? { ...e, approvalStatus: 'rejected', approvalNotes }
              : e
          )
        );
      }
    } catch (error) {
      console.error('Error rejecting entry:', error);
    } finally {
      setShowRejectDialog(false);
      setApprovalNotes('');
      setEntryToProcess(null);
    }
  };

  // Handle bulk approve
  const handleBulkApprove = async () => {
    for (const entryId of selectedEntries) {
      await handleApprove(entryId);
    }
    setSelectedEntries([]);
  };

  // Handle toggle billable
  const handleToggleBillable = async (entryId: string) => {
    try {
      const entry = entries.find((e) => e.id === entryId);
      if (!entry) return;

      const response = await fetch('/api/lawfirm/time', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          timeEntryId: entryId,
          isBillable: !entry.isBillable,
        }),
      });

      if (response.ok) {
        setEntries((prev) =>
          prev.map((e) =>
            e.id === entryId
              ? {
                  ...e,
                  isBillable: !e.isBillable,
                  amount: !e.isBillable ? e.amount : 0,
                }
              : e
          )
        );
      }
    } catch (error) {
      console.error('Error toggling billable:', error);
    }
  };

  // Handle convert to invoice
  const handleConvertToInvoice = () => {
    if (onConvertToInvoice) {
      onConvertToInvoice(selectedEntries);
    }
    setSelectedEntries([]);
  };

  // Export to LEDES
  const exportToLedes = async () => {
    try {
      const response = await fetch('/api/lawfirm/time/ledes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          timeEntryIds: selectedEntries,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `LEDES_export_${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting to LEDES:', error);
    }
    setShowLedesExport(false);
  };

  // Format duration
  const formatDuration = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins}m`;
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-700">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-700">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-700">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      case 'needs_revision':
        return (
          <Badge className="bg-orange-100 text-orange-700">
            <AlertCircle className="w-3 h-3 mr-1" />
            Needs Revision
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {entries.filter((e) => e.approvalStatus === 'pending').length}
                </p>
                <p className="text-xs text-gray-500">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">TT${(approvedTotal / 1000).toFixed(1)}K</p>
                <p className="text-xs text-gray-500">Ready to Invoice</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{entries.length}</p>
                <p className="text-xs text-gray-500">Total Entries</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  TT${(entries.reduce((s, e) => s + e.amount, 0) / 1000).toFixed(1)}K
                </p>
                <p className="text-xs text-gray-500">Total Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search entries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg w-64"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="needs_revision">Needs Revision</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterBillable} onValueChange={setFilterBillable}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Billable" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="billable">Billable</SelectItem>
                  <SelectItem value="nonbillable">Non-Billable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              {selectedEntries.length > 0 && (
                <>
                  <Badge className="bg-[#1E3A5F] text-white">
                    {selectedEntries.length} selected
                  </Badge>
                  <Button
                    size="sm"
                    className="bg-green-500 hover:bg-green-600"
                    onClick={handleBulkApprove}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Approve All
                  </Button>
                  <Button
                    size="sm"
                    className="bg-[#C4A35A] hover:bg-[#B8963A] text-white"
                    onClick={handleConvertToInvoice}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Create Invoice
                  </Button>
                </>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setShowLedesExport(true)}>
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    LEDES Format
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileText className="w-4 h-4 mr-2" />
                    CSV Export
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" size="sm" onClick={loadEntries}>
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entries Table */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10">
                <TableRow className="bg-gray-50">
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={
                        selectedEntries.length === filteredEntries.length &&
                        filteredEntries.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="rounded"
                    />
                  </TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Case</TableHead>
                  <TableHead>Attorney</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow
                    key={entry.id}
                    className={`hover:bg-gray-50 ${
                      selectedEntries.includes(entry.id) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedEntries.includes(entry.id)}
                        onChange={() => toggleSelectEntry(entry.id)}
                        className="rounded"
                      />
                    </TableCell>
                    <TableCell className="text-sm">{entry.date}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{entry.caseName}</p>
                        <p className="text-xs text-gray-500">{entry.clientName}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{entry.attorneyName}</TableCell>
                    <TableCell>
                      <div>
                        <Badge
                          className={activityCodeColors[entry.activityCode] || activityCodeColors.general}
                        >
                          {activityCodeLabels[entry.activityCode] || entry.activityCode}
                        </Badge>
                        {entry.isAutoCaptured && (
                          <Badge variant="outline" className="ml-1 text-[10px]">
                            Auto
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 max-w-[150px] truncate">
                        {entry.description}
                      </p>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {formatDuration(entry.durationMinutes)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#C4A35A]">
                          TT${entry.amount.toLocaleString()}
                        </span>
                        <Switch
                          checked={entry.isBillable}
                          onCheckedChange={() => handleToggleBillable(entry.id)}
                          className="data-[state=checked]:bg-green-500"
                        />
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(entry.approvalStatus)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditEntry(entry)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Entry
                          </DropdownMenuItem>
                          {entry.approvalStatus === 'pending' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setEntryToProcess(entry.id);
                                  setShowApproveDialog(true);
                                }}
                                className="text-green-600"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setEntryToProcess(entry.id);
                                  setShowRejectDialog(true);
                                }}
                                className="text-red-600"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredEntries.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No time entries found</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <TimeEntryForm
        open={!!editEntry}
        onOpenChange={(open) => !open && setEditEntry(null)}
        mode="edit"
        initialData={editEntry ? {
          caseId: editEntry.caseId,
          caseName: editEntry.caseName,
          clientName: editEntry.clientName,
          date: editEntry.date,
          startTime: editEntry.startTime,
          endTime: editEntry.endTime || '',
          durationMinutes: editEntry.durationMinutes,
          description: editEntry.description,
          activityType: editEntry.activityCode,
          isBillable: editEntry.isBillable,
          hourlyRate: editEntry.rate,
          roundingRule: 'none',
        } : undefined}
        onSubmit={(data) => {
          console.log('Updated entry:', data);
          setEditEntry(null);
        }}
      />

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Time Entry</DialogTitle>
            <DialogDescription>
              Add an optional note and approve this time entry.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Approval Notes (Optional)</Label>
            <Textarea
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder="Add any notes for the attorney..."
              rows={3}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-green-500 hover:bg-green-600"
              onClick={() => entryToProcess && handleApprove(entryToProcess)}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Time Entry</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejection.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Rejection Reason *</Label>
            <Textarea
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder="Explain why this entry is being rejected..."
              rows={3}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => entryToProcess && handleReject(entryToProcess)}
              disabled={!approvalNotes.trim()}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* LEDES Export Dialog */}
      <Dialog open={showLedesExport} onOpenChange={setShowLedesExport}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export to LEDES Format</DialogTitle>
            <DialogDescription>
              Export selected time entries in LEDES 1998B format for electronic billing.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Entries Selected:</span>
                <span className="font-medium">{selectedEntries.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Time:</span>
                <span className="font-medium">
                  {formatDuration(
                    entries
                      .filter((e) => selectedEntries.includes(e.id))
                      .reduce((s, e) => s + e.durationMinutes, 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-medium text-[#C4A35A]">
                  TT${selectedTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLedesExport(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#1E3A5F] hover:bg-[#2C4A6F]"
              onClick={exportToLedes}
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export LEDES
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TimeEntryReview;
