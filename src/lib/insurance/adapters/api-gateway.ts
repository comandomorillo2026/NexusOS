/**
 * API Gateway Adapter for Legacy System Integration
 * Supports REST API wrapper for legacy systems, SOAP to REST transformation,
 * rate limiting, and authentication bridge
 */

import {
  IIntegrationAdapter,
  ConnectionStatus,
  SyncOperation,
  SyncOptions,
  IntegrationError,
} from '../integration-framework';

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface APIGatewayConfig {
  baseUrl: string;
  apiKey?: string;
  apiSecret?: string;
  authType: 'none' | 'basic' | 'bearer' | 'api-key' | 'oauth2' | 'custom';
  authConfig?: AuthConfig;
  timeout?: number;
  defaultHeaders?: Record<string, string>;
  rateLimit?: RateLimitConfig;
  retryPolicy?: {
    maxRetries: number;
    retryDelay: number;
    retryableStatusCodes: number[];
  };
}

export interface AuthConfig {
  // Basic auth
  username?: string;
  password?: string;

  // Bearer token
  token?: string;

  // API Key
  headerName?: string;

  // OAuth2
  tokenUrl?: string;
  clientId?: string;
  clientSecret?: string;
  scopes?: string[];

  // Custom
  customAuth?: (request: APIRequest) => Promise<APIRequest>;
}

export interface RateLimitConfig {
  requestsPerSecond?: number;
  requestsPerMinute?: number;
  requestsPerHour?: number;
  burstLimit?: number;
  retryAfterHeader?: string;
}

export interface APIRequest {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  headers?: Record<string, string>;
  query?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

export interface APIResponse<T = unknown> {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: T;
  duration: number;
}

export interface SOAPOperation {
  name: string;
  namespace: string;
  soapAction: string;
  input: SOAPParameter[];
  output: SOAPParameter[];
}

export interface SOAPParameter {
  name: string;
  type: string;
  minOccurs?: number;
  maxOccurs?: number;
  namespace?: string;
}

export interface SOAPRequest {
  operation: string;
  namespace: string;
  parameters: Record<string, unknown>;
  headers?: { name: string; value: unknown }[];
}

export interface SOAPResponse {
  operation: string;
  result: Record<string, unknown>;
  fault?: {
    faultCode: string;
    faultString: string;
    detail?: unknown;
  };
}

export interface RateLimitStatus {
  isLimited: boolean;
  remainingRequests: number;
  resetTime?: Date;
  retryAfter?: number;
}

export interface APITransformation {
  path: string;
  method: string;
  targetUrl: string;
  requestTransform?: (request: APIRequest) => APIRequest;
  responseTransform?: (response: APIResponse) => APIResponse;
  soapOperation?: string;
  soapNamespace?: string;
}

export interface AuditLogEntry {
  timestamp: Date;
  method: string;
  path: string;
  statusCode: number;
  duration: number;
  userId?: string;
  ipAddress?: string;
  error?: string;
}

// ============================================================================
// API Gateway Adapter Implementation
// ============================================================================

export class APIGatewayAdapter implements IIntegrationAdapter {
  private config: APIGatewayConfig;
  private connectionStatus: ConnectionStatus;
  private isConnected: boolean = false;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;
  private rateLimitState: RateLimitState;
  private soapOperations: Map<string, SOAPOperation> = new Map();
  private transformations: Map<string, APITransformation> = new Map();
  private auditLog: AuditLogEntry[] = [];

  constructor(config: APIGatewayConfig) {
    this.config = config;
    this.connectionStatus = {
      id: `api-${Date.now()}`,
      integrationId: '',
      status: 'disconnected',
    };
    this.rateLimitState = {
      requestCount: 0,
      windowStart: Date.now(),
      isThrottled: false,
    };
  }

  // Connection Management
  async connect(): Promise<ConnectionStatus> {
    this.connectionStatus.status = 'connecting';

    try {
      // Authenticate if needed
      if (this.config.authType !== 'none') {
        await this.authenticate();
      }

      // Test connection
      await this.testEndpoint();

      this.isConnected = true;
      this.connectionStatus.status = 'connected';
      this.connectionStatus.lastConnected = new Date();
      this.connectionStatus.latency = await this.measureLatency();

      return this.connectionStatus;
    } catch (error) {
      this.connectionStatus.status = 'error';
      this.connectionStatus.lastError = error instanceof Error ? error.message : 'Connection failed';
      throw new IntegrationError('CONNECTION_FAILED', this.connectionStatus.lastError);
    }
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    this.accessToken = null;
    this.tokenExpiry = null;
    this.connectionStatus.status = 'disconnected';
  }

