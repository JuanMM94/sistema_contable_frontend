import type { Metadata } from 'next';
import LoginPage from './(ingresar)/Login';

export const metadata: Metadata = {
  title: 'Ingresar',
  description: 'Accede al panel ingresando con tu usuario y contraseña.',
};

export default function Page() {
  return <LoginPage />;
}
