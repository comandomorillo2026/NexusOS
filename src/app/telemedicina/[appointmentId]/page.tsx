'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter, searchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  ScreenShare,
  ScreenShareOff,
  PhoneCall,
  Clock,
  Signal,
  AlertCircle,
  CheckCircle2,
  User,
  MessageSquare,
  Send,
  Paperclip,
  Shield,
  FileText,
  Download,
  Wifi,
  WifiOff,
  RefreshCw,
  CircleDot,
  FileDown,
  Printer,
  Calendar,
  ClipboardList,
  Heart,
  Activity,
} from 'lucide-react';

// Types
interface ConnectionStats {
  quality: 'excellent' | 'good' | 'poor' | 'disconnected';
  latency: number;
  packetLoss: number;
  bandwidth: number;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'doctor' | 'patient';
  message: string;
  type: 'text' | 'file' | 'image' | 'screenshot';
  fileUrl?: string;
  fileName?: string;
  timestamp: Date;
}

interface SharedDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: Date;
}

interface PostCallSummary {
  duration: number;
  diagnosis: string;
  medications: { name: string; dosage: string; frequency: string }[];
  followUpRequired: boolean;
  followUpDate?: string;
  notes: string;
  sharedDocuments: SharedDocument[];
}

// WebRTC Configuration
const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

// Demo data
const DEMO_ROOM = {
  roomCode: 'TELE2024',
  patientName: 'Carlos Rodríguez',
  doctorName: 'Dr. María González',
  scheduledTime: '09:30 AM',
  specialty: 'Medicina General',
  clinicName: 'Clínica San Fernando',
};

const DEMO_SHARED_DOCUMENTS: SharedDocument[] = [
  { id: '1', name: 'Lab Results - Blood Panel.pdf', type: 'pdf', url: '#', uploadedAt: new Date() },
  { id: '2', name: 'Prescription Summary.pdf', type: 'pdf', url: '#', uploadedAt: new Date() },
];

// Pre-Call Checklist Component
function PreCallChecklist({ onComplete }: { onComplete: () => void }) {
  const [isChecking, setIsChecking] = useState(true);
  const [deviceStatus, setDeviceStatus] = useState({
    camera: false,
    microphone: false,
    connection: false,
  });
  const [recordingConsent, setRecordingConsent] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    const checkDevices = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setDeviceStatus({
          camera: stream.getVideoTracks().length > 0,
          microphone: stream.getAudioTracks().length > 0,
          connection: navigator.onLine,
        });
        stream.getTracks().forEach(track => track.stop());
      } catch {
        setDeviceStatus({ camera: false, microphone: false, connection: navigator.onLine });
      } finally {
        setIsChecking(false);
      }
    };
    checkDevices();
  }, []);

  const allChecksPassed = deviceStatus.camera && deviceStatus.microphone && deviceStatus.connection && termsAccepted;

  return (
    <div className="min-h-screen bg-[var(--obsidian)] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--nexus-violet)] to-[var(--nexus-fuchsia)] flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Pre-Call Checklist</h1>
          <p className="text-[var(--text-mid)]">Let's make sure everything is ready for your consultation</p>
        </div>

        <Card className="glass-card mb-6">
          <CardHeader className="pb-3"><CardTitle className="text-lg">Device Check</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {isChecking ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-[var(--nexus-violet)]" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--glass)]">
                  <div className="flex items-center gap-3">
                    <Video className={`w-5 h-5 ${deviceStatus.camera ? 'text-green-500' : 'text-red-500'}`} />
                    <span>Camera</span>
                  </div>
                  {deviceStatus.camera ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--glass)]">
                  <div className="flex items-center gap-3">
                    <Mic className={`w-5 h-5 ${deviceStatus.microphone ? 'text-green-500' : 'text-red-500'}`} />
                    <span>Microphone</span>
                  </div>
                  {deviceStatus.microphone ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--glass)]">
                  <div className="flex items-center gap-3">
                    {deviceStatus.connection ? <Wifi className="w-5 h-5 text-green-500" /> : <WifiOff className="w-5 h-5 text-red-500" />}
                    <span>Internet Connection</span>
                  </div>
                  {deviceStatus.connection ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card mb-6">
          <CardHeader className="pb-3"><CardTitle className="text-lg">Consent & Terms</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Checkbox id="recording-consent" checked={recordingConsent} onCheckedChange={(checked) => setRecordingConsent(checked as boolean)} />
              <Label htmlFor="recording-consent" className="text-sm cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-[var(--nexus-violet)]" />
                  <span className="font-medium">Recording Consent (Optional)</span>
                </div>
                I consent to the recording of this consultation for my medical records.
              </Label>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox id="terms-accepted" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(checked as boolean)} />
              <Label htmlFor="terms-accepted" className="text-sm cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-[var(--nexus-violet)]" />
                  <span className="font-medium">Terms of Service *</span>
                </div>
                I agree to the telemedicine terms of service and privacy policy.
              </Label>
            </div>
          </CardContent>
        </Card>

        <Button className="w-full btn-gold py-6 text-lg" disabled={!allChecksPassed} onClick={onComplete}>
          <Video className="w-5 h-5 mr-2" />Continue to Waiting Room
        </Button>

        {!allChecksPassed && !isChecking && (
          <p className="text-center text-sm text-[var(--text-dim)] mt-4">
            Please fix any issues above and accept the terms to continue
          </p>
        )}
      </div>
    </div>
  );
}

