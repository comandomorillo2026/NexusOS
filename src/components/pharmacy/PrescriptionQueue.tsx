'use client';

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  User,
  Phone,
  Calendar,
  Pill,
  Search,
  Filter,
  Plus,
  Printer,
  Eye,
  Play,
  Pause,
  ChevronRight,
  AlertCircle,
  ShieldAlert,
  Snowflake
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { Textarea } from '@/components/ui/textarea';

// Mock prescription queue data
const mockPrescriptions = [
  {
    id: '1',
    prescriptionNumber: 'RX-2024-001234',
    patientId: 'PAT-001',
    patientName: 'Maria Garcia',
    patientDob: '1985-03-15',
    patientPhone: '(868) 555-0101',
    prescriberName: 'Dr. James Wilson',
    prescriberNpi: '1234567890',
    drugs: [{ name: 'Atorvastatin 20mg', quantity: 30, sig: 'Take 1 tablet by mouth daily' }],
    writtenDate: '2024-01-15',
    status: 'new',
    priority: 'routine',
    source: 'e-prescribe',
    refillsRemaining: 5,
    hasAlerts: false
  },
  {
    id: '2',
    prescriptionNumber: 'RX-2024-001235',
    patientId: 'PAT-002',
    patientName: 'Carlos Rodriguez',
    patientDob: '1972-08-22',
    patientPhone: '(868) 555-0102',
    prescriberName: 'Dr. Sarah Chen',
    prescriberNpi: '1234567891',
    drugs: [{ name: 'Metformin 850mg', quantity: 60, sig: 'Take 1 tablet by mouth twice daily with meals' }],
    writtenDate: '2024-01-15',
    status: 'in_progress',
    priority: 'urgent',
    source: 'paper',
    refillsRemaining: 3,
    hasAlerts: true,
    alerts: [{ type: 'drug_interaction', severity: 'medium', message: 'Potential interaction with Lisinopril' }]
  },
  {
    id: '3',
    prescriptionNumber: 'RX-2024-001236',
    patientId: 'PAT-003',
    patientName: 'Ana Martinez',
    patientDob: '1990-12-03',
    patientPhone: '(868) 555-0103',
    prescriberName: 'Dr. Michael Brown',
    prescriberNpi: '1234567892',
    drugs: [{ name: 'Amoxicillin 500mg', quantity: 21, sig: 'Take 1 capsule by mouth three times daily for 7 days' }],
    writtenDate: '2024-01-15',
    status: 'dur_review',
    priority: 'stat',
    source: 'phone',
    refillsRemaining: 0,
    hasAlerts: true,
    alerts: [{ type: 'allergy', severity: 'critical', message: 'Patient has documented Penicillin allergy' }]
  },
  {
    id: '4',
    prescriptionNumber: 'RX-2024-001237',
    patientId: 'PAT-004',
    patientName: 'Luis Hernandez',
    patientDob: '1968-05-28',
    patientPhone: '(868) 555-0104',
    prescriberName: 'Dr. Emily Davis',
    prescriberNpi: '1234567893',
    drugs: [
      { name: 'Lisinopril 10mg', quantity: 30, sig: 'Take 1 tablet by mouth daily' },
      { name: 'Hydrochlorothiazide 25mg', quantity: 30, sig: 'Take 1 tablet by mouth daily' }
    ],
    writtenDate: '2024-01-15',
    status: 'ready',
    priority: 'routine',
    source: 'e-prescribe',
    refillsRemaining: 2,
    hasAlerts: false
  },
  {
    id: '5',
    prescriptionNumber: 'RX-2024-001238',
    patientId: 'PAT-005',
    patientName: 'Sofia Lopez',
    patientDob: '1955-09-10',
    patientPhone: '(868) 555-0105',
    prescriberName: 'Dr. Robert Taylor',
    prescriberNpi: '1234567894',
    drugs: [{ name: 'Insulin Glargine 100u/mL', quantity: 1, sig: 'Inject 20 units subcutaneously once daily at bedtime' }],
    writtenDate: '2024-01-15',
    status: 'filled',
    priority: 'routine',
    source: 'paper',
    refillsRemaining: 5,
    hasAlerts: false
  },
  {
    id: '6',
    prescriptionNumber: 'RX-2024-001239',
    patientId: 'PAT-006',
    patientName: 'Pedro Sanchez',
    patientDob: '1980-02-14',
    patientPhone: '(868) 555-0106',
    prescriberName: 'Dr. James Wilson',
    prescriberNpi: '1234567890',
    drugs: [{ name: 'Oxycodone 10mg ER', quantity: 60, sig: 'Take 1 tablet by mouth every 12 hours as needed for pain' }],
    writtenDate: '2024-01-15',
    status: 'new',
    priority: 'urgent',
    source: 'paper',
    refillsRemaining: 0,
    hasAlerts: true,
    alerts: [{ type: 'controlled', severity: 'high', message: 'Schedule II controlled substance - verify DEA' }]
  }
];

