/**
 * API Route: GET /api/insurance/audit
 * List audit logs with filters for SOC 2 Type II compliance
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAuditService, type AuditAction, type EntityType, type ComplianceTag } from '@/lib/insurance/audit-service';

const listAuditLogsSchema = z.object({
  tenantId: z.string().optional(),
  action: z.enum(['CREATE', 'READ', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'EXPORT', 'LOGIN', 'LOGOUT', 'ACCESS']).optional(),
  entityType: z.enum(['POLICY', 'CLAIM', 'REINSURANCE', 'REGULATORY', 'DOCUMENT', 'AI_MODEL', 'USER', 'AGENT', 'PRODUCT', 'BENEFICIARY', 'PAYMENT', 'REPORT', 'SETTINGS', 'COMPLIANCE']).optional(),
  userId: z.string().optional(),
  entityId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  complianceTag: z.enum(['SOC2', 'GDPR', 'IFRS17', 'LDTI', 'NAIC', 'AMBEST']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const params = listAuditLogsSchema.parse({
      tenantId: searchParams.get('tenantId') || undefined,
      action: searchParams.get('action') || undefined,
      entityType: searchParams.get('entityType') || undefined,
      userId: searchParams.get('userId') || undefined,
      entityId: searchParams.get('entityId') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      complianceTag: searchParams.get('complianceTag') || undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
    });
    
    // Default tenant for demo purposes
    const tenantId = params.tenantId || 'insurance-demo';
    
    const auditService = createAuditService(tenantId);
    
    const result = await auditService.list({
      tenantId,
      action: params.action as AuditAction,
      entityType: params.entityType as EntityType,
      userId: params.userId,
      entityId: params.entityId,
      startDate: params.startDate ? new Date(params.startDate) : undefined,
      endDate: params.endDate ? new Date(params.endDate) : undefined,
      complianceTag: params.complianceTag as ComplianceTag,
      search: params.search,
      page: params.page,
      limit: params.limit,
    });
    
    return NextResponse.json({
      success: true,
      data: result.entries,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  } catch (error) {
    console.error('Error listing audit logs:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid parameters', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve audit logs' },
      { status: 500 }
    );
  }
}
