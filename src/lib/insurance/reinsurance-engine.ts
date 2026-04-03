/**
 * Enterprise Reinsurance Calculation Engine
 * NexusOS Insurance Platform
 * 
 * Implements actuarial calculations for:
 * - Quota Share Ceding
 * - Excess of Loss (XOL) Recovery
 * - Surplus Share
 * - Facultative Reinsurance
 * - Automatic Ceding Processing
 * - Bordereaux Report Generation
 */

import { db } from '@/lib/db';

// ==================== TYPES ====================

export type TreatyType = 'QUOTA_SHARE' | 'SURPLUS' | 'EXCESS_OF_LOSS' | 'FACULTATIVE';

export interface CedingInput {
  claimId: string;
  claimAmount: number;
  policyId: string;
  policyNumber: string;
  sumInsured: number;
  lineOfBusiness: string;
  occurrenceDate: string;
}

export interface QuotaShareResult {
  treatyId: string;
  treatyNumber: string;
  treatyName: string;
  grossClaim: number;
  cedingPercentage: number;
  cessionAmount: number;
  retentionAmount: number;
  cedingCommission: number;
  commissionAmount: number;
}

export interface ExcessOfLossResult {
  treatyId: string;
  treatyNumber: string;
  treatyName: string;
  grossClaim: number;
  attachmentPoint: number;
  limit: number;
  excessAmount: number;
  recoveryAmount: number;
  recoveryLimited: boolean;
  exhaustionPoint: number;
}

export interface SurplusShareResult {
  treatyId: string;
  treatyNumber: string;
  treatyName: string;
  grossClaim: number;
  sumInsured: number;
  retentionLimit: number;
  surplusAmount: number;
  cessionRatio: number;
  cessionAmount: number;
  retentionAmount: number;
}

export interface FacultativeResult {
  treatyId: string;
  treatyNumber: string;
  treatyName: string;
  grossClaim: number;
  cedingPercentage: number;
  cessionAmount: number;
  retentionAmount: number;
  premiumCeded: number;
  commissionRate: number;
  commissionAmount: number;
}

export interface AutomaticCedingResult {
  processed: boolean;
  cedingType: string;
  treatyId: string;
  treatyNumber: string;
  recoveryAmount: number;
  retentionAmount: number;
  details: QuotaShareResult | ExcessOfLossResult | SurplusShareResult | FacultativeResult | null;
  message: string;
}

export interface BordereauxRecord {
  recordType: 'PREMIUM' | 'CLAIM' | 'COMMISSION';
  policyNumber: string;
  insuredName: string;
  effectiveDate: string;
  expiryDate: string;
  sumInsured: number;
  grossPremium: number;
  cededPremium: number;
  claimNumber?: string;
  claimDate?: string;
  claimAmount?: number;
  recoveryAmount?: number;
  commissionRate: number;
  commissionAmount: number;
}

export interface BordereauxReport {
  treatyId: string;
  treatyNumber: string;
  treatyName: string;
  reinsurerName: string;
  reportingPeriod: string;
  generatedAt: string;
  records: BordereauxRecord[];
  summary: {
    totalPolicies: number;
    totalSumInsured: number;
    totalGrossPremium: number;
    totalCededPremium: number;
    totalClaims: number;
    totalRecoveries: number;
    totalCommission: number;
    netPremiumCeded: number;
  };
}

// ==================== SLIDING SCALE COMMISSION ====================

export interface SlidingScaleTier {
  minLossRatio: number;
  maxLossRatio: number;
  commissionRate: number;
}

export interface CommissionCalculation {
  baseCommission: number;
  profitCommission: number;
  slidingScaleCommission: number;
  totalCommission: number;
  lossRatio: number;
  appliedTier: SlidingScaleTier | null;
}

/**
 * Calculate sliding scale commission based on loss ratio
 */
