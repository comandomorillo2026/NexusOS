import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/clinic/invoices - List invoices
// POST /api/clinic/invoices - Create invoice
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const status = searchParams.get('status');
    const patientId = searchParams.get('patientId');

    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (status) where.status = status;
    if (patientId) where.patientId = patientId;

    const invoices = await db.invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ success: true, invoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ success: false, error: 'Error al obtener facturas' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tenantId,
      patientId,
      patientName,
      patientEmail,
      patientPhone,
      patientAddress,
      items,
      subtotal,
      tax,
      discount,
      total,
      notes,
      appointmentId,
    } = body;

    // Generate invoice number
    const invoiceCount = await db.invoice.count({ where: { tenantId } });
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(5, '0')}`;
    const issueDate = new Date().toISOString().split('T')[0];

    const invoice = await db.invoice.create({
      data: {
        tenantId,
        patientId,
        invoiceNumber,
        patientName,
        patientEmail,
        patientPhone,
        patientAddress,
        items: typeof items === 'string' ? items : JSON.stringify(items),
        subtotal: parseFloat(subtotal) || 0,
        tax: parseFloat(tax) || 0,
        discount: parseFloat(discount) || 0,
        total: parseFloat(total) || 0,
        status: 'draft',
        issueDate,
        notes,
        appointmentId,
      },
    });

    return NextResponse.json({ success: true, invoice });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ success: false, error: 'Error al crear factura' }, { status: 500 });
  }
}
