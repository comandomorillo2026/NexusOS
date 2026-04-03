/**
 * Treaty Management API Routes
 * GET - List all treaties
 * POST - Create a new treaty
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTreaties, createTreaty } from '@/lib/insurance/treaty-service';
import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get tenantId from headers or use demo tenant
    const tenantId = request.headers.get('x-tenant-id') || 'demo-tenant';
    
    const { searchParams } = new URL(request.url);
    const filters = {
      status: searchParams.get('status') as 'draft' | 'active' | 'expired' | 'cancelled' | undefined,
      treatyType: searchParams.get('treatyType') as 'QUOTA_SHARE' | 'SURPLUS' | 'EXCESS_OF_LOSS' | 'FACULTATIVE' | undefined,
      lineOfBusiness: searchParams.get('lineOfBusiness') as 'ALL' | 'LIFE' | 'HEALTH' | 'P&C' | 'MOTOR' | 'PROPERTY' | 'MARINE' | undefined,
      reinsurerName: searchParams.get('reinsurerName') || undefined,
      search: searchParams.get('search') || undefined
    };
    
    const treaties = await getTreaties(tenantId, filters);
    
    return NextResponse.json({
      success: true,
      data: treaties
    });
  } catch (error) {
    console.error('Error fetching treaties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch treaties', message: (error as Error).message },
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
    
    const treaty = await createTreaty(tenantId, userId, {
      treatyNumber: body.treatyNumber,
      treatyName: body.treatyName,
      treatyType: body.treatyType,
      reinsurerId: body.reinsurerId,
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
      lineMappings: body.lineMappings
    });
    
    return NextResponse.json({
      success: true,
      data: treaty
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating treaty:', error);
    return NextResponse.json(
      { error: 'Failed to create treaty', message: (error as Error).message },
      { status: 500 }
    );
  }
}
