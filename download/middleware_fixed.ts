import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Public routes that don't require authentication
    const publicPaths = [
      '/',           // Landing page
      '/login',      // Login page
      '/register',   // Registration page
      '/portal',     // Sales portal
      '/forgot-password',
      '/reset-password',
      '/terms',      // Terms and conditions
      '/checkout',   // Payment checkout pages
      '/setup',      // Database setup page ← AGREGADO
      '/api/auth',   // Auth API routes
      '/api/seed',   // Seed route (for development)
      '/api/setup',  // Setup API routes ← AGREGADO
      '/api/wipay',  // WiPay webhook
    ];

    // Check if it's a public path or starts with a public path
    const isPublicPath = publicPaths.some((path) => {
      if (path === '/') return pathname === '/';
      return pathname.startsWith(path);
    });

    // Also check for public bakery catalogs: /bakery/[slug]/catalog
    const isPublicCatalog = pathname.match(/^\/bakery\/[^/]+\/catalog/);

    if (isPublicPath || isPublicCatalog) {
      return NextResponse.next();
    }

    // Check if user is authenticated for protected routes
    if (!token) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const userRole = token.role as string;
    const tenantSlug = token.tenantSlug as string | null;
    const industrySlug = token.industrySlug as string | null;
    const tenantStatus = token.tenantStatus as string | null;
    const isTrial = token.isTrial as boolean | null;
    const trialEndsAt = token.trialEndsAt as string | null;

    // Admin routes - only SUPER_ADMIN
    if (pathname.startsWith('/admin') && userRole !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Check tenant status for non-admin users
    if (userRole !== 'SUPER_ADMIN' && tenantStatus) {
      // If tenant is suspended, redirect to suspended page
      if (tenantStatus === 'suspended') {
        const suspendedUrl = new URL('/suspended', req.url);
        return NextResponse.redirect(suspendedUrl);
      }

      // If trial has expired, redirect to activate page
      if (isTrial && trialEndsAt) {
        const trialEnd = new Date(trialEndsAt);
        const now = new Date();
        
        if (now >= trialEnd) {
          const activateUrl = new URL('/activate', req.url);
          return NextResponse.redirect(activateUrl);
        }
      }
    }

    // Industry-specific route protection - ALL 7 INDUSTRIES
    const industryRoutes: Record<string, string> = {
      clinic: '/clinic',
      nurse: '/nurse',
      lawfirm: '/lawfirm',
      beauty: '/beauty',
      bakery: '/bakery',
      pharmacy: '/pharmacy',
      insurance: '/insurance',
    };

    // Check if user is accessing their industry dashboard
    for (const [industry, route] of Object.entries(industryRoutes)) {
      if (pathname.startsWith(route)) {
        // Super admin can access all
        if (userRole === 'SUPER_ADMIN') {
          return NextResponse.next();
        }

        // Check if user's industry matches
        if (industrySlug !== industry) {
          // Redirect to their correct dashboard
          if (industrySlug && industryRoutes[industrySlug]) {
            return NextResponse.redirect(new URL(industryRoutes[industrySlug], req.url));
          }
          return NextResponse.redirect(new URL('/login', req.url));
        }
      }
    }

    // Add tenant info to headers for API requests
    if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth')) {
      const requestHeaders = new Headers(req.headers);
      if (token.tenantId) {
        requestHeaders.set('x-tenant-id', token.tenantId as string);
      }
      requestHeaders.set('x-user-id', token.id as string);
      requestHeaders.set('x-user-role', userRole);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Return true for public paths, otherwise check for token
      authorized: ({ req, token }) => {
        const { pathname } = req.nextUrl;
        
        // Public paths that don't need authentication
        const publicPaths = [
          '/',
          '/login',
          '/register',
          '/portal',
          '/forgot-password',
          '/reset-password',
          '/terms',
          '/checkout',
          '/setup',      // ← AGREGADO
          '/api/auth',
          '/api/seed',
          '/api/setup',  // ← AGREGADO
          '/api/wipay',
        ];

        // Check if it's a public path
        const isPublicPath = publicPaths.some((path) => {
          if (path === '/') return pathname === '/';
          return pathname.startsWith(path);
        });

        // Check for public bakery catalogs
        const isPublicCatalog = pathname.match(/^\/bakery\/[^/]+\/catalog/);

        // Allow public paths without token
        if (isPublicPath || isPublicCatalog) {
          return true;
        }

        // For all other routes, require token
        return !!token;
      },
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - static files
     */
    '/((?!_next/static|_next/image|favicon.ico|public|images|logo\\.svg).*)',
  ],
};
