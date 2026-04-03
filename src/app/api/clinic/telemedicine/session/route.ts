import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';

// GET - Get session details
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const roomId = searchParams.get('roomId');
    const sessionId = searchParams.get('sessionId');

    if (sessionId) {
      const sessionData = await prisma.telemedSession.findUnique({
        where: { id: sessionId },
        include: {
          TelemedRoom: true,
        },
      });

      if (!sessionData) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      return NextResponse.json({ session: sessionData });
    }

    if (roomId) {
      const sessionData = await prisma.telemedSession.findUnique({
        where: { roomId },
        include: {
          TelemedRoom: true,
        },
      });

      if (!sessionData) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      return NextResponse.json({ session: sessionData });
    }

    return NextResponse.json({ error: 'Missing roomId or sessionId' }, { status: 400 });
  } catch (error) {
    console.error('Error getting session:', error);
    return NextResponse.json({ 
      error: 'Failed to get session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Create or update session
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      roomId, 
      tenantId,
      action,
      duration,
      notes,
      prescriptionId,
      recordingUrl,
      screenshots,
      sharedFiles,
      chatLog,
      qualityLog,
      connectionStats,
      technicalIssues,
      followUpRequired,
      followUpNotes,
    } = body;

    if (!roomId || !tenantId) {
      return NextResponse.json({ 
        error: 'Missing required fields: roomId, tenantId' 
      }, { status: 400 });
    }

    // Check if session exists
    const existingSession = await prisma.telemedSession.findUnique({
      where: { roomId },
    });

    if (action === 'start') {
      // Start a new session
      const newSession = await prisma.telemedSession.create({
        data: {
          tenantId,
          roomId,
          duration: 0,
          chatLog: JSON.stringify([]),
          qualityLog: JSON.stringify([]),
          screenshots: JSON.stringify([]),
          sharedFiles: JSON.stringify([]),
        },
      });

      // Update room status
      await prisma.telemedRoom.update({
        where: { id: roomId },
        data: {
          status: 'in_progress',
          startedAt: new Date().toISOString(),
        },
      });

      return NextResponse.json({ success: true, session: newSession });
    }

    if (action === 'end') {
      // End the session
      const sessionToEnd = existingSession || await prisma.telemedSession.findFirst({
        where: { roomId },
      });

      if (!sessionToEnd) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      const updatedSession = await prisma.telemedSession.update({
        where: { id: sessionToEnd.id },
        data: {
          duration: duration || sessionToEnd.duration,
          notes,
          prescriptionId,
          recordingUrl,
          screenshots: screenshots ? JSON.stringify(screenshots) : sessionToEnd.screenshots,
          sharedFiles: sharedFiles ? JSON.stringify(sharedFiles) : sessionToEnd.sharedFiles,
          chatLog: chatLog ? JSON.stringify(chatLog) : sessionToEnd.chatLog,
          qualityLog: qualityLog ? JSON.stringify(qualityLog) : sessionToEnd.qualityLog,
          connectionStats: connectionStats ? JSON.stringify(connectionStats) : sessionToEnd.connectionStats,
          technicalIssues: technicalIssues ? JSON.stringify(technicalIssues) : sessionToEnd.technicalIssues,
          followUpRequired: followUpRequired || false,
          followUpNotes,
          completedAt: new Date().toISOString(),
        },
      });

      // Update room status
      await prisma.telemedRoom.update({
        where: { id: roomId },
        data: {
          status: 'completed',
          endedAt: new Date().toISOString(),
        },
      });

      return NextResponse.json({ success: true, session: updatedSession });
    }

    if (action === 'update') {
      // Update session during call
      if (!existingSession) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      const updatedSession = await prisma.telemedSession.update({
        where: { id: existingSession.id },
        data: {
          duration,
          qualityLog: qualityLog ? JSON.stringify(qualityLog) : existingSession.qualityLog,
          connectionStats: connectionStats ? JSON.stringify(connectionStats) : existingSession.connectionStats,
        },
      });

      return NextResponse.json({ success: true, session: updatedSession });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error managing session:', error);
    return NextResponse.json({ 
      error: 'Failed to manage session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PATCH - Update session
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, ...updateData } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    const updatedSession = await prisma.telemedSession.update({
      where: { id: sessionId },
      data: updateData,
    });

    return NextResponse.json({ success: true, session: updatedSession });
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json({ 
      error: 'Failed to update session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
