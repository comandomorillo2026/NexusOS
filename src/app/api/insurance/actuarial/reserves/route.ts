/**
 * Actuarial Reserves API
 * 
 * GET: Retrieve reserve records
 * POST: Calculate and create new reserve
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  calculateGARPT,
  calculatePPM,
  calculateUnearnedPremium,
  calculateIBNR,
  calculateRBNS,
  ReserveCalculationInput,
  ClaimDevelopmentTriangle,
} from '@/lib/insurance/reserve-engine';

export interface ReserveRequest {
  type: 'GARPT' | 'PPM' | 'UNEARNED_PREMIUM' | 'IBNR' | 'RBNS' | 'TOTAL';
  policyId?: string;
  
  // GARPT/PPM inputs
  sumAssured?: number;
  issueAge?: number;
  currentAge?: number;
  policyYears?: number;
  elapsedYears?: number;
  interestRate?: number;
  mortalityTable?: 'male' | 'female';
  smokerStatus?: 'smoker' | 'nonsmoker' | 'aggregate';
  region?: 'standard' | 'caribbean';
  premium?: number;
  premiumFrequency?: number;
  loadingPercentage?: number;
  
  // Unearned premium inputs
  annualPremium?: number;
  policyStartDate?: string;
  valuationDate?: string;
  policyTermMonths?: number;
  earningPattern?: 'pro_rata' | 'daily' | 'monthly';
  
  // IBNR inputs
  developmentTriangle?: ClaimDevelopmentTriangle[];
  latestReportedClaims?: number;
  reportingDelay?: number;
  confidenceLevel?: number;
  
  // RBNS inputs
  reportedClaims?: Array<{
    claimId: string;
    reportedAmount: number;
    paidToDate: number;
    ageInDays: number;
    claimType: string;
  }>;
  averageSettlementRatio?: number;
  inflationRate?: number;
  settlementRate?: number;
}

// In-memory store for demo purposes
// In production, this would be a database
let reservesStore: Array<{
  id: string;
  type: string;
  lob: string;
  amount: number;
  method: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  details: Record<string, unknown>;
}> = [
  {
    id: '1',
    type: 'CLAIM_RESERVE',
    lob: 'LIFE',
    amount: 12500000,
    method: 'GARPT',
    date: '2024-03-31',
    status: 'approved',
    details: { policyId: 'POL-001', sumAssured: 500000 },
  },
  {
    id: '2',
    type: 'PREMIUM_RESERVE',
    lob: 'HEALTH',
    amount: 4500000,
    method: 'PPM',
    date: '2024-03-31',
    status: 'approved',
    details: { policyId: 'POL-002', premium: 12000 },
  },
  {
    id: '3',
    type: 'UNEARNED_PREMIUM',
    lob: 'MOTOR',
    amount: 2800000,
    method: 'Pro-rata',
    date: '2024-03-31',
    status: 'pending',
    details: { policyId: 'POL-003', annualPremium: 8500 },
  },
  {
    id: '4',
    type: 'CLAIM_RESERVE',
    lob: 'PROPERTY',
    amount: 3200000,
    method: 'GARPT',
    date: '2024-03-31',
    status: 'approved',
    details: { policyId: 'POL-004', sumAssured: 800000 },
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const lob = searchParams.get('lob');

    let filteredReserves = [...reservesStore];

    if (type) {
      filteredReserves = filteredReserves.filter(r => r.type === type);
    }
    if (status) {
      filteredReserves = filteredReserves.filter(r => r.status === status);
    }
    if (lob) {
      filteredReserves = filteredReserves.filter(r => r.lob === lob);
    }

    const totalReserves = filteredReserves.reduce((sum, r) => sum + r.amount, 0);

    return NextResponse.json({
      success: true,
      data: {
        reserves: filteredReserves,
        summary: {
          total: totalReserves,
          count: filteredReserves.length,
          byType: getTypeBreakdown(filteredReserves),
          byLob: getLobBreakdown(filteredReserves),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching reserves:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reserves' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ReserveRequest = await request.json();

    let result: Record<string, unknown> = {};
    let amount = 0;
    let method = '';
    let lob = 'LIFE';

    switch (body.type) {
      case 'GARPT':
        if (!validateGARPTInput(body)) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields for GARPT calculation' },
            { status: 400 }
          );
        }
        const garptResult = calculateGARPT({
          sumAssured: body.sumAssured!,
          issueAge: body.issueAge!,
          currentAge: body.currentAge!,
          policyYears: body.policyYears!,
          elapsedYears: body.elapsedYears!,
          interestRate: body.interestRate || 0.045,
          mortalityTable: body.mortalityTable || 'male',
          smokerStatus: body.smokerStatus || 'aggregate',
          region: body.region || 'caribbean',
          premium: body.premium || 0,
          premiumFrequency: body.premiumFrequency || 1,
          loadingPercentage: body.loadingPercentage || 0.15,
        });
        result = { ...garptResult } as Record<string, unknown>;
        amount = garptResult.reserve;
        method = 'GARPT';
        break;

      case 'PPM':
        if (!validatePPMInput(body)) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields for PPM calculation' },
            { status: 400 }
          );
        }
        const ppmResult = calculatePPM({
          sumAssured: body.sumAssured!,
          issueAge: body.issueAge!,
          currentAge: body.currentAge!,
          policyYears: body.policyYears!,
          elapsedYears: body.elapsedYears!,
          interestRate: body.interestRate || 0.045,
          mortalityTable: body.mortalityTable || 'male',
          smokerStatus: body.smokerStatus || 'aggregate',
          region: body.region || 'caribbean',
          premium: body.premium || 0,
          premiumFrequency: body.premiumFrequency || 1,
          loadingPercentage: body.loadingPercentage || 0.15,
        });
        result = { ...ppmResult } as Record<string, unknown>;
        amount = ppmResult.reserve;
        method = 'PPM';
        break;

      case 'UNEARNED_PREMIUM':
        if (!validateUnearnedPremiumInput(body)) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields for Unearned Premium calculation' },
            { status: 400 }
          );
        }
        const uprResult = calculateUnearnedPremium(
          body.annualPremium!,
          new Date(body.policyStartDate!),
          new Date(body.valuationDate!),
          body.policyTermMonths || 12,
          body.earningPattern || 'pro_rata'
        );
        result = { ...uprResult } as Record<string, unknown>;
        amount = uprResult.unearnedPremium;
        method = 'Pro-rata';
        lob = 'MOTOR';
        break;

      case 'IBNR':
        if (!body.developmentTriangle || !body.latestReportedClaims) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields for IBNR calculation' },
            { status: 400 }
          );
        }
        const ibnrResult = calculateIBNR(
          body.developmentTriangle,
          body.latestReportedClaims,
          body.reportingDelay || 0.5,
          body.confidenceLevel || 0.95
        );
        result = { ...ibnrResult } as Record<string, unknown>;
        amount = ibnrResult.ibnrReserve;
        method = 'Chain Ladder';
        lob = 'PROPERTY';
        break;

      case 'RBNS':
        if (!body.reportedClaims || body.reportedClaims.length === 0) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields for RBNS calculation' },
            { status: 400 }
          );
        }
        const rbnsResult = calculateRBNS(
          body.reportedClaims,
          body.averageSettlementRatio || 0.85,
          body.inflationRate || 0.03,
          body.settlementRate || 0.7
        );
        result = { ...rbnsResult } as Record<string, unknown>;
        amount = rbnsResult.rbnsReserve;
        method = 'Case Reserve';
        lob = 'PROPERTY';
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid reserve type' },
          { status: 400 }
        );
    }

    // Store the reserve
    const newReserve = {
      id: `${Date.now()}`,
      type: body.type === 'UNEARNED_PREMIUM' ? 'PREMIUM_RESERVE' : 'CLAIM_RESERVE',
      lob,
      amount,
      method,
      date: new Date().toISOString().split('T')[0],
      status: 'pending' as const,
      details: {
        policyId: body.policyId,
        ...result,
      },
    };

    reservesStore.push(newReserve);

    return NextResponse.json({
      success: true,
      data: {
        reserve: newReserve,
        calculation: result,
      },
    });
  } catch (error) {
    console.error('Error calculating reserve:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate reserve' },
      { status: 500 }
    );
  }
}

function validateGARPTInput(body: ReserveRequest): boolean {
  return (
    body.sumAssured !== undefined &&
    body.issueAge !== undefined &&
    body.currentAge !== undefined &&
    body.policyYears !== undefined &&
    body.elapsedYears !== undefined
  );
}

function validatePPMInput(body: ReserveRequest): boolean {
  return (
    body.sumAssured !== undefined &&
    body.issueAge !== undefined &&
    body.currentAge !== undefined &&
    body.policyYears !== undefined &&
    body.elapsedYears !== undefined
  );
}

function validateUnearnedPremiumInput(body: ReserveRequest): boolean {
  return (
    body.annualPremium !== undefined &&
    body.policyStartDate !== undefined &&
    body.valuationDate !== undefined
  );
}

function getTypeBreakdown(reserves: typeof reservesStore) {
  const breakdown: Record<string, number> = {};
  for (const r of reserves) {
    breakdown[r.type] = (breakdown[r.type] || 0) + r.amount;
  }
  return breakdown;
}

function getLobBreakdown(reserves: typeof reservesStore) {
  const breakdown: Record<string, number> = {};
  for (const r of reserves) {
    breakdown[r.lob] = (breakdown[r.lob] || 0) + r.amount;
  }
  return breakdown;
}
