/**
 * Enterprise Notification Service for Insurance Platform
 * Handles multi-channel notifications: Email, SMS, Push, In-App
 * Supports event-driven notifications with templates and scheduling
 */

import { db } from '@/lib/db';

// ============================================================================
// TYPES
// ============================================================================

export type NotificationChannel = 'email' | 'sms' | 'push' | 'in_app' | 'webhook';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';

export interface NotificationRecipient {
  userId?: string;
  email?: string;
  phone?: string;
  deviceToken?: string;
  name?: string;
  locale?: string;
}

export interface NotificationTemplate {
  id: string;
  code: string;
  name: string;
  category: NotificationCategory;
  channels: NotificationChannel[];
  subject: Record<string, string>;  // locale -> subject
  body: Record<string, string>;     // locale -> body template
  variables: string[];
  priority: NotificationPriority;
}

export type NotificationCategory = 
  | 'policy'
  | 'claim'
  | 'payment'
  | 'renewal'
  | 'alert'
  | 'compliance'
  | 'marketing'
  | 'system';

export interface NotificationEvent {
  type: string;
  data: Record<string, any>;
  recipients: NotificationRecipient[];
  channels?: NotificationChannel[];
  priority?: NotificationPriority;
  scheduledFor?: Date;
  metadata?: Record<string, any>;
}

export interface NotificationResult {
  id: string;
  status: NotificationStatus;
  channel: NotificationChannel;
  recipient: string;
  sentAt?: Date;
  deliveredAt?: Date;
  error?: string;
}

// ============================================================================
// NOTIFICATION TEMPLATES
// ============================================================================

