'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  FileText,
  Save,
  Clock,
  User,
  Stethoscope,
  ClipboardList,
  AlertCircle,
  CheckCircle2,
  Printer,
  Send,
  History,
  Plus
} from 'lucide-react';

interface ConsultationNotesProps {
  roomId?: string;
  patientId?: string;
  patientName?: string;
  doctorId?: string;
  doctorName?: string;
  readOnly?: boolean;
  onSave?: (notes: NotesData) => void;
}

interface NotesData {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  diagnosis: string;
  icdCode?: string;
  followUpRequired: boolean;
  followUpDate?: string;
  followUpNotes: string;
  workNotes?: string;
  referral?: string;
}

interface PreviousNote {
  id: string;
  date: string;
  doctorName: string;
  diagnosis: string;
  preview: string;
}

// Demo previous notes
const DEMO_PREVIOUS_NOTES: PreviousNote[] = [
  {
    id: '1',
    date: '2026-03-15',
    doctorName: 'Dr. Carlos Pérez',
    diagnosis: 'Upper Respiratory Infection',
    preview: 'Patient presented with cough and fever for 3 days. Prescribed antibiotics and rest...',
  },
  {
    id: '2',
    date: '2026-03-01',
    doctorName: 'Dr. Ana Rodríguez',
    diagnosis: 'Routine Check-up',
    preview: 'Annual physical examination. All vitals normal. Recommended lifestyle modifications...',
  },
  {
    id: '3',
    date: '2026-02-15',
    doctorName: 'Dr. Carlos Pérez',
    diagnosis: 'Hypertension Follow-up',
    preview: 'Blood pressure well controlled on current medication. Continue same regimen...',
  },
];

