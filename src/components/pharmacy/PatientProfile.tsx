'use client';

import React, { useState } from 'react';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertTriangle,
  Pill,
  FileText,
  Shield,
  CreditCard,
  Clock,
  Plus,
  Search,
  Edit2,
  Eye,
  ChevronRight,
  Activity,
  Heart,
  Syringe,
  Truck,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Mock patient data
const mockPatients = [
  {
    id: 'PAT-001',
    patientNumber: 'PH-2024-00001',
    firstName: 'Maria',
    lastName: 'Garcia',
    fullName: 'Maria Garcia',
    dateOfBirth: '1985-03-15',
    gender: 'Female',
    phone: '(868) 555-0101',
    email: 'maria.garcia@email.com',
    address: '123 Frederick Street, Port of Spain',
    allergies: [
      { name: 'Penicillin', severity: 'severe', reaction: 'Anaphylaxis' },
      { name: 'Sulfa drugs', severity: 'moderate', reaction: 'Rash' }
    ],
    conditions: ['Type 2 Diabetes', 'Hypertension', 'Hyperlipidemia'],
    currentMedications: [
      { name: 'Metformin 850mg', frequency: 'Twice daily', refillsLeft: 3, nextRefill: '2024-02-15' },
      { name: 'Lisinopril 10mg', frequency: 'Once daily', refillsLeft: 5, nextRefill: '2024-02-20' },
      { name: 'Atorvastatin 20mg', frequency: 'Once daily at bedtime', refillsLeft: 2, nextRefill: '2024-01-28' }
    ],
    insurance: {
      primary: 'National Insurance',
      primaryId: 'NI-123456789',
      copay: 25.00
    },
    adherenceScore: 87,
    totalFills: 156,
    totalSpent: 4250.00,
    lastVisit: '2024-01-10'
  },
  {
    id: 'PAT-002',
    patientNumber: 'PH-2024-00002',
    firstName: 'Carlos',
    lastName: 'Rodriguez',
    fullName: 'Carlos Rodriguez',
    dateOfBirth: '1972-08-22',
    gender: 'Male',
    phone: '(868) 555-0102',
    email: 'carlos.r@email.com',
    address: '456 Charlotte Street, San Fernando',
    allergies: [],
    conditions: ['Asthma', 'GERD'],
    currentMedications: [
      { name: 'Albuterol Inhaler', frequency: 'As needed', refillsLeft: 1, nextRefill: '2024-01-25' },
      { name: 'Omeprazole 20mg', frequency: 'Once daily', refillsLeft: 4, nextRefill: '2024-02-10' }
    ],
    insurance: {
      primary: 'Green Shield',
      primaryId: 'GS-987654321',
      copay: 15.00
    },
    adherenceScore: 92,
    totalFills: 89,
    totalSpent: 2150.00,
    lastVisit: '2024-01-12'
  }
];

const mockMedicationHistory = [
  { date: '2024-01-10', drug: 'Metformin 850mg', quantity: 60, prescriber: 'Dr. Wilson', status: 'filled' },
  { date: '2024-01-10', drug: 'Lisinopril 10mg', quantity: 30, prescriber: 'Dr. Chen', status: 'filled' },
  { date: '2023-12-15', drug: 'Atorvastatin 20mg', quantity: 30, prescriber: 'Dr. Wilson', status: 'filled' },
  { date: '2023-12-01', drug: 'Metformin 850mg', quantity: 60, prescriber: 'Dr. Wilson', status: 'filled' },
  { date: '2023-11-15', drug: 'Lisinopril 10mg', quantity: 30, prescriber: 'Dr. Chen', status: 'filled' }
];

const mockImmunizations = [
  { date: '2023-10-15', vaccine: 'Influenza (Flu)', lot: 'FLU-2023-001', site: 'Left Arm', pharmacist: 'John Smith, RPh' },
  { date: '2023-05-20', vaccine: 'COVID-19 Booster', lot: 'COVID-B123', site: 'Right Arm', pharmacist: 'Jane Doe, RPh' },
  { date: '2022-10-10', vaccine: 'Influenza (Flu)', lot: 'FLU-2022-042', site: 'Left Arm', pharmacist: 'John Smith, RPh' }
];

