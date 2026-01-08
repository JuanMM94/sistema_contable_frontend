'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import API_BASE from '@/lib/endpoint';
import { isAdmin } from '@/lib/roles';

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    try {
      const res = await fetch(`${API_BASE}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        return setErr('Credenciales inválidas');
      }

      const { data: user } = await res.json();

      if (isAdmin(user?.role)) {
        router.push('/panel/admin');
      } else {
        router.push('/panel');
      }
    } catch {
      setErr('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-border/60 shadow-lg bg-white!">
      <CardHeader>
        <CardTitle className="text-3xl">Ingresá a Sistema Contable</CardTitle>
        <CardDescription>Ingresá, maneja y mirá todas tus transacciones.</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="login-form" onSubmit={onSubmit}>
          <div className="flex flex-col gap-6">
            {/* User Email */}
            <div className="grid gap-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="pedro@correo.com"
                required
                disabled={loading}
              />
            </div>
            {/* User Password */}
            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="********"
                required
                disabled={loading}
              />
            </div>
            {err ? <p className="text-sm text-red-600">{err}</p> : null}
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button form="login-form" type="submit" className="w-full" disabled={loading}>
          {loading ? 'Ingresando…' : 'Entrar'}
        </Button>
        {/* <div className="flex items-center justify-between text-sm">
          <Button type="button" variant="link" size="sm" className="px-0 font-medium text-primary">
            Olvidé mi contraseña
          </Button>
        </div> */}
      </CardFooter>
    </Card>
  );
}
