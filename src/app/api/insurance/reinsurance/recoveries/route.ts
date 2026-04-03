/**
 * Recovery Management API Routes
 * GET - List all recoveries
 * POST - Create a new recovery request
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRecoveries, createRecoveryRequest, createLayeredRecoveryRequests, getRecoverySummary } from '@/lib/insurance/recovery-service';
import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const tenantId = request.headers.get('x-tenant-id') || 'demo-tenant';
    
    const { searchParams } = new URL(request.url);
    const filters = {
      status: searchParams.get('status') as 'pending' | 'billed' | 'received' | 'partial' | 'disputed' | 'written_off' | undefined,
      treatyId: searchParams.get('treatyId') || undefined,
      claimId: searchParams.get('claimId') || undefined,
      recoveryType: searchParams.get('recoveryType') as 'CLAIM' | 'PREMIUM' | 'COMMISSION' | undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      search: searchParams.get('search') || undefined
    };
    
    const includeSummary = searchParams.get('includeSummary') === 'true';
    
    const [recoveries, summary] = await Promise.all([
      getRecoveries(tenantId, filters),
      includeSummary ? getRecoverySummary(tenantId, filters.dateFrom, filters.dateTo) : null
    ]);
    
    const response: Record<string, unknown> = {
      success: true,
      data: recoveries
    };
    
    if (summary) {
      response.summary = summary;
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching recoveries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recoveries', message: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const tenantId = request.headers.get('x-tenant-id') || 'demo-tenant';
    const userId = (session.user as { id?: string })?.id || 'system';
    
    const body = await request.json();
    
    // Check if this is a layered recovery request
    if (body.layered && body.claimId) {
      const result = await createLayeredRecoveryRequests(tenantId, userId, body.claimId);
      return NextResponse.json({
        success: true,
        data: result
      }, { status: 201 });
    }
    
    const recovery = await createRecoveryRequest(tenantId, userId, {
      treatyId: body.treatyId,
      claimId: body.claimId,
      policyId: body.policyId,
      recoveryType: body.recoveryType,
      recoveryAmount: body.recoveryAmount,
      reportedDate: body.reportedDate,
      dueDate: body.dueDate,
      brokerName: body.brokerName,
      brokerCommission: body.brokerCommission,
      notes: body.notes
    });
    
    return NextResponse.json({
      success: true,
      data: recovery
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating recovery:', error);
    return NextResponse.json(
      { error: 'Failed to create recovery', message: (error as Error).message },
      { status: 500 }
    );
  }
}
