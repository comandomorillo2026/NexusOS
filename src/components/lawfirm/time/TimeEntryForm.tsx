'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Clock,
  Calendar,
  FileText,
  Users,
  Phone,
  Mail,
  Scale,
  Search,
  Plus,
  Minus,
  Calculator,
  AlertCircle,
  CheckCircle,
  DollarSign,
} from 'lucide-react';

// Types
interface Case {
  id: string;
  caseNumber: string;
  title: string;
  clientName: string;
  hourlyRate?: number;
  billingType?: string;
}

interface TimeEntryFormProps {
  tenantId?: string;
  attorneyId?: string;
  attorneyName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit?: (entry: TimeEntryData) => void;
  initialData?: Partial<TimeEntryData>;
  mode?: 'create' | 'edit';
}

export interface TimeEntryData {
  caseId: string;
  caseName: string;
  clientName: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  description: string;
  activityType: string;
  isBillable: boolean;
  hourlyRate: number;
  roundingRule: 'none' | '6min' | '15min';
  notes?: string;
}

// Activity types
const activityTypes = [
  { value: 'research', label: 'Legal Research', icon: <Search className="w-4 h-4" /> },
  { value: 'drafting', label: 'Document Drafting', icon: <FileText className="w-4 h-4" /> },
  { value: 'meeting', label: 'Client Meeting', icon: <Users className="w-4 h-4" /> },
  { value: 'call', label: 'Phone Call', icon: <Phone className="w-4 h-4" /> },
  { value: 'email', label: 'Email Correspondence', icon: <Mail className="w-4 h-4" /> },
  { value: 'court', label: 'Court Appearance', icon: <Scale className="w-4 h-4" /> },
  { value: 'review', label: 'Document Review', icon: <FileText className="w-4 h-4" /> },
  { value: 'deposition', label: 'Deposition', icon: <Users className="w-4 h-4" /> },
  { value: 'negotiation', label: 'Negotiation', icon: <Users className="w-4 h-4" /> },
  { value: 'consultation', label: 'Consultation', icon: <Clock className="w-4 h-4" /> },
  { value: 'travel', label: 'Travel Time', icon: <Clock className="w-4 h-4" /> },
  { value: 'general', label: 'General Work', icon: <Clock className="w-4 h-4" /> },
];

const roundingOptions = [
  { value: 'none', label: 'No Rounding' },
  { value: '6min', label: '6 min increments (.1 hour)' },
  { value: '15min', label: '15 min increments (.25 hour)' },
];

// Mock cases
const mockCases: Case[] = [
  { id: '1', caseNumber: 'CS-2026-001', title: 'Smith vs. Johnson Holdings', clientName: 'Robert Smith', hourlyRate: 850 },
  { id: '2', caseNumber: 'CS-2026-002', title: 'Estate of Williams', clientName: 'Williams Family', hourlyRate: 900 },
  { id: '3', caseNumber: 'CS-2026-003', title: 'TT Corp Contract Dispute', clientName: 'TT Corporation Ltd.', hourlyRate: 1200 },
  { id: '4', caseNumber: 'CS-2026-004', title: 'Garcia - Divorce Proceedings', clientName: 'Ana Garcia', hourlyRate: 750 },
  { id: '5', caseNumber: 'CS-2026-005', title: 'R. Singh - Criminal Defense', clientName: 'Rajesh Singh', hourlyRate: 950 },
];

