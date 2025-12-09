import { NextRequest, NextResponse } from 'next/server';

const PROTECTED = ['/panel'];

export async function proxy(request: NextRequest) {
  if (!PROTECTED.some((p) => request.nextUrl.pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Build the full URL to the local API proxy
  const sessionUrl = `${request.nextUrl.origin}/api/session`;
  const cookieHeader = request.headers.get('cookie') ?? '';

  const res = await fetch(sessionUrl, {
    method: 'GET',
    headers: { cookie: cookieHeader },
    credentials: 'include',
    // next/fetch inside middleware won't forward cookies automatically,
    // so include the header above.
  });
  if (res.ok) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = '/';
  return NextResponse.redirect(url);
}

export const config = { matcher: ['/panel/:path*'] };
