/**
 * Legacy System Integration Framework
 * Base integration interface for NexusOS Insurance Platform
 * Supports connection management, data transformation, error handling, and transactions
 */

// ============================================================================
// Core Types and Interfaces
// ============================================================================

export interface IntegrationConfig {
  id: string;
  name: string;
  type: 'mainframe' | 'as400' | 'file' | 'api' | 'database';
  description?: string;
  connectionConfig: Record<string, unknown>;
  retryPolicy?: RetryPolicy;
  timeout?: number;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RetryPolicy {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}

export interface ConnectionStatus {
  id: string;
  integrationId: string;
  status: 'connected' | 'disconnected' | 'error' | 'connecting' | 'maintenance';
  lastConnected?: Date;
  lastError?: string;
  latency?: number;
  metadata?: Record<string, unknown>;
}

export interface DataTransformation {
  id: string;
  name: string;
  sourceFormat: string;
  targetFormat: string;
  mappings: FieldMapping[];
  transformations: CustomTransformation[];
  validation: ValidationRule[];
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transform?: 'uppercase' | 'lowercase' | 'trim' | 'format' | 'custom';
  customTransform?: string;
  defaultValue?: unknown;
  required: boolean;
}

export interface CustomTransformation {
  field: string;
  type: 'script' | 'lookup' | 'concat' | 'split' | 'math' | 'date';
  config: Record<string, unknown>;
}

export interface ValidationRule {
  field: string;
  type: 'required' | 'format' | 'range' | 'custom' | 'unique';
  config: Record<string, unknown>;
  errorMessage: string;
}

// ============================================================================
// Transaction Support
// ============================================================================

export interface IntegrationTransaction {
  id: string;
  integrationId: string;
  operation: 'create' | 'update' | 'delete' | 'sync';
  entityType: string;
  entityId?: string;
  data: Record<string, unknown>;
  originalData?: Record<string, unknown>;
  status: 'pending' | 'committed' | 'rolled_back' | 'failed';
  createdAt: Date;
  committedAt?: Date;
  rolledBackAt?: Date;
  error?: string;
  retryCount: number;
  auditTrail: AuditEntry[];
}

export interface AuditEntry {
  timestamp: Date;
  action: string;
  userId?: string;
  userEmail?: string;
  details: Record<string, unknown>;
  ipAddress?: string;
}

// ============================================================================
// Sync Operations
// ============================================================================

export interface SyncOperation {
  id: string;
  integrationId: string;
  direction: 'import' | 'export' | 'bidirectional';
  entityType: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'partial';
  startedAt?: Date;
  completedAt?: Date;
  totalRecords: number;
  processedRecords: number;
  successCount: number;
  errorCount: number;
  errors: SyncError[];
  mapping?: DataTransformation;
}

export interface SyncError {
  recordId?: string;
  field?: string;
  code: string;
  message: string;
  severity: 'warning' | 'error' | 'critical';
  timestamp: Date;
  rawData?: unknown;
}

// ============================================================================
// Base Integration Interface
// ============================================================================

export interface IIntegrationAdapter {
  // Connection Management
  connect(): Promise<ConnectionStatus>;
  disconnect(): Promise<void>;
  testConnection(): Promise<{ success: boolean; latency: number; error?: string }>;
  getStatus(): ConnectionStatus;

  // Data Operations
  query<T>(query: string, params?: Record<string, unknown>): Promise<T[]>;
  execute(command: string, params?: Record<string, unknown>): Promise<{ affected: number; data?: unknown }>;

  // Transaction Support
  beginTransaction(): Promise<string>;
  commitTransaction(transactionId: string): Promise<void>;
  rollbackTransaction(transactionId: string): Promise<void>;

  // Sync Operations
  syncImport(entityType: string, options?: SyncOptions): Promise<SyncOperation>;
  syncExport(entityType: string, data: unknown[], options?: SyncOptions): Promise<SyncOperation>;

