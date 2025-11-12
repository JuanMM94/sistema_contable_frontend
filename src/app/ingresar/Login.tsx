'use client';

import Link from 'next/link';
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
import { userLogin } from '@/lib/actions';
import { storeAuthToken } from '@/lib/token';

export default function LoginPage() {
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
      const userStatus = await userLogin({ email, password });

      if (!userStatus || !userStatus.data?.token) {
        setErr("Error al ingresar, porfavor intenta nuevamente");
        return;
      }

      storeAuthToken(userStatus.data.token);

      console.log(userStatus)

      router.replace('/panel');
      router.refresh();
    } catch {
      setErr('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="border-border/60 shadow-lg p-6! bg-white!">
          <CardHeader>
            <CardTitle className="text-3xl">Ingresá a Sistema Contable</CardTitle>
            <CardDescription>Ingresá, maneja y mirá todas tus transacciones.</CardDescription>
          </CardHeader>

          <CardContent>
            <form className="space-y-5!" onSubmit={onSubmit}>
              <div className="space-y-2!">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  className="p-1!"
                  id="email"
                  name="email"
                  type="email"
                  placeholder="pedro@correo.com"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <Label htmlFor="password">Contraseña</Label>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="px-0 font-medium text-primary"
                  >
                    Olvidé mi contraseña
                  </Button>
                </div>
                <Input
                  className="p-1!"
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

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Ingresando…' : 'Entrar'}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex-col gap-4">
            <Button variant="link" className="px-0" asChild>
              <Link href="/ayuda/soporte">Necesito ayuda del soporte</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
