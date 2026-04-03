'use client';

import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Info,
  Search,
  Plus,
  X,
  Pill,
  User,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  FileText,
  Stethoscope
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { Separator } from '@/components/ui/separator';

// Mock drug database for interaction checking
const drugDatabase = [
  { id: '1', name: 'Warfarin', generic: 'Warfarin', class: 'Anticoagulant' },
  { id: '2', name: 'Amiodarone', generic: 'Amiodarone', class: 'Antiarrhythmic' },
  { id: '3', name: 'Metformin', generic: 'Metformin', class: 'Antidiabetic' },
  { id: '4', name: 'Lisinopril', generic: 'Lisinopril', class: 'ACE Inhibitor' },
  { id: '5', name: 'Atorvastatin', generic: 'Atorvastatin', class: 'Statin' },
  { id: '6', name: 'Omeprazole', generic: 'Omeprazole', class: 'Proton Pump Inhibitor' },
  { id: '7', name: 'Aspirin', generic: 'Aspirin', class: 'Antiplatelet' },
  { id: '8', name: 'Clopidogrel', generic: 'Clopidogrel', class: 'Antiplatelet' },
  { id: '9', name: 'Digoxin', generic: 'Digoxin', class: 'Cardiac Glycoside' },
  { id: '10', name: 'Fluoxetine', generic: 'Fluoxetine', class: 'SSRI Antidepressant' },
  { id: '11', name: 'Simvastatin', generic: 'Simvastatin', class: 'Statin' },
  { id: '12', name: 'Clarithromycin', generic: 'Clarithromycin', class: 'Macrolide Antibiotic' },
  { id: '13', name: 'Ibuprofen', generic: 'Ibuprofen', class: 'NSAID' },
  { id: '14', name: 'Prednisone', generic: 'Prednisone', class: 'Corticosteroid' },
  { id: '15', name: 'Levothyroxine', generic: 'Levothyroxine', class: 'Thyroid Hormone' },
  { id: '16', name: 'Amoxicillin', generic: 'Amoxicillin', class: 'Penicillin Antibiotic' },
  { id: '17', name: 'Ciprofloxacin', generic: 'Ciprofloxacin', class: 'Fluoroquinolone Antibiotic' },
  { id: '18', name: 'Sertraline', generic: 'Sertraline', class: 'SSRI Antidepressant' },
  { id: '19', name: 'Carbamazepine', generic: 'Carbamazepine', class: 'Anticonvulsant' },
  { id: '20', name: 'Phenytoin', generic: 'Phenytoin', class: 'Anticonvulsant' },
];

