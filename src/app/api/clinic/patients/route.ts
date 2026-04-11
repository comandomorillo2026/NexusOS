import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/clinic/patients - List patients
// POST /api/clinic/patients - Create patient
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const search = searchParams.get('search');

    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const patients = await db.patient.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ success: true, patients });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json({ success: false, error: 'Error al obtener pacientes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tenantId,
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      city,
      emergencyContact,
      emergencyPhone,
      bloodType,
      allergies,
      notes,
    } = body;

    // Generate patient number
    const patientCount = await db.patient.count({ where: { tenantId } });
    const patientNumber = `PAT-${String(patientCount + 1).padStart(5, '0')}`;

    const patient = await db.patient.create({
      data: {
        tenantId,
        patientNumber,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        email,
        phone,
        dateOfBirth,
        gender,
        address,
        city,
        emergencyContact,
        emergencyPhone,
        bloodType,
        allergies,
        notes,
      },
    });

    return NextResponse.json({ success: true, patient });
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json({ success: false, error: 'Error al crear paciente' }, { status: 500 });
  }
}
