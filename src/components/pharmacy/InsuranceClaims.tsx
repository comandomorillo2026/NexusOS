'use client';

import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Building2,
  FileText,
  Search,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Phone,
  Mail,
  Globe,
  RefreshCw,
  Eye,
  Send,
  Download,
  Printer,
  Shield,
  User,
  Hash,
  Calendar,
  ChevronRight,
  AlertCircle,
  Info
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

// Caribbean Insurance Providers
const caribbeanInsurers = [
  {
    id: 'sagicor',
    name: 'Sagicor Life Inc',
    type: 'Private',
    bin: '600100',
    pcn: 'SAGICOR',
    logo: '/logos/sagicor.png',
    countries: ['Trinidad & Tobago', 'Barbados', 'Jamaica', 'Eastern Caribbean'],
    phone: '1-868-623-4747',
    website: 'www.sagicor.com',
    helpDesk: '1-800-724-426',
    priorAuthPhone: '1-868-623-4747 ext 3',
    realTimeEligibility: true,
    electronicClaims: true,
  },
  {
    id: 'guardian',
    name: 'Guardian Holdings Limited',
    type: 'Private',
    bin: '600200',
    pcn: 'GUARDIAN',
    logo: '/logos/guardian.png',
    countries: ['Trinidad & Tobago', 'Jamaica', 'Netherlands Antilles'],
    phone: '1-868-627-8478',
    website: 'www.guardianholdings.com',
    helpDesk: '1-800-748-2736',
    priorAuthPhone: '1-868-627-8478 ext 2',
    realTimeEligibility: true,
    electronicClaims: true,
  },
  {
    id: 'atlantic',
    name: 'Atlantic Medical Insurance',
    type: 'Private',
    bin: '600300',
    pcn: 'ATLANTIC',
    logo: '/logos/atlantic.png',
    countries: ['Trinidad & Tobago'],
    phone: '1-868-623-4646',
    website: 'www.atlanticmedical.com',
    helpDesk: '1-868-623-4646',
    priorAuthPhone: '1-868-623-4646 ext 4',
    realTimeEligibility: true,
    electronicClaims: true,
  },
  {
    id: 'nhf',
    name: 'National Health Fund (NHF)',
    type: 'Government',
    bin: '600400',
    pcn: 'NHF',
    logo: '/logos/nhf.png',
    countries: ['Jamaica'],
    phone: '1-876-906-1109',
    website: 'www.nhf.org.jm',
    helpDesk: '1-888-996-4343',
    priorAuthPhone: '1-876-906-1109',
    realTimeEligibility: false,
    electronicClaims: true,
  },
  {
    id: 'medecard',
    name: 'MedeCard',
    type: 'TPA',
    bin: '600500',
    pcn: 'MEDECARD',
    logo: '/logos/medecard.png',
    countries: ['Trinidad & Tobago'],
    phone: '1-868-628-4763',
    website: 'www.medecardtt.com',
    helpDesk: '1-868-628-4763',
    priorAuthPhone: '1-868-628-4763',
    realTimeEligibility: true,
    electronicClaims: true,
  },
  {
    id: 'sunshine',
    name: 'Sunshine Insurance',
    type: 'Private',
    bin: '600600',
    pcn: 'SUNSHINE',
    logo: '/logos/sunshine.png',
    countries: ['Trinidad & Tobago', 'Barbados'],
    phone: '1-868-622-2876',
    website: 'www.sunshineinsurance.com',
    helpDesk: '1-800-786-7446',
    priorAuthPhone: '1-868-622-2876 ext 5',
    realTimeEligibility: false,
    electronicClaims: true,
  },
];

