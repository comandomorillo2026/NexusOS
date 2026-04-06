import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Security: Only allow in development or with proper authentication
function isAllowed(request: Request): boolean {
  // Allow in development
  if (process.env.NODE_ENV === 'development') return true;

  // In production, require a secret header
  const authHeader = request.headers.get('x-debug-secret');
  const expectedSecret = process.env.DEBUG_SECRET || 'aethel-debug-2024';
  return authHeader === expectedSecret;
}

export async function GET(request: Request) {
  // Security check
  if (!isAllowed(request)) {
    return NextResponse.json({
      status: 'protected',
      message: 'Debug endpoint requires authentication in production',
    }, { status: 401 });
  }

  try {
    // Verify database connection
    const userCount = await db.systemUser.count();
    const adminUser = await db.systemUser.findUnique({
      where: { email: 'admin@aethel.tt' },
      select: { email: true, role: true, isActive: true }
    });

    // Check environment variables (without exposing secrets)
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET',
      RESEND_API_KEY: !!process.env.RESEND_API_KEY,
      EMAIL_FROM: process.env.EMAIL_FROM || 'NOT SET',
    };

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      system: {
        name: 'AETHEL OS',
        environment: process.env.NODE_ENV,
      },
      database: {
        connected: true,
        userCount,
        adminExists: !!adminUser,
        adminEmail: adminUser?.email || null,
        adminActive: adminUser?.isActive || false,
      },
      environment: envCheck,
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
