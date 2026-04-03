/**
 * API Route: GET /api/insurance/audit/verify
 * Verify hash chain integrity for tamper detection
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAuditService } from '@/lib/insurance/audit-service';

const verifySchema = z.object({
  tenantId: z.string().optional(),
  limit: z.coerce.number().min(10).max(10000).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const params = verifySchema.parse({
      tenantId: searchParams.get('tenantId') || undefined,
      limit: searchParams.get('limit') || undefined,
    });
    
    // Default tenant for demo purposes
    const tenantId = params.tenantId || 'insurance-demo';
    
    const auditService = createAuditService(tenantId);
    
    const result = await auditService.verifyChain(params.limit);
    
    // Calculate integrity percentage
    const integrityPercentage = result.checkedCount > 0 
      ? ((result.checkedCount - result.errors.length) / result.checkedCount * 100).toFixed(2)
      : '100.00';
    
    return NextResponse.json({
      success: true,
      data: {
        valid: result.valid,
        checkedCount: result.checkedCount,
        integrityPercentage,
        errors: result.errors,
        lastVerifiedAt: new Date().toISOString(),
        summary: {
          totalChecked: result.checkedCount,
          errorsFound: result.errors.length,
          criticalErrors: result.errors.filter(e => e.severity === 'CRITICAL').length,
          highErrors: result.errors.filter(e => e.severity === 'HIGH').length,
          mediumErrors: result.errors.filter(e => e.severity === 'MEDIUM').length,
          lowErrors: result.errors.filter(e => e.severity === 'LOW').length,
        },
      },
    });
  } catch (error) {
    console.error('Error verifying audit chain:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid parameters', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to verify audit chain' },
      { status: 500 }
    );
  }
}
