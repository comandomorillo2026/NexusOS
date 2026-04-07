import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch notifications for a resident/property
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const residentId = searchParams.get('residentId');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID required' }, { status: 400 });
    }

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { propertyId };
    if (residentId) where.residentId = residentId;
    if (unreadOnly) where.read = false;

    // In a real implementation, you would have a CondoNotification model
    // For now, we'll return mock notifications based on actual data
    
    const notifications = [];

    // Check for overdue invoices
    const overdueInvoices = await db.condoInvoice.findMany({
      where: {
        propertyId,
        status: 'overdue',
      },
      include: {
        unit: {
          include: {
            residents: { where: { isActive: true, isPrimary: true } }
          }
        }
      }
    });

    for (const invoice of overdueInvoices) {
      const primaryResident = invoice.unit?.residents[0];
      if (!residentId || primaryResident?.id === residentId) {
        notifications.push({
          id: `overdue-${invoice.id}`,
          type: 'payment_overdue',
          title: 'Factura Vencida',
          message: `La factura ${invoice.invoiceNumber} de ${invoice.unit?.unitNumber} está vencida. Monto: $${invoice.balanceDue}`,
          propertyId,
          unitId: invoice.unitId,
          residentId: primaryResident?.id,
          data: { invoiceId: invoice.id, amount: invoice.balanceDue },
          read: false,
          createdAt: new Date(invoice.dueDate),
        });
      }
    }

    // Check for pending invoices due soon (within 3 days)
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const upcomingInvoices = await db.condoInvoice.findMany({
      where: {
        propertyId,
        status: 'pending',
        dueDate: { lte: threeDaysFromNow.toISOString().split('T')[0] }
      },
      include: {
        unit: {
          include: {
            residents: { where: { isActive: true, isPrimary: true } }
          }
        }
      }
    });

    for (const invoice of upcomingInvoices) {
      const primaryResident = invoice.unit?.residents[0];
      if (!residentId || primaryResident?.id === residentId) {
        notifications.push({
          id: `reminder-${invoice.id}`,
          type: 'payment_reminder',
          title: 'Recordatorio de Pago',
          message: `La factura ${invoice.invoiceNumber} vence el ${invoice.dueDate}. Monto: $${invoice.total}`,
          propertyId,
          unitId: invoice.unitId,
          residentId: primaryResident?.id,
          data: { invoiceId: invoice.id, dueDate: invoice.dueDate },
          read: false,
          createdAt: new Date(),
        });
      }
    }

    // Check for open maintenance requests
    const openMaintenance = await db.condoMaintenanceRequest.findMany({
      where: {
        propertyId,
        status: { in: ['open', 'assigned', 'in_progress'] }
      },
      include: {
        resident: true,
        unit: { select: { unitNumber: true } }
      },
      take: 10
    });

    for (const req of openMaintenance) {
      if (!residentId || req.residentId === residentId) {
        notifications.push({
          id: `maintenance-${req.id}`,
          type: 'maintenance_update',
          title: 'Solicitud de Mantenimiento',
          message: `Solicitud #${req.requestNumber}: ${req.title} - Estado: ${req.status}`,
          propertyId,
          unitId: req.unitId,
          residentId: req.residentId,
          data: { requestId: req.id, status: req.status },
          read: false,
          createdAt: req.createdAt,
        });
      }
    }

    // Check for active votes
    const activeVotes = await db.condoVote.findMany({
      where: {
        propertyId,
        status: 'active',
        endDate: { gte: new Date().toISOString().split('T')[0] }
      }
    });

    for (const vote of activeVotes) {
      notifications.push({
        id: `vote-${vote.id}`,
        type: 'vote_invitation',
        title: 'Votación Activa',
        message: vote.title,
        propertyId,
        data: { voteId: vote.id, endDate: vote.endDate },
        read: false,
        createdAt: vote.createdAt,
      });
    }

    // Sort by date
    notifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      notifications: notifications.slice(0, limit),
      unreadCount: notifications.filter(n => !n.read).length,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// POST - Create/send notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      title,
      message,
      propertyId,
      unitId,
      residentId,
      data,
      sendEmail,
      sendPush,
    } = body;

    // Create notification record
    const notification = {
      id: `notif-${Date.now()}`,
      type,
      title,
      message,
      propertyId,
      unitId,
      residentId,
      data,
      read: false,
      createdAt: new Date(),
    };

    // If email is requested, queue for sending
    if (sendEmail && residentId) {
      const resident = await db.condoResident.findUnique({
        where: { id: residentId },
        include: {
          unit: {
            include: { property: true }
          }
        }
      });

      if (resident?.email) {
        // Queue email for sending
        // In production, this would use Resend or similar service
        console.log('Email would be sent to:', resident.email, {
          subject: title,
          body: message,
        });
      }
    }

    // If push notification is requested
    if (sendPush) {
      // In production, this would send via Firebase Cloud Messaging
      // or similar push notification service
      console.log('Push notification would be sent:', notification);
    }

    return NextResponse.json({ notification });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

// PUT - Mark notification as read
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationIds } = body;

    // In production, update database
    // For now, just return success
    return NextResponse.json({ 
      success: true, 
      markedAsRead: notificationIds?.length || 0 
    });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}
