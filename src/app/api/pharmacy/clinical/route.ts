import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/pharmacy/clinical - Get clinical data (immunizations, med sync, deliveries)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'immunizations';
    const patientId = searchParams.get('patientId') || '';
    
    switch (type) {
      case 'immunizations':
        const immunizations = await db.pharmacyImmunization.findMany({
          where: patientId ? { patientId } : {},
          orderBy: { administrationDate: 'desc' },
          take: 100
        });
        return NextResponse.json({ immunizations });
        
      case 'medsync':
        const medSync = await db.pharmacyMedSync.findMany({
          where: patientId ? { patientId } : { status: 'active' },
          orderBy: { syncDate: 'asc' },
          take: 50
        });
        return NextResponse.json({ medSync });
        
      case 'deliveries':
        const deliveries = await db.pharmacyDelivery.findMany({
          orderBy: { scheduledDate: 'asc' },
          take: 50
        });
        return NextResponse.json({ deliveries });
        
      case 'prescribers':
        const prescribers = await db.pharmacyPrescriber.findMany({
          where: { isActive: true },
          orderBy: { fullName: 'asc' },
          take: 100
        });
        return NextResponse.json({ prescribers });
        
      case 'insurance':
        const insurance = await db.pharmacyInsurance.findMany({
          where: { isActive: true },
          orderBy: { payerName: 'asc' },
          take: 100
        });
        return NextResponse.json({ insurance });
        
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching clinical data:', error);
    return NextResponse.json({ error: 'Failed to fetch clinical data' }, { status: 500 });
  }
}

// POST /api/pharmacy/clinical - Create clinical records
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const type = body.type || 'immunization';
    
    switch (type) {
      case 'immunization':
        const immunization = await db.pharmacyImmunization.create({
          data: {
            tenantId: body.tenantId || 'default',
            patientId: body.patientId,
            patientName: body.patientName,
            vaccineName: body.vaccineName,
            vaccineCode: body.vaccineCode,
            vaccineManufacturer: body.vaccineManufacturer,
            vaccineLot: body.vaccineLot,
            vaccineExpiration: body.vaccineExpiration,
            administrationDate: body.administrationDate,
            administrationSite: body.administrationSite,
            route: body.route || 'IM',
            doseNumber: body.doseNumber || 1,
            dosesInSeries: body.dosesInSeries || 1,
            nextDoseDate: body.nextDoseDate,
            administeringPharmacist: body.administeringPharmacist,
            pharmacistLicense: body.pharmacistLicense,
            visGiven: body.visGiven || false,
            visDate: body.visDate,
            notes: body.notes,
          }
        });
        return NextResponse.json({ immunization });
        
      case 'medsync':
        const medSync = await db.pharmacyMedSync.create({
          data: {
            tenantId: body.tenantId || 'default',
            patientId: body.patientId,
            patientName: body.patientName,
            syncDate: body.syncDate,
            medications: body.medications ? JSON.stringify(body.medications) : null,
            nextSyncDate: body.nextSyncDate,
            frequency: body.frequency || 'monthly',
            reminderDays: body.reminderDays || 3,
            notes: body.notes,
            status: 'active',
          }
        });
        return NextResponse.json({ medSync });
        
      case 'delivery':
        // Generate delivery number
        const deliveryCount = await db.pharmacyDelivery.count();
        const deliveryNumber = `DEL-${new Date().getFullYear()}-${String(deliveryCount + 1).padStart(5, '0')}`;
        
        const delivery = await db.pharmacyDelivery.create({
          data: {
            tenantId: body.tenantId || 'default',
            deliveryNumber,
            patientId: body.patientId,
            patientName: body.patientName,
            patientAddress: body.patientAddress,
            patientPhone: body.patientPhone,
            prescriptions: body.prescriptions ? JSON.stringify(body.prescriptions) : null,
            scheduledDate: body.scheduledDate,
            scheduledTime: body.scheduledTime,
            deliveryNotes: body.deliveryNotes,
            status: 'pending',
          }
        });
        return NextResponse.json({ delivery });
        
      case 'prescriber':
        const prescriber = await db.pharmacyPrescriber.create({
          data: {
            tenantId: body.tenantId || 'default',
            npi: body.npi,
            firstName: body.firstName,
            lastName: body.lastName,
            fullName: `${body.firstName} ${body.lastName}`,
            deaNumber: body.deaNumber,
            stateLicense: body.stateLicense,
            specialty: body.specialty,
            practiceName: body.practiceName,
            address: body.address,
            city: body.city,
            state: body.state,
            zip: body.zip,
            phone: body.phone,
            fax: body.fax,
            email: body.email,
            prescriptiveAuthority: body.prescriptiveAuthority,
            controlledSubstance: body.controlledSubstance || false,
          }
        });
        return NextResponse.json({ prescriber });
        
      case 'insurance':
        const insurance = await db.pharmacyInsurance.create({
          data: {
            tenantId: body.tenantId || 'default',
            payerId: body.payerId,
            payerName: body.payerName,
            payerType: body.payerType,
            bin: body.bin,
            pcn: body.pcn,
            groupNumber: body.groupNumber,
            phone: body.phone,
            fax: body.fax,
            website: body.website,
            helpDeskPhone: body.helpDeskPhone,
            priorAuthPhone: body.priorAuthPhone,
            claimAddress: body.claimAddress,
            claimCity: body.claimCity,
            claimState: body.claimState,
            claimZip: body.claimZip,
            electronicClaim: body.electronicClaim !== false,
            realTime: body.realTime !== false,
            copayType: body.copayType,
            defaultCopay: body.defaultCopay,
          }
        });
        return NextResponse.json({ insurance });
        
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error creating clinical record:', error);
    return NextResponse.json({ error: 'Failed to create clinical record' }, { status: 500 });
  }
}

// PATCH /api/pharmacy/clinical - Update clinical records
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, id, ...updates } = body;
    
    switch (type) {
      case 'delivery':
        const delivery = await db.pharmacyDelivery.update({
          where: { id },
          data: {
            status: updates.status,
            deliveredAt: updates.deliveredAt,
            deliveryPerson: updates.deliveryPerson,
            signatureUrl: updates.signatureUrl,
            photoUrl: updates.photoUrl,
            failureReason: updates.failureReason,
          }
        });
        return NextResponse.json({ delivery });
        
      case 'medsync':
        const medSync = await db.pharmacyMedSync.update({
          where: { id },
          data: {
            syncDate: updates.syncDate,
            nextSyncDate: updates.nextSyncDate,
            reminderSent: updates.reminderSent,
            status: updates.status,
          }
        });
        return NextResponse.json({ medSync });
        
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error updating clinical record:', error);
    return NextResponse.json({ error: 'Failed to update clinical record' }, { status: 500 });
  }
}
