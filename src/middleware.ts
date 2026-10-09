import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SIGNATURE_SALT = process.env.KHAKI_AUTH_SECRET || 'khaki-travel-os-secure-secret-2026';

function verifyToken(tokenValue?: string): boolean {
  if (!tokenValue) return false;
  try {
    const decoded = JSON.parse(Buffer.from(tokenValue, 'base64').toString('utf-8'));
    return Boolean(decoded && decoded.email && decoded.salt === SIGNATURE_SALT);
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const authCookie = request.cookies.get('khaki_auth_token');
  const isAuthenticated = verifyToken(authCookie?.value);

  // If not authenticated, redirect web users or return 401 for APIs
  if (!isAuthenticated) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/schedule/:path*',
    '/inbox/:path*',
    '/marketing/:path*',
    '/bookings/:path*',
    '/customers/:path*',
    '/tours/:path*',
    '/dispatch/:path*',
    '/manifests/:path*',
    '/guides/:path*',
    '/corporate/:path*',
    '/bespoke/:path*',
    '/finance/:path*',
    '/analytics/:path*',
    '/automations/:path*',
    '/settings/:path*',
    '/international/:path*',
    '/api/((?!auth|webhooks).*)',
  ],
};
