import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'nexusos-client-portal-secret-key-2024';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, accessCode } = body;

    if (!email || !accessCode) {
      return NextResponse.json(
        { success: false, error: 'Email and access code are required' },
        { status: 400 }
      );
    }

    // Find the portal access record with matching email and access code
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
            LawClient: {
              select: {
                id: true,
                email: true,
                fullName: true,
              },
            },
          },
        },
        LawClient: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    if (!portalAccess) {
      return NextResponse.json(
        { success: false, error: 'Invalid access code. Please check the code provided by your attorney.' },
        { status: 401 }
      );
    }

    // Verify email matches
    const clientEmail = portalAccess.LawClient?.email || portalAccess.LawCase?.LawClient?.email;
    if (!clientEmail || clientEmail.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'Email does not match our records for this access code.' },
        { status: 401 }
      );
    }

    // Check if access has expired
    if (portalAccess.expiresAt) {
      const expiryDate = new Date(portalAccess.expiresAt);
      if (expiryDate < new Date()) {
        return NextResponse.json(
          { success: false, error: 'Your access code has expired. Please contact your attorney for a new code.' },
          { status: 401 }
        );
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        accessId: portalAccess.id,
        caseId: portalAccess.caseId,
        clientId: portalAccess.clientId,
        tenantId: portalAccess.tenantId,
        permissions: portalAccess.permissions,
        type: 'client_portal',
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Update last access timestamp
    await db.lawClientPortalAccess.update({
      where: { id: portalAccess.id },
      data: {
        lastAccessAt: new Date().toISOString(),
        accessCount: { increment: 1 },
      },
    });

    return NextResponse.json({
      success: true,
      token,
      caseId: portalAccess.caseId,
      clientId: portalAccess.clientId,
      tenantId: portalAccess.tenantId,
      permissions: portalAccess.permissions,
    });
  } catch (error) {
    console.error('Client auth error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
