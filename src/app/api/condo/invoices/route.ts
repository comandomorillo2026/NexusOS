import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Helper to generate invoice number
async function generateInvoiceNumber(propertyId: string) {
  const year = new Date().getFullYear();
  const count = await db.condoInvoice.count({
    where: {
      propertyId,
      invoiceNumber: { startsWith: `INV-${year}-` }
    }
  });
  return `INV-${year}-${String(count + 1).padStart(4, '0')}`;
}

// GET - Fetch invoices
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const unitId = searchParams.get('unitId');
    const status = searchParams.get('status');
    const invoiceId = searchParams.get('invoiceId');

    if (invoiceId) {
      const invoice = await db.condoInvoice.findUnique({
        where: { id: invoiceId },
        include: {
          unit: {
            include: {
              residents: { where: { isPrimary: true } },
              owners: { where: { isActive: true } },
              property: { select: { name: true, currency: true } }
            }
          },
          payments: true
        }
      });
      return NextResponse.json({ invoice });
    }

    if (!propertyId && !unitId) {
      return NextResponse.json({ error: 'Property ID or Unit ID required' }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (propertyId) where.propertyId = propertyId;
    if (unitId) where.unitId = unitId;
    if (status) where.status = status;

    const invoices = await db.condoInvoice.findMany({
      where,
      include: {
        unit: {
          select: { unitNumber: true, building: true }
        }
      },
      orderBy: { invoiceDate: 'desc' },
      take: 100
    });

    // Calculate totals
    const stats = {
      total: invoices.length,
      pending: invoices.filter(i => i.status === 'pending').length,
      paid: invoices.filter(i => i.status === 'paid').length,
      overdue: invoices.filter(i => i.status === 'overdue').length,
      totalAmount: invoices.reduce((sum, i) => sum + i.total, 0),
      totalPaid: invoices.reduce((sum, i) => sum + i.amountPaid, 0),
      totalDue: invoices.reduce((sum, i) => sum + i.balanceDue, 0),
    };

    return NextResponse.json({ invoices, stats });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

// POST - Create invoice
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      propertyId,
      unitId,
      tenantId = 'default',
      type = 'monthly',
      lineItems,
      dueDate,
      periodStart,
      periodEnd,
      notes,
    } = body;

    // Get unit for monthly fee
    const unit = await db.condoUnit.findUnique({ where: { id: unitId } });
    if (!unit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
    }

    // Calculate amounts
    let subtotal = 0;
    const items = lineItems || [
      { description: 'Cuota de mantenimiento mensual', amount: unit.monthlyFee }
    ];
    
    if (typeof items === 'string') {
      const parsed = JSON.parse(items);
      subtotal = parsed.reduce((sum: number, item: { amount: number }) => sum + item.amount, 0);
    } else {
      subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    }

    const invoiceNumber = await generateInvoiceNumber(propertyId);
    const invoiceDate = new Date().toISOString().split('T')[0];
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 15);

    const invoice = await db.condoInvoice.create({
      data: {
        propertyId,
        unitId,
        tenantId,
        invoiceNumber,
        invoiceDate,
        dueDate: dueDate || defaultDueDate.toISOString().split('T')[0],
        type,
        subtotal,
        total: subtotal,
        balanceDue: subtotal,
        lineItems: typeof items === 'string' ? items : JSON.stringify(items),
        periodStart,
        periodEnd,
        notes,
      }
    });

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}

// PUT - Update invoice (mainly for payments)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, amountPaid, ...data } = body;

    const invoice = await db.condoInvoice.update({
      where: { id },
      data: {
        ...data,
        amountPaid: amountPaid !== undefined ? parseFloat(amountPaid) : undefined,
        status,
        paidAt: status === 'paid' ? new Date().toISOString() : undefined,
      }
    });

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}

// Generate bulk invoices for all units
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { propertyId, periodStart, periodEnd, dueDate } = body;

    // Get all active units
    const units = await db.condoUnit.findMany({
      where: { propertyId, status: { in: ['occupied', 'for_sale', 'for_rent'] } }
    });

    const results = [];
    for (const unit of units) {
      if (unit.monthlyFee > 0) {
        const invoiceNumber = await generateInvoiceNumber(propertyId);
        const invoiceDate = new Date().toISOString().split('T')[0];
        
        const invoice = await db.condoInvoice.create({
          data: {
            propertyId,
            unitId: unit.id,
            tenantId: unit.tenantId,
            invoiceNumber,
            invoiceDate,
            dueDate: dueDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            type: 'monthly',
            subtotal: unit.monthlyFee,
            total: unit.monthlyFee,
            balanceDue: unit.monthlyFee,
            lineItems: JSON.stringify([
              { description: 'Cuota de mantenimiento', amount: unit.monthlyFee }
            ]),
            periodStart,
            periodEnd,
          }
        });
        results.push(invoice);
      }
    }

    return NextResponse.json({ 
      message: `Generated ${results.length} invoices`,
      count: results.length 
    });
  } catch (error) {
    console.error('Error generating bulk invoices:', error);
    return NextResponse.json({ error: 'Failed to generate invoices' }, { status: 500 });
  }
}
