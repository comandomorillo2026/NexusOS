'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Filter,
  Download,
  Pill,
  AlertTriangle,
  Snowflake,
  ShieldAlert,
  Eye,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Barcode,
  DollarSign,
  Package,
  Info,
  X
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Mock drug database
const mockDrugs = [
  {
    id: '1',
    ndc: '0093-3107-01',
    drugName: 'Atorvastatin Calcium',
    brandName: 'Lipitor',
    strength: '10mg',
    dosageForm: 'Tablet',
    route: 'Oral',
    manufacturer: 'Teva Pharmaceuticals',
    therapeuticClass: 'Antilipemic Agents',
    deaSchedule: null,
    cost: 12.50,
    retailPrice: 35.99,
    awp: 28.75,
    packageSize: 90,
    storageRequirements: 'Room Temperature',
    controlledSubstance: false,
    highRisk: false,
    lookSound: false,
    isActive: true
  },
  {
    id: '2',
    ndc: '00591-5623-01',
    drugName: 'Metformin Hydrochloride',
    brandName: 'Glucophage',
    strength: '500mg',
    dosageForm: 'Tablet',
    route: 'Oral',
    manufacturer: 'Mylan Pharmaceuticals',
    therapeuticClass: 'Antidiabetic Agents',
    deaSchedule: null,
    cost: 8.25,
    retailPrice: 22.50,
    awp: 18.00,
    packageSize: 100,
    storageRequirements: 'Room Temperature',
    controlledSubstance: false,
    highRisk: false,
    lookSound: false,
    isActive: true
  },
  {
    id: '3',
    ndc: '00093-7184-01',
    drugName: 'Lisinopril',
    brandName: 'Prinivil/Zestril',
    strength: '10mg',
    dosageForm: 'Tablet',
    route: 'Oral',
    manufacturer: 'Teva Pharmaceuticals',
    therapeuticClass: 'ACE Inhibitors',
    deaSchedule: null,
    cost: 9.75,
    retailPrice: 28.50,
    awp: 22.00,
    packageSize: 100,
    storageRequirements: 'Room Temperature',
    controlledSubstance: false,
    highRisk: false,
    lookSound: true,
    isActive: true
  },
  {
    id: '4',
    ndc: '00406-0512-01',
    drugName: 'Alprazolam',
    brandName: 'Xanax',
    strength: '0.5mg',
    dosageForm: 'Tablet',
    route: 'Oral',
    manufacturer: 'Mallinckrodt',
    therapeuticClass: 'Benzodiazepines',
    deaSchedule: 'IV',
    cost: 45.00,
    retailPrice: 89.99,
    awp: 72.50,
    packageSize: 100,
    storageRequirements: 'Room Temperature',
    controlledSubstance: true,
    highRisk: true,
    lookSound: false,
    isActive: true
  },
  {
    id: '5',
    ndc: '00781-1506-01',
    drugName: 'Amoxicillin',
    brandName: 'Amoxil',
    strength: '500mg',
    dosageForm: 'Capsule',
    route: 'Oral',
    manufacturer: 'Sandoz',
    therapeuticClass: 'Penicillins',
    deaSchedule: null,
    cost: 15.50,
    retailPrice: 42.00,
    awp: 35.00,
    packageSize: 30,
    storageRequirements: 'Room Temperature',
    controlledSubstance: false,
    highRisk: false,
    lookSound: false,
    isActive: true
  },
  {
    id: '6',
    ndc: '00069-3060-01',
    drugName: 'Insulin Glargine',
    brandName: 'Lantus',
    strength: '100 units/mL',
    dosageForm: 'Injection',
    route: 'Subcutaneous',
    manufacturer: 'Sanofi-Aventis',
    therapeuticClass: 'Insulins',
    deaSchedule: null,
    cost: 285.00,
    retailPrice: 425.00,
    awp: 375.00,
    packageSize: 1,
    storageRequirements: 'Refrigerate',
    controlledSubstance: false,
    highRisk: true,
    lookSound: false,
    isActive: true
  },
  {
    id: '7',
    ndc: '00456-1401-01',
    drugName: 'Oxycodone Hydrochloride',
    brandName: 'OxyContin',
    strength: '10mg',
    dosageForm: 'Tablet, Extended Release',
    route: 'Oral',
    manufacturer: 'Purdue Pharma',
    therapeuticClass: 'Opioid Analgesics',
    deaSchedule: 'II',
    cost: 125.00,
    retailPrice: 295.00,
    awp: 250.00,
    packageSize: 60,
    storageRequirements: 'Room Temperature',
    controlledSubstance: true,
    highRisk: true,
    lookSound: false,
    isActive: true
  },
  {
    id: '8',
    ndc: '00173-0713-01',
    drugName: 'Omeprazole',
    brandName: 'Prilosec',
    strength: '20mg',
    dosageForm: 'Capsule, Delayed Release',
    route: 'Oral',
    manufacturer: 'AstraZeneca',
    therapeuticClass: 'Proton Pump Inhibitors',
    deaSchedule: null,
    cost: 22.00,
    retailPrice: 55.00,
    awp: 45.00,
    packageSize: 30,
    storageRequirements: 'Room Temperature',
    controlledSubstance: false,
    highRisk: false,
    lookSound: false,
    isActive: true
  }
];

