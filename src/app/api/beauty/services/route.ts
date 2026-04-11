import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/beauty/services - List services
// POST /api/beauty/services - Create service
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const category = searchParams.get('category');

    const where: any = { isActive: true };
    if (tenantId) where.tenantId = tenantId;
    if (category) where.category = category;

    const services = await db.beautyService.findMany({
      where,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json({ success: true, services });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ success: false, error: 'Error al obtener servicios' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, name, description, category, price, durationMinutes, commissionValue } = body;

    const service = await db.beautyService.create({
      data: {
        tenantId,
        name,
        description,
        category,
        price: parseFloat(price),
        durationMinutes: parseInt(durationMinutes) || 30,
        commissionValue: commissionValue ? parseFloat(commissionValue) : null,
      },
    });

    return NextResponse.json({ success: true, service });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({ success: false, error: 'Error al crear servicio' }, { status: 500 });
  }
}
