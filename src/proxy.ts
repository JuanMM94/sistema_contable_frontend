import { NextRequest, NextResponse } from 'next/server';
import API_BASE from './lib/endpoint';

const PROTECTED = ['/panel'];

export async function proxy(request: NextRequest) {

  console.log("proxy run")
  if (!PROTECTED.some((p) => request.nextUrl.pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const cookieHeader = request.headers.get('cookie') ?? '';

  console.log('middleware cookies:', cookieHeader);

  const res = await fetch(`${API_BASE}/session`, {
    method: 'GET',
    headers: { cookie: cookieHeader },
    credentials: "include"
    // next/fetch inside middleware won’t forward cookies automatically,
    // so include the header above.
  });

  console.log(res)

  if (res.ok) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = '/ingresar';
  return NextResponse.redirect(url);
}

export const config = { matcher: ['/panel/:path*'] };
