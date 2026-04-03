/**
 * IFRS 17 Calculations API
 * 
 * POST: Calculate IFRS 17 metrics (CSM, RA, LRC, LIC)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  calculateCSM,
  calculateRA,
  calculateLRC,
  calculateLIC,
  generateIFRS17DisclosureReport,
  calculatePortfolioIFRS17Summary,
  calculateLossComponent,
  IFRS17ContractInput,
} from '@/lib/insurance/ifrs17-engine';

export interface IFRS17Request {
  calculationType: 'CSM' | 'RA' | 'LRC' | 'LIC' | 'DISCLOSURE' | 'PORTFOLIO' | 'LOSS_COMPONENT';
  
  // Contract inputs
  contractInput?: {
    contractId: string;
    inceptionDate: string;
    valuationDate: string;
    premium: number;
    sumAssured: number;
    policyTerm: number;
    coverageUnits: number;
    interestRate: number;
    acquisitionCosts: number;
    mortalityAssumption: 'male' | 'female';
    smokerStatus: 'smoker' | 'nonsmoker' | 'aggregate';
    region: 'standard' | 'caribbean';
    issueAge: number;
    currentAge: number;
    elapsedYears: number;
  };
  
  // Multiple contracts for portfolio
  contracts?: Array<NonNullable<IFRS17Request['contractInput']>>;
  
  // RA specific inputs
  confidenceLevel?: number;
  method?: 'cost_of_capital' | 'percentile' | 'risk_margin';
  
  // LIC specific inputs
  outstandingClaims?: Array<{
    claimId: string;
    incurredDate: string;
    reportedAmount: number;
    paidToDate: number;
    expectedSettlementYears: number;
    developmentPattern: number[];
  }>;
  inflationRate?: number;
  
  // Previous period values for disclosure
  previousPeriod?: {
    csm: number;
    ra: number;
    lrc: number;
    lic: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: IFRS17Request = await request.json();

    switch (body.calculationType) {
      case 'CSM':
        if (!body.contractInput) {
          return NextResponse.json(
            { success: false, error: 'Missing contract input for CSM calculation' },
            { status: 400 }
          );
        }
        const csmResult = calculateCSM({
          ...body.contractInput,
          inceptionDate: new Date(body.contractInput.inceptionDate),
          valuationDate: new Date(body.contractInput.valuationDate),
        });
        return NextResponse.json({
          success: true,
          data: {
            calculationType: 'CSM',
            result: csmResult,
            contractId: body.contractInput.contractId,
          },
        });

      case 'RA':
        if (!body.contractInput) {
          return NextResponse.json(
            { success: false, error: 'Missing contract input for RA calculation' },
            { status: 400 }
          );
        }
        const raResult = calculateRA(
          {
            ...body.contractInput,
            inceptionDate: new Date(body.contractInput.inceptionDate),
            valuationDate: new Date(body.contractInput.valuationDate),
          },
          body.confidenceLevel || 0.75,
          body.method || 'risk_margin'
        );
        return NextResponse.json({
          success: true,
          data: {
            calculationType: 'RA',
            result: raResult,
            contractId: body.contractInput.contractId,
          },
        });

      case 'LRC':
        if (!body.contractInput) {
          return NextResponse.json(
            { success: false, error: 'Missing contract input for LRC calculation' },
            { status: 400 }
          );
        }
        const lrcResult = calculateLRC({
          ...body.contractInput,
          inceptionDate: new Date(body.contractInput.inceptionDate),
          valuationDate: new Date(body.contractInput.valuationDate),
        });
        return NextResponse.json({
          success: true,
          data: {
            calculationType: 'LRC',
            result: lrcResult,
            contractId: body.contractInput.contractId,
          },
        });

      case 'LIC':
        if (!body.outstandingClaims || body.outstandingClaims.length === 0) {
          return NextResponse.json(
            { success: false, error: 'Missing outstanding claims for LIC calculation' },
            { status: 400 }
          );
        }
        const licResult = calculateLIC(
          body.outstandingClaims.map(c => ({
            ...c,
            incurredDate: new Date(c.incurredDate),
          })),
          body.contractInput?.interestRate || 0.045,
          body.inflationRate || 0.03,
          body.confidenceLevel || 0.90
        );
        return NextResponse.json({
          success: true,
          data: {
            calculationType: 'LIC',
            result: licResult,
          },
        });

      case 'DISCLOSURE':
        if (!body.contractInput) {
          return NextResponse.json(
            { success: false, error: 'Missing contract input for disclosure report' },
            { status: 400 }
          );
        }
        const disclosureReport = generateIFRS17DisclosureReport(
          {
            ...body.contractInput,
            inceptionDate: new Date(body.contractInput.inceptionDate),
            valuationDate: new Date(body.contractInput.valuationDate),
          },
          body.previousPeriod
        );
        return NextResponse.json({
          success: true,
          data: {
            calculationType: 'DISCLOSURE',
            report: disclosureReport,
          },
        });

      case 'PORTFOLIO':
        if (!body.contracts || body.contracts.length === 0) {
          return NextResponse.json(
            { success: false, error: 'Missing contracts for portfolio calculation' },
            { status: 400 }
          );
        }
        const portfolioSummary = calculatePortfolioIFRS17Summary(
          body.contracts.map(c => ({
            ...c,
            inceptionDate: new Date(c.inceptionDate),
            valuationDate: new Date(c.valuationDate),
          }))
        );
        return NextResponse.json({
          success: true,
          data: {
            calculationType: 'PORTFOLIO',
            summary: portfolioSummary,
            contractCount: body.contracts.length,
          },
        });

      case 'LOSS_COMPONENT':
        if (!body.contractInput) {
          return NextResponse.json(
            { success: false, error: 'Missing contract input for loss component calculation' },
            { status: 400 }
          );
        }
        const lossComponent = calculateLossComponent({
          ...body.contractInput,
          inceptionDate: new Date(body.contractInput.inceptionDate),
          valuationDate: new Date(body.contractInput.valuationDate),
        });
        return NextResponse.json({
          success: true,
          data: {
            calculationType: 'LOSS_COMPONENT',
            result: lossComponent,
            contractId: body.contractInput.contractId,
          },
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid calculation type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error calculating IFRS 17 metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate IFRS 17 metrics' },
      { status: 500 }
    );
  }
}

// GET endpoint for sample calculations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'summary';

    if (type === 'summary') {
      // Return sample IFRS 17 portfolio summary
      const sampleContracts: IFRS17ContractInput[] = [
        {
          contractId: 'POL-001',
          inceptionDate: new Date('2022-01-01'),
          valuationDate: new Date('2024-03-31'),
          premium: 5000,
          sumAssured: 250000,
          policyTerm: 20,
          coverageUnits: 20,
          interestRate: 0.045,
          acquisitionCosts: 500,
          mortalityAssumption: 'male',
          smokerStatus: 'nonsmoker',
          region: 'caribbean',
          issueAge: 35,
          currentAge: 37,
          elapsedYears: 2,
        },
        {
          contractId: 'POL-002',
          inceptionDate: new Date('2021-06-01'),
          valuationDate: new Date('2024-03-31'),
          premium: 8000,
          sumAssured: 500000,
          policyTerm: 25,
          coverageUnits: 25,
          interestRate: 0.045,
          acquisitionCosts: 800,
          mortalityAssumption: 'female',
          smokerStatus: 'nonsmoker',
          region: 'caribbean',
          issueAge: 40,
          currentAge: 43,
          elapsedYears: 3,
        },
      ];

      const summary = calculatePortfolioIFRS17Summary(sampleContracts);

      return NextResponse.json({
        success: true,
        data: {
          summary,
          metrics: {
            contractualServiceMargin: summary.totalCSM,
            riskAdjustment: summary.totalRA,
            liabilityForRemainingCoverage: summary.totalLRC,
            liabilityForIncurredClaims: summary.totalLIC,
            totalInsuranceLiability: summary.totalInsuranceLiability,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        availableCalculations: ['CSM', 'RA', 'LRC', 'LIC', 'DISCLOSURE', 'PORTFOLIO', 'LOSS_COMPONENT'],
        description: {
          CSM: 'Contractual Service Margin - unearned profit from insurance contracts',
          RA: 'Risk Adjustment - compensation for uncertainty in cash flows',
          LRC: 'Liability for Remaining Coverage - obligation for future coverage',
          LIC: 'Liability for Incurred Claims - obligation for claims already incurred',
          DISCLOSURE: 'Complete IFRS 17 disclosure report',
          PORTFOLIO: 'Portfolio-level IFRS 17 metrics',
          LOSS_COMPONENT: 'Loss component for onerous contracts',
        },
      },
    });
  } catch (error) {
    console.error('Error in IFRS 17 GET:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
