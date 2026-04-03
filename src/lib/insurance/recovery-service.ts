/**
 * Recovery Management Service
 * NexusOS Insurance Platform
 * 
 * Handles:
 * - Create recovery requests
 * - Track recovery status
 * - Calculate recovery amounts
 * - Integration with claims workflow
 */

import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { processAutomaticCeding, calculateLayeredCeding } from './reinsurance-engine';

// ==================== TYPES ====================

export type RecoveryStatus = 'pending' | 'billed' | 'received' | 'partial' | 'disputed' | 'written_off';
export type RecoveryType = 'CLAIM' | 'PREMIUM' | 'COMMISSION';

export interface CreateRecoveryInput {
  treatyId?: string;
  claimId: string;
  policyId?: string;
  recoveryType: RecoveryType;
  recoveryAmount: number;
  reportedDate: string;
  dueDate?: string;
  brokerName?: string;
  brokerCommission?: number;
  notes?: string;
}

export interface UpdateRecoveryInput extends Partial<CreateRecoveryInput> {
  status?: RecoveryStatus;
  receivedDate?: string;
  amountReceived?: number;
}

export interface RecoveryCalculation {
  claimId: string;
  claimNumber: string;
  claimAmount: number;
  totalRecovery: number;
  netRecovery: number;
  retention: number;
  treaties: {
    treatyId: string;
    treatyNumber: string;
    treatyName: string;
    recoveryAmount: number;
    brokerCommission: number;
    netRecovery: number;
  }[];
}

export interface RecoverySummary {
  totalPending: number;
  totalBilled: number;
  totalReceived: number;
  totalOutstanding: number;
  averageDaysToRecover: number;
  recoveryRate: number;
}

// ==================== RECOVERY REQUEST CREATION ====================

/**
 * Create a recovery request from a claim
 */
export async function createRecoveryRequest(
  tenantId: string,
  userId: string,
  input: CreateRecoveryInput
) {
  // Get claim details
  const claim = await db.insClaim.findUnique({
    where: { id: input.claimId, tenantId },
    include: { InsPolicy: true }
  });
  
  if (!claim) {
    throw new Error('Claim not found');
  }
  
  // Generate recovery number
  const recoveryCount = await db.insReinsuranceRecovery.count({
    where: { tenantId }
  });
  const recoveryNumber = `REC-${new Date().getFullYear()}-${String(recoveryCount + 1).padStart(6, '0')}`;
  
  // Calculate ceding if treaty not specified
  let treatyId = input.treatyId;
  let finalRecoveryAmount = input.recoveryAmount;
  
  if (!treatyId && claim.InsPolicy) {
    const cedingInput = {
      claimId: claim.id,
      claimAmount: claim.claimedAmount,
      policyId: claim.policyId,
      policyNumber: claim.InsPolicy.policyNumber,
      sumInsured: claim.InsPolicy.sumInsured,
      lineOfBusiness: claim.InsPolicy.lineOfBusiness,
      occurrenceDate: claim.occurrenceDate || new Date().toISOString().split('T')[0]
    };
    
    const cedingResult = await processAutomaticCeding(tenantId, cedingInput);
    
    if (cedingResult.processed) {
      treatyId = cedingResult.treatyId;
      finalRecoveryAmount = cedingResult.recoveryAmount;
    }
  }
  
  // Create recovery record
  const recovery = await db.insReinsuranceRecovery.create({
    data: {
      tenantId,
      treatyId,
      claimId: input.claimId,
      policyId: input.policyId || claim.policyId,
      recoveryNumber,
      recoveryType: input.recoveryType,
      recoveryAmount: finalRecoveryAmount,
      reportedDate: input.reportedDate,
      dueDate: input.dueDate,
      brokerName: input.brokerName,
      brokerCommission: input.brokerCommission,
      notes: input.notes,
      status: 'pending',
      amountReceived: 0,
      amountOutstanding: finalRecoveryAmount
    }
  });
  
  // Update claim with reinsurance recovery
  await db.insClaim.update({
    where: { id: input.claimId },
    data: {
      reinsuranceRecovery: finalRecoveryAmount,
      reinsuranceClaimId: recovery.id
    }
  });
  
  // Log audit
  await logRecoveryAudit(tenantId, userId, 'CREATE', recovery.id, recovery.recoveryNumber, null, recovery);
  
  return recovery;
}

