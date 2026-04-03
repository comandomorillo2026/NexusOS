/**
 * Treaty Management Service
 * NexusOS Insurance Platform
 * 
 * Handles:
 * - Treaty CRUD operations
 * - Treaty validation (limits, expiry, capacity)
 * - Commission calculations (flat, sliding scale, profit commission)
 * - Treaty renewal management
 */

import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

// ==================== TYPES ====================

export type TreatyType = 'QUOTA_SHARE' | 'SURPLUS' | 'EXCESS_OF_LOSS' | 'FACULTATIVE';
export type TreatyStatus = 'draft' | 'active' | 'expired' | 'cancelled';
export type LineOfBusiness = 'ALL' | 'LIFE' | 'HEALTH' | 'P&C' | 'MOTOR' | 'PROPERTY' | 'MARINE';

export interface CreateTreatyInput {
  treatyNumber: string;
  treatyName: string;
  treatyType: TreatyType;
  reinsurerId?: string;
  reinsurerName: string;
  reinsurerCountry?: string;
  reinsurerRating?: string;
  effectiveDate: string;
  expiryDate: string;
  renewalDate?: string;
  lineOfBusiness: LineOfBusiness;
  cedingPercentage?: number;
  retentionLimit?: number;
  cedingCommission?: number;
  profitCommission?: number;
  attachmentPoint?: number;
  limit?: number;
  minimumPremium?: number;
  depositPremium?: number;
  premiumRate?: number;
  annualAggregateLimit?: number;
  eventLimit?: number;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
  lineMappings?: {
    productCode: string;
    productName: string;
    coverageType?: string;
    autoCede?: boolean;
    priority?: number;
  }[];
}

export interface UpdateTreatyInput extends Partial<CreateTreatyInput> {
  status?: TreatyStatus;
}

export interface TreatyValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface TreatyCapacity {
  treatyId: string;
  treatyNumber: string;
  totalCapacity: number;
  usedCapacity: number;
  availableCapacity: number;
  utilizationPercentage: number;
}

export interface CommissionCalculation {
  treatyId: string;
  period: string;
  premiumCeded: number;
  claimsRecovered: number;
  lossRatio: number;
  baseCommission: number;
  profitCommission: number;
  slidingScaleCommission: number;
  totalCommission: number;
  commissionRate: number;
}

// ==================== CRUD OPERATIONS ====================

/**
 * Create a new reinsurance treaty
 */
export async function createTreaty(
  tenantId: string,
  userId: string,
  input: CreateTreatyInput
) {
  // Validate treaty number is unique
  const existing = await db.insReinsuranceTreaty.findFirst({
    where: { tenantId, treatyNumber: input.treatyNumber }
  });
  
  if (existing) {
    throw new Error(`Treaty number ${input.treatyNumber} already exists`);
  }
  
  // Validate dates
  const effectiveDate = new Date(input.effectiveDate);
  const expiryDate = new Date(input.expiryDate);
  
  if (expiryDate <= effectiveDate) {
    throw new Error('Expiry date must be after effective date');
  }
  
  // Create treaty with mappings
  const treaty = await db.insReinsuranceTreaty.create({
    data: {
      tenantId,
      treatyNumber: input.treatyNumber,
      treatyName: input.treatyName,
      treatyType: input.treatyType,
      reinsurerId: input.reinsurerId,
      reinsurerName: input.reinsurerName,
      reinsurerCountry: input.reinsurerCountry,
      reinsurerRating: input.reinsurerRating,
      effectiveDate: input.effectiveDate,
      expiryDate: input.expiryDate,
      renewalDate: input.renewalDate,
      lineOfBusiness: input.lineOfBusiness,
      cedingPercentage: input.cedingPercentage,
      retentionLimit: input.retentionLimit,
      cedingCommission: input.cedingCommission,
      profitCommission: input.profitCommission,
      attachmentPoint: input.attachmentPoint,
      limit: input.limit,
      minimumPremium: input.minimumPremium,
      depositPremium: input.depositPremium,
      premiumRate: input.premiumRate,
      annualAggregateLimit: input.annualAggregateLimit,
      eventLimit: input.eventLimit,
      contactName: input.contactName,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      notes: input.notes,
      status: 'draft',
      treatyMappings: input.lineMappings ? {
        create: input.lineMappings.map(m => ({
          tenantId,
          productCode: m.productCode,
          productName: m.productName,
          coverageType: m.coverageType,
          autoCede: m.autoCede ?? true,
          priority: m.priority ?? 1
        }))
      } : undefined
    },
    include: {
      treatyMappings: true
    }
  });
  
  // Log audit
  await logTreatyAudit(tenantId, userId, 'CREATE', treaty.id, treaty.treatyNumber, null, treaty);
  
  return treaty;
}