const therapeuticClasses = [
  'All',
  'Antilipemic Agents',
  'Antidiabetic Agents',
  'ACE Inhibitors',
  'Benzodiazepines',
  'Penicillins',
  'Insulins',
  'Opioid Analgesics',
  'Proton Pump Inhibitors',
  'Beta Blockers',
  'Calcium Channel Blockers',
  'Diuretics',
  'Anticoagulants'
];

const dosageForms = [
  'All',
  'Tablet',
  'Capsule',
  'Injection',
  'Solution',
  'Suspension',
  'Cream',
  'Ointment',
  'Suppository'
];

export default function DrugDatabase() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTherapeuticClass, setSelectedTherapeuticClass] = useState('All');
  const [selectedDosageForm, setSelectedDosageForm] = useState('All');
  const [showControlledOnly, setShowControlledOnly] = useState(false);
  const [showHighRiskOnly, setShowHighRiskOnly] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState<typeof mockDrugs[0] | null>(null);
  const [showDrugDetails, setShowDrugDetails] = useState(false);
  const [showAddDrug, setShowAddDrug] = useState(false);
  const [sortField, setSortField] = useState<string>('drugName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const filteredDrugs = useMemo(() => {
    return mockDrugs.filter(drug => {
      const matchesSearch = 
        drug.drugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drug.brandName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drug.ndc.includes(searchTerm);
      
      const matchesTherapeuticClass = 
        selectedTherapeuticClass === 'All' || drug.therapeuticClass === selectedTherapeuticClass;
      
      const matchesDosageForm = 
        selectedDosageForm === 'All' || drug.dosageForm === selectedDosageForm;
      
      const matchesControlled = !showControlledOnly || drug.controlledSubstance;
      const matchesHighRisk = !showHighRiskOnly || drug.highRisk;

      return matchesSearch && matchesTherapeuticClass && matchesDosageForm && matchesControlled && matchesHighRisk;
    }).sort((a, b) => {
      const aValue = a[sortField as keyof typeof a];
      const bValue = b[sortField as keyof typeof b];
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      if (sortDirection === 'asc') {
        return String(aValue).localeCompare(String(bValue));
      }
      return String(bValue).localeCompare(String(aValue));
    });
  }, [searchTerm, selectedTherapeuticClass, selectedDosageForm, showControlledOnly, showHighRiskOnly, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="min-h-screen bg-[#050410] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center">
              <Pill className="w-5 h-5 text-white" />
            </div>
            Drug Database
          </h1>
          <p className="text-[#10B981]/70 text-sm mt-1">
            {filteredDrugs.length} drugs in database
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-[rgba(16,185,129,0.3)] text-[#10B981]">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-[#10B981] hover:bg-[#10B981]/80 text-white" onClick={() => setShowAddDrug(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Drug
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)] mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#10B981]/50 w-4 h-4" />
              <Input
                placeholder="Search by name, brand, or NDC..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white placeholder:text-white/40"
              />
            </div>
            <Select value={selectedTherapeuticClass} onValueChange={setSelectedTherapeuticClass}>
              <SelectTrigger className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white">
                <SelectValue placeholder="Therapeutic Class" />
              </SelectTrigger>
              <SelectContent>
                {therapeuticClasses.map(cls => (
                  <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDosageForm} onValueChange={setSelectedDosageForm}>
              <SelectTrigger className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white">
                <SelectValue placeholder="Dosage Form" />
              </SelectTrigger>
              <SelectContent>
                {dosageForms.map(form => (
                  <SelectItem key={form} value={form}>{form}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-4 items-center">
              <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={showControlledOnly}
                  onChange={(e) => setShowControlledOnly(e.target.checked)}
                  className="rounded border-[rgba(16,185,129,0.3)] bg-[rgba(16,185,129,0.05)]"
                />
                <ShieldAlert className="w-4 h-4 text-orange-400" />
                Controlled Only
              </label>
              <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={showHighRiskOnly}
                  onChange={(e) => setShowHighRiskOnly(e.target.checked)}
                  className="rounded border-[rgba(16,185,129,0.3)] bg-[rgba(16,185,129,0.05)]"
                />
                <AlertTriangle className="w-4 h-4 text-red-400" />
                High Risk Only
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drug Table */}
      <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader className="sticky top-0 bg-[#0A0820]">
                <TableRow className="border-b border-[rgba(16,185,129,0.1)] hover:bg-transparent">
                  <TableHead 
                    className="text-[#10B981] cursor-pointer"
                    onClick={() => handleSort('drugName')}
                  >
                    <div className="flex items-center gap-1">
                      Drug Name
                      {sortField === 'drugName' && (sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                    </div>
                  </TableHead>
                  <TableHead className="text-[#10B981]">NDC</TableHead>
                  <TableHead className="text-[#10B981]">Strength</TableHead>
                  <TableHead className="text-[#10B981]">Form</TableHead>
                  <TableHead className="text-[#10B981]">Therapeutic Class</TableHead>
                  <TableHead 
                    className="text-[#10B981] text-right cursor-pointer"
                    onClick={() => handleSort('retailPrice')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Price
                      {sortField === 'retailPrice' && (sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                    </div>
                  </TableHead>
                  <TableHead className="text-[#10B981]">Status</TableHead>
                  <TableHead className="text-[#10B981] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrugs.map((drug) => (
                  <TableRow 
                    key={drug.id}
                    className="border-b border-[rgba(16,185,129,0.05)] hover:bg-[rgba(16,185,129,0.05)] cursor-pointer"
                    onClick={() => {
                      setSelectedDrug(drug);
                      setShowDrugDetails(true);
                    }}
                  >
                    <TableCell className="text-white">
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-medium">{drug.drugName}</p>
                          {drug.brandName && (
                            <p className="text-xs text-white/50">{drug.brandName}</p>
                          )}
                        </div>
                        {drug.lookSound && (
                          <Badge className="bg-yellow-500/20 text-yellow-300 text-xs">LASA</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-[#10B981] text-xs">{drug.ndc}</TableCell>
                    <TableCell className="text-white">{drug.strength}</TableCell>
                    <TableCell className="text-white/70">{drug.dosageForm}</TableCell>
                    <TableCell className="text-white/70 text-xs">{drug.therapeuticClass}</TableCell>
                    <TableCell className="text-right text-white font-mono">
                      TT${drug.retailPrice.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        {drug.controlledSubstance && (
                          <Badge className="bg-orange-500/20 text-orange-300 text-xs">C{drug.deaSchedule}</Badge>
                        )}
                        {drug.highRisk && (
                          <Badge className="bg-red-500/20 text-red-300 text-xs">High Risk</Badge>
                        )}
                        {drug.storageRequirements === 'Refrigerate' && (
                          <Snowflake className="w-4 h-4 text-blue-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
                        <Button size="sm" variant="ghost" className="text-[#10B981] hover:bg-[rgba(16,185,129,0.1)]">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Drug Details Dialog */}
      <Dialog open={showDrugDetails} onOpenChange={setShowDrugDetails}>
        <DialogContent className="bg-[#0A0820] border-[rgba(16,185,129,0.2)] text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Pill className="w-5 h-5 text-[#10B981]" />
              {selectedDrug?.drugName}
              {selectedDrug?.brandName && (
                <span className="text-white/50 text-sm">({selectedDrug.brandName})</span>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedDrug && (
            <div className="grid grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.1)]">
                  <h4 className="text-sm text-[#10B981] uppercase mb-2">Identification</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">NDC:</span>
                      <span className="font-mono text-[#10B981]">{selectedDrug.ndc}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Strength:</span>
                      <span className="text-white">{selectedDrug.strength}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Dosage Form:</span>
                      <span className="text-white">{selectedDrug.dosageForm}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Route:</span>
                      <span className="text-white">{selectedDrug.route}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Manufacturer:</span>
                      <span className="text-white">{selectedDrug.manufacturer}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.1)]">
                  <h4 className="text-sm text-[#10B981] uppercase mb-2">Classification</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Therapeutic Class:</span>
                      <span className="text-white">{selectedDrug.therapeuticClass}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">DEA Schedule:</span>
                      <span className="text-white">{selectedDrug.deaSchedule || 'Not Controlled'}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.1)]">
                  <h4 className="text-sm text-[#10B981] uppercase mb-2">Pricing</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Cost:</span>
                      <span className="font-mono text-white">TT${selectedDrug.cost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">AWP:</span>
                      <span className="font-mono text-white">TT${selectedDrug.awp?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Retail Price:</span>
                      <span className="font-mono text-[#10B981]">TT${selectedDrug.retailPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Package Size:</span>
                      <span className="text-white">{selectedDrug.packageSize} units</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.1)]">
                  <h4 className="text-sm text-[#10B981] uppercase mb-2">Storage & Safety</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Storage:</span>
                      <span className="flex items-center gap-1">
                        {selectedDrug.storageRequirements === 'Refrigerate' && <Snowflake className="w-4 h-4 text-blue-400" />}
                        {selectedDrug.storageRequirements}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {selectedDrug.controlledSubstance && (
                        <Badge className="bg-orange-500/20 text-orange-300">Controlled (C{selectedDrug.deaSchedule})</Badge>
                      )}
                      {selectedDrug.highRisk && (
                        <Badge className="bg-red-500/20 text-red-300">High Risk</Badge>
                      )}
                      {selectedDrug.lookSound && (
                        <Badge className="bg-yellow-500/20 text-yellow-300">LASA</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Drug Dialog */}
      <Dialog open={showAddDrug} onOpenChange={setShowAddDrug}>
        <DialogContent className="bg-[#0A0820] border-[rgba(16,185,129,0.2)] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#10B981]" />
              Add New Drug
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Enter the drug information below to add to the database.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-white/70">NDC Code *</Label>
              <Input className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white" placeholder="00000-0000-00" />
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Drug Name (Generic) *</Label>
              <Input className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white" placeholder="e.g., Atorvastatin" />
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Brand Name</Label>
              <Input className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white" placeholder="e.g., Lipitor" />
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Strength *</Label>
              <Input className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white" placeholder="e.g., 10mg" />
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Dosage Form *</Label>
              <Select>
                <SelectTrigger className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white">
                  <SelectValue placeholder="Select form" />
                </SelectTrigger>
                <SelectContent>
                  {dosageForms.filter(f => f !== 'All').map(form => (
                    <SelectItem key={form} value={form}>{form}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Route</Label>
              <Select>
                <SelectTrigger className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white">
                  <SelectValue placeholder="Select route" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Oral">Oral</SelectItem>
                  <SelectItem value="IV">IV</SelectItem>
                  <SelectItem value="IM">IM</SelectItem>
                  <SelectItem value="Subcutaneous">Subcutaneous</SelectItem>
                  <SelectItem value="Topical">Topical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Cost (TT$) *</Label>
              <Input type="number" className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white" placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Retail Price (TT$) *</Label>
              <Input type="number" className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white" placeholder="0.00" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-[rgba(16,185,129,0.3)] text-[#10B981]" onClick={() => setShowAddDrug(false)}>
              Cancel
            </Button>
            <Button className="bg-[#10B981] hover:bg-[#10B981]/80 text-white">
              Add Drug
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