/**
 * Create recovery requests for multiple treaties (layered)
 */
export async function createLayeredRecoveryRequests(
  tenantId: string,
  userId: string,
  claimId: string
): Promise<{
  claimId: string;
  totalRecovery: number;
  recoveries: {
    id: string;
    recoveryNumber: string;
    treatyId: string;
    treatyNumber: string;
    recoveryAmount: number;
  }[];
}> {
  const claim = await db.insClaim.findUnique({
    where: { id: claimId, tenantId },
    include: { InsPolicy: true }
  });
  
  if (!claim || !claim.InsPolicy) {
    throw new Error('Claim or associated policy not found');
  }
  
  const cedingInput = {
    claimId: claim.id,
    claimAmount: claim.claimedAmount,
    policyId: claim.policyId,
    policyNumber: claim.InsPolicy.policyNumber,
    sumInsured: claim.InsPolicy.sumInsured,
    lineOfBusiness: claim.InsPolicy.lineOfBusiness,
    occurrenceDate: claim.occurrenceDate || new Date().toISOString().split('T')[0]
  };
  
  const layeredResult = await calculateLayeredCeding(tenantId, cedingInput);
  
  const recoveries: { id: string; recoveryNumber: string; treatyId: string; treatyNumber: string; recoveryAmount: number }[] = [];
  
  for (const layer of layeredResult.layers) {
    if (layer.recoveryAmount > 0) {
      const recovery = await createRecoveryRequest(tenantId, userId, {
        claimId,
        treatyId: layer.treatyId,
        recoveryType: 'CLAIM',
        recoveryAmount: layer.recoveryAmount,
        reportedDate: new Date().toISOString().split('T')[0]
      });
      
      recoveries.push({
        id: recovery.id,
        recoveryNumber: recovery.recoveryNumber,
        treatyId: layer.treatyId,
        treatyNumber: layer.treatyNumber,
        recoveryAmount: layer.recoveryAmount
      });
    }
  }
  
  // Update claim with total recovery
  await db.insClaim.update({
    where: { id: claimId },
    data: { reinsuranceRecovery: layeredResult.totalRecovery }
  });
  
  return {
    claimId,
    totalRecovery: layeredResult.totalRecovery,
    recoveries
  };
}

// ==================== RECOVERY STATUS MANAGEMENT ====================

/**
 * Get recovery by ID
 */
export async function getRecovery(tenantId: string, recoveryId: string) {
  return db.insReinsuranceRecovery.findUnique({
    where: { id: recoveryId, tenantId },
    include: {
      InsReinsuranceTreaty: true
    }
  });
}

/**
 * Get all recoveries with filtering
 */
