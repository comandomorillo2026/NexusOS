import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'nexusos-client-portal-secret-key-2024';

interface RouteParams {
  params: Promise<{
    caseId: string;
  }>;
}

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

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { caseId } = await params;
    const tokenData = await verifyToken(request);

    if (!tokenData || tokenData.caseId !== caseId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    // Get case information with all related data
    const caseData = await db.lawCase.findFirst({
      where: {
        id: caseId,
        isDeleted: false,
      },
      include: {
        LawClient: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            country: true,
          },
        },
        LawDocument: {
          where: { isDeleted: false },
          select: {
            id: true,
            name: true,
            category: true,
            fileSize: true,
            mimeType: true,
            documentDate: true,
            description: true,
            fileUrl: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        LawInvoice: {
          where: { status: { not: 'cancelled' } },
          select: {
            id: true,
            invoiceNumber: true,
            issueDate: true,
            dueDate: true,
            paidDate: true,
            items: true,
            subtotal: true,
            discount: true,
            tax: true,
            total: true,
            amountPaid: true,
            balanceDue: true,
            status: true,
            paymentMethod: true,
            createdAt: true,
          },
          orderBy: { issueDate: 'desc' },
        },
        LawCalendarEvent: {
          where: {
            date: { gte: new Date().toISOString().split('T')[0] },
            status: { not: 'cancelled' },
          },
          select: {
            id: true,
            title: true,
            eventType: true,
            date: true,
            startTime: true,
            endTime: true,
            location: true,
            courtroom: true,
            notes: true,
          },
          orderBy: { date: 'asc' },
          take: 10,
        },
        LawClientMessage: {
          select: {
            id: true,
            senderType: true,
            senderName: true,
            subject: true,
            message: true,
            attachments: true,
            isRead: true,
            readAt: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        LawTrustTransaction: {
          where: { type: 'deposit' },
          select: {
            id: true,
            transactionDate: true,
            amount: true,
            description: true,
          },
          orderBy: { transactionDate: 'desc' },
          take: 20,
        },
      },
    });

    if (!caseData) {
      return NextResponse.json(
        { success: false, error: 'Case not found' },
        { status: 404 }
      );
    }

    // Get firm settings for branding
    const firmSettings = await db.lawSettings.findFirst({
      where: { tenantId: caseData.tenantId },
      select: {
        firmName: true,
        primaryColor: true,
        secondaryColor: true,
        email: true,
        phone: true,
        address: true,
      },
    });

    // Parse permissions
    const permissions = tokenData.permissions.split(',');

    // Filter data based on permissions
    let documents = caseData.LawDocument;
    if (!permissions.includes('view_docs')) {
      documents = [];
    }

    let invoices = caseData.LawInvoice;
    if (!permissions.includes('view_invoices')) {
      invoices = [];
    }

    return NextResponse.json({
      success: true,
      case: {
        ...caseData,
        LawDocument: documents,
        LawInvoice: invoices,
      },
      firmSettings,
      permissions,
    });
  } catch (error) {
    console.error('Get client case error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load case information' },
      { status: 500 }
    );
  }
}
