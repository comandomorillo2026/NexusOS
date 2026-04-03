/**
 * Email Provider Integrations for NexusOS
 * SendGrid and Mailgun implementations
 */

import { db } from '@/lib/db';

// Email Provider Types
export type EmailProvider = 'sendgrid' | 'mailgun' | 'ses' | 'smtp' | 'resend';

// Email Address
export interface EmailAddress {
  email: string;
  name?: string;
}

// Email Attachment
export interface EmailAttachment {
  filename: string;
  content: string | Buffer; // Base64 string or Buffer
  contentType?: string;
  contentId?: string; // For inline images
  disposition?: 'attachment' | 'inline';
}

// Email Message
export interface EmailMessage {
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  from: EmailAddress;
  replyTo?: EmailAddress;
  subject: string;
  html?: string;
  text?: string;
  attachments?: EmailAttachment[];
  templateId?: string;
  templateData?: Record<string, unknown>;
  headers?: Record<string, string>;
  tags?: Record<string, string>;
  customId?: string;
  sendAt?: Date;
}

// Email Response
export interface EmailResponse {
  success: boolean;
  messageId?: string;
  provider: EmailProvider;
  error?: string;
  accepted: string[];
  rejected: string[];
}

// SendGrid Client
class SendGridClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async send(message: EmailMessage): Promise<EmailResponse> {
    const payload = {
      personalizations: [
        {
          to: message.to.map((t) => ({ email: t.email, name: t.name })),
          cc: message.cc?.map((c) => ({ email: c.email, name: c.name })),
          bcc: message.bcc?.map((b) => ({ email: b.email, name: b.name })),
          subject: message.subject,
          custom_args: message.tags,
        },
      ],
      from: {
        email: message.from.email,
        name: message.from.name,
      },
      reply_to: message.replyTo
        ? { email: message.replyTo.email, name: message.replyTo.name }
        : undefined,
      content: [
        ...(message.text ? [{ type: 'text/plain', value: message.text }] : []),
        ...(message.html ? [{ type: 'text/html', value: message.html }] : []),
      ],
      attachments: message.attachments?.map((a) => ({
        filename: a.filename,
        content: typeof a.content === 'string' ? a.content : a.content.toString('base64'),
        type: a.contentType,
        disposition: a.disposition || 'attachment',
        content_id: a.contentId,
      })),
      template_id: message.templateId,
      dynamic_template_data: message.templateData,
      headers: message.headers,
      custom_id: message.customId,
      send_at: message.sendAt ? Math.floor(message.sendAt.getTime() / 1000) : undefined,
    };

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          provider: 'sendgrid',
          error: error.errors?.[0]?.message || `HTTP ${response.status}`,
          accepted: [],
          rejected: message.to.map((t) => t.email),
        };
      }

      const messageId = response.headers.get('X-Message-ID');

      return {
        success: true,
        messageId: messageId || undefined,
        provider: 'sendgrid',
        accepted: message.to.map((t) => t.email),
        rejected: [],
      };
    } catch (error) {
      return {
        success: false,
        provider: 'sendgrid',
        error: error instanceof Error ? error.message : 'Unknown error',
        accepted: [],
        rejected: message.to.map((t) => t.email),
      };
    }
  }
}

// Mailgun Client
class MailgunClient {
  private apiKey: string;
  private domain: string;
  private region: 'us' | 'eu';

  constructor(apiKey: string, domain: string, region: 'us' | 'eu' = 'us') {
    this.apiKey = apiKey;
    this.domain = domain;
    this.region = region;
  }

  private get baseUrl(): string {
    return this.region === 'eu'
      ? 'https://api.eu.mailgun.net/v3'
      : 'https://api.mailgun.net/v3';
  }

