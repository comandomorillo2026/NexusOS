import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendTenantWelcomeEmail } from '@/lib/email/resend';

const prisma = new PrismaClient();

// POST /api/admin/tenants/create - Create a new tenant
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      // Business info
      businessName,
      legalName,
      slug,
      industrySlug,
      country,
      
      // Owner info
      ownerName,
      ownerEmail,
      ownerPhone,
      
      // Plan info
      planSlug,
      billingCycle,
      isTrial,
      trialDays,
      trialEndsAt,
      
      // Options
      sendWelcomeEmail,
      acceptTerms,
      preferredLanguage,
    } = body;

    // Validate required fields
    if (!businessName || !ownerName || !ownerEmail || !ownerPhone || !slug || !industrySlug || !planSlug) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug },
    });

    if (existingTenant) {
      return NextResponse.json(
        { success: false, error: 'This URL slug is already taken' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await prisma.tenant.findFirst({
      where: { ownerEmail },
    });

    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: 'A tenant with this email already exists' },
        { status: 400 }
      );
    }

    // Get plan pricing
    const plan = await prisma.plan.findUnique({
      where: { slug: planSlug },
    });

    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan' },
        { status: 400 }
      );
    }

    // Calculate dates
    const now = new Date();
    const nowStr = now.toISOString();
    
    // Trial dates
    let trialStartsAt: string | null = null;
    let trialEndsAtCalculated: string | null = null;
    let activatedAt: string | null = null;
    let currentPeriodStart: string | null = null;
    let currentPeriodEnd: string | null = null;

    if (isTrial) {
      trialStartsAt = nowStr;
      trialEndsAtCalculated = trialEndsAt || new Date(now.getTime() + (trialDays || 7) * 24 * 60 * 60 * 1000).toISOString();
    } else {
      activatedAt = nowStr;
      currentPeriodStart = nowStr;
      
      // Calculate period end based on billing cycle
      const periodEnd = new Date(now);
      switch (billingCycle) {
        case 'annual':
          periodEnd.setFullYear(periodEnd.getFullYear() + 1);
          break;
        case 'biannual':
          periodEnd.setFullYear(periodEnd.getFullYear() + 2);
          break;
        default: // monthly
          periodEnd.setMonth(periodEnd.getMonth() + 1);
      }
      // Set to midnight
      periodEnd.setHours(0, 0, 0, 0);
      currentPeriodEnd = periodEnd.toISOString();
    }

    // Get industry name
    const industry = await prisma.industry.findUnique({
      where: { slug: industrySlug },
    });

    // Create tenant
    const tenant = await prisma.tenant.create({
      data: {
        slug,
        businessName,
        legalName,
        industrySlug,
        ownerName,
        ownerEmail,
        ownerPhone,
        planSlug,
        billingCycle: billingCycle || 'monthly',
        status: isTrial ? 'trial' : 'active',
        isTrial: isTrial ?? true,
        trialStartsAt,
        trialEndsAt: trialEndsAtCalculated,
        activatedAt,
        currentPeriodStart,
        currentPeriodEnd,
      },
    });

    // Create subscription record
    const price = billingCycle === 'annual' 
      ? plan.priceAnnualTtd 
      : billingCycle === 'biannual' 
        ? plan.priceBiannualTtd 
        : plan.priceMonthlyTtd;

    await prisma.tenantSubscription.create({
      data: {
        tenantId: tenant.id,
        planSlug,
        planName: plan.nameEn,
        billingCycle: billingCycle || 'monthly',
        priceTtd: price,
        status: isTrial ? 'trial' : 'active',
        currentPeriodStart: currentPeriodStart || nowStr,
        currentPeriodEnd: currentPeriodEnd || trialEndsAtCalculated || nowStr,
      },
    });

    // Create terms acceptance if accepted
    if (acceptTerms) {
      await prisma.termsAcceptance.create({
        data: {
          tenantId: tenant.id,
          userEmail: ownerEmail,
          userName: ownerName,
          termsVersion: '1.0',
          privacyVersion: '1.0',
          acceptedAt: nowStr,
          acceptedDuring: 'registration',
        },
      });
    }

    // Create system user for the tenant owner
    const existingUser = await prisma.systemUser.findUnique({
      where: { email: ownerEmail },
    });

    let tempPassword = '';
    
    if (!existingUser) {
      // Create a temporary password (they'll set their own via welcome email)
      tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();
      
      await prisma.systemUser.create({
        data: {
          tenantId: tenant.id,
          email: ownerEmail,
          name: ownerName,
          phone: ownerPhone,
          role: 'TENANT_ADMIN',
          passwordHash: tempPassword, // In production, hash this properly
        },
      });
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        tenantId: tenant.id,
        userEmail: 'admin@aethel.tt',
        userName: 'System Admin',
        action: 'TENANT_CREATED',
        entityType: 'tenant',
        entityId: tenant.id,
        description: `Tenant created: ${businessName} (${isTrial ? 'Trial' : 'Active'})`,
      },
    });

    // Send welcome email if requested
    let emailSent = false;
    if (sendWelcomeEmail && tempPassword) {
      const language = preferredLanguage || 'es';
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aethel.tt';
      const loginUrl = `${appUrl}/login`;
      
      try {
        const result = await sendTenantWelcomeEmail({
          to: ownerEmail,
          userName: ownerName,
          businessName: businessName,
          loginUrl: loginUrl,
          email: ownerEmail,
          tempPassword: tempPassword,
          industry: industrySlug,
          language: language as 'es' | 'en',
        });
        emailSent = result.success;
        
        if (!result.success) {
          console.error('Failed to send welcome email:', result.error);
        }
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      tenant: {
        id: tenant.id,
        slug: tenant.slug,
        businessName: tenant.businessName,
        planSlug: tenant.planSlug,
        billingCycle: tenant.billingCycle,
        status: tenant.status,
        isTrial: tenant.isTrial,
        trialEndsAt: tenant.trialEndsAt,
        activatedAt: tenant.activatedAt,
        preferredLanguage: preferredLanguage || 'es',
      },
      emailSent,
    });

  } catch (error) {
    console.error('Error creating tenant:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
