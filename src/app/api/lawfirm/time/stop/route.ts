import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Helper function to apply rounding
function applyRounding(minutes: number, rule: string): number {
  switch (rule) {
    case '6min':
      return Math.ceil(minutes / 6) * 6;
    case '15min':
      return Math.ceil(minutes / 15) * 15;
    default:
      return minutes;
  }
}

// POST - Stop a time session and create time entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tenantId = 'demo-tenant',
      userId,
      sessionId,
      caseId,
      startTime,
      endTime,
      durationSeconds,
      activityType,
      description,
      isBillable = true,
      roundingRule = 'none',
      hourlyRate = 850,
      pausedDuration = 0,
    } = body;

    let session;

    // If sessionId is provided, find and update the session
    if (sessionId) {
      session = await db.lawTimeSession.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        return NextResponse.json(
          { success: false, error: 'Session not found' },
          { status: 404 }
        );
      }
    } else {
      // Find active session for user
      session = await db.lawTimeSession.findFirst({
        where: {
          tenantId,
          userId,
          status: { in: ['running', 'paused'] },
        },
      });
    }

    const now = new Date();
    const endTimeValue = endTime || now.toISOString();
    const startTimeValue = startTime || session?.startTime || now.toISOString();

    // Calculate duration
    let duration = durationSeconds;
    if (!duration && startTimeValue) {
      const start = new Date(startTimeValue).getTime();
      const end = new Date(endTimeValue).getTime();
      duration = Math.floor((end - start) / 1000) - (pausedDuration || 0);
    }

    const durationMinutes = Math.ceil((duration || 0) / 60);
    const roundedMinutes = applyRounding(durationMinutes, roundingRule);

    // Calculate amount
    const amount = isBillable ? (roundedMinutes / 60) * hourlyRate : 0;

    // Update session if exists
    if (session) {
      session = await db.lawTimeSession.update({
        where: { id: session.id },
        data: {
          endTime: endTimeValue,
          durationSeconds: duration,
          pausedDuration,
          activityType: activityType || session.activityType,
          description: description || session.description,
          isBillable,
          roundingRule,
          hourlyRate,
          roundedDuration: roundedMinutes * 60,
          calculatedAmount: amount,
          status: 'saved',
        },
      });
    }

    // Create time entry
    const timeEntry = await db.lawTimeEntry.create({
      data: {
        tenantId,
        caseId: caseId || session?.caseId || '',
        attorneyId: userId || 'demo-attorney',
        date: new Date(startTimeValue).toISOString().split('T')[0],
        startTime: new Date(startTimeValue).toTimeString().slice(0, 5),
        endTime: new Date(endTimeValue).toTimeString().slice(0, 5),
        durationMinutes: roundedMinutes,
        description: description || session?.description || '',
        activityCode: activityType || session?.activityType || 'general',
        rate: hourlyRate,
        amount,
        billable: isBillable,
        billed: false,
        timerRunning: false,
        timerStartedAt: startTimeValue,
      },
    });

    // Log activity
    await db.lawActivityCapture.create({
      data: {
        tenantId,
        userId: userId || 'demo-user',
        caseId: caseId || session?.caseId,
        activityType: 'timer_stopped',
        timestamp: now.toISOString(),
        duration: duration || 0,
        metadata: JSON.stringify({
          sessionId: session?.id,
          timeEntryId: timeEntry.id,
          roundedMinutes,
          amount,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        session,
        timeEntry,
        summary: {
          durationSeconds: duration,
          durationMinutes,
          roundedMinutes,
          amount,
        },
      },
      message: 'Time session stopped and entry created',
    });
  } catch (error: any) {
    console.error('Error stopping time session:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to stop time session' },
      { status: 500 }
    );
  }
}
