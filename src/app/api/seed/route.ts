import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Security: Only allow in development or with proper authentication
function isAllowed(request: Request): boolean {
  // Allow in development
  if (process.env.NODE_ENV === 'development') return true;

  // In production, require a secret header
  const authHeader = request.headers.get('x-seed-secret');
  const expectedSecret = process.env.SEED_SECRET || 'aethel-seed-protected';
  return authHeader === expectedSecret;
}

// GET - System Status Check (Protected)
export async function GET(request: Request) {
  // Security check
  if (!isAllowed(request)) {
    return NextResponse.json({
      status: 'protected',
      message: 'This endpoint requires authentication in production',
      hint: 'Add x-seed-secret header with the correct value',
    }, { status: 401 });
  }

  try {
    console.log('[SEED] Starting system check...');

    // Check environment variables (safe)
    const envStatus = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET',
      NODE_ENV: process.env.NODE_ENV,
    };

    // Check database connection
    let dbStatus = { connected: false, error: null as string | null };
    try {
      await db.$queryRaw`SELECT 1`;
      dbStatus.connected = true;
    } catch (e) {
      dbStatus.error = e instanceof Error ? e.message : 'Unknown DB error';
    }

    // Count records
    let counts = { users: 0, tenants: 0, industries: 0, plans: 0 };

    if (dbStatus.connected) {
      counts.users = await db.systemUser.count();
      counts.tenants = await db.tenant.count();
      counts.industries = await db.industry.count();
      counts.plans = await db.plan.count();
    }

    // Check if admin exists
    const adminExists = await db.systemUser.findUnique({
      where: { email: 'admin@aethel.tt' },
      select: { email: true, role: true, isActive: true },
    });

    return NextResponse.json({
      status: 'SYSTEM_STATUS',
      timestamp: new Date().toISOString(),
      environment: envStatus,
      database: {
        connected: dbStatus.connected,
        error: dbStatus.error,
        counts,
      },
      adminUser: adminExists ? {
        exists: true,
        email: adminExists.email,
        role: adminExists.role,
        isActive: adminExists.isActive,
      } : { exists: false },
      system: {
        name: 'AETHEL OS',
        branding: 'AETHEL',
      },
    });
  } catch (error) {
    console.error('[SEED] Error:', error);
    return NextResponse.json(
      {
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST - Run Seed (Protected)
export async function POST(request: Request) {
  // Security check
  if (!isAllowed(request)) {
    return NextResponse.json({
      status: 'protected',
      message: 'This endpoint requires authentication in production',
    }, { status: 401 });
  }

  // In production, this should not be accessible without proper auth
  // Use the setup-aethel endpoint instead
  return NextResponse.json({
    status: 'DISABLED',
    message: 'Use /api/auth/setup-aethel endpoint for initial setup',
    setupEndpoint: '/api/auth/setup-aethel',
  });
}