// Known drug interactions database
const knownInteractions = [
  {
    drug1: 'Warfarin',
    drug2: 'Amiodarone',
    severity: 'major',
    description: 'Amiodarone inhibits CYP2C9 and CYP1A2, significantly increasing warfarin plasma levels.',
    clinicalEffects: 'Increased INR, bleeding risk significantly elevated.',
    recommendation: 'Reduce warfarin dose by 30-50% when initiating amiodarone. Monitor INR closely for first 2 weeks.',
    onset: 'delayed',
    documentation: 'well_established',
  },
  {
    drug1: 'Warfarin',
    drug2: 'Aspirin',
    severity: 'major',
    description: 'Additive anticoagulant effect with increased bleeding risk.',
    clinicalEffects: 'Increased bleeding risk, GI ulceration, intracranial hemorrhage.',
    recommendation: 'Avoid combination if possible. If necessary, monitor closely for bleeding signs. Use lowest effective doses.',
    onset: 'rapid',
    documentation: 'well_established',
  },
  {
    drug1: 'Warfarin',
    drug2: 'Ibuprofen',
    severity: 'major',
    description: 'NSAIDs increase bleeding risk through platelet inhibition and GI mucosal damage.',
    clinicalEffects: 'Increased bleeding risk, GI ulceration and bleeding.',
    recommendation: 'Avoid NSAIDs in patients on warfarin. Consider acetaminophen for pain. If NSAID essential, use with PPI and monitor closely.',
    onset: 'rapid',
    documentation: 'well_established',
  },
  {
    drug1: 'Metformin',
    drug2: 'Ciprofloxacin',
    severity: 'moderate',
    description: 'Fluoroquinolones may enhance the hypoglycemic effect of metformin.',
    clinicalEffects: 'Risk of hypoglycemia, especially in elderly or patients with renal impairment.',
    recommendation: 'Monitor blood glucose more frequently. Adjust metformin dose if needed.',
    onset: 'delayed',
    documentation: 'probable',
  },
  {
    drug1: 'Atorvastatin',
    drug2: 'Clarithromycin',
    severity: 'major',
    severityRating: 5,
    description: 'Clarithromycin strongly inhibits CYP3A4, significantly increasing atorvastatin levels.',
    clinicalEffects: 'Increased risk of myopathy, rhabdomyolysis, and hepatotoxicity.',
    recommendation: 'CONTRAINDICATED. Suspend atorvastatin during clarithromycin therapy. Consider alternative antibiotic or temporary statin discontinuation.',
    onset: 'rapid',
    documentation: 'well_established',
  },
  {
    drug1: 'Simvastatin',
    drug2: 'Amiodarone',
    severity: 'major',
    description: 'Amiodarone inhibits CYP3A4, increasing simvastatin levels.',
    clinicalEffects: 'Increased risk of myopathy and rhabdomyolysis.',
    recommendation: 'Do not exceed 20mg simvastatin daily with amiodarone. Consider alternative statin (pravastatin, rosuvastatin).',
    onset: 'delayed',
    documentation: 'well_established',
  },
  {
    drug1: 'Lisinopril',
    drug2: 'Ibuprofen',
    severity: 'moderate',
    description: 'NSAIDs reduce the antihypertensive effect of ACE inhibitors.',
    clinicalEffects: 'Reduced blood pressure control, potential for acute kidney injury.',
    recommendation: 'Monitor blood pressure and renal function. Consider alternative pain management.',
    onset: 'delayed',
    documentation: 'well_established',
  },
  {
    drug1: 'Digoxin',
    drug2: 'Amiodarone',
    severity: 'major',
    description: 'Amiodarone reduces renal and non-renal clearance of digoxin.',
    clinicalEffects: 'Increased digoxin levels leading to toxicity (nausea, bradycardia, visual disturbances).',
    recommendation: 'Reduce digoxin dose by 50% when starting amiodarone. Monitor digoxin levels and watch for toxicity signs.',
    onset: 'delayed',
    documentation: 'well_established',
  },
  {
    drug1: 'Fluoxetine',
    drug2: 'Carbamazepine',
    severity: 'moderate',
    description: 'Fluoxetine inhibits CYP2C19 and CYP3A4, increasing carbamazepine levels.',
    clinicalEffects: 'Increased carbamazepine toxicity risk (dizziness, ataxia, diplopia).',
    recommendation: 'Monitor carbamazepine levels. Dose adjustment may be required.',
    onset: 'delayed',
    documentation: 'probable',
  },
  {
    drug1: 'Aspirin',
    drug2: 'Ibuprofen',
    severity: 'moderate',
    description: 'Ibuprofen may interfere with aspirin\'s antiplatelet effect.',
    clinicalEffects: 'Reduced cardioprotective benefit of aspirin, increased GI bleeding risk.',
    recommendation: 'Take aspirin at least 2 hours before ibuprofen. Consider alternative pain management.',
    onset: 'rapid',
    documentation: 'probable',
  },
  {
    drug1: 'Aspirin',
    drug2: 'Clopidogrel',
    severity: 'moderate',
    description: 'Additive antiplatelet effects increase bleeding risk.',
    clinicalEffects: 'Increased bleeding risk (GI, intracranial).',
    recommendation: 'Combination often medically necessary. Use with PPI for GI protection. Monitor for bleeding.',
    onset: 'rapid',
    documentation: 'well_established',
  },
  {
    drug1: 'Sertraline',
    drug2: 'Warfarin',
    severity: 'moderate',
    description: 'Sertraline may inhibit CYP2C9, affecting warfarin metabolism.',
    clinicalEffects: 'Potential for increased INR and bleeding.',
    recommendation: 'Monitor INR more frequently during initiation or dose changes of sertraline.',
    onset: 'delayed',
    documentation: 'probable',
  },
];

