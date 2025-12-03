'use client';

import { ButtonLogout } from '@/components/custom/ButtonLogout';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@radix-ui/react-navigation-menu';
import { useSession } from '../../providers/RouteFetchProvider';
import '../globals.css';
import { navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function PanelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = useSession();

  return (
    <div>
      <header className="w-full py-4! flex items-center justify-around">
        <div>
          <h1 className="text-primary">Sistema Contable</h1>
        </div>
        <div className="flex items-center gap-4">
          <p>{user?.email}</p>
          <ButtonLogout />
        </div>
      </header>
      {user?.role == 'ADMIN' ? (
        <nav className="w-full flex items-center justify-around border-b-secondary border-t-secondary border">
          <NavigationMenu>
            <NavigationMenuList className="flex flex-row">
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), 'px-3!')}>
                  <Link href="/panel">Inicio</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), 'px-3!')}>
                  <Link href="/panel/admin">Panel Admin</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), 'px-3!')}>
                  <Link href="/panel/admin/nuevo-movimiento">Nuevo movimiento</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), 'px-3!')}>
                  <Link href="/panel/admin/nuevo-miembro">Agregar más miembros</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>
      ) : (
        ''
      )}
      {children}
    </div>
  );
}
