/**
 * Webhook Handler for Artim Payment Gateway
 * Handles payment notifications, refunds, and subscription events
 * 
 * Endpoint: POST /api/webhooks/artim
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyArtimWebhook, ArtimWebhookData } from '@/lib/payments/artim';
import { prisma } from '@/lib/db';

/**
 * POST /api/webhooks/artim
 * Handle Artim webhook notifications
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('x-artim-signature') || '';
    
    // Verify webhook signature
    const webhookSecret = process.env.ARTIM_WEBHOOK_SECRET;
    
    if (webhookSecret && webhookSecret !== 'your_artim_webhook_secret_here') {
      const isValid = verifyArtimWebhook(rawBody, signature, webhookSecret);
      
      if (!isValid) {
        console.error('[ARTIM WEBHOOK] Invalid signature');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    // Parse webhook data
    const webhookData: ArtimWebhookData = JSON.parse(rawBody);
    
    console.log('[ARTIM WEBHOOK] Received:', {
      transaction_id: webhookData.transaction_id,
      order_id: webhookData.order_id,
      status: webhookData.status,
      amount: webhookData.amount,
    });

    // Find the sales order
    const salesOrder = await prisma.salesOrder.findFirst({
      where: {
        OR: [
          { orderNumber: webhookData.order_id },
          { paymentGatewaySessionId: webhookData.transaction_id },
        ],
      },
    });

    if (!salesOrder) {
      console.error('[ARTIM WEBHOOK] Order not found:', webhookData.order_id);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Process based on status
    switch (webhookData.status) {
      case 'approved':
        await handleApprovedPayment(salesOrder.id, webhookData);
        break;
      
      case 'declined':
        await handleDeclinedPayment(salesOrder.id, webhookData);
        break;
      
      case 'cancelled':
        await handleCancelledPayment(salesOrder.id, webhookData);
        break;
      
      case 'refunded':
        await handleRefundedPayment(salesOrder.id, webhookData);
        break;
      
      case 'pending':
        await handlePendingPayment(salesOrder.id, webhookData);
        break;
      
      default:
        console.warn('[ARTIM WEBHOOK] Unknown status:', webhookData.status);
    }

    // Log the webhook event
    await logWebhookEvent(salesOrder.id, webhookData);

    // Return success response
    return NextResponse.json({
      received: true,
      order_id: webhookData.order_id,
      status: webhookData.status,
    });
  } catch (error) {
    console.error('[ARTIM WEBHOOK ERROR]', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle approved payment
 */
async function handleApprovedPayment(
  orderId: string,
  data: ArtimWebhookData
): Promise<void> {
  // Update sales order
  await prisma.salesOrder.update({
    where: { id: orderId },
    data: {
      status: 'paid',
      paidAt: new Date().toISOString(),
      paymentGatewayTransactionId: data.transaction_id,
      paymentMethod: `artim_${data.payment_method}`,
      paymentReference: JSON.stringify({
        provider: 'artim',
        transaction_id: data.transaction_id,
        card_last_four: data.card_last_four,
        card_brand: data.card_brand,
      }),
    },
  });

  // Create tenant if this is a new subscription
  const order = await prisma.salesOrder.findUnique({
    where: { id: orderId },
  });

  if (order && order.status === 'paid') {
    // Check if tenant already exists
    const existingTenant = await prisma.tenant.findFirst({
      where: { slug: order.orderNumber.toLowerCase().split('-')[1] || order.orderNumber },
    });

    if (!existingTenant) {
      // Create tenant from order
      const tenantSlug = generateSlug(order.businessName);
      
      await prisma.tenant.create({
        data: {
          slug: tenantSlug,
          businessName: order.businessName,
          legalName: order.legalName || order.businessName,
          ownerName: order.ownerName,
          ownerEmail: order.ownerEmail,
          ownerPhone: order.ownerPhone || '',
          industrySlug: order.industrySlug,
          planSlug: order.planSlug,
          billingCycle: order.billingCycle,
          status: 'active',
          activatedAt: new Date().toISOString(),
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: getBillingCycleEnd(order.billingCycle),
        },
      });

      console.log('[ARTIM WEBHOOK] Tenant created:', tenantSlug);
    }
  }

  console.log('[ARTIM WEBHOOK] Payment approved:', orderId);
}

/**
 * Handle declined payment
 */
async function handleDeclinedPayment(
  orderId: string,
  data: ArtimWebhookData
): Promise<void> {
  await prisma.salesOrder.update({
    where: { id: orderId },
    data: {
      status: 'payment_failed',
      notes: `Payment declined via Artim: ${data.transaction_id}`,
    },
  });

  console.log('[ARTIM WEBHOOK] Payment declined:', orderId);
}

/**
 * Handle cancelled payment
 */
async function handleCancelledPayment(
  orderId: string,
  data: ArtimWebhookData
): Promise<void> {
  await prisma.salesOrder.update({
    where: { id: orderId },
    data: {
      status: 'cancelled',
      notes: `Payment cancelled via Artim: ${data.transaction_id}`,
    },
  });

  console.log('[ARTIM WEBHOOK] Payment cancelled:', orderId);
}

/**
 * Handle refunded payment
 */
async function handleRefundedPayment(
  orderId: string,
  data: ArtimWebhookData
): Promise<void> {
  await prisma.salesOrder.update({
    where: { id: orderId },
    data: {
      status: 'refunded',
      refundedAt: new Date().toISOString(),
      notes: `Payment refunded via Artim: ${data.transaction_id}`,
    },
  });

  // Optionally deactivate tenant
  console.log('[ARTIM WEBHOOK] Payment refunded:', orderId);
}

/**
 * Handle pending payment
 */
async function handlePendingPayment(
  orderId: string,
  data: ArtimWebhookData
): Promise<void> {
  await prisma.salesOrder.update({
    where: { id: orderId },
    data: {
      status: 'pending_payment',
      notes: `Payment pending via Artim: ${data.transaction_id}`,
    },
  });

  console.log('[ARTIM WEBHOOK] Payment pending:', orderId);
}

/**
 * Log webhook event for audit trail
 */
async function logWebhookEvent(
  orderId: string,
  data: ArtimWebhookData
): Promise<void> {
  await prisma.activityLog.create({
    data: {
      action: 'webhook_received',
      entityType: 'payment',
      entityId: orderId,
      description: `Artim webhook: ${data.status} - ${data.transaction_id}`,
      newValue: JSON.stringify(data),
    },
  });
}

/**
 * Generate URL-safe slug from business name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}

/**
 * Calculate billing cycle end date
 */
function getBillingCycleEnd(cycle: string | null): string {
  const now = new Date();
  
  switch (cycle) {
    case 'annual':
      now.setFullYear(now.getFullYear() + 1);
      break;
    case 'biannual':
      now.setMonth(now.getMonth() + 6);
      break;
    case 'monthly':
    default:
      now.setMonth(now.getMonth() + 1);
  }
  
  return now.toISOString();
}

/**
 * GET /api/webhooks/artim
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    provider: 'artim',
    timestamp: new Date().toISOString(),
  });
}
