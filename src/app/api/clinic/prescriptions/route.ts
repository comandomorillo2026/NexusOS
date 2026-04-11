import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/clinic/prescriptions - List prescriptions
// POST /api/clinic/prescriptions - Create prescription
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

    // Using mock data for now - implement actual model when ready
    const prescriptions = [];

    return NextResponse.json({ success: true, prescriptions });
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    return NextResponse.json({ success: false, error: 'Error al obtener recetas' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tenantId,
      patientId,
      patientName,
      medications,
      notes,
      doctorId,
      doctorName,
    } = body;

    // Generate prescription number
    const prescriptionNumber = `RX-${Date.now().toString(36).toUpperCase()}`;

    // Mock response - implement actual model when ready
    const prescription = {
      id: `rx_${Date.now()}`,
      tenantId,
      patientId,
      patientName,
      prescriptionNumber,
      medications: typeof medications === 'string' ? medications : JSON.stringify(medications),
      notes,
      doctorId,
      doctorName,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, prescription });
  } catch (error) {
    console.error('Error creating prescription:', error);
    return NextResponse.json({ success: false, error: 'Error al crear receta' }, { status: 500 });
  }
}
