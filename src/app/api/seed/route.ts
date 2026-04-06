import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

// GET - Diagnóstico del sistema
export async function GET() {
  try {
    console.log('[SEED] Starting system check...');

    // ========================================
    // DIAGNÓSTICO COMPLETO
    // ========================================
    
    // Verificar variables de entorno
    const envStatus = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      DIRECT_DATABASE_URL: !!process.env.DIRECT_DATABASE_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET',
      NODE_ENV: process.env.NODE_ENV,
    };

    // Verificar conexión a base de datos
    let dbStatus = { connected: false, error: null as string | null };
    try {
      await db.$queryRaw`SELECT 1`;
      dbStatus.connected = true;
    } catch (e) {
      dbStatus.error = e instanceof Error ? e.message : 'Unknown DB error';
    }

    // Contar registros existentes
    let counts = { users: 0, tenants: 0, industries: 0, plans: 0 };
    let users: Array<{ email: string; role: string; isActive: boolean }> = [];
    
    if (dbStatus.connected) {
      counts.users = await db.systemUser.count();
      counts.tenants = await db.tenant.count();
      counts.industries = await db.industry.count();
      counts.plans = await db.plan.count();
      
      users = await db.systemUser.findMany({
        select: { email: true, role: true, isActive: true }
      });
    }

    // Si ya hay usuarios, retornar diagnóstico
    if (counts.users > 0) {
      return NextResponse.json({
        status: 'DIAGNOSTIC_COMPLETE',
        timestamp: new Date().toISOString(),
        environment: envStatus,
        database: {
          connected: dbStatus.connected,
          error: dbStatus.error,
          counts,
          users
        },
        login_test: {
          url: 'https://aethel-os.vercel.app/login',
          credentials: {
            admin: { email: 'admin@aethel.tt', password: 'admin123' },
            clinic: { email: 'clinic@aethel.tt', password: 'demo123' },
            beauty: { email: 'beauty@aethel.tt', password: 'demo123' },
            lawfirm: { email: 'lawfirm@aethel.tt', password: 'demo123' },
            nurse: { email: 'nurse@aethel.tt', password: 'demo123' },
            bakery: { email: 'bakery@aethel.tt', password: 'demo123' },
          }
        },
        nextauth_config: {
          required_vars: ['NEXTAUTH_SECRET', 'NEXTAUTH_URL'],
          nextauth_secret_set: envStatus.NEXTAUTH_SECRET,
          nextauth_url: envStatus.NEXTAUTH_URL,
          expected_url: 'https://nexus-os-alpha.vercel.app',
          url_correct: envStatus.NEXTAUTH_URL === 'https://nexus-os-alpha.vercel.app'
        }
      });
    }

    // ========================================
    // SEED - Solo si no hay usuarios
    // ========================================
    console.log('[SEED] No users found, creating initial data...');

    // Seed Industries
    const industries = [
      {
        slug: 'bakery',
        nameEn: 'Bakery & Pastry',
        nameEs: 'Panadería y Pastelería',
        icon: '🧁',
        descriptionEn: 'Manage orders, recipes, clients & POS in one place',
        descriptionEs: 'Gestiona pedidos, recetas, clientes y POS en un solo lugar',
        status: 'active',
        sortOrder: 1,
      },
      {
        slug: 'clinic',
        nameEn: 'Clinics & Wellness',
        nameEs: 'Clínicas y Bienestar',
        icon: '🏥',
        descriptionEn: 'Appointments, patient records, billing & compliance',
        descriptionEs: 'Citas, historiales de pacientes, facturación y cumplimiento',
        status: 'active',
        sortOrder: 2,
      },
      {
        slug: 'beauty',
        nameEn: 'Beauty Salon & SPA',
        nameEs: 'Salón de Belleza & SPA',
        icon: '💇',
        descriptionEn: 'Bookings, stylists, memberships & gift cards',
        descriptionEs: 'Reservas, estilistas, membresías y tarjetas de regalo',
        status: 'active',
        sortOrder: 3,
      },
      {
        slug: 'nurse',
        nameEn: 'Nursing Care',
        nameEs: 'Cuidados de Enfermería',
        icon: '💉',
        descriptionEn: 'Home care and nursing management',
        descriptionEs: 'Gestión de cuidados en casa y enfermería',
        status: 'active',
        sortOrder: 4,
      },
      {
        slug: 'lawfirm',
        nameEn: 'Law Firm',
        nameEs: 'Bufete de Abogados',
        icon: '⚖️',
        descriptionEn: 'Case management for law firms',
        descriptionEs: 'Gestión de casos para bufetes',
        status: 'active',
        sortOrder: 5,
      },
    ];

    for (const industry of industries) {
      await db.industry.upsert({
        where: { slug: industry.slug },
        update: industry,
        create: industry,
      });
    }
    console.log('[SEED] Created industries');

    // Seed Plans
    const plans = [
      {
        slug: 'starter',
        nameEn: 'STARTER',
        nameEs: 'STARTER',
        tier: 'starter',
        priceMonthlyTtd: 500,
        priceAnnualTtd: 400,
        priceBiannualTtd: 450,
        maxUsers: 3,
        maxBranches: 1,
        badgeEn: 'GET STARTED',
        badgeEs: 'COMENZAR',
        badgeColor: 'violet',
      },
      {
        slug: 'growth',
        nameEn: 'GROWTH ENGINE',
        nameEs: 'GROWTH ENGINE',
        tier: 'growth',
        priceMonthlyTtd: 1200,
        priceAnnualTtd: 960,
        priceBiannualTtd: 1080,
        maxUsers: 10,
        maxBranches: 3,
        badgeEn: 'MOST POPULAR',
        badgeEs: 'MÁS POPULAR',
        badgeColor: 'gold',
      },
      {
        slug: 'premium',
        nameEn: 'PREMIUM ELITE',
        nameEs: 'PREMIUM ELITE',
        tier: 'premium',
        priceMonthlyTtd: 2500,
        priceAnnualTtd: 2000,
        priceBiannualTtd: 2250,
        maxUsers: 50,
        maxBranches: 10,
        badgeEn: 'ENTERPRISE GRADE',
        badgeEs: 'GRADO EMPRESARIAL',
        badgeColor: 'fuchsia',
      },
    ];

    for (const plan of plans) {
      await db.plan.upsert({
        where: { slug: plan.slug },
        update: plan,
        create: plan,
      });
    }
    console.log('[SEED] Created plans');

    // Hash passwords
    const saltRounds = 12;
    const adminPasswordHash = await bcrypt.hash('admin123', saltRounds);
    const demoPasswordHash = await bcrypt.hash('demo123', saltRounds);

    // Crear SUPER_ADMIN
    await db.systemUser.create({
      data: {
        id: randomUUID(),
        email: 'admin@aethel.tt',
        name: 'Super Admin',
        passwordHash: adminPasswordHash,
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });
    console.log('[SEED] Created SUPER_ADMIN: admin@aethel.tt');

    // Crear tenant clínica
    const clinicTenant = await db.tenant.create({
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

    await db.systemUser.create({
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
    console.log('[SEED] Created TENANT_ADMIN: clinic@aethel.tt');

    // Crear tenant beauty
    const beautyTenant = await db.tenant.create({
      data: {
        id: randomUUID(),
        slug: 'salon-bella-vista',
        businessName: 'Salón Bella Vista',
        legalName: 'Salón Bella Vista',
        industrySlug: 'beauty',
        ownerName: 'María López',
        ownerEmail: 'beauty@aethel.tt',
        ownerPhone: '+1 868 555 1234',
        planSlug: 'growth',
        billingCycle: 'monthly',
        status: 'active',
        activatedAt: new Date().toISOString(),
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });

    await db.systemUser.create({
      data: {
        id: randomUUID(),
        email: 'beauty@aethel.tt',
        name: 'María López',
        passwordHash: demoPasswordHash,
        role: 'TENANT_ADMIN',
        tenantId: beautyTenant.id,
        isActive: true,
      },
    });
    console.log('[SEED] Created TENANT_ADMIN: beauty@aethel.tt');

    // Crear tenant lawfirm
    const lawfirmTenant = await db.tenant.create({
      data: {
        id: randomUUID(),
        slug: 'bufete-perez',
        businessName: 'Bufete Pérez & Asociados',
        legalName: 'Bufete Pérez & Asociados',
        industrySlug: 'lawfirm',
        ownerName: 'Carlos Pérez',
        ownerEmail: 'lawfirm@aethel.tt',
        ownerPhone: '+1 868 555 5678',
        planSlug: 'premium',
        billingCycle: 'monthly',
        status: 'active',
        activatedAt: new Date().toISOString(),
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });

    await db.systemUser.create({
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
    console.log('[SEED] Created TENANT_ADMIN: lawfirm@aethel.tt');

    // Crear tenant nurse
    const nurseTenant = await db.tenant.create({
      data: {
        id: randomUUID(),
        slug: 'enfermeria-cuidados',
        businessName: 'Enfermería Cuidados del Hogar',
        legalName: 'Enfermería Cuidados del Hogar',
        industrySlug: 'nurse',
        ownerName: 'Ana Rodríguez',
        ownerEmail: 'nurse@aethel.tt',
        ownerPhone: '+1 868 555 9999',
        planSlug: 'starter',
        billingCycle: 'monthly',
        status: 'active',
        activatedAt: new Date().toISOString(),
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });

    await db.systemUser.create({
      data: {
        id: randomUUID(),
        email: 'nurse@aethel.tt',
        name: 'Ana Rodríguez',
        passwordHash: demoPasswordHash,
        role: 'TENANT_ADMIN',
        tenantId: nurseTenant.id,
        isActive: true,
      },
    });
    console.log('[SEED] Created TENANT_ADMIN: nurse@aethel.tt');

    // Crear tenant bakery
    const bakeryTenant = await db.tenant.create({
      data: {
        id: randomUUID(),
        slug: 'panaderia-demo',
        businessName: 'Panadería El Buen Pan',
        legalName: 'Panadería El Buen Pan C.A.',
        industrySlug: 'bakery',
        ownerName: 'Pedro Gómez',
        ownerEmail: 'bakery@aethel.tt',
        ownerPhone: '+1 868 555 7777',
        planSlug: 'growth',
        billingCycle: 'monthly',
        status: 'active',
        activatedAt: new Date().toISOString(),
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });

    await db.systemUser.create({
      data: {
        id: randomUUID(),
        email: 'bakery@aethel.tt',
        name: 'Pedro Gómez',
        passwordHash: demoPasswordHash,
        role: 'TENANT_ADMIN',
        tenantId: bakeryTenant.id,
        isActive: true,
      },
    });
    console.log('[SEED] Created TENANT_ADMIN: bakery@aethel.tt');

    console.log('[SEED] ✅ Database initialization complete!');

    return NextResponse.json({
      status: 'SEEDED_SUCCESSFULLY',
      timestamp: new Date().toISOString(),
      environment: envStatus,
      database: {
        connected: true,
        counts: {
          users: 5,
          tenants: 4,
          industries: industries.length,
          plans: plans.length,
        }
      },
      login_credentials: {
        admin: { email: 'admin@aethel.tt', password: 'admin123' },
        clinic: { email: 'clinic@aethel.tt', password: 'demo123' },
        beauty: { email: 'beauty@aethel.tt', password: 'demo123' },
        lawfirm: { email: 'lawfirm@aethel.tt', password: 'demo123' },
        nurse: { email: 'nurse@aethel.tt', password: 'demo123' },
        bakery: { email: 'bakery@aethel.tt', password: 'demo123' },
      }
    });
  } catch (error) {
    console.error('[SEED] Error:', error);
    return NextResponse.json(
      { 
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Failed to seed database',
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}
