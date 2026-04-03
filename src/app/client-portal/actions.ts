'use server';

import { db } from '@/lib/db';
import { authOptions } from '@/lib/auth/config';
import { getServerSession } from 'next-auth';

interface PortalSessionResult {
  success: boolean;
  caseId?: string;
  clientId?: string;
  tenantId?: string;
  permissions?: string;
  error?: string;
}

export async function createPortalSession(accessCode: string): Promise<PortalSessionResult> {
  try {
    // Find the portal access record
    const portalAccess = await db.lawClientPortalAccess.findFirst({
      where: {
        accessCode: accessCode.toUpperCase(),
        isActive: true,
      },
      include: {
        LawCase: {
          select: {
            id: true,
            tenantId: true,
            status: true,
          },
        },
        LawClient: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    if (!portalAccess) {
      return {
        success: false,
        error: 'Invalid access code. Please check the code provided by your attorney.',
      };
    }

    // Check if access has expired
    if (portalAccess.expiresAt) {
      const expiryDate = new Date(portalAccess.expiresAt);
      if (expiryDate < new Date()) {
        return {
          success: false,
          error: 'Your access code has expired. Please contact your attorney for a new code.',
        };
      }
    }

    // Update last access timestamp
    await db.lawClientPortalAccess.update({
      where: { id: portalAccess.id },
      data: {
        lastAccessAt: new Date().toISOString(),
        accessCount: { increment: 1 },
      },
    });

    return {
      success: true,
      caseId: portalAccess.caseId,
      clientId: portalAccess.clientId,
      tenantId: portalAccess.tenantId,
      permissions: portalAccess.permissions,
    };
  } catch (error) {
    console.error('Portal session error:', error);
    return {
      success: false,
      error: 'An error occurred. Please try again later.',
    };
  }
}

export async function getPortalCaseInfo(caseId: string) {
  try {
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
      },
    });

    if (!caseData) {
      return { success: false, error: 'Case not found' };
    }

    return { success: true, caseData };
  } catch (error) {
    console.error('Get portal case error:', error);
    return { success: false, error: 'Failed to load case information' };
  }
}
