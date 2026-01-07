'use client';

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@radix-ui/react-navigation-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSession } from '../../providers/RouteFetchProvider';
import '../globals.css';
import { navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import API_BASE from '@/lib/endpoint';

export default function PanelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = useSession();
  const router = useRouter();

  return (
    <div>
      <header className="w-[70vw] m-auto py-4! flex items-center justify-between">
        <div>
          <h1 className="text-primary">Sistema Contable</h1>
        </div>
        <div className="flex items-center gap-4">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Avatar className='cursor-pointer'>
                <AvatarFallback className='bg-secondary text-primary font-bold'>{user?.email.slice(0, 2)}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40" align="end">
              <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem className='cursor-pointer' onClick={() => router.push('/panel/perfil')}>
                  Perfil
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className='cursor-pointer' onClick={async () => {
                  const res = await fetch(`${API_BASE}/users/logout`, {
                    method: 'POST',
                    credentials: 'include',
                  });
                  console.log('Sesión cerrada:', res);
                  if(res.ok) router.refresh();
              }}>
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
