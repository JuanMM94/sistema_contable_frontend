import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const AUTH_COOKIE = 'auth';
const PUBLIC_PATH_PREFIXES = ['/ingresar', '/api', '/_next', '/favicon.ico', '/robots.txt'];

export function proxy(request: NextRequest) {
  console.log('Proxy running');

  const { pathname } = request.nextUrl;
  const isPublicRoute = PUBLIC_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  const hasAuthCookie = request.cookies.get(AUTH_COOKIE)?.value?.length;

  if (hasAuthCookie) {
    return NextResponse.next();
  }

  const backendBase = process.env.BACKEND_API?.replace(/\/$/, '');
  const fallbackTarget = `${request.nextUrl.origin}/ingresar`;
  const redirectTarget = backendBase ? `${backendBase}/v1/api/ingresar` : fallbackTarget;

  return NextResponse.redirect(redirectTarget);
}

export const config = {
  matcher: ['/(.*)'],
};

export default proxy;
