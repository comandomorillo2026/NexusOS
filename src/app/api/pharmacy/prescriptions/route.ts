import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/pharmacy/prescriptions - Get prescriptions
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const priority = searchParams.get('priority') || '';
    
    const prescriptions = await db.pharmacyPrescription.findMany({
      where: {
        AND: [
          search ? {
            OR: [
              { prescriptionNumber: { contains: search } },
              { patientName: { contains: search, mode: 'insensitive' } },
              { prescriberName: { contains: search, mode: 'insensitive' } },
            ]
          } : {},
          status ? { status } : {},
          priority ? { priority } : {},
        ]
      },
      include: {
        PharmacyPrescriptionItem: true,
        PharmacyDURAlert: true,
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 100
    });

    return NextResponse.json({ prescriptions });
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    return NextResponse.json({ error: 'Failed to fetch prescriptions' }, { status: 500 });
  }
}

// POST /api/pharmacy/prescriptions - Create a new prescription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Generate prescription number
    const count = await db.pharmacyPrescription.count();
    const prescriptionNumber = `RX-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;
    
    const prescription = await db.pharmacyPrescription.create({
      data: {
        tenantId: body.tenantId || 'default',
        prescriptionNumber,
        patientId: body.patientId,
        patientName: body.patientName,
        patientDob: body.patientDob,
        prescriberId: body.prescriberId,
        prescriberName: body.prescriberName,
        prescriberNpi: body.prescriberNpi,
        prescriberDea: body.prescriberDea,
        writtenDate: body.writtenDate,
        daysSupply: body.daysSupply,
        quantityPrescribed: body.quantityPrescribed,
        refillsAuthorized: body.refillsAuthorized || 0,
        refillsRemaining: body.refillsAuthorized || 0,
        dAW: body.dAW || false,
        substitutionAllowed: body.substitutionAllowed !== false,
        status: 'new',
        source: body.source || 'paper',
        priority: body.priority || 'routine',
        notes: body.notes,
      }
    });

    // Create prescription items
    if (body.items && body.items.length > 0) {
      await db.pharmacyPrescriptionItem.createMany({
        data: body.items.map((item: any) => ({
          tenantId: body.tenantId || 'default',
          prescriptionId: prescription.id,
          drugId: item.drugId,
          ndc: item.ndc,
          drugName: item.drugName,
          strength: item.strength,
          dosageForm: item.dosageForm,
          quantity: item.quantity,
          quantityUnit: item.quantityUnit,
          sig: item.sig,
          sigCode: item.sigCode,
          sigExpanded: item.sigExpanded,
          daysSupply: item.daysSupply,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        }))
      });
    }

    return NextResponse.json({ prescription });
  } catch (error) {
    console.error('Error creating prescription:', error);
    return NextResponse.json({ error: 'Failed to create prescription' }, { status: 500 });
  }
}

// PATCH /api/pharmacy/prescriptions - Update prescription status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, filledBy, verifiedBy, notes } = body;

    const updateData: any = { status };
    if (status === 'filled') {
      updateData.fillDate = new Date().toISOString().split('T')[0];
      updateData.filledBy = filledBy;
    }
    if (status === 'verified') {
      updateData.verifiedBy = verifiedBy;
      updateData.verifiedAt = new Date().toISOString();
    }
    if (notes) {
      updateData.notes = notes;
    }

    const prescription = await db.pharmacyPrescription.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ prescription });
  } catch (error) {
    console.error('Error updating prescription:', error);
    return NextResponse.json({ error: 'Failed to update prescription' }, { status: 500 });
  }
}