  async testConnection(): Promise<{ success: boolean; latency: number; error?: string }> {
    const start = Date.now();
    try {
      await this.testEndpoint();
      return { success: true, latency: Date.now() - start };
    } catch (error) {
      return {
        success: false,
        latency: Date.now() - start,
        error: error instanceof Error ? error.message : 'Connection test failed',
      };
    }
  }

  getStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  // Data Operations
  async query<T>(query: string, params?: Record<string, unknown>): Promise<T[]> {
    if (!this.isConnected) {
      throw new IntegrationError('NOT_CONNECTED', 'Not connected to API gateway');
    }

    // Parse query as endpoint path
    const response = await this.request<T[]>({
      method: 'GET',
      path: query,
      query: params as Record<string, string>,
    });

    return response.data;
  }

  async execute(command: string, params?: Record<string, unknown>): Promise<{ affected: number; data?: unknown }> {
    if (!this.isConnected) {
      throw new IntegrationError('NOT_CONNECTED', 'Not connected to API gateway');
    }

    const response = await this.request({
      method: 'POST',
      path: command,
      body: params,
    });

    return {
      affected: response.status >= 200 && response.status < 300 ? 1 : 0,
      data: response.data,
    };
  }

  // Transaction Support (API typically doesn't support traditional transactions)
  async beginTransaction(): Promise<string> {
    return `TXN-${Date.now()}`;
  }

  async commitTransaction(transactionId: string): Promise<void> {
    console.log(`Transaction ${transactionId} committed`);
  }

  async rollbackTransaction(transactionId: string): Promise<void> {
    console.log(`Transaction ${transactionId} rolled back`);
  }

  // Sync Operations
  async syncImport(entityType: string, options?: SyncOptions): Promise<SyncOperation> {
    const syncOp: SyncOperation = {
      id: `sync-import-${Date.now()}`,
      integrationId: this.connectionStatus.integrationId,
      direction: 'import',
      entityType,
      status: 'running',
      startedAt: new Date(),
      totalRecords: 0,
      processedRecords: 0,
      successCount: 0,
      errorCount: 0,
      errors: [],
    };

    try {
      // Fetch data from legacy API
      const endpoint = this.getEndpointForEntity(entityType);
      const response = await this.request<{ data: unknown[]; total: number }>({
        method: 'GET',
        path: endpoint,
        query: options?.filter as Record<string, string>,
      });

      const records = response.data.data || [];
      syncOp.totalRecords = records.length;

      for (let i = 0; i < records.length; i++) {
        try {
          // Process record
          syncOp.processedRecords++;
          syncOp.successCount++;

          if (options?.onProgress) {
            options.onProgress({
              total: syncOp.totalRecords,
              processed: syncOp.processedRecords,
              success: syncOp.successCount,
              errors: syncOp.errorCount,
              currentBatch: Math.floor(syncOp.processedRecords / (options.batchSize || 100)) + 1,
              totalBatches: Math.ceil(syncOp.totalRecords / (options.batchSize || 100)),
            });
          }
        } catch (error) {
          syncOp.errorCount++;
          syncOp.errors.push({
            recordId: `record-${i}`,
            code: 'PROCESSING_ERROR',
            message: error instanceof Error ? error.message : 'Processing failed',
            severity: 'error',
            timestamp: new Date(),
          });
        }
      }

      syncOp.status = syncOp.errorCount > 0 ? 'partial' : 'completed';
      syncOp.completedAt = new Date();
    } catch (error) {
      syncOp.status = 'failed';
      syncOp.completedAt = new Date();
      syncOp.errors.push({
        code: 'SYNC_FAILED',
        message: error instanceof Error ? error.message : 'Import failed',
        severity: 'critical',
        timestamp: new Date(),
      });
    }

    return syncOp;
  }

