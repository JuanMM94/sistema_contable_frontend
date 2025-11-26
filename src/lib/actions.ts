'use server';

import { UserLogin, UserLoginResponse } from './schemas';
import API_BASE from './endpoint';


export async function userLogin(
  data: UserLogin,
): Promise<{ ok: boolean; status: number; data: UserLoginResponse } | null> {
  const res = await fetch(`${API_BASE}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