export function calculateSlidingScaleCommission(
  premiumCeded: number,
  claimsRecovery: number,
  baseCommissionRate: number,
  slidingScaleTiers: SlidingScaleTier[]
): CommissionCalculation {
  const lossRatio = premiumCeded > 0 ? (claimsRecovery / premiumCeded) * 100 : 0;
  
  // Find applicable tier
  let appliedTier: SlidingScaleTier | null = null;
  for (const tier of slidingScaleTiers) {
    if (lossRatio >= tier.minLossRatio && lossRatio <= tier.maxLossRatio) {
      appliedTier = tier;
      break;
    }
  }
  
  const baseCommission = premiumCeded * (baseCommissionRate / 100);
  const slidingScaleCommission = appliedTier 
    ? premiumCeded * (appliedTier.commissionRate / 100)
    : baseCommission;
  
  // Profit commission (if loss ratio is below threshold)
  const profitCommissionThreshold = 50; // 50% loss ratio threshold
  let profitCommission = 0;
  if (lossRatio < profitCommissionThreshold && premiumCeded > 0) {
    const profitMargin = premiumCeded - claimsRecovery;
    profitCommission = profitMargin * 0.20; // 20% of profit as commission
  }
  
  return {
    baseCommission,
    profitCommission,
    slidingScaleCommission,
    totalCommission: slidingScaleCommission + profitCommission,
    lossRatio,
    appliedTier
  };
}

// ==================== QUOTA SHARE ====================

/**
 * Calculate Quota Share Ceding
 * Formula: Cession = Claim Amount x Ceding Percentage
 */
export function calculateQuotaShareCeding(
  input: CedingInput,
  treaty: {
    id: string;
    treatyNumber: string;
    treatyName: string;
    cedingPercentage: number;
    cedingCommission: number;
  }
): QuotaShareResult {
  const cessionAmount = input.claimAmount * (treaty.cedingPercentage / 100);
  const retentionAmount = input.claimAmount - cessionAmount;
  const commissionAmount = cessionAmount * (treaty.cedingCommission / 100);
  
  return {
    treatyId: treaty.id,
    treatyNumber: treaty.treatyNumber,
    treatyName: treaty.treatyName,
    grossClaim: input.claimAmount,
    cedingPercentage: treaty.cedingPercentage,
    cessionAmount: Math.round(cessionAmount * 100) / 100,
    retentionAmount: Math.round(retentionAmount * 100) / 100,
    cedingCommission: treaty.cedingCommission,
    commissionAmount: Math.round(commissionAmount * 100) / 100
  };
}

// ==================== EXCESS OF LOSS ====================

/**
 * Calculate Excess of Loss Recovery
 * Formula: Recovery = max(0, min(Claim - Attachment, Limit))
 */
export function calculateExcessOfLoss(
  input: CedingInput,
  treaty: {
    id: string;
    treatyNumber: string;
    treatyName: string;
    attachmentPoint: number;
    limit: number;
  }
): ExcessOfLossResult {
  const excessAmount = Math.max(0, input.claimAmount - treaty.attachmentPoint);
  const recoveryAmount = Math.min(excessAmount, treaty.limit);
  const recoveryLimited = excessAmount > treaty.limit;
  const exhaustionPoint = treaty.attachmentPoint + treaty.limit;
  
  return {
    treatyId: treaty.id,
    treatyNumber: treaty.treatyNumber,
    treatyName: treaty.treatyName,
    grossClaim: input.claimAmount,
    attachmentPoint: treaty.attachmentPoint,
    limit: treaty.limit,
    excessAmount: Math.round(excessAmount * 100) / 100,
    recoveryAmount: Math.round(recoveryAmount * 100) / 100,
    recoveryLimited,
    exhaustionPoint
  };
}

// ==================== SURPLUS SHARE ====================

/**
 * Calculate Surplus Share Cession
 * Formula: Cession = (Sum Insured - Retention) / Sum Insured x Claim
 */
export function calculateSurplusShare(
  input: CedingInput,
  treaty: {
    id: string;
    treatyNumber: string;
    treatyName: string;
    retentionLimit: number;
  }
): SurplusShareResult {
  // Surplus is the amount above retention
  const surplusAmount = Math.max(0, input.sumInsured - treaty.retentionLimit);
  
  // Cession ratio is the proportion of risk ceded
  const cessionRatio = input.sumInsured > 0 
    ? surplusAmount / input.sumInsured 
    : 0;
  
  // Cession amount based on the ratio
  const cessionAmount = input.claimAmount * cessionRatio;
  const retentionAmount = input.claimAmount - cessionAmount;
  
  return {
    treatyId: treaty.id,
    treatyNumber: treaty.treatyNumber,
    treatyName: treaty.treatyName,
    grossClaim: input.claimAmount,
    sumInsured: input.sumInsured,
    retentionLimit: treaty.retentionLimit,
    surplusAmount: Math.round(surplusAmount * 100) / 100,
    cessionRatio: Math.round(cessionRatio * 10000) / 10000,
    cessionAmount: Math.round(cessionAmount * 100) / 100,
    retentionAmount: Math.round(retentionAmount * 100) / 100
  };
}

