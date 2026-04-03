import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomId } = await params;

    // Find room by ID or roomCode
    const room = await prisma.telemedRoom.findFirst({
      where: {
        OR: [
          { id: roomId },
          { roomCode: roomId }
        ]
      },
      include: {
        TelemedSession: true,
      }
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Get recent messages for the room
    const messages = await prisma.telemedMessage.findMany({
      where: { roomId: room.id },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      room: {
        id: room.id,
        roomCode: room.roomCode,
        appointmentId: room.appointmentId,
        doctorId: room.doctorId,
        doctorName: room.doctorName,
        patientId: room.patientId,
        patientName: room.patientName,
        status: room.status,
        recordingConsent: room.recordingConsent,
        patientConsent: room.patientConsent,
        startedAt: room.startedAt,
        endedAt: room.endedAt,
        scheduledStart: room.scheduledStart,
        scheduledEnd: room.scheduledEnd,
        connectionQuality: room.connectionQuality,
        fallbackToPhone: room.fallbackToPhone,
        phoneCallNumber: room.phoneCallNumber,
        notes: room.notes,
        createdAt: room.createdAt,
        session: room.TelemedSession ? {
          id: room.TelemedSession.id,
          duration: room.TelemedSession.duration,
          notes: room.TelemedSession.notes,
          prescriptionId: room.TelemedSession.prescriptionId,
          screenshots: room.TelemedSession.screenshots ? JSON.parse(room.TelemedSession.screenshots) : [],
          sharedFiles: room.TelemedSession.sharedFiles ? JSON.parse(room.TelemedSession.sharedFiles) : [],
          chatLog: room.TelemedSession.chatLog ? JSON.parse(room.TelemedSession.chatLog) : [],
        } : null,
      },
      messages: messages.map(m => ({
        id: m.id,
        senderId: m.senderId,
        senderName: m.senderName,
        senderRole: m.senderRole,
        message: m.message,
        messageType: m.messageType,
        fileUrl: m.fileUrl,
        fileName: m.fileName,
        fileSize: m.fileSize,
        isRead: m.isRead,
        createdAt: m.createdAt,
      }))
    });
  } catch (error) {
    console.error('Error fetching telemed room:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch room details',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomId } = await params;
    const body = await request.json();
    
    const { 
      status, 
      recordingConsent, 
      patientConsent,
      connectionQuality,
      startedAt,
      endedAt,
      fallbackToPhone,
      phoneCallNumber,
      notes,
      duration,
    } = body;

    // Find room by ID or roomCode
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

    // Update room
    const updatedRoom = await prisma.telemedRoom.update({
      where: { id: room.id },
      data: {
        ...(status !== undefined && { status }),
        ...(recordingConsent !== undefined && { recordingConsent }),
        ...(patientConsent !== undefined && { patientConsent }),
        ...(connectionQuality !== undefined && { connectionQuality }),
        ...(startedAt !== undefined && { startedAt }),
        ...(endedAt !== undefined && { endedAt }),
        ...(fallbackToPhone !== undefined && { fallbackToPhone }),
        ...(phoneCallNumber !== undefined && { phoneCallNumber }),
        ...(notes !== undefined && { notes }),
      }
    });

    // Update session duration if provided
    if (duration !== undefined) {
      await prisma.telemedSession.updateMany({
        where: { roomId: room.id },
        data: { duration }
      });
    }

    return NextResponse.json({
      success: true,
      room: {
        id: updatedRoom.id,
        roomCode: updatedRoom.roomCode,
        status: updatedRoom.status,
        connectionQuality: updatedRoom.connectionQuality,
        startedAt: updatedRoom.startedAt,
        endedAt: updatedRoom.endedAt,
      }
    });
  } catch (error) {
    console.error('Error updating telemed room:', error);
    return NextResponse.json({ 
      error: 'Failed to update room',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
