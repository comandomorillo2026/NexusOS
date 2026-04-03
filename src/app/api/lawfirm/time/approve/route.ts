import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Approve or reject a time entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tenantId,
      timeEntryId,
      status, // 'approved', 'rejected', 'needs_revision'
      notes,
      reviewedBy,
      reviewedByName,
    } = body;

    if (!tenantId || !timeEntryId || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify time entry exists
    const timeEntry = await db.lawTimeEntry.findFirst({
      where: {
        id: timeEntryId,
        tenantId,
      },
    });

    if (!timeEntry) {
      return NextResponse.json(
        { success: false, error: 'Time entry not found' },
        { status: 404 }
      );
    }

    // Check if approval record exists
    const existingApproval = await db.lawTimeEntryApproval.findUnique({
      where: { timeEntryId },
    });

    let approval;

    if (existingApproval) {
      // Update existing approval
      approval = await db.lawTimeEntryApproval.update({
        where: { timeEntryId },
        data: {
          status,
          reviewedBy,
          reviewedByName,
          reviewedAt: new Date().toISOString(),
          approvalNotes: status === 'approved' ? notes : undefined,
          rejectionReason: status === 'rejected' ? notes : undefined,
          revisionNotes: status === 'needs_revision' ? notes : undefined,
        },
      });
    } else {
      // Create new approval record
      approval = await db.lawTimeEntryApproval.create({
        data: {
          tenantId,
          timeEntryId,
          submittedBy: timeEntry.attorneyId || 'unknown',
          submittedAt: timeEntry.createdAt?.toISOString() || new Date().toISOString(),
          status,
          reviewedBy,
          reviewedByName,
          reviewedAt: new Date().toISOString(),
          approvalNotes: status === 'approved' ? notes : undefined,
          rejectionReason: status === 'rejected' ? notes : undefined,
          revisionNotes: status === 'needs_revision' ? notes : undefined,
        },
      });
    }

    // Log activity
    await db.activityLog.create({
      data: {
        tenantId,
        userId: reviewedBy,
        action: `time_entry_${status}`,
        entityType: 'time_entry',
        entityId: timeEntryId,
        description: `Time entry ${status}: ${notes || 'No notes'}`,
      },
    });

    return NextResponse.json({
      success: true,
      data: approval,
      message: `Time entry ${status} successfully`,
    });
  } catch (error: unknown) {
    console.error('Error processing approval:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process approval';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// GET - Get approval status for time entries
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tenantId = searchParams.get('tenantId');
    const status = searchParams.get('status');
    const timeEntryId = searchParams.get('timeEntryId');

    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: 'tenantId is required' },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { tenantId };
    if (status) where.status = status;
    if (timeEntryId) where.timeEntryId = timeEntryId;

    const approvals = await db.lawTimeEntryApproval.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: approvals,
      count: approvals.length,
    });
  } catch (error: unknown) {
    console.error('Error fetching approvals:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch approvals';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
