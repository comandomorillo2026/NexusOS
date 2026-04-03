/**
 * Webhook System for NexusOS Integrations Hub
 * Outbound webhooks with retry logic and event logging
 */

import { db } from '@/lib/db';
import crypto from 'crypto';

// Webhook Event Types
export type WebhookEventType =
  // Patient Events
  | 'patient.created'
  | 'patient.updated'
  | 'patient.deleted'
  // Appointment Events
  | 'appointment.created'
  | 'appointment.updated'
  | 'appointment.cancelled'
  | 'appointment.completed'
  | 'appointment.no_show'
  // Lab Events
  | 'lab.order_submitted'
  | 'lab.result_received'
  | 'lab.critical_value'
  // Billing Events
  | 'invoice.created'
  | 'invoice.paid'
  | 'invoice.overdue'
  | 'payment.received'
  | 'payment.failed'
  // Prescription Events
  | 'prescription.created'
  | 'prescription.dispensed'
  | 'prescription.refill_requested'
  // Integration Events
  | 'integration.connected'
  | 'integration.disconnected'
  | 'integration.error'
  | 'integration.sync_completed'
  // Telemedicine Events
  | 'telemed.session_started'
  | 'telemed.session_ended'
  | 'telemed.recording_ready'
  // Document Events
  | 'document.uploaded'
  | 'document.shared'
  | 'document.deleted'
  // Custom Events
  | string;

// Webhook Event Payload
export interface WebhookEventPayload {
  id: string;
  type: WebhookEventType;
  timestamp: string;
  tenantId: string;
  data: unknown;
  metadata?: {
    source?: string;
    userId?: string;
    userName?: string;
    ipAddress?: string;
    userAgent?: string;
    [key: string]: unknown;
  };
}

// Webhook Configuration
export interface WebhookConfig {
  id: string;
  tenantId: string;
  name: string;
  url: string;
  secret?: string;
  events: WebhookEventType[];
  status: 'active' | 'inactive' | 'error';
  headers?: Record<string, string>;
  retryPolicy?: {
    maxAttempts: number;
    initialDelayMs: number;
    maxDelayMs: number;
    backoffMultiplier: number;
    retryOn: number[]; // HTTP status codes to retry
  };
  timeout?: number;
  filterRules?: {
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'lt' | 'contains' | 'starts_with' | 'ends_with';
    value: unknown;
  }[];
}

// Webhook Delivery Attempt
export interface WebhookDeliveryAttempt {
  id: string;
  eventId: string;
  endpointId: string;
  attemptNumber: number;
  status: 'pending' | 'sent' | 'failed';
  requestTimestamp: string;
  responseTimestamp?: string;
  responseCode?: number;
  responseBody?: string;
  error?: string;
  nextRetryAt?: string;
}

// Default retry policy
const DEFAULT_RETRY_POLICY = {
  maxAttempts: 5,
  initialDelayMs: 1000,
  maxDelayMs: 300000, // 5 minutes
  backoffMultiplier: 2,
  retryOn: [408, 429, 500, 502, 503, 504],
};

/**
 * Webhook Manager
 */
export class WebhookManager {
  private baseUrl?: string;

  constructor(options?: { baseUrl?: string }) {
    this.baseUrl = options?.baseUrl;
  }

  /**
   * Generate a webhook secret
   */
  generateSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate webhook ID
   */
  private generateId(): string {
    return `wh_${crypto.randomBytes(16).toString('hex')}`;
  }

