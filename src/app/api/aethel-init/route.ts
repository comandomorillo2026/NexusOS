import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

// Simple endpoint to initialize AETHEL OS users
// Call this endpoint directly in production to create the admin user

export async function GET(request: NextRequest) {
  return POST(request);
}

export async function POST(request: NextRequest) {
  try {
    console.log('[AETHEL-INIT] Starting initialization...');
    
    // Check if admin already exists
    const existingAdmin = await prisma.systemUser.findUnique({
      where: { email: 'admin@aethel.tt' },
    });

    if (existingAdmin) {
      console.log('[AETHEL-INIT] Admin already exists');
      return NextResponse.json({
        success: true,
        message: 'Admin user already exists',
        user: {
          email: existingAdmin.email,
          name: existingAdmin.name,
          role: existingAdmin.role,
          isActive: existingAdmin.isActive,
        },
        credentials: {
          email: 'admin@aethel.tt',
          password: 'Aethel2024!',
        },
      });
    }

    // Hash passwords
    const saltRounds = 12;
    const adminPasswordHash = await bcrypt.hash('Aethel2024!', saltRounds);
    const demoPasswordHash = await bcrypt.hash('Demo2024!', saltRounds);

    console.log('[AETHEL-INIT] Creating industries...');

    // Create industries if they don't exist
    const industries = [
      { slug: 'clinic', nameEn: 'Medical Clinic', nameEs: 'Clínica Médica', icon: '🏥', descriptionEn: 'Complete practice management for medical clinics', descriptionEs: 'Gestión completa para clínicas médicas', sortOrder: 1 },
      { slug: 'nurse', nameEn: 'Nursing Care', nameEs: 'Cuidados de Enfermería', icon: '💉', descriptionEn: 'Home care and nursing management', descriptionEs: 'Gestión de cuidados en casa y enfermería', sortOrder: 2 },
      { slug: 'lawfirm', nameEn: 'Law Firm', nameEs: 'Bufete de Abogados', icon: '⚖️', descriptionEn: 'Case management for law firms', descriptionEs: 'Gestión de casos para bufetes', sortOrder: 3 },
      { slug: 'beauty', nameEn: 'Beauty Salon & SPA', nameEs: 'Salón de Belleza & SPA', icon: '💇‍♀️', descriptionEn: 'Appointment and POS for beauty businesses', descriptionEs: 'Citas y POS para negocios de belleza', sortOrder: 4 },
      { slug: 'bakery', nameEn: 'Bakery', nameEs: 'Panadería', icon: '🍞', descriptionEn: 'POS and catalog for bakeries', descriptionEs: 'POS y catálogo para panaderías', sortOrder: 5 },
      { slug: 'pharmacy', nameEn: 'Pharmacy', nameEs: 'Farmacia', icon: '💊', descriptionEn: 'Pharmacy management system', descriptionEs: 'Sistema de gestión de farmacia', sortOrder: 6 },
      { slug: 'insurance', nameEn: 'Insurance', nameEs: 'Seguros', icon: '🛡️', descriptionEn: 'Insurance agency management', descriptionEs: 'Gestión de agencia de seguros', sortOrder: 7 },
    ];

    for (const industry of industries) {
      await prisma.industry.upsert({
        where: { slug: industry.slug },
        update: {},
        create: {
          id: randomUUID(),
          ...industry,
          status: 'active',
        },
      });
    }

    console.log('[AETHEL-INIT] Creating plans...');

    // Create plans if they don't exist
    const plans = [
      { slug: 'starter', nameEn: 'Starter', nameEs: 'Inicial', tier: 'starter', priceMonthlyTtd: 340, maxUsers: 3, maxBranches: 1 },
      { slug: 'growth', nameEn: 'Growth', nameEs: 'Crecimiento', tier: 'growth', priceMonthlyTtd: 595, maxUsers: 10, maxBranches: 3 },
      { slug: 'premium', nameEn: 'Premium', nameEs: 'Premium', tier: 'premium', priceMonthlyTtd: 850, maxUsers: 50, maxBranches: 10 },
    ];

    for (const plan of plans) {
      await prisma.plan.upsert({
        where: { slug: plan.slug },
        update: {},
        create: {
          id: randomUUID(),
          ...plan,
          featuresEn: JSON.stringify([]),
          featuresEs: JSON.stringify([]),
        },
      });
    }

    console.log('[AETHEL-INIT] Creating SUPER_ADMIN user...');

    // Create SUPER_ADMIN user
    const superAdmin = await prisma.systemUser.create({
      data: {
        id: randomUUID(),
        email: 'admin@aethel.tt',
        name: 'AETHEL Administrator',
        passwordHash: adminPasswordHash,
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });

    console.log('[AETHEL-INIT] Created SUPER_ADMIN:', superAdmin.email);

    // Create demo tenants and users
    const createdUsers: { email: string; password: string }[] = [
      { email: 'admin@aethel.tt', password: 'Aethel2024!' }
    ];

    // Create clinic tenant and user
    try {
      const clinicTenant = await prisma.tenant.create({
        data: {
          id: randomUUID(),
          slug: 'clinica-demo',
          businessName: 'Clínica San Fernando',
          legalName: 'Clínica San Fernando S.A.',
          industrySlug: 'clinic',
          ownerName: 'Dr. Juan Martínez',
          ownerEmail: 'clinic@aethel.tt',
          ownerPhone: '+1 868 123 4567',
          planSlug: 'growth',
          billingCycle: 'monthly',
          status: 'active',
          activatedAt: new Date().toISOString(),
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
      });

      await prisma.systemUser.create({
        data: {
          id: randomUUID(),
          email: 'clinic@aethel.tt',
          name: 'Dr. Juan Martínez',
          passwordHash: demoPasswordHash,
          role: 'TENANT_ADMIN',
          tenantId: clinicTenant.id,
          isActive: true,
        },
      });
      createdUsers.push({ email: 'clinic@aethel.tt', password: 'Demo2024!' });
    } catch (e) {
      console.log('[AETHEL-INIT] Clinic user might already exist, skipping...');
    }

    // Create lawfirm tenant and user
    try {
      const lawfirmTenant = await prisma.tenant.create({
        data: {
          id: randomUUID(),
          slug: 'bufete-perez',
          businessName: 'Bufete Pérez & Asociados',
          legalName: 'Bufete Pérez & Asociados',
          industrySlug: 'lawfirm',
          ownerName: 'Carlos Pérez',
          ownerEmail: 'lawfirm@aethel.tt',
          ownerPhone: '+1 868 234 5678',
          planSlug: 'premium',
          billingCycle: 'annual',
          status: 'active',
          activatedAt: new Date().toISOString(),
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        },
      });

      await prisma.systemUser.create({
        data: {
          id: randomUUID(),
          email: 'lawfirm@aethel.tt',
          name: 'Carlos Pérez',
          passwordHash: demoPasswordHash,
          role: 'TENANT_ADMIN',
          tenantId: lawfirmTenant.id,
          isActive: true,
        },
      });
      createdUsers.push({ email: 'lawfirm@aethel.tt', password: 'Demo2024!' });
    } catch (e) {
      console.log('[AETHEL-INIT] Lawfirm user might already exist, skipping...');
    }

    // Create beauty tenant and user
    try {
      const beautyTenant = await prisma.tenant.create({
        data: {
          id: randomUUID(),
          slug: 'salon-bella-vista',
          businessName: 'Salón Bella Vista',
          legalName: 'Salón Bella Vista',
          industrySlug: 'beauty',
          ownerName: 'Ana Gómez',
          ownerEmail: 'beauty@aethel.tt',
          ownerPhone: '+1 868 345 6789',
          planSlug: 'growth',
          billingCycle: 'monthly',
          status: 'active',
          activatedAt: new Date().toISOString(),
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
      });

      await prisma.systemUser.create({
        data: {
          id: randomUUID(),
          email: 'beauty@aethel.tt',
          name: 'Ana Gómez',
          passwordHash: demoPasswordHash,
          role: 'TENANT_ADMIN',
          tenantId: beautyTenant.id,
          isActive: true,
        },
      });
      createdUsers.push({ email: 'beauty@aethel.tt', password: 'Demo2024!' });
    } catch (e) {
      console.log('[AETHEL-INIT] Beauty user might already exist, skipping...');
    }

    // Create nurse tenant and user
    try {
      const nurseTenant = await prisma.tenant.create({
        data: {
          id: randomUUID(),
          slug: 'enfermeria-cuidados',
          businessName: 'Enfermería Cuidados del Hogar',
          legalName: 'Enfermería Cuidados del Hogar',
          industrySlug: 'nurse',
          ownerName: 'María Rodríguez',
          ownerEmail: 'nurse@aethel.tt',
          ownerPhone: '+1 868 456 7890',
          planSlug: 'growth',
          billingCycle: 'monthly',
          status: 'active',
          activatedAt: new Date().toISOString(),
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
      });

      await prisma.systemUser.create({
        data: {
          id: randomUUID(),
          email: 'nurse@aethel.tt',
          name: 'María Rodríguez',
          passwordHash: demoPasswordHash,
          role: 'TENANT_ADMIN',
          tenantId: nurseTenant.id,
          isActive: true,
        },
      });
      createdUsers.push({ email: 'nurse@aethel.tt', password: 'Demo2024!' });
    } catch (e) {
      console.log('[AETHEL-INIT] Nurse user might already exist, skipping...');
    }

    // Create system settings for AETHEL branding
    await prisma.systemSetting.upsert({
      where: { key: 'company_name' },
      update: { value: 'AETHEL OS' },
      create: {
        id: randomUUID(),
        key: 'company_name',
        value: 'AETHEL OS',
        description: 'Company name displayed in the system',
        isPublic: true,
      },
    });

    await prisma.systemSetting.upsert({
      where: { key: 'support_email' },
      update: { value: 'soporte@aethel.tt' },
      create: {
        id: randomUUID(),
        key: 'support_email',
        value: 'soporte@aethel.tt',
        description: 'Support email address',
        isPublic: true,
      },
    });

    console.log('[AETHEL-INIT] Initialization complete!');

    return NextResponse.json({
      success: true,
      message: 'AETHEL OS initialized successfully',
      users: createdUsers,
      instructions: 'You can now log in with the credentials above.',
    });
  } catch (error) {
    console.error('[AETHEL-INIT] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined,
      },
      { status: 500 }
    );
  }
}
