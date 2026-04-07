import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch units for a property
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const unitId = searchParams.get('unitId');
    const status = searchParams.get('status');

    if (unitId) {
      // Get single unit with details
      const unit = await db.condoUnit.findFirst({
        where: { id: unitId },
        include: {
          residents: { where: { isActive: true } },
          owners: { where: { isActive: true } },
          tenants: { where: { isActive: true } },
          vehicles: true,
          pets: true,
          invoices: {
            orderBy: { createdAt: 'desc' },
            take: 12
          },
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 12
          },
          property: {
            select: { name: true, currency: true }
          }
        }
      });

      // Calculate balance
      const pendingInvoices = await db.condoInvoice.findMany({
        where: { unitId, status: { in: ['pending', 'overdue', 'partial'] } }
      });
      const totalDue = pendingInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0);

      return NextResponse.json({ unit, totalDue });
    }

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID required' }, { status: 400 });
    }

    // Build filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { propertyId };
    if (status) {
      where.status = status;
    }

    const units = await db.condoUnit.findMany({
      where,
      include: {
        residents: { 
          where: { isActive: true },
          take: 1 
        },
        owners: { 
          where: { isActive: true },
          take: 1 
        },
        _count: {
          select: { 
            residents: { where: { isActive: true } },
            invoices: { where: { status: { in: ['pending', 'overdue'] } } }
          }
        }
      },
      orderBy: [
        { building: 'asc' },
        { floor: 'asc' },
        { unitNumber: 'asc' }
      ]
    });

    // Calculate stats
    const stats = {
      total: units.length,
      occupied: units.filter(u => u.status === 'occupied').length,
      vacant: units.filter(u => u.status === 'vacant').length,
      forSale: units.filter(u => u.status === 'for_sale').length,
      forRent: units.filter(u => u.status === 'for_rent').length,
    };

    return NextResponse.json({ units, stats });
  } catch (error) {
    console.error('Error fetching units:', error);
    return NextResponse.json({ error: 'Failed to fetch units' }, { status: 500 });
  }
}

// POST - Create new unit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      propertyId,
      tenantId = 'default',
      unitNumber,
      floor,
      building,
      wing,
      type = 'apartment',
      bedrooms,
      bathrooms,
      area,
      monthlyFee,
      parkingFee,
      status = 'vacant',
    } = body;

    // Check if unit number already exists
    const existing = await db.condoUnit.findFirst({
      where: { propertyId, unitNumber }
    });

    if (existing) {
      return NextResponse.json({ error: 'Unit number already exists' }, { status: 400 });
    }

    const unit = await db.condoUnit.create({
      data: {
        propertyId,
        tenantId,
        unitNumber,
        floor: floor ? parseInt(floor) : null,
        building,
        wing,
        type,
        bedrooms: parseInt(bedrooms) || 0,
        bathrooms: parseFloat(bathrooms) || 0,
        area: parseFloat(area) || null,
        monthlyFee: parseFloat(monthlyFee) || 0,
        parkingFee: parseFloat(parkingFee) || 0,
        status,
      }
    });

    // Update property total units count
    await db.condoProperty.update({
      where: { id: propertyId },
      data: { totalUnits: { increment: 1 } }
    });

    return NextResponse.json({ unit });
  } catch (error) {
    console.error('Error creating unit:', error);
    return NextResponse.json({ error: 'Failed to create unit' }, { status: 500 });
  }
}

// PUT - Update unit
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    const unit = await db.condoUnit.update({
      where: { id },
      data: {
        ...data,
        floor: data.floor !== undefined ? parseInt(data.floor) || null : undefined,
        bedrooms: data.bedrooms !== undefined ? parseInt(data.bedrooms) || 0 : undefined,
        bathrooms: data.bathrooms !== undefined ? parseFloat(data.bathrooms) || 0 : undefined,
        area: data.area !== undefined ? parseFloat(data.area) || null : undefined,
        monthlyFee: data.monthlyFee !== undefined ? parseFloat(data.monthlyFee) || 0 : undefined,
      }
    });

    return NextResponse.json({ unit });
  } catch (error) {
    console.error('Error updating unit:', error);
    return NextResponse.json({ error: 'Failed to update unit' }, { status: 500 });
  }
}

// DELETE - Delete unit
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Unit ID required' }, { status: 400 });
    }

    // Get unit to find property
    const unit = await db.condoUnit.findUnique({ where: { id } });
    
    // Delete unit
    await db.condoUnit.delete({ where: { id } });

    // Update property count
    if (unit) {
      await db.condoProperty.update({
        where: { id: unit.propertyId },
        data: { totalUnits: { decrement: 1 } }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting unit:', error);
    return NextResponse.json({ error: 'Failed to delete unit' }, { status: 500 });
  }
}
