import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AuthService } from './src/lib/auth';

// Routes that don't require authentication
const publicRoutes = ['/login', '/api/auth/login', '/api/test'];

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/users',
  '/roles',
  '/permissions',
  '/profile',
  '/customers',
  '/products',
  '/services',
  '/quotations',
  '/invoices',
  '/delivery-notes',
  '/reports'
];

// API routes that require authentication
const protectedApiRoutes = [
  '/api/users',
  '/api/roles',
  '/api/permissions',
  '/api/customers',
  '/api/products',
  '/api/services',
  '/api/quotations',
  '/api/invoices',
  '/api/delivery-notes',
  '/api/auth/me',
  '/api/auth/logout',
  '/api/auth/change-password'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Check if it's a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  const isProtectedApiRoute = protectedApiRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  if (isProtectedRoute || isProtectedApiRoute) {
    // Check for authentication
    const user = await AuthService.getCurrentUser(request);
    
    if (!user) {
      // For API routes, return 401
      if (isProtectedApiRoute) {
        return NextResponse.json(
          { error: 'Unauthorized - Please login' },
          { status: 401 }
        );
      }
      
      // For page routes, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If accessing root, redirect to dashboard if authenticated
  if (pathname === '/') {
    const user = await AuthService.getCurrentUser(request);
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
