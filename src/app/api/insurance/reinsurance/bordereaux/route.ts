/**
 * Bordereaux Generation API Route
 * POST - Generate bordereaux report
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateBordereaux } from '@/lib/insurance/reinsurance-engine';
import { getServerSession } from 'next-auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const tenantId = request.headers.get('x-tenant-id') || 'demo-tenant';
    
    const body = await request.json();
    
    const { treatyId, reportingPeriod, reportType } = body;
    
    if (!treatyId || !reportingPeriod) {
      return NextResponse.json(
        { error: 'Missing required fields: treatyId, reportingPeriod' },
        { status: 400 }
      );
    }
    
    const bordereaux = await generateBordereaux(
      tenantId,
      treatyId,
      reportingPeriod,
      reportType || 'PREMIUM'
    );
    
    return NextResponse.json({
      success: true,
      data: bordereaux
    });
  } catch (error) {
    console.error('Error generating bordereaux:', error);
    return NextResponse.json(
      { error: 'Failed to generate bordereaux', message: (error as Error).message },
      { status: 500 }
    );
  }
}