  /**
   * Create HMAC signature for payload
   */
  createSignature(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  /**
   * Verify webhook signature
   */
  verifySignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = this.createSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Trigger a webhook event
   */
  async trigger(
    tenantId: string,
    eventType: WebhookEventType,
    data: unknown,
    metadata?: WebhookEventPayload['metadata']
  ): Promise<string[]> {
    const eventId = this.generateId();
    const payload: WebhookEventPayload = {
      id: eventId,
      type: eventType,
      timestamp: new Date().toISOString(),
      tenantId,
      data,
      metadata,
    };

    // Get all active endpoints for this tenant that subscribe to this event
    const endpoints = await this.getActiveEndpoints(tenantId, eventType);

    const eventIds: string[] = [];

    for (const endpoint of endpoints) {
      // Check filter rules if any
      if (endpoint.filterRules && !this.matchesFilters(payload, endpoint.filterRules)) {
        continue;
      }

      // Create webhook event record
      const event = await db.webhookEvent.create({
        data: {
          id: this.generateId(),
          tenantId,
          endpointId: endpoint.id,
          eventType,
          payload: JSON.stringify(payload),
          status: 'pending',
          attemptCount: 0,
          maxAttempts: endpoint.retryPolicy?.maxAttempts || DEFAULT_RETRY_POLICY.maxAttempts,
        },
      });

      eventIds.push(event.id);

      // Queue for delivery
      await this.deliverWebhook(event.id, endpoint, payload);
    }

    return eventIds;
  }

  /**
   * Get active endpoints for an event type
   */
  private async getActiveEndpoints(
    tenantId: string,
    eventType: WebhookEventType
  ): Promise<WebhookConfig[]> {
    const endpoints = await db.webhookEndpoint.findMany({
      where: {
        tenantId,
        status: 'active',
        events: {
          contains: eventType,
        },
      },
    });

    return endpoints.map((ep) => ({
      id: ep.id,
      tenantId: ep.tenantId,
      name: ep.name,
      url: ep.url,
      secret: ep.secret || undefined,
      events: ep.events ? JSON.parse(ep.events) : [],
      status: ep.status as 'active' | 'inactive' | 'error',
      headers: ep.headers ? JSON.parse(ep.headers) : undefined,
      retryPolicy: ep.retryPolicy ? JSON.parse(ep.retryPolicy) : DEFAULT_RETRY_POLICY,
    }));
  }

  /**
   * Check if payload matches filter rules
   */
  private matchesFilters(
    payload: WebhookEventPayload,
    filters: WebhookConfig['filterRules']
  ): boolean {
    if (!filters || filters.length === 0) return true;

    for (const filter of filters) {
      const value = this.getNestedValue(payload, filter.field);

      switch (filter.operator) {
        case 'eq':
          if (value !== filter.value) return false;
          break;
        case 'ne':
          if (value === filter.value) return false;
          break;
        case 'gt':
          if (!(value > filter.value)) return false;
          break;
        case 'lt':
          if (!(value < filter.value)) return false;
          break;
        case 'contains':
          if (!String(value).includes(String(filter.value))) return false;
          break;
        case 'starts_with':
          if (!String(value).startsWith(String(filter.value))) return false;
          break;
        case 'ends_with':
          if (!String(value).endsWith(String(filter.value))) return false;
          break;
      }
    }

    return true;
  }

  /**
   * Get nested value from object
   */
  private getNestedValue(obj: unknown, path: string): unknown {
    return path.split('.').reduce((current, key) => {
      if (current && typeof current === 'object') {
        return (current as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj);
  }

  /**
   * Deliver webhook to endpoint
   */
  private async deliverWebhook(
    eventId: string,
    endpoint: WebhookConfig,
    payload: WebhookEventPayload
  ): Promise<boolean> {
    const payloadString = JSON.stringify(payload);
    const retryPolicy = endpoint.retryPolicy || DEFAULT_RETRY_POLICY;

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Webhook-Id': payload.id,
      'X-Webhook-Event': payload.type,
      'X-Webhook-Timestamp': payload.timestamp,
      'User-Agent': 'NexusOS-Webhooks/1.0',
      ...endpoint.headers,
    };

    // Add signature if secret is configured
    if (endpoint.secret) {
      headers['X-Webhook-Signature'] = this.createSignature(payloadString, endpoint.secret);
      headers['X-Webhook-Signature-256'] = `sha256=${headers['X-Webhook-Signature']}`;
    }

    try {
      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers,
        body: payloadString,
        signal: endpoint.timeout ? AbortSignal.timeout(endpoint.timeout) : undefined,
      });

      const responseBody = await response.text();

      // Update event record
      await db.webhookEvent.update({
        where: { id: eventId },
        data: {
          status: response.ok ? 'sent' : 'failed',
          lastAttemptAt: new Date().toISOString(),
          responseCode: response.status,
          responseBody: responseBody.substring(0, 1000), // Limit stored response
          attemptCount: { increment: 1 },
        },
      });

      // Update endpoint stats
      await db.webhookEndpoint.update({
        where: { id: endpoint.id },
        data: {
          lastTriggeredAt: new Date().toISOString(),
          failureCount: response.ok ? 0 : { increment: 1 },
          lastError: response.ok ? null : `HTTP ${response.status}`,
        },
      });

      // Schedule retry if needed
      if (!response.ok && retryPolicy.retryOn.includes(response.status)) {
        await this.scheduleRetry(eventId, endpoint);
      }

      return response.ok;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Update event record
      await db.webhookEvent.update({
        where: { id: eventId },
        data: {
          status: 'failed',
          lastAttemptAt: new Date().toISOString(),
          lastError: errorMessage,
          attemptCount: { increment: 1 },
        },
      });

      // Update endpoint stats
      await db.webhookEndpoint.update({
        where: { id: endpoint.id },
        data: {
          failureCount: { increment: 1 },
          lastError: errorMessage,
        },
      });

      // Schedule retry
      await this.scheduleRetry(eventId, endpoint);

      return false;
    }
  }

  /**
   * Schedule a retry attempt
   */
  private async scheduleRetry(eventId: string, endpoint: WebhookConfig): Promise<void> {
    const event = await db.webhookEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) return;

    const retryPolicy = endpoint.retryPolicy || DEFAULT_RETRY_POLICY;

    // Check if max attempts reached
    if (event.attemptCount >= retryPolicy.maxAttempts) {
      return;
    }

    // Calculate delay with exponential backoff
    const delay = Math.min(
      retryPolicy.initialDelayMs * Math.pow(retryPolicy.backoffMultiplier, event.attemptCount - 1),
      retryPolicy.maxDelayMs
    );

    const nextRetryAt = new Date(Date.now() + delay);

    // Update event with retry time
    await db.webhookEvent.update({
      where: { id: eventId },
      data: {
        status: 'retrying',
        nextRetryAt: nextRetryAt.toISOString(),
      },
    });
  }

