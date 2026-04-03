import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/pharmacy/transactions - Get transactions
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const patientId = searchParams.get('patientId') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    
    const transactions = await db.pharmacyTransaction.findMany({
      where: {
        AND: [
          search ? {
            OR: [
              { transactionNumber: { contains: search } },
              { patientName: { contains: search, mode: 'insensitive' } },
            ]
          } : {},
          patientId ? { patientId } : {},
          startDate ? { createdAt: { gte: new Date(startDate) } } : {},
          endDate ? { createdAt: { lte: new Date(endDate) } } : {},
        ]
      },
      include: {
        PharmacyPrescription: {
          select: {
            prescriptionNumber: true,
            status: true,
          }
        },
        PharmacyPatient: {
          select: {
            patientNumber: true,
            fullName: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    // Calculate totals
    const totals = {
      totalSales: transactions.reduce((sum, t) => sum + t.total, 0),
      totalInsurancePaid: transactions.reduce((sum, t) => sum + t.insurancePaid, 0),
      totalPatientPaid: transactions.reduce((sum, t) => sum + t.patientPaid, 0),
      transactionCount: transactions.length,
    };

    return NextResponse.json({ transactions, totals });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

// POST /api/pharmacy/transactions - Create a new transaction (sale)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Generate transaction number
    const count = await db.pharmacyTransaction.count();
    const transactionNumber = `TXN-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(count + 1).padStart(5, '0')}`;
    
    const transaction = await db.pharmacyTransaction.create({
      data: {
        tenantId: body.tenantId || 'default',
        transactionNumber,
        transactionType: body.transactionType || 'sale',
        prescriptionId: body.prescriptionId,
        patientId: body.patientId,
        patientName: body.patientName,
        items: body.items ? JSON.stringify(body.items) : null,
        subtotal: body.subtotal || 0,
        tax: body.tax || 0,
        discount: body.discount || 0,
        discountReason: body.discountReason,
        total: body.total || 0,
        insuranceBilled: body.insuranceBilled || false,
        insuranceName: body.insuranceName,
        insurancePaid: body.insurancePaid || 0,
        copay: body.copay || 0,
        patientPaid: body.patientPaid || 0,
        paymentMethod: body.paymentMethod,
        paymentReference: body.paymentReference,
        secondaryPayment: body.secondaryPayment,
        secondaryPaymentRef: body.secondaryPaymentRef,
        secondaryPaymentAmount: body.secondaryPaymentAmount,
        changeGiven: body.changeGiven,
        pharmacistInitials: body.pharmacistInitials,
        technicianInitials: body.technicianInitials,
        status: 'completed',
      }
    });

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}

// POST /api/pharmacy/transactions/void - Void a transaction
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, reason, voidedBy } = body;

    const original = await db.pharmacyTransaction.findUnique({
      where: { id }
    });

    if (!original) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Create void transaction
    const voidTransaction = await db.pharmacyTransaction.create({
      data: {
        tenantId: original.tenantId,
        transactionNumber: `VOID-${original.transactionNumber}`,
        transactionType: 'void',
        prescriptionId: original.prescriptionId,
        patientId: original.patientId,
        patientName: original.patientName,
        items: original.items,
        subtotal: -original.subtotal,
        tax: -original.tax,
        discount: 0,
        total: -original.total,
        patientPaid: 0,
        status: 'completed',
        notes: `Voided by ${voidedBy}. Reason: ${reason}`,
      }
    });

    // Mark original as voided
    await db.pharmacyTransaction.update({
      where: { id },
      data: {
        status: 'voided',
        notes: `Voided. See ${voidTransaction.transactionNumber}`
      }
    });

    return NextResponse.json({ transaction: voidTransaction });
  } catch (error) {
    console.error('Error voiding transaction:', error);
    return NextResponse.json({ error: 'Failed to void transaction' }, { status: 500 });
  }
}
