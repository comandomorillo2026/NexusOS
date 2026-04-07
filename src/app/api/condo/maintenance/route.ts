import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch maintenance requests
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const unitId = searchParams.get('unitId');
    const residentId = searchParams.get('residentId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const requestId = searchParams.get('requestId');

    if (requestId) {
      // Get single request with full details
      const maintenanceRequest = await db.condoMaintenanceRequest.findFirst({
        where: { id: requestId },
        include: {
          tickets: true,
          resident: {
            select: { firstName: true, lastName: true, phone: true, email: true }
          },
          property: { select: { name: true } }
        }
      });

      return NextResponse.json({ maintenanceRequest });
    }

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID required' }, { status: 400 });
    }

    // Build filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { propertyId };
    if (unitId) where.unitId = unitId;
    if (residentId) where.residentId = residentId;
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const requests = await db.condoMaintenanceRequest.findMany({
      where,
      include: {
        resident: {
          select: { 
            firstName: true, 
            lastName: true,
            unit: { select: { unitNumber: true } }
          }
        },
        tickets: { take: 1 }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // Stats
    const stats = {
      total: requests.length,
      open: requests.filter(r => r.status === 'open').length,
      assigned: requests.filter(r => r.status === 'assigned').length,
      inProgress: requests.filter(r => r.status === 'in_progress').length,
      completed: requests.filter(r => r.status === 'completed').length,
      urgent: requests.filter(r => r.priority === 'urgent' || r.priority === 'emergency').length,
      totalCost: requests.reduce((sum, r) => sum + r.totalCost, 0),
    };

    return NextResponse.json({ requests, stats });
  } catch (error) {
    console.error('Error fetching maintenance requests:', error);
    return NextResponse.json({ error: 'Failed to fetch maintenance requests' }, { status: 500 });
  }
}

// POST - Create new maintenance request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      propertyId,
      unitId,
      residentId,
      tenantId = 'default',
      category,
      priority = 'normal',
      title,
      description,
      location,
      accessInstructions,
      preferredTime,
      images,
    } = body;

    // Generate request number
    const count = await db.condoMaintenanceRequest.count({
      where: { propertyId }
    });
    const requestNumber = `MR-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const maintenanceRequest = await db.condoMaintenanceRequest.create({
      data: {
        propertyId,
        unitId,
        residentId,
        tenantId,
        requestNumber,
        category,
        priority,
        title,
        description,
        location,
        accessInstructions,
        preferredTime,
        images,
        status: 'open',
      }
    });

    return NextResponse.json({ maintenanceRequest });
  } catch (error) {
    console.error('Error creating maintenance request:', error);
    return NextResponse.json({ error: 'Failed to create maintenance request' }, { status: 500 });
  }
}

// PUT - Update maintenance request
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    // Handle status transitions
    const updateData: Record<string, unknown> = { ...data };
    
    if (data.status === 'assigned') {
      updateData.assignedAt = new Date().toISOString();
    }
    if (data.status === 'completed') {
      updateData.completedAt = new Date().toISOString();
    }

    const maintenanceRequest = await db.condoMaintenanceRequest.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ maintenanceRequest });
  } catch (error) {
    console.error('Error updating maintenance request:', error);
    return NextResponse.json({ error: 'Failed to update maintenance request' }, { status: 500 });
  }
}

// DELETE - Cancel maintenance request
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Request ID required' }, { status: 400 });
    }

    const maintenanceRequest = await db.condoMaintenanceRequest.update({
      where: { id },
      data: { status: 'cancelled' }
    });

    return NextResponse.json({ maintenanceRequest });
  } catch (error) {
    console.error('Error cancelling maintenance request:', error);
    return NextResponse.json({ error: 'Failed to cancel maintenance request' }, { status: 500 });
  }
}
