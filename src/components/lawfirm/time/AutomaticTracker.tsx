'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Play,
  Pause,
  Square,
  Timer,
  Clock,
  ChevronUp,
  ChevronDown,
  FileText,
  Phone,
  Mail,
  Users,
  Settings,
  AlertTriangle,
  CheckCircle,
  Minimize2,
  Maximize2,
  X,
  DollarSign,
} from 'lucide-react';
import { useTimer } from '@/hooks/useTimer';

// Types
interface Case {
  id: string;
  caseNumber: string;
  title: string;
  clientName: string;
  hourlyRate?: number;
}

interface ActivityType {
  value: string;
  label: string;
  icon: React.ReactNode;
}

const activityTypes: ActivityType[] = [
  { value: 'research', label: 'Legal Research', icon: <FileText className="w-4 h-4" /> },
  { value: 'drafting', label: 'Document Drafting', icon: <FileText className="w-4 h-4" /> },
  { value: 'meeting', label: 'Client Meeting', icon: <Users className="w-4 h-4" /> },
  { value: 'call', label: 'Phone Call', icon: <Phone className="w-4 h-4" /> },
  { value: 'email', label: 'Email Correspondence', icon: <Mail className="w-4 h-4" /> },
  { value: 'court', label: 'Court Appearance', icon: <Clock className="w-4 h-4" /> },
  { value: 'review', label: 'Document Review', icon: <FileText className="w-4 h-4" /> },
  { value: 'general', label: 'General Work', icon: <Timer className="w-4 h-4" /> },
];

const roundingOptions = [
  { value: 'none', label: 'No Rounding' },
  { value: '6min', label: '6 min increments' },
  { value: '15min', label: '15 min increments' },
];

// Mock cases for demo
const mockCases: Case[] = [
  { id: '1', caseNumber: 'CS-2026-001', title: 'Smith vs. Johnson Holdings', clientName: 'Robert Smith', hourlyRate: 850 },
  { id: '2', caseNumber: 'CS-2026-002', title: 'Estate of Williams', clientName: 'Williams Family', hourlyRate: 900 },
  { id: '3', caseNumber: 'CS-2026-003', title: 'TT Corp Contract Dispute', clientName: 'TT Corporation Ltd.', hourlyRate: 1200 },
  { id: '4', caseNumber: 'CS-2026-004', title: 'Garcia - Divorce Proceedings', clientName: 'Ana Garcia', hourlyRate: 750 },
  { id: '5', caseNumber: 'CS-2026-005', title: 'R. Singh - Criminal Defense', clientName: 'Rajesh Singh', hourlyRate: 950 },
];

interface AutomaticTrackerProps {
  tenantId?: string;
  userId?: string;
  userName?: string;
  onSessionSaved?: (session: any) => void;
}

