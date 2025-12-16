import type { Metadata } from 'next';
import Login from '@/components/custom/Login';

export const metadata: Metadata = {
  title: 'Ingresar',
  description: 'Accede al panel ingresando con tu usuario y contraseña.',
};

export default function Page() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md">
        <Login />
      </div>
    </section>
  );
}
