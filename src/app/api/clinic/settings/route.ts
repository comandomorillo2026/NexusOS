import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/clinic/settings - Get clinic settings
// PATCH /api/clinic/settings - Update clinic settings

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'tenantId es requerido' }, { status: 400 });
    }

    let settings = await db.clinicConfig.findUnique({
      where: { tenantId },
    });

    // Create default settings if not exists
    if (!settings) {
      settings = await db.clinicConfig.create({
        data: {
          tenantId,
          clinicName: 'Mi Clínica',
          primaryColor: '#6C3FCE',
          secondaryColor: '#F0B429',
          accentColor: '#C026D3',
        },
      });
    }

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching clinic settings:', error);
    return NextResponse.json({ success: false, error: 'Error al obtener configuración' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, ...updates } = body;

    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'tenantId es requerido' }, { status: 400 });
    }

    const settings = await db.clinicConfig.update({
      where: { tenantId },
      data: updates,
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error updating clinic settings:', error);
    return NextResponse.json({ success: false, error: 'Error al actualizar configuración' }, { status: 500 });
  }
}
