'use server';

import { revalidateTag } from 'next/cache';
import { NewMovementInputT, UserLogin, UserLoginResponse } from './schemas';
import API_BASE from './endpoint';

export async function createMovement(data: NewMovementInputT) {
  const res = await fetch(`${API_BASE}/movements`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(data),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to create movement');
  revalidateTag('movements', 'max');
}

export async function userLogin(
  data: UserLogin,
): Promise<{ ok: boolean; status: number; data: UserLoginResponse } | null> {
  const res = await fetch(`${API_BASE}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      email: data.email,
      password: data.password,
    }),
  });

  const setCookies = (res).headers?.getSetCookie?.() ?? [];
  console.log('Set-Cookie array:', setCookies);
  try {
    const json: UserLoginResponse = await res.json();
    return { ok: res.ok, status: res.status, data: json };
  } catch {
    return null;
  }
}
