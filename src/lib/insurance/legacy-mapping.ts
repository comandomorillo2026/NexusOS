/**
 * Legacy Entity Mapping for Insurance Platform
 * Supports policy, claims, customer, financial, and historical data mapping
 * between legacy systems and NexusOS modern data structures
 */

import { DataTransformation, FieldMapping, ValidationRule } from './integration-framework';

// ============================================================================
// Core Types
// ============================================================================

export interface EntityMapping {
  name: string;
  sourceSystem: 'mainframe' | 'as400' | 'file' | 'api';
  sourceEntity: string;
  targetEntity: string;
  fieldMappings: FieldMapping[];
  transformations: FieldTransformation[];
  validations: ValidationRule[];
  defaultValues: Record<string, unknown>;
  postProcessors: PostProcessor[];
}

export interface FieldTransformation {
  sourceField: string;
  targetField: string;
  type: TransformationType;
  config?: Record<string, unknown>;
}

export type TransformationType =
  | 'direct' | 'format' | 'lookup' | 'concat' | 'split' | 'math' | 'date'
  | 'conditional' | 'script' | 'aggregate' | 'nested';

export interface PostProcessor {
  name: string;
  order: number;
  config: Record<string, unknown>;
}

export interface LookupTable {
  name: string;
  entries: Map<string, unknown>;
  defaultValue?: unknown;
}

// ============================================================================
// Policy Data Mapping
// ============================================================================

export const policyMapping: EntityMapping = {
  name: 'Policy',
  sourceSystem: 'mainframe',
  sourceEntity: 'POLICY_MASTER',
  targetEntity: 'Policy',
  fieldMappings: [
    // Policy Identification
    { sourceField: 'POL_NUM', targetField: 'policyNumber', required: true },
    { sourceField: 'POL_ID', targetField: 'legacyId', required: false },

    // Insured Information
    { sourceField: 'INS_NAME', targetField: 'insuredName', required: true },
    { sourceField: 'INS_ADDR1', targetField: 'insuredAddress.line1' },
    { sourceField: 'INS_ADDR2', targetField: 'insuredAddress.line2' },
    { sourceField: 'INS_CITY', targetField: 'insuredAddress.city' },
    { sourceField: 'INS_STATE', targetField: 'insuredAddress.state' },
    { sourceField: 'INS_ZIP', targetField: 'insuredAddress.postalCode' },
    { sourceField: 'INS_COUNTRY', targetField: 'insuredAddress.country', defaultValue: 'TT' },
    { sourceField: 'INS_PHONE', targetField: 'insuredPhone' },
    { sourceField: 'INS_EMAIL', targetField: 'insuredEmail' },
    { sourceField: 'INS_DOB', targetField: 'insuredDateOfBirth', transform: 'format' },
    { sourceField: 'INS_GENDER', targetField: 'insuredGender' },

    // Product Information
    { sourceField: 'PROD_CODE', targetField: 'productCode', required: true },
    { sourceField: 'PROD_NAME', targetField: 'productName' },
    { sourceField: 'LOB_CODE', targetField: 'lineOfBusiness', required: true },

    // Coverage Information
    { sourceField: 'EFF_DATE', targetField: 'effectiveDate', required: true, transform: 'format' },
    { sourceField: 'EXP_DATE', targetField: 'expiryDate', required: true, transform: 'format' },
    { sourceField: 'ISSUE_DATE', targetField: 'issueDate', transform: 'format' },
    { sourceField: 'PREM_AMT', targetField: 'premiumAmount', required: true },
    { sourceField: 'SUM_INS', targetField: 'sumInsured', required: true },
    { sourceField: 'PREM_MODE', targetField: 'premiumMode' },
    { sourceField: 'DEDUCTIBLE', targetField: 'deductible' },

    // Status Information
    { sourceField: 'POL_STATUS', targetField: 'status', required: true },
    { sourceField: 'PAY_STATUS', targetField: 'paymentStatus' },
    { sourceField: 'RISK_RATE', targetField: 'riskRating' },
    { sourceField: 'UNDERWRITE_DT', targetField: 'underwritingDate', transform: 'format' },

    // Distribution Information
    { sourceField: 'AGENT_CODE', targetField: 'agentCode' },
    { sourceField: 'AGENT_NAME', targetField: 'agentName' },
    { sourceField: 'BRANCH_CODE', targetField: 'branchCode' },

    // Additional Information
    { sourceField: 'COMMENTS', targetField: 'notes' },
    { sourceField: 'CREATE_DT', targetField: 'createdAt', transform: 'format' },
    { sourceField: 'UPDATE_DT', targetField: 'updatedAt', transform: 'format' },
    { sourceField: 'CREATE_USER', targetField: 'createdBy' },
    { sourceField: 'UPDATE_USER', targetField: 'updatedBy' },
  ],
  transformations: [
    {
      sourceField: 'POL_STATUS',
      targetField: 'statusCode',
      type: 'lookup',
      config: { table: 'policyStatus' },
    },
    {
      sourceField: 'LOB_CODE',
      targetField: 'lineOfBusinessCode',
      type: 'lookup',
      config: { table: 'lineOfBusiness' },
    },
    {
      sourceField: 'PREM_MODE',
      targetField: 'premiumModeDescription',
      type: 'lookup',
      config: { table: 'premiumMode' },
    },
    {
      sourceField: 'INS_NAME',
      targetField: 'insuredName',
      type: 'format',
      config: { operation: 'trim' },
    },
    {
      sourceField: 'INS_EMAIL',
      targetField: 'insuredEmail',
      type: 'format',
      config: { operation: 'lowercase' },
    },
  ],
  validations: [
    { field: 'policyNumber', type: 'required', config: {}, errorMessage: 'Policy number is required' },
    { field: 'insuredName', type: 'required', config: {}, errorMessage: 'Insured name is required' },
    { field: 'effectiveDate', type: 'format', config: { pattern: '^\\d{4}-\\d{2}-\\d{2}$' }, errorMessage: 'Invalid date format' },
    { field: 'premiumAmount', type: 'range', config: { min: 0 }, errorMessage: 'Premium must be positive' },
    { field: 'sumInsured', type: 'range', config: { min: 0 }, errorMessage: 'Sum insured must be positive' },
  ],
  defaultValues: {
    status: 'pending',
    paymentStatus: 'pending',
    country: 'TT',
    currency: 'TTD',
    createdAt: () => new Date().toISOString(),
    updatedAt: () => new Date().toISOString(),
  },
  postProcessors: [
    { name: 'calculatePremiumTax', order: 1, config: { taxRate: 0.125 } },
    { name: 'generatePolicyId', order: 2, config: { prefix: 'POL' } },
    { name: 'validateCoverage', order: 3, config: {} },
  ],
};