export function ConsultationNotes({
  roomId,
  patientName = 'Patient',
  doctorName = 'Doctor',
  readOnly = false,
  onSave,
}: ConsultationNotesProps) {
  const [notes, setNotes] = useState<NotesData>({
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
    diagnosis: '',
    followUpRequired: false,
    followUpNotes: '',
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setInterval(() => {
      if (notes.subjective || notes.objective || notes.assessment || notes.plan) {
        handleSave(true);
      }
    }, 60000); // Auto-save every minute

    return () => clearInterval(autoSave);
  }, [notes]);

  // Handle input change
  const handleChange = (field: keyof NotesData, value: string | boolean) => {
    setNotes(prev => ({ ...prev, [field]: value }));
  };

  // Save notes
  const handleSave = async (isAutoSave = false) => {
    if (readOnly) return;
    
    if (!isAutoSave) {
      setIsSaving(true);
    }

    try {
      if (roomId) {
        await fetch('/api/clinic/telemed/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId,
            notes: JSON.stringify(notes),
            diagnosis: notes.diagnosis,
            followUpRequired: notes.followUpRequired,
            followUpNotes: notes.followUpNotes,
          }),
        });
      }
      
      setLastSaved(new Date());
      onSave?.(notes);
    } catch (error) {
      console.error('Error saving notes:', error);
    } finally {
      if (!isAutoSave) {
        setIsSaving(false);
      }
    }
  };

  // Print notes
  const handlePrint = () => {
    window.print();
  };

  // Load previous note
  const loadPreviousNote = (note: PreviousNote) => {
    // In a real app, fetch the full note from API
    setShowHistory(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-[var(--nexus-violet)]" />
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Consultation Notes</h2>
            <p className="text-sm text-[var(--text-dim)]">
              {patientName} • {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="text-xs text-[var(--text-dim)]">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          
          <Dialog open={showHistory} onOpenChange={setShowHistory}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <History className="w-4 h-4 mr-2" />
                History
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Previous Consultations</DialogTitle>
              </DialogHeader>
              <ScrollArea className="h-80 mt-4">
                <div className="space-y-3">
                  {DEMO_PREVIOUS_NOTES.map((note) => (
                    <Card 
                      key={note.id} 
                      className="glass-card cursor-pointer hover:border-[var(--nexus-violet)]/50"
                      onClick={() => loadPreviousNote(note)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-[var(--text-primary)]">{note.diagnosis}</p>
                            <p className="text-sm text-[var(--text-dim)]">{note.doctorName}</p>
                          </div>
                          <Badge variant="outline">{note.date}</Badge>
                        </div>
                        <p className="text-sm text-[var(--text-mid)] line-clamp-2">{note.preview}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
          
          {!readOnly && (
            <Button onClick={() => handleSave()} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          )}
        </div>
      </div>

      {/* SOAP Notes */}
      <Card className="glass-card">
        <CardContent className="p-6 space-y-6">
          {/* Subjective */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center">
                <span className="text-xs font-bold text-blue-500">S</span>
              </div>
              <Label className="text-base font-semibold text-[var(--text-primary)]">Subjective</Label>
            </div>
            <Textarea
              value={notes.subjective}
              onChange={(e) => handleChange('subjective', e.target.value)}
              placeholder="Patient's chief complaint, history of present illness, relevant symptoms, review of systems..."
              rows={4}
              disabled={readOnly}
              className="resize-none"
            />
          </div>

          {/* Objective */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded bg-green-500/20 flex items-center justify-center">
                <span className="text-xs font-bold text-green-500">O</span>
              </div>
              <Label className="text-base font-semibold text-[var(--text-primary)]">Objective</Label>
            </div>
            <Textarea
              value={notes.objective}
              onChange={(e) => handleChange('objective', e.target.value)}
              placeholder="Physical examination findings, vital signs, observable symptoms, test results..."
              rows={4}
              disabled={readOnly}
              className="resize-none"
            />
          </div>

          {/* Assessment */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded bg-yellow-500/20 flex items-center justify-center">
                <span className="text-xs font-bold text-yellow-500">A</span>
              </div>
              <Label className="text-base font-semibold text-[var(--text-primary)]">Assessment</Label>
            </div>
            <Textarea
              value={notes.assessment}
              onChange={(e) => handleChange('assessment', e.target.value)}
              placeholder="Clinical impression, differential diagnosis, assessment of the patient's condition..."
              rows={4}
              disabled={readOnly}
              className="resize-none"
            />
          </div>

          {/* Plan */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded bg-red-500/20 flex items-center justify-center">
                <span className="text-xs font-bold text-red-500">P</span>
              </div>
              <Label className="text-base font-semibold text-[var(--text-primary)]">Plan</Label>
            </div>
            <Textarea
              value={notes.plan}
              onChange={(e) => handleChange('plan', e.target.value)}
              placeholder="Treatment plan, medications, procedures ordered, patient education, referrals..."
              rows={4}
              disabled={readOnly}
              className="resize-none"
            />
          </div>

          <Separator />

          {/* Diagnosis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-[var(--text-mid)]">Primary Diagnosis</Label>
              <Input
                value={notes.diagnosis}
                onChange={(e) => handleChange('diagnosis', e.target.value)}
                placeholder="e.g., Acute bronchitis"
                disabled={readOnly}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-[var(--text-mid)]">ICD-10 Code (optional)</Label>
              <Input
                value={notes.icdCode || ''}
                onChange={(e) => handleChange('icdCode', e.target.value)}
                placeholder="e.g., J20.9"
                disabled={readOnly}
                className="mt-1"
              />
            </div>
          </div>

          <Separator />

          {/* Follow-up */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="followup"
                checked={notes.followUpRequired}
                onChange={(e) => handleChange('followUpRequired', e.target.checked)}
                disabled={readOnly}
                className="w-4 h-4 rounded border-gray-300"
              />
              <Label htmlFor="followup" className="text-[var(--text-primary)]">
                Follow-up Required
              </Label>
            </div>

            {notes.followUpRequired && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
                <div>
                  <Label className="text-[var(--text-mid)]">Follow-up Date</Label>
                  <Input
                    type="date"
                    value={notes.followUpDate || ''}
                    onChange={(e) => handleChange('followUpDate', e.target.value)}
                    disabled={readOnly}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[var(--text-mid)]">Follow-up Notes</Label>
                  <Input
                    value={notes.followUpNotes}
                    onChange={(e) => handleChange('followUpNotes', e.target.value)}
                    placeholder="Reason for follow-up"
                    disabled={readOnly}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Additional Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-[var(--text-mid)]">Work/School Notes</Label>
              <Textarea
                value={notes.workNotes || ''}
                onChange={(e) => handleChange('workNotes', e.target.value)}
                placeholder="Notes for work or school excuse..."
                rows={2}
                disabled={readOnly}
                className="resize-none mt-1"
              />
            </div>
            <div>
              <Label className="text-[var(--text-mid)]">Referral</Label>
              <Textarea
                value={notes.referral || ''}
                onChange={(e) => handleChange('referral', e.target.value)}
                placeholder="Referral to specialist..."
                rows={2}
                disabled={readOnly}
                className="resize-none mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      {!readOnly && (
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline">
            <Send className="w-4 h-4 mr-2" />
            Send to Patient
          </Button>
          <Button className="btn-gold" onClick={() => handleSave()}>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Finalize Notes
          </Button>
        </div>
      )}
    </div>
  );
}