export const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  // Policy Templates
  {
    id: 'tpl-policy-issued',
    code: 'POLICY_ISSUED',
    name: 'Policy Issued',
    category: 'policy',
    channels: ['email', 'sms', 'in_app'],
    subject: {
      en: 'Your Policy {{policyNumber}} Has Been Issued',
      es: 'Su Póliza {{policyNumber}} Ha Sido Emitida',
    },
    body: {
      en: `Dear {{insuredName}},\n\nYour {{productName}} policy {{policyNumber}} has been successfully issued.\n\nCoverage Period: {{effectiveDate}} to {{expiryDate}}\nPremium: {{currency}} {{premiumAmount}}\n\nYour policy documents are attached.\n\nThank you for choosing {{companyName}}.`,
      es: `Estimado/a {{insuredName}},\n\nSu póliza de {{productName}} {{policyNumber}} ha sido emitida exitosamente.\n\nPeríodo de Cobertura: {{effectiveDate}} hasta {{expiryDate}}\nPrima: {{currency}} {{premiumAmount}}\n\nSus documentos de póliza están adjuntos.\n\nGracias por elegir {{companyName}}.`,
    },
    variables: ['policyNumber', 'insuredName', 'productName', 'effectiveDate', 'expiryDate', 'currency', 'premiumAmount', 'companyName'],
    priority: 'high',
  },
  {
    id: 'tpl-policy-renewal',
    code: 'POLICY_RENEWAL',
    name: 'Policy Renewal Reminder',
    category: 'renewal',
    channels: ['email', 'sms', 'push'],
    subject: {
      en: 'Your Policy {{policyNumber}} Expires in {{daysToExpiry}} Days',
      es: 'Su Póliza {{policyNumber}} Expira en {{daysToExpiry}} Días',
    },
    body: {
      en: `Dear {{insuredName}},\n\nYour {{productName}} policy {{policyNumber}} will expire on {{expiryDate}}.\n\nRenew now to ensure continuous coverage. Your renewal premium is {{currency}} {{renewalPremium}}.\n\nRenew online at {{renewalUrl}} or contact us at {{supportPhone}}.`,
      es: `Estimado/a {{insuredName}},\n\nSu póliza de {{productName}} {{policyNumber}} expirará el {{expiryDate}}.\n\nRenueve ahora para asegurar cobertura continua. Su prima de renovación es {{currency}} {{renewalPremium}}.\n\nRenueve en línea en {{renewalUrl}} o contáctenos al {{supportPhone}}.`,
    },
    variables: ['policyNumber', 'insuredName', 'productName', 'daysToExpiry', 'expiryDate', 'currency', 'renewalPremium', 'renewalUrl', 'supportPhone'],
    priority: 'high',
  },
  {
    id: 'tpl-payment-reminder',
    code: 'PAYMENT_REMINDER',
    name: 'Payment Reminder',
    category: 'payment',
    channels: ['email', 'sms', 'push'],
    subject: {
      en: 'Payment Reminder: {{currency}} {{amount}} Due {{dueDate}}',
      es: 'Recordatorio de Pago: {{currency}} {{amount}} Vence {{dueDate}}',
    },
    body: {
      en: `Dear {{insuredName}},\n\nThis is a friendly reminder that your payment of {{currency}} {{amount}} for policy {{policyNumber}} is due on {{dueDate}}.\n\nPay now: {{paymentUrl}}\n\nThank you for your prompt payment.`,
      es: `Estimado/a {{insuredName}},\n\nLe recordamos amablemente que su pago de {{currency}} {{amount}} para la póliza {{policyNumber}} vence el {{dueDate}}.\n\nPague ahora: {{paymentUrl}}\n\nGracias por su prontitud.`,
    },
    variables: ['insuredName', 'currency', 'amount', 'policyNumber', 'dueDate', 'paymentUrl'],
    priority: 'normal',
  },
  {
    id: 'tpl-claim-filed',
    code: 'CLAIM_FILED',
    name: 'Claim Filed',
    category: 'claim',
    channels: ['email', 'in_app'],
    subject: {
      en: 'Claim {{claimNumber}} Has Been Filed',
      es: 'Reclamación {{claimNumber}} Ha Sido Radicada',
    },
    body: {
      en: `Dear {{insuredName}},\n\nYour claim {{claimNumber}} has been successfully filed.\n\nClaim Type: {{claimType}}\nAmount: {{currency}} {{claimedAmount}}\nStatus: {{claimStatus}}\n\nAn adjuster will contact you within {{responseTimeHours}} hours.\n\nTrack your claim: {{claimTrackingUrl}}`,
      es: `Estimado/a {{insuredName}},\n\nSu reclamación {{claimNumber}} ha sido radicada exitosamente.\n\nTipo de Reclamación: {{claimType}}\nMonto: {{currency}} {{claimedAmount}}\nEstado: {{claimStatus}}\n\nUn ajustador le contactará en las próximas {{responseTimeHours}} horas.\n\nRastree su reclamación: {{claimTrackingUrl}}`,
    },
    variables: ['insuredName', 'claimNumber', 'claimType', 'currency', 'claimedAmount', 'claimStatus', 'responseTimeHours', 'claimTrackingUrl'],
    priority: 'high',
  },
  {
    id: 'tpl-claim-approved',
    code: 'CLAIM_APPROVED',
    name: 'Claim Approved',
    category: 'claim',
    channels: ['email', 'sms', 'push'],
    subject: {
      en: 'Good News! Claim {{claimNumber}} Approved',
      es: '¡Buenas Noticias! Reclamación {{claimNumber}} Aprobada',
    },
    body: {
      en: `Dear {{insuredName}},\n\nGreat news! Your claim {{claimNumber}} has been approved.\n\nApproved Amount: {{currency}} {{approvedAmount}}\nPayment Method: {{paymentMethod}}\nExpected Payment: {{expectedPaymentDate}}\n\nIf you have questions, contact us at {{supportPhone}}.`,
      es: `Estimado/a {{insuredName}},\n\n¡Excelentes noticias! Su reclamación {{claimNumber}} ha sido aprobada.\n\nMonto Aprobado: {{currency}} {{approvedAmount}}\nMétodo de Pago: {{paymentMethod}}\nFecha de Pago Esperada: {{expectedPaymentDate}}\n\nSi tiene preguntas, contáctenos al {{supportPhone}}.`,
    },
    variables: ['insuredName', 'claimNumber', 'currency', 'approvedAmount', 'paymentMethod', 'expectedPaymentDate', 'supportPhone'],
    priority: 'high',
  },
  {
    id: 'tpl-fraud-alert',
    code: 'FRAUD_ALERT',
    name: 'Fraud Alert',
    category: 'alert',
    channels: ['email', 'in_app'],
    subject: {
      en: 'ALERT: High-Risk Claim Detected - {{claimNumber}}',
      es: 'ALERTA: Reclamación de Alto Riesgo Detectada - {{claimNumber}}',
    },
    body: {
      en: `Fraud Alert Notification\n\nClaim: {{claimNumber}}\nRisk Score: {{riskScore}}\nFlags: {{fraudFlags}}\n\nImmediate review required. Access the claim: {{claimReviewUrl}}`,
      es: `Notificación de Alerta de Fraude\n\nReclamación: {{claimNumber}}\nPuntuación de Riesgo: {{riskScore}}\nIndicadores: {{fraudFlags}}\n\nRevisión inmediata requerida. Acceda a la reclamación: {{claimReviewUrl}}`,
    },
    variables: ['claimNumber', 'riskScore', 'fraudFlags', 'claimReviewUrl'],
    priority: 'urgent',
  },
  {
    id: 'tpl-regulatory-deadline',
    code: 'REGULATORY_DEADLINE',
    name: 'Regulatory Filing Deadline',
    category: 'compliance',
    channels: ['email', 'in_app'],
    subject: {
      en: 'REMINDER: {{filingType}} Due in {{daysRemaining}} Days - {{jurisdiction}}',
      es: 'RECORDATORIO: {{filingType}} Vence en {{daysRemaining}} Días - {{jurisdiction}}',
    },
    body: {
      en: `Regulatory Filing Reminder\n\nFiling Type: {{filingType}}\nJurisdiction: {{jurisdiction}}\nDue Date: {{dueDate}}\nDays Remaining: {{daysRemaining}}\n\n{{additionalNotes}}\n\nAccess filing portal: {{filingPortalUrl}}`,
      es: `Recordatorio de Presentación Regulatoria\n\nTipo de Presentación: {{filingType}}\nJurisdicción: {{jurisdiction}}\nFecha Límite: {{dueDate}}\nDías Restantes: {{daysRemaining}}\n\n{{additionalNotes}}\n\nAcceda al portal: {{filingPortalUrl}}`,
    },
    variables: ['filingType', 'jurisdiction', 'dueDate', 'daysRemaining', 'additionalNotes', 'filingPortalUrl'],
    priority: 'urgent',
  },
];

