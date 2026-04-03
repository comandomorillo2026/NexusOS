/**
 * AS/400 (IBM i) Adapter for Legacy System Integration
 * Supports IBM i connection (ODBC/JDBC simulation), RPG program interface,
 * CL command execution, DB2/400 query support, and Data Queue integration
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

export interface AS400Config {
  host: string;
  port?: number;
  systemName: string;
  userId: string;
  password: string;
  library?: string;
  namingConvention?: 'system' | 'sql';
  codePage?: string;
  ssl?: boolean;
  timeout?: number;
}

export interface RPGProgram {
  name: string;
  library: string;
  parameters: RPGParameter[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  returnCode?: number;
  output?: Record<string, unknown>;
  error?: string;
}

export interface RPGParameter {
  name: string;
  type: 'char' | 'packed' | 'zoned' | 'binary' | 'float' | 'date' | 'time' | 'timestamp';
  length: number;
  decimals?: number;
  direction: 'input' | 'output' | 'both';
  value?: unknown;
}

export interface CLCommand {
  command: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  output?: string[];
  messages?: AS400Message[];
  error?: string;
}

export interface AS400Message {
  id: string;
  type: 'info' | 'warning' | 'error' | 'escape';
  text: string;
  severity: number;
}

export interface DataQueue {
  name: string;
  library: string;
  type: 'FIFO' | 'LIFO' | 'KEYED';
  maxLength: number;
  entryLength?: number;
}

export interface DataQueueEntry {
  key?: string;
  data: string | Buffer;
  timestamp: Date;
  sender?: string;
}

export interface DB2Query {
  sql: string;
  parameters?: unknown[];
  library?: string;
  fetchSize?: number;
  timeout?: number;
}

export interface DB2Result {
  columns: { name: string; type: string; nullable: boolean }[];
  rows: Record<string, unknown>[];
  rowCount: number;
  updateCount?: number;
}

export interface SpooledFile {
  name: string;
  number: number;
  jobName: string;
  jobUser: string;
  jobNumber: string;
  creationDate: Date;
  totalPages: number;
  status: 'ready' | 'writing' | 'closed' | 'deleted';
}

// ============================================================================
// AS/400 Adapter Implementation
// ============================================================================

export class AS400Adapter implements IIntegrationAdapter {
  private config: AS400Config;
  private connectionStatus: ConnectionStatus;
  private isConnected: boolean = false;
  private jobNumber: string | null = null;
  private rpgPrograms: Map<string, RPGProgram> = new Map();
  private clCommands: Map<string, CLCommand> = new Map();
  private dataQueues: Map<string, DataQueue> = new Map();
  private dataQueueEntries: Map<string, DataQueueEntry[]> = new Map();

  constructor(config: AS400Config) {
    this.config = config;
    this.connectionStatus = {
      id: `as400-${Date.now()}`,
      integrationId: '',
      status: 'disconnected',
    };
  }

  // Connection Management
  async connect(): Promise<ConnectionStatus> {
    this.connectionStatus.status = 'connecting';

    try {
      // Simulate IBM i connection via ODBC/JDBC
      await this.simulateConnect();

      // Initialize job
      this.jobNumber = await this.startJob();

      // Set library list
      if (this.config.library) {
        await this.setLibraryList([this.config.library]);
      }

      this.isConnected = true;
      this.connectionStatus.status = 'connected';
      this.connectionStatus.lastConnected = new Date();
      this.connectionStatus.latency = Math.floor(Math.random() * 30) + 5;

      return this.connectionStatus;
    } catch (error) {
      this.connectionStatus.status = 'error';
      this.connectionStatus.lastError = error instanceof Error ? error.message : 'Connection failed';
      throw new IntegrationError('CONNECTION_FAILED', this.connectionStatus.lastError);
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      // End job gracefully
      await this.endJob();
      this.isConnected = false;
      this.jobNumber = null;
      this.connectionStatus.status = 'disconnected';
    }
  }

  async testConnection(): Promise<{ success: boolean; latency: number; error?: string }> {
    const start = Date.now();
    try {
      await this.simulateConnect();
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
  async query<T>(sql: string, params?: Record<string, unknown>): Promise<T[]> {
    if (!this.isConnected) {
      throw new IntegrationError('NOT_CONNECTED', 'Not connected to AS/400');
    }

    const result = await this.executeDB2Query({
      sql,
      parameters: params ? Object.values(params) : undefined,
    });

    return result.rows as T[];
  }

  async execute(command: string, params?: Record<string, unknown>): Promise<{ affected: number; data?: unknown }> {
    if (!this.isConnected) {
      throw new IntegrationError('NOT_CONNECTED', 'Not connected to AS/400');
    }

    const result = await this.executeDB2Query({
      sql: command,
      parameters: params ? Object.values(params) : undefined,
    });

    return {
      affected: result.updateCount || 0,
      data: result.rows,
    };
  }

  // Transaction Support
  async beginTransaction(): Promise<string> {
    // AS/400 supports commitment control
    const txId = `TXN-${Date.now()}`;
    await this.executeCLCommand(`STRCMTCTL LCKLVL(*CHG) CMTSCOPE(*JOB)`);
    return txId;
  }

  async commitTransaction(transactionId: string): Promise<void> {
    await this.executeCLCommand(`COMMIT`);
    console.log(`Transaction ${transactionId} committed`);
  }

  async rollbackTransaction(transactionId: string): Promise<void> {
    await this.executeCLCommand(`ROLLBACK`);
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
      // Build and execute query
      const library = this.config.library || 'QGPL';
      const sql = this.buildSelectQuery(library, entityType, options?.filter);
      const result = await this.executeDB2Query({
        sql,
        fetchSize: options?.batchSize || 100,
      });

      syncOp.totalRecords = result.rows.length;

      for (const row of result.rows) {
        try {
          // Process and convert data
          const processed = this.convertAS400Data(row);
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
      const batchSize = options?.batchSize || 100;
      const batches = this.chunkArray(data, batchSize);

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];

        // Convert and insert records
        for (const record of batch) {
          try {
            const converted = this.convertToAS400Data(record as Record<string, unknown>);
            const library = this.config.library || 'QGPL';
            const sql = this.buildInsertQuery(library, entityType, converted);
            await this.executeDB2Query({ sql });
            syncOp.processedRecords++;
            syncOp.successCount++;
          } catch (error) {
            syncOp.errorCount++;
          }
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
    console.log('Initializing AS/400 adapter');
  }

  async dispose(): Promise<void> {
    await this.disconnect();
    this.rpgPrograms.clear();
    this.clCommands.clear();
    this.dataQueues.clear();
    this.dataQueueEntries.clear();
  }

  // ========================================================================
  // DB2/400 Query Support
  // ========================================================================

  async executeDB2Query(query: DB2Query): Promise<DB2Result> {
    if (!this.isConnected) {
      throw new IntegrationError('NOT_CONNECTED', 'Not connected to AS/400');
    }

    // Simulate DB2/400 query execution
    return this.simulateDB2Query(query);
  }

  async executeSQLScript(sql: string): Promise<DB2Result[]> {
    const statements = sql.split(';').filter(s => s.trim().length > 0);
    const results: DB2Result[] = [];

    for (const statement of statements) {
      results.push(await this.executeDB2Query({ sql: statement.trim() }));
    }

    return results;
  }

  async describeTable(tableName: string, library?: string): Promise<{ name: string; type: string; nullable: boolean; length?: number }[]> {
    const lib = library || this.config.library || 'QGPL';
    // Simulate table description
    return [
      { name: 'ID', type: 'CHAR', nullable: false, length: 20 },
      { name: 'NAME', type: 'VARCHAR', nullable: true, length: 100 },
      { name: 'AMOUNT', type: 'DECIMAL', nullable: true, length: 15 },
      { name: 'DATE', type: 'DATE', nullable: true },
      { name: 'STATUS', type: 'CHAR', nullable: true, length: 1 },
    ];
  }

  private buildSelectQuery(library: string, table: string, filter?: Record<string, unknown>): string {
    let sql = `SELECT * FROM ${library}.${table}`;
    if (filter && Object.keys(filter).length > 0) {
      const conditions = Object.entries(filter)
        .map(([key, value]) => `${key} = '${value}'`)
        .join(' AND ');
      sql += ` WHERE ${conditions}`;
    }
    return sql;
  }

  private buildInsertQuery(library: string, table: string, data: Record<string, unknown>): string {
    const columns = Object.keys(data);
    const values = Object.values(data)
      .map(v => typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : v)
      .join(', ');

    return `INSERT INTO ${library}.${table} (${columns.join(', ')}) VALUES (${values})`;
  }

  // ========================================================================
  // RPG Program Interface
  // ========================================================================

  async callRPGProgram(programName: string, library: string, parameters: RPGParameter[]): Promise<RPGProgram> {
    const program: RPGProgram = {
      name: programName,
      library,
      parameters,
      status: 'running',
    };

    const programKey = `${library}/${programName}`;
    this.rpgPrograms.set(programKey, program);

    try {
      // Simulate RPG program call
      const output = await this.simulateRPGCall(programName, library, parameters);
      program.output = output;
      program.status = 'completed';
      program.returnCode = 0;

      // Update output parameters
      for (const param of parameters) {
        if (param.direction === 'output' || param.direction === 'both') {
          param.value = output[param.name];
        }
      }
    } catch (error) {
      program.status = 'failed';
      program.error = error instanceof Error ? error.message : 'RPG program failed';
      program.returnCode = -1;
    }

    return program;
  }

  async callRPGProgramAsync(programName: string, library: string, parameters: RPGParameter[]): Promise<string> {
    const programKey = `${library}/${programName}-${Date.now()}`;

    // Start async call
    this.rpgPrograms.set(programKey, {
      name: programName,
      library,
      parameters,
      status: 'running',
    });

    // Simulate async execution
    this.simulateRPGCallAsync(programKey, programName, library, parameters);

    return programKey;
  }

  async getRPGProgramStatus(programKey: string): Promise<RPGProgram | undefined> {
    return this.rpgPrograms.get(programKey);
  }

  private async simulateRPGCall(programName: string, library: string, parameters: RPGParameter[]): Promise<Record<string, unknown>> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const output: Record<string, unknown> = {};

    for (const param of parameters) {
      if (param.direction === 'output' || param.direction === 'both') {
        // Generate simulated output based on type
        switch (param.type) {
          case 'char':
            output[param.name] = 'RESULT';
            break;
          case 'packed':
          case 'zoned':
            output[param.name] = Math.floor(Math.random() * 1000);
            break;
          case 'date':
            output[param.name] = new Date().toISOString().split('T')[0];
            break;
          default:
            output[param.name] = null;
        }
      }
    }

    // Add program-specific outputs
    if (programName.includes('POLICY')) {
      output['POLICY_COUNT'] = Math.floor(Math.random() * 100) + 1;
      output['TOTAL_PREMIUM'] = Math.floor(Math.random() * 100000);
    }

    return output;
  }

  private async simulateRPGCallAsync(programKey: string, programName: string, library: string, parameters: RPGParameter[]): Promise<void> {
    setTimeout(async () => {
      const program = this.rpgPrograms.get(programKey);
      if (!program) return;

      try {
        const output = await this.simulateRPGCall(programName, library, parameters);
        program.output = output;
        program.status = 'completed';
        program.returnCode = 0;
      } catch (error) {
        program.status = 'failed';
        program.error = error instanceof Error ? error.message : 'RPG program failed';
        program.returnCode = -1;
      }
    }, 1000 + Math.random() * 2000);
  }

  // ========================================================================
  // CL Command Execution
  // ========================================================================

  async executeCLCommand(command: string): Promise<CLCommand> {
    const cl: CLCommand = {
      command,
      status: 'running',
    };

    const commandId = `CL-${Date.now()}`;
    this.clCommands.set(commandId, cl);

    try {
      // Simulate CL command execution
      const result = await this.simulateCLCommand(command);
      cl.output = result.output;
      cl.messages = result.messages;
      cl.status = 'completed';
    } catch (error) {
      cl.status = 'failed';
      cl.error = error instanceof Error ? error.message : 'CL command failed';
      cl.messages = [{
        id: 'CPF0001',
        type: 'escape',
        text: cl.error,
        severity: 30,
      }];
    }

    return cl;
  }

  async submitBatchJob(jobName: string, command: string, jobDescription?: string): Promise<string> {
    // Simulate SBMJOB command
    const jobId = await this.simulateBatchJobSubmit(jobName, command, jobDescription);
    return jobId;
  }

  async getJobStatus(jobId: string): Promise<{ status: string; messages: AS400Message[] }> {
    // Simulate job status check
    return {
      status: 'COMPLETED',
      messages: [],
    };
  }

  private async simulateCLCommand(command: string): Promise<{ output: string[]; messages: AS400Message[] }> {
    await new Promise(resolve => setTimeout(resolve, 100));

    const output: string[] = [];
    const messages: AS400Message[] = [];

    // Parse and simulate common CL commands
    const upperCommand = command.toUpperCase().trim();

    if (upperCommand.startsWith('DSPMSG')) {
      output.push('No messages in queue');
    } else if (upperCommand.startsWith('WRKUSRPRF')) {
      output.push('User profiles displayed');
    } else if (upperCommand.startsWith('DSPSYSVAL')) {
      output.push('System value retrieved');
    } else if (upperCommand.startsWith('CHGJOB')) {
      output.push('Job attributes changed');
    } else if (upperCommand.startsWith('STRCMTCTL')) {
      output.push('Commitment control started');
    } else if (upperCommand.startsWith('CMTCTL')) {
      output.push('Commitment control ended');
    }

    messages.push({
      id: 'CPC0001',
      type: 'info',
      text: 'Command completed successfully',
      severity: 0,
    });

    return { output, messages };
  }

  private async simulateBatchJobSubmit(jobName: string, command: string, jobDescription?: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 150));
    return `${jobName}${Date.now().toString().slice(-6)}`;
  }

  // ========================================================================
  // Data Queue Integration
  // ========================================================================

  async createDataQueue(name: string, library: string, type: 'FIFO' | 'LIFO' | 'KEYED', maxLength: number): Promise<void> {
    const queue: DataQueue = {
      name,
      library,
      type,
      maxLength,
    };

    const key = `${library}/${name}`;
    this.dataQueues.set(key, queue);
    this.dataQueueEntries.set(key, []);

    // Simulate CRTDTAQ command
    await this.executeCLCommand(`CRTDTAQ DTAQ(${library}/${name}) MAXLEN(${maxLength}) SEQ(${type})`);
  }

  async sendDataQueueEntry(name: string, library: string, data: string | Buffer, key?: string): Promise<void> {
    const queueKey = `${library}/${name}`;
    const queue = this.dataQueues.get(queueKey);
    const entries = this.dataQueueEntries.get(queueKey);

    if (!queue || !entries) {
      throw new IntegrationError('QUEUE_NOT_FOUND', `Data queue ${queueKey} not found`);
    }

    const entry: DataQueueEntry = {
      key,
      data,
      timestamp: new Date(),
    };

    entries.push(entry);

    // Simulate QSNDDTAQ API call
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  async receiveDataQueueEntry(name: string, library: string, wait: boolean = true, key?: string): Promise<DataQueueEntry | null> {
    const queueKey = `${library}/${name}`;
    const queue = this.dataQueues.get(queueKey);
    const entries = this.dataQueueEntries.get(queueKey);

    if (!queue || !entries) {
      throw new IntegrationError('QUEUE_NOT_FOUND', `Data queue ${queueKey} not found`);
    }

    // Simulate QRCVDTAQ API call
    if (entries.length === 0) {
      if (wait) {
        // Simulate waiting for entry
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return null;
    }

    if (queue.type === 'KEYED' && key) {
      const index = entries.findIndex(e => e.key === key);
      if (index >= 0) {
        return entries.splice(index, 1)[0];
      }
      return null;
    } else if (queue.type === 'LIFO') {
      return entries.pop() || null;
    } else {
      return entries.shift() || null;
    }
  }

  async getDataQueueLength(name: string, library: string): Promise<number> {
    const queueKey = `${library}/${name}`;
    const entries = this.dataQueueEntries.get(queueKey);
    return entries?.length || 0;
  }

  async clearDataQueue(name: string, library: string): Promise<void> {
    const queueKey = `${library}/${name}`;
    const entries = this.dataQueueEntries.get(queueKey);
    if (entries) {
      entries.length = 0;
    }
  }

  // ========================================================================
  // Spooled File Support
  // ========================================================================

  async getSpooledFiles(userId?: string): Promise<SpooledFile[]> {
    // Simulate WRKSPLF output
    return [
      {
        name: 'QSYSPRT',
        number: 1,
        jobName: 'SYNCJOB',
        jobUser: this.config.userId,
        jobNumber: this.jobNumber || '000000',
        creationDate: new Date(),
        totalPages: 5,
        status: 'ready',
      },
      {
        name: 'QPRINT',
        number: 2,
        jobName: 'RPTGEN',
        jobUser: this.config.userId,
        jobNumber: this.jobNumber || '000000',
        creationDate: new Date(),
        totalPages: 12,
        status: 'closed',
      },
    ];
  }

  async getSpooledFileContent(splfName: string, splfNumber: number, jobName: string, jobUser: string, jobNumber: string): Promise<string[]> {
    // Simulate reading spooled file content
    return [
      '================================================================================',
      '                           NEXUSOS INSURANCE REPORT                             ',
      '================================================================================',
      '',
      `Report: ${splfName}   Number: ${splfNumber}`,
      `Job: ${jobNumber}/${jobUser}/${jobName}`,
      `Generated: ${new Date().toISOString()}`,
      '',
      '--------------------------------------------------------------------------------',
      ' Policy Number  | Insured Name      | Premium  | Status ',
      '--------------------------------------------------------------------------------',
      ' POL-2024-00001 | John Smith        | TT$4,500 | ACTIVE',
      ' POL-2024-00002 | Maria Garcia      | TT$8,500 | ACTIVE',
      ' POL-2024-00003 | Carlos Rodriguez  | TT$12,000| ACTIVE',
      '--------------------------------------------------------------------------------',
    ];
  }

  // ========================================================================
  // Helper Methods
  // ========================================================================

  private async simulateConnect(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 150));
    if (Math.random() < 0.05) {
      throw new IntegrationError('CONNECTION_REFUSED', 'AS/400 connection refused');
    }
  }

  private async startJob(): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return Date.now().toString().slice(-6);
  }

  private async endJob(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  private async setLibraryList(libraries: string[]): Promise<void> {
    // Simulate CHGLIBL command
    for (const lib of libraries) {
      await this.executeCLCommand(`ADDLIBLE LIB(${lib})`);
    }
  }

  private async simulateDB2Query(query: DB2Query): Promise<DB2Result> {
    await new Promise(resolve => setTimeout(resolve, 100));

    // Parse and simulate query results
    const sql = query.sql.toUpperCase();

    if (sql.includes('POLICY')) {
      return this.generatePolicyResult();
    } else if (sql.includes('CLAIM')) {
      return this.generateClaimResult();
    } else if (sql.includes('CUSTOMER')) {
      return this.generateCustomerResult();
    } else if (sql.startsWith('INSERT') || sql.startsWith('UPDATE') || sql.startsWith('DELETE')) {
      return {
        columns: [],
        rows: [],
        rowCount: 0,
        updateCount: Math.floor(Math.random() * 10) + 1,
      };
    }

    return {
      columns: [],
      rows: [],
      rowCount: 0,
    };
  }

  private generatePolicyResult(): DB2Result {
    const rows: Record<string, unknown>[] = [];
    for (let i = 0; i < 10; i++) {
      rows.push({
        POLNUM: `POL-2024-${(1000 + i).toString().padStart(6, '0')}`,
        INSNAME: `Customer ${i + 1}`,
        LINBUS: ['LIFE', 'HEALTH', 'MOTOR', 'PROPERTY'][i % 4],
        PRMAMT: Math.floor(Math.random() * 10000) + 1000,
        SUMINS: Math.floor(Math.random() * 1000000) + 100000,
        EFFDAT: new Date().toISOString().split('T')[0],
        EXPDAT: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        STATUS: 'A',
      });
    }

    return {
      columns: [
        { name: 'POLNUM', type: 'CHAR', nullable: false },
        { name: 'INSNAME', type: 'VARCHAR', nullable: true },
        { name: 'LINBUS', type: 'CHAR', nullable: true },
        { name: 'PRMAMT', type: 'DECIMAL', nullable: true },
        { name: 'SUMINS', type: 'DECIMAL', nullable: true },
        { name: 'EFFDAT', type: 'DATE', nullable: true },
        { name: 'EXPDAT', type: 'DATE', nullable: true },
        { name: 'STATUS', type: 'CHAR', nullable: true },
      ],
      rows,
      rowCount: rows.length,
    };
  }

  private generateClaimResult(): DB2Result {
    const rows: Record<string, unknown>[] = [];
    for (let i = 0; i < 10; i++) {
      rows.push({
        CLMNUM: `CLM-2024-${(1000 + i).toString().padStart(6, '0')}`,
        POLNUM: `POL-2024-${(1000 + (i % 10)).toString().padStart(6, '0')}`,
        CLMDAT: new Date().toISOString().split('T')[0],
        CLMAMT: Math.floor(Math.random() * 50000) + 1000,
        STATUS: ['O', 'R', 'A', 'P', 'D'][i % 5],
      });
    }

    return {
      columns: [
        { name: 'CLMNUM', type: 'CHAR', nullable: false },
        { name: 'POLNUM', type: 'CHAR', nullable: false },
        { name: 'CLMDAT', type: 'DATE', nullable: true },
        { name: 'CLMAMT', type: 'DECIMAL', nullable: true },
        { name: 'STATUS', type: 'CHAR', nullable: true },
      ],
      rows,
      rowCount: rows.length,
    };
  }

  private generateCustomerResult(): DB2Result {
    const rows: Record<string, unknown>[] = [];
    for (let i = 0; i < 10; i++) {
      rows.push({
        CUSID: `CUS-${(1000 + i).toString().padStart(6, '0')}`,
        FSTNAM: `First${i + 1}`,
        LSTNAM: `Last${i + 1}`,
        EMAIL: `customer${i + 1}@email.com`,
        PHONE: `868-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
      });
    }

    return {
      columns: [
        { name: 'CUSID', type: 'CHAR', nullable: false },
        { name: 'FSTNAM', type: 'VARCHAR', nullable: true },
        { name: 'LSTNAM', type: 'VARCHAR', nullable: true },
        { name: 'EMAIL', type: 'VARCHAR', nullable: true },
        { name: 'PHONE', type: 'VARCHAR', nullable: true },
      ],
      rows,
      rowCount: rows.length,
    };
  }

  private convertAS400Data(data: Record<string, unknown>): Record<string, unknown> {
    const converted: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      // Convert AS/400 field naming to camelCase
      const camelKey = this.toCamelCase(key);

      // Handle data type conversions
      if (typeof value === 'string') {
        // Trim trailing spaces (common in AS/400)
        converted[camelKey] = value.trim();
      } else if (value instanceof Date) {
        converted[camelKey] = value.toISOString();
      } else {
        converted[camelKey] = value;
      }
    }

    return converted;
  }

  private convertToAS400Data(data: Record<string, unknown>): Record<string, unknown> {
    const converted: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      // Convert camelCase to AS/400 field naming (uppercase with underscores)
      const as400Key = this.toAS400Field(key);

      if (typeof value === 'string') {
        // Pad strings to typical AS/400 field lengths
        converted[as400Key] = value.toUpperCase();
      } else if (value instanceof Date) {
        converted[as400Key] = value.toISOString().split('T')[0];
      } else {
        converted[as400Key] = value;
      }
    }

    return converted;
  }

  private toCamelCase(str: string): string {
    return str.toLowerCase().replace(/_([a-z])/g, (_, char) => char.toUpperCase());
  }

  private toAS400Field(str: string): string {
    return str.replace(/([A-Z])/g, '_$1').toUpperCase();
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

export function createAS400Adapter(config: AS400Config): AS400Adapter {
  return new AS400Adapter(config);
}
