import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch all properties for tenant
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || 'default';
    const propertyId = searchParams.get('propertyId');

    if (propertyId) {
      // Get single property with stats
      const property = await db.condoProperty.findFirst({
        where: { id: propertyId, tenantId },
        include: {
          units: {
            include: {
              residents: { where: { isActive: true } },
              owners: { where: { isActive: true } },
            }
          },
          amenities: { where: { isActive: true } },
          _count: {
            select: {
              units: true,
              announcements: { where: { status: 'published' } },
              maintenanceRequests: { where: { status: { in: ['open', 'assigned', 'in_progress'] } } },
            }
          }
        }
      });

      // Calculate stats
      const totalUnits = property?.units.length || 0;
      const occupiedUnits = property?.units.filter(u => u.status === 'occupied').length || 0;
      const vacantUnits = property?.units.filter(u => u.status === 'vacant').length || 0;
      
      // Financial stats
      const invoices = await db.condoInvoice.findMany({
        where: { propertyId, status: { in: ['pending', 'overdue'] } }
      });
      const totalReceivable = invoices.reduce((sum, inv) => sum + inv.balanceDue, 0);
      
      const payments = await db.condoPayment.findMany({
        where: { propertyId },
        orderBy: { paymentDate: 'desc' },
        take: 5
      });

      const recentMaintenance = await db.condoMaintenanceRequest.findMany({
        where: { propertyId },
        orderBy: { createdAt: 'desc' },
        take: 5
      });

      return NextResponse.json({
        property,
        stats: {
          totalUnits,
          occupiedUnits,
          vacantUnits,
          occupancyRate: totalUnits > 0 ? ((occupiedUnits / totalUnits) * 100).toFixed(1) : 0,
          totalReceivable,
          activeMaintenance: property?._count.maintenanceRequests || 0,
          activeAnnouncements: property?._count.announcements || 0,
          totalAmenities: property?.amenities.length || 0,
        },
        recentPayments: payments,
        recentMaintenance
      });
    }

    // Get all properties for tenant
    const properties = await db.condoProperty.findMany({
      where: { tenantId, isActive: true },
      include: {
        _count: {
          select: {
            units: true,
            amenities: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ properties });
  } catch (error) {
    console.error('Error fetching condo data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

// POST - Create new property
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tenantId = 'default',
      name,
      type = 'condominium',
      address,
      city,
      state,
      postalCode,
      country = 'Trinidad & Tobago',
      totalUnits,
      monthlyFeeDefault,
      currency = 'TTD',
      hasParking,
      hasPool,
      hasGym,
      hasElevator,
      hasSecurity24h,
    } = body;

    const property = await db.condoProperty.create({
      data: {
        tenantId,
        name,
        type,
        address,
        city,
        state,
        postalCode,
        country,
        totalUnits: parseInt(totalUnits) || 0,
        monthlyFeeDefault: parseFloat(monthlyFeeDefault) || 0,
        currency,
        hasParking: hasParking === true,
        hasPool: hasPool === true,
        hasGym: hasGym === true,
        hasElevator: hasElevator === true,
        hasSecurity24h: hasSecurity24h === true,
      }
    });

    return NextResponse.json({ property });
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json({ error: 'Failed to create property' }, { status: 500 });
  }
}

// PUT - Update property
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    const property = await db.condoProperty.update({
      where: { id },
      data: {
        ...data,
        totalUnits: data.totalUnits ? parseInt(data.totalUnits) : undefined,
        monthlyFeeDefault: data.monthlyFeeDefault ? parseFloat(data.monthlyFeeDefault) : undefined,
      }
    });

    return NextResponse.json({ property });
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json({ error: 'Failed to update property' }, { status: 500 });
  }
}

// DELETE - Soft delete property
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Property ID required' }, { status: 400 });
    }

    const property = await db.condoProperty.update({
      where: { id },
      data: { isActive: false }
    });

    return NextResponse.json({ property });
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json({ error: 'Failed to delete property' }, { status: 500 });
  }
}
