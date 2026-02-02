import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { RouteFetchProvider } from '@/providers/RouteFetchProvider';
import { Toaster } from '@/components/ui/sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Sistema Contable',
  description:
    'Gestiona tus movimientos financieros, cuentas y transacciones de forma simple y segura.',
  icons: {
    icon: '/favicon.svg?v=2',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="w-[100vw]">
      <body className={`${geistSans.variable} ${geistMono.variable} h-screen`}>
        <RouteFetchProvider>{children}</RouteFetchProvider>
        <Toaster theme="light" />
      </body>
    </html>
  );
}
