/**
 * Enterprise Regulatory Filing System - Compliance Monitor
 * Tracks regulatory requirements, alerts, capital adequacy, investment limits, and governance
 */

import {
  JurisdictionConfig,
  FilingRequirement,
  getJurisdictionByCode,
  getNextDueDate,
  getDaysUntilDue,
  ALL_JURISDICTIONS,
} from './jurisdictions';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface ComplianceStatus {
  jurisdictionCode: string;
  overallStatus: 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT' | 'CRITICAL';
  lastUpdated: Date;
  areas: {
    capitalAdequacy: ComplianceArea;
    investmentLimits: ComplianceArea;
    governance: ComplianceArea;
    filingRequirements: ComplianceArea;
  };
  alerts: ComplianceAlert[];
  score: number; // 0-100
}

export interface ComplianceArea {
  status: 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT';
  details: ComplianceDetail[];
  lastChecked: Date;
}

export interface ComplianceDetail {
  id: string;
  name: string;
  description: string;
  status: 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT';
  currentValue?: string | number;
  requiredValue?: string | number;
  lastChecked: Date;
  notes?: string;
}

export interface ComplianceAlert {
  id: string;
  type: 'DEADLINE' | 'THRESHOLD' | 'GOVERNANCE' | 'FILING' | 'CAPITAL' | 'INVESTMENT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  jurisdictionCode: string;
  dueDate?: Date;
  createdAt: Date;
  acknowledged: boolean;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  actionRequired?: string;
  relatedEntity?: string;
}

export interface CapitalAdequacyMetrics {
  jurisdictionCode: string;
  minimumCapital: number;
  actualCapital: number;
  solvencyMarginRequired: number;
  solvencyMarginActual: number;
  capitalAdequacyRatioRequired: number;
  capitalAdequacyRatioActual: number;
  riskWeightedAssets: number;
  tier1Capital: number;
  tier2Capital: number;
  lastUpdated: Date;
}

export interface InvestmentMetrics {
  jurisdictionCode: string;
  totalInvestments: number;
  equityInvestments: number;
  equityPercent: number;
  propertyInvestments: number;
  propertyPercent: number;
  foreignInvestments: number;
  foreignPercent: number;
  singleIssuerExposures: { issuer: string; amount: number; percent: number }[];
  restrictedAssets: { asset: string; amount: number }[];
  lastUpdated: Date;
}

export interface GovernanceStatus {
  jurisdictionCode: string;
  boardComposition: {
    totalMembers: number;
    independentMembers: number;
    independentPercent: number;
    requiredIndependentPercent: number;
  };
  committees: {
    audit: { exists: boolean; meetsRequirements: boolean };
    risk: { exists: boolean; meetsRequirements: boolean };
    investment: { exists: boolean };
    nominating: { exists: boolean };
    compensation: { exists: boolean };
  };
  officers: {
    actuary: { appointed: boolean; qualified: boolean };
    complianceOfficer: { appointed: boolean };
    chiefRiskOfficer: { appointed: boolean };
    internalAuditor: { appointed: boolean };
  };
  lastBoardMeeting: Date;
  lastAuditCommitteeMeeting: Date;
  lastUpdated: Date;
}

export interface FilingDeadline {
  id: string;
  jurisdictionCode: string;
  jurisdictionName: string;
  filingId: string;
  filingName: string;
  filingType: string;
  dueDate: Date;
  daysUntilDue: number;
  status: 'UPCOMING' | 'DUE_SOON' | 'OVERDUE' | 'SUBMITTED';
  submittedAt?: Date;
  submittedBy?: string;
}

export interface ComplianceReport {
  id: string;
  jurisdictionCode: string;
  reportDate: Date;
  reportingPeriod: {
    startDate: Date;
    endDate: Date;
  };
  summary: {
    overallScore: number;
    areasCompliant: number;
    areasWarning: number;
    areasNonCompliant: number;
    totalAlerts: number;
    criticalAlerts: number;
  };
  details: {
    capitalAdequacy: CapitalAdequacyMetrics;
    investments: InvestmentMetrics;
    governance: GovernanceStatus;
    filings: FilingDeadline[];
  };
  recommendations: string[];
  nextSteps: string[];
}

// ============================================================================
// COMPLIANCE MONITOR CLASS
// ============================================================================

export class ComplianceMonitor {
  private static capitalMetrics: Map<string, CapitalAdequacyMetrics> = new Map();
  private static investmentMetrics: Map<string, InvestmentMetrics> = new Map();
  private static governanceStatus: Map<string, GovernanceStatus> = new Map();
  private static alerts: Map<string, ComplianceAlert[]> = new Map();
  private static filingDeadlines: Map<string, FilingDeadline[]> = new Map();

  // ========================================================================
  // CAPITAL ADEQUACY MONITORING
  // ========================================================================

