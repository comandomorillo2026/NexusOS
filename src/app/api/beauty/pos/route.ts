import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/beauty/pos - Get sales
// POST /api/beauty/pos - Create sale (POS transaction)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const branchId = searchParams.get('branchId');
    const date = searchParams.get('date');

    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (branchId) where.branchId = branchId;
    if (date) where.createdAt = { gte: new Date(date), lt: new Date(date + 'T23:59:59') };

    const sales = await db.beautySale.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ success: true, sales });
  } catch (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json({ success: false, error: 'Error al obtener ventas' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, branchId, clientId, clientName, staffId, staffName, items, subtotal, discount, tax, total, paymentMethod } = body;

    // Generate sale number
    const saleNumber = `SLR-${Date.now().toString(36).toUpperCase()}`;

    const sale = await db.beautySale.create({
      data: {
        tenantId,
        branchId,
        saleNumber,
        clientId,
        clientName,
        staffId,
        staffName,
        items: typeof items === 'string' ? items : JSON.stringify(items),
        subtotal: parseFloat(subtotal),
        discount: parseFloat(discount) || 0,
        tax: parseFloat(tax) || 0,
        total: parseFloat(total),
        paymentMethod: paymentMethod || 'cash',
        status: 'completed',
      },
    });

    return NextResponse.json({ success: true, sale });
  } catch (error) {
    console.error('Error creating sale:', error);
    return NextResponse.json({ success: false, error: 'Error al procesar venta' }, { status: 500 });
  }
}
