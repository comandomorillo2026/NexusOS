'use client';

import React, { useState, useMemo } from 'react';
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
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Car,
  Home,
  Heart,
  Plane,
  Scale,
  Activity,
  DollarSign,
  Calendar,
  User,
  Building2,
  Shield,
} from 'lucide-react';

// Mock policies data
const mockPolicies = [
  {
    id: '1',
    policyNumber: 'POL-2024-001242',
    insuredName: 'John Smith',
    insuredEmail: 'john.smith@email.com',
    insuredPhone: '868-123-4567',
    productCode: 'TERM-20',
    productName: 'Term Life 20 Year',
    lineOfBusiness: 'LIFE',
    effectiveDate: '2024-01-01',
    expiryDate: '2044-01-01',
    premiumAmount: 4500,
    sumInsured: 500000,
    status: 'active',
    paymentStatus: 'current',
    agentCode: 'AGT-001',
    agentName: 'Robert Johnson',
    riskRating: 'STANDARD',
  },
  {
    id: '2',
    policyNumber: 'POL-2024-001243',
    insuredName: 'Maria Garcia',
    insuredEmail: 'maria.garcia@email.com',
    insuredPhone: '868-234-5678',
    productCode: 'COMPREHENSIVE-MOTOR',
    productName: 'Comprehensive Motor Insurance',
    lineOfBusiness: 'MOTOR',
    effectiveDate: '2024-01-15',
    expiryDate: '2025-01-15',
    premiumAmount: 8500,
    sumInsured: 350000,
    status: 'active',
    paymentStatus: 'current',
    vehicleMake: 'Toyota',
    vehicleModel: 'Corolla',
    vehicleYear: 2022,
    vehicleRegNumber: 'PBC-1234',
    agentCode: 'AGT-002',
    agentName: 'Sarah Williams',
    riskRating: 'PREFERRED',
  },
  {
    id: '3',
    policyNumber: 'POL-2024-001244',
    insuredName: 'Carlos Rodriguez',
    insuredEmail: 'carlos.r@email.com',
    insuredPhone: '868-345-6789',
    productCode: 'HOMEOWNERS-PLUS',
    productName: 'Homeowners Plus',
    lineOfBusiness: 'PROPERTY',
    effectiveDate: '2024-02-01',
    expiryDate: '2025-02-01',
    premiumAmount: 12000,
    sumInsured: 2500000,
    status: 'active',
    paymentStatus: 'current',
    propertyAddress: '123 Palm Avenue, Port of Spain',
    propertyType: 'Single Family',
    agentCode: 'AGT-001',
    agentName: 'Robert Johnson',
    riskRating: 'STANDARD',
  },
  {
    id: '4',
    policyNumber: 'POL-2024-001245',
    insuredName: 'Ana Martinez',
    insuredEmail: 'ana.m@email.com',
    insuredPhone: '868-456-7890',
    productCode: 'HEALTH-EXECUTIVE',
    productName: 'Executive Health Plan',
    lineOfBusiness: 'HEALTH',
    effectiveDate: '2024-01-01',
    expiryDate: '2025-01-01',
    premiumAmount: 24000,
    sumInsured: 1000000,
    status: 'lapsed',
    paymentStatus: 'overdue',
    agentCode: 'AGT-003',
    agentName: 'Michael Brown',
    riskRating: 'STANDARD',
  },
  {
    id: '5',
    policyNumber: 'POL-2024-001246',
    insuredName: 'Luis Hernandez',
    insuredEmail: 'luis.h@email.com',
    insuredPhone: '868-567-8901',
    productCode: 'MARINE-CARGO',
    productName: 'Marine Cargo Insurance',
    lineOfBusiness: 'MARINE',
    effectiveDate: '2024-03-01',
    expiryDate: '2025-03-01',
    premiumAmount: 18500,
    sumInsured: 5000000,
    status: 'pending',
    paymentStatus: 'pending',
    agentCode: 'AGT-002',
    agentName: 'Sarah Williams',
    riskRating: 'HIGH',
  },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: 'Active', color: 'bg-emerald-500/20 text-emerald-300' },
  pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-300' },
  lapsed: { label: 'Lapsed', color: 'bg-red-500/20 text-red-300' },
  cancelled: { label: 'Cancelled', color: 'bg-slate-500/20 text-slate-300' },
  expired: { label: 'Expired', color: 'bg-orange-500/20 text-orange-300' },
};