/**
 * Get treaty by ID
 */
export async function getTreaty(tenantId: string, treatyId: string) {
  return db.insReinsuranceTreaty.findUnique({
    where: { id: treatyId, tenantId },
    include: {
      treatyMappings: true,
      bordereaux: {
        take: 10,
        orderBy: { createdAt: 'desc' }
      },
      claimRecoveries: {
        take: 20,
        orderBy: { createdAt: 'desc' }
      }
    }
  });
}

/**
 * Get all treaties for tenant
 */
export async function getTreaties(
  tenantId: string,
  filters?: {
    status?: TreatyStatus;
    treatyType?: TreatyType;
    lineOfBusiness?: LineOfBusiness;
    reinsurerName?: string;
    search?: string;
  }
) {
  const where: Prisma.InsReinsuranceTreatyWhereInput = {
    tenantId,
    ...(filters?.status && { status: filters.status }),
    ...(filters?.treatyType && { treatyType: filters.treatyType }),
    ...(filters?.lineOfBusiness && { lineOfBusiness: filters.lineOfBusiness }),
    ...(filters?.reinsurerName && { 
      reinsurerName: { contains: filters.reinsurerName, mode: 'insensitive' } 
    }),
    ...(filters?.search && {
      OR: [
        { treatyNumber: { contains: filters.search, mode: 'insensitive' } },
        { treatyName: { contains: filters.search, mode: 'insensitive' } },
        { reinsurerName: { contains: filters.search, mode: 'insensitive' } }
      ]
    })
  };
  
  return db.insReinsuranceTreaty.findMany({
    where,
    include: {
      treatyMappings: true,
      _count: {
        select: {
          claimRecoveries: true,
          bordereaux: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

/**
 * Update treaty
 */
export async function updateTreaty(
  tenantId: string,
  userId: string,
  treatyId: string,
  input: UpdateTreatyInput
) {
  // Get existing treaty
  const existing = await getTreaty(tenantId, treatyId);
  if (!existing) {
    throw new Error('Treaty not found');
  }
  
  // If activating, validate treaty
  if (input.status === 'active' && existing.status !== 'active') {
    const validation = validateTreaty({ ...existing, ...input });
    if (!validation.isValid) {
      throw new Error(`Treaty validation failed: ${validation.errors.join(', ')}`);
    }
  }
  
  const updated = await db.insReinsuranceTreaty.update({
    where: { id: treatyId },
    data: {
      ...(input.treatyName && { treatyName: input.treatyName }),
      ...(input.treatyType && { treatyType: input.treatyType }),
      ...(input.reinsurerName && { reinsurerName: input.reinsurerName }),
      ...(input.reinsurerCountry && { reinsurerCountry: input.reinsurerCountry }),
      ...(input.reinsurerRating && { reinsurerRating: input.reinsurerRating }),
      ...(input.effectiveDate && { effectiveDate: input.effectiveDate }),
      ...(input.expiryDate && { expiryDate: input.expiryDate }),
      ...(input.renewalDate !== undefined && { renewalDate: input.renewalDate }),
      ...(input.lineOfBusiness && { lineOfBusiness: input.lineOfBusiness }),
      ...(input.cedingPercentage !== undefined && { cedingPercentage: input.cedingPercentage }),
      ...(input.retentionLimit !== undefined && { retentionLimit: input.retentionLimit }),
      ...(input.cedingCommission !== undefined && { cedingCommission: input.cedingCommission }),
      ...(input.profitCommission !== undefined && { profitCommission: input.profitCommission }),
      ...(input.attachmentPoint !== undefined && { attachmentPoint: input.attachmentPoint }),
      ...(input.limit !== undefined && { limit: input.limit }),
      ...(input.minimumPremium !== undefined && { minimumPremium: input.minimumPremium }),
      ...(input.depositPremium !== undefined && { depositPremium: input.depositPremium }),
      ...(input.premiumRate !== undefined && { premiumRate: input.premiumRate }),
      ...(input.annualAggregateLimit !== undefined && { annualAggregateLimit: input.annualAggregateLimit }),
      ...(input.eventLimit !== undefined && { eventLimit: input.eventLimit }),
      ...(input.contactName !== undefined && { contactName: input.contactName }),
      ...(input.contactEmail !== undefined && { contactEmail: input.contactEmail }),
      ...(input.contactPhone !== undefined && { contactPhone: input.contactPhone }),
      ...(input.notes !== undefined && { notes: input.notes }),
      ...(input.status && { status: input.status })
    },
    include: {
      treatyMappings: true
    }
  });
  
  // Log audit
  await logTreatyAudit(tenantId, userId, 'UPDATE', treatyId, existing.treatyNumber, existing, updated);
  
  return updated;
}

/**
 * Delete treaty (soft delete by setting status to cancelled)
 */
export async function deleteTreaty(
  tenantId: string,
  userId: string,
  treatyId: string
) {
  const existing = await getTreaty(tenantId, treatyId);
  if (!existing) {
    throw new Error('Treaty not found');
  }
  
  // Check for active recoveries
  const activeRecoveries = await db.insReinsuranceRecovery.count({
    where: {
      treatyId,
      status: { in: ['pending', 'billed'] }
    }
  });
  
  if (activeRecoveries > 0) {
    throw new Error('Cannot delete treaty with active recoveries');
  }
  
  const updated = await db.insReinsuranceTreaty.update({
    where: { id: treatyId },
    data: { status: 'cancelled' }
  });
  
  // Log audit
  await logTreatyAudit(tenantId, userId, 'DELETE', treatyId, existing.treatyNumber, existing, null);
  
  return updated;
}

// ==================== VALIDATION ====================

/**
 * Validate treaty configuration
 */
export function validateTreaty(treaty: Partial<CreateTreatyInput> & { id?: string }): TreatyValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Required fields
  if (!treaty.treatyNumber) errors.push('Treaty number is required');
  if (!treaty.treatyName) errors.push('Treaty name is required');
  if (!treaty.treatyType) errors.push('Treaty type is required');
  if (!treaty.reinsurerName) errors.push('Reinsurer name is required');
  if (!treaty.effectiveDate) errors.push('Effective date is required');
  if (!treaty.expiryDate) errors.push('Expiry date is required');
  
  // Date validation
  if (treaty.effectiveDate && treaty.expiryDate) {
    const effective = new Date(treaty.effectiveDate);
    const expiry = new Date(treaty.expiryDate);
    
    if (expiry <= effective) {
      errors.push('Expiry date must be after effective date');
    }
    
    // Check if treaty is expiring soon
    const daysUntilExpiry = Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry > 0 && daysUntilExpiry <= 90) {
      warnings.push(`Treaty expires in ${daysUntilExpiry} days`);
    }
  }
  
  // Treaty type specific validation
  switch (treaty.treatyType) {
    case 'QUOTA_SHARE':
      if (treaty.cedingPercentage === undefined || treaty.cedingPercentage === null) {
        errors.push('Ceding percentage is required for Quota Share treaties');
      } else if (treaty.cedingPercentage <= 0 || treaty.cedingPercentage > 100) {
        errors.push('Ceding percentage must be between 0 and 100');
      }
      break;
      
    case 'SURPLUS':
      if (!treaty.retentionLimit) {
        errors.push('Retention limit is required for Surplus treaties');
      }
      if (treaty.retentionLimit && treaty.retentionLimit <= 0) {
        errors.push('Retention limit must be greater than 0');
      }
      break;
      
    case 'EXCESS_OF_LOSS':
      if (!treaty.attachmentPoint) {
        errors.push('Attachment point is required for Excess of Loss treaties');
      }
      if (!treaty.limit) {
        errors.push('Limit is required for Excess of Loss treaties');
      }
      if (treaty.attachmentPoint && treaty.limit && treaty.attachmentPoint >= treaty.attachmentPoint + treaty.limit) {
        errors.push('Invalid attachment point and limit configuration');
      }
      break;
      
    case 'FACULTATIVE':
      if (!treaty.cedingPercentage && !treaty.premiumRate) {
        warnings.push('Facultative treaties should have ceding percentage or premium rate defined');
      }
      break;
  }
  
  // Reinsurer rating warning
  if (!treaty.reinsurerRating) {
    warnings.push('Reinsurer rating is not specified');
  }
  
  // Capacity limits
  if (treaty.annualAggregateLimit && treaty.eventLimit) {
    if (treaty.eventLimit > treaty.annualAggregateLimit) {
      warnings.push('Event limit exceeds annual aggregate limit');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Check treaty capacity utilization
 */
export async function getTreatyCapacity(
  tenantId: string,
  treatyId: string,
  period?: string // YYYY format for year
): Promise<TreatyCapacity> {
  const treaty = await getTreaty(tenantId, treatyId);
  if (!treaty) {
    throw new Error('Treaty not found');
  }
  
  const year = period || new Date().getFullYear().toString();
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;
  
  // Calculate total recoveries for the period
  const recoveries = await db.insReinsuranceRecovery.aggregate({
    where: {
      tenantId,
      treatyId,
      reportedDate: { gte: startDate, lte: endDate }
    },
    _sum: {
      recoveryAmount: true
    }
  });
  
  const totalCapacity = treaty.annualAggregateLimit || treaty.limit || 0;
  const usedCapacity = recoveries._sum.recoveryAmount || 0;
  const availableCapacity = Math.max(0, totalCapacity - usedCapacity);
  const utilizationPercentage = totalCapacity > 0 ? (usedCapacity / totalCapacity) * 100 : 0;
  
  return {
    treatyId,
    treatyNumber: treaty.treatyNumber,
    totalCapacity,
    usedCapacity,
    availableCapacity,
    utilizationPercentage
  };
}

// ==================== COMMISSION CALCULATIONS ====================

/**
 * Calculate commission for a treaty
 */
export async function calculateTreatyCommission(
  tenantId: string,
  treatyId: string,
  period: string // YYYY-MM or YYYY-Q1 format
): Promise<CommissionCalculation> {
  const treaty = await getTreaty(tenantId, treatyId);
  if (!treaty) {
    throw new Error('Treaty not found');
  }
  
  // Parse period
  const [year, periodPart] = period.split('-');
  let startDate: string;
  let endDate: string;
  
  if (periodPart.startsWith('Q')) {
    const quarter = parseInt(periodPart.replace('Q', ''));
    const startMonth = (quarter - 1) * 3 + 1;
    const endMonth = quarter * 3;
    startDate = `${year}-${String(startMonth).padStart(2, '0')}-01`;
    endDate = `${year}-${String(endMonth).padStart(2, '0')}-${new Date(parseInt(year), endMonth, 0).getDate()}`;
  } else {
    const month = parseInt(periodPart);
    startDate = `${year}-${periodPart}-01`;
    endDate = `${year}-${periodPart}-${new Date(parseInt(year), month, 0).getDate()}`;
  }
  
  // Get premium ceded for period
  const premiumResult = await db.insPremiumTransaction.aggregate({
    where: {
      tenantId,
      transactionDate: { gte: startDate, lte: endDate }
    },
    _sum: {
      amount: true
    }
  });
  
  // Get claims recovered for period
  const recoveryResult = await db.insReinsuranceRecovery.aggregate({
    where: {
      tenantId,
      treatyId,
      reportedDate: { gte: startDate, lte: endDate },
      status: 'received'
    },
    _sum: {
      recoveryAmount: true,
      amountReceived: true
    }
  });
  
  const premiumCeded = premiumResult._sum.amount || 0;
  const claimsRecovered = recoveryResult._sum.recoveryAmount || 0;
  const lossRatio = premiumCeded > 0 ? (claimsRecovered / premiumCeded) * 100 : 0;
  
  // Base commission
  const baseCommissionRate = treaty.cedingCommission || 0;
  const baseCommission = premiumCeded * (baseCommissionRate / 100);
  
  // Profit commission (if configured)
  let profitCommission = 0;
  if (treaty.profitCommission && lossRatio < 60) {
    const profit = premiumCeded - claimsRecovered;
    profitCommission = profit * (treaty.profitCommission / 100);
  }
  
  // Sliding scale commission (simplified - would typically have tier table)
  let slidingScaleCommission = baseCommission;
  if (lossRatio < 40) {
    slidingScaleCommission = premiumCeded * 0.40; // 40% commission
  } else if (lossRatio < 50) {
    slidingScaleCommission = premiumCeded * 0.35; // 35% commission
  } else if (lossRatio < 60) {
    slidingScaleCommission = premiumCeded * 0.30; // 30% commission
  } else if (lossRatio < 75) {
    slidingScaleCommission = premiumCeded * 0.25; // 25% commission
  } else {
    slidingScaleCommission = premiumCeded * 0.20; // 20% commission
  }
  
  const totalCommission = slidingScaleCommission + profitCommission;
  
  return {
    treatyId,
    period,
    premiumCeded,
    claimsRecovered,
    lossRatio: Math.round(lossRatio * 100) / 100,
    baseCommission: Math.round(baseCommission * 100) / 100,
    profitCommission: Math.round(profitCommission * 100) / 100,
    slidingScaleCommission: Math.round(slidingScaleCommission * 100) / 100,
    totalCommission: Math.round(totalCommission * 100) / 100,
    commissionRate: baseCommissionRate
  };
}

// ==================== RENEWAL MANAGEMENT ====================

/**
 * Get treaties due for renewal
 */
export async function getTreatiesForRenewal(
  tenantId: string,
  daysAhead: number = 90
) {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + daysAhead);
  
  return db.insReinsuranceTreaty.findMany({
    where: {
      tenantId,
      status: 'active',
      expiryDate: {
        gte: today.toISOString().split('T')[0],
        lte: futureDate.toISOString().split('T')[0]
      }
    },
    include: {
      treatyMappings: true
    },
    orderBy: { expiryDate: 'asc' }
  });
}

/**
 * Renew a treaty
 */
export async function renewTreaty(
  tenantId: string,
  userId: string,
  treatyId: string,
  renewalData: {
    newEffectiveDate: string;
    newExpiryDate: string;
    newCedingPercentage?: number;
    newCedingCommission?: number;
    newLimit?: number;
    newPremiumRate?: number;
    notes?: string;
  }
) {
  const existing = await getTreaty(tenantId, treatyId);
  if (!existing) {
    throw new Error('Treaty not found');
  }
  
  // Create new treaty as a renewal
  const newTreatyNumber = `${existing.treatyNumber}-R${new Date().getFullYear()}`;
  
  const renewed = await createTreaty(tenantId, userId, {
    treatyNumber: newTreatyNumber,
    treatyName: existing.treatyName,
    treatyType: existing.treatyType as TreatyType,
    reinsurerId: existing.reinsurerId || undefined,
    reinsurerName: existing.reinsurerName,
    reinsurerCountry: existing.reinsurerCountry || undefined,
    reinsurerRating: existing.reinsurerRating || undefined,
    effectiveDate: renewalData.newEffectiveDate,
    expiryDate: renewalData.newExpiryDate,
    lineOfBusiness: existing.lineOfBusiness as LineOfBusiness,
    cedingPercentage: renewalData.newCedingPercentage ?? existing.cedingPercentage ?? undefined,
    retentionLimit: existing.retentionLimit ?? undefined,
    cedingCommission: renewalData.newCedingCommission ?? existing.cedingCommission ?? undefined,
    profitCommission: existing.profitCommission ?? undefined,
    attachmentPoint: existing.attachmentPoint ?? undefined,
    limit: renewalData.newLimit ?? existing.limit ?? undefined,
    minimumPremium: existing.minimumPremium ?? undefined,
    depositPremium: existing.depositPremium ?? undefined,
    premiumRate: renewalData.newPremiumRate ?? existing.premiumRate ?? undefined,
    annualAggregateLimit: existing.annualAggregateLimit ?? undefined,
    eventLimit: existing.eventLimit ?? undefined,
    contactName: existing.contactName ?? undefined,
    contactEmail: existing.contactEmail ?? undefined,
    contactPhone: existing.contactPhone ?? undefined,
    notes: renewalData.notes || existing.notes || undefined
  });
  
  // Mark old treaty as expired
  await updateTreaty(tenantId, userId, treatyId, { status: 'expired' });
  
  return renewed;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Log treaty audit
 */
async function logTreatyAudit(
  tenantId: string,
  userId: string,
  action: string,
  entityId: string,
  entityNumber: string,
  oldValue: unknown,
  newValue: unknown
) {
  await db.insAuditLog.create({
    data: {
      tenantId,
      userId,
      userEmail: '',
      userName: '',
      userRole: '',
      action,
      entityType: 'REINSURANCE_TREATY',
      entityId,
      entityNumber,
      oldValue: oldValue ? JSON.stringify(oldValue) : null,
      newValue: newValue ? JSON.stringify(newValue) : null,
      complianceTag: 'IFRS17'
    }
  });
}

/**
 * Get treaty statistics
 */
export async function getTreatyStatistics(tenantId: string) {
  const treaties = await db.insReinsuranceTreaty.findMany({
    where: { tenantId },
    include: {
      claimRecoveries: true
    }
  });
  
  const activeTreaties = treaties.filter(t => t.status === 'active').length;
  const totalPremiumCeded = treaties.reduce((sum, t) => sum + (t.depositPremium || 0), 0);
  const totalRecoveries = treaties.reduce((sum, t) => 
    sum + t.claimRecoveries.reduce((rs, r) => rs + r.recoveryAmount, 0), 0
  );
  
  // By type breakdown
  const byType = {
    QUOTA_SHARE: treaties.filter(t => t.treatyType === 'QUOTA_SHARE').length,
    SURPLUS: treaties.filter(t => t.treatyType === 'SURPLUS').length,
    EXCESS_OF_LOSS: treaties.filter(t => t.treatyType === 'EXCESS_OF_LOSS').length,
    FACULTATIVE: treaties.filter(t => t.treatyType === 'FACULTATIVE').length
  };
  
  // By line of business
  const byLineOfBusiness: Record<string, number> = {};
  treaties.forEach(t => {
    byLineOfBusiness[t.lineOfBusiness] = (byLineOfBusiness[t.lineOfBusiness] || 0) + 1;
  });
  
  // Reinsurers count
  const reinsurers = new Set(treaties.map(t => t.reinsurerName));
  
  return {
    totalTreaties: treaties.length,
    activeTreaties,
    totalPremiumCeded,
    totalRecoveries,
    uniqueReinsurers: reinsurers.size,
    byType,
    byLineOfBusiness
  };
}
