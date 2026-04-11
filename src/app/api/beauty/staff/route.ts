import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/beauty/staff - List staff
// POST /api/beauty/staff - Create staff
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const branchId = searchParams.get('branchId');

    const where: any = { isActive: true };
    if (tenantId) where.tenantId = tenantId;
    if (branchId) where.branchId = branchId;

    const staff = await db.beautyStaff.findMany({
      where,
      orderBy: { fullName: 'asc' },
    });

    return NextResponse.json({ success: true, staff });
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json({ success: false, error: 'Error al obtener personal' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, branchId, firstName, lastName, email, phone, role, specializations, commissionValue } = body;

    const staff = await db.beautyStaff.create({
      data: {
        tenantId,
        branchId,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        email,
        phone,
        role: role || 'STYLIST',
        specializations,
        commissionValue: commissionValue ? parseFloat(commissionValue) : 0,
      },
    });

    return NextResponse.json({ success: true, staff });
  } catch (error) {
    console.error('Error creating staff:', error);
    return NextResponse.json({ success: false, error: 'Error al crear personal' }, { status: 500 });
  }
}