  // Lifecycle
  initialize(): Promise<void>;
  dispose(): Promise<void>;
}

export interface SyncOptions {
  batchSize?: number;
  filter?: Record<string, unknown>;
  mapping?: DataTransformation;
  dryRun?: boolean;
  onProgress?: (progress: SyncProgress) => void;
}

export interface SyncProgress {
  total: number;
  processed: number;
  success: number;
  errors: number;
  currentBatch: number;
  totalBatches: number;
}

// ============================================================================
// Integration Framework Implementation
// ============================================================================

export class IntegrationFramework {
  private connections: Map<string, IIntegrationAdapter> = new Map();
  private configs: Map<string, IntegrationConfig> = new Map();
  private transactions: Map<string, IntegrationTransaction> = new Map();
  private syncOperations: Map<string, SyncOperation> = new Map();
  private auditLog: AuditEntry[] = [];
  private eventListeners: Map<string, Set<(event: IntegrationEvent) => void>> = new Map();

  // Connection Management
  async registerIntegration(config: IntegrationConfig): Promise<void> {
    this.configs.set(config.id, config);
    this.addAuditEntry(config.id, 'integration_registered', {
      name: config.name,
      type: config.type,
    });
    this.emit('integration:registered', { integrationId: config.id, config });
  }

  async unregisterIntegration(integrationId: string): Promise<void> {
    const adapter = this.connections.get(integrationId);
    if (adapter) {
      await adapter.dispose();
      this.connections.delete(integrationId);
    }
    this.configs.delete(integrationId);
    this.addAuditEntry(integrationId, 'integration_unregistered', {});
    this.emit('integration:unregistered', { integrationId });
  }

  async connect(integrationId: string): Promise<ConnectionStatus> {
    const config = this.configs.get(integrationId);
    if (!config) {
      throw new IntegrationError('INTEGRATION_NOT_FOUND', `Integration ${integrationId} not found`);
    }

    if (!config.enabled) {
      throw new IntegrationError('INTEGRATION_DISABLED', `Integration ${integrationId} is disabled`);
    }

    const adapter = this.connections.get(integrationId);
    if (!adapter) {
      throw new IntegrationError('ADAPTER_NOT_FOUND', `No adapter registered for ${integrationId}`);
    }

    this.addAuditEntry(integrationId, 'connection_attempt', {});
    this.emit('connection:attempt', { integrationId });

    try {
      const status = await adapter.connect();
      this.addAuditEntry(integrationId, 'connection_established', { status });
      this.emit('connection:established', { integrationId, status });
      return status;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.addAuditEntry(integrationId, 'connection_failed', { error: errorMessage });
      this.emit('connection:failed', { integrationId, error: errorMessage });
      throw new IntegrationError('CONNECTION_FAILED', errorMessage);
    }
  }

  async disconnect(integrationId: string): Promise<void> {
    const adapter = this.connections.get(integrationId);
    if (adapter) {
      await adapter.disconnect();
      this.addAuditEntry(integrationId, 'disconnected', {});
      this.emit('connection:disconnected', { integrationId });
    }
  }

  async testConnection(integrationId: string): Promise<{ success: boolean; latency: number; error?: string }> {
    const adapter = this.connections.get(integrationId);
    if (!adapter) {
      return { success: false, latency: 0, error: 'Adapter not found' };
    }

    const result = await adapter.testConnection();
    this.addAuditEntry(integrationId, 'connection_tested', result);
    return result;
  }

  registerAdapter(integrationId: string, adapter: IIntegrationAdapter): void {
    this.connections.set(integrationId, adapter);
  }

  getAdapter(integrationId: string): IIntegrationAdapter | undefined {
    return this.connections.get(integrationId);
  }

  // Data Transformation Pipeline
  createTransformationPipeline(transformation: DataTransformation): DataTransformationPipeline {
    return new DataTransformationPipeline(transformation);
  }

