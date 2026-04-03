'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
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
  AlertTriangle,
  Plus,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  User,
  FileText,
  Brain,
  TrendingUp,
  Activity,
  Shield,
  MessageSquare,
} from 'lucide-react';

const mockClaims = [
  {
    id: '1',
    claimNumber: 'CLM-2024-000338',
    policyNumber: 'POL-2024-001242',
    claimantName: 'John Smith',
    claimType: 'DEATH',
    claimCause: 'Natural Causes',
    occurrenceDate: '2024-03-15',
    notificationDate: '2024-03-16',
    claimedAmount: 500000,
    approvedAmount: 500000,
    paidAmount: 0,
    reserveAmount: 500000,
    status: 'under_review',
    fraudScore: 0.12,
    assignedTo: 'Claims Team A',
    investigationStatus: 'completed',
    lineOfBusiness: 'LIFE',
  },
  {
    id: '2',
    claimNumber: 'CLM-2024-000339',
    policyNumber: 'POL-2024-001243',
    claimantName: 'Maria Garcia',
    claimType: 'MOTOR_ACCIDENT',
    claimCause: 'Collision',
    occurrenceDate: '2024-03-18',
    notificationDate: '2024-03-18',
    claimedAmount: 85000,
    approvedAmount: null,
    paidAmount: 0,
    reserveAmount: 75000,
    status: 'open',
    fraudScore: 0.35,
    assignedTo: 'Claims Team B',
    investigationStatus: 'under_investigation',
    lineOfBusiness: 'MOTOR',
  },
  {
    id: '3',
    claimNumber: 'CLM-2024-000340',
    policyNumber: 'POL-2024-001244',
    claimantName: 'Carlos Rodriguez',
    claimType: 'PROPERTY_DAMAGE',
    claimCause: 'Fire',
    occurrenceDate: '2024-03-20',
    notificationDate: '2024-03-20',
    claimedAmount: 450000,
    approvedAmount: 450000,
    paidAmount: 450000,
    reserveAmount: 0,
    status: 'paid',
    fraudScore: 0.08,
    assignedTo: 'Claims Team A',
    investigationStatus: 'completed',
    lineOfBusiness: 'PROPERTY',
  },
  {
    id: '4',
    claimNumber: 'CLM-2024-000341',
    policyNumber: 'POL-2024-001245',
    claimantName: 'Ana Martinez',
    claimType: 'HOSPITALIZATION',
    claimCause: 'Medical Emergency',
    occurrenceDate: '2024-03-22',
    notificationDate: '2024-03-22',
    claimedAmount: 125000,
    approvedAmount: null,
    paidAmount: 0,
    reserveAmount: 100000,
    status: 'open',
    fraudScore: 0.78,
    fraudFlags: ['Late reporting', 'Multiple similar claims', 'High value relative to policy'],
    assignedTo: 'Fraud Investigation',
    investigationStatus: 'referred',
    lineOfBusiness: 'HEALTH',
  },
  {
    id: '5',
    claimNumber: 'CLM-2024-000342',
    policyNumber: 'POL-2024-001246',
    claimantName: 'Luis Hernandez',
    claimType: 'CARGO_LOSS',
    claimCause: 'Theft',
    occurrenceDate: '2024-03-25',
    notificationDate: '2024-03-26',
    claimedAmount: 850000,
    approvedAmount: null,
    paidAmount: 0,
    reserveAmount: 750000,
    status: 'under_review',
    fraudScore: 0.22,
    assignedTo: 'Marine Claims Team',
    investigationStatus: 'pending',
    lineOfBusiness: 'MARINE',
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  open: { label: 'Open', color: 'bg-blue-500/20 text-blue-300', icon: Clock },
  under_review: { label: 'Under Review', color: 'bg-yellow-500/20 text-yellow-300', icon: Activity },
  approved: { label: 'Approved', color: 'bg-emerald-500/20 text-emerald-300', icon: CheckCircle },
  paid: { label: 'Paid', color: 'bg-cyan-500/20 text-cyan-300', icon: DollarSign },
  denied: { label: 'Denied', color: 'bg-red-500/20 text-red-300', icon: XCircle },
  closed: { label: 'Closed', color: 'bg-slate-500/20 text-slate-300', icon: CheckCircle },
};

export default function ClaimsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedClaim, setSelectedClaim] = useState<typeof mockClaims[0] | null>(null);
  const [showClaimDetail, setShowClaimDetail] = useState(false);

  const filteredClaims = useMemo(() => {
    return mockClaims.filter(claim => {
      const matchesSearch = 
        claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.claimantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.policyNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || claim.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, selectedStatus]);

  const stats = useMemo(() => {
    const total = mockClaims.length;
    const open = mockClaims.filter(c => c.status === 'open' || c.status === 'under_review').length;
    const totalClaimed = mockClaims.reduce((sum, c) => sum + c.claimedAmount, 0);
    const totalReserve = mockClaims.reduce((sum, c) => sum + c.reserveAmount, 0);
    const totalPaid = mockClaims.reduce((sum, c) => sum + c.paidAmount, 0);
    const highRisk = mockClaims.filter(c => c.fraudScore > 0.5).length;
    return { total, open, totalClaimed, totalReserve, totalPaid, highRisk };
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="bg-orange-500/5 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-xl font-bold text-white">{stats.open}</p>
                <p className="text-xs text-orange-300/60">Open Claims</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-xl font-bold text-white">{stats.total}</p>
                <p className="text-xs text-blue-300/60">Total Claims</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-cyan-500/5 border-cyan-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="text-lg font-bold text-white">TT${(stats.totalClaimed / 1000).toFixed(0)}K</p>
                <p className="text-xs text-cyan-300/60">Claimed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-lg font-bold text-white">TT${(stats.totalReserve / 1000).toFixed(0)}K</p>
                <p className="text-xs text-purple-300/60">Reserves</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-lg font-bold text-white">TT${(stats.totalPaid / 1000).toFixed(0)}K</p>
                <p className="text-xs text-emerald-300/60">Paid YTD</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-500/5 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-xl font-bold text-white">{stats.highRisk}</p>
                <p className="text-xs text-red-300/60">High Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="border-b border-slate-700">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              Claims Management
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                <Input placeholder="Search claims..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-64 bg-slate-700/50 border-slate-600 text-white placeholder:text-white/40" />
              </div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-40 bg-slate-700/50 border-slate-600 text-white"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="denied">Denied</SelectItem>
                </SelectContent>
              </Select>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                New Claim
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-700 hover:bg-transparent">
                  <TableHead className="text-slate-400">Claim #</TableHead>
                  <TableHead className="text-slate-400">Policy</TableHead>
                  <TableHead className="text-slate-400">Claimant</TableHead>
                  <TableHead className="text-slate-400">Type</TableHead>
                  <TableHead className="text-slate-400">Claimed</TableHead>
                  <TableHead className="text-slate-400">Reserve</TableHead>
                  <TableHead className="text-slate-400">Fraud Score</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClaims.map((claim) => {
                  const StatusIcon = statusConfig[claim.status]?.icon || Clock;
                  return (
                    <TableRow key={claim.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <TableCell className="text-white font-mono">{claim.claimNumber}</TableCell>
                      <TableCell className="text-white font-mono text-sm">{claim.policyNumber}</TableCell>
                      <TableCell className="text-white">{claim.claimantName}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-white text-sm">{claim.claimType.replace('_', ' ')}</p>
                          <p className="text-slate-400 text-xs">{claim.lineOfBusiness}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-cyan-400 font-mono">TT${claim.claimedAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-purple-400 font-mono">TT${claim.reserveAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={claim.fraudScore * 100} className={`h-2 w-16 ${claim.fraudScore > 0.5 ? 'bg-red-500' : claim.fraudScore > 0.3 ? 'bg-yellow-500' : 'bg-emerald-500'}`} />
                          <span className={`text-sm ${claim.fraudScore > 0.5 ? 'text-red-400' : claim.fraudScore > 0.3 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                            {(claim.fraudScore * 100).toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig[claim.status]?.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig[claim.status]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" className="text-blue-400 hover:text-white hover:bg-blue-500/10" onClick={() => { setSelectedClaim(claim); setShowClaimDetail(true); }}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Claim Detail Dialog */}
      <Dialog open={showClaimDetail} onOpenChange={setShowClaimDetail}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              {selectedClaim?.claimNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedClaim && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3">
                <Badge className={statusConfig[selectedClaim.status]?.color}>
                  {statusConfig[selectedClaim.status]?.label}
                </Badge>
                <span className="text-slate-400">Policy: {selectedClaim.policyNumber}</span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-400">{selectedClaim.claimType.replace('_', ' ')}</span>
              </div>

              {/* Fraud Alert */}
              {selectedClaim.fraudScore > 0.5 && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-5 h-5 text-red-400" />
                    <span className="text-red-400 font-medium">High Fraud Risk Detected</span>
                  </div>
                  <div className="space-y-1">
                    {selectedClaim.fraudFlags?.map((flag, i) => (
                      <p key={i} className="text-red-300/70 text-sm">• {flag}</p>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                  <h4 className="text-sm text-orange-400 uppercase mb-3">Claim Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-400">Claimant</span><span className="text-white">{selectedClaim.claimantName}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Cause</span><span className="text-white">{selectedClaim.claimCause}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Occurrence</span><span className="text-white">{selectedClaim.occurrenceDate}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Notification</span><span className="text-white">{selectedClaim.notificationDate}</span></div>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                  <h4 className="text-sm text-cyan-400 uppercase mb-3">Financial Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-400">Claimed</span><span className="text-cyan-400 font-mono">TT${selectedClaim.claimedAmount.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Approved</span><span className="text-emerald-400 font-mono">{selectedClaim.approvedAmount ? `TT$${selectedClaim.approvedAmount.toLocaleString()}` : 'Pending'}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Reserve</span><span className="text-purple-400 font-mono">TT${selectedClaim.reserveAmount.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Paid</span><span className="text-white font-mono">TT${selectedClaim.paidAmount.toLocaleString()}</span></div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <h4 className="text-sm text-blue-400 uppercase mb-3">Processing</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">Assigned To</span><span className="text-white">{selectedClaim.assignedTo}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Investigation</span><span className="text-white">{selectedClaim.investigationStatus}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Fraud Score</span><span className={selectedClaim.fraudScore > 0.5 ? 'text-red-400' : 'text-emerald-400'}>{(selectedClaim.fraudScore * 100).toFixed(0)}%</span></div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="border-slate-600 text-slate-300" onClick={() => setShowClaimDetail(false)}>Close</Button>
            {selectedClaim?.status === 'under_review' && (
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">Approve Claim</Button>
            )}
            {selectedClaim?.fraudScore > 0.5 && (
              <Button className="bg-red-500 hover:bg-red-600 text-white">Refer to SIU</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