// Mock claims
const mockClaims = [
  {
    id: '1',
    claimNumber: 'CLM-2024-000123',
    date: '2024-01-15',
    insurer: 'Sagicor Life Inc',
    insurerId: 'sagicor',
    patientName: 'Maria Garcia',
    patientId: 'PAT-001',
    memberId: 'SGC-12345678',
    groupNumber: 'GRP-5000',
    prescriptionNumber: 'RX-2024-001234',
    drugName: 'Atorvastatin 20mg',
    quantity: 30,
    daysSupply: 30,
    submittedAmount: 450.00,
    allowedAmount: 380.00,
    copay: 50.00,
    deductible: 0,
    insurancePaid: 330.00,
    patientPaid: 50.00,
    status: 'paid',
    submittedAt: '2024-01-15T10:30:00',
    paidAt: '2024-01-17T14:22:00',
    remittanceNumber: 'RMT-2024-0045',
  },
  {
    id: '2',
    claimNumber: 'CLM-2024-000124',
    date: '2024-01-15',
    insurer: 'Guardian Holdings Limited',
    insurerId: 'guardian',
    patientName: 'Carlos Rodriguez',
    patientId: 'PAT-002',
    memberId: 'GHL-87654321',
    groupNumber: 'GRP-4000',
    prescriptionNumber: 'RX-2024-001235',
    drugName: 'Metformin 850mg',
    quantity: 60,
    daysSupply: 30,
    submittedAmount: 280.00,
    allowedAmount: 250.00,
    copay: 25.00,
    deductible: 0,
    insurancePaid: 225.00,
    patientPaid: 25.00,
    status: 'paid',
    submittedAt: '2024-01-15T11:45:00',
    paidAt: '2024-01-18T09:15:00',
    remittanceNumber: 'RMT-2024-0047',
  },
  {
    id: '3',
    claimNumber: 'CLM-2024-000125',
    date: '2024-01-15',
    insurer: 'Atlantic Medical Insurance',
    insurerId: 'atlantic',
    patientName: 'Ana Martinez',
    patientId: 'PAT-003',
    memberId: 'AMI-11223344',
    groupNumber: 'GRP-3000',
    prescriptionNumber: 'RX-2024-001236',
    drugName: 'Lisinopril 10mg',
    quantity: 30,
    daysSupply: 30,
    submittedAmount: 180.00,
    allowedAmount: null,
    copay: null,
    deductible: null,
    insurancePaid: null,
    patientPaid: 180.00,
    status: 'pending',
    submittedAt: '2024-01-15T14:00:00',
    paidAt: null,
    remittanceNumber: null,
  },
  {
    id: '4',
    claimNumber: 'CLM-2024-000126',
    date: '2024-01-14',
    insurer: 'Sagicor Life Inc',
    insurerId: 'sagicor',
    patientName: 'Luis Hernandez',
    patientId: 'PAT-004',
    memberId: 'SGC-99887766',
    groupNumber: 'GRP-5000',
    prescriptionNumber: 'RX-2024-001237',
    drugName: 'Omeprazole 20mg',
    quantity: 30,
    daysSupply: 30,
    submittedAmount: 320.00,
    allowedAmount: null,
    copay: null,
    deductible: null,
    insurancePaid: null,
    patientPaid: 0,
    status: 'rejected',
    submittedAt: '2024-01-14T16:30:00',
    paidAt: null,
    rejectionReason: 'Prior Authorization Required',
    rejectionCode: 'PA-001',
    notes: 'Patient needs prior authorization for this medication. Contact insurer.',
  },
  {
    id: '5',
    claimNumber: 'CLM-2024-000127',
    date: '2024-01-15',
    insurer: 'National Health Fund (NHF)',
    insurerId: 'nhf',
    patientName: 'Sofia Lopez',
    patientId: 'PAT-005',
    memberId: 'NHF-55667788',
    groupNumber: 'NHF-GENERAL',
    prescriptionNumber: 'RX-2024-001238',
    drugName: 'Insulin Glargine',
    quantity: 1,
    daysSupply: 30,
    submittedAmount: 850.00,
    allowedAmount: null,
    copay: null,
    deductible: null,
    insurancePaid: null,
    patientPaid: 850.00,
    status: 'submitted',
    submittedAt: '2024-01-15T17:00:00',
    paidAt: null,
    remittanceNumber: null,
  },
];

