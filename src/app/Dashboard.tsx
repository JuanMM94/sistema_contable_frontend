'use client';

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@radix-ui/react-navigation-menu';
import styles from './page.module.css';
import Link from 'next/link';
import { navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Splitter } from '@/components/custom/Splitter';
import { CardAccount } from '@/components/custom/CardAccount';
import { ButtonDrawer } from '@/components/custom/DrawerNewMovement';
import MovementsList from '@/components/custom/MovementsList';
import { NewMovementInputT } from '@/lib/schemas';
import { createMovement } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { useSession } from './RouteFetchProvider';
import { ButtonLogout } from '@/components/custom/ButtonLogout';

export default function HomeClient() {
  const { user, loading } = useSession();

  const router = useRouter();
  const onCreated = async (payload: NewMovementInputT) => {
    await createMovement(payload);
    router.refresh();
  };

  return (
    <div className={styles.dashboard}>
      <header className="w-full py-4! flex items-center justify-around border-b-secondary border">
        <div>
          <h1 className="text-primary">
            Sistema Contable
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <p>{user?.email}</p>
          <ButtonLogout />
        </div>
      </header>
      {/* <nav>
        <NavigationMenu>
          <NavigationMenuList className="flex flex-row gap-5">
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link href="/movements">Ver Movimientos</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link href="/exchange">Cambiar Moneda</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </nav> */}
      <div className={styles.home}>
        <h3>Hola, {user?.username ?? 'usuario'}!</h3>
        <div className={styles.information_container}>
          <section className={styles.card_section}>
            {loading ? (
              <></>
            ) : (
              user?.accounts?.map((acc) => <CardAccount key={acc.id} accountInformation={acc} />)
            )}
          </section>
        </div>
        <div className={styles.information_container}>
          <section className={styles.table_section}>
            <h4>Ultimos movimientos</h4>
            <MovementsList initialMovements={user?.movements ?? []} userRole={user?.role}/>
            <ButtonDrawer onCreated={onCreated} />
          </section>
        </div>
      </div>
      <Splitter />
    </div>
  );
}
