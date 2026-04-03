/**
 * API Route: GET /api/insurance/audit/stats
 * Get audit statistics for SOC 2 compliance dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAuditService } from '@/lib/insurance/audit-service';

const statsSchema = z.object({
  tenantId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const params = statsSchema.parse({
      tenantId: searchParams.get('tenantId') || undefined,
    });
    
    // Default tenant for demo purposes
    const tenantId = params.tenantId || 'insurance-demo';
    
    const auditService = createAuditService(tenantId);
    
    const stats = await auditService.getStats();
    
    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error retrieving audit stats:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid parameters', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve audit statistics' },
      { status: 500 }
    );
  }
}
