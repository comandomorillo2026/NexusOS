'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Video,
  MessageSquare,
  FileText,
  Pill,
  Send,
  Paperclip,
  Image,
  Download,
  User,
  Clock,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
  Activity,
  Heart,
  Thermometer
} from 'lucide-react';
import { VideoConsultation } from './VideoConsultation';

interface ConsultationRoomProps {
  roomId: string;
  roomCode: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  tenantId: string;
  onEndConsultation: (notes: ConsultationNotes) => void;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'doctor' | 'patient';
  message: string;
  type: 'text' | 'file' | 'image';
  fileUrl?: string;
  fileName?: string;
  timestamp: Date;
}

interface ConsultationNotes {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  diagnosis: string;
  followUpRequired: boolean;
  followUpNotes: string;
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export function ConsultationRoom({
  roomId,
  roomCode,
  doctorId,
  doctorName,
  patientName,
  patientId,
  tenantId,
  onEndConsultation,
}: ConsultationRoomProps) {
  const [activeTab, setActiveTab] = useState('video');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isInCall, setIsInCall] = useState(true);
  const [connectionQuality, setConnectionQuality] = useState('excellent');
  
  // Consultation notes state
  const [notes, setNotes] = useState<ConsultationNotes>({
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
    diagnosis: '',
    followUpRequired: false,
    followUpNotes: '',
  });

  // Prescription state
  const [medications, setMedications] = useState<Medication[]>([{
    name: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
  }]);
  const [prescriptionNotes, setPrescriptionNotes] = useState('');

  // Patient vitals (mock data)
  const [patientVitals] = useState({
    bloodPressure: '120/80',
    heartRate: 72,
    temperature: 98.6,
    weight: 165,
    lastUpdated: new Date().toISOString(),
  });

  // Handle connection quality change
  const handleConnectionChange = (quality: string) => {
    setConnectionQuality(quality);
  };

  // Send message
  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: doctorId,
      senderName: doctorName,
      senderRole: 'doctor',
      message: newMessage,
      type: 'text',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  // Add medication
  const addMedication = () => {
    setMedications(prev => [...prev, {
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
    }]);
  };

  // Remove medication
  const removeMedication = (index: number) => {
    setMedications(prev => prev.filter((_, i) => i !== index));
  };

