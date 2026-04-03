/**
 * Mainframe Adapter for Legacy System Integration
 * Supports TCP/IP connection, 3270 terminal emulation, COBOL copybook parsing,
 * EBCDIC to ASCII conversion, CICS transactions, and batch job submission
 */

import {
  IIntegrationAdapter,
  ConnectionStatus,
  SyncOperation,
  SyncOptions,
  SyncProgress,
  IntegrationError,
} from '../integration-framework';

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface MainframeConfig {
  host: string;
  port: number;
  systemName: string;
  luName?: string;
  userId: string;
  password: string;
  accountId?: string;
  codePage?: string;
  ssl?: boolean;
  timeout?: number;
}

export interface TerminalScreen {
  rows: number;
  cols: number;
  buffer: string[][];
  attributes: ScreenAttribute[][];
  cursorRow: number;
  cursorCol: number;
}

export interface ScreenAttribute {
  foreground: string;
  background: string;
  bold: boolean;
  underline: boolean;
  reverse: boolean;
  blink: boolean;
  protected: boolean;
  modified: boolean;
}

export interface CobolCopybook {
  name: string;
  level: number;
  type?: 'PIC' | 'COMP' | 'COMP-3' | 'GROUP';
  picture?: string;
  size?: number;
  offset?: number;
  children?: CobolCopybook[];
  redefines?: string;
  occurs?: number;
}

export interface CICSTransaction {
  transId: string;
  program: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  responseTime?: number;
  error?: string;
}

export interface BatchJob {
  id: string;
  name: string;
  jobClass: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  submittedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  rc?: number;
  output?: string[];
  error?: string;
}

// ============================================================================
// EBCDIC to ASCII Conversion Tables
// ============================================================================

const EBCDIC_TO_ASCII: Record<number, string> = {
  0x40: ' ', 0x4B: '.', 0x4C: '<', 0x4D: '(', 0x4E: '+', 0x4F: '|',
  0x50: '&', 0x5A: '!', 0x5B: '$', 0x5C: '*', 0x5D: ')', 0x5E: ';',
  0x5F: '^', 0x60: '-', 0x61: '/', 0x6B: ',', 0x6C: '%', 0x6D: '_',
  0x6E: '>', 0x6F: '?', 0x7A: ':', 0x7B: '#', 0x7C: '@', 0x7D: "'",
  0x7E: '=', 0x7F: '"',
  // Numbers
  0xF0: '0', 0xF1: '1', 0xF2: '2', 0xF3: '3', 0xF4: '4',
  0xF5: '5', 0xF6: '6', 0xF7: '7', 0xF8: '8', 0xF9: '9',
  // Uppercase letters
  0xC1: 'A', 0xC2: 'B', 0xC3: 'C', 0xC4: 'D', 0xC5: 'E',
  0xC6: 'F', 0xC7: 'G', 0xC8: 'H', 0xC9: 'I', 0xD1: 'J',
  0xD2: 'K', 0xD3: 'L', 0xD4: 'M', 0xD5: 'N', 0xD6: 'O',
  0xD7: 'P', 0xD8: 'Q', 0xD9: 'R', 0xE2: 'S', 0xE3: 'T',
  0xE4: 'U', 0xE5: 'V', 0xE6: 'W', 0xE7: 'X', 0xE8: 'Y',
  0xE9: 'Z',
  // Lowercase letters
  0x81: 'a', 0x82: 'b', 0x83: 'c', 0x84: 'd', 0x85: 'e',
  0x86: 'f', 0x87: 'g', 0x88: 'h', 0x89: 'i', 0x91: 'j',
  0x92: 'k', 0x93: 'l', 0x94: 'm', 0x95: 'n', 0x96: 'o',
  0x97: 'p', 0x98: 'q', 0x99: 'r', 0xA2: 's', 0xA3: 't',
  0xA4: 'u', 0xA5: 'v', 0xA6: 'w', 0xA7: 'x', 0xA8: 'y',
  0xA9: 'z',
};