export default function PatientProfile() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<typeof mockPatients[0]>(mockPatients[0]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'moderate': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'mild': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getAdherenceColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-[#050410] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            Patient Medication Records (PMR)
          </h1>
          <p className="text-[#10B981]/70 text-sm mt-1">
            Complete patient profiles, allergies, and medication history
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="bg-[#10B981] hover:bg-[#10B981]/80 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Patient
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)] mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#10B981]/50 w-4 h-4" />
            <Input
              placeholder="Search by patient name, ID, or phone number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white placeholder:text-white/40"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Patient List Sidebar */}
        <div className="lg:col-span-1">
          <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
            <CardHeader className="border-b border-[rgba(16,185,129,0.1)]">
              <CardTitle className="text-white text-sm">Recent Patients</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                {mockPatients.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient)}
                    className={`p-4 border-b border-[rgba(16,185,129,0.05)] cursor-pointer transition-all ${
                      selectedPatient.id === patient.id 
                        ? 'bg-[rgba(16,185,129,0.1)] border-l-4 border-l-[#10B981]' 
                        : 'hover:bg-[rgba(16,185,129,0.05)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 bg-[#10B981]/20">
                        <AvatarFallback className="text-[#10B981]">
                          {patient.firstName[0]}{patient.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{patient.fullName}</p>
                        <p className="text-white/50 text-xs">{patient.patientNumber}</p>
                        {patient.allergies.length > 0 && (
                          <Badge className="bg-red-500/20 text-red-300 text-xs mt-1">
                            {patient.allergies.length} Allergies
                          </Badge>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/30" />
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Patient Details */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-[rgba(16,185,129,0.1)] mb-4">
              <TabsTrigger value="overview" className="data-[state=active]:bg-[#10B981] data-[state=active]:text-white">Overview</TabsTrigger>
              <TabsTrigger value="medications" className="data-[state=active]:bg-[#10B981] data-[state=active]:text-white">Medications</TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-[#10B981] data-[state=active]:text-white">History</TabsTrigger>
              <TabsTrigger value="immunizations" className="data-[state=active]:bg-[#10B981] data-[state=active]:text-white">Immunizations</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Patient Info Card */}
                <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
                  <CardHeader className="border-b border-[rgba(16,185,129,0.1)]">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center gap-2">
                        <User className="w-5 h-5 text-[#10B981]" />
                        Patient Information
                      </CardTitle>
                      <Button size="sm" variant="ghost" className="text-[#10B981]" onClick={() => setShowEditDialog(true)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="w-16 h-16 bg-[#10B981]/20">
                        <AvatarFallback className="text-[#10B981] text-xl">
                          {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-white text-lg font-semibold">{selectedPatient.fullName}</h3>
                        <p className="text-white/50 text-sm">{selectedPatient.patientNumber}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-[#10B981]/50" />
                        <span className="text-white/50">DOB:</span>
                        <span className="text-white">{new Date(selectedPatient.dateOfBirth).toLocaleDateString()}</span>
                        <span className="text-white/30">({new Date().getFullYear() - new Date(selectedPatient.dateOfBirth).getFullYear()} years)</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-[#10B981]/50" />
                        <span className="text-white">{selectedPatient.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-[#10B981]/50" />
                        <span className="text-white">{selectedPatient.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-[#10B981]/50" />
                        <span className="text-white">{selectedPatient.address}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Allergies Card */}
                <Card className="bg-[rgba(239,68,68,0.03)] border-[rgba(239,68,68,0.15)]">
                  <CardHeader className="border-b border-[rgba(239,68,68,0.1)]">
                    <CardTitle className="text-white flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      Allergies & Warnings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    {selectedPatient.allergies.length === 0 ? (
                      <p className="text-white/50 text-sm">No documented allergies</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedPatient.allergies.map((allergy, idx) => (
                          <div key={idx} className={`p-3 rounded-lg border ${getSeverityColor(allergy.severity)}`}>
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{allergy.name}</span>
                              <Badge className={`${getSeverityColor(allergy.severity)} text-xs`}>
                                {allergy.severity}
                              </Badge>
                            </div>
                            <p className="text-xs mt-1 opacity-70">Reaction: {allergy.reaction}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Conditions Card */}
                <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
                  <CardHeader className="border-b border-[rgba(16,185,129,0.1)]">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Heart className="w-5 h-5 text-[#10B981]" />
                      Medical Conditions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {selectedPatient.conditions.map((condition, idx) => (
                        <Badge key={idx} className="bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Adherence & Stats Card */}
                <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
                  <CardHeader className="border-b border-[rgba(16,185,129,0.1)]">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Activity className="w-5 h-5 text-[#10B981]" />
                      Adherence & Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="text-center mb-4">
                      <p className="text-4xl font-bold text-white">{selectedPatient.adherenceScore}%</p>
                      <p className={`text-sm ${getAdherenceColor(selectedPatient.adherenceScore)}`}>Adherence Score</p>
                      <Progress value={selectedPatient.adherenceScore} className="h-2 mt-2 bg-[rgba(16,185,129,0.1)]" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-white">{selectedPatient.totalFills}</p>
                        <p className="text-xs text-white/50">Total Fills</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-white font-mono">TT${selectedPatient.totalSpent.toLocaleString()}</p>
                        <p className="text-xs text-white/50">Total Spent</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Insurance Card */}
                <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)] md:col-span-2">
                  <CardHeader className="border-b border-[rgba(16,185,129,0.1)]">
                    <CardTitle className="text-white flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-[#10B981]" />
                      Insurance Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-white/50 uppercase">Primary Insurance</p>
                        <p className="text-white font-medium">{selectedPatient.insurance.primary}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/50 uppercase">Member ID</p>
                        <p className="text-white font-mono">{selectedPatient.insurance.primaryId}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/50 uppercase">Copay</p>
                        <p className="text-[#10B981] font-mono">TT${selectedPatient.insurance.copay.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="medications">
              <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
                <CardHeader className="border-b border-[rgba(16,185,129,0.1)]">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Pill className="w-5 h-5 text-[#10B981]" />
                    Current Medications
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {selectedPatient.currentMedications.map((med, idx) => (
                      <div key={idx} className="p-4 rounded-lg bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.1)]">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-white font-medium">{med.name}</p>
                            <p className="text-white/60 text-sm">{med.frequency}</p>
                          </div>
                          <div className="text-right">
                            <Badge className={`${med.refillsLeft <= 1 ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                              {med.refillsLeft} refills left
                            </Badge>
                            <p className="text-xs text-white/40 mt-1">Next refill: {med.nextRefill}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
                <CardHeader className="border-b border-[rgba(16,185,129,0.1)]">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#10B981]" />
                    Fill History
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[400px]">
                    {mockMedicationHistory.map((item, idx) => (
                      <div key={idx} className="p-4 border-b border-[rgba(16,185,129,0.05)] hover:bg-[rgba(16,185,129,0.02)]">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">{item.drug}</p>
                            <p className="text-white/50 text-sm">Qty: {item.quantity} | Prescriber: {item.prescriber}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white/70 text-sm">{new Date(item.date).toLocaleDateString()}</p>
                            <Badge className="bg-emerald-500/20 text-emerald-300 text-xs">{item.status}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="immunizations">
              <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
                <CardHeader className="border-b border-[rgba(16,185,129,0.1)]">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Syringe className="w-5 h-5 text-[#10B981]" />
                    Immunization Record
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {mockImmunizations.map((imm, idx) => (
                      <div key={idx} className="p-4 rounded-lg bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.1)]">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-white font-medium">{imm.vaccine}</p>
                            <p className="text-white/50 text-sm">Lot: {imm.lot} | Site: {imm.site}</p>
                            <p className="text-white/40 text-xs mt-1">Administered by: {imm.pharmacist}</p>
                          </div>
                          <p className="text-white/70 text-sm">{new Date(imm.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
