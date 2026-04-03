/**
 * API Route: GET /api/insurance/audit/export
 * Export audit logs for external auditors (CSV, JSON, PDF)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAuditService, type AuditAction, type EntityType, type ComplianceTag } from '@/lib/insurance/audit-service';

const exportAuditLogsSchema = z.object({
  tenantId: z.string().optional(),
  format: z.enum(['JSON', 'CSV', 'PDF']).default('JSON'),
  action: z.enum(['CREATE', 'READ', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'EXPORT', 'LOGIN', 'LOGOUT', 'ACCESS']).optional(),
  entityType: z.enum(['POLICY', 'CLAIM', 'REINSURANCE', 'REGULATORY', 'DOCUMENT', 'AI_MODEL', 'USER', 'AGENT', 'PRODUCT', 'BENEFICIARY', 'PAYMENT', 'REPORT', 'SETTINGS', 'COMPLIANCE']).optional(),
  userId: z.string().optional(),
  entityId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  complianceTag: z.enum(['SOC2', 'GDPR', 'IFRS17', 'LDTI', 'NAIC', 'AMBEST']).optional(),
  search: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const params = exportAuditLogsSchema.parse({
      tenantId: searchParams.get('tenantId') || undefined,
      format: searchParams.get('format') || 'JSON',
      action: searchParams.get('action') || undefined,
      entityType: searchParams.get('entityType') || undefined,
      userId: searchParams.get('userId') || undefined,
      entityId: searchParams.get('entityId') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      complianceTag: searchParams.get('complianceTag') || undefined,
      search: searchParams.get('search') || undefined,
    });
    
    // Default tenant for demo purposes
    const tenantId = params.tenantId || 'insurance-demo';
    
    const auditService = createAuditService(tenantId);
    
    const result = await auditService.export(params.format, {
      tenantId,
      action: params.action as AuditAction,
      entityType: params.entityType as EntityType,
      userId: params.userId,
      entityId: params.entityId,
      startDate: params.startDate ? new Date(params.startDate) : undefined,
      endDate: params.endDate ? new Date(params.endDate) : undefined,
      complianceTag: params.complianceTag as ComplianceTag,
      search: params.search,
    });
    
    // Return with appropriate headers for download
    const response = new NextResponse(result.data, {
      status: 200,
      headers: {
        'Content-Type': result.mimeType,
        'Content-Disposition': `attachment; filename="${result.filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
    
    return response;
  } catch (error) {
    console.error('Error exporting audit logs:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid parameters', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to export audit logs' },
      { status: 500 }
    );
  }
}
