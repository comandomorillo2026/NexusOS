import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      roomId, 
      notes, 
      diagnosis,
      treatment,
      followUpRequired,
      followUpNotes,
    } = body;

    if (!roomId) {
      return NextResponse.json({ error: 'Missing required field: roomId' }, { status: 400 });
    }

    // Find the room
    const room = await prisma.telemedRoom.findFirst({
      where: {
        OR: [
          { id: roomId },
          { roomCode: roomId }
        ]
      }
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Update room notes
    if (notes) {
      await prisma.telemedRoom.update({
        where: { id: room.id },
        data: { notes }
      });
    }

    // Update session with detailed notes
    const sessionUpdate: Record<string, unknown> = {};
    
    if (notes) sessionUpdate.notes = notes;
    if (followUpRequired !== undefined) sessionUpdate.followUpRequired = followUpRequired;
    if (followUpNotes) sessionUpdate.followUpNotes = followUpNotes;

    // If we have structured data, create a structured notes object
    if (diagnosis || treatment) {
      const structuredNotes = {
        diagnosis: diagnosis || '',
        treatment: treatment || '',
        followUp: {
          required: followUpRequired || false,
          notes: followUpNotes || ''
        },
        updatedAt: new Date().toISOString(),
        updatedBy: session.user.email
      };
      sessionUpdate.notes = JSON.stringify(structuredNotes);
    }

    if (Object.keys(sessionUpdate).length > 0) {
      await prisma.telemedSession.updateMany({
        where: { roomId: room.id },
        data: sessionUpdate
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Notes saved successfully'
    });
  } catch (error) {
    console.error('Error saving telemed notes:', error);
    return NextResponse.json({ 
      error: 'Failed to save consultation notes',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');

    if (!roomId) {
      return NextResponse.json({ error: 'Missing required parameter: roomId' }, { status: 400 });
    }

    // Find the session
    const telemedSession = await prisma.telemedSession.findFirst({
      where: {
        OR: [
          { roomId: roomId },
          { room: { roomCode: roomId } }
        ]
      },
      include: {
        TelemedRoom: true
      }
    });

    if (!telemedSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Parse structured notes if available
    let structuredNotes = null;
    if (telemedSession.notes) {
      try {
        structuredNotes = JSON.parse(telemedSession.notes);
      } catch {
        structuredNotes = { rawNotes: telemedSession.notes };
      }
    }

    return NextResponse.json({
      success: true,
      notes: {
        roomId: telemedSession.roomId,
        duration: telemedSession.duration,
        notes: telemedSession.notes,
        structuredNotes,
        followUpRequired: telemedSession.followUpRequired,
        followUpNotes: telemedSession.followUpNotes,
        room: {
          doctorName: telemedSession.TelemedRoom?.doctorName,
          patientName: telemedSession.TelemedRoom?.patientName,
          status: telemedSession.TelemedRoom?.status,
          startedAt: telemedSession.TelemedRoom?.startedAt,
          endedAt: telemedSession.TelemedRoom?.endedAt,
        }
      }
    });
  } catch (error) {
    console.error('Error fetching telemed notes:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch consultation notes',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