  // Transaction Support
  async beginTransaction(integrationId: string, operation: IntegrationTransaction['operation'], entityType: string, data: Record<string, unknown>): Promise<string> {
    const adapter = this.connections.get(integrationId);
    if (!adapter) {
      throw new IntegrationError('ADAPTER_NOT_FOUND', `No adapter for ${integrationId}`);
    }

    const transactionId = await adapter.beginTransaction();
    const transaction: IntegrationTransaction = {
      id: transactionId,
      integrationId,
      operation,
      entityType,
      data,
      status: 'pending',
      createdAt: new Date(),
      retryCount: 0,
      auditTrail: [],
    };

    this.transactions.set(transactionId, transaction);
    this.addAuditEntry(integrationId, 'transaction_started', { transactionId, operation, entityType });
    this.emit('transaction:started', { transactionId, integrationId });

    return transactionId;
  }

  async commitTransaction(transactionId: string): Promise<void> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      throw new IntegrationError('TRANSACTION_NOT_FOUND', `Transaction ${transactionId} not found`);
    }

    const adapter = this.connections.get(transaction.integrationId);
    if (!adapter) {
      throw new IntegrationError('ADAPTER_NOT_FOUND', 'No adapter for transaction');
    }

    try {
      await adapter.commitTransaction(transactionId);
      transaction.status = 'committed';
      transaction.committedAt = new Date();
      this.addAuditEntry(transaction.integrationId, 'transaction_committed', { transactionId });
      this.emit('transaction:committed', { transactionId, integrationId: transaction.integrationId });
    } catch (error) {
      transaction.status = 'failed';
      transaction.error = error instanceof Error ? error.message : 'Commit failed';
      this.addAuditEntry(transaction.integrationId, 'transaction_commit_failed', { transactionId, error: transaction.error });
      this.emit('transaction:failed', { transactionId, integrationId: transaction.integrationId, error: transaction.error });
      throw error;
    }
  }

  async rollbackTransaction(transactionId: string): Promise<void> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      throw new IntegrationError('TRANSACTION_NOT_FOUND', `Transaction ${transactionId} not found`);
    }

    const adapter = this.connections.get(transaction.integrationId);
    if (!adapter) {
      throw new IntegrationError('ADAPTER_NOT_FOUND', 'No adapter for transaction');
    }

    try {
      await adapter.rollbackTransaction(transactionId);
      transaction.status = 'rolled_back';
      transaction.rolledBackAt = new Date();
      this.addAuditEntry(transaction.integrationId, 'transaction_rolled_back', { transactionId });
      this.emit('transaction:rolled_back', { transactionId, integrationId: transaction.integrationId });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Rollback failed';
      this.addAuditEntry(transaction.integrationId, 'transaction_rollback_failed', { transactionId, error: errorMessage });
      this.emit('transaction:rollback_failed', { transactionId, integrationId: transaction.integrationId, error: errorMessage });
      throw error;
    }
  }

  // Sync Operations with Retry Logic
  async syncImport(
    integrationId: string,
    entityType: string,
    options?: SyncOptions
  ): Promise<SyncOperation> {
    const config = this.configs.get(integrationId);
    const adapter = this.connections.get(integrationId);

    if (!adapter || !config) {
      throw new IntegrationError('INTEGRATION_NOT_FOUND', `Integration ${integrationId} not found`);
    }

    const syncOp: SyncOperation = {
      id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      integrationId,
      direction: 'import',
      entityType,
      status: 'pending',
      totalRecords: 0,
      processedRecords: 0,
      successCount: 0,
      errorCount: 0,
      errors: [],
      mapping: options?.mapping,
    };

    this.syncOperations.set(syncOp.id, syncOp);
    this.addAuditEntry(integrationId, 'sync_import_started', { syncId: syncOp.id, entityType });
    this.emit('sync:started', { syncId: syncOp.id, integrationId, direction: 'import' });

    try {
      syncOp.status = 'running';
      syncOp.startedAt = new Date();

      const result = await this.executeWithRetry(
        () => adapter.syncImport(entityType, options),
        config.retryPolicy
      );

      Object.assign(syncOp, result);
      syncOp.status = syncOp.errorCount > 0 && syncOp.successCount > 0 ? 'partial' : 'completed';
      syncOp.completedAt = new Date();

      this.addAuditEntry(integrationId, 'sync_import_completed', {
        syncId: syncOp.id,
        successCount: syncOp.successCount,
        errorCount: syncOp.errorCount,
      });
      this.emit('sync:completed', { syncId: syncOp.id, integrationId });
    } catch (error) {
      syncOp.status = 'failed';
      syncOp.completedAt = new Date();
      const errorMessage = error instanceof Error ? error.message : 'Sync failed';
      syncOp.errors.push({
        code: 'SYNC_FAILED',
        message: errorMessage,
        severity: 'critical',
        timestamp: new Date(),
      });

      this.addAuditEntry(integrationId, 'sync_import_failed', { syncId: syncOp.id, error: errorMessage });
      this.emit('sync:failed', { syncId: syncOp.id, integrationId, error: errorMessage });
    }

    return syncOp;
  }

  async syncExport(
    integrationId: string,
    entityType: string,
    data: unknown[],
    options?: SyncOptions
  ): Promise<SyncOperation> {
    const config = this.configs.get(integrationId);
    const adapter = this.connections.get(integrationId);

    if (!adapter || !config) {
      throw new IntegrationError('INTEGRATION_NOT_FOUND', `Integration ${integrationId} not found`);
    }

    const syncOp: SyncOperation = {
      id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      integrationId,
      direction: 'export',
      entityType,
      status: 'pending',
      totalRecords: data.length,
      processedRecords: 0,
      successCount: 0,
      errorCount: 0,
      errors: [],
      mapping: options?.mapping,
    };

    this.syncOperations.set(syncOp.id, syncOp);
    this.addAuditEntry(integrationId, 'sync_export_started', { syncId: syncOp.id, entityType, recordCount: data.length });
    this.emit('sync:started', { syncId: syncOp.id, integrationId, direction: 'export' });

    try {
      syncOp.status = 'running';
      syncOp.startedAt = new Date();

      const result = await this.executeWithRetry(
        () => adapter.syncExport(entityType, data, options),
        config.retryPolicy
      );

      Object.assign(syncOp, result);
      syncOp.status = syncOp.errorCount > 0 && syncOp.successCount > 0 ? 'partial' : 'completed';
      syncOp.completedAt = new Date();

      this.addAuditEntry(integrationId, 'sync_export_completed', {
        syncId: syncOp.id,
        successCount: syncOp.successCount,
        errorCount: syncOp.errorCount,
      });
      this.emit('sync:completed', { syncId: syncOp.id, integrationId });
    } catch (error) {
      syncOp.status = 'failed';
      syncOp.completedAt = new Date();
      const errorMessage = error instanceof Error ? error.message : 'Sync failed';
      syncOp.errors.push({
        code: 'SYNC_FAILED',
        message: errorMessage,
        severity: 'critical',
        timestamp: new Date(),
      });

      this.addAuditEntry(integrationId, 'sync_export_failed', { syncId: syncOp.id, error: errorMessage });
      this.emit('sync:failed', { syncId: syncOp.id, integrationId, error: errorMessage });
    }

    return syncOp;
  }

  // Retry Logic
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    retryPolicy?: RetryPolicy
  ): Promise<T> {
    const policy = retryPolicy || {
      maxRetries: 3,
      initialDelayMs: 1000,
      maxDelayMs: 30000,
      backoffMultiplier: 2,
      retryableErrors: ['CONNECTION_ERROR', 'TIMEOUT', 'NETWORK_ERROR'],
    };

    let lastError: Error | null = null;
    let delay = policy.initialDelayMs;

    for (let attempt = 0; attempt <= policy.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        const errorCode = (error as IntegrationError).code || 'UNKNOWN_ERROR';

        if (attempt < policy.maxRetries && policy.retryableErrors.includes(errorCode)) {
          await this.sleep(delay);
          delay = Math.min(delay * policy.backoffMultiplier, policy.maxDelayMs);
        } else {
          break;
        }
      }
    }

    throw lastError || new Error('Operation failed after retries');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Audit Trail
  private addAuditEntry(integrationId: string, action: string, details: Record<string, unknown>): void {
    const entry: AuditEntry = {
      timestamp: new Date(),
      action,
      details: {
        integrationId,
        ...details,
      },
    };
    this.auditLog.push(entry);

    // Keep only last 10000 entries
    if (this.auditLog.length > 10000) {
      this.auditLog = this.auditLog.slice(-10000);
    }
  }

  getAuditLog(integrationId?: string, limit: number = 100): AuditEntry[] {
    let logs = this.auditLog;
    if (integrationId) {
      logs = logs.filter(log => log.details.integrationId === integrationId);
    }
    return logs.slice(-limit);
  }

  // Event System
  on(event: string, listener: (event: IntegrationEvent) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  off(event: string, listener: (event: IntegrationEvent) => void): void {
    this.eventListeners.get(event)?.delete(listener);
  }

  private emit(event: string, data: Record<string, unknown>): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener({ event, timestamp: new Date(), data }));
    }
  }

  // Status and Monitoring
  getIntegrationStatus(integrationId: string): { config: IntegrationConfig; status?: ConnectionStatus } | null {
    const config = this.configs.get(integrationId);
    if (!config) return null;

    const adapter = this.connections.get(integrationId);
    return {
      config,
      status: adapter?.getStatus(),
    };
  }

  getAllIntegrations(): IntegrationConfig[] {
    return Array.from(this.configs.values());
  }

  getSyncOperation(syncId: string): SyncOperation | undefined {
    return this.syncOperations.get(syncId);
  }

  getActiveSyncOperations(): SyncOperation[] {
    return Array.from(this.syncOperations.values()).filter(
      op => op.status === 'running' || op.status === 'pending'
    );
  }
}

