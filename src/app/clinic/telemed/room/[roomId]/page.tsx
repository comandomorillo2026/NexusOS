'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ConsultationRoom } from '@/components/clinic/telemed/ConsultationRoom';
import { WaitingRoom } from '@/components/clinic/telemed/WaitingRoom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Video,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Phone
} from 'lucide-react';

interface RoomData {
  id: string;
  roomCode: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  status: string;
  recordingConsent: boolean;
  patientConsent: boolean;
  connectionQuality: string;
  session?: {
    id: string;
    duration: number;
    notes: string;
  };
}

export default function TelemedRoomPage({ 
  params 
}: { 
  params: Promise<{ roomId: string }> 
}) {
  const { roomId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, tenantId } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [room, setRoom] = useState<RoomData | null>(null);
  const [userRole, setUserRole] = useState<'doctor' | 'patient'>('doctor');
  const [hasJoined, setHasJoined] = useState(false);

  // Get role from URL params
  const roleParam = searchParams.get('role');
  
  useEffect(() => {
    // Determine user role
    if (roleParam === 'patient') {
      setUserRole('patient');
    } else {
      setUserRole('doctor');
    }
    
    // Fetch room data
    fetchRoomData();
  }, [roomId, roleParam]);

  // Fetch room data
  const fetchRoomData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/clinic/telemed/room/${roomId}`);
      const data = await response.json();
      
      if (data.success) {
        setRoom(data.room);
        
        // Determine role based on user ID matching doctor or patient
        if (user?.id === data.room.doctorId) {
          setUserRole('doctor');
        } else if (user?.id === data.room.patientId) {
          setUserRole('patient');
        }
      } else {
        setError(data.error || 'Room not found');
      }
    } catch (err) {
      console.error('Error fetching room:', err);
      setError('Failed to load room data');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle join call
  const handleJoinCall = () => {
    setHasJoined(true);
  };

  // Handle end consultation
  const handleEndConsultation = async (notes: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
    diagnosis: string;
    followUpRequired: boolean;
    followUpNotes: string;
  }) => {
    try {
      // Save notes
      if (notes.subjective || notes.objective || notes.assessment || notes.plan) {
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

      // Update room status
      await fetch(`/api/clinic/telemed/room/${roomId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          endedAt: new Date().toISOString(),
        }),
      });

      // Navigate back to dashboard
      router.push('/clinic/telemed');
    } catch (err) {
      console.error('Error ending consultation:', err);
      router.push('/clinic/telemed');
    }
  };

  // Handle fallback to phone
  const handleFallbackToPhone = () => {
    router.push('/clinic/telemed');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--obsidian)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[var(--nexus-violet)] mx-auto mb-4" />
          <p className="text-[var(--text-mid)]">Loading consultation room...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !room) {
    return (
      <div className="min-h-screen bg-[var(--obsidian)] flex items-center justify-center p-4">
        <Card className="glass-card max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-[var(--error)] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Room Not Found</h2>
            <p className="text-[var(--text-mid)] mb-6">
              {error || 'The consultation room you are looking for does not exist or has expired.'}
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={() => router.push('/clinic/telemed')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <Button variant="outline" onClick={() => router.push('/clinic/telemed?join=true')}>
                Join Different Room
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Room is completed
  if (room.status === 'completed') {
    return (
      <div className="min-h-screen bg-[var(--obsidian)] flex items-center justify-center p-4">
        <Card className="glass-card max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Consultation Completed</h2>
            <p className="text-[var(--text-mid)] mb-6">
              This consultation has ended. Thank you for using our telemedicine service.
            </p>
            <Button onClick={() => router.push('/clinic/telemed')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Patient waiting room (before joining)
  if (userRole === 'patient' && !hasJoined) {
    return (
      <WaitingRoom
        roomCode={room.roomCode}
        patientName={room.patientName}
        doctorName={room.doctorName}
        onJoinCall={handleJoinCall}
        onFallbackToPhone={handleFallbackToPhone}
      />
    );
  }

  // Main consultation room
  return (
    <ConsultationRoom
      roomId={room.id}
      roomCode={room.roomCode}
      doctorId={room.doctorId}
      doctorName={room.doctorName}
      patientId={room.patientId}
      patientName={room.patientName}
      tenantId={tenantId || 'demo-tenant'}
      onEndConsultation={handleEndConsultation}
    />
  );
}
