import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import crypto from 'crypto';

// Generate a secure access token for video session
function generateAccessToken(roomId: string, userId: string, role: string): string {
  const payload = JSON.stringify({
    roomId,
    userId,
    role,
    timestamp: Date.now(),
    nonce: crypto.randomBytes(16).toString('hex'),
  });
  
  return Buffer.from(payload).toString('base64url');
}

// GET - Get token info
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const roomCode = searchParams.get('roomCode');
    const tokenId = searchParams.get('tokenId');

    if (tokenId) {
      // Decode token to get info
      try {
        const payload = JSON.parse(Buffer.from(tokenId, 'base64url').toString());
        
        // Check if room exists
        const room = await prisma.telemedRoom.findFirst({
          where: { 
            OR: [
              { id: payload.roomId },
              { roomCode: tokenId.substring(0, 8) },
            ]
          },
        });

        return NextResponse.json({
          tokenInfo: {
            roomId: payload.roomId,
            userId: payload.userId,
            role: payload.role,
            timestamp: payload.timestamp,
            roomStatus: room?.status,
          },
        });
      } catch {
        return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
      }
    }

    if (roomCode) {
      const room = await prisma.telemedRoom.findUnique({
        where: { roomCode },
      });

      if (!room) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 });
      }

      return NextResponse.json({ room });
    }

    return NextResponse.json({ error: 'Missing roomCode or tokenId' }, { status: 400 });
  } catch (error) {
    console.error('Error getting token:', error);
    return NextResponse.json({ 
      error: 'Failed to get token',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Generate access token for session
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      roomCode, 
      userId, 
      userName,
      role, // 'doctor' or 'patient'
      tenantId,
    } = body;

    if (!roomCode || !userId || !role) {
      return NextResponse.json({ 
        error: 'Missing required fields: roomCode, userId, role' 
      }, { status: 400 });
    }

    // Find the room
    const room = await prisma.telemedRoom.findUnique({
      where: { roomCode },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Check room status
    if (room.status === 'completed' || room.status === 'cancelled') {
      return NextResponse.json({ 
        error: 'Room is no longer active',
        roomStatus: room.status,
      }, { status: 400 });
    }

    // Validate role access
    if (role === 'doctor' && room.doctorId !== userId) {
      return NextResponse.json({ error: 'Unauthorized doctor access' }, { status: 403 });
    }

    if (role === 'patient' && room.patientId !== userId) {
      return NextResponse.json({ error: 'Unauthorized patient access' }, { status: 403 });
    }

    // Generate token
    const accessToken = generateAccessToken(room.id, userId, role);

    // Generate WebRTC configuration
    const webrtcConfig = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
      ],
      iceTransportPolicy: 'all',
      bundlePolicy: 'balanced',
    };

    return NextResponse.json({
      success: true,
      token: accessToken,
      room: {
        id: room.id,
        roomCode: room.roomCode,
        status: room.status,
        doctorName: room.doctorName,
        patientName: room.patientName,
        scheduledStart: room.scheduledStart,
        recordingConsent: room.recordingConsent,
      },
      webrtcConfig,
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours
    });
  } catch (error) {
    console.error('Error generating token:', error);
    return NextResponse.json({ 
      error: 'Failed to generate token',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