// ============================================================================
// NOTIFICATION SERVICE
// ============================================================================

export class NotificationService {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  /**
   * Send notification based on event
   */
  async send(event: NotificationEvent): Promise<NotificationResult[]> {
    const template = this.findTemplate(event.type);
    if (!template) {
      console.warn(`No template found for event type: ${event.type}`);
      return [];
    }

    const results: NotificationResult[] = [];
    const channels = event.channels || template.channels;

    for (const recipient of event.recipients) {
      for (const channel of channels) {
        const result = await this.sendToChannel(template, recipient, event.data, channel);
        results.push(result);
      }
    }

    // Log notification
    await this.logNotification(event, results);

    return results;
  }

  /**
   * Send to specific channel
   */
  private async sendToChannel(
    template: NotificationTemplate,
    recipient: NotificationRecipient,
    data: Record<string, any>,
    channel: NotificationChannel
  ): Promise<NotificationResult> {
    const locale = recipient.locale || 'en';
    const subject = this.renderTemplate(template.subject[locale] || template.subject['en'], data);
    const body = this.renderTemplate(template.body[locale] || template.body['en'], data);

    const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      switch (channel) {
        case 'email':
          return await this.sendEmail(id, recipient, subject, body);
        case 'sms':
          return await this.sendSMS(id, recipient, body);
        case 'push':
          return await this.sendPush(id, recipient, subject, body);
        case 'in_app':
          return await this.sendInApp(id, recipient, subject, body);
        case 'webhook':
          return await this.sendWebhook(id, recipient, { subject, body, data });
        default:
          throw new Error(`Unknown channel: ${channel}`);
      }
    } catch (error) {
      return {
        id,
        status: 'failed',
        channel,
        recipient: recipient.email || recipient.phone || recipient.userId || 'unknown',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send email notification
   */
  private async sendEmail(
    id: string,
    recipient: NotificationRecipient,
    subject: string,
    body: string
  ): Promise<NotificationResult> {
    if (!recipient.email) {
      throw new Error('No email address provided');
    }

    // In production, integrate with email provider (SendGrid, Mailgun, etc.)
    console.log(`[EMAIL] To: ${recipient.email}, Subject: ${subject}`);

    // Simulate sending
    return {
      id,
      status: 'sent',
      channel: 'email',
      recipient: recipient.email,
      sentAt: new Date(),
    };
  }

  /**
   * Send SMS notification
   */
  private async sendSMS(
    id: string,
    recipient: NotificationRecipient,
    body: string
  ): Promise<NotificationResult> {
    if (!recipient.phone) {
      throw new Error('No phone number provided');
    }

    // In production, integrate with SMS provider (Twilio, etc.)
    console.log(`[SMS] To: ${recipient.phone}, Body: ${body.substring(0, 50)}...`);

    return {
      id,
      status: 'sent',
      channel: 'sms',
      recipient: recipient.phone,
      sentAt: new Date(),
    };
  }

  /**
   * Send push notification
   */
  private async sendPush(
    id: string,
    recipient: NotificationRecipient,
    title: string,
    body: string
  ): Promise<NotificationResult> {
    if (!recipient.deviceToken) {
      throw new Error('No device token provided');
    }

    // In production, integrate with FCM/APNs
    console.log(`[PUSH] Token: ${recipient.deviceToken}, Title: ${title}`);

    return {
      id,
      status: 'sent',
      channel: 'push',
      recipient: recipient.deviceToken,
      sentAt: new Date(),
    };
  }

  /**
   * Send in-app notification
   */
  private async sendInApp(
    id: string,
    recipient: NotificationRecipient,
    title: string,
    body: string
  ): Promise<NotificationResult> {
    if (!recipient.userId) {
      throw new Error('No user ID provided');
    }

    // Store in database for in-app display
    // This would typically write to a notifications table
    console.log(`[IN_APP] User: ${recipient.userId}, Title: ${title}`);

    return {
      id,
      status: 'delivered',
      channel: 'in_app',
      recipient: recipient.userId,
      sentAt: new Date(),
      deliveredAt: new Date(),
    };
  }

  /**
   * Send webhook notification
   */
  private async sendWebhook(
    id: string,
    recipient: NotificationRecipient,
    payload: any
  ): Promise<NotificationResult> {
    // In production, make HTTP POST to webhook URL
    console.log(`[WEBHOOK] Payload:`, JSON.stringify(payload, null, 2));

    return {
      id,
      status: 'sent',
      channel: 'webhook',
      recipient: 'webhook-endpoint',
      sentAt: new Date(),
    };
  }

  /**
   * Render template with variables
   */
  private renderTemplate(template: string, data: Record<string, any>): string {
    let rendered = template;
    for (const [key, value] of Object.entries(data)) {
      rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }
    return rendered;
  }

  /**
   * Find template by event type
   */
  private findTemplate(eventType: string): NotificationTemplate | undefined {
    return NOTIFICATION_TEMPLATES.find(t => t.code === eventType);
  }

  /**
   * Log notification for audit
   */
  private async logNotification(
    event: NotificationEvent,
    results: NotificationResult[]
  ): Promise<void> {
    try {
      await db.activityLog.create({
        data: {
          tenantId: this.tenantId,
          action: 'NOTIFICATION_SENT',
          entityType: 'NOTIFICATION',
          description: `Notification ${event.type} sent to ${results.length} recipient(s)`,
          oldValue: JSON.stringify({ event: { type: event.type, priority: event.priority } }),
          newValue: JSON.stringify({ results }),
        },
      });
    } catch (error) {
      console.error('Failed to log notification:', error);
    }
  }
}

// ============================================================================
// NOTIFICATION QUEUE
// ============================================================================

/**
 * Queue for scheduled/batched notifications
 */
export class NotificationQueue {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  /**
   * Queue notification for later delivery
   */
  async queue(event: NotificationEvent, scheduledFor: Date): Promise<string> {
    // In production, this would insert into a queue table or message broker
    const queueId = `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`[QUEUE] Queued notification ${queueId} for ${scheduledFor.toISOString()}`);
    
    return queueId;
  }

  /**
   * Process pending notifications
   */
  async processQueue(): Promise<number> {
    // In production, fetch pending notifications from queue and send them
    console.log('[QUEUE] Processing pending notifications...');
    return 0;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create notification service instance
 */
export function createNotificationService(tenantId: string): NotificationService {
  return new NotificationService(tenantId);
}

/**
 * Quick send notification
 */
export async function quickNotify(
  tenantId: string,
  type: string,
  recipients: NotificationRecipient[],
  data: Record<string, any>
): Promise<NotificationResult[]> {
  const service = new NotificationService(tenantId);
  return service.send({ type, recipients, data });
}

// Export types
export type {
  NotificationChannel as NotificationChannelType,
  NotificationPriority as NotificationPriorityType,
  NotificationStatus as NotificationStatusType,
  NotificationRecipient as NotificationRecipientType,
  NotificationTemplate as NotificationTemplateType,
  NotificationEvent as NotificationEventType,
  NotificationResult as NotificationResultType,
};
