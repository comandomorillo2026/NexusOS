import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/admin/tenants/[id] - Get tenant details
// PATCH /api/admin/tenants/[id] - Update tenant
// DELETE /api/admin/tenants/[id] - Delete tenant (soft delete)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const tenant = await db.tenant.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
            lastLoginAt: true,
            createdAt: true,
          },
        },
        _count: {
          select: { users: true },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json({ success: false, error: 'Inquilino no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, tenant });
  } catch (error) {
    console.error('Error fetching tenant:', error);
    return NextResponse.json({ success: false, error: 'Error al obtener inquilino' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const {
      businessName,
      legalName,
      ownerName,
      ownerEmail,
      ownerPhone,
      status,
      planSlug,
      billingCycle,
      settings,
    } = body;

    const updateData: any = {};
    if (businessName) updateData.businessName = businessName;
    if (legalName) updateData.legalName = legalName;
    if (ownerName) updateData.ownerName = ownerName;
    if (ownerEmail) updateData.ownerEmail = ownerEmail;
    if (ownerPhone) updateData.ownerPhone = ownerPhone;
    if (status) updateData.status = status;
    if (planSlug) updateData.planSlug = planSlug;
    if (billingCycle) updateData.billingCycle = billingCycle;
    if (settings) updateData.settings = typeof settings === 'string' ? settings : JSON.stringify(settings);

    const tenant = await db.tenant.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, tenant });
  } catch (error) {
    console.error('Error updating tenant:', error);
    return NextResponse.json({ success: false, error: 'Error al actualizar inquilino' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Soft delete
    const tenant = await db.tenant.update({
      where: { id },
      data: { isDeleted: true },
    });

    return NextResponse.json({ success: true, message: 'Inquilino eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting tenant:', error);
    return NextResponse.json({ success: false, error: 'Error al eliminar inquilino' }, { status: 500 });
  }
}