  /**
   * Update capital adequacy metrics for a jurisdiction
   */
  static updateCapitalMetrics(metrics: Omit<CapitalAdequacyMetrics, 'lastUpdated'>): void {
    const jurisdiction = getJurisdictionByCode(metrics.jurisdictionCode);
    if (!jurisdiction) {
      throw new Error(`Invalid jurisdiction: ${metrics.jurisdictionCode}`);
    }

    this.capitalMetrics.set(metrics.jurisdictionCode, {
      ...metrics,
      lastUpdated: new Date(),
    });

    // Generate alerts based on metrics
    const fullMetrics: CapitalAdequacyMetrics = {
      ...metrics,
      lastUpdated: new Date(),
    };
    this.checkCapitalAlerts(metrics.jurisdictionCode, fullMetrics);
  }

  /**
   * Get capital adequacy status for a jurisdiction
   */
  static getCapitalAdequacyStatus(jurisdictionCode: string): ComplianceArea {
    const jurisdiction = getJurisdictionByCode(jurisdictionCode);
    const metrics = this.capitalMetrics.get(jurisdictionCode);

    if (!jurisdiction) {
      throw new Error(`Invalid jurisdiction: ${jurisdictionCode}`);
    }

    const details: ComplianceDetail[] = [];

    if (metrics) {
      // Minimum Capital Check
      const minCapitalCompliant = metrics.actualCapital >= jurisdiction.capitalRequirements.minimumCapital;
      details.push({
        id: 'MIN-CAPITAL',
        name: 'Minimum Capital Requirement',
        description: `Regulatory minimum capital requirement`,
        status: minCapitalCompliant ? 'COMPLIANT' : 'NON_COMPLIANT',
        currentValue: this.formatCurrency(metrics.actualCapital, jurisdiction.currency),
        requiredValue: this.formatCurrency(jurisdiction.capitalRequirements.minimumCapital, jurisdiction.currency),
        lastChecked: metrics.lastUpdated,
        notes: minCapitalCompliant 
          ? 'Meets minimum capital requirement'
          : `Shortfall: ${this.formatCurrency(jurisdiction.capitalRequirements.minimumCapital - metrics.actualCapital, jurisdiction.currency)}`,
      });

      // Solvency Margin Check
      const solvencyCompliant = metrics.solvencyMarginActual >= jurisdiction.capitalRequirements.solvencyMarginPercent;
      const solvencyWarning = metrics.solvencyMarginActual < jurisdiction.capitalRequirements.solvencyMarginPercent * 1.2;
      details.push({
        id: 'SOLVENCY-MARGIN',
        name: 'Solvency Margin',
        description: 'Required solvency margin percentage',
        status: solvencyCompliant 
          ? (solvencyWarning ? 'WARNING' : 'COMPLIANT')
          : 'NON_COMPLIANT',
        currentValue: `${metrics.solvencyMarginActual.toFixed(1)}%`,
        requiredValue: `${jurisdiction.capitalRequirements.solvencyMarginPercent}%`,
        lastChecked: metrics.lastUpdated,
        notes: !solvencyCompliant 
          ? 'Below minimum solvency requirement - immediate action required'
          : solvencyWarning 
          ? 'Close to minimum - monitor closely'
          : 'Adequate buffer maintained',
      });

      // Capital Adequacy Ratio Check
      const carCompliant = metrics.capitalAdequacyRatioActual >= jurisdiction.capitalRequirements.capitalAdequacyRatio;
      details.push({
        id: 'CAPITAL-RATIO',
        name: 'Capital Adequacy Ratio',
        description: 'Risk-based capital adequacy ratio',
        status: carCompliant ? 'COMPLIANT' : 'NON_COMPLIANT',
        currentValue: metrics.capitalAdequacyRatioActual.toFixed(2),
        requiredValue: jurisdiction.capitalRequirements.capitalAdequacyRatio.toFixed(2),
        lastChecked: metrics.lastUpdated,
      });
    } else {
      details.push({
        id: 'NO-DATA',
        name: 'Capital Metrics',
        description: 'No capital metrics available',
        status: 'WARNING',
        lastChecked: new Date(),
        notes: 'Please update capital metrics',
      });
    }

    const hasNonCompliant = details.some(d => d.status === 'NON_COMPLIANT');
    const hasWarning = details.some(d => d.status === 'WARNING');

    return {
      status: hasNonCompliant ? 'NON_COMPLIANT' : hasWarning ? 'WARNING' : 'COMPLIANT',
      details,
      lastChecked: new Date(),
    };
  }

