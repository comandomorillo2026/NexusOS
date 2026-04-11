import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/clinic/lab-orders - List lab orders
// POST /api/clinic/lab-orders - Create lab order
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const patientId = searchParams.get('patientId');
    const status = searchParams.get('status');

    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (patientId) where.patientId = patientId;
    if (status) where.status = status;

    const labOrders = await db.labOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ success: true, labOrders });
  } catch (error) {
    console.error('Error fetching lab orders:', error);
    return NextResponse.json({ success: false, error: 'Error al obtener órdenes de laboratorio' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tenantId,
      patientId,
      patientName,
      providerId,
      providerName,
      tests,
      priority,
      notes,
      clinicalIndication,
    } = body;

    // Generate order ID
    const orderId = `LAB-${Date.now().toString(36).toUpperCase()}`;
    const orderedAt = new Date().toISOString();

    const labOrder = await db.labOrder.create({
      data: {
        tenantId,
        orderId,
        patientId,
        patientName,
        providerId,
        providerName,
        tests: typeof tests === 'string' ? tests : JSON.stringify(tests),
        priority: priority || 'routine',
        notes,
        clinicalIndication,
        status: 'ordered',
        orderedAt,
      },
    });

    return NextResponse.json({ success: true, labOrder });
  } catch (error) {
    console.error('Error creating lab order:', error);
    return NextResponse.json({ success: false, error: 'Error al crear orden de laboratorio' }, { status: 500 });
  }
}