// ==================== FACULTATIVE ====================

/**
 * Calculate Facultative Reinsurance Cession
 * Case-by-case reinsurance arrangement
 */
export function calculateFacultative(
  input: CedingInput,
  treaty: {
    id: string;
    treatyNumber: string;
    treatyName: string;
    cedingPercentage: number;
    premiumRate: number;
    commissionRate: number;
  }
): FacultativeResult {
  const cessionAmount = input.claimAmount * (treaty.cedingPercentage / 100);
  const retentionAmount = input.claimAmount - cessionAmount;
  const premiumCeded = input.sumInsured * (treaty.premiumRate / 100) * (treaty.cedingPercentage / 100);
  const commissionAmount = premiumCeded * (treaty.commissionRate / 100);
  
  return {
    treatyId: treaty.id,
    treatyNumber: treaty.treatyNumber,
    treatyName: treaty.treatyName,
    grossClaim: input.claimAmount,
    cedingPercentage: treaty.cedingPercentage,
    cessionAmount: Math.round(cessionAmount * 100) / 100,
    retentionAmount: Math.round(retentionAmount * 100) / 100,
    premiumCeded: Math.round(premiumCeded * 100) / 100,
    commissionRate: treaty.commissionRate,
    commissionAmount: Math.round(commissionAmount * 100) / 100
  };
}

// ==================== AUTOMATIC CEDING ====================

/**
 * Process Automatic Ceding when claim exceeds retention
 * Automatically determines which treaty applies and calculates recovery
 */