// ============================================================================
// Claims Data Mapping
// ============================================================================

export const claimMapping: EntityMapping = {
  name: 'Claim',
  sourceSystem: 'as400',
  sourceEntity: 'CLAIMS_MAST',
  targetEntity: 'Claim',
  fieldMappings: [
    // Claim Identification
    { sourceField: 'CLM_NUM', targetField: 'claimNumber', required: true },
    { sourceField: 'CLM_ID', targetField: 'legacyId' },
    { sourceField: 'POL_NUM', targetField: 'policyNumber', required: true },

    // Claimant Information
    { sourceField: 'CLM_NAME', targetField: 'claimantName', required: true },
    { sourceField: 'CLM_PHONE', targetField: 'claimantPhone' },
    { sourceField: 'CLM_EMAIL', targetField: 'claimantEmail' },
    { sourceField: 'CLM_ADDR', targetField: 'claimantAddress' },

    // Claim Details
    { sourceField: 'CLM_DATE', targetField: 'claimDate', required: true, transform: 'format' },
    { sourceField: 'LOSS_DATE', targetField: 'lossDate', required: true, transform: 'format' },
    { sourceField: 'REPORT_DATE', targetField: 'reportDate', transform: 'format' },
    { sourceField: 'CLM_TYPE', targetField: 'claimType', required: true },
    { sourceField: 'CLM_DESC', targetField: 'claimDescription' },
    { sourceField: 'CLM_AMT', targetField: 'claimedAmount', required: true },
    { sourceField: 'APP_AMT', targetField: 'approvedAmount' },
    { sourceField: 'PAID_AMT', targetField: 'paidAmount' },

    // Status Information
    { sourceField: 'CLM_STATUS', targetField: 'status', required: true },
    { sourceField: 'CLM_STAGE', targetField: 'stage' },
    { sourceField: 'RESERVE_AMT', targetField: 'reserveAmount' },

    // Assignment Information
    { sourceField: 'ADJ_CODE', targetField: 'adjusterCode' },
    { sourceField: 'ADJ_NAME', targetField: 'adjusterName' },
    { sourceField: 'ASSIGN_DT', targetField: 'assignedDate', transform: 'format' },

    // Processing Information
    { sourceField: 'OPEN_DT', targetField: 'openedAt', transform: 'format' },
    { sourceField: 'CLOSE_DT', targetField: 'closedAt', transform: 'format' },
    { sourceField: 'REOPEN_DT', targetField: 'reopenedAt', transform: 'format' },
    { sourceField: 'CLOSE_REASON', targetField: 'closureReason' },

    // Additional Information
    { sourceField: 'POLICE_RPT', targetField: 'policeReportNumber' },
    { sourceField: 'POLICE_DT', targetField: 'policeReportDate', transform: 'format' },
    { sourceField: 'WITNESS_INFO', targetField: 'witnessInfo' },
    { sourceField: 'NOTES', targetField: 'notes' },
    { sourceField: 'CREATE_DT', targetField: 'createdAt', transform: 'format' },
    { sourceField: 'UPDATE_DT', targetField: 'updatedAt', transform: 'format' },
  ],
  transformations: [
    {
      sourceField: 'CLM_STATUS',
      targetField: 'statusCode',
      type: 'lookup',
      config: { table: 'claimStatus' },
    },
    {
      sourceField: 'CLM_TYPE',
      targetField: 'claimTypeCode',
      type: 'lookup',
      config: { table: 'claimType' },
    },
    {
      sourceField: 'CLM_DESC',
      targetField: 'claimDescription',
      type: 'format',
      config: { operation: 'trim' },
    },
  ],
  validations: [
    { field: 'claimNumber', type: 'required', config: {}, errorMessage: 'Claim number is required' },
    { field: 'policyNumber', type: 'required', config: {}, errorMessage: 'Policy number is required' },
    { field: 'claimDate', type: 'format', config: { pattern: '^\\d{4}-\\d{2}-\\d{2}$' }, errorMessage: 'Invalid date format' },
    { field: 'claimedAmount', type: 'range', config: { min: 0 }, errorMessage: 'Claim amount must be positive' },
  ],
  defaultValues: {
    status: 'open',
    stage: 'new',
    createdAt: () => new Date().toISOString(),
    updatedAt: () => new Date().toISOString(),
  },
  postProcessors: [
    { name: 'calculateReserve', order: 1, config: {} },
    { name: 'assignAdjuster', order: 2, config: { autoAssign: true } },
    { name: 'validatePolicy', order: 3, config: {} },
  ],
};