// Waiting Room Component
function PatientWaitingRoom({ roomCode, patientName, doctorName, onJoinCall }: {
  roomCode: string;
  patientName: string;
  doctorName: string;
  onJoinCall: () => void;
}) {
  const [waitTime, setWaitTime] = useState(0);
  const [estimatedWait, setEstimatedWait] = useState(5);
  const [doctorReady, setDoctorReady] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setWaitTime(prev => prev + 1);
      // Simulate doctor becoming ready after 3 seconds
      if (prev === 2) setDoctorReady(true);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[var(--obsidian)] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--nexus-violet)] to-[var(--nexus-fuchsia)] flex items-center justify-center mx-auto mb-4 relative">
            <User className="w-10 h-10 text-white" />
            {doctorReady && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-[var(--obsidian)] flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Virtual Waiting Room</h1>
          <p className="text-[var(--text-mid)]">{doctorName} will be with you shortly</p>
        </div>

        <Card className="glass-card mb-6">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <p className="text-[var(--text-dim)] text-sm mb-1">Time in waiting room</p>
              <p className="text-4xl font-mono font-bold text-[var(--text-primary)]">{formatTime(waitTime)}</p>
              {estimatedWait && !doctorReady && (
                <p className="text-[var(--text-mid)] text-sm mt-2">Estimated wait: ~{estimatedWait} minutes</p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-[var(--glass)]">
                <div className="w-12 h-12 rounded-full bg-[var(--nexus-violet)]/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-[var(--nexus-violet)]" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[var(--text-primary)]">{doctorName}</p>
                  <p className="text-sm text-[var(--text-dim)]">{DEMO_ROOM.specialty}</p>
                </div>
                <Badge className={doctorReady ? 'bg-green-600' : 'bg-yellow-600'}>
                  {doctorReady ? 'Ready' : 'Preparing'}
                </Badge>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-lg bg-[var(--glass)]">
                <div className="w-12 h-12 rounded-lg bg-[var(--nexus-aqua)]/20 flex items-center justify-center">
                  <Video className="w-6 h-6 text-[var(--nexus-aqua)]" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[var(--text-primary)]">Room Code</p>
                  <p className="text-sm font-mono text-[var(--nexus-violet-lite)]">{roomCode}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button 
          className={`w-full py-6 text-lg ${doctorReady ? 'btn-gold' : 'bg-gray-600'}`}
          disabled={!doctorReady}
          onClick={onJoinCall}
        >
          <Video className="w-5 h-5 mr-2" />
          {doctorReady ? 'Join Consultation' : 'Waiting for Doctor...'}
        </Button>

        <div className="text-center mt-6">
          <p className="text-[var(--text-dim)] text-sm">
            Having issues? <a href="#" className="text-[var(--nexus-violet-lite)] hover:underline">Get help</a>
          </p>
        </div>
      </div>
    </div>
  );
}

// Video Call Component for Patient
function PatientVideoCall({ roomCode, doctorName, onEndCall }: {
  roomCode: string;
  doctorName: string;
  onEndCall: () => void;
}) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [duration, setDuration] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStats, setConnectionStats] = useState<ConnectionStats>({
    quality: 'excellent',
    latency: 0,
    packetLoss: 0,
    bandwidth: 0,
  });
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sharedDocs, setSharedDocs] = useState<SharedDocument[]>(DEMO_SHARED_DOCUMENTS);

  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: { echoCancellation: true, noiseSuppression: true },
        });
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        // Simulate connection
        setTimeout(() => {
          setIsConnected(true);
          setConnectionStats({ quality: 'excellent', latency: 45, packetLoss: 0.1, bandwidth: 2500 });
        }, 2000);
      } catch (err) {
        console.error('Error accessing media devices:', err);
      }
    };
    initMedia();
    const timer = setInterval(() => setDuration(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleVideo = () => setIsVideoOn(prev => !prev);
  const toggleAudio = () => setIsAudioOn(prev => !prev);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      senderId: 'patient',
      senderName: 'You',
      senderRole: 'patient',
      message: newMessage,
      type: 'text',
      timestamp: new Date(),
    }]);
    setNewMessage('');
  };

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen flex flex-col bg-[var(--obsidian)]">
      {/* Header */}
      <header className="h-14 bg-[var(--obsidian-2)] border-b border-[var(--glass-border)] flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--nexus-violet)] to-[var(--nexus-fuchsia)] flex items-center justify-center">
            <Video className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-[var(--text-primary)]">{doctorName}</h1>
            <p className="text-xs text-[var(--text-dim)]">Room: {roomCode}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-lg px-3 py-1.5">
            <Clock className="w-4 h-4 text-white" />
            <span className="text-white font-mono text-sm">{formatDuration(duration)}</span>
          </div>
          <Badge className={`${isConnected ? 'bg-green-600' : 'bg-yellow-600'}`}>
            {isConnected ? 'Connected' : 'Connecting...'}
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Area */}
        <div className={`flex-1 relative ${showChat ? 'w-2/3' : 'w-full'}`}>
          {/* Remote Video */}
          <div className="absolute inset-0">
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
            {!isConnected && (
              <div className="absolute inset-0 bg-[var(--obsidian-2)] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--nexus-violet)] to-[var(--nexus-fuchsia)] flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold text-white">{doctorName.charAt(0)}</span>
                  </div>
                  <p className="text-[var(--text-primary)] text-lg">{doctorName}</p>
                  <p className="text-[var(--text-dim)]">Connecting...</p>
                </div>
              </div>
            )}
          </div>

          {/* Local Video (PiP) */}
          <div className="absolute bottom-20 right-4 w-48 h-36 rounded-lg overflow-hidden border-2 border-[var(--glass-border)] shadow-lg">
            <video ref={localVideoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${isVideoOn ? '' : 'hidden'}`} />
            {!isVideoOn && (
              <div className="w-full h-full bg-[var(--obsidian)] flex items-center justify-center">
                <VideoOff className="w-8 h-8 text-[var(--text-dim)]" />
              </div>
            )}
            <Badge variant="secondary" className="absolute top-2 left-2 text-xs">You</Badge>
          </div>

          {/* Control Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <div className="flex items-center justify-center gap-3">
              <Button variant={isAudioOn ? 'secondary' : 'destructive'} size="lg" className="rounded-full w-12 h-12" onClick={toggleAudio}>
                {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </Button>
              <Button variant={isVideoOn ? 'secondary' : 'destructive'} size="lg" className="rounded-full w-12 h-12" onClick={toggleVideo}>
                {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </Button>
              <Button variant={showChat ? 'default' : 'secondary'} size="lg" className={`rounded-full w-12 h-12 ${showChat ? 'bg-[var(--nexus-violet)]' : ''}`} onClick={() => setShowChat(!showChat)}>
                <MessageSquare className="w-5 h-5" />
              </Button>
              <Button variant="destructive" size="lg" className="rounded-full w-14 h-14 bg-red-600 hover:bg-red-700" onClick={onEndCall}>
                <PhoneOff className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>

        {/* Chat/Docs Sidebar */}
        {showChat && (
          <div className="w-80 bg-[var(--obsidian-2)] border-l border-[var(--glass-border)] flex flex-col">
            <Tabs defaultValue="chat" className="flex-1 flex flex-col">
              <div className="px-4 pt-4">
                <TabsList className="bg-[var(--glass)] w-full">
                  <TabsTrigger value="chat" className="flex-1"><MessageSquare className="w-4 h-4 mr-2" />Chat</TabsTrigger>
                  <TabsTrigger value="docs" className="flex-1"><FileText className="w-4 h-4 mr-2" />Files</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="chat" className="flex-1 m-0 flex flex-col">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    {messages.length === 0 ? (
                      <div className="text-center text-[var(--text-dim)] py-8">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>Chat with your doctor</p>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.senderRole === 'patient' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`p-3 rounded-lg max-w-[85%] ${msg.senderRole === 'patient' ? 'bg-[var(--nexus-violet)] text-white' : 'bg-[var(--glass)] text-[var(--text-primary)]'}`}>
                            <p className="text-sm">{msg.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
                <div className="p-4 border-t border-[var(--glass-border)]">
                  <div className="flex gap-2">
                    <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1" onKeyPress={(e) => e.key === 'Enter' && sendMessage()} />
                    <Button onClick={sendMessage} size="icon"><Send className="w-4 h-4" /></Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="docs" className="flex-1 m-0 p-4 overflow-auto">
                <div className="space-y-3">
                  {sharedDocs.map((doc) => (
                    <div key={doc.id} className="p-3 rounded-lg bg-[var(--glass)] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-[var(--nexus-violet)]" />
                        <div>
                          <p className="text-sm font-medium">{doc.name}</p>
                          <p className="text-xs text-[var(--text-dim)]">{doc.uploadedAt.toLocaleTimeString()}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon"><Download className="w-4 h-4" /></Button>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}

// Post-Call Summary Component
function PostCallSummary({ summary, onClose }: { summary: PostCallSummary; onClose: () => void }) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} min ${secs} sec`;
  };

  return (
    <div className="min-h-screen bg-[var(--obsidian)] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Consultation Complete</h1>
          <p className="text-[var(--text-mid)]">Here's a summary of your visit</p>
        </div>

        <Card className="glass-card mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-[var(--glass)]">
                <p className="text-xs text-[var(--text-dim)]">Duration</p>
                <p className="text-xl font-bold text-[var(--text-primary)]">{formatDuration(summary.duration)}</p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--glass)]">
                <p className="text-xs text-[var(--text-dim)]">Follow-up</p>
                <p className="text-xl font-bold text-[var(--text-primary)]">{summary.followUpRequired ? summary.followUpDate || 'Required' : 'Not required'}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-[var(--text-primary)] mb-2">Diagnosis</h3>
              <p className="text-[var(--text-mid)]">{summary.diagnosis}</p>
            </div>

            {summary.medications.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">Prescribed Medications</h3>
                <div className="space-y-2">
                  {summary.medications.map((med, i) => (
                    <div key={i} className="p-3 rounded-lg bg-[var(--glass)]">
                      <p className="font-medium">{med.name}</p>
                      <p className="text-sm text-[var(--text-dim)]">{med.dosage} - {med.frequency}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {summary.notes && (
              <div className="mb-6">
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">Doctor's Notes</h3>
                <p className="text-[var(--text-mid)]">{summary.notes}</p>
              </div>
            )}

            {summary.sharedDocuments.length > 0 && (
              <div>
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">Shared Documents</h3>
                <div className="space-y-2">
                  {summary.sharedDocuments.map((doc) => (
                    <div key={doc.id} className="p-3 rounded-lg bg-[var(--glass)] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-[var(--nexus-violet)]" />
                        <span>{doc.name}</span>
                      </div>
                      <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Download</Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button variant="outline" className="flex-1" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />Print Summary
          </Button>
          <Button className="flex-1 btn-gold" onClick={onClose}>
            <CheckCircle2 className="w-4 h-4 mr-2" />Done
          </Button>
        </div>
      </div>
    </div>
  );
}

// Main Patient Telemedicine Page
export default function PatientTelemedicinePage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.appointmentId as string;

  const [stage, setStage] = useState<'checklist' | 'waiting' | 'call' | 'summary'>('checklist');
  const [callDuration, setCallDuration] = useState(0);

  const handleChecklistComplete = () => {
    setStage('waiting');
  };

  const handleJoinCall = () => {
    setStage('call');
  };

  const handleEndCall = () => {
    setCallDuration(300); // Simulated 5 min call
    setStage('summary');
  };

  const handleCloseSummary = () => {
    router.push('/');
  };

  // Demo summary
  const demoSummary: PostCallSummary = {
    duration: callDuration,
    diagnosis: 'Upper respiratory tract infection',
    medications: [
      { name: 'Amoxicillin', dosage: '500mg', frequency: '3 times daily for 7 days' },
      { name: 'Ibuprofen', dosage: '400mg', frequency: 'As needed for fever/pain' },
    ],
    followUpRequired: true,
    followUpDate: 'In 1 week',
    notes: 'Rest and stay hydrated. Return if symptoms worsen or do not improve within 3 days.',
    sharedDocuments: DEMO_SHARED_DOCUMENTS,
  };

  if (stage === 'checklist') {
    return <PreCallChecklist onComplete={handleChecklistComplete} />;
  }

  if (stage === 'waiting') {
    return (
      <PatientWaitingRoom
        roomCode={DEMO_ROOM.roomCode}
        patientName={DEMO_ROOM.patientName}
        doctorName={DEMO_ROOM.doctorName}
        onJoinCall={handleJoinCall}
      />
    );
  }

  if (stage === 'call') {
    return (
      <PatientVideoCall
        roomCode={DEMO_ROOM.roomCode}
        doctorName={DEMO_ROOM.doctorName}
        onEndCall={handleEndCall}
      />
    );
  }

  if (stage === 'summary') {
    return <PostCallSummary summary={demoSummary} onClose={handleCloseSummary} />;
  }

  return null;
}
