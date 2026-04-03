'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Pill,
  Plus,
  Trash2,
  Save,
  Printer,
  Send,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  Info,
  FileText,
  Building,
  Mail
} from 'lucide-react';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  form: string;
  frequency: string;
  duration: string;
  quantity: number;
  refills: number;
  instructions: string;
}

interface EPrescriptionProps {
  patientId?: string;
  patientName?: string;
  patientAge?: number;
  patientWeight?: number;
  doctorId?: string;
  doctorName?: string;
  doctorLicense?: string;
  clinicName?: string;
  clinicAddress?: string;
  tenantId?: string;
  sessionId?: string;
  onSave?: (prescription: PrescriptionData) => void;
}

interface PrescriptionData {
  medications: Medication[];
  diagnosis: string;
  notes: string;
  validUntil: string;
}

// Common medications for quick selection
const COMMON_MEDICATIONS = [
  { name: 'Amoxicillin', forms: ['Capsule', 'Suspension'], dosages: ['250mg', '500mg', '875mg'] },
  { name: 'Ibuprofen', forms: ['Tablet', 'Suspension'], dosages: ['200mg', '400mg', '600mg', '800mg'] },
  { name: 'Acetaminophen', forms: ['Tablet', 'Suspension'], dosages: ['325mg', '500mg', '650mg'] },
  { name: 'Omeprazole', forms: ['Capsule', 'Tablet'], dosages: ['20mg', '40mg'] },
  { name: 'Metformin', forms: ['Tablet'], dosages: ['500mg', '850mg', '1000mg'] },
  { name: 'Lisinopril', forms: ['Tablet'], dosages: ['5mg', '10mg', '20mg', '40mg'] },
  { name: 'Atorvastatin', forms: ['Tablet'], dosages: ['10mg', '20mg', '40mg', '80mg'] },
  { name: 'Azithromycin', forms: ['Tablet', 'Suspension'], dosages: ['250mg', '500mg'] },
  { name: 'Prednisone', forms: ['Tablet'], dosages: ['5mg', '10mg', '20mg', '50mg'] },
  { name: 'Ciprofloxacin', forms: ['Tablet', 'Suspension'], dosages: ['250mg', '500mg', '750mg'] },
];

// Frequency options
const FREQUENCY_OPTIONS = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Four times daily',
  'Every 4 hours',
  'Every 6 hours',
  'Every 8 hours',
  'Every 12 hours',
  'As needed',
  'With meals',
  'Before meals',
  'At bedtime',
];