const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  new: { color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: <AlertCircle className="w-3 h-3" />, label: 'New' },
  in_progress: { color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', icon: <Play className="w-3 h-3" />, label: 'In Progress' },
  dur_review: { color: 'bg-orange-500/20 text-orange-300 border-orange-500/30', icon: <AlertTriangle className="w-3 h-3" />, label: 'DUR Review' },
  ready: { color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: <CheckCircle className="w-3 h-3" />, label: 'Ready' },
  filled: { color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', icon: <CheckCircle className="w-3 h-3" />, label: 'Filled' },
  cancelled: { color: 'bg-red-500/20 text-red-300 border-red-500/30', icon: <XCircle className="w-3 h-3" />, label: 'Cancelled' }
};

const priorityConfig: Record<string, { color: string; label: string }> = {
  routine: { color: 'bg-gray-500/20 text-gray-300', label: 'Routine' },
  urgent: { color: 'bg-orange-500/20 text-orange-300', label: 'Urgent' },
  stat: { color: 'bg-red-500/20 text-red-300', label: 'STAT' }
};

export default function PrescriptionQueue() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedRx, setSelectedRx] = useState<typeof mockPrescriptions[0] | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('queue');

  const filteredPrescriptions = useMemo(() => {
    return mockPrescriptions.filter(rx => {
      const matchesSearch = 
        rx.prescriptionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rx.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rx.drugs.some(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = selectedStatus === 'all' || rx.status === selectedStatus;
      const matchesPriority = selectedPriority === 'all' || rx.priority === selectedPriority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [searchTerm, selectedStatus, selectedPriority]);

  const queueStats = useMemo(() => {
    return {
      new: mockPrescriptions.filter(r => r.status === 'new').length,
      inProgress: mockPrescriptions.filter(r => r.status === 'in_progress').length,
      durReview: mockPrescriptions.filter(r => r.status === 'dur_review').length,
      ready: mockPrescriptions.filter(r => r.status === 'ready').length,
      alerts: mockPrescriptions.filter(r => r.hasAlerts).length
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#050410] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            Prescription Queue
          </h1>
          <p className="text-[#10B981]/70 text-sm mt-1">
            Process and manage incoming prescriptions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-[rgba(16,185,129,0.3)] text-[#10B981]">
            <Printer className="w-4 h-4 mr-2" />
            Print Labels
          </Button>
          <Button className="bg-[#10B981] hover:bg-[#10B981]/80 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Prescription
          </Button>
        </div>
      </div>

      {/* Queue Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card 
          className={`bg-[rgba(59,130,246,0.05)] border-[rgba(59,130,246,0.2)] cursor-pointer transition-all ${selectedStatus === 'new' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => setSelectedStatus(selectedStatus === 'new' ? 'all' : 'new')}
        >
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-400">{queueStats.new}</p>
            <p className="text-xs text-blue-400/70 uppercase">New</p>
          </CardContent>
        </Card>
        <Card 
          className={`bg-[rgba(234,179,8,0.05)] border-[rgba(234,179,8,0.2)] cursor-pointer transition-all ${selectedStatus === 'in_progress' ? 'ring-2 ring-yellow-500' : ''}`}
          onClick={() => setSelectedStatus(selectedStatus === 'in_progress' ? 'all' : 'in_progress')}
        >
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-yellow-400">{queueStats.inProgress}</p>
            <p className="text-xs text-yellow-400/70 uppercase">In Progress</p>
          </CardContent>
        </Card>
        <Card 
          className={`bg-[rgba(249,115,22,0.05)] border-[rgba(249,115,22,0.2)] cursor-pointer transition-all ${selectedStatus === 'dur_review' ? 'ring-2 ring-orange-500' : ''}`}
          onClick={() => setSelectedStatus(selectedStatus === 'dur_review' ? 'all' : 'dur_review')}
        >
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-orange-400">{queueStats.durReview}</p>
            <p className="text-xs text-orange-400/70 uppercase">DUR Review</p>
          </CardContent>
        </Card>
        <Card 
          className={`bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] cursor-pointer transition-all ${selectedStatus === 'ready' ? 'ring-2 ring-emerald-500' : ''}`}
          onClick={() => setSelectedStatus(selectedStatus === 'ready' ? 'all' : 'ready')}
        >
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-emerald-400">{queueStats.ready}</p>
            <p className="text-xs text-emerald-400/70 uppercase">Ready</p>
          </CardContent>
        </Card>
        <Card className="bg-[rgba(239,68,68,0.05)] border-[rgba(239,68,68,0.2)]">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-red-400">{queueStats.alerts}</p>
            <p className="text-xs text-red-400/70 uppercase">Alerts</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)] mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#10B981]/50 w-4 h-4" />
              <Input
                placeholder="Search by Rx#, patient, or drug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white placeholder:text-white/40"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="dur_review">DUR Review</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="filled">Filled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="stat">STAT</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="routine">Routine</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Prescription List */}
      <div className="grid lg:grid-cols-2 gap-4">
        {filteredPrescriptions.map((rx) => (
          <Card 
            key={rx.id}
            className={`bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)] hover:border-[rgba(16,185,129,0.3)] cursor-pointer transition-all ${rx.hasAlerts ? 'border-l-4 border-l-orange-500' : ''}`}
            onClick={() => {
              setSelectedRx(rx);
              setShowDetails(true);
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge className={`${statusConfig[rx.status].color} border flex items-center gap-1`}>
                    {statusConfig[rx.status].icon}
                    {statusConfig[rx.status].label}
                  </Badge>
                  <Badge className={priorityConfig[rx.priority].color}>
                    {priorityConfig[rx.priority].label}
                  </Badge>
                </div>
                <span className="font-mono text-[#10B981] text-sm">{rx.prescriptionNumber}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#10B981]/50" />
                  <span className="text-white font-medium">{rx.patientName}</span>
                  {rx.patientDob && (
                    <span className="text-white/40 text-sm">DOB: {new Date(rx.patientDob).toLocaleDateString()}</span>
                  )}
                </div>
                
                {rx.drugs.map((drug, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Pill className="w-4 h-4 text-[#10B981]/50 mt-0.5" />
                    <div>
                      <p className="text-white text-sm">{drug.name}</p>
                      <p className="text-white/50 text-xs">{drug.sig}</p>
                    </div>
                  </div>
                ))}
                
                <div className="flex items-center justify-between text-xs text-white/40">
                  <span>Prescriber: {rx.prescriberName}</span>
                  <span>Refills: {rx.refillsRemaining}</span>
                </div>
              </div>

              {rx.hasAlerts && rx.alerts && (
                <div className="mt-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-2 text-red-400 text-xs">
                    <AlertTriangle className="w-3 h-3" />
                    {rx.alerts[0].message}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Prescription Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="bg-[#0A0820] border-[rgba(16,185,129,0.2)] text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#10B981]" />
              {selectedRx?.prescriptionNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedRx && (
            <div className="grid grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.1)]">
                  <h4 className="text-sm text-[#10B981] uppercase mb-3">Patient Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-white/40" />
                      <span className="text-white font-medium">{selectedRx.patientName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-white/40" />
                      <span className="text-white/70">DOB: {new Date(selectedRx.patientDob).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-white/40" />
                      <span className="text-white/70">{selectedRx.patientPhone}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.1)]">
                  <h4 className="text-sm text-[#10B981] uppercase mb-3">Prescriber</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-white font-medium">{selectedRx.prescriberName}</p>
                    <p className="text-white/50 text-xs">NPI: {selectedRx.prescriberNpi}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.1)]">
                  <h4 className="text-sm text-[#10B981] uppercase mb-3">Medications</h4>
                  <div className="space-y-3">
                    {selectedRx.drugs.map((drug, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-[rgba(16,185,129,0.03)]">
                        <p className="text-white font-medium">{drug.name}</p>
                        <p className="text-[#10B981] text-xs mt-1">Qty: {drug.quantity}</p>
                        <p className="text-white/60 text-sm mt-1">{drug.sig}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {selectedRx.hasAlerts && selectedRx.alerts && (
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                    <h4 className="text-sm text-red-400 uppercase mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      DUR Alerts
                    </h4>
                    <div className="space-y-2">
                      {selectedRx.alerts.map((alert, idx) => (
                        <div key={idx} className="text-sm">
                          <Badge className={`text-xs ${
                            alert.severity === 'critical' ? 'bg-red-500/20 text-red-300' :
                            alert.severity === 'high' ? 'bg-orange-500/20 text-orange-300' :
                            'bg-yellow-500/20 text-yellow-300'
                          }`}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <p className="text-white mt-1">{alert.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            <Button variant="outline" className="border-[rgba(16,185,129,0.3)] text-[#10B981]" onClick={() => setShowDetails(false)}>
              Close
            </Button>
            <Button className="bg-[#10B981] hover:bg-[#10B981]/80 text-white">
              Process Prescription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