export async function processAutomaticCeding(
  tenantId: string,
  input: CedingInput
): Promise<AutomaticCedingResult> {
  // Find applicable treaties for this line of business
  const treaties = await db.insReinsuranceTreaty.findMany({
    where: {
      tenantId,
      status: 'active',
      OR: [
        { lineOfBusiness: 'ALL' },
        { lineOfBusiness: input.lineOfBusiness }
      ],
      effectiveDate: { lte: input.occurrenceDate },
      expiryDate: { gte: input.occurrenceDate }
    },
    include: {
      treatyMappings: {
        where: { autoCede: true }
      }
    },
    orderBy: { createdAt: 'asc' }
  });
  
  if (treaties.length === 0) {
    return {
      processed: false,
      cedingType: 'NONE',
      treatyId: '',
      treatyNumber: '',
      recoveryAmount: 0,
      retentionAmount: input.claimAmount,
      details: null,
      message: 'No active treaty found for automatic ceding'
    };
  }
  
  // Process each treaty type
  for (const treaty of treaties) {
    switch (treaty.treatyType as TreatyType) {
      case 'QUOTA_SHARE': {
        if (treaty.cedingPercentage) {
          const result = calculateQuotaShareCeding(input, {
            id: treaty.id,
            treatyNumber: treaty.treatyNumber,
            treatyName: treaty.treatyName,
            cedingPercentage: treaty.cedingPercentage,
            cedingCommission: treaty.cedingCommission || 0
          });
          
          if (result.cessionAmount > 0) {
            return {
              processed: true,
              cedingType: 'QUOTA_SHARE',
              treatyId: treaty.id,
              treatyNumber: treaty.treatyNumber,
              recoveryAmount: result.cessionAmount,
              retentionAmount: result.retentionAmount,
              details: result,
              message: 'Quota Share ceding processed successfully'
            };
          }
        }
        break;
      }
      
      case 'EXCESS_OF_LOSS': {
        if (treaty.attachmentPoint && treaty.limit) {
          // Check if claim exceeds attachment point
          if (input.claimAmount > treaty.attachmentPoint) {
            const result = calculateExcessOfLoss(input, {
              id: treaty.id,
              treatyNumber: treaty.treatyNumber,
              treatyName: treaty.treatyName,
              attachmentPoint: treaty.attachmentPoint,
              limit: treaty.limit
            });
            
            if (result.recoveryAmount > 0) {
              return {
                processed: true,
                cedingType: 'EXCESS_OF_LOSS',
                treatyId: treaty.id,
                treatyNumber: treaty.treatyNumber,
                recoveryAmount: result.recoveryAmount,
                retentionAmount: input.claimAmount - result.recoveryAmount,
                details: result,
                message: result.recoveryLimited
                  ? 'Excess of Loss recovery processed (limited by treaty limit)'
                  : 'Excess of Loss recovery processed successfully'
              };
            }
          }
        }
        break;
      }
      
      case 'SURPLUS': {
        if (treaty.retentionLimit) {
          // Check if sum insured exceeds retention
          if (input.sumInsured > treaty.retentionLimit) {
            const result = calculateSurplusShare(input, {
              id: treaty.id,
              treatyNumber: treaty.treatyNumber,
              treatyName: treaty.treatyName,
              retentionLimit: treaty.retentionLimit
            });
            
            if (result.cessionAmount > 0) {
              return {
                processed: true,
                cedingType: 'SURPLUS',
                treatyId: treaty.id,
                treatyNumber: treaty.treatyNumber,
                recoveryAmount: result.cessionAmount,
                retentionAmount: result.retentionAmount,
                details: result,
                message: 'Surplus Share ceding processed successfully'
              };
            }
          }
        }
        break;
      }
      
      case 'FACULTATIVE': {
        // Facultative is typically manual, but if configured for auto
        if (treaty.cedingPercentage && treaty.treatyMappings.length > 0) {
          const mapping = treaty.treatyMappings[0];
          const result = calculateFacultative(input, {
            id: treaty.id,
            treatyNumber: treaty.treatyNumber,
            treatyName: treaty.treatyName,
            cedingPercentage: treaty.cedingPercentage,
            premiumRate: treaty.premiumRate || 0,
            commissionRate: treaty.cedingCommission || 0
          });
          
          if (result.cessionAmount > 0) {
            return {
              processed: true,
              cedingType: 'FACULTATIVE',
              treatyId: treaty.id,
              treatyNumber: treaty.treatyNumber,
              recoveryAmount: result.cessionAmount,
              retentionAmount: result.retentionAmount,
              details: result,
              message: 'Facultative ceding processed successfully'
            };
          }
        }
        break;
      }
    }
  }
  
  return {
    processed: false,
    cedingType: 'NONE',
    treatyId: '',
    treatyNumber: '',
    recoveryAmount: 0,
    retentionAmount: input.claimAmount,
    details: null,
    message: 'No applicable treaty found for ceding'
  };
}

// ==================== BORDEREAUX GENERATION ====================

/**
 * Generate Bordereaux Report for a treaty
 */
