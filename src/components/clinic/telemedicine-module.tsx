'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  ScreenShare,
  ScreenShareOff,
  PhoneCall,
  Maximize2,
  Clock,
  Signal,
  AlertCircle,
  CheckCircle2,
  User,
  MessageSquare,
  FileText,
  Pill,
  Send,
  Paperclip,
  Image as ImageIcon,
  Download,
  Heart,
  Activity,
  Thermometer,
  Shield,
  Calendar,
  Users,
  Settings,
  Zap,
  Monitor,
  Plus,
  Search,
  CircleDot,
  FileUp,
} from 'lucide-react';

// Types
interface VideoConsultationProps {
  roomId: string;
  roomCode: string;
  userId: string;
  userName: string;
  userRole: 'doctor' | 'patient';
  partnerName: string;
  onEndCall: () => void;
  onConnectionChange?: (quality: string) => void;
  onTakeScreenshot?: (imageData: string) => void;
  recordingConsent?: boolean;
}

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

interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  patientPhone?: string;
  doctorName: string;
  date: string;
  time: string;
  duration: number;
  type: 'in-person' | 'video' | 'phone' | 'hybrid';
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  reason: string;
  roomCode?: string;
}

// WebRTC Configuration
const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

// Demo Data
const DEMO_APPOINTMENTS: Appointment[] = [
  {
    id: '1',
    patientName: 'María González',
    patientId: 'PAT-001',
    patientPhone: '+1 868 555-0001',
    doctorName: 'Dr. Carlos Pérez',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    duration: 30,
    type: 'video',
    status: 'scheduled',
    reason: 'Follow-up consultation',
  },
  {
    id: '2',
    patientName: 'Carlos Rodríguez',
    patientId: 'PAT-002',
    patientPhone: '+1 868 555-0002',
    doctorName: 'Dr. Carlos Pérez',
    date: new Date().toISOString().split('T')[0],
    time: '09:30',
    duration: 30,
    type: 'video',
    status: 'confirmed',
    reason: 'Initial consultation',
    roomCode: 'TELE2024',
  },
  {
    id: '3',
    patientName: 'Ana Martínez',
    patientId: 'PAT-003',
    patientPhone: '+1 868 555-0003',
    doctorName: 'Dr. Carlos Pérez',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    duration: 45,
    type: 'hybrid',
    status: 'in-progress',
    reason: 'Chronic condition follow-up',
    roomCode: 'TELE2025',
  },
  {
    id: '4',
    patientName: 'José Pérez',
    patientId: 'PAT-004',
    patientPhone: '+1 868 555-0004',
    doctorName: 'Dr. Carlos Pérez',
    date: new Date().toISOString().split('T')[0],
    time: '11:00',
    duration: 30,
    type: 'phone',
    status: 'scheduled',
    reason: 'Medication refill',
  },
];

const DEMO_STATS = {
  todayAppointments: 8,
  inProgress: 2,
  completed: 15,
  waitingRoom: 3,
};

