/**
 * Enterprise Regulatory Filing System - Filing Generator
 * Generates regulatory reports in required formats (XML, JSON, CSV, PDF)
 */

import { 
  JurisdictionConfig, 
  FilingRequirement, 
  getJurisdictionByCode,
  getFilingRequirement,
  getNextDueDate
} from './jurisdictions';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface FilingData {
  id: string;
  jurisdictionCode: string;
  filingRequirementId: string;
  reportingPeriod: {
    startDate: Date;
    endDate: Date;
    type: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'H1' | 'H2' | 'ANNUAL';
    year: number;
  };
  status: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'SUBMITTED' | 'REJECTED';
  data: Record<string, unknown>;
  metadata: {
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    submittedAt?: Date;
    submittedBy?: string;
    approvedBy?: string;
    approvedAt?: Date;
  };
  validationResults?: ValidationResult[];
  attachments?: Attachment[];
  electronicSignature?: ElectronicSignature;
}

export interface ValidationResult {
  field: string;
  rule: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

export interface ElectronicSignature {
  id: string;
  signerName: string;
  signerTitle: string;
  signerEmail: string;
  signedAt: Date;
  signatureHash: string;
  certificateId: string;
  ipAddress: string;
}

export interface PreSubmissionChecklist {
  items: ChecklistItem[];
  overallStatus: 'PENDING' | 'READY' | 'INCOMPLETE';
}

export interface ChecklistItem {
  id: string;
  description: string;
  required: boolean;
  completed: boolean;
  notes?: string;
}

export interface GeneratedDocument {
  format: 'XML' | 'JSON' | 'CSV' | 'PDF';
  content: string | Buffer;
  filename: string;
  mimeType: string;
  generatedAt: Date;
  checksum: string;
}

// ============================================================================
// VALIDATION ENGINE
// ============================================================================

export class ValidationEngine {
  static validateFiling(
    jurisdictionCode: string,
    filingRequirementId: string,
    data: Record<string, unknown>
  ): ValidationResult[] {
    const results: ValidationResult[] = [];
    const requirement = getFilingRequirement(jurisdictionCode, filingRequirementId);
    
    if (!requirement) {
      results.push({
        field: 'general',
        rule: 'REQUIREMENT_NOT_FOUND',
        status: 'FAIL',
        message: `Filing requirement ${filingRequirementId} not found for jurisdiction ${jurisdictionCode}`,
        severity: 'ERROR',
      });
      return results;
    }

    // Validate required fields
    for (const field of requirement.requiredFields) {
      const value = data[field];
      if (value === undefined || value === null || value === '') {
        results.push({
          field,
          rule: 'REQUIRED',
          status: 'FAIL',
          message: `Field '${field}' is required`,
          severity: 'ERROR',
        });
      }
    }

    // Apply validation rules
    for (const rule of requirement.validationRules) {
      const value = data[rule.field];
      const result = this.applyRule(rule, value);
      results.push(result);
    }

    // Cross-field validations
    results.push(...this.crossFieldValidations(data));

    return results;
  }

  private static applyRule(
    rule: { id: string; field: string; rule: string; value?: string | number; message: string },
    fieldValue: unknown
  ): ValidationResult {
    switch (rule.rule) {
      case 'REQUIRED':
        if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
          return {
            field: rule.field,
            rule: rule.id,
            status: 'FAIL',
            message: rule.message,
            severity: 'ERROR',
          };
        }
        break;

      case 'MIN_VALUE':
        if (typeof fieldValue === 'number' && typeof rule.value === 'number') {
          if (fieldValue < rule.value) {
            return {
              field: rule.field,
              rule: rule.id,
              status: 'FAIL',
              message: rule.message,
              severity: 'ERROR',
            };
          }
        }
        break;

      case 'MAX_VALUE':
        if (typeof fieldValue === 'number' && typeof rule.value === 'number') {
          if (fieldValue > rule.value) {
            return {
              field: rule.field,
              rule: rule.id,
              status: 'FAIL',
              message: rule.message,
              severity: 'ERROR',
            };
          }
        }
        break;

      case 'FORMAT':
        if (typeof fieldValue === 'string' && typeof rule.value === 'string') {
          const regex = new RegExp(rule.value);
          if (!regex.test(fieldValue)) {
            return {
              field: rule.field,
              rule: rule.id,
              status: 'FAIL',
              message: rule.message,
              severity: 'ERROR',
            };
          }
        }
        break;

      case 'RANGE':
        if (typeof fieldValue === 'number' && typeof rule.value === 'string') {
          const [min, max] = rule.value.split('-').map(Number);
          if (fieldValue < min || fieldValue > max) {
            return {
              field: rule.field,
              rule: rule.id,
              status: 'FAIL',
              message: rule.message,
              severity: 'ERROR',
            };
          }
        }
        break;
    }