// Allergy cross-sensitivity data
const allergyCrossSensitivity = [
  {
    allergen: 'Penicillin',
    crossReactive: ['Amoxicillin', 'Ampicillin', 'Cephalosporins (first generation)'],
    severity: 'high',
    notes: '10-20% cross-reactivity with cephalosporins. Use caution with all beta-lactams.',
  },
  {
    allergen: 'Sulfonamides',
    crossReactive: ['Furosemide', 'Thiazide diuretics', 'Sulfonylureas'],
    severity: 'moderate',
    notes: 'Cross-reactivity controversial. Monitor closely if using related drugs.',
  },
  {
    allergen: 'NSAIDs',
    crossReactive: ['Ibuprofen', 'Naproxen', 'Diclofenac', 'Celecoxib'],
    severity: 'high',
    notes: 'Avoid all NSAIDs. Consider acetaminophen or opioid alternatives.',
  },
  {
    allergen: 'Codeine',
    crossReactive: ['Morphine', 'Hydrocodone', 'Oxycodone'],
    severity: 'moderate',
    notes: 'True allergy suggests cross-reactivity with all opioids. Use non-opioid alternatives.',
  },
];

interface SelectedDrug {
  id: string;
  name: string;
  generic: string;
  class: string;
}

interface Interaction {
  drug1: string;
  drug2: string;
  severity: string;
  description: string;
  clinicalEffects: string;
  recommendation: string;
  onset: string;
  documentation: string;
}

const severityConfig: Record<string, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
  major: {
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/30',
    icon: <ShieldAlert className="w-5 h-5" />,
    label: 'MAJOR'
  },
  moderate: {
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/30',
    icon: <AlertTriangle className="w-5 h-5" />,
    label: 'MODERATE'
  },
  minor: {
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10 border-yellow-500/30',
    icon: <Info className="w-5 h-5" />,
    label: 'MINOR'
  },
};

const onsetConfig: Record<string, { label: string; color: string }> = {
  rapid: { label: 'Rapid onset (< 24 hours)', color: 'text-red-400' },
  delayed: { label: 'Delayed onset (> 24 hours)', color: 'text-yellow-400' },
};

const documentationConfig: Record<string, { label: string; color: string }> = {
  well_established: { label: 'Well Established', color: 'text-red-400' },
  probable: { label: 'Probable', color: 'text-orange-400' },
  suspected: { label: 'Suspected', color: 'text-yellow-400' },
  possible: { label: 'Possible', color: 'text-blue-400' },
};

