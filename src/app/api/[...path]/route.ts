import { NextRequest, NextResponse } from 'next/server';

// Backend API URL (server-side only, not exposed to client)
const BACKEND_URL =
  process.env.NODE_ENV === 'development' ? process.env.BACKEND_API_DEV : process.env.BACKEND_API;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxyRequest(request, path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxyRequest(request, path, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxyRequest(request, path, 'PUT');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxyRequest(request, path, 'PATCH');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxyRequest(request, path, 'DELETE');
}

async function proxyRequest(request: NextRequest, path: string[], method: string) {
  if (!BACKEND_URL) {
    return NextResponse.json({ error: 'Backend URL not configured' }, { status: 500 });
  }

  const backendPath = `${path.join('/')}${request.nextUrl.searchParams.toString().length ? `?${request.nextUrl.searchParams.toString()}` : ''}`;
  const backendUrl = `${BACKEND_URL}/${backendPath}`;

  console.log('NextRequest: ', request.nextUrl.searchParams.toString().length);
  console.log('paths: ', backendPath);
  console.log('BACKEND: ', backendUrl);

  try {
    // Get the request body if present
    const body = method !== 'GET' && method !== 'DELETE' ? await request.text() : undefined;

    // Forward the request to the backend
    const backendResponse = await fetch(backendUrl, {
      method,
      headers: {
        'Content-Type': request.headers.get('content-type') || 'application/json',
        // Forward cookies from the incoming request to backend
        cookie: request.headers.get('cookie') || '',
      },
      body,
      credentials: 'include',
    });

    // Get response body
    const responseBody = await backendResponse.text();

    // Create response with same status and body
    const response = new NextResponse(responseBody, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: {
        'Content-Type': backendResponse.headers.get('content-type') || 'application/json',
      },
    });

    // Forward Set-Cookie headers from backend to client
    const setCookieHeaders = backendResponse.headers.getSetCookie();
    setCookieHeaders.forEach((cookie) => {
      response.headers.append('Set-Cookie', cookie);
    });

    return response;
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Failed to connect to backend server' }, { status: 502 });
  }
}
