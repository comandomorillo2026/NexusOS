/**
 * Single Treaty API Routes
 * GET - Get treaty by ID
 * PUT - Update treaty
 * DELETE - Delete treaty
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTreaty, updateTreaty, deleteTreaty, getTreatyCapacity, calculateTreatyCommission } from '@/lib/insurance/treaty-service';
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
    
    const treaty = await getTreaty(tenantId, id);
    
    if (!treaty) {
      return NextResponse.json({ error: 'Treaty not found' }, { status: 404 });
    }
    
    // Get capacity if requested
    const { searchParams } = new URL(request.url);
    const includeCapacity = searchParams.get('includeCapacity') === 'true';
    const includeCommission = searchParams.get('includeCommission') === 'true';
    const period = searchParams.get('period') || new Date().getFullYear().toString();
    
    const response: Record<string, unknown> = { success: true, data: treaty };
    
    if (includeCapacity) {
      response.capacity = await getTreatyCapacity(tenantId, id, period);
    }
    
    if (includeCommission) {
      response.commission = await calculateTreatyCommission(tenantId, id, period);
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching treaty:', error);
    return NextResponse.json(
      { error: 'Failed to fetch treaty', message: (error as Error).message },
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
    
    const treaty = await updateTreaty(tenantId, userId, id, {
      treatyName: body.treatyName,
      treatyType: body.treatyType,
      reinsurerName: body.reinsurerName,
      reinsurerCountry: body.reinsurerCountry,
      reinsurerRating: body.reinsurerRating,
      effectiveDate: body.effectiveDate,
      expiryDate: body.expiryDate,
      renewalDate: body.renewalDate,
      lineOfBusiness: body.lineOfBusiness,
      cedingPercentage: body.cedingPercentage,
      retentionLimit: body.retentionLimit,
      cedingCommission: body.cedingCommission,
      profitCommission: body.profitCommission,
      attachmentPoint: body.attachmentPoint,
      limit: body.limit,
      minimumPremium: body.minimumPremium,
      depositPremium: body.depositPremium,
      premiumRate: body.premiumRate,
      annualAggregateLimit: body.annualAggregateLimit,
      eventLimit: body.eventLimit,
      contactName: body.contactName,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone,
      notes: body.notes,
      status: body.status
    });
    
    return NextResponse.json({
      success: true,
      data: treaty
    });
  } catch (error) {
    console.error('Error updating treaty:', error);
    return NextResponse.json(
      { error: 'Failed to update treaty', message: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    
    await deleteTreaty(tenantId, userId, id);
    
    return NextResponse.json({
      success: true,
      message: 'Treaty deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting treaty:', error);
    return NextResponse.json(
      { error: 'Failed to delete treaty', message: (error as Error).message },
      { status: 500 }
    );
  }
}