export async function generateBordereaux(
  tenantId: string,
  treatyId: string,
  reportingPeriod: string, // Format: YYYY-MM or YYYY-Q1
  reportType: 'PREMIUM' | 'CLAIM' | 'COMMISSION' = 'PREMIUM'
): Promise<BordereauxReport> {
  // Get treaty details
  const treaty = await db.insReinsuranceTreaty.findUnique({
    where: { id: treatyId, tenantId }
  });
  
  if (!treaty) {
    throw new Error('Treaty not found');
  }
  
  // Parse reporting period
  const [year, period] = reportingPeriod.split('-');
  let startDate: string;
  let endDate: string;
  
  if (period.startsWith('Q')) {
    // Quarterly
    const quarter = parseInt(period.replace('Q', ''));
    const startMonth = (quarter - 1) * 3 + 1;
    const endMonth = quarter * 3;
    startDate = `${year}-${String(startMonth).padStart(2, '0')}-01`;
    endDate = `${year}-${String(endMonth).padStart(2, '0')}-${new Date(parseInt(year), endMonth, 0).getDate()}`;
  } else {
    // Monthly
    const month = parseInt(period);
    startDate = `${year}-${period}-01`;
    endDate = `${year}-${period}-${new Date(parseInt(year), month, 0).getDate()}`;
  }
  
  // Get policies and claims for the period
  const policies = await db.insPolicy.findMany({
    where: {
      tenantId,
      effectiveDate: { gte: startDate, lte: endDate },
      reinsuranceTreatyId: treatyId
    }
  });
  
  const claims = await db.insClaim.findMany({
    where: {
      tenantId,
      occurrenceDate: { gte: startDate, lte: endDate },
      status: { notIn: ['denied', 'closed'] }
    },
    include: {
      InsPolicy: true
    }
  });
  
  // Build bordereaux records
  const records: BordereauxRecord[] = [];
  let totalGrossPremium = 0;
  let totalCededPremium = 0;
  let totalClaims = 0;
  let totalRecoveries = 0;
  let totalCommission = 0;
  
  // Process policies
  for (const policy of policies) {
    const cededPremium = policy.premiumAmount * ((treaty.cedingPercentage || 0) / 100);
    const commissionRate = treaty.cedingCommission || 0;
    const commissionAmount = cededPremium * (commissionRate / 100);
    
    records.push({
      recordType: 'PREMIUM',
      policyNumber: policy.policyNumber,
      insuredName: policy.insuredName,
      effectiveDate: policy.effectiveDate,
      expiryDate: policy.expiryDate,
      sumInsured: policy.sumInsured,
      grossPremium: policy.premiumAmount,
      cededPremium,
      commissionRate,
      commissionAmount
    });
    
    totalGrossPremium += policy.premiumAmount;
    totalCededPremium += cededPremium;
    totalCommission += commissionAmount;
  }
  
  // Process claims
  for (const claim of claims) {
    if (claim.InsPolicy && claim.InsPolicy.reinsuranceTreatyId === treatyId) {
      const recoveryAmount = claim.reinsuranceRecovery;
      
      records.push({
        recordType: 'CLAIM',
        policyNumber: claim.InsPolicy.policyNumber,
        insuredName: claim.InsPolicy.insuredName,
        effectiveDate: claim.InsPolicy.effectiveDate,
        expiryDate: claim.InsPolicy.expiryDate,
        sumInsured: claim.InsPolicy.sumInsured,
        grossPremium: claim.InsPolicy.premiumAmount,
        cededPremium: 0,
        claimNumber: claim.claimNumber,
        claimDate: claim.occurrenceDate || '',
        claimAmount: claim.claimedAmount,
        recoveryAmount,
        commissionRate: 0,
        commissionAmount: 0
      });
      
      totalClaims += claim.claimedAmount;
      totalRecoveries += recoveryAmount;
    }
  }
  
  const summary = {
    totalPolicies: policies.length,
    totalSumInsured: policies.reduce((sum, p) => sum + p.sumInsured, 0),
    totalGrossPremium: Math.round(totalGrossPremium * 100) / 100,
    totalCededPremium: Math.round(totalCededPremium * 100) / 100,
    totalClaims: Math.round(totalClaims * 100) / 100,
    totalRecoveries: Math.round(totalRecoveries * 100) / 100,
    totalCommission: Math.round(totalCommission * 100) / 100,
    netPremiumCeded: Math.round((totalCededPremium - totalCommission) * 100) / 100
  };
  
  // Save bordereaux to database
  await db.insReinsuranceBordereaux.create({
    data: {
      tenantId,
      treatyId,
      reportingPeriod,
      reportType,
      totalPremium: summary.totalCededPremium,
      totalClaims: summary.totalClaims,
      totalRecovery: summary.totalRecoveries,
      totalCommission: summary.totalCommission,
      recordCount: records.length,
      status: 'draft'
    }
  });
  
  return {
    treatyId: treaty.id,
    treatyNumber: treaty.treatyNumber,
    treatyName: treaty.treatyName,
    reinsurerName: treaty.reinsurerName,
    reportingPeriod,
    generatedAt: new Date().toISOString(),
    records,
    summary
  };
}

// ==================== MULTIPLE TREATY SUPPORT ====================

/**
 * Calculate cession across multiple treaties (layered reinsurance)
 */