  /**
   * Process pending retries
   */
  async processRetries(): Promise<number> {
    const now = new Date().toISOString();

    const pendingRetries = await db.webhookEvent.findMany({
      where: {
        status: 'retrying',
        nextRetryAt: { lte: now },
      },
      include: {
        WebhookEndpoint: true,
      },
    });

    let processedCount = 0;

    for (const event of pendingRetries) {
      if (!event.WebhookEndpoint) continue;

      const endpoint: WebhookConfig = {
        id: event.WebhookEndpoint.id,
        tenantId: event.WebhookEndpoint.tenantId,
        name: event.WebhookEndpoint.name,
        url: event.WebhookEndpoint.url,
        secret: event.WebhookEndpoint.secret || undefined,
        events: event.WebhookEndpoint.events ? JSON.parse(event.WebhookEndpoint.events) : [],
        status: event.WebhookEndpoint.status as 'active' | 'inactive' | 'error',
        headers: event.WebhookEndpoint.headers ? JSON.parse(event.WebhookEndpoint.headers) : undefined,
        retryPolicy: event.WebhookEndpoint.retryPolicy
          ? JSON.parse(event.WebhookEndpoint.retryPolicy)
          : DEFAULT_RETRY_POLICY,
      };

      const payload: WebhookEventPayload = JSON.parse(event.payload);

      // Set status back to pending before delivery attempt
      await db.webhookEvent.update({
        where: { id: event.id },
        data: { status: 'pending' },
      });

      await this.deliverWebhook(event.id, endpoint, payload);
      processedCount++;
    }

    return processedCount;
  }

  /**
   * Create a new webhook endpoint
   */
  async createEndpoint(
    tenantId: string,
    config: Omit<WebhookConfig, 'id' | 'tenantId' | 'status'>
  ): Promise<WebhookConfig> {
    const endpoint = await db.webhookEndpoint.create({
      data: {
        tenantId,
        name: config.name,
        url: config.url,
        secret: config.secret,
        events: JSON.stringify(config.events),
        status: 'active',
        headers: config.headers ? JSON.stringify(config.headers) : null,
        retryPolicy: config.retryPolicy ? JSON.stringify(config.retryPolicy) : null,
      },
    });

    return {
      id: endpoint.id,
      tenantId: endpoint.tenantId,
      name: endpoint.name,
      url: endpoint.url,
      secret: endpoint.secret || undefined,
      events: JSON.parse(endpoint.events),
      status: endpoint.status as 'active' | 'inactive' | 'error',
      headers: endpoint.headers ? JSON.parse(endpoint.headers) : undefined,
      retryPolicy: endpoint.retryPolicy ? JSON.parse(endpoint.retryPolicy) : undefined,
    };
  }

