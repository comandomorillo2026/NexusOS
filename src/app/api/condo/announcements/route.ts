import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch announcements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const announcementId = searchParams.get('announcementId');
    const residentId = searchParams.get('residentId');

    if (announcementId) {
      // Get single announcement
      const announcement = await db.condoAnnouncement.findFirst({
        where: { id: announcementId },
        include: {
          reads: residentId ? {
            where: { residentId }
          } : false
        }
      });

      return NextResponse.json({ announcement });
    }

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID required' }, { status: 400 });
    }

    // Build filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { propertyId };
    if (status) where.status = status;
    if (category) where.category = category;

    const announcements = await db.condoAnnouncement.findMany({
      where,
      include: {
        _count: {
          select: { reads: true }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { publishDate: 'desc' }
      ]
    });

    // Stats
    const stats = {
      total: announcements.length,
      published: announcements.filter(a => a.status === 'published').length,
      draft: announcements.filter(a => a.status === 'draft').length,
      urgent: announcements.filter(a => a.priority === 'urgent' || a.priority === 'high').length,
    };

    return NextResponse.json({ announcements, stats });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

// POST - Create new announcement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      propertyId,
      tenantId = 'default',
      title,
      content,
      category = 'general',
      priority = 'normal',
      publishDate,
      expireDate,
      targetAll = true,
      targetUnits,
      sendEmail = true,
      sendSMS = false,
      sendPush = true,
      showOnBulletin = true,
      attachments,
      authorId,
      authorName,
    } = body;

    const announcement = await db.condoAnnouncement.create({
      data: {
        propertyId,
        tenantId,
        title,
        content,
        category,
        priority,
        publishDate: publishDate || new Date().toISOString().split('T')[0],
        expireDate,
        targetAll,
        targetUnits,
        sendEmail,
        sendSMS,
        sendPush,
        showOnBulletin,
        attachments,
        authorId,
        authorName,
        status: 'published',
      }
    });

    // TODO: Send notifications based on channels
    // This would integrate with the notifications API

    return NextResponse.json({ announcement });
  } catch (error) {
    console.error('Error creating announcement:', error);
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
  }
}

// PUT - Update announcement
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    const announcement = await db.condoAnnouncement.update({
      where: { id },
      data
    });

    return NextResponse.json({ announcement });
  } catch (error) {
    console.error('Error updating announcement:', error);
    return NextResponse.json({ error: 'Failed to update announcement' }, { status: 500 });
  }
}

// DELETE - Archive announcement
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Announcement ID required' }, { status: 400 });
    }

    const announcement = await db.condoAnnouncement.update({
      where: { id },
      data: { status: 'archived' }
    });

    return NextResponse.json({ announcement });
  } catch (error) {
    console.error('Error archiving announcement:', error);
    return NextResponse.json({ error: 'Failed to archive announcement' }, { status: 500 });
  }
}
