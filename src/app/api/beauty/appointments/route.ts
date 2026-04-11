import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/beauty/appointments - List appointments
// POST /api/beauty/appointments - Create appointment
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const date = searchParams.get('date');
    const status = searchParams.get('status');

    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (date) where.date = date;
    if (status) where.status = status;

    const appointments = await db.beautyAppointment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ success: true, appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ success: false, error: 'Error al obtener citas' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, clientName, clientPhone, clientEmail, date, startTime, endTime, services, staffId, staffName } = body;

    // Generate appointment number
    const appointmentNumber = `APT-${Date.now().toString(36).toUpperCase()}`;

    const appointment = await db.beautyAppointment.create({
      data: {
        tenantId,
        appointmentNumber,
        clientName,
        clientPhone,
        clientEmail,
        date,
        startTime,
        endTime,
        services: typeof services === 'string' ? services : JSON.stringify(services),
        staffId,
        staffName,
        status: 'scheduled',
      },
    });

    return NextResponse.json({ success: true, appointment });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ success: false, error: 'Error al crear cita' }, { status: 500 });
  }
}