export async function getRecoveries(
  tenantId: string,
  filters?: {
    status?: RecoveryStatus;
    treatyId?: string;
    claimId?: string;
    recoveryType?: RecoveryType;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }
) {
  const where: Prisma.InsReinsuranceRecoveryWhereInput = {
    tenantId,
    ...(filters?.status && { status: filters.status }),
    ...(filters?.treatyId && { treatyId: filters.treatyId }),
    ...(filters?.claimId && { claimId: filters.claimId }),
    ...(filters?.recoveryType && { recoveryType: filters.recoveryType }),
    ...(filters?.dateFrom && { reportedDate: { gte: filters.dateFrom } }),
    ...(filters?.dateTo && { reportedDate: { lte: filters.dateTo } }),
    ...(filters?.search && {
      OR: [
        { recoveryNumber: { contains: filters.search, mode: 'insensitive' } }
      ]
    })
  };
  
  return db.insReinsuranceRecovery.findMany({
    where,
    include: {
      InsReinsuranceTreaty: {
        select: {
          treatyNumber: true,
          treatyName: true,
          reinsurerName: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

/**
 * Update recovery status
 */
export async function updateRecovery(
  tenantId: string,
  userId: string,
  recoveryId: string,
  input: UpdateRecoveryInput
) {
  const existing = await getRecovery(tenantId, recoveryId);
  if (!existing) {
    throw new Error('Recovery not found');
  }
  
  // Calculate outstanding amount
  let amountOutstanding = existing.amountOutstanding;
  if (input.amountReceived !== undefined) {
    amountOutstanding = existing.recoveryAmount - input.amountReceived;
  }
  
  // Determine status based on amounts
  let status = input.status || existing.status as RecoveryStatus;
  if (input.amountReceived !== undefined) {
    if (input.amountReceived >= existing.recoveryAmount) {
      status = 'received';
    } else if (input.amountReceived > 0) {
      status = 'partial';
    }
  }
  
  const updated = await db.insReinsuranceRecovery.update({
    where: { id: recoveryId },
    data: {
      ...(input.recoveryAmount !== undefined && { recoveryAmount: input.recoveryAmount }),
      ...(input.receivedDate !== undefined && { receivedDate: input.receivedDate }),
      ...(input.amountReceived !== undefined && { 
        amountReceived: input.amountReceived,
        amountOutstanding
      }),
      ...(input.dueDate !== undefined && { dueDate: input.dueDate }),
      ...(input.brokerName !== undefined && { brokerName: input.brokerName }),
      ...(input.brokerCommission !== undefined && { brokerCommission: input.brokerCommission }),
      ...(input.notes !== undefined && { notes: input.notes }),
      status
    }
  });
  
  // Log audit
  await logRecoveryAudit(tenantId, userId, 'UPDATE', recoveryId, existing.recoveryNumber, existing, updated);
  
  return updated;
}

/**
 * Mark recovery as received
 */
export async function markRecoveryReceived(
  tenantId: string,
  userId: string,
  recoveryId: string,
  receivedAmount: number,
  receivedDate: string,
  reference?: string
) {
  const recovery = await getRecovery(tenantId, recoveryId);
  if (!recovery) {
    throw new Error('Recovery not found');
  }
  
  const amountOutstanding = recovery.recoveryAmount - receivedAmount;
  const status = amountOutstanding <= 0 ? 'received' : 'partial';
  
  const updated = await db.insReinsuranceRecovery.update({
    where: { id: recoveryId },
    data: {
      status,
      amountReceived: receivedAmount,
      amountOutstanding: Math.max(0, amountOutstanding),
      receivedDate
    }
  });
  
  // Update claim's reinsurance recovery total
  if (recovery.claimId) {
    const claimRecoveries = await db.insReinsuranceRecovery.aggregate({
      where: { claimId: recovery.claimId, status: 'received' },
      _sum: { amountReceived: true }
    });
    
    await db.insClaim.update({
      where: { id: recovery.claimId },
      data: { reinsuranceRecovery: claimRecoveries._sum.amountReceived || 0 }
    });
  }
  
  // Log audit
  await logRecoveryAudit(tenantId, userId, 'UPDATE', recoveryId, recovery.recoveryNumber, recovery, {
    ...updated,
    receivedAmount,
    reference
  });
  
  return updated;
}

/**
 * Bill recovery to reinsurer
 */
export async function billRecovery(
  tenantId: string,
  userId: string,
  recoveryId: string,
  dueDate?: string
) {
  const recovery = await getRecovery(tenantId, recoveryId);
  if (!recovery) {
    throw new Error('Recovery not found');
  }
  
  if (recovery.status !== 'pending') {
    throw new Error('Only pending recoveries can be billed');
  }
  
  const updated = await db.insReinsuranceRecovery.update({
    where: { id: recoveryId },
    data: {
      status: 'billed',
      dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  });
  
  // Log audit
  await logRecoveryAudit(tenantId, userId, 'UPDATE', recoveryId, recovery.recoveryNumber, recovery, updated);
  
  return updated;
}

// ==================== RECOVERY CALCULATIONS ====================

/**
 * Calculate recovery for a claim
 */
export async function calculateRecoveryForClaim(
  tenantId: string,
  claimId: string
): Promise<RecoveryCalculation> {
  const claim = await db.insClaim.findUnique({
    where: { id: claimId, tenantId },
    include: { InsPolicy: true }
  });
  
  if (!claim) {
    throw new Error('Claim not found');
  }
  
  // Get existing recoveries
  const recoveries = await db.insReinsuranceRecovery.findMany({
    where: { claimId, tenantId },
    include: {
      InsReinsuranceTreaty: {
        select: {
          treatyNumber: true,
          treatyName: true
        }
      }
    }
  });
  
  let totalRecovery = 0;
  let totalBrokerCommission = 0;
  
  const treatyRecoveries = recoveries.map(r => {
    const brokerCommission = r.brokerCommission || 0;
    const netRecovery = r.recoveryAmount - brokerCommission;
    
    totalRecovery += r.recoveryAmount;
    totalBrokerCommission += brokerCommission;
    
    return {
      treatyId: r.treatyId || '',
      treatyNumber: r.InsReinsuranceTreaty?.treatyNumber || 'N/A',
      treatyName: r.InsReinsuranceTreaty?.treatyName || 'Unknown',
      recoveryAmount: r.recoveryAmount,
      brokerCommission,
      netRecovery
    };
  });
  
  return {
    claimId,
    claimNumber: claim.claimNumber,
    claimAmount: claim.claimedAmount,
    totalRecovery,
    netRecovery: totalRecovery - totalBrokerCommission,
    retention: claim.claimedAmount - totalRecovery,
    treaties: treatyRecoveries
  };
}

/**
 * Get recovery summary statistics
 */
export async function getRecoverySummary(
  tenantId: string,
  periodFrom?: string,
  periodTo?: string
): Promise<RecoverySummary> {
  const where: Prisma.InsReinsuranceRecoveryWhereInput = {
    tenantId,
    ...(periodFrom && { reportedDate: { gte: periodFrom } }),
    ...(periodTo && { reportedDate: { lte: periodTo } })
  };
  
  const recoveries = await db.insReinsuranceRecovery.findMany({ where });
  
  // Calculate totals by status
  const totalPending = recoveries
    .filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + r.recoveryAmount, 0);
  
  const totalBilled = recoveries
    .filter(r => r.status === 'billed')
    .reduce((sum, r) => sum + r.recoveryAmount, 0);
  
  const totalReceived = recoveries
    .filter(r => r.status === 'received' || r.status === 'partial')
    .reduce((sum, r) => sum + (r.amountReceived || 0), 0);
  
  const totalOutstanding = recoveries
    .reduce((sum, r) => sum + r.amountOutstanding, 0);
  
  // Calculate average days to recover
  const receivedRecoveries = recoveries.filter(r => r.receivedDate);
  let totalDays = 0;
  
  for (const r of receivedRecoveries) {
    const reported = new Date(r.reportedDate);
    const received = new Date(r.receivedDate!);
    totalDays += Math.ceil((received.getTime() - reported.getTime()) / (1000 * 60 * 60 * 24));
  }
  
  const averageDaysToRecover = receivedRecoveries.length > 0
    ? totalDays / receivedRecoveries.length
    : 0;
  
  // Recovery rate
  const totalRecoveryAmount = recoveries.reduce((sum, r) => sum + r.recoveryAmount, 0);
  const recoveryRate = totalRecoveryAmount > 0
    ? (totalReceived / totalRecoveryAmount) * 100
    : 0;
  
  return {
    totalPending,
    totalBilled,
    totalReceived,
    totalOutstanding,
    averageDaysToRecover: Math.round(averageDaysToRecover * 10) / 10,
    recoveryRate: Math.round(recoveryRate * 10) / 10
  };
}

// ==================== CLAIMS WORKFLOW INTEGRATION ====================

/**
 * Get pending recoveries that need attention
 */
export async function getPendingRecoveriesNeedingAttention(tenantId: string) {
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  // Overdue billed recoveries
  const overdue = await db.insReinsuranceRecovery.findMany({
    where: {
      tenantId,
      status: 'billed',
      dueDate: { lt: today }
    },
    include: {
      InsReinsuranceTreaty: {
        select: {
          treatyNumber: true,
          treatyName: true,
          reinsurerName: true
        }
      }
    }
  });
  
  // Long pending (not billed yet)
  const longPending = await db.insReinsuranceRecovery.findMany({
    where: {
      tenantId,
      status: 'pending',
      reportedDate: { lt: thirtyDaysAgo }
    },
    include: {
      InsReinsuranceTreaty: {
        select: {
          treatyNumber: true,
          treatyName: true,
          reinsurerName: true
        }
      }
    }
  });
  
  return {
    overdue: overdue.map(r => ({
      ...r,
      daysOverdue: Math.ceil((Date.now() - new Date(r.dueDate || '').getTime()) / (1000 * 60 * 60 * 24))
    })),
    longPending: longPending.map(r => ({
      ...r,
      daysPending: Math.ceil((Date.now() - new Date(r.reportedDate).getTime()) / (1000 * 60 * 60 * 24))
    }))
  };
}

/**
 * Auto-generate recovery requests for approved claims
 */
export async function autoGenerateRecoveriesForApprovedClaims(
  tenantId: string,
  userId: string
) {
  // Find approved claims without recovery requests
  const approvedClaimsWithoutRecovery = await db.insClaim.findMany({
    where: {
      tenantId,
      status: 'approved',
      reinsuranceClaimId: null,
      reinsuranceTreatyId: { not: null }
    },
    include: { InsPolicy: true }
  });
  
  const results: { claimId: string; claimNumber: string; recoveryId: string; recoveryAmount: number }[] = [];
  
  for (const claim of approvedClaimsWithoutRecovery) {
    try {
      const recovery = await createRecoveryRequest(tenantId, userId, {
        claimId: claim.id,
        recoveryType: 'CLAIM',
        recoveryAmount: claim.reinsuranceRecovery,
        reportedDate: new Date().toISOString().split('T')[0]
      });
      
      results.push({
        claimId: claim.id,
        claimNumber: claim.claimNumber,
        recoveryId: recovery.id,
        recoveryAmount: recovery.recoveryAmount
      });
    } catch (error) {
      console.error(`Failed to create recovery for claim ${claim.claimNumber}:`, error);
    }
  }
  
  return results;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Log recovery audit
 */
async function logRecoveryAudit(
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
      entityType: 'REINSURANCE_RECOVERY',
      entityId,
      entityNumber,
      oldValue: oldValue ? JSON.stringify(oldValue) : null,
      newValue: newValue ? JSON.stringify(newValue) : null,
      complianceTag: 'IFRS17'
    }
  });
}

/**
 * Generate recovery report
 */
export async function generateRecoveryReport(
  tenantId: string,
  periodFrom: string,
  periodTo: string
) {
  const recoveries = await db.insReinsuranceRecovery.findMany({
    where: {
      tenantId,
      reportedDate: { gte: periodFrom, lte: periodTo }
    },
    include: {
      InsReinsuranceTreaty: true
    }
  });
  
  // Group by treaty
  const byTreaty: Record<string, {
    treatyId: string;
    treatyNumber: string;
    treatyName: string;
    reinsurerName: string;
    recoveries: typeof recoveries;
    totalAmount: number;
    totalReceived: number;
    totalOutstanding: number;
  }> = {};
  
  for (const recovery of recoveries) {
    const treatyId = recovery.treatyId || 'unknown';
    
    if (!byTreaty[treatyId]) {
      byTreaty[treatyId] = {
        treatyId,
        treatyNumber: recovery.InsReinsuranceTreaty?.treatyNumber || 'N/A',
        treatyName: recovery.InsReinsuranceTreaty?.treatyName || 'Unknown Treaty',
        reinsurerName: recovery.InsReinsuranceTreaty?.reinsurerName || 'Unknown',
        recoveries: [],
        totalAmount: 0,
        totalReceived: 0,
        totalOutstanding: 0
      };
    }
    
    byTreaty[treatyId].recoveries.push(recovery);
    byTreaty[treatyId].totalAmount += recovery.recoveryAmount;
    byTreaty[treatyId].totalReceived += recovery.amountReceived || 0;
    byTreaty[treatyId].totalOutstanding += recovery.amountOutstanding;
  }
  
  return {
    periodFrom,
    periodTo,
    generatedAt: new Date().toISOString(),
    summary: {
      totalRecoveries: recoveries.length,
      totalAmount: recoveries.reduce((sum, r) => sum + r.recoveryAmount, 0),
      totalReceived: recoveries.reduce((sum, r) => sum + (r.amountReceived || 0), 0),
      totalOutstanding: recoveries.reduce((sum, r) => sum + r.amountOutstanding, 0)
    },
    byTreaty: Object.values(byTreaty)
  };
}
