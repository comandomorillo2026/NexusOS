/**
 * Single Webhook API Routes
 * GET, PUT, DELETE operations for a specific webhook
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

// Helper function to generate webhook secret
function generateSecret(): string {
  return 'whsec_' + crypto.randomBytes(32).toString('hex');
}

// GET /api/integrations/webhooks/[id] - Get a specific webhook
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

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

    // Get stats
    const eventCount = await db.webhookEvent.count({
      where: { endpointId: webhook.id },
    });

    const successCount = await db.webhookEvent.count({
      where: { endpointId: webhook.id, status: 'sent' },
    });

    const failedCount = await db.webhookEvent.count({
      where: { endpointId: webhook.id, status: 'failed' },
    });

    // Get recent events
    const recentEvents = await db.webhookEvent.findMany({
      where: { endpointId: webhook.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      webhook: {
        ...webhook,
        events: webhook.events ? JSON.parse(webhook.events) : [],
        headers: webhook.headers ? JSON.parse(webhook.headers) : null,
        retryPolicy: webhook.retryPolicy ? JSON.parse(webhook.retryPolicy) : null,
        stats: {
          total: eventCount,
          success: successCount,
          failed: failedCount,
        },
        recentEvents: recentEvents.map(e => ({
          ...e,
          payload: e.payload ? JSON.parse(e.payload) : null,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching webhook:', error);
    return NextResponse.json(
      { error: 'Failed to fetch webhook' },
      { status: 500 }
    );
  }
}

// PUT /api/integrations/webhooks/[id] - Update a webhook
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, url, secret, events, status, headers, retryPolicy } = body;

    // Check if webhook exists
    const existing = await db.webhookEndpoint.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      );
    }

    // Validate URL if provided
    if (url) {
      try {
        new URL(url);
      } catch {
        return NextResponse.json(
          { error: 'Invalid URL format' },
          { status: 400 }
        );
      }
    }

    // Update webhook
    const webhook = await db.webhookEndpoint.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(url && { url }),
        ...(secret && { secret }),
        ...(events && { events: JSON.stringify(events) }),
        ...(status && { status }),
        ...(headers !== undefined && { headers: headers ? JSON.stringify(headers) : null }),
        ...(retryPolicy !== undefined && { retryPolicy: retryPolicy ? JSON.stringify(retryPolicy) : null }),
      },
    });

    return NextResponse.json({
      webhook: {
        ...webhook,
        events: webhook.events ? JSON.parse(webhook.events) : [],
        headers: webhook.headers ? JSON.parse(webhook.headers) : null,
        retryPolicy: webhook.retryPolicy ? JSON.parse(webhook.retryPolicy) : null,
      },
    });
  } catch (error) {
    console.error('Error updating webhook:', error);
    return NextResponse.json(
      { error: 'Failed to update webhook' },
      { status: 500 }
    );
  }
}

// DELETE /api/integrations/webhooks/[id] - Delete a webhook
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if webhook exists
    const existing = await db.webhookEndpoint.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      );
    }

    // Delete associated events first
    await db.webhookEvent.deleteMany({
      where: { endpointId: id },
    });

    // Delete webhook
    await db.webhookEndpoint.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Webhook deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting webhook:', error);
    return NextResponse.json(
      { error: 'Failed to delete webhook' },
      { status: 500 }
    );
  }
}

// PATCH /api/integrations/webhooks/[id] - Toggle webhook status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    // Check if webhook exists
    const existing = await db.webhookEndpoint.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      );
    }

    // Update status
    const webhook = await db.webhookEndpoint.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({
      webhook: {
        ...webhook,
        events: webhook.events ? JSON.parse(webhook.events) : [],
        headers: webhook.headers ? JSON.parse(webhook.headers) : null,
        retryPolicy: webhook.retryPolicy ? JSON.parse(webhook.retryPolicy) : null,
      },
    });
  } catch (error) {
    console.error('Error toggling webhook:', error);
    return NextResponse.json(
      { error: 'Failed to toggle webhook status' },
      { status: 500 }
    );
  }
}
