'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Clock,
  User,
  Video,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Phone,
  FileText,
  Shield,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';

interface WaitingRoomProps {
  roomCode: string;
  patientName: string;
  doctorName: string;
  scheduledTime?: string;
  onJoinCall: () => void;
  onFallbackToPhone?: () => void;
}

export function WaitingRoom({
  roomCode,
  patientName,
  doctorName,
  scheduledTime,
  onJoinCall,
  onFallbackToPhone,
}: WaitingRoomProps) {
  const [recordingConsent, setRecordingConsent] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isCheckingDevices, setIsCheckingDevices] = useState(true);
  const [deviceStatus, setDeviceStatus] = useState({
    camera: false,
    microphone: false,
    speakers: false,
  });
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'good' | 'poor'>('checking');
  const [waitTime, setWaitTime] = useState(0);
  const [estimatedWait, setEstimatedWait] = useState<number | null>(5); // minutes

  // Check device permissions
  useEffect(() => {
    const checkDevices = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        
        setDeviceStatus({
          camera: stream.getVideoTracks().length > 0,
          microphone: stream.getAudioTracks().length > 0,
          speakers: true, // Assume speakers work if we got this far
        });
        
        // Stop the test stream
        stream.getTracks().forEach(track => track.stop());
        
        // Check connection quality
        const connection = navigator.connection || (navigator as unknown as Record<string, unknown>).mozConnection;
        if (connection) {
          const type = (connection as { effectiveType?: string }).effectiveType;
          setConnectionStatus(type === '4g' ? 'good' : type === '3g' ? 'good' : 'poor');
        } else {
          setConnectionStatus('good');
        }
      } catch (error) {
        console.error('Device check failed:', error);
        setDeviceStatus({
          camera: false,
          microphone: false,
          speakers: false,
        });
      } finally {
        setIsCheckingDevices(false);
      }
    };

    checkDevices();
  }, []);

  // Wait timer
  useEffect(() => {
    const timer = setInterval(() => {
      setWaitTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format wait time
  const formatWaitTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Check if ready to join
  const canJoin = deviceStatus.camera && 
                  deviceStatus.microphone && 
                  termsAccepted && 
                  connectionStatus !== 'poor';

  return (
    <div className="min-h-screen bg-[var(--obsidian)] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--nexus-violet)] to-[var(--nexus-fuchsia)] flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Virtual Waiting Room</h1>
          <p className="text-[var(--text-mid)]">Your consultation will begin shortly</p>
        </div>

        {/* Room Info Card */}
        <Card className="glass-card mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-[var(--text-dim)]">Room Code</p>
                <p className="text-xl font-mono font-bold text-[var(--nexus-violet-lite)]">{roomCode}</p>
              </div>
              <Badge className="bg-yellow-600">
                <Clock className="w-3 h-3 mr-1" />
                Waiting
              </Badge>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--glass)]">
                <div className="w-10 h-10 rounded-full bg-[var(--nexus-aqua)]/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-[var(--nexus-aqua)]" />
                </div>
                <div>
                  <p className="text-xs text-[var(--text-dim)]">Patient</p>
                  <p className="text-[var(--text-primary)] font-medium">{patientName}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--glass)]">
                <div className="w-10 h-10 rounded-full bg-[var(--nexus-violet)]/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-[var(--nexus-violet)]" />
                </div>
                <div>
                  <p className="text-xs text-[var(--text-dim)]">Doctor</p>
                  <p className="text-[var(--text-primary)] font-medium">{doctorName}</p>
                </div>
              </div>

              {scheduledTime && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--glass)]">
                  <div className="w-10 h-10 rounded-full bg-[var(--nexus-gold)]/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-[var(--nexus-gold)]" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-dim)]">Scheduled Time</p>
                    <p className="text-[var(--text-primary)] font-medium">{scheduledTime}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Device Check Card */}
        <Card className="glass-card mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-[var(--text-primary)]">Device Check</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isCheckingDevices ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--nexus-violet)]" />
                <span className="ml-2 text-[var(--text-mid)]">Checking devices...</span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--glass)]">
                  <div className="flex items-center gap-3">
                    <Video className={`w-5 h-5 ${deviceStatus.camera ? 'text-green-500' : 'text-red-500'}`} />
                    <span className="text-[var(--text-primary)]">Camera</span>
                  </div>
                  {deviceStatus.camera ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--glass)]">
                  <div className="flex items-center gap-3">
                    <svg className={`w-5 h-5 ${deviceStatus.microphone ? 'text-green-500' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    <span className="text-[var(--text-primary)]">Microphone</span>
                  </div>
                  {deviceStatus.microphone ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--glass)]">
                  <div className="flex items-center gap-3">
                    {connectionStatus === 'good' ? (
                      <Wifi className="w-5 h-5 text-green-500" />
                    ) : connectionStatus === 'poor' ? (
                      <WifiOff className="w-5 h-5 text-red-500" />
                    ) : (
                      <RefreshCw className="w-5 h-5 text-yellow-500 animate-spin" />
                    )}
                    <span className="text-[var(--text-primary)]">Connection</span>
                  </div>
                  {connectionStatus === 'good' ? (
                    <Badge className="bg-green-600">Good</Badge>
                  ) : connectionStatus === 'poor' ? (
                    <Badge className="bg-red-600">Poor</Badge>
                  ) : (
                    <Badge className="bg-yellow-600">Checking</Badge>
                  )}
                </div>

                {(!deviceStatus.camera || !deviceStatus.microphone) && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                    <p className="text-sm text-red-400 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      Please allow access to your camera and microphone in your browser settings.
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Consent Card */}
        <Card className="glass-card mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-[var(--text-primary)]">Consent & Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="recording-consent"
                checked={recordingConsent}
                onCheckedChange={(checked) => setRecordingConsent(checked as boolean)}
              />
              <Label htmlFor="recording-consent" className="text-sm text-[var(--text-mid)] leading-relaxed cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-[var(--nexus-violet)]" />
                  <span className="font-medium text-[var(--text-primary)]">Recording Consent</span>
                </div>
                I consent to the recording of this consultation for medical record purposes.
              </Label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="terms-accepted"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
              />
              <Label htmlFor="terms-accepted" className="text-sm text-[var(--text-mid)] leading-relaxed cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-[var(--nexus-violet)]" />
                  <span className="font-medium text-[var(--text-primary)]">Terms of Service</span>
                </div>
                I agree to the telemedicine terms of service and privacy policy.
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Wait Time */}
        <div className="text-center mb-6">
          <p className="text-[var(--text-dim)] text-sm mb-1">Time in waiting room</p>
          <p className="text-3xl font-mono font-bold text-[var(--text-primary)]">{formatWaitTime(waitTime)}</p>
          {estimatedWait && (
            <p className="text-[var(--text-mid)] text-sm mt-1">
              Estimated wait: ~{estimatedWait} minutes
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            className="w-full btn-gold py-6 text-lg"
            disabled={!canJoin}
            onClick={onJoinCall}
          >
            <Video className="w-5 h-5 mr-2" />
            Join Consultation
          </Button>

          {!canJoin && !isCheckingDevices && (
            <p className="text-center text-sm text-[var(--text-dim)]">
              Please fix the issues above to join the consultation
            </p>
          )}

          {onFallbackToPhone && connectionStatus === 'poor' && (
            <Button
              variant="outline"
              className="w-full"
              onClick={onFallbackToPhone}
            >
              <Phone className="w-4 h-4 mr-2" />
              Switch to Phone Call
            </Button>
          )}
        </div>

        {/* Help Link */}
        <div className="text-center mt-6">
          <a href="#" className="text-sm text-[var(--nexus-violet-lite)] hover:underline">
            Having trouble? Get help
          </a>
        </div>
      </div>
    </div>
  );
}
