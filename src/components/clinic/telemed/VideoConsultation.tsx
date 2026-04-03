'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  ScreenShare,
  ScreenShareOff,
  WifiOff,
  PhoneCall,
  Maximize2,
  Minimize2,
  AlertCircle,
  Clock,
  Signal,
  RefreshCw
} from 'lucide-react';

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

// WebRTC Configuration - Using public STUN servers
const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export function VideoConsultation({
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
  const [isRemoteVideoOff, setIsRemoteVideoOff] = useState(false);

  // Format duration as HH:MM:SS
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get connection quality indicator color
  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-yellow-500';
      case 'poor': return 'text-orange-500';
      default: return 'text-red-500';
    }
  };

  // Cleanup function - defined first to avoid reference issues
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

  // End call
  const endCall = useCallback(() => {
    cleanup();
    onEndCall();
  }, [cleanup, onEndCall]);

  // Update connection stats
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
      if (latency > 300 || packetLoss > 5) {
        quality = 'poor';
      } else if (latency > 150 || packetLoss > 2) {
        quality = 'good';
      }

      setConnectionStats({ quality, latency, packetLoss, bandwidth });
      onConnectionChange?.(quality);
    } catch (err) {
      console.error('Error getting connection stats:', err);
    }
  }, [onConnectionChange]);

  // Initialize media devices
  const initializeMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      return stream;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError('Could not access camera or microphone. Please check permissions.');
      throw err;
    }
  }, []);

  // Create peer connection
  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(RTC_CONFIG);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('ICE candidate:', event.candidate);
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setIsConnected(true);
        setIsConnecting(false);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
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
        case 'connecting':
          setIsConnecting(true);
          break;
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'connected') {
        updateConnectionStats();
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [updateConnectionStats]);

  // Initialize connection
  useEffect(() => {
    const init = async () => {
      try {
        setIsConnecting(true);
        
        // Initialize local media
        const stream = await initializeMedia();
        
        // Create peer connection
        const pc = createPeerConnection();
        
        // Add local tracks to connection
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        // For demo purposes, simulate connection after 2 seconds
        setTimeout(() => {
          setIsConnected(true);
          setIsConnecting(false);
          setConnectionStats({
            quality: 'excellent',
            latency: 45,
            packetLoss: 0.1,
            bandwidth: 2500,
          });
          onConnectionChange?.('excellent');
        }, 2000);

      } catch (err) {
        console.error('Initialization error:', err);
        setError('Failed to initialize video call');
        setIsConnecting(false);
      }
    };

    init();

    // Start timer
    timerRef.current = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      cleanup();
    };
  }, [initializeMedia, createPeerConnection, onConnectionChange, cleanup]);

  // Toggle video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
      }
    }
  };

  // Toggle screen share
  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        
        if (peerConnectionRef.current) {
          const videoTrack = screenStream.getVideoTracks()[0];
          const sender = peerConnectionRef.current
            .getSenders()
            .find((s) => s.track?.kind === 'video');
          
          if (sender && videoTrack) {
            sender.replaceTrack(videoTrack);
          }
        }

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          // Revert to camera
          if (localStreamRef.current && localVideoRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
          }
        };

        setIsScreenSharing(true);
      } else {
        // Stop screen share and revert to camera
        if (localStreamRef.current && localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
          
          if (peerConnectionRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            const sender = peerConnectionRef.current
              .getSenders()
              .find((s) => s.track?.kind === 'video');
            
            if (sender && videoTrack) {
              sender.replaceTrack(videoTrack);
            }
          }
        }
        setIsScreenSharing(false);
      }
    } catch (err) {
      console.error('Error sharing screen:', err);
    }
  };

  // Take screenshot
  const takeScreenshot = () => {
    if (!remoteVideoRef.current || !remoteVideoRef.current.srcObject) return;

    const canvas = document.createElement('canvas');
    canvas.width = remoteVideoRef.current.videoWidth || 640;
    canvas.height = remoteVideoRef.current.videoHeight || 480;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(remoteVideoRef.current, 0, 0);
      const imageData = canvas.toDataURL('image/png');
      onTakeScreenshot?.(imageData);
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    const container = document.getElementById('video-container');
    if (!container) return;

    if (!isFullscreen) {
      container.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  // Fallback to phone call
  const fallbackToPhone = () => {
    endCall();
  };

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[var(--obsidian-2)] rounded-lg p-8">
        <AlertCircle className="w-16 h-16 text-[var(--error)] mb-4" />
        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Connection Error</h3>
        <p className="text-[var(--text-mid)] text-center mb-6">{error}</p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
          <Button className="btn-gold" onClick={fallbackToPhone}>
            <PhoneCall className="w-4 h-4 mr-2" />
            Switch to Phone Call
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div id="video-container" className="relative h-full bg-black rounded-lg overflow-hidden">
      {/* Main Video (Remote) */}
      <div className="absolute inset-0">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className={`w-full h-full object-cover ${isRemoteVideoOff ? 'hidden' : ''}`}
        />
        {/* Remote video off placeholder */}
        {(!isConnected || isRemoteVideoOff) && (
          <div className="absolute inset-0 bg-[var(--obsidian-2)] flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--nexus-violet)] to-[var(--nexus-fuchsia)] flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-white">
                  {partnerName.charAt(0).toUpperCase()}
                </span>
              </div>
              <p className="text-[var(--text-primary)] text-lg">{partnerName}</p>
              <p className="text-[var(--text-dim)] text-sm">
                {isConnecting ? 'Connecting...' : 'Camera off'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Local Video (Picture-in-Picture) */}
      <div className="absolute bottom-4 right-4 w-48 h-36 md:w-64 md:h-48 rounded-lg overflow-hidden border-2 border-[var(--glass-border)] shadow-lg">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${isVideoOn ? '' : 'hidden'}`}
        />
        {!isVideoOn && (
          <div className="w-full h-full bg-[var(--obsidian)] flex items-center justify-center">
            <VideoOff className="w-8 h-8 text-[var(--text-dim)]" />
          </div>
        )}
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="text-xs">
            You
          </Badge>
        </div>
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-lg px-3 py-1.5">
              <Clock className="w-4 h-4 text-white" />
              <span className="text-white font-mono text-sm">{formatDuration(duration)}</span>
            </div>
            
            <Badge 
              variant={isConnected ? "default" : "secondary"}
              className={`${isConnected ? 'bg-green-600' : 'bg-yellow-600'}`}
            >
              {isConnecting ? 'Connecting...' : isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            {/* Connection Quality */}
            <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm rounded-lg px-3 py-1.5">
              <Signal className={`w-4 h-4 ${getQualityColor(connectionStats.quality)}`} />
              <span className="text-white text-xs capitalize">{connectionStats.quality}</span>
            </div>

            {/* Room Code */}
            <div className="bg-black/30 backdrop-blur-sm rounded-lg px-3 py-1.5">
              <span className="text-white/70 text-xs">Room: </span>
              <span className="text-white font-mono text-sm">{roomCode}</span>
            </div>

            {/* Recording Consent Badge */}
            {recordingConsent && (
              <Badge className="bg-red-600 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-white mr-1.5 animate-pulse" />
                REC
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Connection Stats (on hover) */}
      <div className="absolute top-16 right-4 opacity-0 hover:opacity-100 transition-opacity">
        <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 text-xs text-white space-y-1">
          <div className="flex justify-between gap-4">
            <span className="text-white/70">Latency:</span>
            <span>{connectionStats.latency.toFixed(0)}ms</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-white/70">Packet Loss:</span>
            <span>{connectionStats.packetLoss.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-white/70">Bandwidth:</span>
            <span>{(connectionStats.bandwidth / 1000).toFixed(1)} Mbps</span>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
        <div className="flex items-center justify-center gap-2 md:gap-3">
          {/* Audio Toggle */}
          <Button
            variant={isAudioOn ? "secondary" : "destructive"}
            size="lg"
            className="rounded-full w-12 h-12 md:w-14 md:h-14"
            onClick={toggleAudio}
          >
            {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </Button>

          {/* Video Toggle */}
          <Button
            variant={isVideoOn ? "secondary" : "destructive"}
            size="lg"
            className="rounded-full w-12 h-12 md:w-14 md:h-14"
            onClick={toggleVideo}
          >
            {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </Button>

          {/* Screen Share */}
          <Button
            variant={isScreenSharing ? "default" : "secondary"}
            size="lg"
            className={`rounded-full w-12 h-12 md:w-14 md:h-14 ${isScreenSharing ? 'bg-[var(--nexus-violet)]' : ''}`}
            onClick={toggleScreenShare}
          >
            {isScreenSharing ? <ScreenShareOff className="w-5 h-5" /> : <ScreenShare className="w-5 h-5" />}
          </Button>

          {/* Screenshot */}
          <Button
            variant="secondary"
            size="lg"
            className="rounded-full w-12 h-12 md:w-14 md:h-14"
            onClick={takeScreenshot}
            title="Take Screenshot"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 15-5-5L5 21" />
            </svg>
          </Button>

          {/* Fullscreen */}
          <Button
            variant="secondary"
            size="lg"
            className="rounded-full w-12 h-12 md:w-14 md:h-14 hidden md:flex"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </Button>

          {/* End Call */}
          <Button
            variant="destructive"
            size="lg"
            className="rounded-full w-14 h-14 md:w-16 md:h-16 bg-red-600 hover:bg-red-700"
            onClick={endCall}
          >
            <PhoneOff className="w-6 h-6" />
          </Button>
        </div>

        {/* Fallback to Phone */}
        <div className="flex justify-center mt-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white"
            onClick={fallbackToPhone}
          >
            <PhoneCall className="w-4 h-4 mr-2" />
            Fallback to Phone Call
          </Button>
        </div>
      </div>
    </div>
  );
}