  private static checkCapitalAlerts(jurisdictionCode: string, metrics: CapitalAdequacyMetrics): void {
    const jurisdiction = getJurisdictionByCode(jurisdictionCode);
    if (!jurisdiction) return;

    const existingAlerts = this.alerts.get(jurisdictionCode) || [];
    const capitalAlerts: ComplianceAlert[] = [];

    // Check solvency margin
    if (metrics.solvencyMarginActual < jurisdiction.capitalRequirements.solvencyMarginPercent) {
      capitalAlerts.push({
        id: `CAP-SOL-${jurisdictionCode}-${Date.now()}`,
        type: 'CAPITAL',
        severity: 'CRITICAL',
        title: 'Solvency Margin Below Requirement',
        message: `Solvency margin at ${metrics.solvencyMarginActual.toFixed(1)}%, required is ${jurisdiction.capitalRequirements.solvencyMarginPercent}%`,
        jurisdictionCode,
        createdAt: new Date(),
        acknowledged: false,
        actionRequired: 'Immediate capital injection or risk reduction required',
      });
    } else if (metrics.solvencyMarginActual < jurisdiction.capitalRequirements.solvencyMarginPercent * 1.2) {
      capitalAlerts.push({
        id: `CAP-SOL-WARN-${jurisdictionCode}-${Date.now()}`,
        type: 'CAPITAL',
        severity: 'HIGH',
        title: 'Solvency Margin Warning',
        message: `Solvency margin at ${metrics.solvencyMarginActual.toFixed(1)}%, close to minimum ${jurisdiction.capitalRequirements.solvencyMarginPercent}%`,
        jurisdictionCode,
        createdAt: new Date(),
        acknowledged: false,
        actionRequired: 'Monitor capital position closely',
      });
    }

    // Check minimum capital
    if (metrics.actualCapital < jurisdiction.capitalRequirements.minimumCapital) {
      capitalAlerts.push({
        id: `CAP-MIN-${jurisdictionCode}-${Date.now()}`,
        type: 'CAPITAL',
        severity: 'CRITICAL',
        title: 'Below Minimum Capital Requirement',
        message: `Actual capital ${this.formatCurrency(metrics.actualCapital, jurisdiction.currency)} below required ${this.formatCurrency(jurisdiction.capitalRequirements.minimumCapital, jurisdiction.currency)}`,
        jurisdictionCode,
        createdAt: new Date(),
        acknowledged: false,
        actionRequired: 'Immediate capital injection required',
      });
    }

    this.alerts.set(jurisdictionCode, [...existingAlerts.filter(a => a.type !== 'CAPITAL'), ...capitalAlerts]);
  }

  // ========================================================================
  // INVESTMENT LIMITS MONITORING
  // ========================================================================

  /**
   * Update investment metrics for a jurisdiction
   */
  static updateInvestmentMetrics(metrics: Omit<InvestmentMetrics, 'lastUpdated'>): void {
    const jurisdiction = getJurisdictionByCode(metrics.jurisdictionCode);
    if (!jurisdiction) {
      throw new Error(`Invalid jurisdiction: ${metrics.jurisdictionCode}`);
    }

    const fullMetrics: InvestmentMetrics = {
      ...metrics,
      lastUpdated: new Date(),
    };
    this.investmentMetrics.set(metrics.jurisdictionCode, fullMetrics);

    this.checkInvestmentAlerts(metrics.jurisdictionCode, fullMetrics);
  }

  /**
   * Get investment limits status for a jurisdiction
   */
  static getInvestmentLimitsStatus(jurisdictionCode: string): ComplianceArea {
    const jurisdiction = getJurisdictionByCode(jurisdictionCode);
    const metrics = this.investmentMetrics.get(jurisdictionCode);

    if (!jurisdiction) {
      throw new Error(`Invalid jurisdiction: ${jurisdictionCode}`);
    }

    const details: ComplianceDetail[] = [];

    if (metrics) {
      // Equity limit check
      const equityCompliant = metrics.equityPercent <= jurisdiction.investmentLimits.maxEquityPercent;
      details.push({
        id: 'INV-EQUITY',
        name: 'Equity Investment Limit',
        description: 'Maximum percentage in equity investments',
        status: equityCompliant ? 'COMPLIANT' : 'NON_COMPLIANT',
        currentValue: `${metrics.equityPercent.toFixed(1)}%`,
        requiredValue: `≤${jurisdiction.investmentLimits.maxEquityPercent}%`,
        lastChecked: metrics.lastUpdated,
      });

      // Property limit check
      const propertyCompliant = metrics.propertyPercent <= jurisdiction.investmentLimits.maxPropertyPercent;
      details.push({
        id: 'INV-PROPERTY',
        name: 'Property Investment Limit',
        description: 'Maximum percentage in property investments',
        status: propertyCompliant ? 'COMPLIANT' : 'NON_COMPLIANT',
        currentValue: `${metrics.propertyPercent.toFixed(1)}%`,
        requiredValue: `≤${jurisdiction.investmentLimits.maxPropertyPercent}%`,
        lastChecked: metrics.lastUpdated,
      });

      // Foreign investment limit check
      const foreignCompliant = metrics.foreignPercent <= jurisdiction.investmentLimits.maxForeignInvestmentPercent;
      details.push({
        id: 'INV-FOREIGN',
        name: 'Foreign Investment Limit',
        description: 'Maximum percentage in foreign investments',
        status: foreignCompliant ? 'COMPLIANT' : 'NON_COMPLIANT',
        currentValue: `${metrics.foreignPercent.toFixed(1)}%`,
        requiredValue: `≤${jurisdiction.investmentLimits.maxForeignInvestmentPercent}%`,
        lastChecked: metrics.lastUpdated,
      });

      // Single issuer exposure checks
      for (const exposure of metrics.singleIssuerExposures) {
        const singleIssuerCompliant = exposure.percent <= jurisdiction.investmentLimits.maxSingleIssuerPercent;
        details.push({
          id: `INV-SINGLE-${exposure.issuer.replace(/\s+/g, '-')}`,
          name: `Single Issuer: ${exposure.issuer}`,
          description: 'Maximum exposure to single issuer',
          status: singleIssuerCompliant ? 'COMPLIANT' : 'NON_COMPLIANT',
          currentValue: `${exposure.percent.toFixed(1)}%`,
          requiredValue: `≤${jurisdiction.investmentLimits.maxSingleIssuerPercent}%`,
          lastChecked: metrics.lastUpdated,
        });
      }

      // Restricted assets check
      if (metrics.restrictedAssets.length > 0) {
        details.push({
          id: 'INV-RESTRICTED',
          name: 'Restricted Assets',
          description: 'Assets in restricted categories',
          status: 'NON_COMPLIANT',
          currentValue: metrics.restrictedAssets.map(a => a.asset).join(', '),
          lastChecked: metrics.lastUpdated,
          notes: 'These asset classes are not permitted',
        });
      }
    } else {
      details.push({
        id: 'NO-DATA',
        name: 'Investment Metrics',
        description: 'No investment metrics available',
        status: 'WARNING',
        lastChecked: new Date(),
      });
    }

    const hasNonCompliant = details.some(d => d.status === 'NON_COMPLIANT');
    return {
      status: hasNonCompliant ? 'NON_COMPLIANT' : 'COMPLIANT',
      details,
      lastChecked: new Date(),
    };
  }

