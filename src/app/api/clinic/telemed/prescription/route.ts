import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';

// Generate a unique prescription code
function generatePrescriptionCode(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RX-${year}${month}-${random}`;
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  quantity?: number;
  refills?: number;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      roomId,
      sessionId,
      patientId,
      patientName,
      doctorId,
      doctorName,
      tenantId,
      medications,
      diagnosis,
      notes,
      instructions,
      validUntil,
    } = body;

    if (!patientId || !patientName || !doctorId || !doctorName || !tenantId || !medications) {
      return NextResponse.json({ 
        error: 'Missing required fields: patientId, patientName, doctorId, doctorName, tenantId, medications' 
      }, { status: 400 });
    }

    // Generate unique prescription code
    let prescriptionCode = generatePrescriptionCode();
    let attempts = 0;
    
    while (attempts < 10) {
      const existing = await prisma.telemedPrescription.findUnique({
        where: { prescriptionCode }
      });
      if (!existing) break;
      prescriptionCode = generatePrescriptionCode();
      attempts++;
    }

    // Create the prescription
    const prescription = await prisma.telemedPrescription.create({
      data: {
        tenantId,
        sessionId: sessionId || null,
        patientId,
        patientName,
        doctorId,
        doctorName,
        prescriptionCode,
        medications: JSON.stringify(medications),
        diagnosis: diagnosis || null,
        notes: notes || null,
        instructions: instructions || null,
        validUntil: validUntil || null,
        status: 'active',
      }
    });

    // Link prescription to session if roomId provided
    if (roomId) {
      await prisma.telemedSession.updateMany({
        where: { 
          OR: [
            { roomId: roomId },
            { room: { roomCode: roomId } }
          ]
        },
        data: { prescriptionId: prescription.id }
      });
    }

    return NextResponse.json({
      success: true,
      prescription: {
        id: prescription.id,
        prescriptionCode: prescription.prescriptionCode,
        patientName: prescription.patientName,
        doctorName: prescription.doctorName,
        medications: JSON.parse(prescription.medications),
        diagnosis: prescription.diagnosis,
        instructions: prescription.instructions,
        validUntil: prescription.validUntil,
        createdAt: prescription.createdAt,
      }
    });
  } catch (error) {
    console.error('Error creating prescription:', error);
    return NextResponse.json({ 
      error: 'Failed to create prescription',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const prescriptionId = searchParams.get('id');
    const prescriptionCode = searchParams.get('code');
    const patientId = searchParams.get('patientId');

    if (prescriptionId) {
      // Get specific prescription by ID
      const prescription = await prisma.telemedPrescription.findUnique({
        where: { id: prescriptionId }
      });

      if (!prescription) {
        return NextResponse.json({ error: 'Prescription not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        prescription: {
          ...prescription,
          medications: JSON.parse(prescription.medications)
        }
      });
    }

    if (prescriptionCode) {
      // Get specific prescription by code
      const prescription = await prisma.telemedPrescription.findUnique({
        where: { prescriptionCode }
      });

      if (!prescription) {
        return NextResponse.json({ error: 'Prescription not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        prescription: {
          ...prescription,
          medications: JSON.parse(prescription.medications)
        }
      });
    }

    if (patientId) {
      // Get all prescriptions for a patient
      const prescriptions = await prisma.telemedPrescription.findMany({
        where: { patientId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      return NextResponse.json({
        success: true,
        prescriptions: prescriptions.map(p => ({
          ...p,
          medications: JSON.parse(p.medications)
        }))
      });
    }

    return NextResponse.json({ 
      error: 'Missing required parameter: id, code, or patientId' 
    }, { status: 400 });
  } catch (error) {
    console.error('Error fetching prescription:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch prescription',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { prescriptionId, status, printedAt, sentToPatientAt, sentToPharmacyAt, pharmacyName } = body;

    if (!prescriptionId) {
      return NextResponse.json({ error: 'Missing required field: prescriptionId' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (printedAt) updateData.printedAt = printedAt;
    if (sentToPatientAt) updateData.sentToPatientAt = sentToPatientAt;
    if (sentToPharmacyAt) updateData.sentToPharmacyAt = sentToPharmacyAt;
    if (pharmacyName) updateData.pharmacyName = pharmacyName;

    const prescription = await prisma.telemedPrescription.update({
      where: { id: prescriptionId },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      prescription: {
        id: prescription.id,
        status: prescription.status,
        printedAt: prescription.printedAt,
        sentToPatientAt: prescription.sentToPatientAt,
        sentToPharmacyAt: prescription.sentToPharmacyAt,
      }
    });
  } catch (error) {
    console.error('Error updating prescription:', error);
    return NextResponse.json({ 
      error: 'Failed to update prescription',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
