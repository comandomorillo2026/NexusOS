import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/beauty/clients - List clients
// POST /api/beauty/clients - Create client
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const search = searchParams.get('search');

    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const clients = await db.beautyClient.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ success: true, clients });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({ success: false, error: 'Error al obtener clientes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, firstName, lastName, phone, email, gender, dateOfBirth, notes } = body;

    // Generate client number
    const clientNumber = `CLI-${Date.now().toString(36).toUpperCase()}`;

    const client = await db.beautyClient.create({
      data: {
        tenantId,
        clientNumber,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        phone,
        email,
        gender,
        dateOfBirth,
        notes,
      },
    });

    return NextResponse.json({ success: true, client });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json({ success: false, error: 'Error al crear cliente' }, { status: 500 });
  }
}
