import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/pharmacy/drugs - Get all drugs
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const therapeuticClass = searchParams.get('therapeuticClass') || '';
    const controlled = searchParams.get('controlled');
    
    const drugs = await db.pharmacyDrug.findMany({
      where: {
        AND: [
          search ? {
            OR: [
              { drugName: { contains: search, mode: 'insensitive' } },
              { brandName: { contains: search, mode: 'insensitive' } },
              { ndc: { contains: search } },
            ]
          } : {},
          therapeuticClass ? { therapeuticClass } : {},
          controlled === 'true' ? { controlledSubstance: true } : {},
          { isActive: true }
        ]
      },
      orderBy: { drugName: 'asc' },
      take: 100
    });

    return NextResponse.json({ drugs });
  } catch (error) {
    console.error('Error fetching drugs:', error);
    return NextResponse.json({ error: 'Failed to fetch drugs' }, { status: 500 });
  }
}

// POST /api/pharmacy/drugs - Create a new drug
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const drug = await db.pharmacyDrug.create({
      data: {
        tenantId: body.tenantId || 'default',
        ndc: body.ndc,
        drugName: body.drugName,
        brandName: body.brandName,
        strength: body.strength,
        dosageForm: body.dosageForm,
        route: body.route,
        manufacturer: body.manufacturer,
        therapeuticClass: body.therapeuticClass,
        pharmacologicalClass: body.pharmacologicalClass,
        deaSchedule: body.deaSchedule,
        cost: body.cost,
        retailPrice: body.retailPrice,
        awp: body.awp,
        packageSize: body.packageSize,
        storageRequirements: body.storageRequirements,
        controlledSubstance: body.controlledSubstance || false,
        highRisk: body.highRisk || false,
        lookSound: body.lookSound || false,
      }
    });

    return NextResponse.json({ drug });
  } catch (error) {
    console.error('Error creating drug:', error);
    return NextResponse.json({ error: 'Failed to create drug' }, { status: 500 });
  }
}
