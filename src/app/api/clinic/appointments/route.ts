import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/clinic/appointments - List appointments
// POST /api/clinic/appointments - Create appointment
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const date = searchParams.get('date');
    const status = searchParams.get('status');
    const patientId = searchParams.get('patientId');

    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (date) where.date = date;
    if (status) where.status = status;
    if (patientId) where.patientId = patientId;

    const appointments = await db.appointment.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            fullName: true,
            phone: true,
            email: true,
          },
        },
      },
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
    const {
      tenantId,
      patientId,
      patientName,
      title,
      description,
      date,
      startTime,
      endTime,
      duration,
      type,
      providerId,
      providerName,
      price,
      notes,
    } = body;

    // Generate appointment number
    const appointmentCount = await db.appointment.count({ where: { tenantId } });
    const appointmentNumber = `APT-${String(appointmentCount + 1).padStart(5, '0')}`;

    const appointment = await db.appointment.create({
      data: {
        tenantId,
        patientId,
        patientName,
        appointmentNumber,
        title: title || 'Consulta',
        description,
        date,
        startTime,
        endTime,
        duration: duration || 30,
        type: type || 'consultation',
        providerId,
        providerName,
        price: price ? parseFloat(price) : null,
        notes,
        status: 'scheduled',
      },
    });

    return NextResponse.json({ success: true, appointment });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ success: false, error: 'Error al crear cita' }, { status: 500 });
  }
}