// Mock eligibility verification
const mockEligibility = {
  patientName: 'Maria Garcia',
  memberId: 'SGC-12345678',
  groupNumber: 'GRP-5000',
  insurer: 'Sagicor Life Inc',
  planName: 'Sagicor Executive Health Plan',
  effectiveDate: '2024-01-01',
  terminationDate: '2024-12-31',
  status: 'active',
  pharmacyBenefit: {
    deductible: 500.00,
    deductibleMet: 350.00,
    deductibleRemaining: 150.00,
    outOfPocketMax: 5000.00,
    outOfPocketMet: 1200.00,
    copayGeneric: 25.00,
    copayBrand: 50.00,
    copaySpecialty: 100.00,
    mailOrderDiscount: 10,
  },
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  paid: { label: 'Paid', color: 'bg-emerald-500/20 text-emerald-300', icon: <CheckCircle className="w-4 h-4" /> },
  pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-300', icon: <Clock className="w-4 h-4" /> },
  submitted: { label: 'Submitted', color: 'bg-blue-500/20 text-blue-300', icon: <Send className="w-4 h-4" /> },
  rejected: { label: 'Rejected', color: 'bg-red-500/20 text-red-300', icon: <XCircle className="w-4 h-4" /> },
  reversed: { label: 'Reversed', color: 'bg-orange-500/20 text-orange-300', icon: <RefreshCw className="w-4 h-4" /> },
};

