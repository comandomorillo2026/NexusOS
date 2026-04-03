'use client';

import React, { useState } from 'react';
import {
  FlaskConical,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  Eye,
  Edit2,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Beaker,
  Scale,
  Calendar,
  User,
  ChevronRight,
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
import { Separator } from '@/components/ui/separator';

// Mock compounding formulas
const mockFormulas = [
  {
    id: '1',
    formulaNumber: 'FORM-001',
    formulaName: 'Nifedipine 0.2% Topical Cream',
    category: 'Cream',
    dosageForm: 'Topical Cream',
    strength: '0.2%',
    totalQuantity: 30,
    quantityUnit: 'grams',
    ingredients: [
      { name: 'Nifedipine Powder', quantity: 60, unit: 'mg' },
      { name: 'Cream Base', quantity: 29.94, unit: 'g' },
      { name: 'Vitamin E Oil', quantity: 0.5, unit: 'mL' }
    ],
    preparationMethod: 'Triturate nifedipine with small amount of cream base to form smooth paste. Geometrically incorporate remaining cream base. Add vitamin E oil and mix thoroughly.',
    beyondUseDays: 90,
    storageConditions: 'Room Temperature',
    verificationRequired: true,
    isActive: true
  },
  {
    id: '2',
    formulaNumber: 'FORM-002',
    formulaName: 'Ketoconazole 2% Shampoo',
    category: 'Solution',
    dosageForm: 'Shampoo',
    strength: '2%',
    totalQuantity: 120,
    quantityUnit: 'mL',
    ingredients: [
      { name: 'Ketoconazole', quantity: 2.4, unit: 'g' },
      { name: 'Shampoo Base', quantity: 116, unit: 'mL' },
      { name: 'Fragrance', quantity: 1, unit: 'mL' },
      { name: 'Preservative', quantity: 0.6, unit: 'mL' }
    ],
    preparationMethod: 'Dissolve ketoconazole in shampoo base with gentle heating. Add preservative and fragrance. Mix thoroughly and cool.',
    beyondUseDays: 180,
    storageConditions: 'Room Temperature',
    verificationRequired: true,
    isActive: true
  },
  {
    id: '3',
    formulaNumber: 'FORM-003',
    formulaName: 'Lidocaine 5% Ointment',
    category: 'Ointment',
    dosageForm: 'Topical Ointment',
    strength: '5%',
    totalQuantity: 50,
    quantityUnit: 'grams',
    ingredients: [
      { name: 'Lidocaine Base', quantity: 2.5, unit: 'g' },
      { name: 'Petrolatum', quantity: 47.5, unit: 'g' }
    ],
    preparationMethod: 'Melt petrolatum. Add lidocaine base and stir until dissolved. Cool with constant stirring until congealed.',
    beyondUseDays: 180,
    storageConditions: 'Cool Place',
    verificationRequired: true,
    isActive: true
  }
];

const mockBatches = [
  {
    id: '1',
    batchNumber: 'BATCH-2024-001',
    formulaId: '1',
    formulaName: 'Nifedipine 0.2% Topical Cream',
    formulaNumber: 'FORM-001',
    patientId: 'PAT-001',
    patientName: 'Maria Garcia',
    prescriptionId: 'RX-001',
    quantityPrepared: 30,
    quantityUnit: 'grams',
    lotNumber: 'LOT-NIF2401',
    preparationDate: '2024-01-15',
    beyondUseDate: '2024-04-15',
    preparerName: 'John Smith, RPh',
    verifierName: 'Jane Doe, RPh',
    verificationDate: '2024-01-15',
    qcPassed: true,
    status: 'dispensed'
  },
  {
    id: '2',
    batchNumber: 'BATCH-2024-002',
    formulaName: 'Lidocaine 5% Ointment',
    formulaNumber: 'FORM-003',
    patientId: null,
    patientName: null,
    prescriptionId: null,
    quantityPrepared: 100,
    quantityUnit: 'grams',
    lotNumber: 'LOT-LID2401',
    preparationDate: '2024-01-16',
    beyondUseDate: '2024-07-16',
    preparerName: 'John Smith, RPh',
    verifierName: null,
    verificationDate: null,
    qcPassed: null,
    status: 'in_preparation'
  }
];

export default function CompoundingLab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('formulas');
  const [showNewFormula, setShowNewFormula] = useState(false);
  const [showNewBatch, setShowNewBatch] = useState(false);
  const [selectedFormula, setSelectedFormula] = useState<typeof mockFormulas[0] | null>(null);
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);

  const filteredFormulas = mockFormulas.filter(f => 
    f.formulaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.formulaNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBatches = mockBatches.filter(b => 
    b.formulaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.patientName && b.patientName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#050410] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            Compounding Lab
          </h1>
          <p className="text-[#10B981]/70 text-sm mt-1">
            Formula management and batch preparation
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-[rgba(16,185,129,0.3)] text-[#10B981]">
            <Download className="w-4 h-4 mr-2" />
            Export Records
          </Button>
          <Button className="bg-[#10B981] hover:bg-[#10B981]/80 text-white" onClick={() => setShowNewFormula(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Formula
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#10B981]/20 flex items-center justify-center">
                <Beaker className="w-5 h-5 text-[#10B981]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{mockFormulas.length}</p>
                <p className="text-xs text-white/50">Active Formulas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[rgba(234,179,8,0.03)] border-[rgba(234,179,8,0.15)]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{mockBatches.filter(b => b.status === 'in_preparation').length}</p>
                <p className="text-xs text-white/50">In Preparation</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{mockBatches.filter(b => b.status === 'dispensed').length}</p>
                <p className="text-xs text-white/50">Completed Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[rgba(249,115,22,0.03)] border-[rgba(249,115,22,0.15)]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">1</p>
                <p className="text-xs text-white/50">Pending Verification</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[rgba(16,185,129,0.1)] mb-4">
          <TabsTrigger value="formulas" className="data-[state=active]:bg-[#10B981] data-[state=active]:text-white">
            Formula Library
          </TabsTrigger>
          <TabsTrigger value="batches" className="data-[state=active]:bg-[#10B981] data-[state=active]:text-white">
            Batch Records
          </TabsTrigger>
        </TabsList>

        <TabsContent value="formulas">
          {/* Search */}
          <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)] mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#10B981]/50 w-4 h-4" />
                  <Input
                    placeholder="Search formulas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white placeholder:text-white/40"
                  />
                </div>
                <Button className="bg-[#10B981] hover:bg-[#10B981]/80 text-white" onClick={() => setShowNewBatch(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Start New Batch
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Formulas Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFormulas.map((formula) => (
              <Card 
                key={formula.id}
                className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)] hover:border-[rgba(16,185,129,0.3)] cursor-pointer"
                onClick={() => {
                  setSelectedFormula(formula);
                  setShowFormulaDetails(true);
                }}
              >
                <CardHeader className="border-b border-[rgba(16,185,129,0.1)]">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-white text-sm">{formula.formulaName}</CardTitle>
                      <p className="text-[#10B981] text-xs mt-1">{formula.formulaNumber}</p>
                    </div>
                    <Badge className="bg-[#10B981]/20 text-[#10B981]">{formula.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/50">Strength:</span>
                      <span className="text-white">{formula.strength}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Quantity:</span>
                      <span className="text-white">{formula.totalQuantity} {formula.quantityUnit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Beyond Use:</span>
                      <span className="text-white">{formula.beyondUseDays} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Ingredients:</span>
                      <span className="text-white">{formula.ingredients.length}</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-[#10B981] hover:bg-[#10B981]/80 text-white" onClick={(e) => {
                    e.stopPropagation();
                    setShowNewBatch(true);
                  }}>
                    Start Batch
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="batches">
          {/* Search */}
          <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)] mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#10B981]/50 w-4 h-4" />
                <Input
                  placeholder="Search batches by formula, patient, or lot number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white placeholder:text-white/40"
                />
              </div>
            </CardContent>
          </Card>

          {/* Batch Table */}
          <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader className="sticky top-0 bg-[#0A0820]">
                    <TableRow className="border-b border-[rgba(16,185,129,0.1)] hover:bg-transparent">
                      <TableHead className="text-[#10B981]">Batch #</TableHead>
                      <TableHead className="text-[#10B981]">Formula</TableHead>
                      <TableHead className="text-[#10B981]">Patient</TableHead>
                      <TableHead className="text-[#10B981]">Qty</TableHead>
                      <TableHead className="text-[#10B981]">Prep Date</TableHead>
                      <TableHead className="text-[#10B981]">BUD</TableHead>
                      <TableHead className="text-[#10B981]">Status</TableHead>
                      <TableHead className="text-[#10B981] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBatches.map((batch) => (
                      <TableRow key={batch.id} className="border-b border-[rgba(16,185,129,0.05)] hover:bg-[rgba(16,185,129,0.05)]">
                        <TableCell className="text-white font-mono text-sm">{batch.batchNumber}</TableCell>
                        <TableCell className="text-white">
                          <p className="font-medium">{batch.formulaName}</p>
                          <p className="text-xs text-white/50">{batch.formulaNumber}</p>
                        </TableCell>
                        <TableCell className="text-white">
                          {batch.patientName || <span className="text-white/40">Stock Preparation</span>}
                        </TableCell>
                        <TableCell className="text-white">{batch.quantityPrepared} {batch.quantityUnit}</TableCell>
                        <TableCell className="text-white font-mono text-sm">
                          {new Date(batch.preparationDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-white font-mono text-sm">
                          {new Date(batch.beyondUseDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${
                            batch.status === 'dispensed' ? 'bg-emerald-500/20 text-emerald-300' :
                            batch.status === 'in_preparation' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-gray-500/20 text-gray-300'
                          }`}>
                            {batch.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" className="text-[#10B981] hover:bg-[rgba(16,185,129,0.1)]">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-[#10B981] hover:bg-[rgba(16,185,129,0.1)]">
                            <Printer className="w-4 h-4" />
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
      </Tabs>

      {/* Formula Details Dialog */}
      <Dialog open={showFormulaDetails} onOpenChange={setShowFormulaDetails}>
        <DialogContent className="bg-[#0A0820] border-[rgba(16,185,129,0.2)] text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-[#10B981]" />
              {selectedFormula?.formulaName}
            </DialogTitle>
          </DialogHeader>
          {selectedFormula && (
            <div className="grid grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.1)]">
                  <h4 className="text-sm text-[#10B981] uppercase mb-3">Formula Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/50">Formula #:</span>
                      <span className="text-[#10B981] font-mono">{selectedFormula.formulaNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Category:</span>
                      <span className="text-white">{selectedFormula.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Dosage Form:</span>
                      <span className="text-white">{selectedFormula.dosageForm}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Strength:</span>
                      <span className="text-white">{selectedFormula.strength}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Total Qty:</span>
                      <span className="text-white">{selectedFormula.totalQuantity} {selectedFormula.quantityUnit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">BUD:</span>
                      <span className="text-white">{selectedFormula.beyondUseDays} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Storage:</span>
                      <span className="text-white">{selectedFormula.storageConditions}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.1)]">
                  <h4 className="text-sm text-[#10B981] uppercase mb-3">Preparation Method</h4>
                  <p className="text-white/70 text-sm">{selectedFormula.preparationMethod}</p>
                </div>
              </div>
              <div>
                <div className="p-4 rounded-lg bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.1)]">
                  <h4 className="text-sm text-[#10B981] uppercase mb-3">Ingredients</h4>
                  <div className="space-y-2">
                    {selectedFormula.ingredients.map((ing, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded bg-[rgba(16,185,129,0.03)]">
                        <span className="text-white">{ing.name}</span>
                        <span className="text-[#10B981] font-mono">{ing.quantity} {ing.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="border-[rgba(16,185,129,0.3)] text-[#10B981]" onClick={() => setShowFormulaDetails(false)}>
              Close
            </Button>
            <Button className="bg-[#10B981] hover:bg-[#10B981]/80 text-white">
              Start Batch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Batch Dialog */}
      <Dialog open={showNewBatch} onOpenChange={setShowNewBatch}>
        <DialogContent className="bg-[#0A0820] border-[rgba(16,185,129,0.2)] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#10B981]" />
              Start New Batch
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-white/70">Select Formula *</Label>
              <Select>
                <SelectTrigger className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white">
                  <SelectValue placeholder="Select formula" />
                </SelectTrigger>
                <SelectContent>
                  {mockFormulas.map(f => (
                    <SelectItem key={f.id} value={f.id}>{f.formulaName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Patient (Optional)</Label>
              <Input className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white" placeholder="Search patient..." />
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Quantity to Prepare *</Label>
              <Input type="number" className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white" placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Lot Number *</Label>
              <Input className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white" placeholder="Auto-generated" disabled />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-[rgba(16,185,129,0.3)] text-[#10B981]" onClick={() => setShowNewBatch(false)}>
              Cancel
            </Button>
            <Button className="bg-[#10B981] hover:bg-[#10B981]/80 text-white">
              Start Preparation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