  private static checkInvestmentAlerts(jurisdictionCode: string, metrics: InvestmentMetrics): void {
    const jurisdiction = getJurisdictionByCode(jurisdictionCode);
    if (!jurisdiction) return;

    const existingAlerts = this.alerts.get(jurisdictionCode) || [];
    const investmentAlerts: ComplianceAlert[] = [];

    if (metrics.equityPercent > jurisdiction.investmentLimits.maxEquityPercent) {
      investmentAlerts.push({
        id: `INV-EQ-${jurisdictionCode}-${Date.now()}`,
        type: 'INVESTMENT',
        severity: 'HIGH',
        title: 'Equity Investment Limit Exceeded',
        message: `Equity investments at ${metrics.equityPercent.toFixed(1)}%, limit is ${jurisdiction.investmentLimits.maxEquityPercent}%`,
        jurisdictionCode,
        createdAt: new Date(),
        acknowledged: false,
        actionRequired: 'Reduce equity exposure or seek regulatory approval',
      });
    }

    if (metrics.singleIssuerExposures.some(e => e.percent > jurisdiction.investmentLimits.maxSingleIssuerPercent)) {
      investmentAlerts.push({
        id: `INV-SI-${jurisdictionCode}-${Date.now()}`,
        type: 'INVESTMENT',
        severity: 'HIGH',
        title: 'Single Issuer Limit Exceeded',
        message: 'One or more single issuer exposures exceed the limit',
        jurisdictionCode,
        createdAt: new Date(),
        acknowledged: false,
        actionRequired: 'Review and reduce concentrated exposures',
      });
    }

    if (metrics.restrictedAssets.length > 0) {
      investmentAlerts.push({
        id: `INV-RES-${jurisdictionCode}-${Date.now()}`,
        type: 'INVESTMENT',
        severity: 'CRITICAL',
        title: 'Prohibited Investments Detected',
        message: `Investments in restricted assets: ${metrics.restrictedAssets.map(a => a.asset).join(', ')}`,
        jurisdictionCode,
        createdAt: new Date(),
        acknowledged: false,
        actionRequired: 'Immediately divest from prohibited assets',
      });
    }

    this.alerts.set(jurisdictionCode, [...existingAlerts.filter(a => a.type !== 'INVESTMENT'), ...investmentAlerts]);
  }

  // ========================================================================
  // GOVERNANCE MONITORING
  // ========================================================================

  /**
   * Update governance status for a jurisdiction
   */
  static updateGovernanceStatus(status: Omit<GovernanceStatus, 'lastUpdated'>): void {
    const jurisdiction = getJurisdictionByCode(status.jurisdictionCode);
    if (!jurisdiction) {
      throw new Error(`Invalid jurisdiction: ${status.jurisdictionCode}`);
    }

    const fullStatus: GovernanceStatus = {
      ...status,
      lastUpdated: new Date(),
    };
    this.governanceStatus.set(status.jurisdictionCode, fullStatus);

    this.checkGovernanceAlerts(status.jurisdictionCode, fullStatus);
  }

