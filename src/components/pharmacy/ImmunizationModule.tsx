'use client';

import React, { useState } from 'react';
import {
  Syringe,
  Calendar,
  User,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  Clock,
  CheckCircle,
  AlertTriangle,
  Shield,
  FileText,
  Eye,
  Edit2,
  ChevronRight,
  Activity,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Mock immunization data
const mockImmunizations = [
  {
    id: '1',
    patientId: 'PAT-001',
    patientName: 'Maria Garcia',
    patientDob: '1985-03-15',
    vaccineName: 'Influenza (Flu) 2024',
    vaccineCode: '140',
    manufacturer: 'Sanofi',
    lotNumber: 'FLU-2024-001',
    expirationDate: '2024-06-30',
    administrationDate: '2024-01-15',
    administrationSite: 'Left Arm (Deltoid)',
    route: 'IM',
    doseNumber: 1,
    dosesInSeries: 1,
    administeringPharmacist: 'John Smith, RPh',
    pharmacistLicense: 'RPh-12345',
    visGiven: true,
    visDate: '2023-08-01'
  },
  {
    id: '2',
    patientId: 'PAT-002',
    patientName: 'Carlos Rodriguez',
    patientDob: '1972-08-22',
    vaccineName: 'COVID-19 Bivalent Booster',
    vaccineCode: '511',
    manufacturer: 'Pfizer',
    lotNumber: 'COVID-B123',
    expirationDate: '2024-03-15',
    administrationDate: '2024-01-14',
    administrationSite: 'Right Arm (Deltoid)',
    route: 'IM',
    doseNumber: 2,
    dosesInSeries: 2,
    nextDoseDate: null,
    administeringPharmacist: 'Jane Doe, RPh',
    pharmacistLicense: 'RPh-12346',
    visGiven: true,
    visDate: '2023-09-01'
  },
  {
    id: '3',
    patientId: 'PAT-003',
    patientName: 'Ana Martinez',
    patientDob: '1990-12-03',
    vaccineName: 'Hepatitis B (Engerix-B)',
    vaccineCode: '43',
    manufacturer: 'GSK',
    lotNumber: 'HEP-G456',
    expirationDate: '2025-01-20',
    administrationDate: '2024-01-10',
    administrationSite: 'Left Arm (Deltoid)',
    route: 'IM',
    doseNumber: 1,
    dosesInSeries: 3,
    nextDoseDate: '2024-02-10',
    administeringPharmacist: 'John Smith, RPh',
    pharmacistLicense: 'RPh-12345',
    visGiven: true,
    visDate: '2022-07-01'
  }
];

const vaccineCatalog = [
  { name: 'Influenza (Flu) 2024', code: '140', manufacturer: 'Sanofi', type: 'Seasonal' },
  { name: 'COVID-19 Bivalent Booster', code: '511', manufacturer: 'Pfizer', type: 'COVID-19' },
  { name: 'COVID-19 Bivalent Booster', code: '512', manufacturer: 'Moderna', type: 'COVID-19' },
  { name: 'Hepatitis B (Engerix-B)', code: '43', manufacturer: 'GSK', type: 'Hepatitis' },
  { name: 'Shingrix (Shingles)', code: '187', manufacturer: 'GSK', type: 'Shingles' },
  { name: 'Pneumococcal 23 (Pneumovax)', code: '33', manufacturer: 'Merck', type: 'Pneumococcal' },
  { name: 'Tdap (Tetanus/Diphtheria/Pertussis)', code: '115', manufacturer: 'Sanofi', type: 'Tdap' },
  { name: 'HPV (Gardasil 9)', code: '162', manufacturer: 'Merck', type: 'HPV' }
];

const scheduledImmunizations = [
  { patientName: 'Luis Hernandez', vaccine: 'Hepatitis B Dose 2', dueDate: '2024-02-10', status: 'due_soon' },
  { patientName: 'Sofia Lopez', vaccine: 'COVID-19 Booster', dueDate: '2024-01-20', status: 'overdue' },
  { patientName: 'Pedro Sanchez', vaccine: 'Shingrix Dose 2', dueDate: '2024-03-15', status: 'scheduled' }
];

export default function ImmunizationModule() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewImmunization, setShowNewImmunization] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState('');
  const [activeTab, setActiveTab] = useState('records');

  const filteredRecords = mockImmunizations.filter(imm => 
    imm.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    imm.vaccineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    imm.lotNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050410] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center">
              <Syringe className="w-5 h-5 text-white" />
            </div>
            Immunization Tracking
          </h1>
          <p className="text-[#10B981]/70 text-sm mt-1">
            Manage vaccinations and immunization records
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-[rgba(16,185,129,0.3)] text-[#10B981]">
            <Download className="w-4 h-4 mr-2" />
            Export Records
          </Button>
          <Button className="bg-[#10B981] hover:bg-[#10B981]/80 text-white" onClick={() => setShowNewImmunization(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Record Vaccination
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#10B981]/20 flex items-center justify-center">
                <Syringe className="w-5 h-5 text-[#10B981]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{mockImmunizations.length}</p>
                <p className="text-xs text-white/50">This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">12</p>
                <p className="text-xs text-white/50">Scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[rgba(249,115,22,0.03)] border-[rgba(249,115,22,0.15)]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">3</p>
                <p className="text-xs text-white/50">Due Soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[rgba(239,68,68,0.03)] border-[rgba(239,68,68,0.15)]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">1</p>
                <p className="text-xs text-white/50">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[rgba(16,185,129,0.1)] mb-4">
          <TabsTrigger value="records" className="data-[state=active]:bg-[#10B981] data-[state=active]:text-white">
            Records
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="data-[state=active]:bg-[#10B981] data-[state=active]:text-white">
            Scheduled
          </TabsTrigger>
          <TabsTrigger value="catalog" className="data-[state=active]:bg-[#10B981] data-[state=active]:text-white">
            Vaccine Catalog
          </TabsTrigger>
        </TabsList>

        <TabsContent value="records">
          {/* Search */}
          <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)] mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#10B981]/50 w-4 h-4" />
                <Input
                  placeholder="Search by patient, vaccine, or lot number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white placeholder:text-white/40"
                />
              </div>
            </CardContent>
          </Card>

          {/* Immunization Records Table */}
          <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader className="sticky top-0 bg-[#0A0820]">
                    <TableRow className="border-b border-[rgba(16,185,129,0.1)] hover:bg-transparent">
                      <TableHead className="text-[#10B981]">Date</TableHead>
                      <TableHead className="text-[#10B981]">Patient</TableHead>
                      <TableHead className="text-[#10B981]">Vaccine</TableHead>
                      <TableHead className="text-[#10B981]">Lot #</TableHead>
                      <TableHead className="text-[#10B981]">Site</TableHead>
                      <TableHead className="text-[#10B981]">Dose</TableHead>
                      <TableHead className="text-[#10B981]">Pharmacist</TableHead>
                      <TableHead className="text-[#10B981]">VIS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((imm) => (
                      <TableRow key={imm.id} className="border-b border-[rgba(16,185,129,0.05)] hover:bg-[rgba(16,185,129,0.05)]">
                        <TableCell className="text-white font-mono text-sm">
                          {new Date(imm.administrationDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-white">
                          <p className="font-medium">{imm.patientName}</p>
                          <p className="text-xs text-white/50">DOB: {new Date(imm.patientDob).toLocaleDateString()}</p>
                        </TableCell>
                        <TableCell className="text-white">
                          <p>{imm.vaccineName}</p>
                          <p className="text-xs text-white/50">{imm.manufacturer}</p>
                        </TableCell>
                        <TableCell className="text-white font-mono text-sm">{imm.lotNumber}</TableCell>
                        <TableCell className="text-white/70 text-sm">{imm.administrationSite}</TableCell>
                        <TableCell className="text-white">
                          <Badge className="bg-[#10B981]/20 text-[#10B981]">
                            {imm.doseNumber}/{imm.dosesInSeries}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white/70 text-sm">{imm.administeringPharmacist}</TableCell>
                        <TableCell>
                          {imm.visGiven ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-400" />
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

        <TabsContent value="scheduled">
          <div className="space-y-4">
            {scheduledImmunizations.map((item, idx) => (
              <Card key={idx} className={`bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)] ${
                item.status === 'overdue' ? 'border-l-4 border-l-red-500' : 
                item.status === 'due_soon' ? 'border-l-4 border-l-orange-500' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[#10B981]/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-[#10B981]" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{item.patientName}</p>
                        <p className="text-white/60 text-sm">{item.vaccine}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white/50 text-sm">Due: {new Date(item.dueDate).toLocaleDateString()}</p>
                      <Badge className={`mt-1 ${
                        item.status === 'overdue' ? 'bg-red-500/20 text-red-300' :
                        item.status === 'due_soon' ? 'bg-orange-500/20 text-orange-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {item.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <Button className="ml-4 bg-[#10B981] hover:bg-[#10B981]/80 text-white">
                      Record
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="catalog">
          <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[rgba(16,185,129,0.1)] hover:bg-transparent">
                    <TableHead className="text-[#10B981]">Vaccine Name</TableHead>
                    <TableHead className="text-[#10B981]">CVX Code</TableHead>
                    <TableHead className="text-[#10B981]">Manufacturer</TableHead>
                    <TableHead className="text-[#10B981]">Type</TableHead>
                    <TableHead className="text-[#10B981]">Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vaccineCatalog.map((vaccine, idx) => (
                    <TableRow key={idx} className="border-b border-[rgba(16,185,129,0.05)] hover:bg-[rgba(16,185,129,0.05)]">
                      <TableCell className="text-white font-medium">{vaccine.name}</TableCell>
                      <TableCell className="text-[#10B981] font-mono">{vaccine.code}</TableCell>
                      <TableCell className="text-white/70">{vaccine.manufacturer}</TableCell>
                      <TableCell>
                        <Badge className="bg-[#10B981]/20 text-[#10B981]">{vaccine.type}</Badge>
                      </TableCell>
                      <TableCell className="text-white">
                        <Badge className="bg-emerald-500/20 text-emerald-300">In Stock</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Immunization Dialog */}
      <Dialog open={showNewImmunization} onOpenChange={setShowNewImmunization}>
        <DialogContent className="bg-[#0A0820] border-[rgba(16,185,129,0.2)] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Syringe className="w-5 h-5 text-[#10B981]" />
              Record New Vaccination
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-white/70">Patient *</Label>
              <Input className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white" placeholder="Search patient..." />
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Vaccine *</Label>
              <Select value={selectedVaccine} onValueChange={setSelectedVaccine}>
                <SelectTrigger className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white">
                  <SelectValue placeholder="Select vaccine" />
                </SelectTrigger>
                <SelectContent>
                  {vaccineCatalog.map((v) => (
                    <SelectItem key={v.code} value={v.code}>{v.name} ({v.manufacturer})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Lot Number *</Label>
              <Input className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white" placeholder="Enter lot number" />
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Expiration Date *</Label>
              <Input type="date" className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Administration Site</Label>
              <Select>
                <SelectTrigger className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white">
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left_arm">Left Arm (Deltoid)</SelectItem>
                  <SelectItem value="right_arm">Right Arm (Deltoid)</SelectItem>
                  <SelectItem value="left_thigh">Left Thigh</SelectItem>
                  <SelectItem value="right_thigh">Right Thigh</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Dose Number</Label>
              <Select>
                <SelectTrigger className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white">
                  <SelectValue placeholder="Select dose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Dose 1 of 1</SelectItem>
                  <SelectItem value="2">Dose 1 of 2</SelectItem>
                  <SelectItem value="3">Dose 2 of 2</SelectItem>
                  <SelectItem value="4">Dose 1 of 3</SelectItem>
                  <SelectItem value="5">Dose 2 of 3</SelectItem>
                  <SelectItem value="6">Dose 3 of 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                <input type="checkbox" className="rounded border-[rgba(16,185,129,0.3)] bg-[rgba(16,185,129,0.05)]" />
                <FileText className="w-4 h-4 text-[#10B981]" />
                Vaccine Information Statement (VIS) provided
              </label>
            </div>
            <div className="col-span-2 space-y-2">
              <Label className="text-white/70">Notes</Label>
              <Textarea className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white" placeholder="Any additional notes..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-[rgba(16,185,129,0.3)] text-[#10B981]" onClick={() => setShowNewImmunization(false)}>
              Cancel
            </Button>
            <Button className="bg-[#10B981] hover:bg-[#10B981]/80 text-white">
              Record Vaccination
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