// ============================================================================
// Data Transformation Pipeline
// ============================================================================

export class DataTransformationPipeline {
  private transformation: DataTransformation;
  private lookupTables: Map<string, Map<unknown, unknown>> = new Map();

  constructor(transformation: DataTransformation) {
    this.transformation = transformation;
  }

  registerLookupTable(name: string, table: Map<unknown, unknown>): void {
    this.lookupTables.set(name, table);
  }

  async transform(data: Record<string, unknown>[]): Promise<{ data: Record<string, unknown>[]; errors: TransformError[] }> {
    const results: Record<string, unknown>[] = [];
    const errors: TransformError[] = [];

    for (let i = 0; i < data.length; i++) {
      try {
        const result = await this.transformRecord(data[i], i);
        const validationErrors = this.validateRecord(result, i);
        if (validationErrors.length > 0) {
          errors.push(...validationErrors);
        } else {
          results.push(result);
        }
      } catch (error) {
        errors.push({
          recordIndex: i,
          message: error instanceof Error ? error.message : 'Transform failed',
          code: 'TRANSFORM_ERROR',
        });
      }
    }

    return { data: results, errors };
  }

  private async transformRecord(record: Record<string, unknown>, index: number): Promise<Record<string, unknown>> {
    const result: Record<string, unknown> = {};

    for (const mapping of this.transformation.mappings) {
      let value = this.getNestedValue(record, mapping.sourceField);

      // Apply default value
      if (value === undefined || value === null) {
        if (mapping.defaultValue !== undefined) {
          value = mapping.defaultValue;
        } else if (mapping.required) {
          throw new IntegrationError('REQUIRED_FIELD_MISSING', `Field ${mapping.sourceField} is required`);
        }
      }

      // Apply transformation
      if (value !== undefined && value !== null) {
        value = this.applyTransform(value, mapping);
      }

      this.setNestedValue(result, mapping.targetField, value);
    }

    // Apply custom transformations
    for (const transform of this.transformation.transformations) {
      await this.applyCustomTransformation(result, transform);
    }

    return result;
  }

  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((current: unknown, key: string) => {
      if (current && typeof current === 'object') {
        return (current as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj);
  }

  private setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current)) {
        current[keys[i]] = {};
      }
      current = current[keys[i]] as Record<string, unknown>;
    }
    current[keys[keys.length - 1]] = value;
  }

  private applyTransform(value: unknown, mapping: FieldMapping): unknown {
    if (!mapping.transform) return value;

    switch (mapping.transform) {
      case 'uppercase':
        return typeof value === 'string' ? value.toUpperCase() : value;
      case 'lowercase':
        return typeof value === 'string' ? value.toLowerCase() : value;
      case 'trim':
        return typeof value === 'string' ? value.trim() : value;
      case 'format':
        return this.formatValue(value, mapping.customTransform);
      case 'custom':
        return this.applyCustomTransform(value, mapping.customTransform);
      default:
        return value;
    }
  }

  private formatValue(value: unknown, format?: string): unknown {
    if (!format) return value;
    // Simple format string replacement
    return format.replace('{}', String(value));
  }

  private applyCustomTransform(value: unknown, transform?: string): unknown {
    if (!transform) return value;
    // In production, this would use a safe expression evaluator
    // For demo, we support simple operations
    if (transform.startsWith('lookup:')) {
      const tableName = transform.substring(7);
      const table = this.lookupTables.get(tableName);
      return table?.get(value) ?? value;
    }
    return value;
  }

  private async applyCustomTransformation(record: Record<string, unknown>, transform: CustomTransformation): Promise<void> {
    const value = record[transform.field];
    if (value === undefined) return;

    switch (transform.type) {
      case 'lookup': {
        const tableName = transform.config.table as string;
        const table = this.lookupTables.get(tableName);
        if (table) {
          record[transform.field] = table.get(value) ?? value;
        }
        break;
      }
      case 'concat': {
        const fields = transform.config.fields as string[];
        const separator = transform.config.separator as string ?? '';
        record[transform.field] = fields
          .map(f => record[f])
          .filter(v => v !== undefined)
          .join(separator);
        break;
      }
      case 'date': {
        const format = transform.config.format as string;
        if (value instanceof Date) {
          record[transform.field] = this.formatDate(value, format);
        }
        break;
      }
      // Add more transformation types as needed
    }
  }

  private formatDate(date: Date, format: string): string {
    // Simple date formatting
    return format
      .replace('YYYY', date.getFullYear().toString())
      .replace('MM', (date.getMonth() + 1).toString().padStart(2, '0'))
      .replace('DD', date.getDate().toString().padStart(2, '0'));
  }

  private validateRecord(record: Record<string, unknown>, index: number): TransformError[] {
    const errors: TransformError[] = [];

    for (const rule of this.transformation.validation) {
      const value = record[rule.field];

      switch (rule.type) {
        case 'required':
          if (value === undefined || value === null || value === '') {
            errors.push({
              recordIndex: index,
              field: rule.field,
              message: rule.errorMessage,
              code: 'VALIDATION_ERROR',
            });
          }
          break;
        case 'format': {
          const pattern = rule.config.pattern as string;
          if (pattern && typeof value === 'string' && !new RegExp(pattern).test(value)) {
            errors.push({
              recordIndex: index,
              field: rule.field,
              message: rule.errorMessage,
              code: 'VALIDATION_ERROR',
            });
          }
          break;
        }
        // Add more validation types as needed
      }
    }

    return errors;
  }
}

// ============================================================================
// Error Types
// ============================================================================

export class IntegrationError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'IntegrationError';
  }
}

export interface TransformError {
  recordIndex: number;
  field?: string;
  message: string;
  code: string;
}

export interface IntegrationEvent {
  event: string;
  timestamp: Date;
  data: Record<string, unknown>;
}

// ============================================================================
// Singleton Instance
// ============================================================================

let frameworkInstance: IntegrationFramework | null = null;

export function getIntegrationFramework(): IntegrationFramework {
  if (!frameworkInstance) {
    frameworkInstance = new IntegrationFramework();
  }
  return frameworkInstance;
}

export function resetIntegrationFramework(): void {
  frameworkInstance = null;
}