export function EPrescription({
  patientName = 'Patient',
  patientAge = 0,
  patientWeight = 0,
  doctorName = 'Doctor',
  doctorLicense = '',
  clinicName = 'Clinic',
  clinicAddress = '',
  tenantId,
  sessionId,
  onSave,
}: EPrescriptionProps) {
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: Date.now().toString(),
      name: '',
      dosage: '',
      form: 'Tablet',
      frequency: '',
      duration: '',
      quantity: 0,
      refills: 0,
      instructions: '',
    },
  ]);
  
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Add medication
  const addMedication = () => {
    setMedications(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        name: '',
        dosage: '',
        form: 'Tablet',
        frequency: '',
        duration: '',
        quantity: 0,
        refills: 0,
        instructions: '',
      },
    ]);
  };

  // Remove medication
  const removeMedication = (id: string) => {
    if (medications.length > 1) {
      setMedications(prev => prev.filter(m => m.id !== id));
    }
  };

  // Update medication
  const updateMedication = (id: string, field: keyof Medication, value: string | number) => {
    setMedications(prev =>
      prev.map(m => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  // Quick add from common medications
  const quickAddMedication = (med: typeof COMMON_MEDICATIONS[0]) => {
    setMedications(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        name: med.name,
        dosage: med.dosages[0],
        form: med.forms[0],
        frequency: '',
        duration: '',
        quantity: 0,
        refills: 0,
        instructions: '',
      },
    ]);
  };

  // Calculate quantity based on frequency and duration
  const calculateQuantity = (frequency: string, duration: string) => {
    const durationDays = parseInt(duration) || 0;
    
    let dosesPerDay = 1;
    if (frequency.includes('Twice')) dosesPerDay = 2;
    else if (frequency.includes('Three')) dosesPerDay = 3;
    else if (frequency.includes('Four')) dosesPerDay = 4;
    else if (frequency.includes('4 hours')) dosesPerDay = 6;
    else if (frequency.includes('6 hours')) dosesPerDay = 4;
    else if (frequency.includes('8 hours')) dosesPerDay = 3;
    else if (frequency.includes('12 hours')) dosesPerDay = 2;
    
    return durationDays * dosesPerDay;
  };

  // Save prescription
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const prescriptionData: PrescriptionData = {
        medications: medications.filter(m => m.name),
        diagnosis,
        notes,
        validUntil,
      };

      if (tenantId) {
        await fetch('/api/clinic/telemed/prescription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            patientId,
            patientName,
            doctorId,
            doctorName,
            tenantId,
            medications: prescriptionData.medications,
            diagnosis,
            notes,
            validUntil,
          }),
        });
      }

      onSave?.(prescriptionData);
    } catch (error) {
      console.error('Error saving prescription:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Print prescription
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[var(--nexus-violet)]/20">
            <Pill className="w-6 h-6 text-[var(--nexus-violet)]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">E-Prescription</h2>
            <p className="text-sm text-[var(--text-dim)]">
              {patientName} • Age: {patientAge} • Weight: {patientWeight}kg
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Prescription Preview</DialogTitle>
              </DialogHeader>
              <div className="mt-4 p-6 border rounded-lg bg-white text-black print:shadow-none">
                {/* Header */}
                <div className="text-center mb-6 pb-4 border-b">
                  <h3 className="text-xl font-bold">{clinicName}</h3>
                  <p className="text-sm text-gray-600">{clinicAddress}</p>
                </div>
                
                {/* Doctor & Patient Info */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-xs text-gray-500">Prescribing Doctor</p>
                    <p className="font-medium">{doctorName}</p>
                    <p className="text-sm text-gray-600">License: {doctorLicense}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Patient</p>
                    <p className="font-medium">{patientName}</p>
                    <p className="text-sm text-gray-600">Age: {patientAge} years</p>
                  </div>
                </div>
                
                {/* Diagnosis */}
                {diagnosis && (
                  <div className="mb-4 p-3 bg-gray-50 rounded">
                    <p className="text-xs text-gray-500">Diagnosis</p>
                    <p className="font-medium">{diagnosis}</p>
                  </div>
                )}
                
                {/* Medications */}
                <div className="space-y-4">
                  <p className="text-xs text-gray-500">Rx</p>
                  {medications.filter(m => m.name).map((med, index) => (
                    <div key={med.id} className="p-3 border rounded">
                      <p className="font-bold">{index + 1}. {med.name} {med.dosage}</p>
                      <p className="text-sm text-gray-600">
                        {med.form} • {med.frequency} • {med.duration} days
                      </p>
                      {med.instructions && (
                        <p className="text-sm text-gray-600 italic mt-1">
                          Sig: {med.instructions}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 mt-1">
                        Qty: {med.quantity} • Refills: {med.refills}
                      </p>
                    </div>
                  ))}
                </div>
                
                {/* Notes */}
                {notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <p className="text-xs text-gray-500">Notes</p>
                    <p className="text-sm">{notes}</p>
                  </div>
                )}
                
                {/* Signature */}
                <div className="mt-8 pt-4 border-t">
                  <p className="text-sm text-gray-500">Valid until: {validUntil || '30 days'}</p>
                  <div className="mt-4">
                    <p className="font-medium">{doctorName}</p>
                    <p className="text-sm text-gray-500">Signature: _________________</p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Add */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-[var(--text-mid)]">Quick Add</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {COMMON_MEDICATIONS.slice(0, 6).map((med) => (
              <Button
                key={med.name}
                variant="outline"
                size="sm"
                onClick={() => quickAddMedication(med)}
              >
                <Plus className="w-3 h-3 mr-1" />
                {med.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Medications */}
      <div className="space-y-4">
        {medications.map((med, index) => (
          <Card key={med.id} className="glass-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-[var(--text-primary)]">
                  Medication {index + 1}
                </CardTitle>
                {medications.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMedication(med.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="col-span-2">
                  <Label className="text-[var(--text-mid)]">Medication Name</Label>
                  <Input
                    value={med.name}
                    onChange={(e) => updateMedication(med.id, 'name', e.target.value)}
                    placeholder="e.g., Amoxicillin"
                    list="medications-list"
                    className="mt-1"
                  />
                  <datalist id="medications-list">
                    {COMMON_MEDICATIONS.map(m => (
                      <option key={m.name} value={m.name} />
                    ))}
                  </datalist>
                </div>
                
                <div>
                  <Label className="text-[var(--text-mid)]">Dosage</Label>
                  <Input
                    value={med.dosage}
                    onChange={(e) => updateMedication(med.id, 'dosage', e.target.value)}
                    placeholder="e.g., 500mg"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label className="text-[var(--text-mid)]">Form</Label>
                  <Select
                    value={med.form}
                    onValueChange={(value) => updateMedication(med.id, 'form', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tablet">Tablet</SelectItem>
                      <SelectItem value="Capsule">Capsule</SelectItem>
                      <SelectItem value="Suspension">Suspension</SelectItem>
                      <SelectItem value="Syrup">Syrup</SelectItem>
                      <SelectItem value="Injection">Injection</SelectItem>
                      <SelectItem value="Cream">Cream</SelectItem>
                      <SelectItem value="Ointment">Ointment</SelectItem>
                      <SelectItem value="Drops">Drops</SelectItem>
                      <SelectItem value="Inhaler">Inhaler</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-[var(--text-mid)]">Frequency</Label>
                  <Select
                    value={med.frequency}
                    onValueChange={(value) => updateMedication(med.id, 'frequency', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCY_OPTIONS.map((freq) => (
                        <SelectItem key={freq} value={freq}>
                          {freq}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-[var(--text-mid)]">Duration (days)</Label>
                  <Input
                    type="number"
                    value={med.duration}
                    onChange={(e) => {
                      const duration = e.target.value;
                      updateMedication(med.id, 'duration', duration);
                      if (med.frequency) {
                        const qty = calculateQuantity(med.frequency, duration);
                        updateMedication(med.id, 'quantity', qty);
                      }
                    }}
                    placeholder="e.g., 7"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label className="text-[var(--text-mid)]">Quantity</Label>
                  <Input
                    type="number"
                    value={med.quantity}
                    onChange={(e) => updateMedication(med.id, 'quantity', parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label className="text-[var(--text-mid)]">Refills</Label>
                  <Select
                    value={med.refills.toString()}
                    onValueChange={(value) => updateMedication(med.id, 'refills', parseInt(value))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, 4, 5].map((n) => (
                        <SelectItem key={n} value={n.toString()}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-[var(--text-mid)]">Special Instructions (SIG)</Label>
                <Input
                  value={med.instructions}
                  onChange={(e) => updateMedication(med.id, 'instructions', e.target.value)}
                  placeholder="e.g., Take with food, complete full course"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        ))}

        <Button variant="outline" onClick={addMedication} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Medication
        </Button>
      </div>

      {/* Additional Info */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg text-[var(--text-primary)]">Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-[var(--text-mid)]">Diagnosis</Label>
            <Input
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Primary diagnosis for this prescription"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label className="text-[var(--text-mid)]">Notes for Pharmacy</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes for the pharmacy..."
              rows={2}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label className="text-[var(--text-mid)]">Valid Until</Label>
            <Input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
        <Button variant="outline">
          <Building className="w-4 h-4 mr-2" />
          Send to Pharmacy
        </Button>
        <Button variant="outline">
          <Mail className="w-4 h-4 mr-2" />
          Email to Patient
        </Button>
        <Button className="btn-gold" onClick={handleSave} disabled={isSaving}>
          <CheckCircle2 className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Prescription'}
        </Button>
      </div>
    </div>
  );
}