// ============================================================================
// Customer Data Mapping
// ============================================================================

export const customerMapping: EntityMapping = {
  name: 'Customer',
  sourceSystem: 'file',
  sourceEntity: 'CUSTOMER_MAST',
  targetEntity: 'Customer',
  fieldMappings: [
    // Identification
    { sourceField: 'CUST_ID', targetField: 'customerId', required: true },
    { sourceField: 'CUST_NUM', targetField: 'customerNumber' },

    // Personal Information
    { sourceField: 'FST_NAME', targetField: 'firstName', required: true },
    { sourceField: 'LST_NAME', targetField: 'lastName', required: true },
    { sourceField: 'MID_NAME', targetField: 'middleName' },
    { sourceField: 'DOB', targetField: 'dateOfBirth', transform: 'format' },
    { sourceField: 'GENDER', targetField: 'gender' },
    { sourceField: 'NATIONAL_ID', targetField: 'nationalId' },
    { sourceField: 'TAX_ID', targetField: 'taxId' },
    { sourceField: 'MARITAL_STATUS', targetField: 'maritalStatus' },
    { sourceField: 'OCCUPATION', targetField: 'occupation' },

    // Contact Information
    { sourceField: 'EMAIL', targetField: 'email', transform: 'format' },
    { sourceField: 'PHONE1', targetField: 'primaryPhone' },
    { sourceField: 'PHONE2', targetField: 'secondaryPhone' },
    { sourceField: 'MOBILE', targetField: 'mobilePhone' },
    { sourceField: 'FAX', targetField: 'fax' },

    // Address Information
    { sourceField: 'ADDR1', targetField: 'address.line1' },
    { sourceField: 'ADDR2', targetField: 'address.line2' },
    { sourceField: 'CITY', targetField: 'address.city' },
    { sourceField: 'STATE', targetField: 'address.state' },
    { sourceField: 'ZIP', targetField: 'address.postalCode' },
    { sourceField: 'COUNTRY', targetField: 'address.country', defaultValue: 'TT' },

    // Mailing Address
    { sourceField: 'MAIL_ADDR1', targetField: 'mailingAddress.line1' },
    { sourceField: 'MAIL_ADDR2', targetField: 'mailingAddress.line2' },
    { sourceField: 'MAIL_CITY', targetField: 'mailingAddress.city' },
    { sourceField: 'MAIL_STATE', targetField: 'mailingAddress.state' },
    { sourceField: 'MAIL_ZIP', targetField: 'mailingAddress.postalCode' },
    { sourceField: 'MAIL_COUNTRY', targetField: 'mailingAddress.country' },

    // Business Information
    { sourceField: 'COMPANY_NAME', targetField: 'companyName' },
    { sourceField: 'BUSINESS_TYPE', targetField: 'businessType' },
    { sourceField: 'INDUSTRY', targetField: 'industry' },

    // Preferences
    { sourceField: 'PREF_LANG', targetField: 'preferredLanguage', defaultValue: 'en' },
    { sourceField: 'PREF_CONTACT', targetField: 'preferredContactMethod' },
    { sourceField: 'MARKETING_OPT', targetField: 'marketingOptIn' },

    // Metadata
    { sourceField: 'CREATE_DT', targetField: 'createdAt', transform: 'format' },
    { sourceField: 'UPDATE_DT', targetField: 'updatedAt', transform: 'format' },
    { sourceField: 'STATUS', targetField: 'status', defaultValue: 'active' },
  ],
  transformations: [
    {
      sourceField: 'FST_NAME',
      targetField: 'firstName',
      type: 'format',
      config: { operation: 'trim' },
    },
    {
      sourceField: 'LST_NAME',
      targetField: 'lastName',
      type: 'format',
      config: { operation: 'trim' },
    },
    {
      sourceField: 'EMAIL',
      targetField: 'email',
      type: 'format',
      config: { operation: 'lowercase' },
    },
    {
      sourceField: 'FST_NAME',
      targetField: 'fullName',
      type: 'concat',
      config: {
        fields: ['FST_NAME', 'MID_NAME', 'LST_NAME'],
        separator: ' ',
        ignoreNull: true,
      },
    },
    {
      sourceField: 'GENDER',
      targetField: 'genderCode',
      type: 'lookup',
      config: { table: 'gender' },
    },
  ],
  validations: [
    { field: 'customerId', type: 'required', config: {}, errorMessage: 'Customer ID is required' },
    { field: 'firstName', type: 'required', config: {}, errorMessage: 'First name is required' },
    { field: 'lastName', type: 'required', config: {}, errorMessage: 'Last name is required' },
    { field: 'email', type: 'format', config: { pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$' }, errorMessage: 'Invalid email format' },
  ],
  defaultValues: {
    status: 'active',
    country: 'TT',
    preferredLanguage: 'en',
    createdAt: () => new Date().toISOString(),
    updatedAt: () => new Date().toISOString(),
  },
  postProcessors: [
    { name: 'deduplicate', order: 1, config: { fields: ['email', 'nationalId'] } },
    { name: 'validateAddress', order: 2, config: {} },
    { name: 'calculateRiskScore', order: 3, config: {} },
  ],
};

// ============================================================================
// Financial Data Mapping
// ============================================================================

export const financialMapping: EntityMapping = {
  name: 'Financial',
  sourceSystem: 'mainframe',
  sourceEntity: 'FIN_TRANS',
  targetEntity: 'FinancialTransaction',
  fieldMappings: [
    // Transaction Identification
    { sourceField: 'TRANS_ID', targetField: 'transactionId', required: true },
    { sourceField: 'TRANS_NUM', targetField: 'transactionNumber' },
    { sourceField: 'BATCH_ID', targetField: 'batchId' },

    // Reference Information
    { sourceField: 'POL_NUM', targetField: 'policyNumber' },
    { sourceField: 'CLM_NUM', targetField: 'claimNumber' },
    { sourceField: 'CUST_ID', targetField: 'customerId' },
    { sourceField: 'AGENT_CODE', targetField: 'agentCode' },

    // Transaction Details
    { sourceField: 'TRANS_TYPE', targetField: 'transactionType', required: true },
    { sourceField: 'TRANS_DATE', targetField: 'transactionDate', required: true, transform: 'format' },
    { sourceField: 'TRANS_AMT', targetField: 'transactionAmount', required: true },
    { sourceField: 'TRANS_CURRENCY', targetField: 'currency', defaultValue: 'TTD' },
    { sourceField: 'TRANS_DESC', targetField: 'description' },

    // Payment Information
    { sourceField: 'PAY_METHOD', targetField: 'paymentMethod' },
    { sourceField: 'PAY_REF', targetField: 'paymentReference' },
    { sourceField: 'PAY_DATE', targetField: 'paymentDate', transform: 'format' },
    { sourceField: 'BANK_CODE', targetField: 'bankCode' },
    { sourceField: 'BANK_ACCT', targetField: 'bankAccount' },

    // Accounting Information
    { sourceField: 'GL_ACCT', targetField: 'glAccount' },
    { sourceField: 'COST_CENTER', targetField: 'costCenter' },
    { sourceField: 'DEBIT_AMT', targetField: 'debitAmount' },
    { sourceField: 'CREDIT_AMT', targetField: 'creditAmount' },

    // Period Information
    { sourceField: 'PERIOD_MONTH', targetField: 'periodMonth' },
    { sourceField: 'PERIOD_YEAR', targetField: 'periodYear' },
    { sourceField: 'POST_DATE', targetField: 'postDate', transform: 'format' },
    { sourceField: 'POST_STATUS', targetField: 'postStatus' },

    // Metadata
    { sourceField: 'CREATE_DT', targetField: 'createdAt', transform: 'format' },
    { sourceField: 'CREATE_USER', targetField: 'createdBy' },
    { sourceField: 'UPDATE_DT', targetField: 'updatedAt', transform: 'format' },
    { sourceField: 'UPDATE_USER', targetField: 'updatedBy' },
  ],
  transformations: [
    {
      sourceField: 'TRANS_TYPE',
      targetField: 'transactionTypeCode',
      type: 'lookup',
      config: { table: 'transactionType' },
    },
    {
      sourceField: 'PAY_METHOD',
      targetField: 'paymentMethodCode',
      type: 'lookup',
      config: { table: 'paymentMethod' },
    },
    {
      sourceField: 'TRANS_AMT',
      targetField: 'signedAmount',
      type: 'math',
      config: {
        operation: 'multiply',
        operand: 'TRANS_TYPE',
        conditions: [
          { when: 'DEBIT', multiplier: 1 },
          { when: 'CREDIT', multiplier: -1 },
        ],
      },
    },
  ],
  validations: [
    { field: 'transactionId', type: 'required', config: {}, errorMessage: 'Transaction ID is required' },
    { field: 'transactionType', type: 'required', config: {}, errorMessage: 'Transaction type is required' },
    { field: 'transactionAmount', type: 'range', config: { min: 0.01 }, errorMessage: 'Transaction amount must be positive' },
  ],
  defaultValues: {
    currency: 'TTD',
    postStatus: 'pending',
    createdAt: () => new Date().toISOString(),
    updatedAt: () => new Date().toISOString(),
  },
  postProcessors: [
    { name: 'calculateTaxes', order: 1, config: {} },
    { name: 'validateGLCodes', order: 2, config: {} },
    { name: 'reconcileTransaction', order: 3, config: {} },
  ],
};

// ============================================================================
// Historical Data Import Mapping
// ============================================================================

export const historicalDataMapping: EntityMapping = {
  name: 'HistoricalImport',
  sourceSystem: 'file',
  sourceEntity: 'HIST_DATA',
  targetEntity: 'HistoricalRecord',
  fieldMappings: [
    // Record Identification
    { sourceField: 'REC_ID', targetField: 'recordId', required: true },
    { sourceField: 'REC_TYPE', targetField: 'recordType', required: true },
    { sourceField: 'REC_VER', targetField: 'recordVersion' },

    // Source System Information
    { sourceField: 'SOURCE_SYS', targetField: 'sourceSystem' },
    { sourceField: 'SOURCE_ID', targetField: 'sourceId' },
    { sourceField: 'IMPORT_BATCH', targetField: 'importBatchId' },

    // Timestamp Information
    { sourceField: 'ORIG_DATE', targetField: 'originalDate', transform: 'format' },
    { sourceField: 'MOD_DATE', targetField: 'modifiedDate', transform: 'format' },
    { sourceField: 'IMPORT_DATE', targetField: 'importDate', transform: 'format' },

    // Data Content
    { sourceField: 'DATA_CONTENT', targetField: 'rawData' },
    { sourceField: 'DATA_FORMAT', targetField: 'dataFormat' },
    { sourceField: 'DATA_SCHEMA', targetField: 'dataSchema' },

    // Transformation Information
    { sourceField: 'TRANS_STATUS', targetField: 'transformationStatus' },
    { sourceField: 'TRANS_DATE', targetField: 'transformedAt', transform: 'format' },
    { sourceField: 'TRANS_ERROR', targetField: 'transformationError' },

    // Validation Information
    { sourceField: 'VAL_STATUS', targetField: 'validationStatus' },
    { sourceField: 'VAL_DATE', targetField: 'validatedAt', transform: 'format' },
    { sourceField: 'VAL_ERRORS', targetField: 'validationErrors' },

    // Audit Information
    { sourceField: 'CREATE_DT', targetField: 'createdAt', transform: 'format' },
    { sourceField: 'CREATE_USER', targetField: 'createdBy' },
    { sourceField: 'UPDATE_DT', targetField: 'updatedAt', transform: 'format' },
  ],
  transformations: [
    {
      sourceField: 'REC_TYPE',
      targetField: 'recordTypeCode',
      type: 'lookup',
      config: { table: 'recordType' },
    },
    {
      sourceField: 'DATA_CONTENT',
      targetField: 'parsedData',
      type: 'script',
      config: {
        language: 'jsonpath',
        expression: '$.data',
      },
    },
  ],
  validations: [
    { field: 'recordId', type: 'required', config: {}, errorMessage: 'Record ID is required' },
    { field: 'recordType', type: 'required', config: {}, errorMessage: 'Record type is required' },
  ],
  defaultValues: {
    transformationStatus: 'pending',
    validationStatus: 'pending',
    importDate: () => new Date().toISOString(),
    createdAt: () => new Date().toISOString(),
    updatedAt: () => new Date().toISOString(),
  },
  postProcessors: [
    { name: 'parseData', order: 1, config: {} },
    { name: 'validateSchema', order: 2, config: {} },
    { name: 'transformToTarget', order: 3, config: {} },
    { name: 'archiveOriginal', order: 4, config: {} },
  ],
};

// ============================================================================
// Lookup Tables
// ============================================================================

export const lookupTables: Map<string, LookupTable> = new Map([
  ['policyStatus', {
    name: 'policyStatus',
    entries: new Map([
      ['A', 'active'],
      ['P', 'pending'],
      ['L', 'lapsed'],
      ['C', 'cancelled'],
      ['E', 'expired'],
      ['S', 'suspended'],
      ['R', 'reinstated'],
    ]),
    defaultValue: 'unknown',
  }],
  ['claimStatus', {
    name: 'claimStatus',
    entries: new Map([
      ['O', 'open'],
      ['R', 'in_review'],
      ['A', 'approved'],
      ['D', 'denied'],
      ['P', 'paid'],
      ['C', 'closed'],
      ['RE', 'reopened'],
    ]),
    defaultValue: 'unknown',
  }],
  ['lineOfBusiness', {
    name: 'lineOfBusiness',
    entries: new Map([
      ['LIFE', 'Life Insurance'],
      ['HEALTH', 'Health Insurance'],
      ['MOTOR', 'Motor Insurance'],
      ['PROPERTY', 'Property Insurance'],
      ['MARINE', 'Marine Insurance'],
      ['LIABILITY', 'Liability Insurance'],
      ['TRAVEL', 'Travel Insurance'],
    ]),
    defaultValue: 'Other',
  }],
  ['premiumMode', {
    name: 'premiumMode',
    entries: new Map([
      ['M', 'Monthly'],
      ['Q', 'Quarterly'],
      ['S', 'Semi-Annual'],
      ['A', 'Annual'],
      ['SP', 'Single Premium'],
    ]),
    defaultValue: 'Unknown',
  }],
  ['gender', {
    name: 'gender',
    entries: new Map([
      ['M', 'male'],
      ['F', 'female'],
      ['O', 'other'],
      ['U', 'unknown'],
    ]),
    defaultValue: 'unknown',
  }],
  ['transactionType', {
    name: 'transactionType',
    entries: new Map([
      ['PREM', 'Premium'],
      ['CLM_PMT', 'Claim Payment'],
      ['COMM', 'Commission'],
      ['REF', 'Refund'],
      ['ENDORSE', 'Endorsement'],
      ['REIN', 'Reinsurance'],
      ['FEE', 'Fee'],
    ]),
    defaultValue: 'Other',
  }],
  ['paymentMethod', {
    name: 'paymentMethod',
    entries: new Map([
      ['CC', 'Credit Card'],
      ['DC', 'Debit Card'],
      ['BA', 'Bank Transfer'],
      ['CH', 'Cheque'],
      ['CA', 'Cash'],
      ['DD', 'Direct Debit'],
    ]),
    defaultValue: 'Other',
  }],
  ['claimType', {
    name: 'claimType',
    entries: new Map([
      ['ACC', 'Accident'],
      ['ILL', 'Illness'],
      ['DEATH', 'Death'],
      ['MAT', 'Maternity'],
      ['PROP', 'Property Damage'],
      ['THEFT', 'Theft'],
      ['LIAB', 'Liability'],
    ]),
    defaultValue: 'Other',
  }],
]);

// ============================================================================
// Entity Mapping Service
// ============================================================================

export class EntityMappingService {
  private mappings: Map<string, EntityMapping> = new Map();
  private lookupTables: Map<string, LookupTable> = new Map(lookupTables);

  constructor() {
    // Register default mappings
    this.registerMapping(policyMapping);
    this.registerMapping(claimMapping);
    this.registerMapping(customerMapping);
    this.registerMapping(financialMapping);
    this.registerMapping(historicalDataMapping);
  }

  registerMapping(mapping: EntityMapping): void {
    this.mappings.set(mapping.name.toLowerCase(), mapping);
  }

  getMapping(entityName: string): EntityMapping | undefined {
    return this.mappings.get(entityName.toLowerCase());
  }

  getAllMappings(): EntityMapping[] {
    return Array.from(this.mappings.values());
  }

  // Transform source data to target format
  transform<T = Record<string, unknown>>(
    entityName: string,
    sourceData: Record<string, unknown>
  ): { data: T; errors: string[] } {
    const mapping = this.getMapping(entityName);
    if (!mapping) {
      return {
        data: {} as T,
        errors: [`No mapping found for entity: ${entityName}`],
      };
    }

    const targetData: Record<string, unknown> = { ...mapping.defaultValues };
    const errors: string[] = [];

    // Apply field mappings
    for (const fieldMapping of mapping.fieldMappings) {
      try {
        const value = this.applyFieldMapping(sourceData, fieldMapping);
        if (value !== undefined) {
          this.setNestedValue(targetData, fieldMapping.targetField, value);
        } else if (fieldMapping.required && fieldMapping.defaultValue === undefined) {
          errors.push(`Required field missing: ${fieldMapping.sourceField}`);
        }
      } catch (error) {
        errors.push(`Error mapping field ${fieldMapping.sourceField}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Apply transformations
    for (const transformation of mapping.transformations) {
      try {
        const value = this.applyTransformation(sourceData, transformation);
        if (value !== undefined) {
          this.setNestedValue(targetData, transformation.targetField, value);
        }
      } catch (error) {
        errors.push(`Error transforming field ${transformation.sourceField}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Run validations
    for (const validation of mapping.validations) {
      const value = this.getNestedValue(targetData, validation.field);
      if (!this.validateField(value, validation)) {
        errors.push(validation.errorMessage);
      }
    }

    return { data: targetData as T, errors };
  }

  // Transform array of records
  transformBatch<T = Record<string, unknown>>(
    entityName: string,
    sourceData: Record<string, unknown>[]
  ): { data: T[]; errors: { index: number; errors: string[] }[] } {
    const results: T[] = [];
    const allErrors: { index: number; errors: string[] }[] = [];

    for (let i = 0; i < sourceData.length; i++) {
      const { data, errors } = this.transform<T>(entityName, sourceData[i]);
      results.push(data);
      if (errors.length > 0) {
        allErrors.push({ index: i, errors });
      }
    }

    return { data: results, errors: allErrors };
  }

  // Reverse transform (target to source)
  reverseTransform(
    entityName: string,
    targetData: Record<string, unknown>
  ): { data: Record<string, unknown>; errors: string[] } {
    const mapping = this.getMapping(entityName);
    if (!mapping) {
      return {
        data: {},
        errors: [`No mapping found for entity: ${entityName}`],
      };
    }

    const sourceData: Record<string, unknown> = {};
    const errors: string[] = [];

    // Reverse field mappings
    for (const fieldMapping of mapping.fieldMappings) {
      const value = this.getNestedValue(targetData, fieldMapping.targetField);
      if (value !== undefined) {
        sourceData[fieldMapping.sourceField] = value;
      }
    }

    return { data: sourceData, errors };
  }

  // Register custom lookup table
  registerLookupTable(table: LookupTable): void {
    this.lookupTables.set(table.name, table);
  }

  // Get lookup value
  lookup(tableName: string, key: string): unknown {
    const table = this.lookupTables.get(tableName);
    if (!table) return undefined;

    return table.entries.get(key) ?? table.defaultValue;
  }

  // Private methods
  private applyFieldMapping(sourceData: Record<string, unknown>, mapping: FieldMapping): unknown {
    const value = this.getNestedValue(sourceData, mapping.sourceField);

    if (value === undefined || value === null) {
      if (typeof mapping.defaultValue === 'function') {
        return mapping.defaultValue();
      }
      return mapping.defaultValue;
    }

    // Apply transform if specified
    if (mapping.transform) {
      return this.applyTransform(value, mapping.transform, mapping.customTransform);
    }

    return value;
  }

  private applyTransform(value: unknown, transform: string, customTransform?: string): unknown {
    if (typeof value !== 'string') return value;

    switch (transform) {
      case 'uppercase':
        return value.toUpperCase();
      case 'lowercase':
        return value.toLowerCase();
      case 'trim':
        return value.trim();
      case 'format':
        return customTransform ? this.formatValue(value, customTransform) : value;
      default:
        return value;
    }
  }

  private formatValue(value: string, format: string): string {
    // Simple format string replacement
    return format.replace('{}', value);
  }

  private applyTransformation(sourceData: Record<string, unknown>, transformation: FieldTransformation): unknown {
    const value = this.getNestedValue(sourceData, transformation.sourceField);

    switch (transformation.type) {
      case 'direct':
        return value;

      case 'lookup':
        const tableName = transformation.config?.table as string;
        return this.lookup(tableName, String(value));

      case 'concat':
        const fields = transformation.config?.fields as string[];
        const separator = transformation.config?.separator as string ?? '';
        return fields
          .map(f => this.getNestedValue(sourceData, f))
          .filter(v => v !== undefined && v !== null)
          .join(separator);

      case 'math':
        // Handle mathematical operations
        return this.applyMathOperation(sourceData, transformation.config);

      case 'date':
        // Handle date transformations
        const format = transformation.config?.format as string;
        if (value instanceof Date) {
          return this.formatDate(value, format);
        }
        return value;

      default:
        return value;
    }
  }

  private applyMathOperation(data: Record<string, unknown>, config?: Record<string, unknown>): number {
    if (!config) return 0;

    const operation = config.operation as string;
    const conditions = config.conditions as { when: string; multiplier: number }[];

    // Simple conditional math
    if (operation === 'multiply' && conditions) {
      const operandValue = String(this.getNestedValue(data, config.operand as string));
      const condition = conditions.find(c => c.when === operandValue);
      const multiplier = condition?.multiplier ?? 1;
      return (config.value as number ?? 0) * multiplier;
    }

    return 0;
  }

  private formatDate(date: Date, format?: string): string {
    if (!format) return date.toISOString().split('T')[0];

    return format
      .replace('YYYY', date.getFullYear().toString())
      .replace('MM', (date.getMonth() + 1).toString().padStart(2, '0'))
      .replace('DD', date.getDate().toString().padStart(2, '0'));
  }

  private validateField(value: unknown, validation: ValidationRule): boolean {
    switch (validation.type) {
      case 'required':
        return value !== undefined && value !== null && value !== '';

      case 'format':
        if (typeof value !== 'string') return true;
        const pattern = validation.config.pattern as string;
        return new RegExp(pattern).test(value);

      case 'range':
        const num = Number(value);
        if (isNaN(num)) return false;
        const min = validation.config.min as number | undefined;
        const max = validation.config.max as number | undefined;
        if (min !== undefined && num < min) return false;
        if (max !== undefined && num > max) return false;
        return true;

      default:
        return true;
    }
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
}

// ============================================================================
// Singleton Instance
// ============================================================================

let mappingServiceInstance: EntityMappingService | null = null;

export function getEntityMappingService(): EntityMappingService {
  if (!mappingServiceInstance) {
    mappingServiceInstance = new EntityMappingService();
  }
  return mappingServiceInstance;
}

export function resetEntityMappingService(): void {
  mappingServiceInstance = null;
}

// ============================================================================
// Export All Mappings
// ============================================================================

export const allMappings = {
  policy: policyMapping,
  claim: claimMapping,
  customer: customerMapping,
  financial: financialMapping,
  historical: historicalDataMapping,
};