    return {
      field: rule.field,
      rule: rule.id,
      status: 'PASS',
      message: 'Validation passed',
      severity: 'INFO',
    };
  }

  private static crossFieldValidations(data: Record<string, unknown>): ValidationResult[] {
    const results: ValidationResult[] = [];

    // Validate balance sheet equation
    if (data.assets !== undefined && data.liabilities !== undefined && data.equity !== undefined) {
      const assets = Number(data.assets);
      const liabilities = Number(data.liabilities);
      const equity = Number(data.equity);
      
      if (Math.abs(assets - (liabilities + equity)) > 0.01) {
        results.push({
          field: 'balanceSheet',
          rule: 'BALANCE_EQUATION',
          status: 'FAIL',
          message: 'Assets must equal Liabilities + Equity',
          severity: 'ERROR',
        });
      }
    }

    // Validate technical reserves
    if (data.technicalReserves !== undefined && data.premiums !== undefined) {
      const reserves = Number(data.technicalReserves);
      const premiums = Number(data.premiums);
      
      if (reserves < premiums * 0.5) {
        results.push({
          field: 'technicalReserves',
          rule: 'RESERVE_RATIO',
          status: 'WARNING',
          message: 'Technical reserves appear low relative to premiums',
          severity: 'WARNING',
        });
      }
    }

    // Validate solvency margin
    if (data.solvencyMargin !== undefined) {
      const solvencyMargin = Number(data.solvencyMargin);
      if (solvencyMargin < 100) {
        results.push({
          field: 'solvencyMargin',
          rule: 'SOLVENCY_MINIMUM',
          status: 'FAIL',
          message: 'Solvency margin must be at least 100%',
          severity: 'ERROR',
        });
      } else if (solvencyMargin < 120) {
        results.push({
          field: 'solvencyMargin',
          rule: 'SOLVENCY_WARNING',
          status: 'WARNING',
          message: 'Solvency margin is below recommended level',
          severity: 'WARNING',
        });
      }
    }

    return results;
  }

  static getValidationSummary(results: ValidationResult[]): {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
    isReadyForSubmission: boolean;
  } {
    const total = results.length;
    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    const warnings = results.filter(r => r.status === 'WARNING').length;

    return {
      total,
      passed,
      failed,
      warnings,
      isReadyForSubmission: failed === 0,
    };
  }
}

// ============================================================================
// DOCUMENT GENERATORS
// ============================================================================

export class XMLGenerator {
  static generate(
    jurisdiction: JurisdictionConfig,
    filing: FilingRequirement,
    data: Record<string, unknown>,
    options: { pretty?: boolean; includeHeader?: boolean } = {}
  ): string {
    const { pretty = true, includeHeader = true } = options;
    const indent = pretty ? '  ' : '';
    const newline = pretty ? '\n' : '';

    let xml = '';
    
    if (includeHeader) {
      xml = `<?xml version="1.0" encoding="UTF-8"?>${newline}`;
    }

    xml += `<InsuranceFiling xmlns="urn:insurance:regulatory:${jurisdiction.code.toLowerCase()}"`;
    xml += ` jurisdiction="${jurisdiction.code}" filingType="${filing.type}" filingId="${filing.id}">${newline}`;
    
    xml += `${indent}<Header>${newline}`;
    xml += `${indent}${indent}<Regulator>${jurisdiction.regulator.shortName}</Regulator>${newline}`;
    xml += `${indent}${indent}<Jurisdiction>${jurisdiction.name}</Jurisdiction>${newline}`;
    xml += `${indent}${indent}<FilingName>${filing.name}</FilingName>${newline}`;
    xml += `${indent}${indent}<GeneratedAt>${new Date().toISOString()}</GeneratedAt>${newline}`;
    xml += `${indent}</Header>${newline}`;

    xml += `${indent}<Data>${newline}`;
    for (const [key, value] of Object.entries(data)) {
      xml += this.serializeField(key, value, indent + indent, pretty);
    }
    xml += `${indent}</Data>${newline}`;

    xml += `</InsuranceFiling>`;

    return xml;
  }