  /**
   * Update a webhook endpoint
   */
  async updateEndpoint(
    endpointId: string,
    updates: Partial<Omit<WebhookConfig, 'id' | 'tenantId'>>
  ): Promise<WebhookConfig | null> {
    const endpoint = await db.webhookEndpoint.update({
      where: { id: endpointId },
      data: {
        name: updates.name,
        url: updates.url,
        secret: updates.secret,
        events: updates.events ? JSON.stringify(updates.events) : undefined,
        status: updates.status,
        headers: updates.headers ? JSON.stringify(updates.headers) : undefined,
        retryPolicy: updates.retryPolicy ? JSON.stringify(updates.retryPolicy) : undefined,
      },
    });

    if (!endpoint) return null;

    return {
      id: endpoint.id,
      tenantId: endpoint.tenantId,
      name: endpoint.name,
      url: endpoint.url,
      secret: endpoint.secret || undefined,
      events: JSON.parse(endpoint.events),
      status: endpoint.status as 'active' | 'inactive' | 'error',
      headers: endpoint.headers ? JSON.parse(endpoint.headers) : undefined,
      retryPolicy: endpoint.retryPolicy ? JSON.parse(endpoint.retryPolicy) : undefined,
    };
  }

  /**
   * Delete a webhook endpoint
   */
  async deleteEndpoint(endpointId: string): Promise<boolean> {
    try {
      await db.webhookEndpoint.delete({
        where: { id: endpointId },
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get webhook event history
   */
  async getEventHistory(
    tenantId: string,
    options?: {
      endpointId?: string;
      eventType?: string;
      status?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ events: WebhookEventPayload[]; total: number }> {
    const where: Record<string, unknown> = { tenantId };

    if (options?.endpointId) {
      where.endpointId = options.endpointId;
    }
    if (options?.eventType) {
      where.eventType = options.eventType;
    }
    if (options?.status) {
      where.status = options.status;
    }

    const [events, total] = await Promise.all([
      db.webhookEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: options?.limit || 50,
        skip: options?.offset || 0,
      }),
      db.webhookEvent.count({ where }),
    ]);

    return {
      events: events.map((e) => JSON.parse(e.payload)),
      total,
    };
  }

  /**
   * Test a webhook endpoint
   */
  async testEndpoint(endpointId: string): Promise<{
    success: boolean;
    responseTime?: number;
    statusCode?: number;
    error?: string;
  }> {
    const endpoint = await db.webhookEndpoint.findUnique({
      where: { id: endpointId },
    });

    if (!endpoint) {
      return { success: false, error: 'Endpoint not found' };
    }

    const testPayload: WebhookEventPayload = {
      id: this.generateId(),
      type: 'integration.test',
      timestamp: new Date().toISOString(),
      tenantId: endpoint.tenantId,
      data: {
        message: 'This is a test webhook from NexusOS',
        endpoint: endpoint.name,
      },
    };

    const startTime = Date.now();

    try {
      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Test': 'true',
          'User-Agent': 'NexusOS-Webhooks/1.0',
          ...(endpoint.secret && {
            'X-Webhook-Signature': this.createSignature(
              JSON.stringify(testPayload),
              endpoint.secret
            ),
          }),
        },
        body: JSON.stringify(testPayload),
        signal: AbortSignal.timeout(30000),
      });

      const responseTime = Date.now() - startTime;

      return {
        success: response.ok,
        responseTime,
        statusCode: response.status,
        error: response.ok ? undefined : `HTTP ${response.status}`,
      };
    } catch (error) {
      return {
        success: false,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Singleton instance
export const webhookManager = new WebhookManager();

export default WebhookManager;