export async function calculateLayeredCeding(
  tenantId: string,
  input: CedingInput
): Promise<{
  totalRecovery: number;
  totalRetention: number;
  layers: AutomaticCedingResult[];
}> {
  // Get all active treaties ordered by priority
  const treaties = await db.insReinsuranceTreaty.findMany({
    where: {
      tenantId,
      status: 'active',
      OR: [
        { lineOfBusiness: 'ALL' },
        { lineOfBusiness: input.lineOfBusiness }
      ],
      effectiveDate: { lte: input.occurrenceDate },
      expiryDate: { gte: input.occurrenceDate }
    },
    orderBy: { createdAt: 'asc' }
  });
  
  const layers: AutomaticCedingResult[] = [];
  let remainingClaim = input.claimAmount;
  let totalRecovery = 0;
  
  for (const treaty of treaties) {
    if (remainingClaim <= 0) break;
    
    const layerInput = { ...input, claimAmount: remainingClaim };
    const result = await processAutomaticCeding(tenantId, layerInput);
    
    if (result.processed && result.recoveryAmount > 0) {
      layers.push(result);
      totalRecovery += result.recoveryAmount;
      remainingClaim = result.retentionAmount;
    }
  }
  
  return {
    totalRecovery: Math.round(totalRecovery * 100) / 100,
    totalRetention: Math.round(remainingClaim * 100) / 100,
    layers
  };
}

// ==================== REAL-TIME CEDING CALCULATION ====================

/**
 * Real-time ceding calculation for UI preview
 */
export function previewCeding(
  claimAmount: number,
  sumInsured: number,
  treatyType: TreatyType,
  treatyParams: {
    cedingPercentage?: number;
    retentionLimit?: number;
    attachmentPoint?: number;
    limit?: number;
    cedingCommission?: number;
    premiumRate?: number;
    commissionRate?: number;
  }
): {
  cessionAmount: number;
  retentionAmount: number;
  commissionAmount: number;
  formula: string;
} {
  let cessionAmount = 0;
  let retentionAmount = claimAmount;
  let commissionAmount = 0;
  let formula = '';
  
  switch (treatyType) {
    case 'QUOTA_SHARE': {
      const cedingPct = treatyParams.cedingPercentage || 0;
      cessionAmount = claimAmount * (cedingPct / 100);
      retentionAmount = claimAmount - cessionAmount;
      commissionAmount = cessionAmount * ((treatyParams.cedingCommission || 0) / 100);
      formula = `Cession = TT$${claimAmount.toLocaleString()} × ${cedingPct}% = TT$${cessionAmount.toFixed(2)}`;
      break;
    }
    
    case 'EXCESS_OF_LOSS': {
      const attachment = treatyParams.attachmentPoint || 0;
      const limit = treatyParams.limit || 0;
      const excess = Math.max(0, claimAmount - attachment);
      cessionAmount = Math.min(excess, limit);
      retentionAmount = claimAmount - cessionAmount;
      formula = `Recovery = max(0, min(TT$${claimAmount.toLocaleString()} - TT$${attachment.toLocaleString()}, TT$${limit.toLocaleString()})) = TT$${cessionAmount.toFixed(2)}`;
      break;
    }
    
    case 'SURPLUS': {
      const retention = treatyParams.retentionLimit || 0;
      const surplus = Math.max(0, sumInsured - retention);
      const cessionRatio = sumInsured > 0 ? surplus / sumInsured : 0;
      cessionAmount = claimAmount * cessionRatio;
      retentionAmount = claimAmount - cessionAmount;
      formula = `Cession = (TT$${sumInsured.toLocaleString()} - TT$${retention.toLocaleString()}) / TT$${sumInsured.toLocaleString()} × TT$${claimAmount.toLocaleString()} = TT$${cessionAmount.toFixed(2)}`;
      break;
    }
    
    case 'FACULTATIVE': {
      const cedingPct = treatyParams.cedingPercentage || 0;
      cessionAmount = claimAmount * (cedingPct / 100);
      retentionAmount = claimAmount - cessionAmount;
      const premiumCeded = sumInsured * ((treatyParams.premiumRate || 0) / 100) * (cedingPct / 100);
      commissionAmount = premiumCeded * ((treatyParams.commissionRate || 0) / 100);
      formula = `Cession = TT$${claimAmount.toLocaleString()} × ${cedingPct}% = TT$${cessionAmount.toFixed(2)}`;
      break;
    }
  }
  
  return {
    cessionAmount: Math.round(cessionAmount * 100) / 100,
    retentionAmount: Math.round(retentionAmount * 100) / 100,
    commissionAmount: Math.round(commissionAmount * 100) / 100,
    formula
  };
}