// Video Consultation Component
function VideoConsultation({
  roomCode,
  partnerName,
  onEndCall,
  onConnectionChange,
  onTakeScreenshot,
  recordingConsent = false,
}: VideoConsultationProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isCleaningUp = useRef(false);

  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionStats, setConnectionStats] = useState<ConnectionStats>({
    quality: 'disconnected',
    latency: 0,
    packetLoss: 0,
    bandwidth: 0,
  });
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-yellow-500';
      case 'poor': return 'text-orange-500';
      default: return 'text-red-500';
    }
  };

  const cleanup = useCallback(() => {
    if (isCleaningUp.current) return;
    isCleaningUp.current = true;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  }, []);

  const endCall = useCallback(() => {
    cleanup();
    onEndCall();
  }, [cleanup, onEndCall]);

  const updateConnectionStats = useCallback(async () => {
    if (!peerConnectionRef.current) return;
    try {
      const stats = await peerConnectionRef.current.getStats();
      let latency = 0;
      let packetLoss = 0;
      let bandwidth = 0;

      stats.forEach((report) => {
        if (report.type === 'candidate-pair' && report.state === 'succeeded') {
          latency = report.currentRoundTripTime ? report.currentRoundTripTime * 1000 : 0;
          bandwidth = report.availableOutgoingBitrate ? report.availableOutgoingBitrate / 1000 : 0;
        }
        if (report.type === 'inbound-rtp' && report.kind === 'video') {
          packetLoss = report.packetsLost || 0;
        }
      });

      let quality: ConnectionStats['quality'] = 'excellent';
      if (latency > 300 || packetLoss > 5) quality = 'poor';
      else if (latency > 150 || packetLoss > 2) quality = 'good';

      setConnectionStats({ quality, latency, packetLoss, bandwidth });
      onConnectionChange?.(quality);
    } catch (err) {
      console.error('Error getting connection stats:', err);
    }
  }, [onConnectionChange]);

  const initializeMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      return stream;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError('Could not access camera or microphone. Please check permissions.');
      throw err;
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        setIsConnecting(true);
        await initializeMedia();
        const pc = new RTCPeerConnection(RTC_CONFIG);
        
        pc.onconnectionstatechange = () => {
          switch (pc.connectionState) {
            case 'connected':
              setIsConnected(true);
              setIsConnecting(false);
              setConnectionStats(prev => ({ ...prev, quality: 'excellent' }));
              break;
            case 'disconnected':
            case 'failed':
              setIsConnected(false);
              setConnectionStats(prev => ({ ...prev, quality: 'disconnected' }));
              break;
          }
        };

        peerConnectionRef.current = pc;
        
        // Simulate connection for demo
        setTimeout(() => {
          setIsConnected(true);
          setIsConnecting(false);
          setConnectionStats({ quality: 'excellent', latency: 45, packetLoss: 0.1, bandwidth: 2500 });
          onConnectionChange?.('excellent');
        }, 2000);
      } catch (err) {
        console.error('Initialization error:', err);
        setError('Failed to initialize video call');
        setIsConnecting(false);
      }
    };

    init();
    timerRef.current = setInterval(() => setDuration((prev) => prev + 1), 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      cleanup();
    };
  }, [initializeMedia, onConnectionChange, cleanup]);

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;
        screenStream.getVideoTracks()[0].onended = () => setIsScreenSharing(false);
        setIsScreenSharing(true);
      } else {
        if (localStreamRef.current && localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }
        setIsScreenSharing(false);
      }
    } catch (err) {
      console.error('Error sharing screen:', err);
    }
  };

  const takeScreenshot = () => {
    if (!remoteVideoRef.current?.srcObject) return;
    const canvas = document.createElement('canvas');
    canvas.width = remoteVideoRef.current.videoWidth || 640;
    canvas.height = remoteVideoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(remoteVideoRef.current, 0, 0);
      onTakeScreenshot?.(canvas.toDataURL('image/png'));
    }
  };

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[var(--obsidian-2)] rounded-lg p-8">
        <AlertCircle className="w-16 h-16 text-[var(--error)] mb-4" />
        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Connection Error</h3>
        <p className="text-[var(--text-mid)] text-center mb-6">{error}</p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
          <Button className="btn-gold" onClick={endCall}><PhoneCall className="w-4 h-4 mr-2" />Switch to Phone</Button>
        </div>
      </div>
    );
  }

  return (
    <div id="video-container" className="relative h-full bg-black rounded-lg overflow-hidden">
      {/* Main Video */}
      <div className="absolute inset-0">
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
        {(!isConnected) && (
          <div className="absolute inset-0 bg-[var(--obsidian-2)] flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--nexus-violet)] to-[var(--nexus-fuchsia)] flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-white">{partnerName.charAt(0).toUpperCase()}</span>
              </div>
              <p className="text-[var(--text-primary)] text-lg">{partnerName}</p>
              <p className="text-[var(--text-dim)] text-sm">{isConnecting ? 'Connecting...' : 'Camera off'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Local Video (PiP) */}
      <div className="absolute bottom-4 right-4 w-48 h-36 md:w-64 md:h-48 rounded-lg overflow-hidden border-2 border-[var(--glass-border)] shadow-lg">
        <video ref={localVideoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${isVideoOn ? '' : 'hidden'}`} />
        {!isVideoOn && (
          <div className="w-full h-full bg-[var(--obsidian)] flex items-center justify-center">
            <VideoOff className="w-8 h-8 text-[var(--text-dim)]" />
          </div>
        )}
        <div className="absolute top-2 left-2"><Badge variant="secondary" className="text-xs">You</Badge></div>
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-lg px-3 py-1.5">
              <Clock className="w-4 h-4 text-white" />
              <span className="text-white font-mono text-sm">{formatDuration(duration)}</span>
            </div>
            <Badge className={`${isConnected ? 'bg-green-600' : 'bg-yellow-600'}`}>
              {isConnecting ? 'Connecting...' : isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm rounded-lg px-3 py-1.5">
              <Signal className={`w-4 h-4 ${getQualityColor(connectionStats.quality)}`} />
              <span className="text-white text-xs capitalize">{connectionStats.quality}</span>
            </div>
            <div className="bg-black/30 backdrop-blur-sm rounded-lg px-3 py-1.5">
              <span className="text-white/70 text-xs">Room: </span>
              <span className="text-white font-mono text-sm">{roomCode}</span>
            </div>
            {recordingConsent && (
              <Badge className="bg-red-600 animate-pulse">
                <CircleDot className="w-3 h-3 mr-1 animate-pulse" />REC
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
        <div className="flex items-center justify-center gap-2 md:gap-3">
          <Button variant={isAudioOn ? 'secondary' : 'destructive'} size="lg" className="rounded-full w-12 h-12" onClick={toggleAudio}>
            {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </Button>
          <Button variant={isVideoOn ? 'secondary' : 'destructive'} size="lg" className="rounded-full w-12 h-12" onClick={toggleVideo}>
            {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </Button>
          <Button variant={isScreenSharing ? 'default' : 'secondary'} size="lg" className={`rounded-full w-12 h-12 ${isScreenSharing ? 'bg-[var(--nexus-violet)]' : ''}`} onClick={toggleScreenShare}>
            {isScreenSharing ? <ScreenShareOff className="w-5 h-5" /> : <ScreenShare className="w-5 h-5" />}
          </Button>
          <Button variant="secondary" size="lg" className="rounded-full w-12 h-12" onClick={takeScreenshot} title="Take Screenshot">
            <ImageIcon className="w-5 h-5" />
          </Button>
          <Button variant="destructive" size="lg" className="rounded-full w-14 h-14 bg-red-600 hover:bg-red-700" onClick={endCall}>
            <PhoneOff className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Waiting Room Component
function WaitingRoom({ roomCode, patientName, doctorName, onJoinCall }: {
  roomCode: string;
  patientName: string;
  doctorName: string;
  onJoinCall: () => void;
}) {
  const [recordingConsent, setRecordingConsent] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isCheckingDevices, setIsCheckingDevices] = useState(true);
  const [deviceStatus, setDeviceStatus] = useState({ camera: false, microphone: false });
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'good' | 'poor'>('checking');
  const [waitTime, setWaitTime] = useState(0);

  useEffect(() => {
    const checkDevices = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setDeviceStatus({ camera: stream.getVideoTracks().length > 0, microphone: stream.getAudioTracks().length > 0 });
        stream.getTracks().forEach(track => track.stop());
        const connection = navigator.connection || (navigator as unknown as Record<string, unknown>).mozConnection;
        if (connection) {
          const type = (connection as { effectiveType?: string }).effectiveType;
          setConnectionStatus(type === '4g' ? 'good' : 'poor');
        } else setConnectionStatus('good');
      } catch {
        setDeviceStatus({ camera: false, microphone: false });
      } finally {
        setIsCheckingDevices(false);
      }
    };
    checkDevices();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setWaitTime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const canJoin = deviceStatus.camera && deviceStatus.microphone && termsAccepted && connectionStatus !== 'poor';

  return (
    <div className="min-h-screen bg-[var(--obsidian)] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--nexus-violet)] to-[var(--nexus-fuchsia)] flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Virtual Waiting Room</h1>
          <p className="text-[var(--text-mid)]">Your consultation will begin shortly</p>
        </div>

        <Card className="glass-card mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-[var(--text-dim)]">Room Code</p>
                <p className="text-xl font-mono font-bold text-[var(--nexus-violet-lite)]">{roomCode}</p>
              </div>
              <Badge className="bg-yellow-600"><Clock className="w-3 h-3 mr-1" />Waiting</Badge>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--glass)]">
                <User className="w-5 h-5 text-[var(--nexus-aqua)]" />
                <div><p className="text-xs text-[var(--text-dim)]">Patient</p><p className="text-[var(--text-primary)]">{patientName}</p></div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--glass)]">
                <User className="w-5 h-5 text-[var(--nexus-violet)]" />
                <div><p className="text-xs text-[var(--text-dim)]">Doctor</p><p className="text-[var(--text-primary)]">{doctorName}</p></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card mb-6">
          <CardHeader className="pb-3"><CardTitle className="text-lg">Device Check</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {isCheckingDevices ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin w-6 h-6 border-2 border-[var(--nexus-violet)] border-t-transparent rounded-full" />
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
                  <span className="font-medium">Recording Consent</span>
                </div>
                I consent to the recording of this consultation for medical record purposes.
              </Label>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox id="terms-accepted" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(checked as boolean)} />
              <Label htmlFor="terms-accepted" className="text-sm cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-[var(--nexus-violet)]" />
                  <span className="font-medium">Terms of Service</span>
                </div>
                I agree to the telemedicine terms of service and privacy policy.
              </Label>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mb-6">
          <p className="text-[var(--text-dim)] text-sm mb-1">Time in waiting room</p>
          <p className="text-3xl font-mono font-bold">{Math.floor(waitTime / 60)}:{(waitTime % 60).toString().padStart(2, '0')}</p>
        </div>

        <Button className="w-full btn-gold py-6 text-lg" disabled={!canJoin} onClick={onJoinCall}>
          <Video className="w-5 h-5 mr-2" />Join Consultation
        </Button>
      </div>
    </div>
  );
}

// Main Telemedicine Module Component
export function TelemedicineModule() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNewRoomDialog, setShowNewRoomDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [appointments, setAppointments] = useState<Appointment[]>(DEMO_APPOINTMENTS);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isInConsultation, setIsInConsultation] = useState(false);
  const [isInWaitingRoom, setIsInWaitingRoom] = useState(false);
  
  // New room form state
  const [newRoomData, setNewRoomData] = useState({
    patientName: '',
    patientId: '',
    patientPhone: '',
    appointmentType: 'video' as Appointment['type'],
    notes: '',
  });

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  // Notes state
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
    name: '', dosage: '', frequency: '', duration: '', instructions: ''
  }]);

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.patientId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled': return <Badge className="bg-blue-600">Scheduled</Badge>;
      case 'confirmed': return <Badge className="bg-green-600">Confirmed</Badge>;
      case 'in-progress': return <Badge className="bg-yellow-600 animate-pulse">In Progress</Badge>;
      case 'completed': return <Badge className="bg-gray-600">Completed</Badge>;
      case 'cancelled': return <Badge className="bg-red-600">Cancelled</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'phone': return <PhoneCall className="w-4 h-4" />;
      case 'hybrid': return <Monitor className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const handleStartConsultation = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsInWaitingRoom(true);
  };

  const handleJoinCall = () => {
    setIsInWaitingRoom(false);
    setIsInConsultation(true);
  };

  const handleEndCall = () => {
    setIsInConsultation(false);
    setSelectedAppointment(null);
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const message: Message = {
      id: Date.now().toString(),
      senderId: 'doctor-1',
      senderName: 'Dr. Carlos Pérez',
      senderRole: 'doctor',
      message: newMessage,
      type: 'text',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  // If in consultation, show the full consultation view
  if (isInConsultation && selectedAppointment) {
    return (
      <div className="h-screen flex flex-col bg-[var(--obsidian)]">
        <header className="h-14 bg-[var(--obsidian-2)] border-b border-[var(--glass-border)] flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--nexus-violet)] to-[var(--nexus-fuchsia)] flex items-center justify-center">
              <Video className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-[var(--text-primary)]">Consultation with {selectedAppointment.patientName}</h1>
              <p className="text-xs text-[var(--text-dim)]">Room: {selectedAppointment.roomCode || 'TELE0000'}</p>
            </div>
          </div>
          <Button variant="destructive" onClick={handleEndCall}>End Consultation</Button>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col">
            <Tabs defaultValue="video" className="flex-1 flex flex-col">
              <div className="px-4 pt-2">
                <TabsList className="bg-[var(--obsidian-2)]">
                  <TabsTrigger value="video" className="flex items-center gap-2"><Video className="w-4 h-4" />Video</TabsTrigger>
                  <TabsTrigger value="chat" className="flex items-center gap-2"><MessageSquare className="w-4 h-4" />Chat</TabsTrigger>
                  <TabsTrigger value="notes" className="flex items-center gap-2"><FileText className="w-4 h-4" />Notes</TabsTrigger>
                  <TabsTrigger value="prescription" className="flex items-center gap-2"><Pill className="w-4 h-4" />Prescription</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="video" className="flex-1 m-0 p-4">
                <VideoConsultation
                  roomId={selectedAppointment.id}
                  roomCode={selectedAppointment.roomCode || 'TELE0000'}
                  userId="doctor-1"
                  userName="Dr. Carlos Pérez"
                  userRole="doctor"
                  partnerName={selectedAppointment.patientName}
                  onEndCall={handleEndCall}
                  recordingConsent={true}
                />
              </TabsContent>

              <TabsContent value="chat" className="flex-1 m-0 p-4 flex flex-col">
                <ScrollArea className="flex-1 mb-4 p-4 bg-[var(--obsidian-2)] rounded-lg">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-[var(--text-dim)] py-8">No messages yet</div>
                    ) : (
                      messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.senderRole === 'doctor' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`p-3 rounded-lg max-w-[70%] ${msg.senderRole === 'doctor' ? 'bg-[var(--nexus-violet)] text-white' : 'bg-[var(--glass)] text-[var(--text-primary)]'}`}>
                            <p>{msg.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
                <div className="flex gap-2">
                  <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1" onKeyPress={(e) => e.key === 'Enter' && sendMessage()} />
                  <Button onClick={sendMessage}><Send className="w-4 h-4" /></Button>
                </div>
              </TabsContent>

              <TabsContent value="notes" className="flex-1 m-0 p-4 overflow-auto">
                <Card className="glass-card">
                  <CardHeader><CardTitle>Consultation Notes (SOAP)</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div><Label>Subjective</Label><Textarea value={notes.subjective} onChange={(e) => setNotes(prev => ({ ...prev, subjective: e.target.value }))} placeholder="Patient's reported symptoms..." rows={3} /></div>
                    <div><Label>Objective</Label><Textarea value={notes.objective} onChange={(e) => setNotes(prev => ({ ...prev, objective: e.target.value }))} placeholder="Physical examination findings..." rows={3} /></div>
                    <div><Label>Assessment</Label><Textarea value={notes.assessment} onChange={(e) => setNotes(prev => ({ ...prev, assessment: e.target.value }))} placeholder="Clinical assessment..." rows={3} /></div>
                    <div><Label>Plan</Label><Textarea value={notes.plan} onChange={(e) => setNotes(prev => ({ ...prev, plan: e.target.value }))} placeholder="Treatment plan..." rows={3} /></div>
                    <div><Label>Diagnosis</Label><Input value={notes.diagnosis} onChange={(e) => setNotes(prev => ({ ...prev, diagnosis: e.target.value }))} placeholder="Primary diagnosis" /></div>
                    <Button className="w-full btn-gold">Save Notes</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="prescription" className="flex-1 m-0 p-4 overflow-auto">
                <Card className="glass-card">
                  <CardHeader><CardTitle>E-Prescription</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {medications.map((med, index) => (
                      <div key={index} className="p-4 bg-[var(--glass)] rounded-lg space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div><Label className="text-xs">Medication</Label><Input value={med.name} onChange={(e) => setMedications(prev => prev.map((m, i) => i === index ? { ...m, name: e.target.value } : m))} placeholder="e.g., Amoxicillin" /></div>
                          <div><Label className="text-xs">Dosage</Label><Input value={med.dosage} onChange={(e) => setMedications(prev => prev.map((m, i) => i === index ? { ...m, dosage: e.target.value } : m))} placeholder="e.g., 500mg" /></div>
                          <div><Label className="text-xs">Frequency</Label><Input value={med.frequency} onChange={(e) => setMedications(prev => prev.map((m, i) => i === index ? { ...m, frequency: e.target.value } : m))} placeholder="e.g., 3 times daily" /></div>
                          <div><Label className="text-xs">Duration</Label><Input value={med.duration} onChange={(e) => setMedications(prev => prev.map((m, i) => i === index ? { ...m, duration: e.target.value } : m))} placeholder="e.g., 7 days" /></div>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" onClick={() => setMedications(prev => [...prev, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }])} className="w-full">+ Add Medication</Button>
                    <Button className="w-full btn-gold">Save Prescription</Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Patient Info Sidebar */}
          <div className="w-72 bg-[var(--obsidian-2)] border-l border-[var(--glass-border)] p-4 overflow-auto hidden lg:block">
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--nexus-violet)] to-[var(--nexus-fuchsia)] flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-white">{selectedAppointment.patientName.charAt(0)}</span>
              </div>
              <h3 className="font-semibold text-[var(--text-primary)]">{selectedAppointment.patientName}</h3>
              <p className="text-sm text-[var(--text-dim)]">ID: {selectedAppointment.patientId}</p>
            </div>
            <Separator className="my-4" />
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-[var(--text-mid)]">Reason for Visit</h4>
              <p className="text-sm text-[var(--text-primary)]">{selectedAppointment.reason}</p>
            </div>
            <Separator className="my-4" />
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-[var(--text-mid)]">Quick Actions</h4>
              <Button variant="outline" className="w-full justify-start" size="sm"><FileText className="w-4 h-4 mr-2" />View Medical History</Button>
              <Button variant="outline" className="w-full justify-start" size="sm"><Activity className="w-4 h-4 mr-2" />View Lab Results</Button>
              <Button variant="outline" className="w-full justify-start" size="sm"><Pill className="w-4 h-4 mr-2" />Current Medications</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If in waiting room, show waiting room
  if (isInWaitingRoom && selectedAppointment) {
    return (
      <WaitingRoom
        roomCode={selectedAppointment.roomCode || 'TELE0000'}
        patientName={selectedAppointment.patientName}
        doctorName={selectedAppointment.doctorName}
        onJoinCall={handleJoinCall}
      />
    );
  }

  // Main Dashboard View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Telemedicine</h1>
          <p className="text-[var(--text-mid)]">Manage virtual consultations and appointments</p>
        </div>

        <Dialog open={showNewRoomDialog} onOpenChange={setShowNewRoomDialog}>
          <DialogTrigger asChild>
            <Button className="btn-gold"><Video className="w-4 h-4 mr-2" />Start New Consultation</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Start New Consultation</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div><Label>Patient Name *</Label><Input value={newRoomData.patientName} onChange={(e) => setNewRoomData(prev => ({ ...prev, patientName: e.target.value }))} placeholder="Enter patient name" /></div>
              <div><Label>Patient ID *</Label><Input value={newRoomData.patientId} onChange={(e) => setNewRoomData(prev => ({ ...prev, patientId: e.target.value }))} placeholder="Enter patient ID" /></div>
              <div><Label>Patient Phone</Label><Input value={newRoomData.patientPhone} onChange={(e) => setNewRoomData(prev => ({ ...prev, patientPhone: e.target.value }))} placeholder="+1 868 XXX-XXXX" /></div>
              <div><Label>Appointment Type</Label>
                <Select value={newRoomData.appointmentType} onValueChange={(value) => setNewRoomData(prev => ({ ...prev, appointmentType: value as Appointment['type'] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video Consultation</SelectItem>
                    <SelectItem value="phone">Phone Consultation</SelectItem>
                    <SelectItem value="hybrid">Hybrid (Video + In-Person)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Notes</Label><Input value={newRoomData.notes} onChange={(e) => setNewRoomData(prev => ({ ...prev, notes: e.target.value }))} placeholder="Reason for consultation" /></div>
              <Button className="w-full btn-gold" disabled={!newRoomData.patientName || !newRoomData.patientId}>Create Room</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20"><Calendar className="w-5 h-5 text-blue-500" /></div>
              <div><p className="text-xs text-[var(--text-dim)]">Today</p><p className="text-xl font-bold">{DEMO_STATS.todayAppointments}</p></div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/20"><Activity className="w-5 h-5 text-yellow-500" /></div>
              <div><p className="text-xs text-[var(--text-dim)]">In Progress</p><p className="text-xl font-bold">{DEMO_STATS.inProgress}</p></div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20"><CheckCircle2 className="w-5 h-5 text-green-500" /></div>
              <div><p className="text-xs text-[var(--text-dim)]">Completed</p><p className="text-xl font-bold">{DEMO_STATS.completed}</p></div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20"><Users className="w-5 h-5 text-purple-500" /></div>
              <div><p className="text-xs text-[var(--text-dim)]">Waiting</p><p className="text-xl font-bold">{DEMO_STATS.waitingRoom}</p></div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[var(--nexus-violet)]/20"><Monitor className="w-5 h-5 text-[var(--nexus-violet)]" /></div>
              <div><p className="text-xs text-[var(--text-dim)]">Active Rooms</p><p className="text-xl font-bold">{appointments.filter(a => a.status === 'in-progress').length}</p></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[var(--obsidian-2)]">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Active Consultations */}
          <Card className="glass-card">
            <CardHeader><CardTitle className="flex items-center gap-2"><Video className="w-5 h-5 text-[var(--nexus-violet)]" />Active Consultations</CardTitle></CardHeader>
            <CardContent>
              {appointments.filter(a => a.status === 'in-progress').length === 0 ? (
                <div className="text-center py-8 text-[var(--text-dim)]">
                  <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No active consultations</p>
                  <Button className="mt-4 btn-gold" onClick={() => setShowNewRoomDialog(true)}>Start New Consultation</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.filter(a => a.status === 'in-progress').map((apt) => (
                    <div key={apt.id} className="p-4 rounded-lg bg-[var(--glass)] flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-[var(--nexus-violet)]/20 flex items-center justify-center">
                          <Video className="w-6 h-6 text-[var(--nexus-violet)]" />
                        </div>
                        <div>
                          <p className="font-medium">{apt.patientName}</p>
                          <p className="text-sm text-[var(--text-dim)]">Room: {apt.roomCode}</p>
                        </div>
                      </div>
                      <Button className="bg-yellow-600 hover:bg-yellow-700" onClick={() => handleStartConsultation(apt)}>Join Room</Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card className="glass-card">
            <CardHeader><CardTitle>Upcoming Appointments</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {appointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed').slice(0, 5).map((apt) => (
                  <div key={apt.id} className="p-3 rounded-lg bg-[var(--glass)] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${apt.type === 'video' ? 'bg-[var(--nexus-violet)]/20' : apt.type === 'phone' ? 'bg-[var(--nexus-aqua)]/20' : 'bg-[var(--nexus-gold)]/20'}`}>
                        {getTypeIcon(apt.type)}
                      </div>
                      <div>
                        <p className="font-medium">{apt.patientName}</p>
                        <p className="text-xs text-[var(--text-dim)]">{apt.time} • {apt.reason}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(apt.status)}
                      <Button size="sm" className="btn-gold" onClick={() => handleStartConsultation(apt)}><Video className="w-3 h-3 mr-1" />Start</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
                  <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search patients..." className="pl-10" />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48"><SelectValue placeholder="Filter by status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredAppointments.map((apt) => (
                  <div key={apt.id} className="p-4 rounded-lg bg-[var(--glass)] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${apt.type === 'video' ? 'bg-[var(--nexus-violet)]/20' : apt.type === 'phone' ? 'bg-[var(--nexus-aqua)]/20' : 'bg-[var(--nexus-gold)]/20'}`}>
                        {getTypeIcon(apt.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{apt.patientName}</p>
                          {getStatusBadge(apt.status)}
                        </div>
                        <p className="text-sm text-[var(--text-mid)]">{apt.reason}</p>
                        <p className="text-xs text-[var(--text-dim)]">{apt.time} ({apt.duration} min)</p>
                      </div>
                    </div>
                    {(apt.status === 'scheduled' || apt.status === 'confirmed') && (
                      <Button className="btn-gold" onClick={() => handleStartConsultation(apt)}><Video className="w-4 h-4 mr-2" />Start</Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="glass-card">
            <CardHeader><CardTitle>Consultation History</CardTitle></CardHeader>
            <CardContent>
              <div className="text-center py-12 text-[var(--text-dim)]">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>View past consultations and their notes</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default TelemedicineModule;
