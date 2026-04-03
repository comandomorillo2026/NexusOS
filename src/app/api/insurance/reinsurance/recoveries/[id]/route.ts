/**
 * Single Recovery API Routes
 * GET - Get recovery by ID
 * PUT - Update recovery
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRecovery, updateRecovery, markRecoveryReceived, billRecovery, calculateRecoveryForClaim } from '@/lib/insurance/recovery-service';
import { getServerSession } from 'next-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const tenantId = request.headers.get('x-tenant-id') || 'demo-tenant';
    const { id } = await params;
    
    const recovery = await getRecovery(tenantId, id);
    
    if (!recovery) {
      return NextResponse.json({ error: 'Recovery not found' }, { status: 404 });
    }
    
    // Get calculation if requested
    const { searchParams } = new URL(request.url);
    const includeCalculation = searchParams.get('includeCalculation') === 'true';
    
    const response: Record<string, unknown> = { success: true, data: recovery };
    
    if (includeCalculation && recovery.claimId) {
      response.calculation = await calculateRecoveryForClaim(tenantId, recovery.claimId);
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching recovery:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recovery', message: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const tenantId = request.headers.get('x-tenant-id') || 'demo-tenant';
    const userId = (session.user as { id?: string })?.id || 'system';
    const { id } = await params;
    
    const body = await request.json();
    
    // Handle special actions
    if (body.action === 'markReceived') {
      const result = await markRecoveryReceived(
        tenantId,
        userId,
        id,
        body.receivedAmount,
        body.receivedDate,
        body.reference
      );
      return NextResponse.json({ success: true, data: result });
    }
    
    if (body.action === 'bill') {
      const result = await billRecovery(tenantId, userId, id, body.dueDate);
      return NextResponse.json({ success: true, data: result });
    }
    
    // Standard update
    const recovery = await updateRecovery(tenantId, userId, id, {
      recoveryAmount: body.recoveryAmount,
      receivedDate: body.receivedDate,
      amountReceived: body.amountReceived,
      dueDate: body.dueDate,
      brokerName: body.brokerName,
      brokerCommission: body.brokerCommission,
      notes: body.notes,
      status: body.status
    });
    
    return NextResponse.json({
      success: true,
      data: recovery
    });
  } catch (error) {
    console.error('Error updating recovery:', error);
    return NextResponse.json(
      { error: 'Failed to update recovery', message: (error as Error).message },
      { status: 500 }
    );
  }
}
