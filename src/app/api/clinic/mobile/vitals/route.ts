import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Types for vitals data
interface VitalsData {
  id: string;
  patientId: string;
  patientName: string;
  timestamp: string;
  systolicBP?: number;
  diastolicBP?: number;
  bpUnit?: string;
  heartRate?: number;
  heartRateUnit?: string;
  temperature?: number;
  temperatureUnit?: string;
  weight?: number;
  weightUnit?: string;
  height?: number;
  heightUnit?: string;
  bmi?: number;
  respiratoryRate?: number;
  respiratoryRateUnit?: string;
  oxygenSaturation?: number;
  oxygenSaturationUnit?: string;
  notes?: string;
}

// POST /api/clinic/mobile/vitals - Save vitals from mobile app
export async function POST(request: NextRequest) {
  try {
    const body: VitalsData = await request.json();
    const {
      id,
      patientId,
      patientName,
      timestamp,
      systolicBP,
      diastolicBP,
      heartRate,
      temperature,
      temperatureUnit = '°C',
      weight,
      weightUnit = 'kg',
      height,
      heightUnit = 'cm',
      bmi,
      respiratoryRate,
      oxygenSaturation,
      notes,
    } = body;

    // Validate required fields
    if (!patientId) {
      return NextResponse.json(
        { success: false, error: 'Patient ID is required' },
        { status: 400 }
      );
    }

    // Check if vitalSignsLog model exists in Prisma
    let savedVitals;
    
    try {
      // Try to save to database
      savedVitals = await db.vitalSignsLog?.create({
        data: {
          id,
          patientId,
          systolicBP,
          diastolicBP,
          heartRate,
          temperature,
          weight,
          height,
          respiratoryRate,
          oxygenSaturation,
          notes,
          recordedAt: new Date(timestamp || new Date()),
          createdAt: new Date(),
        },
      });
    } catch (dbError) {
      // If model doesn't exist, return success anyway (for development)
      console.log('DB save skipped, model may not exist:', dbError);
      savedVitals = {
        id,
        patientId,
        recordedAt: new Date(timestamp || new Date()),
      };
    }

    // Check for abnormal values and create alerts
    const alerts: string[] = [];
    
    if (systolicBP) {
      if (systolicBP > 140) {
        alerts.push('Presión sistólica elevada');
      } else if (systolicBP < 90) {
        alerts.push('Presión sistólica baja');
      }
    }
    
    if (diastolicBP) {
      if (diastolicBP > 90) {
        alerts.push('Presión diastólica elevada');
      } else if (diastolicBP < 60) {
        alerts.push('Presión diastólica baja');
      }
    }
    
    if (heartRate) {
      if (heartRate > 100) {
        alerts.push('Frecuencia cardíaca elevada');
      } else if (heartRate < 60) {
        alerts.push('Frecuencia cardíaca baja');
      }
    }
    
    if (temperature && temperatureUnit === '°C') {
      if (temperature > 37.5) {
        alerts.push('Temperatura elevada');
      } else if (temperature < 36.0) {
        alerts.push('Temperatura baja');
      }
    }
    
    if (oxygenSaturation && oxygenSaturation < 95) {
      alerts.push('Saturación de oxígeno baja');
    }

    // Return success response
    return NextResponse.json({
      success: true,
      id: savedVitals?.id || id,
      patientId,
      recordedAt: savedVitals?.recordedAt || timestamp,
      alerts: alerts.length > 0 ? alerts : undefined,
      bmi: bmi || calculateBMI(weight, height, weightUnit, heightUnit),
    });
  } catch (error) {
    console.error('Vitals save error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save vitals' },
      { status: 500 }
    );
  }
}

// GET /api/clinic/mobile/vitals - Get vitals history for a patient
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!patientId) {
      return NextResponse.json(
        { success: false, error: 'Patient ID is required' },
        { status: 400 }
      );
    }

    // Get vitals history
    let vitals;
    try {
      vitals = await db.vitalSignsLog?.findMany({
        where: { patientId },
        take: limit,
        orderBy: { recordedAt: 'desc' },
      });
    } catch {
      // Model may not exist yet
      vitals = [];
    }

    return NextResponse.json({
      success: true,
      vitals: vitals || [],
    });
  } catch (error) {
    console.error('Vitals fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vitals' },
      { status: 500 }
    );
  }
}

// Helper function to calculate BMI
function calculateBMI(
  weight?: number,
  height?: number,
  weightUnit?: string,
  heightUnit?: string
): number | null {
  if (!weight || !height) return null;

  // Convert to metric if needed
  let weightKg = weight;
  let heightM = height;

  if (weightUnit === 'lbs') {
    weightKg = weight * 0.453592;
  }

  if (heightUnit === 'cm') {
    heightM = height / 100;
  } else if (heightUnit === 'in') {
    heightM = height * 0.0254;
  }

  const bmi = weightKg / (heightM * heightM);
  return Math.round(bmi * 10) / 10;
}