  async send(message: EmailMessage): Promise<EmailResponse> {
    const formData = new FormData();

    // From
    formData.append('from', message.from.name
      ? `${message.from.name} <${message.from.email}>`
      : message.from.email
    );

    // To
    message.to.forEach((t) => {
      formData.append('to', t.name ? `${t.name} <${t.email}>` : t.email);
    });

    // CC
    message.cc?.forEach((c) => {
      formData.append('cc', c.name ? `${c.name} <${c.email}>` : c.email);
    });

    // BCC
    message.bcc?.forEach((b) => {
      formData.append('bcc', b.name ? `${b.name} <${b.email}>` : b.email);
    });

    // Subject
    formData.append('subject', message.subject);

    // Content
    if (message.html) {
      formData.append('html', message.html);
    }
    if (message.text) {
      formData.append('text', message.text);
    }

    // Template
    if (message.templateId) {
      formData.append('template', message.templateId);
      if (message.templateData) {
        formData.append('h:X-Mailgun-Variables', JSON.stringify(message.templateData));
      }
    }

    // Custom ID
    if (message.customId) {
      formData.append('o:tag', message.customId);
    }

    // Tags
    if (message.tags) {
      Object.entries(message.tags).forEach(([key, value]) => {
        formData.append('o:tag', `${key}:${value}`);
      });
    }

    // Attachments
    message.attachments?.forEach((a) => {
      const content = typeof a.content === 'string' ? Buffer.from(a.content, 'base64') : a.content;
      const blob = new Blob([content], { type: a.contentType || 'application/octet-stream' });
      formData.append('attachment', blob, a.filename);
    });

    // Send time
    if (message.sendAt) {
      formData.append('o:deliverytime', message.sendAt.toUTCString());
    }

    try {
      const response = await fetch(`${this.baseUrl}/${this.domain}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`api:${this.apiKey}`).toString('base64')}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          provider: 'mailgun',
          error: result.message || `HTTP ${response.status}`,
          accepted: [],
          rejected: message.to.map((t) => t.email),
        };
      }

      return {
        success: true,
        messageId: result.id,
        provider: 'mailgun',
        accepted: message.to.map((t) => t.email),
        rejected: [],
      };
    } catch (error) {
      return {
        success: false,
        provider: 'mailgun',
        error: error instanceof Error ? error.message : 'Unknown error',
        accepted: [],
        rejected: message.to.map((t) => t.email),
      };
    }
  }
}

/**
 * Email Integration Manager
 */
export class EmailIntegration {
  private tenantId: string;
  private provider: EmailProvider;
  private client: SendGridClient | MailgunClient | null = null;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
    this.provider = 'sendgrid'; // Default
  }

  /**
   * Initialize email client from database configuration
   */
  async initialize(): Promise<boolean> {
    try {
      const config = await db.emailIntegration.findFirst({
        where: {
          tenantId: this.tenantId,
          status: 'active',
        },
      });

      if (!config) {
        return false;
      }

      this.provider = config.provider as EmailProvider;

      const credentials = JSON.parse(config.credentials);

      switch (this.provider) {
        case 'sendgrid':
          this.client = new SendGridClient(credentials.apiKey);
          break;
        case 'mailgun':
          this.client = new MailgunClient(
            credentials.apiKey,
            credentials.domain,
            credentials.region
          );
          break;
        default:
          return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Send an email
   */
  async send(message: EmailMessage): Promise<EmailResponse> {
    if (!this.client) {
      const initialized = await this.initialize();
      if (!initialized) {
        return {
          success: false,
          provider: this.provider,
          error: 'Email integration not configured',
          accepted: [],
          rejected: message.to.map((t) => t.email),
        };
      }
    }

    const response = await this.client!.send(message);

    // Log the email
    await this.logEmail(message, response);

    return response;
  }

  /**
   * Log email to database
   */
  private async logEmail(message: EmailMessage, response: EmailResponse): Promise<void> {
    try {
      const config = await db.emailIntegration.findFirst({
        where: { tenantId: this.tenantId },
      });

      await db.emailLog.create({
        data: {
          tenantId: this.tenantId,
          integrationId: config?.id,
          messageType: 'notification',
          toEmail: message.to.map((t) => t.email).join(', '),
          toName: message.to.map((t) => t.name).filter(Boolean).join(', '),
          subject: message.subject,
          bodyHtml: message.html,
          bodyText: message.text,
          status: response.success ? 'sent' : 'failed',
          externalId: response.messageId,
          sentAt: response.success ? new Date().toISOString() : undefined,
          errorMessage: response.error,
        },
      });

      // Update daily count
      if (config && response.success) {
        await db.emailIntegration.update({
          where: { id: config.id },
          data: {
            sentToday: { increment: 1 },
          },
        });
      }
    } catch (error) {
      console.error('Failed to log email:', error);
    }
  }

  /**
   * Send a template email
   */
  async sendTemplate(
    to: EmailAddress[],
    templateId: string,
    templateData: Record<string, unknown>,
    options?: {
      from?: EmailAddress;
      subject?: string;
      attachments?: EmailAttachment[];
    }
  ): Promise<EmailResponse> {
    return this.send({
      to,
      from: options?.from || { email: 'noreply@nexusos.tt', name: 'NexusOS' },
      subject: options?.subject || '',
      templateId,
      templateData,
      attachments: options?.attachments,
    });
  }

  /**
   * Send appointment reminder
   */
  async sendAppointmentReminder(
    to: EmailAddress,
    data: {
      patientName: string;
      providerName: string;
      date: string;
      time: string;
      location: string;
      appointmentId: string;
    }
  ): Promise<EmailResponse> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Appointment Reminder</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Appointment Reminder</h2>
          <p>Dear ${data.patientName},</p>
          <p>This is a reminder of your upcoming appointment:</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Provider</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${data.providerName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Date</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${data.date}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Time</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${data.time}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Location</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${data.location}</td>
            </tr>
          </table>
          <p style="margin-top: 20px;">If you need to reschedule or cancel, please contact us.</p>
          <p>Best regards,<br>NexusOS Healthcare</p>
        </body>
      </html>
    `;

    return this.send({
      to: [to],
      from: { email: 'noreply@nexusos.tt', name: 'NexusOS Healthcare' },
      subject: `Appointment Reminder - ${data.date} at ${data.time}`,
      html,
      tags: { type: 'appointment_reminder', appointmentId: data.appointmentId },
    });
  }

  /**
   * Send critical lab value alert
   */
  async sendCriticalLabAlert(
    to: EmailAddress[],
    data: {
      patientName: string;
      testName: string;
      value: string;
      criticalRange: string;
      alertId: string;
    }
  ): Promise<EmailResponse> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>CRITICAL LAB VALUE ALERT</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #dc2626; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">⚠️ CRITICAL LAB VALUE ALERT</h1>
          </div>
          <div style="padding: 20px;">
            <p><strong>Patient:</strong> ${data.patientName}</p>
            <p><strong>Test:</strong> ${data.testName}</p>
            <p><strong>Result:</strong> ${data.value}</p>
            <p><strong>Critical Range:</strong> ${data.criticalRange}</p>
            <p style="color: #dc2626; font-weight: bold;">Immediate attention required!</p>
            <p>Alert ID: ${data.alertId}</p>
            <p>Time: ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;

    return this.send({
      to,
      from: { email: 'alerts@nexusos.tt', name: 'NexusOS Alerts' },
      subject: `CRITICAL: ${data.testName} for ${data.patientName}`,
      html,
      tags: { type: 'critical_lab_alert', alertId: data.alertId },
    });
  }
}

export default EmailIntegration;
