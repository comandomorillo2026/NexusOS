// Integration exports
export * from './fhir';
export * from './hl7';
export * from './hl7/parser';
export * from './hl7/generator';
export * from './lab/connector';
export * from './insurance/claims';
export * from './webhooks/manager';
export * from './email';
export * from './calendar/sync';
export * from './payments/stripe';
export * from './storage';

// Integration types
export type IntegrationType = 
  | 'fhir' 
  | 'hl7' 
  | 'lab' 
  | 'insurance' 
  | 'email' 
  | 'calendar' 
  | 'payment' 
  | 'storage' 
  | 'webhook';

export type IntegrationStatus = 'active' | 'inactive' | 'error' | 'pending';

export interface BaseIntegrationConfig {
  id: string;
  tenantId: string;
  integrationType: IntegrationType;
  integrationName: string;
  provider: string;
  status: IntegrationStatus;
  credentials?: string;
  settings?: string;
  lastSyncAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FHIRIntegrationConfig extends BaseIntegrationConfig {
  integrationType: 'fhir';
  baseUrl: string;
  apiKey?: string;
  bearerToken?: string;
}

export interface HL7IntegrationConfig extends BaseIntegrationConfig {
  integrationType: 'hl7';
  host: string;
  port: number;
  facility?: string;
}

export interface LabIntegrationConfig extends BaseIntegrationConfig {
  integrationType: 'lab';
  labName: string;
  connectionType: 'hl7' | 'api' | 'file';
}

export interface InsuranceIntegrationConfig extends BaseIntegrationConfig {
  integrationType: 'insurance';
  payerName: string;
  payerId: string;
  payerCode?: string;
}

export interface EmailIntegrationConfig extends BaseIntegrationConfig {
  integrationType: 'email';
  fromEmail: string;
  fromName?: string;
  dailyLimit?: number;
}

export interface CalendarIntegrationConfig extends BaseIntegrationConfig {
  integrationType: 'calendar';
  calendarId?: string;
  calendarName?: string;
  syncDirection: 'one-way' | 'two-way';
}

export interface PaymentGatewayConfig extends BaseIntegrationConfig {
  integrationType: 'payment';
  feePercent?: number;
  feeFixed?: number;
  isPrimary?: boolean;
}

export interface StorageIntegrationConfig extends BaseIntegrationConfig {
  integrationType: 'storage';
  rootFolderId?: string;
  rootFolderName?: string;
  storageUsed?: number;
  storageLimit?: number;
}

export interface WebhookEndpoint {
  id: string;
  tenantId: string;
  name: string;
  url: string;
  secret?: string;
  events: string[];
  status: 'active' | 'inactive' | 'error';
  lastTriggeredAt?: Date;
  failureCount: number;
  lastError?: string;
  createdAt: Date;
}

export interface WebhookEvent {
  id: string;
  tenantId: string;
  endpointId: string;
  eventType: string;
  payload: string;
  status: 'pending' | 'sent' | 'failed' | 'retrying';
  attemptCount: number;
  maxAttempts: number;
  nextRetryAt?: Date;
  lastAttemptAt?: Date;
  lastError?: string;
  responseCode?: number;
  responseBody?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export type IntegrationConfig = 
  | FHIRIntegrationConfig 
  | HL7IntegrationConfig 
  | LabIntegrationConfig 
  | InsuranceIntegrationConfig 
  | EmailIntegrationConfig 
  | CalendarIntegrationConfig 
  | PaymentGatewayConfig 
  | StorageIntegrationConfig;

// Integration status helper
export function getIntegrationStatusColor(status: IntegrationStatus): string {
  switch (status) {
    case 'active': return '#22C55E';
    case 'inactive': return '#6B7280';
    case 'error': return '#EF4444';
    case 'pending': return '#F59E0B';
    default: return '#6B7280';
  }
}

// Available integrations list
export const AVAILABLE_INTEGRATIONS = [
  { id: 'quickbooks', name: 'QuickBooks Online', category: 'accounting', icon: '📊' },
  { id: 'xero', name: 'Xero', category: 'accounting', icon: '📊' },
  { id: 'google', name: 'Google Workspace', category: 'productivity', icon: '📧' },
  { id: 'microsoft', name: 'Microsoft Outlook', category: 'productivity', icon: '📧' },
  { id: 'docusign', name: 'DocuSign', category: 'signatures', icon: '✍️' },
  { id: 'zoom', name: 'Zoom', category: 'video', icon: '📹' },
  { id: 'stripe', name: 'Stripe', category: 'payments', icon: '💳' },
  { id: 'paypal', name: 'PayPal', category: 'payments', icon: '💳' },
  { id: 'wipay', name: 'WiPay', category: 'payments', icon: '💳' },
  { id: 'dropbox', name: 'Dropbox', category: 'storage', icon: '📁' },
  { id: 'gdrive', name: 'Google Drive', category: 'storage', icon: '📁' },
  { id: 'twilio', name: 'Twilio', category: 'communications', icon: '📱' },
  { id: 'sendgrid', name: 'SendGrid', category: 'communications', icon: '📧' },
  { id: 'zapier', name: 'Zapier', category: 'automation', icon: '⚡' },
] as const;

export type AvailableIntegrationId = typeof AVAILABLE_INTEGRATIONS[number]['id'];
