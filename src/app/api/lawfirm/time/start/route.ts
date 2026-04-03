import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Start a new time session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tenantId = 'demo-tenant',
      caseId,
      userId,
      userName,
      activityType = 'general',
      description,
      isBillable = true,
      roundingRule = 'none',
      hourlyRate,
    } = body;

    // Check if user already has a running session
    const existingSession = await db.lawTimeSession.findFirst({
      where: {
        tenantId,
        userId,
        status: { in: ['running', 'paused'] },
      },
    });

    if (existingSession) {
      return NextResponse.json(
        {
          success: false,
          error: 'User already has an active time session. Stop the current session first.',
          activeSession: existingSession,
        },
        { status: 400 }
      );
    }

    // Get hourly rate from case if not provided
    let rate = hourlyRate;
    if (!rate && caseId) {
      const caseData = await db.lawCase.findUnique({
        where: { id: caseId },
        select: { hourlyRate: true },
      });
      rate = caseData?.hourlyRate || 850;
    }
    if (!rate) rate = 850;

    const now = new Date();

    // Create new time session
    const session = await db.lawTimeSession.create({
      data: {
        tenantId,
        caseId,
        userId,
        userName,
        startTime: now.toISOString(),
        activityType,
        description,
        isBillable,
        roundingRule,
        hourlyRate: rate,
        status: 'running',
        lastActivityAt: now.toISOString(),
      },
    });

    // Log activity
    await db.lawActivityCapture.create({
      data: {
        tenantId,
        userId,
        caseId,
        activityType: 'timer_started',
        timestamp: now.toISOString(),
        metadata: JSON.stringify({ sessionId: session.id }),
      },
    });

    return NextResponse.json({
      success: true,
      data: session,
      message: 'Time session started successfully',
    });
  } catch (error: any) {
    console.error('Error starting time session:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to start time session' },
      { status: 500 }
    );
  }
}
