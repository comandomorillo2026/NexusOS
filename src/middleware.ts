import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ============================================================================
// NEXUSOS MIDDLEWARE - ACCESO DIRECTO SIN AUTENTICACIÓN
// ============================================================================

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Log para debugging
  console.log(`[MIDDLEWARE] Access: ${pathname}`);

  // Headers de seguridad básicos
  const response = NextResponse.next();
  
  // Headers de seguridad
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // CORS para APIs
  if (pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|images|logo\\.svg).*)',
  ],
};
