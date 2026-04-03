import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/pharmacy/patients - Get patients
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const patientId = searchParams.get('id');
    
    if (patientId) {
      const patient = await db.pharmacyPatient.findUnique({
        where: { id: patientId },
        include: {
          PharmacyImmunization: {
            orderBy: { administrationDate: 'desc' },
            take: 10
          },
          PharmacyPrescription: {
            orderBy: { createdAt: 'desc' },
            take: 20
          },
          PharmacyTransaction: {
            orderBy: { createdAt: 'desc' },
            take: 20
          }
        }
      });
      
      return NextResponse.json({ patient });
    }
    
    const patients = await db.pharmacyPatient.findMany({
      where: search ? {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { fullName: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
          { patientNumber: { contains: search } },
        ]
      } : {},
      orderBy: { fullName: 'asc' },
      take: 50
    });

    return NextResponse.json({ patients });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 });
  }
}

// POST /api/pharmacy/patients - Create a new patient
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Generate patient number
    const count = await db.pharmacyPatient.count();
    const patientNumber = `PH-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
    
    const patient = await db.pharmacyPatient.create({
      data: {
        tenantId: body.tenantId || 'default',
        patientNumber,
        firstName: body.firstName,
        lastName: body.lastName,
        fullName: `${body.firstName} ${body.lastName}`,
        dateOfBirth: body.dateOfBirth,
        gender: body.gender,
        phone: body.phone,
        phoneAlt: body.phoneAlt,
        email: body.email,
        address: body.address,
        city: body.city,
        allergies: body.allergies ? JSON.stringify(body.allergies) : null,
        allergySeverity: body.allergySeverity,
        medicalConditions: body.medicalConditions ? JSON.stringify(body.medicalConditions) : null,
        currentMedications: body.currentMedications ? JSON.stringify(body.currentMedications) : null,
        primaryInsurance: body.primaryInsurance,
        primaryInsuranceId: body.primaryInsuranceId,
        primaryGroupNumber: body.primaryGroupNumber,
        secondaryInsurance: body.secondaryInsurance,
        secondaryInsuranceId: body.secondaryInsuranceId,
        copayAmount: body.copayAmount,
        preferredLanguage: body.preferredLanguage || 'en',
      }
    });

    return NextResponse.json({ patient });
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json({ error: 'Failed to create patient' }, { status: 500 });
  }
}

// PATCH /api/pharmacy/patients - Update patient
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const processedUpdates: any = { ...updates };
    
    // Handle JSON fields
    if (updates.allergies) {
      processedUpdates.allergies = JSON.stringify(updates.allergies);
    }
    if (updates.medicalConditions) {
      processedUpdates.medicalConditions = JSON.stringify(updates.medicalConditions);
    }
    if (updates.currentMedications) {
      processedUpdates.currentMedications = JSON.stringify(updates.currentMedications);
    }

    const patient = await db.pharmacyPatient.update({
      where: { id },
      data: processedUpdates
    });

    return NextResponse.json({ patient });
  } catch (error) {
    console.error('Error updating patient:', error);
    return NextResponse.json({ error: 'Failed to update patient' }, { status: 500 });
  }
}
