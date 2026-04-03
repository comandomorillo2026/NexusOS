import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List activity captures
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tenantId = searchParams.get('tenantId') || 'demo-tenant';
    const userId = searchParams.get('userId');
    const caseId = searchParams.get('caseId');
    const activityType = searchParams.get('activityType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {
      tenantId,
    };

    if (userId) where.userId = userId;
    if (caseId) where.caseId = caseId;
    if (activityType) where.activityType = activityType;
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    const activities = await db.lawActivityCapture.findMany({
      where,
      include: {
        LawCase: {
          select: {
            id: true,
            caseNumber: true,
            title: true,
            clientName: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    });

    // Transform activities for frontend
    const transformedActivities = activities.map((activity) => ({
      id: activity.id,
      type: activity.activityType,
      title: getActivityTitle(activity),
      description: activity.metadata ? JSON.parse(activity.metadata).description : null,
      caseId: activity.caseId,
      caseName: activity.LawCase?.title,
      timestamp: activity.timestamp,
      duration: activity.duration,
      isAutoCaptured: true,
      metadata: activity.metadata ? JSON.parse(activity.metadata) : null,
    }));

    return NextResponse.json({
      success: true,
      data: transformedActivities,
      count: transformedActivities.length,
    });
  } catch (error: any) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

// POST - Log a new activity capture
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tenantId = 'demo-tenant',
      userId,
      caseId,
      activityType,
      duration = 0,
      metadata,
      relatedEntityType,
      relatedEntityId,
    } = body;

    if (!activityType) {
      return NextResponse.json(
        { success: false, error: 'Activity type is required' },
        { status: 400 }
      );
    }

    const activity = await db.lawActivityCapture.create({
      data: {
        tenantId,
        userId,
        caseId,
        activityType,
        timestamp: new Date().toISOString(),
        duration,
        metadata: metadata ? JSON.stringify(metadata) : null,
        relatedEntityType,
        relatedEntityId,
      },
    });

    // If there's an active time session, update its lastActivityAt
    const activeSession = await db.lawTimeSession.findFirst({
      where: {
        tenantId,
        userId,
        status: 'running',
      },
    });

    if (activeSession) {
      await db.lawTimeSession.update({
        where: { id: activeSession.id },
        data: {
          lastActivityAt: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: activity,
      message: 'Activity captured successfully',
    });
  } catch (error: any) {
    console.error('Error capturing activity:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to capture activity' },
      { status: 500 }
    );
  }
}

// Helper function to generate activity title
function getActivityTitle(activity: any): string {
  const metadata = activity.metadata ? JSON.parse(activity.metadata) : {};
  
  switch (activity.activityType) {
    case 'document_opened':
      return metadata.documentName || 'Document Opened';
    case 'document_edited':
      return metadata.documentName || 'Document Edited';
    case 'document_closed':
      return metadata.documentName || 'Document Closed';
    case 'email_sent':
      return metadata.subject || 'Email Sent';
    case 'email_read':
      return metadata.subject || 'Email Read';
    case 'call_made':
      return metadata.contact || 'Outgoing Call';
    case 'call_received':
      return metadata.contact || 'Incoming Call';
    case 'meeting_joined':
      return metadata.meetingTitle || 'Meeting Started';
    case 'meeting_left':
      return metadata.meetingTitle || 'Meeting Ended';
    case 'research_started':
      return metadata.topic || 'Research Started';
    case 'research_stopped':
      return metadata.topic || 'Research Completed';
    case 'timer_started':
      return 'Timer Started';
    case 'timer_stopped':
      return 'Timer Stopped';
    case 'timer_paused':
      return 'Timer Paused (Inactivity)';
    default:
      return activity.activityType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
  }
}