  /**
   * Get governance status for a jurisdiction
   */
  static getGovernanceStatus(jurisdictionCode: string): ComplianceArea {
    const jurisdiction = getJurisdictionByCode(jurisdictionCode);
    const status = this.governanceStatus.get(jurisdictionCode);

    if (!jurisdiction) {
      throw new Error(`Invalid jurisdiction: ${jurisdictionCode}`);
    }

    const details: ComplianceDetail[] = [];

    if (status) {
      // Board composition
      const boardCompliant = status.boardComposition.totalMembers >= jurisdiction.governanceRequirements.minBoardMembers;
      const independentCompliant = status.boardComposition.independentPercent >= jurisdiction.governanceRequirements.independentDirectorsPercent;
      details.push({
        id: 'GOV-BOARD-SIZE',
        name: 'Board Size',
        description: 'Minimum number of board members',
        status: boardCompliant ? 'COMPLIANT' : 'NON_COMPLIANT',
        currentValue: status.boardComposition.totalMembers,
        requiredValue: `≥${jurisdiction.governanceRequirements.minBoardMembers}`,
        lastChecked: status.lastUpdated,
      });
      details.push({
        id: 'GOV-BOARD-INDEPENDENT',
        name: 'Independent Directors',
        description: 'Minimum percentage of independent directors',
        status: independentCompliant ? 'COMPLIANT' : 'NON_COMPLIANT',
        currentValue: `${status.boardComposition.independentPercent.toFixed(0)}%`,
        requiredValue: `≥${jurisdiction.governanceRequirements.independentDirectorsPercent}%`,
        lastChecked: status.lastUpdated,
      });

      // Audit committee
      if (jurisdiction.governanceRequirements.auditCommitteeRequired) {
        details.push({
          id: 'GOV-AUDIT-COMMITTEE',
          name: 'Audit Committee',
          description: 'Required audit committee',
          status: status.committees.audit.exists && status.committees.audit.meetsRequirements 
            ? 'COMPLIANT' : 'NON_COMPLIANT',
          currentValue: status.committees.audit.exists ? 'Established' : 'Not established',
          lastChecked: status.lastUpdated,
        });
      }

      // Risk committee
      if (jurisdiction.governanceRequirements.riskCommitteeRequired) {
        details.push({
          id: 'GOV-RISK-COMMITTEE',
          name: 'Risk Committee',
          description: 'Required risk committee',
          status: status.committees.risk.exists && status.committees.risk.meetsRequirements
            ? 'COMPLIANT' : 'NON_COMPLIANT',
          currentValue: status.committees.risk.exists ? 'Established' : 'Not established',
          lastChecked: status.lastUpdated,
        });
      }

      // Actuary
      if (jurisdiction.governanceRequirements.actuaryRequired) {
        details.push({
          id: 'GOV-ACTUARY',
          name: 'Appointed Actuary',
          description: 'Required appointed actuary',
          status: status.officers.actuary.appointed && status.officers.actuary.qualified
            ? 'COMPLIANT' : 'NON_COMPLIANT',
          currentValue: status.officers.actuary.appointed 
            ? (status.officers.actuary.qualified ? 'Appointed & Qualified' : 'Appointed but not qualified')
            : 'Not appointed',
          lastChecked: status.lastUpdated,
        });
      }

      // Compliance Officer
      if (jurisdiction.governanceRequirements.complianceOfficerRequired) {
        details.push({
          id: 'GOV-COMPLIANCE',
          name: 'Compliance Officer',
          description: 'Required compliance officer',
          status: status.officers.complianceOfficer.appointed ? 'COMPLIANT' : 'NON_COMPLIANT',
          currentValue: status.officers.complianceOfficer.appointed ? 'Appointed' : 'Not appointed',
          lastChecked: status.lastUpdated,
        });
      }
    } else {
      details.push({
        id: 'NO-DATA',
        name: 'Governance Status',
        description: 'No governance status available',
        status: 'WARNING',
        lastChecked: new Date(),
      });
    }

    const hasNonCompliant = details.some(d => d.status === 'NON_COMPLIANT');
    return {
      status: hasNonCompliant ? 'NON_COMPLIANT' : 'COMPLIANT',
      details,
      lastChecked: new Date(),
    };
  }

  private static checkGovernanceAlerts(jurisdictionCode: string, status: GovernanceStatus): void {
    const jurisdiction = getJurisdictionByCode(jurisdictionCode);
    if (!jurisdiction) return;

    const existingAlerts = this.alerts.get(jurisdictionCode) || [];
    const governanceAlerts: ComplianceAlert[] = [];

    if (status.boardComposition.totalMembers < jurisdiction.governanceRequirements.minBoardMembers) {
      governanceAlerts.push({
        id: `GOV-BOARD-${jurisdictionCode}-${Date.now()}`,
        type: 'GOVERNANCE',
        severity: 'HIGH',
        title: 'Board Size Below Minimum',
        message: `Board has ${status.boardComposition.totalMembers} members, minimum is ${jurisdiction.governanceRequirements.minBoardMembers}`,
        jurisdictionCode,
        createdAt: new Date(),
        acknowledged: false,
        actionRequired: 'Appoint additional board members',
      });
    }

    if (jurisdiction.governanceRequirements.actuaryRequired && !status.officers.actuary.appointed) {
      governanceAlerts.push({
        id: `GOV-ACT-${jurisdictionCode}-${Date.now()}`,
        type: 'GOVERNANCE',
        severity: 'HIGH',
        title: 'No Appointed Actuary',
        message: 'An appointed actuary is required but not in place',
        jurisdictionCode,
        createdAt: new Date(),
        acknowledged: false,
        actionRequired: 'Appoint a qualified actuary',
      });
    }

    this.alerts.set(jurisdictionCode, [...existingAlerts.filter(a => a.type !== 'GOVERNANCE'), ...governanceAlerts]);
  }

