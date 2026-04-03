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

// GET - Get invoices
export async function GET(request: NextRequest) {
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
    if (!permissions.includes('view_invoices')) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get invoices for the case
    const invoices = await db.lawInvoice.findMany({
      where: {
        caseId: tokenData.caseId,
        status: { not: 'cancelled' },
      },
      orderBy: { issueDate: 'desc' },
    });

    // Get payment history from trust transactions
    const payments = await db.lawTrustTransaction.findMany({
      where: {
        caseId: tokenData.caseId,
        type: 'deposit',
      },
      orderBy: { transactionDate: 'desc' },
    });

    return NextResponse.json({
      success: true,
      invoices,
      payments,
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve invoices' },
      { status: 500 }
    );
  }
}
