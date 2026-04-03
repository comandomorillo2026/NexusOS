import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { caseId, clientId, message, subject, attachments, senderType = 'client', senderName } = body;

    // Validate required fields
    if (!caseId || !clientId || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get portal access to verify permissions
    const portalAccess = await db.lawClientPortalAccess.findFirst({
      where: {
        caseId,
        clientId,
        isActive: true,
      },
    });

    if (!portalAccess) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check messaging permission
    const permissions = portalAccess.permissions.split(',');
    if (!permissions.includes('message')) {
      return NextResponse.json(
        { success: false, error: 'Messaging not enabled for this client' },
        { status: 403 }
      );
    }

    // Create message
    const newMessage = await db.lawClientMessage.create({
      data: {
        tenantId: portalAccess.tenantId,
        portalAccessId: portalAccess.id,
        caseId,
        clientId,
        senderType,
        senderName: senderName || 'Client',
        subject,
        message,
        attachments: attachments ? JSON.stringify(attachments) : null,
        isRead: false,
      },
    });

    // Update last access
    await db.lawClientPortalAccess.update({
      where: { id: portalAccess.id },
      data: {
        lastAccessAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: {
        id: newMessage.id,
        createdAt: newMessage.createdAt,
      },
    });
  } catch (error) {
    console.error('Send portal message error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get('caseId');
    const clientId = searchParams.get('clientId');

    if (!caseId || !clientId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Verify access
    const portalAccess = await db.lawClientPortalAccess.findFirst({
      where: {
        caseId,
        clientId,
        isActive: true,
      },
    });

    if (!portalAccess) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get messages
    const messages = await db.lawClientMessage.findMany({
      where: {
        caseId,
        clientId,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Mark client messages as read if sent by attorney
    const attorneyMessages = messages.filter(m => m.senderType === 'attorney' && !m.isRead);
    if (attorneyMessages.length > 0) {
      await db.lawClientMessage.updateMany({
        where: {
          id: { in: attorneyMessages.map(m => m.id) },
        },
        data: {
          isRead: true,
          readAt: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      messages: messages.map(m => ({
        ...m,
        attachments: m.attachments ? JSON.parse(m.attachments) : null,
      })),
    });
  } catch (error) {
    console.error('Get portal messages error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load messages' },
      { status: 500 }
    );
  }
}