export default function InsuranceClaims() {
  const [activeTab, setActiveTab] = useState('claims');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInsurer, setSelectedInsurer] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showClaimDetail, setShowClaimDetail] = useState(false);
  const [showNewClaim, setShowNewClaim] = useState(false);
  const [showEligibility, setShowEligibility] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<typeof mockClaims[0] | null>(null);

  // Filter claims
  const filteredClaims = useMemo(() => {
    return mockClaims.filter(claim => {
      const matchesSearch =
        claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.memberId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesInsurer = selectedInsurer === 'all' || claim.insurerId === selectedInsurer;
      const matchesStatus = selectedStatus === 'all' || claim.status === selectedStatus;
      return matchesSearch && matchesInsurer && matchesStatus;
    });
  }, [searchTerm, selectedInsurer, selectedStatus]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = mockClaims.reduce((sum, c) => sum + c.submittedAmount, 0);
    const paid = mockClaims.filter(c => c.status === 'paid').reduce((sum, c) => sum + (c.insurancePaid || 0), 0);
    const pending = mockClaims.filter(c => c.status === 'pending' || c.status === 'submitted').reduce((sum, c) => sum + c.submittedAmount, 0);
    const rejected = mockClaims.filter(c => c.status === 'rejected').length;
    
    return {
      totalSubmitted: total,
      totalPaid: paid,
      pendingAmount: pending,
      rejectedClaims: rejected,
      totalClaims: mockClaims.length,
    };
  }, []);

  // View claim details
  const viewClaimDetails = (claim: typeof mockClaims[0]) => {
    setSelectedClaim(claim);
    setShowClaimDetail(true);
  };

  return (
    <div className="min-h-screen bg-[#050410] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            Insurance Claims Management
          </h1>
          <p className="text-blue-400/70 text-sm mt-1">
            Caribbean insurance integration | TT$ pricing | Real-time eligibility
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-blue-500/30 text-blue-400" onClick={() => setShowEligibility(true)}>
            <Shield className="w-4 h-4 mr-2" />
            Verify Eligibility
          </Button>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => setShowNewClaim(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Claim
          </Button>
        </div>
      </div>

      {/* Insurance Partners */}
      <Card className="bg-[rgba(59,130,246,0.03)] border-[rgba(59,130,246,0.15)] mb-6">
        <CardHeader className="border-b border-[rgba(59,130,246,0.1)] py-3">
          <CardTitle className="text-white text-sm">Connected Insurance Partners</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-2">
            {caribbeanInsurers.map((insurer) => (
              <Badge
                key={insurer.id}
                className="bg-blue-500/10 text-blue-300 border border-blue-500/20 cursor-pointer hover:bg-blue-500/20"
                onClick={() => setSelectedInsurer(insurer.id === selectedInsurer ? 'all' : insurer.id)}
              >
                {insurer.name}
                {insurer.realTimeEligibility && (
                  <span className="ml-2 text-emerald-400 text-xs">RT</span>
                )}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="bg-[rgba(59,130,246,0.05)] border-[rgba(59,130,246,0.2)]">
          <CardContent className="p-4 text-center">
            <FileText className="w-5 h-5 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.totalClaims}</p>
            <p className="text-xs text-blue-400/70">Total Claims</p>
          </CardContent>
        </Card>
        <Card className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)]">
          <CardContent className="p-4 text-center">
            <DollarSign className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white font-mono">TT${stats.totalSubmitted.toLocaleString()}</p>
            <p className="text-xs text-emerald-400/70">Submitted</p>
          </CardContent>
        </Card>
        <Card className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)]">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white font-mono">TT${stats.totalPaid.toLocaleString()}</p>
            <p className="text-xs text-emerald-400/70">Paid</p>
          </CardContent>
        </Card>
        <Card className="bg-[rgba(234,179,8,0.05)] border-[rgba(234,179,8,0.2)]">
          <CardContent className="p-4 text-center">
            <Clock className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white font-mono">TT${stats.pendingAmount.toLocaleString()}</p>
            <p className="text-xs text-yellow-400/70">Pending</p>
          </CardContent>
        </Card>
        <Card className="bg-[rgba(239,68,68,0.05)] border-[rgba(239,68,68,0.2)]">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-5 h-5 text-red-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-400">{stats.rejectedClaims}</p>
            <p className="text-xs text-red-400/70">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[rgba(59,130,246,0.1)] mb-4">
          <TabsTrigger value="claims" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            Claims
          </TabsTrigger>
          <TabsTrigger value="insurers" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            Insurance Partners
          </TabsTrigger>
          <TabsTrigger value="remittances" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            Remittances
          </TabsTrigger>
        </TabsList>

        {/* Claims Tab */}
        <TabsContent value="claims">
          <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
            <CardHeader className="border-b border-[rgba(16,185,129,0.1)]">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  Insurance Claims
                </CardTitle>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                    <Input
                      placeholder="Search claims..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64 bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white placeholder:text-white/40"
                    />
                  </div>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-36 bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-[rgba(16,185,129,0.1)] hover:bg-transparent">
                      <TableHead className="text-white/60 text-xs">Claim #</TableHead>
                      <TableHead className="text-white/60 text-xs">Date</TableHead>
                      <TableHead className="text-white/60 text-xs">Patient</TableHead>
                      <TableHead className="text-white/60 text-xs">Insurer</TableHead>
                      <TableHead className="text-white/60 text-xs">Drug</TableHead>
                      <TableHead className="text-white/60 text-xs">Submitted</TableHead>
                      <TableHead className="text-white/60 text-xs">Copay</TableHead>
                      <TableHead className="text-white/60 text-xs">Status</TableHead>
                      <TableHead className="text-white/60 text-xs w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClaims.map((claim) => (
                      <TableRow key={claim.id} className="border-b border-[rgba(16,185,129,0.05)] hover:bg-[rgba(16,185,129,0.02)]">
                        <TableCell className="text-white font-mono text-sm">{claim.claimNumber}</TableCell>
                        <TableCell className="text-white/70 text-sm">{claim.date}</TableCell>
                        <TableCell className="text-white text-sm">
                          <div>
                            <p>{claim.patientName}</p>
                            <p className="text-white/50 text-xs">{claim.memberId}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-white text-sm">{claim.insurer}</TableCell>
                        <TableCell className="text-white text-sm">
                          <div>
                            <p>{claim.drugName}</p>
                            <p className="text-white/50 text-xs">Qty: {claim.quantity} | {claim.daysSupply} days</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-white font-mono">TT${claim.submittedAmount.toFixed(2)}</TableCell>
                        <TableCell className="text-white font-mono">
                          {claim.copay ? `TT$${claim.copay.toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusConfig[claim.status]?.color}>
                            <span className="flex items-center gap-1">
                              {statusConfig[claim.status]?.icon}
                              {statusConfig[claim.status]?.label}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-blue-400 hover:text-white hover:bg-blue-500/10"
                            onClick={() => viewClaimDetails(claim)}
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

        {/* Insurance Partners Tab */}
        <TabsContent value="insurers">
          <div className="grid md:grid-cols-2 gap-4">
            {caribbeanInsurers.map((insurer) => (
              <Card key={insurer.id} className="bg-[rgba(59,130,246,0.03)] border-[rgba(59,130,246,0.15)]">
                <CardHeader className="border-b border-[rgba(59,130,246,0.1)] pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg">{insurer.name}</CardTitle>
                    <Badge className={insurer.type === 'Government' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}>
                      {insurer.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-white/40 text-xs uppercase">BIN</p>
                        <p className="text-white font-mono">{insurer.bin}</p>
                      </div>
                      <div>
                        <p className="text-white/40 text-xs uppercase">PCN</p>
                        <p className="text-white font-mono">{insurer.pcn}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-white/40 text-xs uppercase">Countries</p>
                      <p className="text-white">{insurer.countries.join(', ')}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-white/40" />
                        <span className="text-white">{insurer.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-white/40" />
                        <span className="text-white text-xs">{insurer.website}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {insurer.realTimeEligibility && (
                        <Badge className="bg-emerald-500/20 text-emerald-300">
                          <Shield className="w-3 h-3 mr-1" />
                          Real-time Eligibility
                        </Badge>
                      )}
                      {insurer.electronicClaims && (
                        <Badge className="bg-blue-500/20 text-blue-300">
                          <Send className="w-3 h-3 mr-1" />
                          E-Claims
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Remittances Tab */}
        <TabsContent value="remittances">
          <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
            <CardHeader className="border-b border-[rgba(16,185,129,0.1)]">
              <CardTitle className="text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                Remittance Advice
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {mockClaims.filter(c => c.status === 'paid').map((claim) => (
                  <div key={claim.id} className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-white font-medium">{claim.remittanceNumber}</p>
                        <p className="text-white/50 text-sm">{claim.insurer}</p>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-300">Paid</Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-white/40 text-xs">Patient</p>
                        <p className="text-white">{claim.patientName}</p>
                      </div>
                      <div>
                        <p className="text-white/40 text-xs">Drug</p>
                        <p className="text-white">{claim.drugName}</p>
                      </div>
                      <div>
                        <p className="text-white/40 text-xs">Insurance Paid</p>
                        <p className="text-emerald-400 font-mono">TT${claim.insurancePaid?.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-white/40 text-xs">Paid Date</p>
                        <p className="text-white">{claim.paidAt?.split('T')[0]}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Claim Detail Dialog */}
      <Dialog open={showClaimDetail} onOpenChange={setShowClaimDetail}>
        <DialogContent className="bg-[#0A0820] border-[rgba(59,130,246,0.2)] text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              {selectedClaim?.claimNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedClaim && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2">
                <Badge className={statusConfig[selectedClaim.status]?.color}>
                  {statusConfig[selectedClaim.status]?.label}
                </Badge>
                <span className="text-white/60 text-sm">{selectedClaim.insurer}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Patient Info */}
                <div className="p-4 rounded-lg bg-[rgba(59,130,246,0.05)] border border-[rgba(59,130,246,0.1)]">
                  <h4 className="text-sm text-blue-400 uppercase mb-3">Patient Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Name</span>
                      <span className="text-white">{selectedClaim.patientName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Member ID</span>
                      <span className="text-white font-mono">{selectedClaim.memberId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Group #</span>
                      <span className="text-white font-mono">{selectedClaim.groupNumber}</span>
                    </div>
                  </div>
                </div>

                {/* Prescription Info */}
                <div className="p-4 rounded-lg bg-[rgba(59,130,246,0.05)] border border-[rgba(59,130,246,0.1)]">
                  <h4 className="text-sm text-blue-400 uppercase mb-3">Prescription</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Rx #</span>
                      <span className="text-white font-mono">{selectedClaim.prescriptionNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Drug</span>
                      <span className="text-white">{selectedClaim.drugName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Qty / Days</span>
                      <span className="text-white">{selectedClaim.quantity} / {selectedClaim.daysSupply}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                <h4 className="text-sm text-emerald-400 uppercase mb-3">Financial Summary</h4>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-white/40 text-xs">Submitted</p>
                    <p className="text-white font-mono text-lg">TT${selectedClaim.submittedAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">Allowed</p>
                    <p className="text-white font-mono text-lg">
                      {selectedClaim.allowedAmount ? `TT$${selectedClaim.allowedAmount.toFixed(2)}` : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">Copay</p>
                    <p className="text-white font-mono text-lg">
                      {selectedClaim.copay ? `TT$${selectedClaim.copay.toFixed(2)}` : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">Insurance Paid</p>
                    <p className="text-emerald-400 font-mono text-lg">
                      {selectedClaim.insurancePaid ? `TT$${selectedClaim.insurancePaid.toFixed(2)}` : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rejection Info */}
              {selectedClaim.status === 'rejected' && (
                <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                  <h4 className="text-sm text-red-400 uppercase mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Rejection Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Reason</span>
                      <span className="text-red-400">{selectedClaim.rejectionReason}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Code</span>
                      <span className="text-white font-mono">{selectedClaim.rejectionCode}</span>
                    </div>
                    {selectedClaim.notes && (
                      <p className="text-white/80 mt-2">{selectedClaim.notes}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="border-blue-500/30 text-blue-400" onClick={() => setShowClaimDetail(false)}>
              Close
            </Button>
            {selectedClaim?.status === 'rejected' && (
              <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                <RefreshCw className="w-4 h-4 mr-2" />
                Resubmit Claim
              </Button>
            )}
            {selectedClaim?.status === 'paid' && (
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                <Printer className="w-4 h-4 mr-2" />
                Print Remittance
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Eligibility Verification Dialog */}
      <Dialog open={showEligibility} onOpenChange={setShowEligibility}>
        <DialogContent className="bg-[#0A0820] border-[rgba(59,130,246,0.2)] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              Eligibility Verification
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/40 uppercase mb-2 block">Member ID</label>
                <Input
                  className="bg-[rgba(59,130,246,0.05)] border-[rgba(59,130,246,0.2)] text-white"
                  placeholder="Enter member ID"
                  defaultValue="SGC-12345678"
                />
              </div>
              <div>
                <label className="text-xs text-white/40 uppercase mb-2 block">Group Number</label>
                <Input
                  className="bg-[rgba(59,130,246,0.05)] border-[rgba(59,130,246,0.2)] text-white"
                  placeholder="Enter group number"
                  defaultValue="GRP-5000"
                />
              </div>
              <div>
                <label className="text-xs text-white/40 uppercase mb-2 block">Date of Birth</label>
                <Input
                  type="date"
                  className="bg-[rgba(59,130,246,0.05)] border-[rgba(59,130,246,0.2)] text-white"
                />
              </div>
              <div>
                <label className="text-xs text-white/40 uppercase mb-2 block">Insurance</label>
                <Select defaultValue="sagicor">
                  <SelectTrigger className="bg-[rgba(59,130,246,0.05)] border-[rgba(59,130,246,0.2)] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {caribbeanInsurers.map((insurer) => (
                      <SelectItem key={insurer.id} value={insurer.id}>
                        {insurer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
              <Shield className="w-4 h-4 mr-2" />
              Verify Eligibility
            </Button>

            {/* Simulated Results */}
            <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Coverage Active</span>
              </div>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/40 text-xs">Patient</p>
                    <p className="text-white">{mockEligibility.patientName}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">Plan</p>
                    <p className="text-white">{mockEligibility.planName}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/40 text-xs">Effective</p>
                    <p className="text-white">{mockEligibility.effectiveDate}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">Through</p>
                    <p className="text-white">{mockEligibility.terminationDate}</p>
                  </div>
                </div>
                <div className="border-t border-emerald-500/20 pt-3 mt-3">
                  <p className="text-white/40 text-xs mb-2">Pharmacy Benefit</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-2 rounded bg-blue-500/10">
                      <p className="text-white/40 text-xs">Generic Copay</p>
                      <p className="text-white font-mono">TT${mockEligibility.pharmacyBenefit.copayGeneric}</p>
                    </div>
                    <div className="text-center p-2 rounded bg-blue-500/10">
                      <p className="text-white/40 text-xs">Brand Copay</p>
                      <p className="text-white font-mono">TT${mockEligibility.pharmacyBenefit.copayBrand}</p>
                    </div>
                    <div className="text-center p-2 rounded bg-blue-500/10">
                      <p className="text-white/40 text-xs">Specialty</p>
                      <p className="text-white font-mono">TT${mockEligibility.pharmacyBenefit.copaySpecialty}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-white/40 text-xs">Deductible</p>
                    <div className="flex items-center gap-2">
                      <Progress value={mockEligibility.pharmacyBenefit.deductibleMet / mockEligibility.pharmacyBenefit.deductible * 100} className="h-2 flex-1" />
                      <span className="text-white font-mono text-xs">
                        TT${mockEligibility.pharmacyBenefit.deductibleMet}/{mockEligibility.pharmacyBenefit.deductible}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">Out of Pocket</p>
                    <div className="flex items-center gap-2">
                      <Progress value={mockEligibility.pharmacyBenefit.outOfPocketMet / mockEligibility.pharmacyBenefit.outOfPocketMax * 100} className="h-2 flex-1" />
                      <span className="text-white font-mono text-xs">
                        TT${mockEligibility.pharmacyBenefit.outOfPocketMet}/{mockEligibility.pharmacyBenefit.outOfPocketMax}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-blue-500/30 text-blue-400" onClick={() => setShowEligibility(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Claim Dialog */}
      <Dialog open={showNewClaim} onOpenChange={setShowNewClaim}>
        <DialogContent className="bg-[#0A0820] border-[rgba(59,130,246,0.2)] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-400" />
              New Insurance Claim
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/40 uppercase mb-2 block">Insurance</label>
                <Select>
                  <SelectTrigger className="bg-[rgba(59,130,246,0.05)] border-[rgba(59,130,246,0.2)] text-white">
                    <SelectValue placeholder="Select insurer" />
                  </SelectTrigger>
                  <SelectContent>
                    {caribbeanInsurers.map((insurer) => (
                      <SelectItem key={insurer.id} value={insurer.id}>
                        {insurer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-white/40 uppercase mb-2 block">Prescription</label>
                <Input
                  className="bg-[rgba(59,130,246,0.05)] border-[rgba(59,130,246,0.2)] text-white"
                  placeholder="RX number"
                />
              </div>
              <div>
                <label className="text-xs text-white/40 uppercase mb-2 block">Member ID</label>
                <Input
                  className="bg-[rgba(59,130,246,0.05)] border-[rgba(59,130,246,0.2)] text-white"
                  placeholder="Member ID"
                />
              </div>
              <div>
                <label className="text-xs text-white/40 uppercase mb-2 block">Group Number</label>
                <Input
                  className="bg-[rgba(59,130,246,0.05)] border-[rgba(59,130,246,0.2)] text-white"
                  placeholder="Group number"
                />
              </div>
              <div>
                <label className="text-xs text-white/40 uppercase mb-2 block">Submitted Amount (TT$)</label>
                <Input
                  type="number"
                  step="0.01"
                  className="bg-[rgba(59,130,246,0.05)] border-[rgba(59,130,246,0.2)] text-white"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="text-xs text-white/40 uppercase mb-2 block">Patient Copay (TT$)</label>
                <Input
                  type="number"
                  step="0.01"
                  className="bg-[rgba(59,130,246,0.05)] border-[rgba(59,130,246,0.2)] text-white"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase mb-2 block">Notes</label>
              <Textarea
                className="bg-[rgba(59,130,246,0.05)] border-[rgba(59,130,246,0.2)] text-white"
                placeholder="Additional notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-blue-500/30 text-blue-400" onClick={() => setShowNewClaim(false)}>
              Cancel
            </Button>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              <Send className="w-4 h-4 mr-2" />
              Submit Claim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
