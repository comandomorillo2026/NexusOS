import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create industries
  const industries = await Promise.all([
    prisma.industry.upsert({
      where: { slug: 'clinic' },
      update: {},
      create: {
        id: randomUUID(),
        slug: 'clinic',
        nameEn: 'Medical Clinic',
        nameEs: 'Clínica Médica',
        icon: '🏥',
        descriptionEn: 'Complete practice management for medical clinics',
        descriptionEs: 'Gestión completa para clínicas médicas',
        status: 'active',
        sortOrder: 1,
      },
    }),
    prisma.industry.upsert({
      where: { slug: 'nurse' },
      update: {},
      create: {
        id: randomUUID(),
        slug: 'nurse',
        nameEn: 'Nursing Care',
        nameEs: 'Cuidados de Enfermería',
        icon: '💉',
        descriptionEn: 'Home care and nursing management',
        descriptionEs: 'Gestión de cuidados en casa y enfermería',
        status: 'active',
        sortOrder: 2,
      },
    }),
    prisma.industry.upsert({
      where: { slug: 'lawfirm' },
      update: {},
      create: {
        id: randomUUID(),
        slug: 'lawfirm',
        nameEn: 'Law Firm',
        nameEs: 'Bufete de Abogados',
        icon: '⚖️',
        descriptionEn: 'Case management for law firms',
        descriptionEs: 'Gestión de casos para bufetes',
        status: 'active',
        sortOrder: 3,
      },
    }),
    prisma.industry.upsert({
      where: { slug: 'beauty' },
      update: {},
      create: {
        id: randomUUID(),
        slug: 'beauty',
        nameEn: 'Beauty Salon & SPA',
        nameEs: 'Salón de Belleza & SPA',
        icon: '💇‍♀️',
        descriptionEn: 'Appointment and POS for beauty businesses',
        descriptionEs: 'Citas y POS para negocios de belleza',
        status: 'active',
        sortOrder: 4,
      },
    }),
  ]);

  console.log(`✅ Created ${industries.length} industries`);

  // Create plans
  const plans = await Promise.all([
    prisma.plan.upsert({
      where: { slug: 'starter' },
      update: {},
      create: {
        id: randomUUID(),
        slug: 'starter',
        nameEn: 'Starter',
        nameEs: 'Inicial',
        tier: 'starter',
        priceMonthlyTtd: 800,
        priceAnnualTtd: 680,
        priceBiannualTtd: 750,
        maxUsers: 2,
        maxBranches: 1,
        featuresEn: JSON.stringify(['Up to 200 patients', 'Basic appointments', 'Simple billing', 'Email support']),
        featuresEs: JSON.stringify(['Hasta 200 pacientes', 'Citas básicas', 'Facturación simple', 'Soporte por email']),
      },
    }),
    prisma.plan.upsert({
      where: { slug: 'growth' },
      update: {},
      create: {
        id: randomUUID(),
        slug: 'growth',
        nameEn: 'Growth',
        nameEs: 'Crecimiento',
        tier: 'growth',
        priceMonthlyTtd: 1500,
        priceAnnualTtd: 1275,
        priceBiannualTtd: 1400,
        maxUsers: 5,
        maxBranches: 2,
        featuresEn: JSON.stringify(['Unlimited patients', 'Full appointments', 'Complete billing', 'Lab module', 'Inventory', 'Priority support']),
        featuresEs: JSON.stringify(['Pacientes ilimitados', 'Citas completas', 'Facturación completa', 'Módulo laboratorio', 'Inventario', 'Soporte prioritario']),
        badgeEn: 'Popular',
        badgeEs: 'Popular',
        badgeColor: '#F0B429',
      },
    }),
    prisma.plan.upsert({
      where: { slug: 'premium' },
      update: {},
      create: {
        id: randomUUID(),
        slug: 'premium',
        nameEn: 'Premium',
        nameEs: 'Premium',
        tier: 'premium',
        priceMonthlyTtd: 2800,
        priceAnnualTtd: 2380,
        priceBiannualTtd: 2600,
        maxUsers: 15,
        maxBranches: 5,
        featuresEn: JSON.stringify(['Everything in Growth', 'Multi-location', 'Custom integrations', '24/7 support', 'Dedicated account manager']),
        featuresEs: JSON.stringify(['Todo en Crecimiento', 'Multi-ubicación', 'Integraciones custom', 'Soporte 24/7', 'Gerente de cuenta dedicado']),
      },
    }),
  ]);

  console.log(`✅ Created ${plans.length} plans`);

  // Hash passwords
  const saltRounds = 12;
  const adminPasswordHash = await bcrypt.hash('Aethel2024!', saltRounds);
  const demoPasswordHash = await bcrypt.hash('Demo2024!', saltRounds);

  // Create SUPER_ADMIN user
  const superAdmin = await prisma.systemUser.upsert({
    where: { email: 'admin@aethel.tt' },
    update: {
      passwordHash: adminPasswordHash,
    },
    create: {
      id: randomUUID(),
      email: 'admin@aethel.tt',
      name: 'AETHEL Administrator',
      passwordHash: adminPasswordHash,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  console.log(`✅ Created SUPER_ADMIN: ${superAdmin.email}`);
  console.log('   Password: Aethel2024!');

  // Create demo tenant for clinic
  const clinicTenant = await prisma.tenant.upsert({
    where: { slug: 'clinica-demo' },
    update: {},
    create: {
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
      settings: JSON.stringify({
        primaryColor: '#22D3EE',
        secondaryColor: '#F0B429',
        language: 'es',
      }),
    },
  });

  console.log(`✅ Created tenant: ${clinicTenant.businessName}`);

  // Create TENANT_ADMIN for clinic
  const clinicAdmin = await prisma.systemUser.upsert({
    where: { email: 'clinic@aethel.tt' },
    update: {
      passwordHash: demoPasswordHash,
      tenantId: clinicTenant.id,
    },
    create: {
      id: randomUUID(),
      email: 'clinic@aethel.tt',
      name: 'Dr. Juan Martínez',
      passwordHash: demoPasswordHash,
      role: 'TENANT_ADMIN',
      tenantId: clinicTenant.id,
      isActive: true,
    },
  });

  console.log(`✅ Created TENANT_ADMIN: ${clinicAdmin.email}`);

  // Create demo tenant for lawfirm
  const lawfirmTenant = await prisma.tenant.upsert({
    where: { slug: 'bufete-perez' },
    update: {},
    create: {
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
      settings: JSON.stringify({
        primaryColor: '#1E3A5F',
        secondaryColor: '#C4A35A',
        language: 'es',
      }),
    },
  });

  console.log(`✅ Created tenant: ${lawfirmTenant.businessName}`);

  // Create TENANT_ADMIN for lawfirm
  const lawfirmAdmin = await prisma.systemUser.upsert({
    where: { email: 'lawfirm@aethel.tt' },
    update: {
      passwordHash: demoPasswordHash,
      tenantId: lawfirmTenant.id,
    },
    create: {
      id: randomUUID(),
      email: 'lawfirm@aethel.tt',
      name: 'Carlos Pérez',
      passwordHash: demoPasswordHash,
      role: 'TENANT_ADMIN',
      tenantId: lawfirmTenant.id,
      isActive: true,
    },
  });

  console.log(`✅ Created TENANT_ADMIN: ${lawfirmAdmin.email}`);

  // Create demo tenant for beauty
  const beautyTenant = await prisma.tenant.upsert({
    where: { slug: 'salon-bella-vista' },
    update: {},
    create: {
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
      settings: JSON.stringify({
        primaryColor: '#EC4899',
        secondaryColor: '#8B5CF6',
        language: 'es',
      }),
    },
  });

  console.log(`✅ Created tenant: ${beautyTenant.businessName}`);

  // Create TENANT_ADMIN for beauty
  const beautyAdmin = await prisma.systemUser.upsert({
    where: { email: 'beauty@aethel.tt' },
    update: {
      passwordHash: demoPasswordHash,
      tenantId: beautyTenant.id,
    },
    create: {
      id: randomUUID(),
      email: 'beauty@aethel.tt',
      name: 'Ana Gómez',
      passwordHash: demoPasswordHash,
      role: 'TENANT_ADMIN',
      tenantId: beautyTenant.id,
      isActive: true,
    },
  });

  console.log(`✅ Created TENANT_ADMIN: ${beautyAdmin.email}`);

  // Create demo tenant for nurse
  const nurseTenant = await prisma.tenant.upsert({
    where: { slug: 'enfermeria-cuidados' },
    update: {},
    create: {
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
      settings: JSON.stringify({
        primaryColor: '#34D399',
        secondaryColor: '#F0B429',
        language: 'es',
      }),
    },
  });

  console.log(`✅ Created tenant: ${nurseTenant.businessName}`);

  // Create TENANT_ADMIN for nurse
  const nurseAdmin = await prisma.systemUser.upsert({
    where: { email: 'nurse@aethel.tt' },
    update: {
      passwordHash: demoPasswordHash,
      tenantId: nurseTenant.id,
    },
    create: {
      id: randomUUID(),
      email: 'nurse@aethel.tt',
      name: 'María Rodríguez',
      passwordHash: demoPasswordHash,
      role: 'TENANT_ADMIN',
      tenantId: nurseTenant.id,
      isActive: true,
    },
  });

  console.log(`✅ Created TENANT_ADMIN: ${nurseAdmin.email}`);

  // Create clinic configuration
  await prisma.clinicConfig.upsert({
    where: { tenantId: clinicTenant.id },
    update: {},
    create: {
      id: randomUUID(),
      tenantId: clinicTenant.id,
      clinicName: 'Clínica San Fernando',
      legalName: 'Clínica San Fernando S.A.',
      email: 'info@clinicasanfernando.tt',
      phone: '+1 868 123 4567',
      address: '123 High Street, San Fernando',
      city: 'San Fernando',
      country: 'Trinidad & Tobago',
      primaryColor: '#22D3EE',
      secondaryColor: '#F0B429',
      currency: 'TTD',
      currencySymbol: 'TT$',
      taxRate: 12.5,
    },
  });

  console.log('✅ Created clinic configuration');

  // Create system settings
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

  console.log('✅ Created system settings');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Demo Credentials:');
  console.log('   SUPER_ADMIN: admin@aethel.tt / Aethel2024!');
  console.log('   CLINIC: clinic@aethel.tt / Demo2024!');
  console.log('   LAWYER: lawfirm@aethel.tt / Demo2024!');
  console.log('   BEAUTY: beauty@aethel.tt / Demo2024!');
  console.log('   NURSE: nurse@aethel.tt / Demo2024!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