  // ========================================================================
  // FILING DEADLINES MONITORING
  // ========================================================================

  /**
   * Get all filing deadlines for jurisdictions
   */
  static getUpcomingDeadlines(
    jurisdictionCodes?: string[],
    days: number = 90
  ): FilingDeadline[] {
    const codes = jurisdictionCodes || ALL_JURISDICTIONS.map(j => j.code);
    const deadlines: FilingDeadline[] = [];
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    for (const code of codes) {
      const jurisdiction = getJurisdictionByCode(code);
      if (!jurisdiction) continue;

      for (const filing of jurisdiction.filingRequirements) {
        const dueDate = getNextDueDate(filing);
        
        if (dueDate >= now && dueDate <= futureDate) {
          const storedDeadlines = this.filingDeadlines.get(code) || [];
          const stored = storedDeadlines.find(d => d.filingId === filing.id);

          deadlines.push({
            id: `DEADLINE-${code}-${filing.id}`,
            jurisdictionCode: code,
            jurisdictionName: jurisdiction.name,
            filingId: filing.id,
            filingName: filing.name,
            filingType: filing.type,
            dueDate,
            daysUntilDue: getDaysUntilDue(filing),
            status: stored?.status || 'UPCOMING',
            submittedAt: stored?.submittedAt,
            submittedBy: stored?.submittedBy,
          });
        }
      }
    }

    return deadlines.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
  }

  /**
   * Get filing requirements status
   */
  static getFilingRequirementsStatus(jurisdictionCode: string): ComplianceArea {
    const jurisdiction = getJurisdictionByCode(jurisdictionCode);
    if (!jurisdiction) {
      throw new Error(`Invalid jurisdiction: ${jurisdictionCode}`);
    }

    const details: ComplianceDetail[] = [];
    const now = new Date();

    for (const filing of jurisdiction.filingRequirements) {
      const dueDate = getNextDueDate(filing);
      const daysUntilDue = getDaysUntilDue(filing);
      const storedDeadlines = this.filingDeadlines.get(jurisdictionCode) || [];
      const stored = storedDeadlines.find(d => d.filingId === filing.id);

      let status: 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT' = 'COMPLIANT';
      let notes = '';

      if (stored?.status === 'SUBMITTED') {
        status = 'COMPLIANT';
        notes = `Submitted on ${stored.submittedAt?.toLocaleDateString()}`;
      } else if (daysUntilDue < 0) {
        status = 'NON_COMPLIANT';
        notes = 'OVERDUE - Immediate action required';
      } else if (daysUntilDue <= filing.graceDays) {
        status = 'WARNING';
        notes = `Due in ${daysUntilDue} days`;
      } else if (daysUntilDue <= 30) {
        status = 'WARNING';
        notes = `Due in ${daysUntilDue} days`;
      } else {
        notes = `Due ${dueDate.toLocaleDateString()}`;
      }

      details.push({
        id: `FILING-${filing.id}`,
        name: filing.name,
        description: filing.description,
        status,
        currentValue: stored?.status === 'SUBMITTED' ? 'Submitted' : `${daysUntilDue} days`,
        requiredValue: `Due: ${dueDate.toLocaleDateString()}`,
        lastChecked: now,
        notes,
      });
    }

    const hasNonCompliant = details.some(d => d.status === 'NON_COMPLIANT');
    const hasWarning = details.some(d => d.status === 'WARNING');

    return {
      status: hasNonCompliant ? 'NON_COMPLIANT' : hasWarning ? 'WARNING' : 'COMPLIANT',
      details,
      lastChecked: now,
    };
  }

  /**
   * Mark filing as submitted
   */
  static markFilingSubmitted(
    jurisdictionCode: string,
    filingId: string,
    submittedBy: string
  ): void {
    const deadlines = this.filingDeadlines.get(jurisdictionCode) || [];
    const existing = deadlines.find(d => d.filingId === filingId);

    if (existing) {
      existing.status = 'SUBMITTED';
      existing.submittedAt = new Date();
      existing.submittedBy = submittedBy;
    } else {
      const jurisdiction = getJurisdictionByCode(jurisdictionCode);
      const filing = jurisdiction?.filingRequirements.find(f => f.id === filingId);
      
      if (jurisdiction && filing) {
        deadlines.push({
          id: `DEADLINE-${jurisdictionCode}-${filingId}`,
          jurisdictionCode,
          jurisdictionName: jurisdiction.name,
          filingId,
          filingName: filing.name,
          filingType: filing.type,
          dueDate: getNextDueDate(filing),
          daysUntilDue: getDaysUntilDue(filing),
          status: 'SUBMITTED',
          submittedAt: new Date(),
          submittedBy,
        });
      }
    }

    this.filingDeadlines.set(jurisdictionCode, deadlines);
  }

