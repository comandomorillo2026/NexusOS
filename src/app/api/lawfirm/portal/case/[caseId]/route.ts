import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface RouteParams {
  params: Promise<{
    caseId: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { caseId } = await params;
    const accessCode = request.headers.get('x-portal-access-code');

    // Verify access
    const portalAccess = await db.lawClientPortalAccess.findFirst({
      where: {
        caseId,
        accessCode: accessCode?.toUpperCase(),
        isActive: true,
      },
    });

    if (!portalAccess) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    // Check permissions
    const permissions = portalAccess.permissions.split(',');
    if (!permissions.includes('view_case')) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get case information
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
      },
    });

    if (!caseData) {
      return NextResponse.json(
        { success: false, error: 'Case not found' },
        { status: 404 }
      );
    }

    // Filter documents based on permissions
    let documents = caseData.LawDocument;
    if (!permissions.includes('view_docs')) {
      documents = [];
    }

    // Filter invoices based on permissions
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
      permissions,
    });
  } catch (error) {
    console.error('Get portal case error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load case information' },
      { status: 500 }
    );
  }
}
