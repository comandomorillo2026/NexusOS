/**
 * Ceding Calculation API Route
 * POST - Calculate cession amounts for claims
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  previewCeding,
  processAutomaticCeding,
  calculateLayeredCeding,
  calculateQuotaShareCeding,
  calculateExcessOfLoss,
  calculateSurplusShare,
  calculateFacultative,
  calculateSlidingScaleCommission
} from '@/lib/insurance/reinsurance-engine';
import { getServerSession } from 'next-auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const tenantId = request.headers.get('x-tenant-id') || 'demo-tenant';
    
    const body = await request.json();
    const { action } = body;
    
    switch (action) {
      case 'preview': {
        // Preview ceding calculation without creating records
        const result = previewCeding(
          body.claimAmount,
          body.sumInsured,
          body.treatyType,
          {
            cedingPercentage: body.cedingPercentage,
            retentionLimit: body.retentionLimit,
            attachmentPoint: body.attachmentPoint,
            limit: body.limit,
            cedingCommission: body.cedingCommission,
            premiumRate: body.premiumRate,
            commissionRate: body.commissionRate
          }
        );
        
        return NextResponse.json({
          success: true,
          data: result
        });
      }
      
      case 'automatic': {
        // Process automatic ceding for a claim
        const result = await processAutomaticCeding(tenantId, {
          claimId: body.claimId,
          claimAmount: body.claimAmount,
          policyId: body.policyId,
          policyNumber: body.policyNumber,
          sumInsured: body.sumInsured,
          lineOfBusiness: body.lineOfBusiness,
          occurrenceDate: body.occurrenceDate
        });
        
        return NextResponse.json({
          success: true,
          data: result
        });
      }
      
      case 'layered': {
        // Calculate layered ceding across multiple treaties
        const result = await calculateLayeredCeding(tenantId, {
          claimId: body.claimId,
          claimAmount: body.claimAmount,
          policyId: body.policyId,
          policyNumber: body.policyNumber,
          sumInsured: body.sumInsured,
          lineOfBusiness: body.lineOfBusiness,
          occurrenceDate: body.occurrenceDate
        });
        
        return NextResponse.json({
          success: true,
          data: result
        });
      }
      
      case 'quotaShare': {
        const result = calculateQuotaShareCeding(
          {
            claimId: body.claimId || 'preview',
            claimAmount: body.claimAmount,
            policyId: body.policyId || 'preview',
            policyNumber: body.policyNumber || 'PREVIEW',
            sumInsured: body.sumInsured,
            lineOfBusiness: body.lineOfBusiness,
            occurrenceDate: body.occurrenceDate || new Date().toISOString().split('T')[0]
          },
          {
            id: body.treatyId || 'preview',
            treatyNumber: body.treatyNumber || 'QS-PREVIEW',
            treatyName: body.treatyName || 'Preview Quota Share',
            cedingPercentage: body.cedingPercentage,
            cedingCommission: body.cedingCommission || 0
          }
        );
        
        return NextResponse.json({
          success: true,
          data: result
        });
      }
      
      case 'excessOfLoss': {
        const result = calculateExcessOfLoss(
          {
            claimId: body.claimId || 'preview',
            claimAmount: body.claimAmount,
            policyId: body.policyId || 'preview',
            policyNumber: body.policyNumber || 'PREVIEW',
            sumInsured: body.sumInsured,
            lineOfBusiness: body.lineOfBusiness,
            occurrenceDate: body.occurrenceDate || new Date().toISOString().split('T')[0]
          },
          {
            id: body.treatyId || 'preview',
            treatyNumber: body.treatyNumber || 'XOL-PREVIEW',
            treatyName: body.treatyName || 'Preview Excess of Loss',
            attachmentPoint: body.attachmentPoint,
            limit: body.limit
          }
        );
        
        return NextResponse.json({
          success: true,
          data: result
        });
      }
      
      case 'surplus': {
        const result = calculateSurplusShare(
          {
            claimId: body.claimId || 'preview',
            claimAmount: body.claimAmount,
            policyId: body.policyId || 'preview',
            policyNumber: body.policyNumber || 'PREVIEW',
            sumInsured: body.sumInsured,
            lineOfBusiness: body.lineOfBusiness,
            occurrenceDate: body.occurrenceDate || new Date().toISOString().split('T')[0]
          },
          {
            id: body.treatyId || 'preview',
            treatyNumber: body.treatyNumber || 'SURP-PREVIEW',
            treatyName: body.treatyName || 'Preview Surplus',
            retentionLimit: body.retentionLimit
          }
        );
        
        return NextResponse.json({
          success: true,
          data: result
        });
      }
      
      case 'facultative': {
        const result = calculateFacultative(
          {
            claimId: body.claimId || 'preview',
            claimAmount: body.claimAmount,
            policyId: body.policyId || 'preview',
            policyNumber: body.policyNumber || 'PREVIEW',
            sumInsured: body.sumInsured,
            lineOfBusiness: body.lineOfBusiness,
            occurrenceDate: body.occurrenceDate || new Date().toISOString().split('T')[0]
          },
          {
            id: body.treatyId || 'preview',
            treatyNumber: body.treatyNumber || 'FAC-PREVIEW',
            treatyName: body.treatyName || 'Preview Facultative',
            cedingPercentage: body.cedingPercentage,
            premiumRate: body.premiumRate || 0,
            commissionRate: body.commissionRate || 0
          }
        );
        
        return NextResponse.json({
          success: true,
          data: result
        });
      }
      
      case 'commission': {
        const result = calculateSlidingScaleCommission(
          body.premiumCeded,
          body.claimsRecovery,
          body.baseCommissionRate,
          body.slidingScaleTiers || [
            { minLossRatio: 0, maxLossRatio: 40, commissionRate: 40 },
            { minLossRatio: 40, maxLossRatio: 50, commissionRate: 35 },
            { minLossRatio: 50, maxLossRatio: 60, commissionRate: 30 },
            { minLossRatio: 60, maxLossRatio: 75, commissionRate: 25 },
            { minLossRatio: 75, maxLossRatio: 100, commissionRate: 20 }
          ]
        );
        
        return NextResponse.json({
          success: true,
          data: result
        });
      }
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported: preview, automatic, layered, quotaShare, excessOfLoss, surplus, facultative, commission' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error calculating ceding:', error);
    return NextResponse.json(
      { error: 'Failed to calculate ceding', message: (error as Error).message },
      { status: 500 }
    );
  }
}
