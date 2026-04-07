import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch residents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const unitId = searchParams.get('unitId');
    const residentId = searchParams.get('residentId');

    if (residentId) {
      const resident = await db.condoResident.findUnique({
        where: { id: residentId },
        include: {
          unit: {
            include: { property: { select: { name: true } } }
          }
        }
      });
      return NextResponse.json({ resident });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (propertyId) where.propertyId = propertyId;
    if (unitId) where.unitId = unitId;
    where.isActive = true;

    const residents = await db.condoResident.findMany({
      where,
      include: {
        unit: {
          select: { unitNumber: true, building: true, floor: true }
        }
      },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }]
    });

    return NextResponse.json({ residents });
  } catch (error) {
    console.error('Error fetching residents:', error);
    return NextResponse.json({ error: 'Failed to fetch residents' }, { status: 500 });
  }
}

// POST - Create resident
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      unitId,
      propertyId,
      tenantId = 'default',
      firstName,
      lastName,
      email,
      phone,
      phoneAlternate,
      relation = 'resident',
      isPrimary = false,
      receiveEmails = true,
      receiveSMS = true,
    } = body;

    // If setting as primary, remove primary from other residents
    if (isPrimary) {
      await db.condoResident.updateMany({
        where: { unitId, isPrimary: true },
        data: { isPrimary: false }
      });
    }

    const resident = await db.condoResident.create({
      data: {
        unitId,
        propertyId,
        tenantId,
        firstName,
        lastName,
        email,
        phone,
        phoneAlternate,
        relation,
        isPrimary,
        receiveEmails,
        receiveSMS,
        moveInDate: new Date().toISOString().split('T')[0],
      }
    });

    // Update unit status to occupied if it was vacant
    await db.condoUnit.updateMany({
      where: { id: unitId, status: 'vacant' },
      data: { status: 'occupied' }
    });

    return NextResponse.json({ resident });
  } catch (error) {
    console.error('Error creating resident:', error);
    return NextResponse.json({ error: 'Failed to create resident' }, { status: 500 });
  }
}

// PUT - Update resident
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    // If setting as primary, remove primary from other residents in same unit
    if (data.isPrimary) {
      const resident = await db.condoResident.findUnique({ where: { id } });
      if (resident) {
        await db.condoResident.updateMany({
          where: { unitId: resident.unitId, isPrimary: true },
          data: { isPrimary: false }
        });
      }
    }

    const resident = await db.condoResident.update({
      where: { id },
      data
    });

    return NextResponse.json({ resident });
  } catch (error) {
    console.error('Error updating resident:', error);
    return NextResponse.json({ error: 'Failed to update resident' }, { status: 500 });
  }
}

// DELETE - Soft delete resident
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Resident ID required' }, { status: 400 });
    }

    const resident = await db.condoResident.update({
      where: { id },
      data: { 
        isActive: false,
        moveOutDate: new Date().toISOString().split('T')[0]
      }
    });

    // Check if unit has other active residents
    const activeResidents = await db.condoResident.count({
      where: { unitId: resident.unitId, isActive: true }
    });

    // If no more residents, set unit to vacant
    if (activeResidents === 0) {
      await db.condoUnit.update({
        where: { id: resident.unitId },
        data: { status: 'vacant' }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting resident:', error);
    return NextResponse.json({ error: 'Failed to delete resident' }, { status: 500 });
  }
}