const lobConfig: Record<string, { icon: React.ElementType; color: string }> = {
  LIFE: { icon: Heart, color: 'text-pink-400' },
  HEALTH: { icon: Activity, color: 'text-emerald-400' },
  MOTOR: { icon: Car, color: 'text-blue-400' },
  PROPERTY: { icon: Home, color: 'text-orange-400' },
  MARINE: { icon: Plane, color: 'text-cyan-400' },
  LIABILITY: { icon: Scale, color: 'text-purple-400' },
};

export default function PolicyManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLob, setSelectedLob] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showNewPolicy, setShowNewPolicy] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<typeof mockPolicies[0] | null>(null);
  const [showPolicyDetail, setShowPolicyDetail] = useState(false);

  const filteredPolicies = useMemo(() => {
    return mockPolicies.filter(policy => {
      const matchesSearch = 
        policy.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.insuredName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.productName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLob = selectedLob === 'all' || policy.lineOfBusiness === selectedLob;
      const matchesStatus = selectedStatus === 'all' || policy.status === selectedStatus;
      return matchesSearch && matchesLob && matchesStatus;
    });
  }, [searchTerm, selectedLob, selectedStatus]);

  const stats = useMemo(() => {
    const total = mockPolicies.length;
    const active = mockPolicies.filter(p => p.status === 'active').length;
    const totalPremium = mockPolicies.reduce((sum, p) => sum + p.premiumAmount, 0);
    const totalSumInsured = mockPolicies.reduce((sum, p) => sum + p.sumInsured, 0);
    return { total, active, totalPremium, totalSumInsured };
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-xs text-blue-300/60">Total Policies</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.active}</p>
                <p className="text-xs text-emerald-300/60">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-cyan-500/5 border-cyan-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-cyan-400" />
              <div>
                <p className="text-2xl font-bold text-white">TT${(stats.totalPremium / 1000).toFixed(0)}K</p>
                <p className="text-xs text-cyan-300/60">Total Premium</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-white">TT${(stats.totalSumInsured / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-purple-300/60">Sum Insured</p>
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
              <FileText className="w-5 h-5 text-blue-400" />
              Policy Management
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                <Input
                  placeholder="Search policies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 bg-slate-700/50 border-slate-600 text-white placeholder:text-white/40"
                />
              </div>
              <Select value={selectedLob} onValueChange={setSelectedLob}>
                <SelectTrigger className="w-40 bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder="Line of Business" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Lines</SelectItem>
                  <SelectItem value="LIFE">Life</SelectItem>
                  <SelectItem value="HEALTH">Health</SelectItem>
                  <SelectItem value="MOTOR">Motor</SelectItem>
                  <SelectItem value="PROPERTY">Property</SelectItem>
                  <SelectItem value="MARINE">Marine</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-32 bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="lapsed">Lapsed</SelectItem>
                </SelectContent>
              </Select>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => setShowNewPolicy(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Policy
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-700 hover:bg-transparent">
                  <TableHead className="text-slate-400">Policy #</TableHead>
                  <TableHead className="text-slate-400">Insured</TableHead>
                  <TableHead className="text-slate-400">Product</TableHead>
                  <TableHead className="text-slate-400">LOB</TableHead>
                  <TableHead className="text-slate-400">Effective</TableHead>
                  <TableHead className="text-slate-400">Premium</TableHead>
                  <TableHead className="text-slate-400">Sum Insured</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPolicies.map((policy) => {
                  const LobIcon = lobConfig[policy.lineOfBusiness]?.icon || FileText;
                  return (
                    <TableRow key={policy.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <TableCell className="text-white font-mono">{policy.policyNumber}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-white">{policy.insuredName}</p>
                          <p className="text-slate-400 text-xs">{policy.agentName}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-white text-sm">{policy.productName}</p>
                          <p className="text-slate-400 text-xs">{policy.productCode}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <LobIcon className={`w-4 h-4 ${lobConfig[policy.lineOfBusiness]?.color}`} />
                          <span className="text-white text-sm">{policy.lineOfBusiness}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-white text-sm">{policy.effectiveDate}</TableCell>
                      <TableCell className="text-cyan-400 font-mono">TT${policy.premiumAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-purple-400 font-mono">TT${policy.sumInsured.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={statusConfig[policy.status]?.color}>
                          {statusConfig[policy.status]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" className="text-blue-400 hover:text-white hover:bg-blue-500/10" onClick={() => { setSelectedPolicy(policy); setShowPolicyDetail(true); }}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-emerald-400 hover:text-white hover:bg-emerald-500/10">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Policy Detail Dialog */}
      <Dialog open={showPolicyDetail} onOpenChange={setShowPolicyDetail}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              {selectedPolicy?.policyNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedPolicy && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2">
                <Badge className={statusConfig[selectedPolicy.status]?.color}>
                  {statusConfig[selectedPolicy.status]?.label}
                </Badge>
                <span className="text-slate-400 text-sm">{selectedPolicy.productName}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                  <h4 className="text-sm text-blue-400 uppercase mb-3">Insured Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-400">Name</span><span className="text-white">{selectedPolicy.insuredName}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Email</span><span className="text-white">{selectedPolicy.insuredEmail}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Phone</span><span className="text-white">{selectedPolicy.insuredPhone}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Risk Rating</span><span className="text-white">{selectedPolicy.riskRating}</span></div>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                  <h4 className="text-sm text-cyan-400 uppercase mb-3">Coverage Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-400">Effective</span><span className="text-white">{selectedPolicy.effectiveDate}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Expiry</span><span className="text-white">{selectedPolicy.expiryDate}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Premium</span><span className="text-cyan-400 font-mono">TT${selectedPolicy.premiumAmount.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Sum Insured</span><span className="text-purple-400 font-mono">TT${selectedPolicy.sumInsured.toLocaleString()}</span></div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                <h4 className="text-sm text-emerald-400 uppercase mb-3">Distribution</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">Agent Code</span><span className="text-white">{selectedPolicy.agentCode}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Agent Name</span><span className="text-white">{selectedPolicy.agentName}</span></div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="border-slate-600 text-slate-300" onClick={() => setShowPolicyDetail(false)}>Close</Button>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">Edit Policy</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Policy Dialog */}
      <Dialog open={showNewPolicy} onOpenChange={setShowNewPolicy}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-400" />
              New Policy Application
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 uppercase mb-2 block">First Name</label>
                <Input className="bg-slate-800/50 border-slate-600 text-white" placeholder="Enter first name" />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase mb-2 block">Last Name</label>
                <Input className="bg-slate-800/50 border-slate-600 text-white" placeholder="Enter last name" />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase mb-2 block">Email</label>
                <Input className="bg-slate-800/50 border-slate-600 text-white" type="email" placeholder="Enter email" />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase mb-2 block">Phone</label>
                <Input className="bg-slate-800/50 border-slate-600 text-white" placeholder="868-XXX-XXXX" />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase mb-2 block">Product</label>
                <Select>
                  <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white"><SelectValue placeholder="Select product" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TERM-20">Term Life 20 Year</SelectItem>
                    <SelectItem value="COMPREHENSIVE-MOTOR">Comprehensive Motor</SelectItem>
                    <SelectItem value="HOMEOWNERS-PLUS">Homeowners Plus</SelectItem>
                    <SelectItem value="HEALTH-EXECUTIVE">Executive Health Plan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase mb-2 block">Agent</label>
                <Select>
                  <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white"><SelectValue placeholder="Select agent" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AGT-001">Robert Johnson</SelectItem>
                    <SelectItem value="AGT-002">Sarah Williams</SelectItem>
                    <SelectItem value="AGT-003">Michael Brown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase mb-2 block">Sum Insured</label>
                <Input className="bg-slate-800/50 border-slate-600 text-white" type="number" placeholder="Enter sum insured" />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase mb-2 block">Effective Date</label>
                <Input className="bg-slate-800/50 border-slate-600 text-white" type="date" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-slate-600 text-slate-300" onClick={() => setShowNewPolicy(false)}>Cancel</Button>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">Create Quote</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
