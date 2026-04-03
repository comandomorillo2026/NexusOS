import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Types for sync data
interface SyncPatient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodType?: string;
  allergies?: string[];
  lastVisit?: string;
}

interface SyncAppointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  duration: number;
  type: string;
  status: string;
  notes?: string;
  doctorId?: string;
  doctorName?: string;
}

interface SyncVitals {
  id: string;
  patientId: string;
  patientName: string;
  timestamp: string;
  systolicBP?: number;
  diastolicBP?: number;
  heartRate?: number;
  temperature?: number;
  temperatureUnit?: string;
  weight?: number;
  weightUnit?: string;
  height?: number;
  heightUnit?: string;
  bmi?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  notes?: string;
}

interface SyncRequest {
  patients?: SyncPatient[];
  appointments?: SyncAppointment[];
  vitals?: SyncVitals[];
  lastSyncTime?: string;
}

interface SyncResponse {
  success: boolean;
  synced: {
    patients: number;
    appointments: number;
    vitals: number;
  };
  errors: Array<{
    type: string;
    id: string;
    error: string;
  }>;
  serverData?: {
    patients?: SyncPatient[];
    appointments?: SyncAppointment[];
  };
}

// POST /api/clinic/mobile/sync - Batch sync offline data
export async function POST(request: NextRequest) {
  try {
    const body: SyncRequest = await request.json();
    const { patients = [], appointments = [], vitals = [] } = body;

    const response: SyncResponse = {
      success: true,
      synced: { patients: 0, appointments: 0, vitals: 0 },
      errors: [],
    };

    // Sync patients
    for (const patient of patients) {
      try {
        // Check if patient exists
        const existing = await db.patient.findUnique({
          where: { id: patient.id },
        });

        if (existing) {
          // Update existing patient
          await db.patient.update({
            where: { id: patient.id },
            data: {
              name: patient.name,
              email: patient.email,
              phone: patient.phone,
              dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth) : undefined,
              gender: patient.gender,
              // Store additional data in a JSON field if needed
              updatedAt: new Date(),
            },
          });
        } else {
          // Create new patient
          await db.patient.create({
            data: {
              id: patient.id,
              name: patient.name,
              email: patient.email,
              phone: patient.phone,
              dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth) : undefined,
              gender: patient.gender,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });
        }
        response.synced.patients++;
      } catch (error) {
        response.errors.push({
          type: 'patient',
          id: patient.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Sync appointments
    for (const appointment of appointments) {
      try {
        // Check if appointment exists
        const existing = await db.appointment?.findUnique({
          where: { id: appointment.id },
        });

        if (existing) {
          // Update existing appointment
          await db.appointment?.update({
            where: { id: appointment.id },
            data: {
              patientId: appointment.patientId,
              date: new Date(appointment.date),
              time: appointment.time,
              duration: appointment.duration,
              type: appointment.type,
              status: appointment.status,
              notes: appointment.notes,
              updatedAt: new Date(),
            },
          });
        } else {
          // Create new appointment
          await db.appointment?.create({
            data: {
              id: appointment.id,
              patientId: appointment.patientId,
              date: new Date(appointment.date),
              time: appointment.time,
              duration: appointment.duration,
              type: appointment.type,
              status: appointment.status,
              notes: appointment.notes,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });
        }
        response.synced.appointments++;
      } catch (error) {
        response.errors.push({
          type: 'appointment',
          id: appointment.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Sync vitals
    for (const vital of vitals) {
      try {
        // Create vital signs record
        await db.vitalSignsLog?.create({
          data: {
            id: vital.id,
            patientId: vital.patientId,
            systolicBP: vital.systolicBP,
            diastolicBP: vital.diastolicBP,
            heartRate: vital.heartRate,
            temperature: vital.temperature,
            weight: vital.weight,
            height: vital.height,
            respiratoryRate: vital.respiratoryRate,
            oxygenSaturation: vital.oxygenSaturation,
            notes: vital.notes,
            recordedAt: new Date(vital.timestamp),
            createdAt: new Date(),
          },
        });
        response.synced.vitals++;
      } catch (error) {
        response.errors.push({
          type: 'vitals',
          id: vital.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Return success response
    return NextResponse.json(response);
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to sync data',
        synced: { patients: 0, appointments: 0, vitals: 0 },
        errors: [],
      },
      { status: 500 }
    );
  }
}

// GET /api/clinic/mobile/sync - Get server data for sync
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lastSyncTime = searchParams.get('lastSyncTime');
    const patientLimit = parseInt(searchParams.get('patientLimit') || '100');
    const appointmentLimit = parseInt(searchParams.get('appointmentLimit') || '50');

    // Get patients updated since last sync
    const patients = await db.patient.findMany({
      take: patientLimit,
      orderBy: { updatedAt: 'desc' },
      where: lastSyncTime ? {
        updatedAt: {
          gte: new Date(lastSyncTime),
        },
      } : undefined,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        dateOfBirth: true,
        gender: true,
        updatedAt: true,
      },
    });

    // Get appointments for today and future
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const appointments = await db.appointment?.findMany({
      take: appointmentLimit,
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
      where: {
        date: {
          gte: today,
        },
      },
      select: {
        id: true,
        patientId: true,
        date: true,
        time: true,
        duration: true,
        type: true,
        status: true,
        notes: true,
        patient: {
          select: {
            name: true,
          },
        },
      },
    });

    // Format response
    const formattedPatients = patients.map((p) => ({
      id: p.id,
      name: p.name,
      email: p.email || undefined,
      phone: p.phone || undefined,
      dateOfBirth: p.dateOfBirth?.toISOString().split('T')[0],
      gender: p.gender || undefined,
    }));

    const formattedAppointments = appointments?.map((a) => ({
      id: a.id,
      patientId: a.patientId,
      patientName: a.patient?.name || 'Unknown',
      date: a.date.toISOString().split('T')[0],
      time: a.time,
      duration: a.duration,
      type: a.type,
      status: a.status,
      notes: a.notes || undefined,
    })) || [];

    return NextResponse.json({
      success: true,
      serverData: {
        patients: formattedPatients,
        appointments: formattedAppointments,
      },
      syncTime: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Sync GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sync data' },
      { status: 500 }
    );
  }
}