const ASCII_TO_EBCDIC: Record<string, number> = {};
for (const [ebcdic, ascii] of Object.entries(EBCDIC_TO_ASCII)) {
  ASCII_TO_EBCDIC[ascii] = parseInt(ebcdic);
}

// ============================================================================
// Mainframe Adapter Implementation
// ============================================================================

export class MainframeAdapter implements IIntegrationAdapter {
  private config: MainframeConfig;
  private connectionStatus: ConnectionStatus;
  private screen: TerminalScreen | null = null;
  private transactions: Map<string, CICSTransaction> = new Map();
  private batchJobs: Map<string, BatchJob> = new Map();
  private isConnected: boolean = false;
  private socket: unknown = null;
  private sessionId: string | null = null;

  constructor(config: MainframeConfig) {
    this.config = config;
    this.connectionStatus = {
      id: `mf-${Date.now()}`,
      integrationId: '',
      status: 'disconnected',
    };
  }

  // Connection Management
  async connect(): Promise<ConnectionStatus> {
    this.connectionStatus.status = 'connecting';

    try {
      // Simulate TCP/IP connection to mainframe
      await this.simulateConnect();

      // Initialize 3270 terminal session
      this.sessionId = `SESSION-${Date.now()}`;
      this.screen = this.createEmptyScreen(24, 80);

      // Log on to TSO/CICS
      await this.logon();

      this.isConnected = true;
      this.connectionStatus.status = 'connected';
      this.connectionStatus.lastConnected = new Date();
      this.connectionStatus.latency = Math.floor(Math.random() * 50) + 10;

      return this.connectionStatus;
    } catch (error) {
      this.connectionStatus.status = 'error';
      this.connectionStatus.lastError = error instanceof Error ? error.message : 'Connection failed';
      throw new IntegrationError('CONNECTION_FAILED', this.connectionStatus.lastError);
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      // Log off gracefully
      await this.logoff();
      this.isConnected = false;
      this.sessionId = null;
      this.screen = null;
      this.connectionStatus.status = 'disconnected';
    }
  }

  async testConnection(): Promise<{ success: boolean; latency: number; error?: string }> {
    const start = Date.now();
    try {
      await this.simulateConnect();
      const latency = Date.now() - start;
      return { success: true, latency };
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
      throw new IntegrationError('NOT_CONNECTED', 'Not connected to mainframe');
    }

    // Simulate mainframe query execution
    const results = await this.simulateQuery(query, params);
    return results as T[];
  }

  async execute(command: string, params?: Record<string, unknown>): Promise<{ affected: number; data?: unknown }> {
    if (!this.isConnected) {
      throw new IntegrationError('NOT_CONNECTED', 'Not connected to mainframe');
    }

    return this.simulateExecute(command, params);
  }

  // Transaction Support
  async beginTransaction(): Promise<string> {
    const txId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    // Mainframe transactions are typically handled by CICS
    return txId;
  }

  async commitTransaction(transactionId: string): Promise<void> {
    // Simulate CICS syncpoint
    console.log(`Committing transaction ${transactionId}`);
  }