  private static serializeField(key: string, value: unknown, indent: string, pretty: boolean): string {
    const newline = pretty ? '\n' : '';
    
    if (value === null || value === undefined) {
      return `${indent}<${key} xsi:nil="true"/>${newline}`;
    }
    
    if (Array.isArray(value)) {
      let xml = `${indent}<${key}>${newline}`;
      for (const item of value) {
        xml += `${indent}  <Item>${this.escapeXml(String(item))}</Item>${newline}`;
      }
      xml += `${indent}</${key}>${newline}`;
      return xml;
    }
    
    if (typeof value === 'object') {
      let xml = `${indent}<${key}>${newline}`;
      for (const [subKey, subValue] of Object.entries(value as Record<string, unknown>)) {
        xml += this.serializeField(subKey, subValue, indent + '  ', pretty);
      }
      xml += `${indent}</${key}>${newline}`;
      return xml;
    }
    
    return `${indent}<${key}>${this.escapeXml(String(value))}</${key}>${newline}`;
  }

  private static escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

export class JSONGenerator {
  static generate(
    jurisdiction: JurisdictionConfig,
    filing: FilingRequirement,
    data: Record<string, unknown>
  ): string {
    const document = {
      metadata: {
        regulator: jurisdiction.regulator.shortName,
        jurisdiction: jurisdiction.code,
        jurisdictionName: jurisdiction.name,
        filingType: filing.type,
        filingId: filing.id,
        filingName: filing.name,
        generatedAt: new Date().toISOString(),
        version: '1.0',
      },
      data: data,
    };

    return JSON.stringify(document, null, 2);
  }
}

export class CSVGenerator {
  static generate(
    jurisdiction: JurisdictionConfig,
    filing: FilingRequirement,
    data: Record<string, unknown>
  ): string {
    const rows: string[][] = [];
    
    // Header row with metadata
    rows.push(['Regulator', 'Jurisdiction', 'Filing Type', 'Filing ID', 'Filing Name', 'Generated At']);
    rows.push([
      jurisdiction.regulator.shortName,
      jurisdiction.code,
      filing.type,
      filing.id,
      filing.name,
      new Date().toISOString(),
    ]);
    
    // Empty row separator
    rows.push([]);
    
    // Data rows
    rows.push(['Field', 'Value']);
    for (const [key, value] of Object.entries(data)) {
      rows.push([key, this.formatValue(value)]);
    }

    return rows.map(row => this.formatRow(row)).join('\n');
  }

  private static formatValue(value: unknown): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  private static formatRow(row: string[]): string {
    return row.map(cell => {
      if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    }).join(',');
  }
}

export class PDFGenerator {
  static generate(
    jurisdiction: JurisdictionConfig,
    filing: FilingRequirement,
    data: Record<string, unknown>
  ): string {
    // Generate HTML that can be converted to PDF
    const html = this.generateHTML(jurisdiction, filing, data);
    return html;
  }

