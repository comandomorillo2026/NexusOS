import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'nexusos-client-portal-secret-key-2024';

async function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, JWT_SECRET) as {
      accessId: string;
      caseId: string;
      clientId: string;
      tenantId: string;
      permissions: string;
      type: string;
    };
  } catch {
    return null;
  }
}

// GET - Get messages
export async function GET(request: NextRequest) {
  try {
    const tokenData = await verifyToken(request);

    if (!tokenData) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    // Get messages for the case
    const messages = await db.lawClientMessage.findMany({
      where: {
        caseId: tokenData.caseId,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Mark client messages as read when retrieved by client
    // (In a real implementation, you might want to do this differently)

    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve messages' },
      { status: 500 }
    );
  }
}

// POST - Send message
export async function POST(request: NextRequest) {
  try {
    const tokenData = await verifyToken(request);

    if (!tokenData) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    // Check permissions
    const permissions = tokenData.permissions.split(',');
    if (!permissions.includes('send_messages')) {
      return NextResponse.json(
        { success: false, error: 'Messaging permission denied' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const message = formData.get('message') as string;
    const subject = formData.get('subject') as string | null;
    const caseId = formData.get('caseId') as string;

    if (!message?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Message content is required' },
        { status: 400 }
      );
    }

    if (caseId !== tokenData.caseId) {
      return NextResponse.json(
        { success: false, error: 'Invalid case ID' },
        { status: 400 }
      );
    }

    // Get case and client info
    const caseData = await db.lawCase.findFirst({
      where: { id: caseId },
      select: {
        tenantId: true,
        LawClient: { select: { fullName: true } },
        leadAttorneyName: true,
      },
    });

    if (!caseData) {
      return NextResponse.json(
        { success: false, error: 'Case not found' },
        { status: 404 }
      );
    }

    // Handle file attachments
    const files = formData.getAll('files') as File[];
    const attachments: Array<{ name: string; url: string; size: number }> = [];

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) continue; // Skip files > 10MB
      
      // In a real implementation, upload to cloud storage
      const fileUrl = `/uploads/message-attachments/${Date.now()}-${file.name}`;
      attachments.push({
        name: file.name,
        url: fileUrl,
        size: file.size,
      });
    }

    // Create message
    const newMessage = await db.lawClientMessage.create({
      data: {
        tenantId: caseData.tenantId,
        caseId: caseId,
        clientId: tokenData.clientId,
        senderType: 'client',
        senderName: caseData.LawClient?.fullName || 'Client',
        subject: subject || undefined,
        message: message.trim(),
        attachments: attachments.length > 0 ? JSON.stringify(attachments) : null,
        isRead: false,
      },
    });

    // Create activity log
    await db.activityLog.create({
      data: {
        tenantId: caseData.tenantId,
        userId: tokenData.clientId,
        userEmail: '',
        userName: caseData.LawClient?.fullName || 'Client',
        action: 'SEND_MESSAGE',
        entityType: 'LawClientMessage',
        entityId: newMessage.id,
        description: `Client sent a message${subject ? `: ${subject}` : ''}`,
      },
    });

    // In a real implementation, send notification to attorney
    // (email, push notification, etc.)

    return NextResponse.json({
      success: true,
      message: newMessage,
    });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