export function AutomaticTracker({
  tenantId = 'demo-tenant',
  userId = 'demo-user',
  userName = 'Demo Attorney',
  onSessionSaved,
}: AutomaticTrackerProps) {
  // State
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [showAutoPauseWarning, setShowAutoPauseWarning] = useState(false);
  const [cases, setCases] = useState<Case[]>(mockCases);

  // Timer hook
  const timer = useTimer({
    autoPauseAfterMinutes: 5,
    onAutoPause: () => {
      setShowAutoPauseWarning(true);
    },
  });

  // Get selected case
  const selectedCase = cases.find((c) => c.id === selectedCaseId);

  // Handle timer start
  const handleStart = useCallback(() => {
    if (!selectedCaseId || !selectedCase) return;

    timer.start({
      caseId: selectedCaseId,
      caseName: selectedCase.title,
      description: '',
      activityType: 'general',
      isBillable: true,
      roundingRule: 'none',
      hourlyRate: selectedCase.hourlyRate || 850,
    });
  }, [selectedCaseId, selectedCase, timer]);

  // Handle timer stop
  const handleStop = useCallback(() => {
    setShowSaveDialog(true);
  }, []);

  // Handle save session
  const handleSaveSession = useCallback(async () => {
    const session = timer.stop();
    
    // Prepare session data for API
    const sessionData = {
      tenantId,
      userId,
      userName,
      caseId: session.caseId,
      startTime: session.startTime,
      endTime: new Date().toISOString(),
      durationSeconds: session.accumulatedSeconds,
      activityType: session.activityType,
      description: session.description,
      isBillable: session.isBillable,
      roundingRule: session.roundingRule,
      hourlyRate: session.hourlyRate,
      calculatedAmount: timer.billableAmount,
    };

    try {
      // In production, save to API
      const response = await fetch('/api/lawfirm/time/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
      });

      if (response.ok) {
        const result = await response.json();
        if (onSessionSaved) {
          onSessionSaved(result.data);
        }
      }
    } catch (error) {
      console.error('Error saving session:', error);
    }

    setShowSaveDialog(false);
  }, [timer, tenantId, userId, userName, onSessionSaved]);

  // Handle discard session
  const handleDiscardSession = useCallback(() => {
    timer.stop();
    setShowSaveDialog(false);
  }, [timer]);

  // Get activity icon
  const getActivityIcon = (type: string) => {
    const activity = activityTypes.find((a) => a.value === type);
    return activity?.icon || <Timer className="w-4 h-4" />;
  };

  return (
    <>
      {/* Floating Timer Widget */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        className={`fixed z-50 ${isMinimized ? 'bottom-4 right-4' : 'bottom-4 right-4'}`}
      >
        <Card className={`shadow-2xl border-2 ${
          timer.isRunning && !timer.isPaused 
            ? 'border-green-500/50 bg-gradient-to-br from-[#1E3A5F] to-[#2C4A6F]' 
            : timer.isPaused 
              ? 'border-yellow-500/50 bg-gradient-to-br from-[#1E3A5F] to-[#2C4A6F]'
              : 'border-[#C4A35A]/50 bg-gradient-to-br from-[#1E3A5F] to-[#2C4A6F]'
        } ${isMinimized ? 'w-64' : isExpanded ? 'w-96' : 'w-80'}`}>
          <CardContent className={`p-0 ${isMinimized ? '' : 'p-4'}`}>
            {/* Minimized View */}
            {isMinimized ? (
              <div 
                className="flex items-center justify-between p-3 cursor-pointer"
                onClick={() => setIsMinimized(false)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    timer.isRunning && !timer.isPaused 
                      ? 'bg-green-500 animate-pulse' 
                      : 'bg-gray-500'
                  }`}>
                    <Timer className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-mono text-lg font-bold">
                      {timer.formattedTime}
                    </p>
                    {timer.caseName && (
                      <p className="text-white/60 text-xs truncate max-w-[120px]">
                        {timer.caseName}
                      </p>
                    )}
                  </div>
                </div>
                <Maximize2 className="w-4 h-4 text-white/60" />
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      timer.isRunning && !timer.isPaused 
                        ? 'bg-green-500/20' 
                        : timer.isPaused 
                          ? 'bg-yellow-500/20'
                          : 'bg-white/10'
                    }`}>
                      <Timer className={`w-5 h-5 ${
                        timer.isRunning && !timer.isPaused 
                          ? 'text-green-400' 
                          : timer.isPaused 
                            ? 'text-yellow-400'
                            : 'text-white'
                      }`} />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Time Tracker</p>
                      <p className="text-white/60 text-xs">
                        {timer.isRunning 
                          ? timer.isPaused 
                            ? 'Paused' 
                            : 'Running'
                          : 'Ready'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
                      onClick={() => setIsExpanded(!isExpanded)}
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
                      onClick={() => setIsMinimized(true)}
                    >
                      <Minimize2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Timer Display */}
                <div className="text-center mb-4">
                  <p className="text-5xl font-mono font-bold text-white tracking-wider">
                    {timer.formattedTime}
                  </p>
                  {timer.roundingRule !== 'none' && (
                    <p className="text-white/60 text-xs mt-1">
                      Rounded: {timer.roundedDuration}
                    </p>
                  )}
                  {timer.isBillable && (
                    <p className="text-[#C4A35A] font-semibold mt-2">
                      TT$ {timer.billableAmount.toFixed(2)}
                    </p>
                  )}
                </div>

                {/* Auto-pause warning */}
                <AnimatePresence>
                  {showAutoPauseWarning && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-3"
                    >
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                        <p className="text-yellow-200 text-xs">
                          Timer paused due to inactivity
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="ml-auto text-yellow-200 hover:text-white"
                          onClick={() => setShowAutoPauseWarning(false)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Case Selection (when not running) */}
                {!timer.isRunning && (
                  <div className="space-y-3 mb-4">
                    <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Select a case..." />
                      </SelectTrigger>
                      <SelectContent>
                        {cases.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            <div className="flex flex-col">
                              <span>{c.title}</span>
                              <span className="text-xs text-gray-500">{c.clientName}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Running Session Details */}
                {timer.isRunning && (
                  <div className="space-y-3 mb-4">
                    {/* Case Info */}
                    <div className="p-3 rounded-lg bg-white/10">
                      <p className="text-white font-medium text-sm truncate">
                        {timer.caseName}
                      </p>
                      <p className="text-white/60 text-xs mt-1">
                        {selectedCase?.clientName}
                      </p>
                    </div>

                    {/* Activity Type */}
                    {isExpanded && (
                      <Select
                        value={timer.activityType}
                        onValueChange={(value) => timer.updateDetails({ activityType: value })}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white h-9">
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
                    )}

                    {/* Description */}
                    {isExpanded && (
                      <Textarea
                        placeholder="Add description..."
                        value={timer.description}
                        onChange={(e) => timer.updateDetails({ description: e.target.value })}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-16 resize-none"
                      />
                    )}

                    {/* Settings Row */}
                    {isExpanded && (
                      <div className="flex items-center gap-2">
                        <Select
                          value={timer.roundingRule}
                          onValueChange={(value: 'none' | '6min' | '15min') => 
                            timer.updateDetails({ roundingRule: value })
                          }
                        >
                          <SelectTrigger className="bg-white/10 border-white/20 text-white h-8 text-xs flex-1">
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
                        <Button
                          variant={timer.isBillable ? 'default' : 'outline'}
                          size="sm"
                          className={`h-8 text-xs ${
                            timer.isBillable 
                              ? 'bg-[#C4A35A] text-white hover:bg-[#C4A35A]/80' 
                              : 'border-white/20 text-white hover:bg-white/10'
                          }`}
                          onClick={() => timer.updateDetails({ isBillable: !timer.isBillable })}
                        >
                          <DollarSign className="w-3 h-3 mr-1" />
                          {timer.isBillable ? 'Billable' : 'Non-billable'}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Control Buttons */}
                <div className="flex items-center gap-2">
                  {!timer.isRunning ? (
                    <Button
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white h-12"
                      onClick={handleStart}
                      disabled={!selectedCaseId}
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Start Timer
                    </Button>
                  ) : timer.isPaused ? (
                    <>
                      <Button
                        variant="outline"
                        className="flex-1 border-white/20 text-white hover:bg-white/10 h-12"
                        onClick={handleStop}
                      >
                        <Square className="w-5 h-5 mr-2" />
                        Stop
                      </Button>
                      <Button
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white h-12"
                        onClick={timer.resume}
                      >
                        <Play className="w-5 h-5 mr-2" />
                        Resume
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        className="flex-1 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20 h-12"
                        onClick={() => timer.pause()}
                      >
                        <Pause className="w-5 h-5 mr-2" />
                        Pause
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/20 h-12"
                        onClick={handleStop}
                      >
                        <Square className="w-5 h-5 mr-2" />
                        Stop
                      </Button>
                    </>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Save Session Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Save Time Entry
            </DialogTitle>
            <DialogDescription>
              Review and save your time entry
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-gray-50">
                <p className="text-xs text-gray-500">Duration</p>
                <p className="text-lg font-semibold">{timer.formattedDuration}</p>
                {timer.roundingRule !== 'none' && (
                  <p className="text-xs text-gray-500">Rounded: {timer.roundedDuration}</p>
                )}
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                <p className="text-xs text-gray-500">Amount</p>
                <p className="text-lg font-semibold text-[#C4A35A]">
                  TT$ {timer.billableAmount.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Case */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Case</p>
              <p className="font-medium">{timer.caseName}</p>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <Textarea
                placeholder="What did you work on?"
                value={timer.description}
                onChange={(e) => timer.updateDetails({ description: e.target.value })}
                rows={3}
              />
            </div>

            {/* Activity Type */}
            <div>
              <label className="text-sm font-medium mb-1 block">Activity Type</label>
              <Select
                value={timer.activityType}
                onValueChange={(value) => timer.updateDetails({ activityType: value })}
              >
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

            {/* Billable Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="billable"
                checked={timer.isBillable}
                onChange={(e) => timer.updateDetails({ isBillable: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="billable" className="text-sm">
                This time is billable
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleDiscardSession}>
              Discard
            </Button>
            <Button
              className="bg-[#1E3A5F] hover:bg-[#2C4A6F]"
              onClick={handleSaveSession}
            >
              Save Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AutomaticTracker;