export function TimeEntryForm({
  tenantId = 'demo-tenant',
  attorneyId = 'demo-attorney',
  attorneyName = 'Demo Attorney',
  open: controlledOpen,
  onOpenChange,
  onSubmit,
  initialData,
  mode = 'create',
}: TimeEntryFormProps) {
  // Internal open state for uncontrolled usage
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;

  // Form state
  const [selectedCaseId, setSelectedCaseId] = useState(initialData?.caseId || '');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState(initialData?.startTime || '09:00');
  const [endTime, setEndTime] = useState(initialData?.endTime || '10:00');
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [description, setDescription] = useState(initialData?.description || '');
  const [activityType, setActivityType] = useState(initialData?.activityType || 'general');
  const [isBillable, setIsBillable] = useState(initialData?.isBillable ?? true);
  const [hourlyRate, setHourlyRate] = useState(initialData?.hourlyRate || 850);
  const [roundingRule, setRoundingRule] = useState<'none' | '6min' | '15min'>(initialData?.roundingRule || 'none');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [inputMode, setInputMode] = useState<'time' | 'duration'>('time');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get selected case
  const selectedCase = mockCases.find((c) => c.id === selectedCaseId);

  // Update hourly rate when case changes
  useEffect(() => {
    if (selectedCase?.hourlyRate) {
      setHourlyRate(selectedCase.hourlyRate);
    }
  }, [selectedCase]);

  // Calculate duration
  const calculateDuration = () => {
    if (inputMode === 'duration') {
      return hours * 60 + minutes;
    }

    if (!startTime || !endTime) return 0;

    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    
    if (end <= start) return 0;
    
    return Math.round((end.getTime() - start.getTime()) / 60000);
  };

  const durationMinutes = calculateDuration();

  // Apply rounding
  const getRoundedMinutes = () => {
    switch (roundingRule) {
      case '6min':
        return Math.ceil(durationMinutes / 6) * 6;
      case '15min':
        return Math.ceil(durationMinutes / 15) * 15;
      default:
        return durationMinutes;
    }
  };

  const roundedMinutes = getRoundedMinutes();

  // Calculate amount
  const calculateAmount = () => {
    if (!isBillable) return 0;
    const roundedHours = roundedMinutes / 60;
    return roundedHours * hourlyRate;
  };

  const amount = calculateAmount();

  // Format duration
  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  // Handle form submit
  const handleSubmit = async () => {
    if (!selectedCaseId || durationMinutes === 0 || !description) {
      return;
    }

    setIsSubmitting(true);

    const entryData: TimeEntryData = {
      caseId: selectedCaseId,
      caseName: selectedCase?.title || '',
      clientName: selectedCase?.clientName || '',
      date,
      startTime: inputMode === 'time' ? startTime : '',
      endTime: inputMode === 'time' ? endTime : '',
      durationMinutes: roundedMinutes,
      description,
      activityType,
      isBillable,
      hourlyRate,
      roundingRule,
      notes,
    };

    try {
      // Submit to API
      const response = await fetch('/api/lawfirm/time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          attorneyId,
          caseId: selectedCaseId,
          date,
          startTime: entryData.startTime,
          endTime: entryData.endTime,
          durationMinutes: roundedMinutes,
          description,
          activityCode: activityType,
          rate: hourlyRate,
          billable: isBillable,
        }),
      });

      if (response.ok) {
        if (onSubmit) {
          onSubmit(entryData);
        }
        setOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error submitting time entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setSelectedCaseId('');
    setDate(new Date().toISOString().split('T')[0]);
    setStartTime('09:00');
    setEndTime('10:00');
    setHours(0);
    setMinutes(0);
    setDescription('');
    setActivityType('general');
    setIsBillable(true);
    setHourlyRate(850);
    setRoundingRule('none');
    setNotes('');
  };

  // Validation
  const isValid = selectedCaseId && durationMinutes > 0 && description.trim().length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#C4A35A]" />
            {mode === 'create' ? 'Add Time Entry' : 'Edit Time Entry'}
          </DialogTitle>
          <DialogDescription>
            Record time worked on a case for billing purposes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Case Selection */}
          <div className="space-y-2">
            <Label>Case / Matter *</Label>
            <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a case..." />
              </SelectTrigger>
              <SelectContent>
                {mockCases.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{c.title}</span>
                      <span className="text-xs text-gray-500">{c.clientName}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCase && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Badge variant="outline">{selectedCase.caseNumber}</Badge>
                <span>Rate: TT${selectedCase.hourlyRate}/hr</span>
              </div>
            )}
          </div>

          {/* Date and Time Input Mode */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Input Mode</Label>
              <div className="flex gap-2">
                <Button
                  variant={inputMode === 'time' ? 'default' : 'outline'}
                  size="sm"
                  className={`flex-1 ${inputMode === 'time' ? 'bg-[#1E3A5F]' : ''}`}
                  onClick={() => setInputMode('time')}
                >
                  <Clock className="w-4 h-4 mr-1" />
                  Time
                </Button>
                <Button
                  variant={inputMode === 'duration' ? 'default' : 'outline'}
                  size="sm"
                  className={`flex-1 ${inputMode === 'duration' ? 'bg-[#1E3A5F]' : ''}`}
                  onClick={() => setInputMode('duration')}
                >
                  <Calculator className="w-4 h-4 mr-1" />
                  Duration
                </Button>
              </div>
            </div>
          </div>

          {/* Time/Duration Input */}
          {inputMode === 'time' ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time *</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>End Time *</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hours</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setHours(Math.max(0, hours - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    type="number"
                    value={hours}
                    onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                    className="text-center"
                    min={0}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setHours(hours + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Minutes</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setMinutes(Math.max(0, minutes - 15))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    type="number"
                    value={minutes}
                    onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                    className="text-center"
                    min={0}
                    max={59}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setMinutes(Math.min(59, minutes + 15))}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Duration Summary */}
          <div className="p-4 rounded-lg bg-gray-50 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="text-lg font-semibold">{formatDuration(durationMinutes)}</p>
              </div>
              
              {/* Rounding */}
              <div className="flex items-center gap-2">
                <Label className="text-sm">Rounding:</Label>
                <Select value={roundingRule} onValueChange={(v: any) => setRoundingRule(v)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roundingOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {roundingRule !== 'none' && durationMinutes !== roundedMinutes && (
              <div className="mt-2 text-sm text-[#C4A35A]">
                Rounded to {formatDuration(roundedMinutes)}
              </div>
            )}
          </div>

          {/* Activity Type */}
          <div className="space-y-2">
            <Label>Activity Type *</Label>
            <Select value={activityType} onValueChange={setActivityType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {activityTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      {type.icon}
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description *</Label>
            <Textarea
              placeholder="Describe the work performed..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Billable Toggle and Rate */}
          <div className="flex items-start gap-6">
            <div className="flex items-center gap-2">
              <Switch
                checked={isBillable}
                onCheckedChange={setIsBillable}
              />
              <Label>Billable</Label>
            </div>
            
            {isBillable && (
              <div className="flex-1">
                <Label>Hourly Rate (TT$)</Label>
                <Input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
                  className="w-32"
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Internal Notes (Optional)</Label>
            <Textarea
              placeholder="Add any internal notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Amount Summary */}
          {isBillable && (
            <div className="p-4 rounded-lg bg-gradient-to-r from-[#1E3A5F] to-[#2C4A6F] text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">Billable Amount</p>
                  <p className="text-2xl font-bold">TT$ {amount.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-80">{formatDuration(roundedMinutes)}</p>
                  <p className="text-sm opacity-80">@ TT${hourlyRate}/hr</p>
                </div>
              </div>
            </div>
          )}

          {/* Validation Warning */}
          {!isValid && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <p className="text-sm text-yellow-700">
                Please select a case, enter duration, and add a description
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            className="bg-[#1E3A5F] hover:bg-[#2C4A6F]"
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? (
              'Saving...'
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                {mode === 'create' ? 'Add Entry' : 'Save Changes'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TimeEntryForm;
