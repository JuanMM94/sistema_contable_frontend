'use server';

import { revalidateTag } from 'next/cache';
import { NewMovementInputT, UserLogin, UserLoginResponse } from './schemas';

export async function createMovement(data: NewMovementInputT) {
  const res = await fetch(`${process.env.BACKEND_API_DEV!}/api/v1/movements`, {
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
  const res = await fetch(`${process.env.BACKEND_API_DEV}/api/v1/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      email: data.email,
      password: data.password,
    }),
  });
  try {
    const json: UserLoginResponse = await res.json();
    return { ok: res.ok, status: res.status, data: json };
  } catch {
    return null;
  }
}
