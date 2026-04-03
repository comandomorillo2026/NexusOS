import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';

// GET - Get recording details
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const recordingId = searchParams.get('recordingId');
    const sessionId = searchParams.get('sessionId');
    const roomId = searchParams.get('roomId');

    if (recordingId) {
      const recording = await prisma.telemedicineRecording.findUnique({
        where: { id: recordingId },
      });

      if (!recording) {
        return NextResponse.json({ error: 'Recording not found' }, { status: 404 });
      }

      return NextResponse.json({ recording });
    }

    if (sessionId) {
      const recordings = await prisma.telemedicineRecording.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ recordings });
    }

    if (roomId) {
      const recordings = await prisma.telemedicineRecording.findMany({
        where: { roomId },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ recordings });
    }

    return NextResponse.json({ error: 'Missing recordingId, sessionId, or roomId' }, { status: 400 });
  } catch (error) {
    console.error('Error getting recording:', error);
    return NextResponse.json({ 
      error: 'Failed to get recording',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Create or start recording
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      sessionId, 
      roomId, 
      tenantId,
      recordingType,
      consentGiven,
      consentIpAddress,
    } = body;

    if (!sessionId || !roomId || !tenantId) {
      return NextResponse.json({ 
        error: 'Missing required fields: sessionId, roomId, tenantId' 
      }, { status: 400 });
    }

    // Check if recording consent was given
    const room = await prisma.telemedRoom.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (!room.recordingConsent && !consentGiven) {
      return NextResponse.json({ 
        error: 'Recording consent required',
        requiresConsent: true,
      }, { status: 400 });
    }

    // Create recording record
    const recording = await prisma.telemedicineRecording.create({
      data: {
        tenantId,
        sessionId,
        roomId,
        recordingType: recordingType || 'video',
        startTime: new Date().toISOString(),
        status: 'recording',
        consentGiven: consentGiven || room.recordingConsent || false,
        consentTimestamp: consentGiven ? new Date().toISOString() : null,
        consentIpAddress: consentIpAddress || null,
      },
    });

    // Update room recording consent if given now
    if (consentGiven && !room.recordingConsent) {
      await prisma.telemedRoom.update({
        where: { id: roomId },
        data: { recordingConsent: true },
      });
    }

    return NextResponse.json({ 
      success: true, 
      recording,
      message: 'Recording started. Ensure all parties have consented.',
    });
  } catch (error) {
    console.error('Error starting recording:', error);
    return NextResponse.json({ 
      error: 'Failed to start recording',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PATCH - Update recording (stop, process, etc.)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      recordingId, 
      action,
      duration,
      fileSize,
      fileUrl,
      storageProvider,
      thumbnailUrl,
      transcription,
      errorMessage,
    } = body;

    if (!recordingId || !action) {
      return NextResponse.json({ 
        error: 'Missing required fields: recordingId, action' 
      }, { status: 400 });
    }

    const existingRecording = await prisma.telemedicineRecording.findUnique({
      where: { id: recordingId },
    });

    if (!existingRecording) {
      return NextResponse.json({ error: 'Recording not found' }, { status: 404 });
    }

    if (action === 'stop') {
      const updatedRecording = await prisma.telemedicineRecording.update({
        where: { id: recordingId },
        data: {
          endTime: new Date().toISOString(),
          duration: duration || 0,
          status: 'processing',
        },
      });

      return NextResponse.json({ success: true, recording: updatedRecording });
    }

    if (action === 'complete') {
      const updatedRecording = await prisma.telemedicineRecording.update({
        where: { id: recordingId },
        data: {
          status: 'completed',
          fileSize,
          fileUrl,
          storageProvider,
          thumbnailUrl,
          transcription,
        },
      });

      return NextResponse.json({ success: true, recording: updatedRecording });
    }

    if (action === 'fail') {
      const updatedRecording = await prisma.telemedicineRecording.update({
        where: { id: recordingId },
        data: {
          status: 'failed',
          errorMessage,
        },
      });

      return NextResponse.json({ success: true, recording: updatedRecording });
    }

    if (action === 'delete') {
      const updatedRecording = await prisma.telemedicineRecording.update({
        where: { id: recordingId },
        data: {
          status: 'deleted',
          deletedAt: new Date().toISOString(),
        },
      });

      return NextResponse.json({ success: true, recording: updatedRecording });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating recording:', error);
    return NextResponse.json({ 
      error: 'Failed to update recording',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Delete recording
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const recordingId = searchParams.get('recordingId');

    if (!recordingId) {
      return NextResponse.json({ error: 'Missing recordingId' }, { status: 400 });
    }

    // Soft delete the recording
    const recording = await prisma.telemedicineRecording.update({
      where: { id: recordingId },
      data: {
        status: 'deleted',
        deletedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({ success: true, recording });
  } catch (error) {
    console.error('Error deleting recording:', error);
    return NextResponse.json({ 
      error: 'Failed to delete recording',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
