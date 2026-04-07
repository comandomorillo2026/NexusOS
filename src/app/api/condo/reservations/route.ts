import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch reservations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const amenityId = searchParams.get('amenityId');
    const residentId = searchParams.get('residentId');
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    
    if (propertyId) where.propertyId = propertyId;
    if (amenityId) where.amenityId = amenityId;
    if (residentId) where.residentId = residentId;
    if (date) where.reservationDate = date;
    if (startDate && endDate) {
      where.reservationDate = { gte: startDate, lte: endDate };
    }

    const reservations = await db.condoReservation.findMany({
      where,
      include: {
        amenity: {
          select: { name: true, type: true, location: true }
        },
        resident: {
          select: { 
            firstName: true, 
            lastName: true, 
            phone: true,
            unit: { select: { unitNumber: true } }
          }
        }
      },
      orderBy: [
        { reservationDate: 'asc' },
        { startTime: 'asc' }
      ]
    });

    // Stats
    const stats = {
      total: reservations.length,
      pending: reservations.filter(r => r.status === 'pending').length,
      confirmed: reservations.filter(r => r.status === 'confirmed').length,
      cancelled: reservations.filter(r => r.status === 'cancelled').length,
      completed: reservations.filter(r => r.status === 'completed').length,
    };

    return NextResponse.json({ reservations, stats });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 });
  }
}

// POST - Create new reservation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      propertyId,
      amenityId,
      residentId,
      tenantId = 'default',
      reservationDate,
      startTime,
      endTime,
      numberOfGuests = 0,
      purpose,
      specialRequests,
    } = body;

    // Get amenity details for fee calculation
    const amenity = await db.condoAmenity.findUnique({
      where: { id: amenityId }
    });

    if (!amenity) {
      return NextResponse.json({ error: 'Amenity not found' }, { status: 404 });
    }

    // Check for conflicts
    const conflicts = await db.condoReservation.findMany({
      where: {
        amenityId,
        reservationDate,
        status: { in: ['pending', 'confirmed'] },
        OR: [
          { startTime: { lte: startTime }, endTime: { gt: startTime } },
          { startTime: { lt: endTime }, endTime: { gte: endTime } },
          { startTime: { gte: startTime }, endTime: { lte: endTime } },
        ]
      }
    });

    if (conflicts.length > 0) {
      return NextResponse.json({ 
        error: 'Horario no disponible. Ya existe una reservación en ese horario.' 
      }, { status: 400 });
    }

    // Generate reservation number
    const count = await db.condoReservation.count({
      where: { propertyId }
    });
    const reservationNumber = `RES-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const reservation = await db.condoReservation.create({
      data: {
        propertyId,
        amenityId,
        residentId,
        tenantId,
        reservationDate,
        startTime,
        endTime,
        numberOfGuests: parseInt(numberOfGuests) || 0,
        purpose,
        specialRequests,
        feeAmount: amenity.reservationFee,
        depositAmount: amenity.depositRequired,
        status: 'confirmed',
      }
    });

    return NextResponse.json({ reservation, reservationNumber });
  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 });
  }
}

// PUT - Update reservation
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    const reservation = await db.condoReservation.update({
      where: { id },
      data
    });

    return NextResponse.json({ reservation });
  } catch (error) {
    console.error('Error updating reservation:', error);
    return NextResponse.json({ error: 'Failed to update reservation' }, { status: 500 });
  }
}

// DELETE - Cancel reservation
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const cancelledBy = searchParams.get('cancelledBy');
    const reason = searchParams.get('reason');

    if (!id) {
      return NextResponse.json({ error: 'Reservation ID required' }, { status: 400 });
    }

    const reservation = await db.condoReservation.update({
      where: { id },
      data: {
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
        cancelledBy,
        cancelReason: reason,
      }
    });

    return NextResponse.json({ reservation });
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    return NextResponse.json({ error: 'Failed to cancel reservation' }, { status: 500 });
  }
}