  async syncExport(entityType: string, data: unknown[], options?: SyncOptions): Promise<SyncOperation> {
    const syncOp: SyncOperation = {
      id: `sync-export-${Date.now()}`,
      integrationId: this.connectionStatus.integrationId,
      direction: 'export',
      entityType,
      status: 'running',
      startedAt: new Date(),
      totalRecords: data.length,
      processedRecords: 0,
      successCount: 0,
      errorCount: 0,
      errors: [],
    };

    try {
      const batchSize = options?.batchSize || 50;
      const batches = this.chunkArray(data, batchSize);

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        const endpoint = this.getEndpointForEntity(entityType);

        try {
          await this.request({
            method: 'POST',
            path: endpoint,
            body: { records: batch },
          });

          syncOp.processedRecords += batch.length;
          syncOp.successCount += batch.length;
        } catch (error) {
          syncOp.errorCount += batch.length;
          syncOp.errors.push({
            code: 'BATCH_ERROR',
            message: error instanceof Error ? error.message : 'Batch failed',
            severity: 'error',
            timestamp: new Date(),
          });
        }

        if (options?.onProgress) {
          options.onProgress({
            total: syncOp.totalRecords,
            processed: syncOp.processedRecords,
            success: syncOp.successCount,
            errors: syncOp.errorCount,
            currentBatch: i + 1,
            totalBatches: batches.length,
          });
        }
      }

      syncOp.status = syncOp.errorCount > 0 ? 'partial' : 'completed';
      syncOp.completedAt = new Date();
    } catch (error) {
      syncOp.status = 'failed';
      syncOp.completedAt = new Date();
      syncOp.errors.push({
        code: 'SYNC_FAILED',
        message: error instanceof Error ? error.message : 'Export failed',
        severity: 'critical',
        timestamp: new Date(),
      });
    }

    return syncOp;
  }

  // Lifecycle
  async initialize(): Promise<void> {
    console.log('Initializing API gateway adapter');
  }

  async dispose(): Promise<void> {
    await this.disconnect();
    this.soapOperations.clear();
    this.transformations.clear();
    this.auditLog = [];
  }

  // ========================================================================
  // HTTP Request Methods
  // ========================================================================

  async request<T = unknown>(apiRequest: APIRequest): Promise<APIResponse<T>> {
    // Check rate limits
    const rateLimitStatus = this.checkRateLimit();
    if (rateLimitStatus.isLimited) {
      throw new IntegrationError('RATE_LIMITED', 'Rate limit exceeded', {
        retryAfter: rateLimitStatus.retryAfter,
      });
    }

    // Apply transformations
    let request = { ...apiRequest };
    const transformationKey = `${request.method}:${request.path}`;
    const transformation = this.transformations.get(transformationKey);
    if (transformation?.requestTransform) {
      request = transformation.requestTransform(request);
    }

    // Add authentication
    request = await this.addAuthentication(request);

    // Add default headers
    request.headers = {
      ...this.config.defaultHeaders,
      ...request.headers,
    };

    const start = Date.now();

    try {
      // Simulate HTTP request
      const response = await this.simulateRequest<T>(request);

      // Apply response transformation
      if (transformation?.responseTransform) {
        return transformation.responseTransform(response);
      }

      return response;
    } catch (error) {
      const duration = Date.now() - start;
      this.addAuditLog(request.method, request.path, 0, duration, error instanceof Error ? error.message : 'Request failed');
      throw error;
    } finally {
      // Update rate limit counter
      this.rateLimitState.requestCount++;
    }
  }

  async get<T = unknown>(path: string, query?: Record<string, string>): Promise<APIResponse<T>> {
    return this.request<T>({ method: 'GET', path, query });
  }

  async post<T = unknown>(path: string, body?: unknown): Promise<APIResponse<T>> {
    return this.request<T>({ method: 'POST', path, body });
  }

  async put<T = unknown>(path: string, body?: unknown): Promise<APIResponse<T>> {
    return this.request<T>({ method: 'PUT', path, body });
  }

  async patch<T = unknown>(path: string, body?: unknown): Promise<APIResponse<T>> {
    return this.request<T>({ method: 'PATCH', path, body });
  }

  async delete<T = unknown>(path: string): Promise<APIResponse<T>> {
    return this.request<T>({ method: 'DELETE', path });
  }

  // ========================================================================
  // SOAP to REST Transformation
  // ========================================================================

  registerSOAPOperation(operation: SOAPOperation): void {
    this.soapOperations.set(operation.name, operation);
  }

