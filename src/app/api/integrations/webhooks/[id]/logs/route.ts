/**
 * Webhook Logs API Route
 * Get delivery logs for a webhook endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/integrations/webhooks/[id]/logs - Get webhook delivery logs
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const status = searchParams.get('status');
    const eventType = searchParams.get('eventType');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Check webhook exists and belongs to tenant
    const webhook = await db.webhookEndpoint.findFirst({
      where: {
        id,
        ...(tenantId && { tenantId }),
      },
    });

    if (!webhook) {
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      );
    }

    // Build where clause
    const where: Record<string, unknown> = { endpointId: id };
    if (status) {
      where.status = status;
    }
    if (eventType) {
      where.eventType = eventType;
    }

    // Get logs
    const [logs, total] = await Promise.all([
      db.webhookEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.webhookEvent.count({ where }),
    ]);

    // Parse payloads for response
    const parsedLogs = logs.map((log) => ({
      ...log,
      payload: log.payload ? JSON.parse(log.payload) : null,
      endpointName: webhook.name,
    }));

    // Get summary stats
    const stats = {
      total,
      sent: await db.webhookEvent.count({ where: { ...where, status: 'sent' } }),
      failed: await db.webhookEvent.count({ where: { ...where, status: 'failed' } }),
      pending: await db.webhookEvent.count({ where: { ...where, status: 'pending' } }),
      retrying: await db.webhookEvent.count({ where: { ...where, status: 'retrying' } }),
    };

    return NextResponse.json({
      logs: parsedLogs,
      total,
      stats,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching webhook logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch webhook logs' },
      { status: 500 }
    );
  }
}

// DELETE /api/integrations/webhooks/[id]/logs - Clear webhook logs
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const beforeDate = searchParams.get('beforeDate');
    const status = searchParams.get('status');

    // Check webhook exists
    const webhook = await db.webhookEndpoint.findFirst({
      where: {
        id,
        ...(tenantId && { tenantId }),
      },
    });

    if (!webhook) {
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      );
    }

    // Build where clause
    const where: Record<string, unknown> = { endpointId: id };
    if (beforeDate) {
      where.createdAt = { lt: new Date(beforeDate) };
    }
    if (status) {
      where.status = status;
    }

    // Delete logs
    const result = await db.webhookEvent.deleteMany({ where });

    return NextResponse.json({
      success: true,
      deleted: result.count,
    });
  } catch (error) {
    console.error('Error clearing webhook logs:', error);
    return NextResponse.json(
      { error: 'Failed to clear webhook logs' },
      { status: 500 }
    );
  }
}