  async rollbackTransaction(transactionId: string): Promise<void> {
    // Simulate CICS rollback
    console.log(`Rolling back transaction ${transactionId}`);
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
      // Execute CICS transaction to retrieve data
      const transaction = await this.executeCICSTransaction('GET' + entityType.toUpperCase().substring(0, 4), {
        operation: 'SYNC_IMPORT',
        entityType,
        batchSize: options?.batchSize || 100,
      });

      if (transaction.status === 'completed' && transaction.output) {
        const records = transaction.output.records as unknown[];
        syncOp.totalRecords = records.length;

        for (const record of records) {
          try {
            // Convert EBCDIC data to ASCII
            const converted = this.convertRecordFromEbcdic(record as Record<string, unknown>);
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
              code: 'CONVERSION_ERROR',
              message: error instanceof Error ? error.message : 'Record conversion failed',
              severity: 'error',
              timestamp: new Date(),
            });
          }
        }
      }

      syncOp.status = syncOp.errorCount > 0 ? 'partial' : 'completed';
      syncOp.completedAt = new Date();
    } catch (error) {
      syncOp.status = 'failed';
      syncOp.completedAt = new Date();
      syncOp.errors.push({
        code: 'SYNC_FAILED',
        message: error instanceof Error ? error.message : 'Sync failed',
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
      const batchSize = options?.batchSize || 100;
      const batches = this.chunkArray(data, batchSize);

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];

        // Convert records to EBCDIC format
        const convertedBatch = batch.map(record =>
          this.convertRecordToEbcdic(record as Record<string, unknown>)
        );

        // Submit batch via CICS transaction
        const transaction = await this.executeCICSTransaction('PUT' + entityType.toUpperCase().substring(0, 4), {
          operation: 'SYNC_EXPORT',
          entityType,
          records: convertedBatch,
        });

        if (transaction.status === 'completed') {
          syncOp.processedRecords += batch.length;
          syncOp.successCount += batch.length;
        } else {
          syncOp.errorCount += batch.length;
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
    // Initialize connection pool, caches, etc.
    console.log('Initializing mainframe adapter');
  }

  async dispose(): Promise<void> {
    await this.disconnect();
    this.transactions.clear();
    this.batchJobs.clear();
  }

  // ========================================================================
  // 3270 Terminal Emulation
  // ========================================================================

  private createEmptyScreen(rows: number, cols: number): TerminalScreen {
    const buffer: string[][] = [];
    const attributes: ScreenAttribute[][] = [];

    for (let r = 0; r < rows; r++) {
      buffer[r] = new Array(cols).fill(' ');
      attributes[r] = new Array(cols).fill({
        foreground: 'green',
        background: 'black',
        bold: false,
        underline: false,
        reverse: false,
        blink: false,
        protected: false,
        modified: false,
      });
    }

    return {
      rows,
      cols,
      buffer,
      attributes,
      cursorRow: 0,
      cursorCol: 0,
    };
  }

  async sendKeys(keys: string): Promise<TerminalScreen> {
    if (!this.screen) {
      throw new IntegrationError('NO_SESSION', 'No active terminal session');
    }

    // Simulate keystrokes
    for (const key of keys) {
      if (key === '\n' || key === '\r') {
        // Enter key - submit screen
        await this.submitScreen();
      } else if (key === '\t') {
        // Tab to next field
        this.tabToNextField();
      } else {
        // Regular character
        this.screen.buffer[this.screen.cursorRow][this.screen.cursorCol] = key;
        this.screen.cursorCol++;
        if (this.screen.cursorCol >= this.screen.cols) {
          this.screen.cursorCol = 0;
          this.screen.cursorRow++;
        }
      }
    }

    return this.screen;
  }

  async sendAttention(attn: 'ENTER' | 'PF1' | 'PF2' | 'PF3' | 'PF4' | 'PF5' | 'PF6' | 'PF7' | 'PF8' | 'PF9' | 'PF10' | 'PF11' | 'PF12' | 'CLEAR' | 'PA1' | 'PA2'): Promise<TerminalScreen> {
    if (!this.screen) {
      throw new IntegrationError('NO_SESSION', 'No active terminal session');
    }

    // Simulate attention key
    await this.simulateAttention(attn);
    return this.screen;
  }

  getScreenText(): string {
    if (!this.screen) return '';
    return this.screen.buffer.map(row => row.join('')).join('\n');
  }

  getScreenFields(): { row: number; col: number; length: number; content: string; protected: boolean }[] {
    if (!this.screen) return [];

    const fields: { row: number; col: number; length: number; content: string; protected: boolean }[] = [];
    let currentField: typeof fields[0] | null = null;

    for (let r = 0; r < this.screen.rows; r++) {
      for (let c = 0; c < this.screen.cols; c++) {
        const attr = this.screen.attributes[r][c];
        const char = this.screen.buffer[r][c];

        if (!currentField) {
          currentField = {
            row: r,
            col: c,
            length: 1,
            content: char,
            protected: attr.protected,
          };
        } else if (attr.protected === currentField.protected) {
          currentField.length++;
          currentField.content += char;
        } else {
          fields.push(currentField);
          currentField = {
            row: r,
            col: c,
            length: 1,
            content: char,
            protected: attr.protected,
          };
        }
      }
    }

    if (currentField) {
      fields.push(currentField);
    }

    return fields;
  }

  private tabToNextField(): void {
    if (!this.screen) return;

    // Find next unprotected field
    const fields = this.getScreenFields();
    const currentPos = this.screen.cursorRow * this.screen.cols + this.screen.cursorCol;

    for (const field of fields) {
      const fieldStart = field.row * this.screen.cols + field.col;
      if (fieldStart > currentPos && !field.protected) {
        this.screen.cursorRow = field.row;
        this.screen.cursorCol = field.col;
        return;
      }
    }
  }

  private async submitScreen(): Promise<void> {
    // Simulate screen submission to mainframe
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async simulateAttention(attn: string): Promise<void> {
    // Simulate attention key processing
    console.log(`Attention key: ${attn}`);
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // ========================================================================
  // COBOL Copybook Parsing
  // ========================================================================

  parseCopybook(copybookText: string): CobolCopybook[] {
    const lines = copybookText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const fields: CobolCopybook[] = [];
    const stack: CobolCopybook[] = [];

    for (const line of lines) {
      // Skip comments
      if (line.startsWith('*')) continue;

      // Parse level number
      const levelMatch = line.match(/^(\d{1,2})\s+(\S+)/);
      if (!levelMatch) continue;

      const level = parseInt(levelMatch[1]);
      const name = levelMatch[2].replace(/\.$/, '');

      const field: CobolCopybook = {
        name,
        level,
      };

      // Parse PIC clause
      const picMatch = line.match(/PIC(?:TURE)?\s+(?:IS\s+)?([^\s.]+)/i);
      if (picMatch) {
        field.picture = picMatch[1];
        field.type = 'PIC';
        field.size = this.calculatePicSize(picMatch[1]);
      }

      // Parse COMP/COMP-3
      if (line.match(/\bCOMP(?:-3)?\b/i)) {
        field.type = line.match(/\bCOMP-3\b/i) ? 'COMP-3' : 'COMP';
      }

      // Parse REDEFINES
      const redefinesMatch = line.match(/REDEFINES\s+(\S+)/i);
      if (redefinesMatch) {
        field.redefines = redefinesMatch[1].replace(/\.$/, '');
      }

      // Parse OCCURS
      const occursMatch = line.match(/OCCURS\s+(\d+)/i);
      if (occursMatch) {
        field.occurs = parseInt(occursMatch[1]);
      }

      // Handle level hierarchy
      while (stack.length > 0 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }

      if (stack.length > 0) {
        const parent = stack[stack.length - 1];
        if (!parent.children) {
          parent.children = [];
          parent.type = 'GROUP';
        }
        parent.children.push(field);
      } else {
        fields.push(field);
      }

      stack.push(field);
    }

    // Calculate offsets
    this.calculateOffsets(fields, 0);

    return fields;
  }

  private calculatePicSize(pic: string): number {
    // Handle formats like X(10), 9(5), S9(7)V99, etc.
    let size = 0;
    const expanded = pic
      .replace(/\((\d+)\)/g, (_, count) => 'X'.repeat(parseInt(count)))
      .replace(/S/g, '')
      .replace(/V/g, '');

    return expanded.length;
  }

  private calculateOffsets(fields: CobolCopybook[], startOffset: number): number {
    let offset = startOffset;

    for (const field of fields) {
      field.offset = offset;

      if (field.children && field.children.length > 0) {
        offset = this.calculateOffsets(field.children, offset);
      } else if (field.size) {
        const multiplier = field.occurs || 1;
        offset += field.size * multiplier;
      }
    }

    return offset;
  }

  parseRecord(copybook: CobolCopybook[], data: Buffer): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const field of copybook) {
      if (field.children && field.children.length > 0) {
        result[field.name] = this.parseRecord(field.children, data);
      } else if (field.offset !== undefined && field.size) {
        const fieldData = data.slice(field.offset, field.offset + field.size);
        result[field.name] = this.parseFieldValue(field, fieldData);
      }
    }

    return result;
  }

  private parseFieldValue(field: CobolCopybook, data: Buffer): unknown {
    const str = data.toString('utf8').trim();

    if (!field.picture) return str;

    // Numeric field
    if (field.picture.match(/^S?9/i)) {
      if (field.type === 'COMP-3') {
        return this.parsePackedDecimal(data);
      } else if (field.type === 'COMP') {
        return data.readInt32BE(0);
      } else {
        const num = parseFloat(str.replace(/[^\d.-]/g, ''));
        return isNaN(num) ? 0 : num;
      }
    }

    // Alphanumeric field
    return str;
  }

  private parsePackedDecimal(data: Buffer): number {
    // Packed decimal: each byte contains 2 digits, last nibble is sign
    let result = 0;
    for (let i = 0; i < data.length - 1; i++) {
      result = result * 100 + ((data[i] >> 4) * 10 + (data[i] & 0x0f));
    }
    // Last byte: high nibble is digit, low nibble is sign (C=positive, D=negative)
    const lastByte = data[data.length - 1];
    result = result * 10 + (lastByte >> 4);
    const sign = (lastByte & 0x0f) === 0x0d ? -1 : 1;
    return result * sign;
  }

  // ========================================================================
  // EBCDIC Conversion
  // ========================================================================

  ebcdicToAscii(ebcdicData: Buffer): string {
    let result = '';
    for (let i = 0; i < ebcdicData.length; i++) {
      const byte = ebcdicData[i];
      result += EBCDIC_TO_ASCII[byte] || '?';
    }
    return result;
  }

  asciiToEbcdic(asciiText: string): Buffer {
    const buffer = Buffer.alloc(asciiText.length);
    for (let i = 0; i < asciiText.length; i++) {
      buffer[i] = ASCII_TO_EBCDIC[asciiText[i]] || 0x40; // Default to space
    }
    return buffer;
  }

  private convertRecordFromEbcdic(record: Record<string, unknown>): Record<string, unknown> {
    const converted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(record)) {
      if (value instanceof Buffer) {
        converted[key] = this.ebcdicToAscii(value);
      } else if (typeof value === 'string') {
        converted[key] = value;
      } else if (typeof value === 'object' && value !== null) {
        converted[key] = this.convertRecordFromEbcdic(value as Record<string, unknown>);
      } else {
        converted[key] = value;
      }
    }
    return converted;
  }

  private convertRecordToEbcdic(record: Record<string, unknown>): Record<string, unknown> {
    const converted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(record)) {
      if (typeof value === 'string') {
        converted[key] = this.asciiToEbcdic(value);
      } else if (typeof value === 'object' && value !== null) {
        converted[key] = this.convertRecordToEbcdic(value as Record<string, unknown>);
      } else {
        converted[key] = value;
      }
    }
    return converted;
  }

  // ========================================================================
  // CICS Transaction Support
  // ========================================================================

  async executeCICSTransaction(transId: string, input: Record<string, unknown>): Promise<CICSTransaction> {
    const transaction: CICSTransaction = {
      transId,
      program: `PGM${transId}`,
      input,
      status: 'running',
    };

    this.transactions.set(transId, transaction);

    try {
      // Simulate CICS transaction execution
      const start = Date.now();
      const output = await this.simulateCICSTransaction(transId, input);
      transaction.output = output;
      transaction.status = 'completed';
      transaction.responseTime = Date.now() - start;
    } catch (error) {
      transaction.status = 'failed';
      transaction.error = error instanceof Error ? error.message : 'Transaction failed';
    }

    return transaction;
  }

  getTransactionStatus(transId: string): CICSTransaction | undefined {
    return this.transactions.get(transId);
  }

  // ========================================================================
  // Batch Job Support
  // ========================================================================

  async submitBatchJob(jobName: string, jcl: string, jobClass: string = 'A'): Promise<BatchJob> {
    const job: BatchJob = {
      id: `JOB${Date.now().toString(36).toUpperCase()}`,
      name: jobName,
      jobClass,
      status: 'queued',
      submittedAt: new Date(),
    };

    this.batchJobs.set(job.id, job);

    // Simulate job submission
    await this.simulateBatchJobSubmission(job, jcl);

    return job;
  }

  async getJobStatus(jobId: string): Promise<BatchJob | undefined> {
    const job = this.batchJobs.get(jobId);
    if (!job) return undefined;

    // Simulate status check
    await this.simulateJobStatusCheck(job);
    return job;
  }

  async cancelJob(jobId: string): Promise<boolean> {
    const job = this.batchJobs.get(jobId);
    if (!job || job.status !== 'running') return false;

    job.status = 'cancelled';
    return true;
  }

  async getJobOutput(jobId: string): Promise<string[] | undefined> {
    const job = this.batchJobs.get(jobId);
    if (!job || job.status !== 'completed') return undefined;

    return job.output;
  }

  // ========================================================================
  // Simulation Methods (for demo purposes)
  // ========================================================================

  private async simulateConnect(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    // Simulate potential connection failure (10% chance)
    if (Math.random() < 0.1) {
      throw new IntegrationError('CONNECTION_REFUSED', 'Connection refused by mainframe');
    }
  }

  private async logon(): Promise<void> {
    // Simulate TSO/CICS logon
    await new Promise(resolve => setTimeout(resolve, 300));

    // Update screen with welcome message
    if (this.screen) {
      const welcome = [
        '================================================================================',
        '                    NEXUSOS INSURANCE MAINFRAME SYSTEM                         ',
        '================================================================================',
        '                                                                                ',
        '  System: NEXINS   Release: 2.4.1     Date: ' + new Date().toISOString().split('T')[0],
        '                                                                                ',
        '  Enter TRANSID or LOGOFF                                                       ',
        '                                                                                ',
        '  Ready                                                                         ',
        '================================================================================',
      ];

      for (let i = 0; i < welcome.length && i < this.screen.rows; i++) {
        for (let j = 0; j < welcome[i].length && j < this.screen.cols; j++) {
          this.screen.buffer[i][j] = welcome[i][j];
        }
      }
    }
  }

  private async logoff(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async simulateQuery(query: string, params?: Record<string, unknown>): Promise<unknown[]> {
    await new Promise(resolve => setTimeout(resolve, 150));

    // Return simulated data based on query
    const entityType = query.toLowerCase();

    if (entityType.includes('policy')) {
      return this.generateMockPolicies(params?.limit as number || 10);
    } else if (entityType.includes('claim')) {
      return this.generateMockClaims(params?.limit as number || 10);
    } else if (entityType.includes('customer')) {
      return this.generateMockCustomers(params?.limit as number || 10);
    }

    return [];
  }

  private async simulateExecute(command: string, params?: Record<string, unknown>): Promise<{ affected: number; data?: unknown }> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return { affected: Math.floor(Math.random() * 100) + 1 };
  }

  private async simulateCICSTransaction(transId: string, input: Record<string, unknown>): Promise<Record<string, unknown>> {
    await new Promise(resolve => setTimeout(resolve, 200));

    // Generate mock output based on transaction
    if (transId.startsWith('GET')) {
      return {
        records: this.generateMockPolicies((input.batchSize as number) || 100),
      };
    } else if (transId.startsWith('PUT')) {
      return {
        status: 'SUCCESS',
        recordsProcessed: (input.records as unknown[])?.length || 0,
      };
    }

    return { status: 'SUCCESS' };
  }

  private async simulateBatchJobSubmission(job: BatchJob, jcl: string): Promise<void> {
    // Simulate job queuing and execution
    setTimeout(() => {
      job.status = 'running';
      job.startedAt = new Date();
    }, 500);

    setTimeout(() => {
      job.status = 'completed';
      job.completedAt = new Date();
      job.rc = 0;
      job.output = [
        `JOB ${job.name} (${job.id})`,
        '------------------------------',
        'STEP1    EXECUTED     RC=0000',
        'STEP2    EXECUTED     RC=0000',
        '------------------------------',
        `JOB ${job.id} COMPLETED - RC=0000`,
      ];
    }, 2000 + Math.random() * 3000);
  }

  private async simulateJobStatusCheck(job: BatchJob): Promise<void> {
    // Status is updated automatically in simulation
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // ========================================================================
  // Mock Data Generators
  // ========================================================================

  private generateMockPolicies(count: number): unknown[] {
    const policies = [];
    const lines = ['LIFE', 'HEALTH', 'MOTOR', 'PROPERTY', 'MARINE'];
    const statuses = ['active', 'active', 'active', 'lapsed', 'pending'];

    for (let i = 0; i < count; i++) {
      policies.push({
        POLICY_NUMBER: `POL-2024-${(1000 + i).toString().padStart(6, '0')}`,
        INSURED_NAME: `Customer ${i + 1}`,
        LINE_OF_BUSINESS: lines[i % lines.length],
        PREMIUM_AMOUNT: Math.floor(Math.random() * 10000) + 1000,
        SUM_INSURED: Math.floor(Math.random() * 1000000) + 100000,
        EFFECTIVE_DATE: new Date().toISOString().split('T')[0],
        EXPIRY_DATE: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        STATUS: statuses[i % statuses.length],
        AGENT_CODE: `AGT-${(i % 10 + 1).toString().padStart(3, '0')}`,
      });
    }

    return policies;
  }

  private generateMockClaims(count: number): unknown[] {
    const claims = [];
    const statuses = ['open', 'in_review', 'approved', 'paid', 'denied'];

    for (let i = 0; i < count; i++) {
      claims.push({
        CLAIM_NUMBER: `CLM-2024-${(1000 + i).toString().padStart(6, '0')}`,
        POLICY_NUMBER: `POL-2024-${(1000 + (i % 100)).toString().padStart(6, '0')}`,
        CLAIMANT_NAME: `Claimant ${i + 1}`,
        CLAIM_DATE: new Date().toISOString().split('T')[0],
        CLAIM_AMOUNT: Math.floor(Math.random() * 50000) + 1000,
        STATUS: statuses[i % statuses.length],
        ADJUSTER_CODE: `ADJ-${(i % 5 + 1).toString().padStart(3, '0')}`,
      });
    }

    return claims;
  }

  private generateMockCustomers(count: number): unknown[] {
    const customers = [];

    for (let i = 0; i < count; i++) {
      customers.push({
        CUSTOMER_ID: `CUS-${(1000 + i).toString().padStart(6, '0')}`,
        FIRST_NAME: `First${i + 1}`,
        LAST_NAME: `Last${i + 1}`,
        EMAIL: `customer${i + 1}@email.com`,
        PHONE: `868-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
        ADDRESS: `${i + 1} Main Street, Port of Spain`,
        CREATED_DATE: new Date().toISOString().split('T')[0],
      });
    }

    return customers;
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

// ============================================================================
// Export Factory Function
// ============================================================================

export function createMainframeAdapter(config: MainframeConfig): MainframeAdapter {
  return new MainframeAdapter(config);
}
