// Email integration types
export type EmailProvider = 'sendgrid' | 'mailgun' | 'ses' | 'resend';

export interface EmailConfig {
  provider: EmailProvider;
  apiKey: string;
  fromEmail: string;
  fromName?: string;
}

export interface EmailMessage {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{ filename: string; content: Buffer | string }>;
}

export async function sendEmail(config: EmailConfig, message: EmailMessage): Promise<boolean> {
  console.log('Sending email via', config.provider);
  return true;
}