export default function DrugInteractions() {
  const [selectedDrugs, setSelectedDrugs] = useState<SelectedDrug[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [patientAllergies, setPatientAllergies] = useState<string[]>(['Penicillin']);
  const [newAllergy, setNewAllergy] = useState('');
  const [showInteractionDetail, setShowInteractionDetail] = useState<Interaction | null>(null);
  const [activeTab, setActiveTab] = useState('checker');

  // Filter drugs based on search
  const filteredDrugs = useMemo(() => {
    return drugDatabase.filter(drug =>
      drug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drug.generic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drug.class.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // Check for interactions between selected drugs
  const interactions = useMemo(() => {
    if (selectedDrugs.length < 2) return [];

    const foundInteractions: Interaction[] = [];

    for (let i = 0; i < selectedDrugs.length; i++) {
      for (let j = i + 1; j < selectedDrugs.length; j++) {
        const drug1 = selectedDrugs[i].name;
        const drug2 = selectedDrugs[j].name;

        const interaction = knownInteractions.find(
          int => (int.drug1 === drug1 && int.drug2 === drug2) ||
                 (int.drug1 === drug2 && int.drug2 === drug1)
        );

        if (interaction) {
          foundInteractions.push(interaction);
        }
      }
    }

    return foundInteractions;
  }, [selectedDrugs]);

  // Check for allergy interactions
  const allergyInteractions = useMemo(() => {
    const alerts: { drug: string; allergen: string; severity: string; notes: string }[] = [];

    selectedDrugs.forEach(drug => {
      allergyCrossSensitivity.forEach(allergy => {
        if (patientAllergies.includes(allergy.allergen)) {
          if (allergy.crossReactive.some(cr =>
            drug.name.toLowerCase().includes(cr.toLowerCase()) ||
            drug.generic.toLowerCase().includes(cr.toLowerCase())
          )) {
            alerts.push({
              drug: drug.name,
              allergen: allergy.allergen,
              severity: allergy.severity,
              notes: allergy.notes,
            });
          }
        }
      });
    });

    return alerts;
  }, [selectedDrugs, patientAllergies]);

  // Add drug to selection
  const addDrug = (drug: typeof drugDatabase[0]) => {
    if (!selectedDrugs.find(d => d.id === drug.id)) {
      setSelectedDrugs([...selectedDrugs, {
        id: drug.id,
        name: drug.name,
        generic: drug.generic,
        class: drug.class,
      }]);
    }
    setSearchTerm('');
  };

  // Remove drug from selection
  const removeDrug = (drugId: string) => {
    setSelectedDrugs(selectedDrugs.filter(d => d.id !== drugId));
  };

  // Add allergy
  const addAllergy = () => {
    if (newAllergy && !patientAllergies.includes(newAllergy)) {
      setPatientAllergies([...patientAllergies, newAllergy]);
      setNewAllergy('');
    }
  };

  // Remove allergy
  const removeAllergy = (allergy: string) => {
    setPatientAllergies(patientAllergies.filter(a => a !== allergy));
  };

  // Get severity counts
  const severityCounts = useMemo(() => {
    return {
      major: interactions.filter(i => i.severity === 'major').length,
      moderate: interactions.filter(i => i.severity === 'moderate').length,
      minor: interactions.filter(i => i.severity === 'minor').length,
    };
  }, [interactions]);

  return (
    <div className="min-h-screen bg-[#050410] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            Drug Interaction Checker
          </h1>
          <p className="text-[#10B981]/70 text-sm mt-1">
            Check for drug-drug interactions, allergy cross-sensitivity, and clinical recommendations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-[rgba(16,185,129,0.3)] text-[#10B981]">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button className="bg-[#10B981] hover:bg-[#10B981]/80 text-white">
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Severity Summary */}
      {interactions.length > 0 && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="bg-[rgba(239,68,68,0.05)] border-[rgba(239,68,68,0.2)]">
            <CardContent className="p-4 text-center">
              <ShieldAlert className="w-6 h-6 text-red-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-400">{severityCounts.major}</p>
              <p className="text-xs text-red-400/70 uppercase">Major Interactions</p>
            </CardContent>
          </Card>
          <Card className="bg-[rgba(249,115,22,0.05)] border-[rgba(249,115,22,0.2)]">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="w-6 h-6 text-orange-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-400">{severityCounts.moderate}</p>
              <p className="text-xs text-orange-400/70 uppercase">Moderate Interactions</p>
            </CardContent>
          </Card>
          <Card className="bg-[rgba(234,179,8,0.05)] border-[rgba(234,179,8,0.2)]">
            <CardContent className="p-4 text-center">
              <Info className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-400">{severityCounts.minor}</p>
              <p className="text-xs text-yellow-400/70 uppercase">Minor Interactions</p>
            </CardContent>
          </Card>
          <Card className="bg-[rgba(239,68,68,0.05)] border-[rgba(239,68,68,0.2)]">
            <CardContent className="p-4 text-center">
              <AlertCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-400">{allergyInteractions.length}</p>
              <p className="text-xs text-red-400/70 uppercase">Allergy Alerts</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Drug Selection */}
        <div className="space-y-6">
          {/* Patient Allergies */}
          <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
            <CardHeader className="border-b border-[rgba(16,185,129,0.1)]">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                Patient Allergies
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2 mb-3">
                {patientAllergies.map((allergy) => (
                  <Badge
                    key={allergy}
                    className="bg-red-500/20 text-red-300 border border-red-500/30 pr-1"
                  >
                    {allergy}
                    <button
                      onClick={() => removeAllergy(allergy)}
                      className="ml-2 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add allergy..."
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  className="flex-1 bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white placeholder:text-white/40 text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && addAllergy()}
                />
                <Button
                  size="sm"
                  className="bg-red-500/20 text-red-300 hover:bg-red-500/30"
                  onClick={addAllergy}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Drug Search & Selection */}
          <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
            <CardHeader className="border-b border-[rgba(16,185,129,0.1)]">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Pill className="w-4 h-4 text-[#10B981]" />
                Add Medications
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#10B981]/50 w-4 h-4" />
                <Input
                  placeholder="Search drugs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white placeholder:text-white/40"
                />
              </div>

              {searchTerm && (
                <ScrollArea className="h-[200px] mb-4">
                  <div className="space-y-1">
                    {filteredDrugs.map((drug) => (
                      <button
                        key={drug.id}
                        onClick={() => addDrug(drug)}
                        disabled={selectedDrugs.some(d => d.id === drug.id)}
                        className={`w-full p-2 rounded-lg text-left transition-all ${
                          selectedDrugs.some(d => d.id === drug.id)
                            ? 'bg-[#10B981]/10 text-[#10B981]/50 cursor-not-allowed'
                            : 'bg-[rgba(16,185,129,0.05)] hover:bg-[rgba(16,185,129,0.1)] text-white'
                        }`}
                      >
                        <p className="text-sm font-medium">{drug.name}</p>
                        <p className="text-xs text-white/50">{drug.class}</p>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}

              {/* Selected Drugs */}
              <div className="space-y-2">
                <p className="text-xs text-white/40 uppercase">Selected Medications ({selectedDrugs.length})</p>
                <div className="flex flex-wrap gap-2">
                  {selectedDrugs.map((drug) => (
                    <Badge
                      key={drug.id}
                      className="bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 pr-1"
                    >
                      {drug.name}
                      <button
                        onClick={() => removeDrug(drug.id)}
                        className="ml-2 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Drugs List */}
          <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
            <CardHeader className="border-b border-[rgba(16,185,129,0.1)]">
              <CardTitle className="text-white text-sm">Medication List</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ScrollArea className="h-[200px]">
                {selectedDrugs.length === 0 ? (
                  <p className="text-white/40 text-center py-8">
                    No medications selected. Search and add drugs above.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedDrugs.map((drug, index) => (
                      <div
                        key={drug.id}
                        className="p-3 rounded-lg bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.1)]"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white text-sm font-medium">{index + 1}. {drug.name}</p>
                            <p className="text-white/50 text-xs">{drug.generic} - {drug.class}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={() => removeDrug(drug.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Interactions Results */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-[rgba(16,185,129,0.1)] mb-4">
              <TabsTrigger value="checker" className="data-[state=active]:bg-[#10B981] data-[state=active]:text-white">
                Interactions
              </TabsTrigger>
              <TabsTrigger value="allergies" className="data-[state=active]:bg-[#10B981] data-[state=active]:text-white">
                Allergy Checks
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="data-[state=active]:bg-[#10B981] data-[state=active]:text-white">
                Clinical Guide
              </TabsTrigger>
            </TabsList>

            <TabsContent value="checker">
              <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
                <CardHeader className="border-b border-[rgba(16,185,129,0.1)]">
                  <CardTitle className="text-white flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-[#10B981]" />
                    Drug-Drug Interactions
                    {interactions.length > 0 && (
                      <Badge className="bg-red-500 text-white ml-2">{interactions.length}</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {selectedDrugs.length < 2 ? (
                    <div className="text-center py-12">
                      <Pill className="w-12 h-12 text-white/20 mx-auto mb-4" />
                      <p className="text-white/40">Add at least 2 medications to check for interactions</p>
                    </div>
                  ) : interactions.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                      <p className="text-emerald-400 font-medium">No known interactions detected</p>
                      <p className="text-white/40 text-sm mt-2">
                        The selected medications have no documented interactions in our database.
                      </p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-4">
                        {interactions.map((interaction, index) => (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border ${severityConfig[interaction.severity]?.bg || 'bg-gray-500/10 border-gray-500/30'} cursor-pointer hover:border-opacity-60 transition-all`}
                            onClick={() => setShowInteractionDetail(interaction)}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                {severityConfig[interaction.severity]?.icon}
                                <Badge className={severityConfig[interaction.severity]?.bg}>
                                  {severityConfig[interaction.severity]?.label}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-[#10B981]/20 text-[#10B981] text-xs">
                                  {interaction.drug1}
                                </Badge>
                                <span className="text-white/40">+</span>
                                <Badge className="bg-[#10B981]/20 text-[#10B981] text-xs">
                                  {interaction.drug2}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-white text-sm">{interaction.description}</p>
                            <div className="flex items-center gap-4 mt-3 text-xs">
                              <span className={onsetConfig[interaction.onset]?.color || 'text-white/60'}>
                                <Clock className="w-3 h-3 inline mr-1" />
                                {onsetConfig[interaction.onset]?.label}
                              </span>
                              <span className={documentationConfig[interaction.documentation]?.color || 'text-white/60'}>
                                <FileText className="w-3 h-3 inline mr-1" />
                                {documentationConfig[interaction.documentation]?.label}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="allergies">
              <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
                <CardHeader className="border-b border-[rgba(16,185,129,0.1)]">
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    Allergy Cross-Sensitivity Checks
                    {allergyInteractions.length > 0 && (
                      <Badge className="bg-red-500 text-white ml-2">{allergyInteractions.length}</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {allergyInteractions.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                      <p className="text-emerald-400 font-medium">No allergy conflicts detected</p>
                      <p className="text-white/40 text-sm mt-2">
                        Selected medications do not cross-react with patient allergies.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {allergyInteractions.map((alert, index) => (
                        <div
                          key={index}
                          className="p-4 rounded-lg bg-red-500/10 border border-red-500/20"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                            <span className="text-red-400 font-medium">ALLERGY ALERT</span>
                          </div>
                          <p className="text-white">
                            <strong>{alert.drug}</strong> may cross-react with patient&apos;s documented allergy to <strong>{alert.allergen}</strong>
                          </p>
                          <p className="text-white/60 text-sm mt-2">{alert.notes}</p>
                          <Badge className={`mt-2 ${alert.severity === 'high' ? 'bg-red-500/20 text-red-300' : 'bg-orange-500/20 text-orange-300'}`}>
                            {alert.severity.toUpperCase()} RISK
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recommendations">
              <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
                <CardHeader className="border-b border-[rgba(16,185,129,0.1)]">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-[#10B981]" />
                    Clinical Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ScrollArea className="h-[500px]">
                    {interactions.length === 0 ? (
                      <div className="text-center py-12">
                        <Stethoscope className="w-12 h-12 text-white/20 mx-auto mb-4" />
                        <p className="text-white/40">Add medications to see clinical recommendations</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {interactions.map((interaction, index) => (
                          <div key={index} className="space-y-4">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-[#10B981]/20 text-[#10B981]">{interaction.drug1}</Badge>
                              <span className="text-white/40">+</span>
                              <Badge className="bg-[#10B981]/20 text-[#10B981]">{interaction.drug2}</Badge>
                            </div>
                            
                            <div className="grid gap-4">
                              <div className="p-3 rounded-lg bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.1)]">
                                <p className="text-xs text-[#10B981] uppercase mb-2">Clinical Effects</p>
                                <p className="text-white text-sm">{interaction.clinicalEffects}</p>
                              </div>
                              
                              <div className="p-3 rounded-lg bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.1)]">
                                <p className="text-xs text-[#10B981] uppercase mb-2">Recommendation</p>
                                <p className="text-white text-sm">{interaction.recommendation}</p>
                              </div>
                            </div>
                            
                            {index < interactions.length - 1 && (
                              <Separator className="bg-[rgba(16,185,129,0.1)] my-4" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Interaction Detail Dialog */}
      <Dialog open={!!showInteractionDetail} onOpenChange={() => setShowInteractionDetail(null)}>
        <DialogContent className="bg-[#0A0820] border-[rgba(16,185,129,0.2)] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              {showInteractionDetail && severityConfig[showInteractionDetail.severity]?.icon}
              {showInteractionDetail?.drug1} + {showInteractionDetail?.drug2}
            </DialogTitle>
          </DialogHeader>
          {showInteractionDetail && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2">
                <Badge className={severityConfig[showInteractionDetail.severity]?.bg}>
                  {severityConfig[showInteractionDetail.severity]?.label}
                </Badge>
                <Badge className="bg-white/10 text-white/70">
                  {onsetConfig[showInteractionDetail.onset]?.label}
                </Badge>
                <Badge className="bg-white/10 text-white/70">
                  {documentationConfig[showInteractionDetail.documentation]?.label}
                </Badge>
              </div>

              <div className="p-4 rounded-lg bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.1)]">
                <h4 className="text-sm text-[#10B981] uppercase mb-2">Mechanism</h4>
                <p className="text-white">{showInteractionDetail.description}</p>
              </div>

              <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                <h4 className="text-sm text-red-400 uppercase mb-2">Clinical Effects</h4>
                <p className="text-white">{showInteractionDetail.clinicalEffects}</p>
              </div>

              <div className="p-4 rounded-lg bg-[#10B981]/5 border border-[#10B981]/20">
                <h4 className="text-sm text-[#10B981] uppercase mb-2">Recommendation</h4>
                <p className="text-white">{showInteractionDetail.recommendation}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-xs text-white/40 uppercase mb-1">Onset</p>
                  <p className={onsetConfig[showInteractionDetail.onset]?.color}>
                    {onsetConfig[showInteractionDetail.onset]?.label}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase mb-1">Documentation Level</p>
                  <p className={documentationConfig[showInteractionDetail.documentation]?.color}>
                    {documentationConfig[showInteractionDetail.documentation]?.label}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="border-[rgba(16,185,129,0.3)] text-[#10B981]" onClick={() => setShowInteractionDetail(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
