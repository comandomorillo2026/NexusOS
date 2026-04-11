import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/beauty/settings - Get salon settings
// PUT /api/beauty/settings - Update salon settings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'tenantId requerido' }, { status: 400 });
    }

    let settings = await db.beautySettings.findUnique({
      where: { tenantId },
    });

    // Create default settings if not exist
    if (!settings) {
      settings = await db.beautySettings.create({
        data: {
          tenantId,
          salonName: 'Mi Salón',
          currency: 'TTD',
          currencySymbol: 'TT$',
        },
      });
    }

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ success: false, error: 'Error al obtener configuración' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, ...data } = body;

    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'tenantId requerido' }, { status: 400 });
    }

    const settings = await db.beautySettings.update({
      where: { tenantId },
      data,
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ success: false, error: 'Error al actualizar configuración' }, { status: 500 });
  }
}
