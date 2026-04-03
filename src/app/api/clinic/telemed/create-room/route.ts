import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';

// Generate a unique room code
function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      appointmentId, 
      doctorId, 
      doctorName, 
      patientId, 
      patientName,
      scheduledStart,
      scheduledEnd,
      tenantId 
    } = body;

    if (!doctorId || !doctorName || !patientId || !patientName || !tenantId) {
      return NextResponse.json({ 
        error: 'Missing required fields: doctorId, doctorName, patientId, patientName, tenantId' 
      }, { status: 400 });
    }

    // Generate unique room code
    let roomCode = generateRoomCode();
    let attempts = 0;
    
    // Ensure room code is unique
    while (attempts < 10) {
      const existingRoom = await prisma.telemedRoom.findUnique({
        where: { roomCode }
      });
      
      if (!existingRoom) break;
      
      roomCode = generateRoomCode();
      attempts++;
    }

    // Create the telemedicine room
    const room = await prisma.telemedRoom.create({
      data: {
        tenantId,
        roomCode,
        appointmentId: appointmentId || null,
        doctorId,
        doctorName,
        patientId,
        patientName,
        scheduledStart: scheduledStart || null,
        scheduledEnd: scheduledEnd || null,
        status: 'waiting',
        recordingConsent: false,
        patientConsent: false,
        connectionQuality: 'disconnected',
        fallbackToPhone: false,
      }
    });

    // Create initial session record
    await prisma.telemedSession.create({
      data: {
        tenantId,
        roomId: room.id,
        duration: 0,
        chatLog: JSON.stringify([]),
        qualityLog: JSON.stringify([]),
        screenshots: JSON.stringify([]),
        sharedFiles: JSON.stringify([]),
      }
    });

    return NextResponse.json({
      success: true,
      room: {
        id: room.id,
        roomCode: room.roomCode,
        status: room.status,
        doctorName: room.doctorName,
        patientName: room.patientName,
        scheduledStart: room.scheduledStart,
        scheduledEnd: room.scheduledEnd,
        createdAt: room.createdAt,
      }
    });
  } catch (error) {
    console.error('Error creating telemed room:', error);
    return NextResponse.json({ 
      error: 'Failed to create consultation room',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