  // Update medication
  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    setMedications(prev => prev.map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    ));
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // In a real app, upload to storage and get URL
    const message: Message = {
      id: Date.now().toString(),
      senderId: doctorId,
      senderName: doctorName,
      senderRole: 'doctor',
      message: `Shared file: ${file.name}`,
      type: file.type.startsWith('image/') ? 'image' : 'file',
      fileName: file.name,
      fileUrl: URL.createObjectURL(file),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, message]);
  };

  // Handle screenshot
  const handleScreenshot = (imageData: string) => {
    const message: Message = {
      id: Date.now().toString(),
      senderId: doctorId,
      senderName: doctorName,
      senderRole: 'doctor',
      message: 'Screenshot captured',
      type: 'image',
      fileUrl: imageData,
      fileName: `screenshot-${Date.now()}.png`,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, message]);
  };

  // End consultation
  const handleEndConsultation = () => {
    onEndConsultation(notes);
  };

  // Save notes
  const saveNotes = async () => {
    try {
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
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  // Save prescription
  const savePrescription = async () => {
    try {
      await fetch('/api/clinic/telemed/prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          patientId,
          patientName,
          doctorId,
          doctorName,
          tenantId,
          medications: medications.filter(m => m.name),
          diagnosis: notes.diagnosis,
          notes: prescriptionNotes,
        }),
      });
    } catch (error) {
      console.error('Error saving prescription:', error);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[var(--obsidian)]">
      {/* Top Header */}
      <header className="h-14 bg-[var(--obsidian-2)] border-b border-[var(--glass-border)] flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--nexus-violet)] to-[var(--nexus-fuchsia)] flex items-center justify-center">
            <Stethoscope className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-[var(--text-primary)]">Consultation with {patientName}</h1>
            <p className="text-xs text-[var(--text-dim)]">Room: {roomCode}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge className={`${connectionQuality === 'excellent' ? 'bg-green-600' : connectionQuality === 'good' ? 'bg-yellow-600' : 'bg-red-600'}`}>
            {connectionQuality}
          </Badge>
          <Button variant="destructive" onClick={handleEndConsultation}>
            End Consultation
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Video & Tabs */}
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="px-4 pt-2">
              <TabsList className="bg-[var(--obsidian-2)]">
                <TabsTrigger value="video" className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Video
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Chat
                  {messages.length > 0 && (
                    <Badge className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                      {messages.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="notes" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Notes
                </TabsTrigger>
                <TabsTrigger value="prescription" className="flex items-center gap-2">
                  <Pill className="w-4 h-4" />
                  Prescription
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="video" className="flex-1 m-0 p-4">
              {isInCall ? (
                <VideoConsultation
                  roomId={roomId}
                  roomCode={roomCode}
                  userId={doctorId}
                  userName={doctorName}
                  userRole="doctor"
                  partnerName={patientName}
                  onEndCall={() => setIsInCall(false)}
                  onConnectionChange={handleConnectionChange}
                  onTakeScreenshot={handleScreenshot}
                  recordingConsent={true}
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-[var(--obsidian-2)] rounded-lg">
                  <div className="text-center">
                    <Video className="w-16 h-16 text-[var(--text-dim)] mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Call Ended</h3>
                    <Button onClick={() => setIsInCall(true)}>
                      Reconnect
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="chat" className="flex-1 m-0 p-4 flex flex-col">
              {/* Messages */}
              <ScrollArea className="flex-1 mb-4 p-4 bg-[var(--obsidian-2)] rounded-lg">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-[var(--text-dim)] py-8">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.senderRole === 'doctor' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${msg.senderRole === 'doctor' ? 'order-2' : 'order-1'}`}>
                          <div className={`p-3 rounded-lg ${
                            msg.senderRole === 'doctor'
                              ? 'bg-[var(--nexus-violet)] text-white'
                              : 'bg-[var(--glass)] text-[var(--text-primary)]'
                          }`}>
                            {msg.type === 'text' && (
                              <p>{msg.message}</p>
                            )}
                            {msg.type === 'image' && msg.fileUrl && (
                              <img src={msg.fileUrl} alt={msg.fileName} className="rounded max-w-full" />
                            )}
                            {msg.type === 'file' && msg.fileUrl && (
                              <a href={msg.fileUrl} download={msg.fileName} className="flex items-center gap-2 hover:underline">
                                <Paperclip className="w-4 h-4" />
                                {msg.fileName}
                              </a>
                            )}
                          </div>
                          <p className="text-xs text-[var(--text-dim)] mt-1">
                            {msg.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="flex gap-2">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button onClick={sendMessage}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="flex-1 m-0 p-4 overflow-auto">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg text-[var(--text-primary)]">Consultation Notes (SOAP)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-[var(--text-mid)]">Subjective</Label>
                    <Textarea
                      value={notes.subjective}
                      onChange={(e) => setNotes(prev => ({ ...prev, subjective: e.target.value }))}
                      placeholder="Patient's reported symptoms and concerns..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-[var(--text-mid)]">Objective</Label>
                    <Textarea
                      value={notes.objective}
                      onChange={(e) => setNotes(prev => ({ ...prev, objective: e.target.value }))}
                      placeholder="Physical examination findings, observations..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-[var(--text-mid)]">Assessment</Label>
                    <Textarea
                      value={notes.assessment}
                      onChange={(e) => setNotes(prev => ({ ...prev, assessment: e.target.value }))}
                      placeholder="Clinical assessment and differential diagnosis..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-[var(--text-mid)]">Plan</Label>
                    <Textarea
                      value={notes.plan}
                      onChange={(e) => setNotes(prev => ({ ...prev, plan: e.target.value }))}
                      placeholder="Treatment plan, follow-up instructions..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-[var(--text-mid)]">Diagnosis</Label>
                    <Input
                      value={notes.diagnosis}
                      onChange={(e) => setNotes(prev => ({ ...prev, diagnosis: e.target.value }))}
                      placeholder="Primary diagnosis..."
                      className="mt-1"
                    />
                  </div>

                  <Separator className="my-4" />

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="followup"
                      checked={notes.followUpRequired}
                      onChange={(e) => setNotes(prev => ({ ...prev, followUpRequired: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="followup" className="text-[var(--text-mid)]">Follow-up Required</Label>
                  </div>

                  {notes.followUpRequired && (
                    <div>
                      <Label className="text-[var(--text-mid)]">Follow-up Notes</Label>
                      <Textarea
                        value={notes.followUpNotes}
                        onChange={(e) => setNotes(prev => ({ ...prev, followUpNotes: e.target.value }))}
                        placeholder="Follow-up instructions..."
                        rows={2}
                        className="mt-1"
                      />
                    </div>
                  )}

                  <Button className="w-full btn-gold" onClick={saveNotes}>
                    Save Notes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="prescription" className="flex-1 m-0 p-4 overflow-auto">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg text-[var(--text-primary)]">E-Prescription</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {medications.map((med, index) => (
                    <div key={index} className="p-4 bg-[var(--glass)] rounded-lg space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-[var(--text-primary)]">Medication {index + 1}</span>
                        {medications.length > 1 && (
                          <Button variant="ghost" size="sm" onClick={() => removeMedication(index)}>
                            Remove
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-[var(--text-dim)]">Medication Name</Label>
                          <Input
                            value={med.name}
                            onChange={(e) => updateMedication(index, 'name', e.target.value)}
                            placeholder="e.g., Amoxicillin"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-[var(--text-dim)]">Dosage</Label>
                          <Input
                            value={med.dosage}
                            onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                            placeholder="e.g., 500mg"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-[var(--text-dim)]">Frequency</Label>
                          <Input
                            value={med.frequency}
                            onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                            placeholder="e.g., 3 times daily"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-[var(--text-dim)]">Duration</Label>
                          <Input
                            value={med.duration}
                            onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                            placeholder="e.g., 7 days"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-xs text-[var(--text-dim)]">Special Instructions</Label>
                        <Input
                          value={med.instructions}
                          onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                          placeholder="e.g., Take with food"
                        />
                      </div>
                    </div>
                  ))}

                  <Button variant="outline" onClick={addMedication} className="w-full">
                    + Add Medication
                  </Button>

                  <div>
                    <Label className="text-[var(--text-mid)]">Additional Notes</Label>
                    <Textarea
                      value={prescriptionNotes}
                      onChange={(e) => setPrescriptionNotes(e.target.value)}
                      placeholder="Any additional instructions for the pharmacy..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button className="flex-1" variant="outline" onClick={savePrescription}>
                      Save Prescription
                    </Button>
                    <Button className="flex-1 btn-gold">
                      <Download className="w-4 h-4 mr-2" />
                      Print / Send
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Patient Info Sidebar */}
        <div className="w-72 bg-[var(--obsidian-2)] border-l border-[var(--glass-border)] p-4 overflow-auto hidden lg:block">
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--nexus-violet)] to-[var(--nexus-fuchsia)] flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-white">
                {patientName.charAt(0).toUpperCase()}
              </span>
            </div>
            <h3 className="font-semibold text-[var(--text-primary)]">{patientName}</h3>
            <p className="text-sm text-[var(--text-dim)]">Patient ID: {patientId.slice(0, 8)}</p>
          </div>

          <Separator className="my-4" />

          {/* Vitals */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-[var(--text-mid)]">Recent Vitals</h4>
            
            <div className="p-3 rounded-lg bg-[var(--glass)] flex items-center gap-3">
              <Heart className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-xs text-[var(--text-dim)]">Blood Pressure</p>
                <p className="font-medium text-[var(--text-primary)]">{patientVitals.bloodPressure} mmHg</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[var(--glass)] flex items-center gap-3">
              <Activity className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-xs text-[var(--text-dim)]">Heart Rate</p>
                <p className="font-medium text-[var(--text-primary)]">{patientVitals.heartRate} bpm</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[var(--glass)] flex items-center gap-3">
              <Thermometer className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-xs text-[var(--text-dim)]">Temperature</p>
                <p className="font-medium text-[var(--text-primary)]">{patientVitals.temperature}°F</p>
              </div>
            </div>

            <p className="text-xs text-[var(--text-dim)] text-right">
              Updated: {new Date(patientVitals.lastUpdated).toLocaleTimeString()}
            </p>
          </div>

          <Separator className="my-4" />

          {/* Quick Actions */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-[var(--text-mid)]">Quick Actions</h4>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              View Medical History
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Activity className="w-4 h-4 mr-2" />
              View Lab Results
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Pill className="w-4 h-4 mr-2" />
              Current Medications
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