  async callSOAPService<T = unknown>(soapRequest: SOAPRequest): Promise<APIResponse<T>> {
    const operation = this.soapOperations.get(soapRequest.operation);
    if (!operation) {
      throw new IntegrationError('OPERATION_NOT_FOUND', `SOAP operation ${soapRequest.operation} not found`);
    }

    // Build SOAP envelope
    const soapEnvelope = this.buildSOAPEnvelope(soapRequest, operation);

    // Make SOAP request
    const response = await this.request<string>({
      method: 'POST',
      path: '/soap',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': operation.soapAction,
      },
      body: soapEnvelope,
    });

    // Parse SOAP response
    const soapResponse = this.parseSOAPResponse(response.data, soapRequest.operation);

    if (soapResponse.fault) {
      throw new IntegrationError('SOAP_FAULT', soapResponse.fault.faultString, {
        faultCode: soapResponse.fault.faultCode,
        detail: soapResponse.fault.detail,
      });
    }

    return {
      ...response,
      data: soapResponse.result as T,
    };
  }

  private buildSOAPEnvelope(request: SOAPRequest, operation: SOAPOperation): string {
    let envelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:tns="${request.namespace}">`;

    // Add SOAP headers
    if (request.headers && request.headers.length > 0) {
      envelope += '<soap:Header>';
      for (const header of request.headers) {
        envelope += `<tns:${header.name}>${this.escapeXML(String(header.value))}</tns:${header.name}>`;
      }
      envelope += '</soap:Header>';
    }

    // Add SOAP body
    envelope += `<soap:Body>
      <tns:${request.operation}>`;

    for (const [key, value] of Object.entries(request.parameters)) {
      envelope += `<tns:${key}>${this.escapeXML(String(value))}</tns:${key}>`;
    }

    envelope += `</tns:${request.operation}>
    </soap:Body>
  </soap:Envelope>`;

    return envelope;
  }

  private parseSOAPResponse(xml: string, operationName: string): SOAPResponse {
    const response: SOAPResponse = {
      operation: operationName,
      result: {},
    };

    // Check for SOAP fault
    const faultMatch = xml.match(/<faultstring>([\s\S]*?)<\/faultstring>/i);
    if (faultMatch) {
      const faultCodeMatch = xml.match(/<faultcode>([\s\S]*?)<\/faultcode>/i);
      response.fault = {
        faultCode: faultCodeMatch ? faultCodeMatch[1].trim() : 'Unknown',
        faultString: faultMatch[1].trim(),
      };
      return response;
    }

    // Parse response elements
    const resultRegex = new RegExp(`<${operationName}Response[^>]*>([\\s\\S]*?)</${operationName}Response>`, 'i');
    const resultMatch = xml.match(resultRegex);

    if (resultMatch) {
      response.result = this.parseXMLToJSON(resultMatch[1]);
    }

    return response;
  }

  private parseXMLToJSON(xml: string): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    // Simple XML to JSON conversion
    const elementRegex = /<(\w+)[^>]*>([\s\S]*?)<\/\1>/g;
    let match;

    while ((match = elementRegex.exec(xml)) !== null) {
      const name = match[1];
      const content = match[2].trim();

      // Check if content has nested elements
      if (content.includes('<')) {
        result[name] = this.parseXMLToJSON(content);
      } else {
        result[name] = content;
      }
    }

    return result;
  }

  // ========================================================================
  // Rate Limiting
  // ========================================================================

  private checkRateLimit(): RateLimitStatus {
    const config = this.config.rateLimit;
    if (!config) {
      return { isLimited: false, remainingRequests: Infinity };
    }

    const now = Date.now();
    const windowMs = 60000; // 1 minute window

    // Reset window if expired
    if (now - this.rateLimitState.windowStart > windowMs) {
      this.rateLimitState = {
        requestCount: 0,
        windowStart: now,
        isThrottled: false,
      };
    }

    const limit = config.requestsPerMinute || config.requestsPerSecond! * 60 || 100;
    const remaining = limit - this.rateLimitState.requestCount;
    const isLimited = remaining <= 0;

    if (isLimited) {
      const resetTime = new Date(this.rateLimitState.windowStart + windowMs);
      const retryAfter = Math.ceil((resetTime.getTime() - now) / 1000);

      return {
        isLimited: true,
        remainingRequests: 0,
        resetTime,
        retryAfter,
      };
    }

    return {
      isLimited: false,
      remainingRequests: remaining,
    };
  }

  getRateLimitStatus(): RateLimitStatus {
    return this.checkRateLimit();
  }

  // ========================================================================
  // Authentication Bridge
  // ========================================================================

  private async authenticate(): Promise<void> {
    switch (this.config.authType) {
      case 'oauth2':
        await this.authenticateOAuth2();
        break;
      case 'basic':
      case 'bearer':
      case 'api-key':
      case 'none':
        // These are handled in request headers
        break;
      default:
        // Custom authentication handled in addAuthentication
        break;
    }
  }

  private async authenticateOAuth2(): Promise<void> {
    const authConfig = this.config.authConfig;
    if (!authConfig?.tokenUrl || !authConfig.clientId || !authConfig.clientSecret) {
      throw new IntegrationError('AUTH_CONFIG_MISSING', 'OAuth2 configuration incomplete');
    }

    // Simulate OAuth2 token request
    const tokenResponse = await this.simulateOAuth2TokenRequest(
      authConfig.tokenUrl,
      authConfig.clientId,
      authConfig.clientSecret,
      authConfig.scopes
    );

    this.accessToken = tokenResponse.access_token;
    this.tokenExpiry = new Date(Date.now() + tokenResponse.expires_in * 1000);
  }

  private async addAuthentication(request: APIRequest): Promise<APIRequest> {
    const authConfig = this.config.authConfig || {};

    switch (this.config.authType) {
      case 'basic':
        request.headers = {
          ...request.headers,
          Authorization: `Basic ${Buffer.from(`${authConfig.username}:${authConfig.password}`).toString('base64')}`,
        };
        break;

      case 'bearer':
        request.headers = {
          ...request.headers,
          Authorization: `Bearer ${authConfig.token || this.accessToken}`,
        };
        break;

      case 'api-key':
        const headerName = authConfig.headerName || 'X-API-Key';
        request.headers = {
          ...request.headers,
          [headerName]: this.config.apiKey || '',
        };
        break;

      case 'oauth2':
        // Check if token needs refresh
        if (this.tokenExpiry && this.tokenExpiry.getTime() < Date.now() + 60000) {
          await this.authenticateOAuth2();
        }
        request.headers = {
          ...request.headers,
          Authorization: `Bearer ${this.accessToken}`,
        };
        break;

      case 'custom':
        if (authConfig.customAuth) {
          request = await authConfig.customAuth(request);
        }
        break;
    }

    return request;
  }

  // ========================================================================
  // Transformation Registry
  // ========================================================================

  registerTransformation(transformation: APITransformation): void {
    const key = `${transformation.method}:${transformation.path}`;
    this.transformations.set(key, transformation);
  }

  getTransformation(method: string, path: string): APITransformation | undefined {
    return this.transformations.get(`${method}:${path}`);
  }

  // ========================================================================
  // Audit Logging
  // ========================================================================

  private addAuditLog(method: string, path: string, statusCode: number, duration: number, error?: string): void {
    this.auditLog.push({
      timestamp: new Date(),
      method,
      path,
      statusCode,
      duration,
      error,
    });

    // Keep only last 1000 entries
    if (this.auditLog.length > 1000) {
      this.auditLog = this.auditLog.slice(-1000);
    }
  }

  getAuditLog(limit: number = 100): AuditLogEntry[] {
    return this.auditLog.slice(-limit);
  }

  // ========================================================================
  // Helper Methods
  // ========================================================================

  private async testEndpoint(): Promise<void> {
    await this.simulateRequest({ method: 'GET', path: '/health' });
  }

  private async measureLatency(): Promise<number> {
    const start = Date.now();
    await this.simulateRequest({ method: 'GET', path: '/health' });
    return Date.now() - start;
  }

  private getEndpointForEntity(entityType: string): string {
    const endpoints: Record<string, string> = {
      policy: '/api/v1/policies',
      claim: '/api/v1/claims',
      customer: '/api/v1/customers',
      agent: '/api/v1/agents',
      product: '/api/v1/products',
    };
    return endpoints[entityType.toLowerCase()] || `/api/v1/${entityType.toLowerCase()}s`;
  }

  private escapeXML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  // ========================================================================
  // Simulation Methods (for demo purposes)
  // ========================================================================

  private async simulateRequest<T>(request: APIRequest): Promise<APIResponse<T>> {
    const start = Date.now();
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));

    // Simulate various responses based on path
    const path = request.path.toLowerCase();

    let data: unknown;
    let status = 200;

    if (path.includes('health')) {
      data = { status: 'ok', timestamp: new Date().toISOString() };
    } else if (path.includes('policies')) {
      data = this.generateMockPolicies();
    } else if (path.includes('claims')) {
      data = this.generateMockClaims();
    } else if (path.includes('customers')) {
      data = this.generateMockCustomers();
    } else if (path === '/soap') {
      // SOAP response simulation
      data = this.generateMockSOAPResponse(request.body as string);
    } else {
      data = { success: true };
    }

    const duration = Date.now() - start;
    this.addAuditLog(request.method, request.path, status, duration);

    return {
      status,
      statusText: 'OK',
      headers: {
        'content-type': 'application/json',
        'x-request-id': `req-${Date.now()}`,
      },
      data: data as T,
      duration,
    };
  }

  private async simulateOAuth2TokenRequest(
    tokenUrl: string,
    clientId: string,
    clientSecret: string,
    scopes?: string[]
  ): Promise<{ access_token: string; expires_in: number; token_type: string }> {
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      access_token: `mock-token-${Date.now()}`,
      expires_in: 3600,
      token_type: 'Bearer',
    };
  }

  private generateMockPolicies(): { data: unknown[]; total: number } {
    const policies = [];
    for (let i = 0; i < 20; i++) {
      policies.push({
        id: `pol-${i + 1}`,
        policyNumber: `POL-2024-${(1000 + i).toString().padStart(6, '0')}`,
        insuredName: `Customer ${i + 1}`,
        lineOfBusiness: ['LIFE', 'HEALTH', 'MOTOR', 'PROPERTY'][i % 4],
        premiumAmount: Math.floor(Math.random() * 10000) + 1000,
        sumInsured: Math.floor(Math.random() * 1000000) + 100000,
        effectiveDate: new Date().toISOString().split('T')[0],
        status: 'active',
      });
    }
    return { data: policies, total: policies.length };
  }

  private generateMockClaims(): { data: unknown[]; total: number } {
    const claims = [];
    for (let i = 0; i < 15; i++) {
      claims.push({
        id: `clm-${i + 1}`,
        claimNumber: `CLM-2024-${(1000 + i).toString().padStart(6, '0')}`,
        policyNumber: `POL-2024-${(1000 + (i % 10)).toString().padStart(6, '0')}`,
        claimDate: new Date().toISOString().split('T')[0],
        claimAmount: Math.floor(Math.random() * 50000) + 1000,
        status: ['open', 'in_review', 'approved', 'paid'][i % 4],
      });
    }
    return { data: claims, total: claims.length };
  }

  private generateMockCustomers(): { data: unknown[]; total: number } {
    const customers = [];
    for (let i = 0; i < 25; i++) {
      customers.push({
        id: `cus-${i + 1}`,
        customerId: `CUS-${(1000 + i).toString().padStart(6, '0')}`,
        firstName: `First${i + 1}`,
        lastName: `Last${i + 1}`,
        email: `customer${i + 1}@email.com`,
        phone: `868-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
      });
    }
    return { data: customers, total: customers.length };
  }

  private generateMockSOAPResponse(soapRequest: string): string {
    const operationMatch = soapRequest.match(/<tns:(\w+)>/);
    const operation = operationMatch ? operationMatch[1] : 'Unknown';

    return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:tns="http://tempuri.org/">
  <soap:Body>
    <tns:${operation}Response>
      <tns:Result>Success</tns:Result>
      <tns:Data>
        <tns:Id>MOCK-001</tns:Id>
        <tns:Status>Completed</tns:Status>
        <tns:Timestamp>${new Date().toISOString()}</tns:Timestamp>
      </tns:Data>
    </tns:${operation}Response>
  </soap:Body>
</soap:Envelope>`;
  }
}

// ============================================================================
// Rate Limit State
// ============================================================================

interface RateLimitState {
  requestCount: number;
  windowStart: number;
  isThrottled: boolean;
}

// ============================================================================
// Export Factory Function
// ============================================================================

export function createAPIGatewayAdapter(config: APIGatewayConfig): APIGatewayAdapter {
  return new APIGatewayAdapter(config);
}
