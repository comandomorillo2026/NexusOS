/**
 * Webhook API Routes
 * CRUD operations for webhook endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

// Helper function to generate webhook secret
function generateSecret(): string {
  return 'whsec_' + crypto.randomBytes(32).toString('hex');
}

// GET /api/integrations/webhooks - List all webhooks for tenant
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const status = searchParams.get('status');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required' },
        { status: 400 }
      );
    }

    // Build where clause
    const where: Record<string, unknown> = { tenantId };
    if (status) {
      where.status = status;
    }

    const webhooks = await db.webhookEndpoint.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Get stats for each webhook
    const webhooksStats = await Promise.all(
      webhooks.map(async (webhook) => {
        const eventCount = await db.webhookEvent.count({
          where: { endpointId: webhook.id },
        });

        const successCount = await db.webhookEvent.count({
          where: { endpointId: webhook.id, status: 'sent' },
        });

        const failedCount = await db.webhookEvent.count({
          where: { endpointId: webhook.id, status: 'failed' },
        });

        return {
          ...webhook,
          events: webhook.events ? JSON.parse(webhook.events) : [],
          headers: webhook.headers ? JSON.parse(webhook.headers) : null,
          retryPolicy: webhook.retryPolicy ? JSON.parse(webhook.retryPolicy) : null,
          stats: {
            total: eventCount,
            success: successCount,
            failed: failedCount,
          },
        };
      })
    );

    return NextResponse.json({
      webhooks: webhooksStats,
      total: webhooks.length,
    });
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch webhooks' },
      { status: 500 }
    );
  }
}

// POST /api/integrations/webhooks - Create a new webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, name, url, secret, events, headers, retryPolicy } = body;

    // Validate required fields
    if (!tenantId || !name || !url || !events || events.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: tenantId, name, url, events' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Generate secret if not provided
    const webhookSecret = secret || generateSecret();

    // Create webhook
    const webhook = await db.webhookEndpoint.create({
      data: {
        tenantId,
        name,
        url,
        secret: webhookSecret,
        events: JSON.stringify(events),
        status: 'active',
        headers: headers ? JSON.stringify(headers) : null,
        retryPolicy: retryPolicy ? JSON.stringify(retryPolicy) : null,
      },
    });

    return NextResponse.json({
      webhook: {
        ...webhook,
        events: JSON.parse(webhook.events),
        headers: webhook.headers ? JSON.parse(webhook.headers) : null,
        retryPolicy: webhook.retryPolicy ? JSON.parse(webhook.retryPolicy) : null,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating webhook:', error);
    return NextResponse.json(
      { error: 'Failed to create webhook' },
      { status: 500 }
    );
  }
}