  private static generateHTML(
    jurisdiction: JurisdictionConfig,
    filing: FilingRequirement,
    data: Record<string, unknown>
  ): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${filing.name} - ${jurisdiction.code}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
    h1 { color: #1a365d; border-bottom: 2px solid #1a365d; padding-bottom: 10px; }
    h2 { color: #2c5282; margin-top: 30px; }
    .header { margin-bottom: 30px; }
    .metadata { background: #f7fafc; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    .metadata-item { margin: 5px 0; }
    .label { font-weight: bold; color: #4a5568; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #2c5282; color: white; padding: 12px; text-align: left; }
    td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
    tr:nth-child(even) { background: #f7fafc; }
    .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
    .signature-area { margin-top: 50px; padding: 20px; border: 1px solid #e2e8f0; }
    .signature-line { border-bottom: 1px solid #000; width: 300px; margin-top: 50px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${filing.name}</h1>
    <p>${filing.description}</p>
  </div>
  
  <div class="metadata">
    <div class="metadata-item"><span class="label">Regulator:</span> ${jurisdiction.regulator.name}</div>
    <div class="metadata-item"><span class="label">Jurisdiction:</span> ${jurisdiction.name} (${jurisdiction.code})</div>
    <div class="metadata-item"><span class="label">Filing Type:</span> ${filing.type}</div>
    <div class="metadata-item"><span class="label">Generated:</span> ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    })}</div>
  </div>
  
  <h2>Financial Data</h2>
  <table>
    <thead>
      <tr>
        <th>Field</th>
        <th>Value</th>
      </tr>
    </thead>
    <tbody>
      ${Object.entries(data).map(([key, value]) => `
        <tr>
          <td>${this.formatFieldName(key)}</td>
          <td>${this.formatValue(value)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <div class="signature-area">
    <h3>Certification</h3>
    <p>I hereby certify that the information provided in this filing is true, accurate, and complete to the best of my knowledge.</p>
    
    <div class="signature-line"></div>
    <p>Authorized Signature</p>
    
    <p><span class="label">Name:</span> _______________________</p>
    <p><span class="label">Title:</span> _______________________</p>
    <p><span class="label">Date:</span> _______________________</p>
  </div>
  
  <div class="footer">
    <p><small>Generated by NexusOS Insurance Platform | ${jurisdiction.regulator.website}</small></p>
  </div>
</body>
</html>`;
  }

  private static formatFieldName(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  private static formatValue(value: unknown): string {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'number') {
      return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  }
}

// ============================================================================
// FILING GENERATOR CLASS
// ============================================================================

export class FilingGenerator {
  /**
   * Generate a filing document in the specified format
   */
  static generateDocument(
    jurisdictionCode: string,
    filingRequirementId: string,
    data: Record<string, unknown>,
    format: 'XML' | 'JSON' | 'CSV' | 'PDF'
  ): GeneratedDocument {
    const jurisdiction = getJurisdictionByCode(jurisdictionCode);
    const filing = getFilingRequirement(jurisdictionCode, filingRequirementId);

    if (!jurisdiction || !filing) {
      throw new Error(`Invalid jurisdiction or filing requirement: ${jurisdictionCode}/${filingRequirementId}`);
    }

    let content: string | Buffer;
    let mimeType: string;
    let filename: string;
    const timestamp = new Date().toISOString().split('T')[0];

    switch (format) {
      case 'XML':
        content = XMLGenerator.generate(jurisdiction, filing, data);
        mimeType = 'application/xml';
        filename = `${jurisdiction.code}_${filing.id}_${timestamp}.xml`;
        break;

      case 'JSON':
        content = JSONGenerator.generate(jurisdiction, filing, data);
        mimeType = 'application/json';
        filename = `${jurisdiction.code}_${filing.id}_${timestamp}.json`;
        break;

      case 'CSV':
        content = CSVGenerator.generate(jurisdiction, filing, data);
        mimeType = 'text/csv';
        filename = `${jurisdiction.code}_${filing.id}_${timestamp}.csv`;
        break;

      case 'PDF':
        content = PDFGenerator.generate(jurisdiction, filing, data);
        mimeType = 'text/html'; // HTML that can be converted to PDF
        filename = `${jurisdiction.code}_${filing.id}_${timestamp}.html`;
        break;

      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    return {
      format,
      content,
      filename,
      mimeType,
      generatedAt: new Date(),
      checksum: this.generateChecksum(content),
    };
  }

  /**
   * Generate all required documents for a filing
   */
  static generateAllDocuments(
    jurisdictionCode: string,
    filingRequirementId: string,
    data: Record<string, unknown>
  ): GeneratedDocument[] {
    const jurisdiction = getJurisdictionByCode(jurisdictionCode);
    if (!jurisdiction) {
      throw new Error(`Invalid jurisdiction: ${jurisdictionCode}`);
    }

    const documents: GeneratedDocument[] = [];
    const formats = jurisdiction.dataFormatPreferences.filter(f => f !== 'XBRL') as ('XML' | 'JSON' | 'CSV' | 'PDF')[];

    for (const format of formats) {
      documents.push(
        this.generateDocument(jurisdictionCode, filingRequirementId, data, format)
      );
    }

    return documents;
  }

  /**
   * Generate pre-submission checklist
   */
  static generatePreSubmissionChecklist(
    jurisdictionCode: string,
    filingRequirementId: string,
    filingData: FilingData
  ): PreSubmissionChecklist {
    const jurisdiction = getJurisdictionByCode(jurisdictionCode);
    const filing = getFilingRequirement(jurisdictionCode, filingRequirementId);

    if (!jurisdiction || !filing) {
      throw new Error(`Invalid jurisdiction or filing requirement`);
    }

    const items: ChecklistItem[] = [
      {
        id: 'required-fields',
        description: 'All required fields are populated',
        required: true,
        completed: filing.requiredFields.every(f => 
          filingData.data[f] !== undefined && filingData.data[f] !== null
        ),
      },
      {
        id: 'validation-passed',
        description: 'All validation checks have passed',
        required: true,
        completed: !filingData.validationResults?.some(r => r.status === 'FAIL'),
      },
      {
        id: 'electronic-signature',
        description: 'Electronic signature attached',
        required: jurisdiction.digitalSignatureRequired,
        completed: !!filingData.electronicSignature,
      },
      {
        id: 'attachments',
        description: 'Required attachments included',
        required: false,
        completed: (filingData.attachments?.length ?? 0) > 0,
      },
      {
        id: 'review-approval',
        description: 'Filing has been reviewed and approved',
        required: true,
        completed: filingData.status === 'APPROVED',
      },
      {
        id: 'prior-period-comparison',
        description: 'Prior period comparison reviewed',
        required: false,
        completed: false,
        notes: 'Optional but recommended for accuracy',
      },
      {
        id: 'management-approval',
        description: 'Management sign-off obtained',
        required: true,
        completed: false,
      },
    ];

    // Add jurisdiction-specific items
    if (jurisdiction.governanceRequirements.actuaryRequired && filing.type === 'ANNUAL') {
      items.push({
        id: 'actuarial-opinion',
        description: 'Actuarial opinion attached',
        required: true,
        completed: false,
      });
    }

    if (filing.type === 'ANNUAL') {
      items.push({
        id: 'audited-financials',
        description: 'Audited financial statements attached',
        required: true,
        completed: false,
      });
    }

    const overallStatus = items.every(i => !i.required || i.completed)
      ? 'READY'
      : items.some(i => i.required && !i.completed)
      ? 'INCOMPLETE'
      : 'PENDING';

    return { items, overallStatus };
  }

  /**
   * Create electronic signature
   */
  static createElectronicSignature(
    signerName: string,
    signerTitle: string,
    signerEmail: string,
    certificateId: string,
    ipAddress: string
  ): ElectronicSignature {
    const timestamp = new Date();
    const signatureData = `${signerName}|${signerTitle}|${signerEmail}|${timestamp.toISOString()}`;
    const signatureHash = this.generateChecksum(signatureData);

    return {
      id: `SIG-${Date.now()}`,
      signerName,
      signerTitle,
      signerEmail,
      signedAt: timestamp,
      signatureHash,
      certificateId,
      ipAddress,
    };
  }

  /**
   * Verify electronic signature
   */
  static verifyElectronicSignature(signature: ElectronicSignature): boolean {
    const expectedHash = this.generateChecksum(
      `${signature.signerName}|${signature.signerTitle}|${signature.signerEmail}|${signature.signedAt.toISOString()}`
    );
    return signature.signatureHash === expectedHash;
  }

  /**
   * Generate filing summary
   */
  static generateFilingSummary(filingData: FilingData): {
    title: string;
    jurisdiction: string;
    dueDate: Date;
    status: string;
    validationSummary: string;
    daysUntilDue: number;
  } {
    const jurisdiction = getJurisdictionByCode(filingData.jurisdictionCode);
    const filing = getFilingRequirement(filingData.jurisdictionCode, filingData.filingRequirementId);

    if (!jurisdiction || !filing) {
      throw new Error('Invalid filing data');
    }

    const dueDate = getNextDueDate(filing);
    const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    const validationSummary = filingData.validationResults
      ? ValidationEngine.getValidationSummary(filingData.validationResults)
      : { passed: 0, failed: 0, warnings: 0 };

    return {
      title: filing.name,
      jurisdiction: jurisdiction.name,
      dueDate,
      status: filingData.status,
      validationSummary: `${validationSummary.passed} passed, ${validationSummary.failed} failed, ${validationSummary.warnings} warnings`,
      daysUntilDue,
    };
  }

  private static generateChecksum(content: string | Buffer): string {
    // Simple checksum for demo - in production use crypto
    const str = typeof content === 'string' ? content : content.toString('utf-8');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }
}

// ============================================================================
// FILING MANAGER CLASS
// ============================================================================

export class FilingManager {
  private static filings: Map<string, FilingData> = new Map();

  /**
   * Create a new filing
   */
  static createFiling(
    jurisdictionCode: string,
    filingRequirementId: string,
    reportingPeriod: FilingData['reportingPeriod'],
    createdBy: string
  ): FilingData {
    const filing: FilingData = {
      id: `FIL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      jurisdictionCode,
      filingRequirementId,
      reportingPeriod,
      status: 'DRAFT',
      data: {},
      metadata: {
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    this.filings.set(filing.id, filing);
    return filing;
  }

  /**
   * Update filing data
   */
  static updateFiling(filingId: string, data: Record<string, unknown>): FilingData {
    const filing = this.filings.get(filingId);
    if (!filing) {
      throw new Error(`Filing not found: ${filingId}`);
    }

    if (filing.status !== 'DRAFT' && filing.status !== 'PENDING_REVIEW') {
      throw new Error(`Cannot update filing in status: ${filing.status}`);
    }

    filing.data = { ...filing.data, ...data };
    filing.metadata.updatedAt = new Date();

    // Run validation
    filing.validationResults = ValidationEngine.validateFiling(
      filing.jurisdictionCode,
      filing.filingRequirementId,
      filing.data
    );

    return filing;
  }

  /**
   * Submit filing for review
   */
  static submitForReview(filingId: string): FilingData {
    const filing = this.filings.get(filingId);
    if (!filing) {
      throw new Error(`Filing not found: ${filingId}`);
    }

    // Run validation before submission
    filing.validationResults = ValidationEngine.validateFiling(
      filing.jurisdictionCode,
      filing.filingRequirementId,
      filing.data
    );

    const summary = ValidationEngine.getValidationSummary(filing.validationResults);
    if (!summary.isReadyForSubmission) {
      throw new Error('Filing has validation errors. Please fix before submitting.');
    }

    filing.status = 'PENDING_REVIEW';
    filing.metadata.updatedAt = new Date();
    return filing;
  }

  /**
   * Approve filing
   */
  static approveFiling(filingId: string, approvedBy: string): FilingData {
    const filing = this.filings.get(filingId);
    if (!filing) {
      throw new Error(`Filing not found: ${filingId}`);
    }

    if (filing.status !== 'PENDING_REVIEW') {
      throw new Error('Filing must be pending review to approve');
    }

    filing.status = 'APPROVED';
    filing.metadata.approvedBy = approvedBy;
    filing.metadata.approvedAt = new Date();
    filing.metadata.updatedAt = new Date();
    return filing;
  }

  /**
   * Submit filing to regulator
   */
  static submitToRegulator(filingId: string, submittedBy: string): FilingData & { documents: GeneratedDocument[] } {
    const filing = this.filings.get(filingId);
    if (!filing) {
      throw new Error(`Filing not found: ${filingId}`);
    }

    if (filing.status !== 'APPROVED') {
      throw new Error('Filing must be approved before submission');
    }

    const jurisdiction = getJurisdictionByCode(filing.jurisdictionCode);
    if (!jurisdiction) {
      throw new Error('Invalid jurisdiction');
    }

    // Generate all required documents
    const documents = FilingGenerator.generateAllDocuments(
      filing.jurisdictionCode,
      filing.filingRequirementId,
      filing.data
    );

    filing.status = 'SUBMITTED';
    filing.metadata.submittedAt = new Date();
    filing.metadata.submittedBy = submittedBy;
    filing.metadata.updatedAt = new Date();

    return { ...filing, documents };
  }

  /**
   * Get filing by ID
   */
  static getFiling(filingId: string): FilingData | undefined {
    return this.filings.get(filingId);
  }

  /**
   * Get all filings for a jurisdiction
   */
  static getFilingsByJurisdiction(jurisdictionCode: string): FilingData[] {
    return Array.from(this.filings.values()).filter(
      f => f.jurisdictionCode === jurisdictionCode
    );
  }

  /**
   * Get all filings
   */
  static getAllFilings(): FilingData[] {
    return Array.from(this.filings.values());
  }

  /**
   * Add attachment to filing
   */
  static addAttachment(
    filingId: string,
    attachment: Omit<Attachment, 'id' | 'uploadedAt'>
  ): FilingData {
    const filing = this.filings.get(filingId);
    if (!filing) {
      throw new Error(`Filing not found: ${filingId}`);
    }

    if (!filing.attachments) {
      filing.attachments = [];
    }

    filing.attachments.push({
      ...attachment,
      id: `ATT-${Date.now()}`,
      uploadedAt: new Date(),
    });

    filing.metadata.updatedAt = new Date();
    return filing;
  }

  /**
   * Add electronic signature to filing
   */
  static addElectronicSignature(filingId: string, signature: ElectronicSignature): FilingData {
    const filing = this.filings.get(filingId);
    if (!filing) {
      throw new Error(`Filing not found: ${filingId}`);
    }

    filing.electronicSignature = signature;
    filing.metadata.updatedAt = new Date();
    return filing;
  }
}

// Re-export for convenience
export { getJurisdictionByCode, getFilingRequirement, getNextDueDate };
