import { NextRequest, NextResponse } from 'next/server';
import API_BASE from './lib/endpoint';

const PROTECTED = ['/panel'];

export async function proxy(request: NextRequest) {
  if (!PROTECTED.some((p) => request.nextUrl.pathname.startsWith(p))) {
    return NextResponse.next();
  }
  const cookieHeader = request.headers.get('cookie') ?? '';
  const res = await fetch(`${API_BASE}/session`, {
    method: 'GET',
    headers: { cookie: cookieHeader },
    credentials: "include"
  });
  if (res.ok) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = '/';
  return NextResponse.redirect(url);
}

export const config = { matcher: ['/panel/:path*'] };
