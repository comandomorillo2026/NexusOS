import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch amenities for a property
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const amenityId = searchParams.get('amenityId');

    if (amenityId) {
      // Get single amenity with reservations
      const amenity = await db.condoAmenity.findFirst({
        where: { id: amenityId },
        include: {
          reservations: {
            where: { 
              status: { in: ['pending', 'confirmed'] },
              reservationDate: { gte: new Date().toISOString().split('T')[0] }
            },
            orderBy: { reservationDate: 'asc' },
            take: 20,
          },
          maintenanceLog: {
            where: { status: { in: ['scheduled', 'in_progress'] } },
            orderBy: { scheduledDate: 'asc' },
          }
        }
      });

      return NextResponse.json({ amenity });
    }

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID required' }, { status: 400 });
    }

    const amenities = await db.condoAmenity.findMany({
      where: { propertyId, isActive: true },
      include: {
        _count: {
          select: { 
            reservations: { 
              where: { status: { in: ['pending', 'confirmed'] } } 
            } 
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Get stats
    const stats = {
      total: amenities.length,
      available: amenities.filter(a => !a.isUnderMaintenance).length,
      underMaintenance: amenities.filter(a => a.isUnderMaintenance).length,
      totalReservations: amenities.reduce((sum, a) => sum + a._count.reservations, 0),
    };

    return NextResponse.json({ amenities, stats });
  } catch (error) {
    console.error('Error fetching amenities:', error);
    return NextResponse.json({ error: 'Failed to fetch amenities' }, { status: 500 });
  }
}

// POST - Create new amenity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      propertyId,
      tenantId = 'default',
      name,
      type,
      description,
      location,
      capacity,
      openTime,
      closeTime,
      requiresReservation = true,
      maxReservationHours,
      reservationFee = 0,
      depositRequired = 0,
      rules,
    } = body;

    const amenity = await db.condoAmenity.create({
      data: {
        propertyId,
        tenantId,
        name,
        type,
        description,
        location,
        capacity: capacity ? parseInt(capacity) : null,
        openTime,
        closeTime,
        requiresReservation,
        maxReservationHours: maxReservationHours ? parseInt(maxReservationHours) : null,
        reservationFee: parseFloat(reservationFee) || 0,
        depositRequired: parseFloat(depositRequired) || 0,
        rules,
      }
    });

    return NextResponse.json({ amenity });
  } catch (error) {
    console.error('Error creating amenity:', error);
    return NextResponse.json({ error: 'Failed to create amenity' }, { status: 500 });
  }
}

// PUT - Update amenity
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    const amenity = await db.condoAmenity.update({
      where: { id },
      data: {
        ...data,
        capacity: data.capacity ? parseInt(data.capacity) : null,
        maxReservationHours: data.maxReservationHours ? parseInt(data.maxReservationHours) : null,
        reservationFee: data.reservationFee ? parseFloat(data.reservationFee) : undefined,
        depositRequired: data.depositRequired ? parseFloat(data.depositRequired) : undefined,
      }
    });

    return NextResponse.json({ amenity });
  } catch (error) {
    console.error('Error updating amenity:', error);
    return NextResponse.json({ error: 'Failed to update amenity' }, { status: 500 });
  }
}

// DELETE - Soft delete amenity
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Amenity ID required' }, { status: 400 });
    }

    const amenity = await db.condoAmenity.update({
      where: { id },
      data: { isActive: false }
    });

    return NextResponse.json({ amenity });
  } catch (error) {
    console.error('Error deleting amenity:', error);
    return NextResponse.json({ error: 'Failed to delete amenity' }, { status: 500 });
  }
}