  // ========================================================================
  // COMPLIANCE STATUS AND REPORTING
  // ========================================================================

  /**
   * Get overall compliance status for a jurisdiction
   */
  static getComplianceStatus(jurisdictionCode: string): ComplianceStatus {
    const jurisdiction = getJurisdictionByCode(jurisdictionCode);
    if (!jurisdiction) {
      throw new Error(`Invalid jurisdiction: ${jurisdictionCode}`);
    }

    const capitalAdequacy = this.getCapitalAdequacyStatus(jurisdictionCode);
    const investmentLimits = this.getInvestmentLimitsStatus(jurisdictionCode);
    const governance = this.getGovernanceStatus(jurisdictionCode);
    const filingRequirements = this.getFilingRequirementsStatus(jurisdictionCode);

    const areas = [capitalAdequacy, investmentLimits, governance, filingRequirements];
    const nonCompliantCount = areas.filter(a => a.status === 'NON_COMPLIANT').length;
    const warningCount = areas.filter(a => a.status === 'WARNING').length;

    let overallStatus: ComplianceStatus['overallStatus'];
    if (nonCompliantCount >= 2) {
      overallStatus = 'CRITICAL';
    } else if (nonCompliantCount === 1) {
      overallStatus = 'NON_COMPLIANT';
    } else if (warningCount > 0) {
      overallStatus = 'WARNING';
    } else {
      overallStatus = 'COMPLIANT';
    }

    // Calculate compliance score (0-100)
    const compliantCount = areas.filter(a => a.status === 'COMPLIANT').length;
    const score = Math.round((compliantCount * 25) + (warningCount * 15));

    // Get alerts
    const alerts = this.alerts.get(jurisdictionCode) || [];

    return {
      jurisdictionCode,
      overallStatus,
      lastUpdated: new Date(),
      areas: {
        capitalAdequacy,
        investmentLimits,
        governance,
        filingRequirements,
      },
      alerts,
      score,
    };
  }

  /**
   * Generate compliance report
   */
  static generateComplianceReport(jurisdictionCode: string): ComplianceReport {
    const status = this.getComplianceStatus(jurisdictionCode);
    const jurisdiction = getJurisdictionByCode(jurisdictionCode);
    
    if (!jurisdiction) {
      throw new Error(`Invalid jurisdiction: ${jurisdictionCode}`);
    }

    const capitalMetrics = this.capitalMetrics.get(jurisdictionCode);
    const investmentMetrics = this.investmentMetrics.get(jurisdictionCode);
    const governanceStatus = this.governanceStatus.get(jurisdictionCode);
    const filings = this.getUpcomingDeadlines([jurisdictionCode], 365);

    // Generate recommendations
    const recommendations: string[] = [];
    const nextSteps: string[] = [];

    if (status.areas.capitalAdequacy.status !== 'COMPLIANT') {
      recommendations.push('Review capital position and consider capital injection or risk reduction strategies');
      nextSteps.push('Schedule meeting with CFO to discuss capital adequacy');
    }

    if (status.areas.investmentLimits.status !== 'COMPLIANT') {
      recommendations.push('Review investment portfolio for compliance with regulatory limits');
      nextSteps.push('Prepare investment rebalancing proposal');
    }

    if (status.areas.governance.status !== 'COMPLIANT') {
      recommendations.push('Address governance gaps, particularly board composition and committee structure');
      nextSteps.push('Review governance structure with Board Chair');
    }

    const upcomingFilings = filings.filter(f => f.daysUntilDue <= 30 && f.status !== 'SUBMITTED');
    if (upcomingFilings.length > 0) {
      nextSteps.push(`Prepare ${upcomingFilings[0].filingName} due in ${upcomingFilings[0].daysUntilDue} days`);
    }

    return {
      id: `RPT-${jurisdictionCode}-${Date.now()}`,
      jurisdictionCode,
      reportDate: new Date(),
      reportingPeriod: {
        startDate: new Date(new Date().getFullYear(), 0, 1),
        endDate: new Date(),
      },
      summary: {
        overallScore: status.score,
        areasCompliant: Object.values(status.areas).filter(a => a.status === 'COMPLIANT').length,
        areasWarning: Object.values(status.areas).filter(a => a.status === 'WARNING').length,
        areasNonCompliant: Object.values(status.areas).filter(a => a.status === 'NON_COMPLIANT').length,
        totalAlerts: status.alerts.length,
        criticalAlerts: status.alerts.filter(a => a.severity === 'CRITICAL').length,
      },
      details: {
        capitalAdequacy: capitalMetrics || this.getDefaultCapitalMetrics(jurisdictionCode),
        investments: investmentMetrics || this.getDefaultInvestmentMetrics(jurisdictionCode),
        governance: governanceStatus || this.getDefaultGovernanceStatus(jurisdictionCode),
        filings,
      },
      recommendations,
      nextSteps,
    };
  }

