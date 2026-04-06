import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

// Security: Only allow in development or with proper authentication
function isAllowed(request: Request): boolean {
  // Allow in development
  if (process.env.NODE_ENV === 'development') return true;

  // In production, require a secret header
  const authHeader = request.headers.get('x-diagnostic-secret');
  const expectedSecret = process.env.DIAGNOSTIC_SECRET || 'aethel-diagnostic-2024';
  return authHeader === expectedSecret;
}

export async function GET(request: Request) {
  // Security check
  if (!isAllowed(request)) {
    return NextResponse.json({
      error: 'Unauthorized',
      message: 'Diagnostic endpoint requires authentication in production',
    }, { status: 401 });
  }

  try {
    const startTime = Date.now();

    // Check all critical environment variables (without exposing secrets)
    const envStatus = {
      // Database
      DATABASE_URL: {
        set: !!process.env.DATABASE_URL,
        isSupabase: process.env.DATABASE_URL?.includes('supabase') || false,
        isNeon: process.env.DATABASE_URL?.includes('neon.tech') || false,
      },

      // Auth
      NEXTAUTH_SECRET: {
        set: !!process.env.NEXTAUTH_SECRET,
        length: process.env.NEXTAUTH_SECRET?.length || 0,
      },
      NEXTAUTH_URL: {
        set: !!process.env.NEXTAUTH_URL,
        value: process.env.NEXTAUTH_URL || 'NOT SET',
      },

      // Email
      RESEND_API_KEY: {
        set: !!process.env.RESEND_API_KEY,
        configured: process.env.RESEND_API_KEY?.startsWith('re_') || false,
      },
      EMAIL_FROM: {
        set: !!process.env.EMAIL_FROM,
      },

      // Runtime
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_URL: process.env.VERCEL_URL || 'not on vercel',
    };

    // Test database connection
    let dbStatus = { connected: false, error: null as string | null };
    let userCount = 0;

    try {
      await db.$queryRaw`SELECT 1`;
      dbStatus.connected = true;
      userCount = await db.systemUser.count();
    } catch (dbError) {
      dbStatus.error = dbError instanceof Error ? dbError.message : 'Unknown DB error';
    }

    // Test bcrypt functionality
    let bcryptStatus = { working: false, error: null as string | null };
    try {
      const testHash = await bcrypt.hash('test', 10);
      const testMatch = await bcrypt.compare('test', testHash);
      bcryptStatus.working = testMatch;
    } catch (bcryptError) {
      bcryptStatus.error = bcryptError instanceof Error ? bcryptError.message : 'Unknown bcrypt error';
    }

    // Get admin user details (AETHEL)
    const adminUser = await db.systemUser.findUnique({
      where: { email: 'admin@aethel.tt' },
      select: {
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      status: 'diagnostic_complete',
      timestamp: new Date().toISOString(),
      responseTimeMs: responseTime,

      environment: envStatus,

      database: {
        status: dbStatus.connected ? 'connected' : 'error',
        error: dbStatus.error,
        totalUsers: userCount,
      },

      adminUser: adminUser ? {
        exists: true,
        email: adminUser.email,
        role: adminUser.role,
        isActive: adminUser.isActive,
      } : { exists: false },

      bcrypt: bcryptStatus,

      system: {
        name: 'AETHEL OS',
        version: '1.0.0',
        branding: 'AETHEL',
      },
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// POST endpoint to test authentication directly
export async function POST(request: Request) {
  // Security check
  if (!isAllowed(request)) {
    return NextResponse.json({
      error: 'Unauthorized',
    }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password required',
      }, { status: 400 });
    }

    // Find user
    const user = await db.systemUser.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
      }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({
        success: false,
        error: 'User is not active',
      }, { status: 401 });
    }

    // Test password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    return NextResponse.json({
      success: passwordMatch,
      error: passwordMatch ? null : 'Password does not match',
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