  // ========================================================================
  // ALERT MANAGEMENT
  // ========================================================================

  /**
   * Get all alerts for a jurisdiction
   */
  static getAlerts(jurisdictionCode: string): ComplianceAlert[] {
    return this.alerts.get(jurisdictionCode) || [];
  }

  /**
   * Get all alerts across all jurisdictions
   */
  static getAllAlerts(): ComplianceAlert[] {
    const allAlerts: ComplianceAlert[] = [];
    for (const alerts of this.alerts.values()) {
      allAlerts.push(...alerts);
    }
    return allAlerts.sort((a, b) => {
      const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  /**
   * Acknowledge an alert
   */
  static acknowledgeAlert(alertId: string, acknowledgedBy: string): void {
    for (const [code, alerts] of this.alerts.entries()) {
      const alert = alerts.find(a => a.id === alertId);
      if (alert) {
        alert.acknowledged = true;
        alert.acknowledgedAt = new Date();
        alert.acknowledgedBy = acknowledgedBy;
        this.alerts.set(code, alerts);
        return;
      }
    }
  }

  /**
   * Create a custom alert
   */
  static createAlert(alert: Omit<ComplianceAlert, 'id' | 'createdAt' | 'acknowledged'>): ComplianceAlert {
    const newAlert: ComplianceAlert = {
      ...alert,
      id: `ALERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      acknowledged: false,
    };

    const existingAlerts = this.alerts.get(alert.jurisdictionCode) || [];
    existingAlerts.push(newAlert);
    this.alerts.set(alert.jurisdictionCode, existingAlerts);

    return newAlert;
  }

  // ========================================================================
  // HELPER METHODS
  // ========================================================================

  private static formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  private static getDefaultCapitalMetrics(jurisdictionCode: string): CapitalAdequacyMetrics {
    const jurisdiction = getJurisdictionByCode(jurisdictionCode);
    return {
      jurisdictionCode,
      minimumCapital: jurisdiction?.capitalRequirements.minimumCapital || 0,
      actualCapital: 0,
      solvencyMarginRequired: jurisdiction?.capitalRequirements.solvencyMarginPercent || 0,
      solvencyMarginActual: 0,
      capitalAdequacyRatioRequired: jurisdiction?.capitalRequirements.capitalAdequacyRatio || 0,
      capitalAdequacyRatioActual: 0,
      riskWeightedAssets: 0,
      tier1Capital: 0,
      tier2Capital: 0,
      lastUpdated: new Date(),
    };
  }

  private static getDefaultInvestmentMetrics(jurisdictionCode: string): InvestmentMetrics {
    return {
      jurisdictionCode,
      totalInvestments: 0,
      equityInvestments: 0,
      equityPercent: 0,
      propertyInvestments: 0,
      propertyPercent: 0,
      foreignInvestments: 0,
      foreignPercent: 0,
      singleIssuerExposures: [],
      restrictedAssets: [],
      lastUpdated: new Date(),
    };
  }

  private static getDefaultGovernanceStatus(jurisdictionCode: string): GovernanceStatus {
    return {
      jurisdictionCode,
      boardComposition: {
        totalMembers: 0,
        independentMembers: 0,
        independentPercent: 0,
        requiredIndependentPercent: 0,
      },
      committees: {
        audit: { exists: false, meetsRequirements: false },
        risk: { exists: false, meetsRequirements: false },
        investment: { exists: false },
        nominating: { exists: false },
        compensation: { exists: false },
      },
      officers: {
        actuary: { appointed: false, qualified: false },
        complianceOfficer: { appointed: false },
        chiefRiskOfficer: { appointed: false },
        internalAuditor: { appointed: false },
      },
      lastBoardMeeting: new Date(),
      lastAuditCommitteeMeeting: new Date(),
      lastUpdated: new Date(),
    };
  }

  /**
   * Clear all stored data (for testing/reset)
   */
  static clearAllData(): void {
    this.capitalMetrics.clear();
    this.investmentMetrics.clear();
    this.governanceStatus.clear();
    this.alerts.clear();
    this.filingDeadlines.clear();
  }
}

// Export singleton instance methods
export const getComplianceStatus = (jurisdictionCode: string) => 
  ComplianceMonitor.getComplianceStatus(jurisdictionCode);

export const getUpcomingDeadlines = (jurisdictionCodes?: string[], days?: number) =>
  ComplianceMonitor.getUpcomingDeadlines(jurisdictionCodes, days);

export const getAllAlerts = () => ComplianceMonitor.getAllAlerts();
