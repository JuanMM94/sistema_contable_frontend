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
import { CardBalance } from '@/components/custom/CardBalance';
import { ButtonDrawer } from '@/components/custom/DrawerNewMovement';
import type { ServerMovement, ServerUser } from '@/types/movement';
import MovementsList from '@/components/custom/MovementsList';
import { NewMovementInputT } from '@/lib/schemas';
import { createMovement } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function HomeClient({ userMovements, userInformation }: { userMovements: ServerMovement[], userInformation: ServerUser }) {
  const [movementsList] = useState<ServerMovement[]>(userMovements ?? []);

  const router = useRouter();
  const onCreated = async (payload: NewMovementInputT) => {
    await createMovement(payload);
    router.refresh();
  };

  return (
    <div className={styles.dashboard}>
      <header className={styles.navbar}>
        <div>
          <h1>Sistema Contable</h1>
        </div>
        <div>
          <p>{userInformation.username}</p>
        </div>
      </header>
      <nav>
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
      </nav>
      <Splitter />
      <div className={styles.home}>
        <h3>Hola, Pablo Gimenez! (Admin)</h3>
        <div className={styles.information_container}>
          <section className={styles.card_section}>
            <CardBalance />
            <CardBalance />
          </section>
        </div>
        <div className={styles.information_container}>
          <section className={styles.table_section}>
            <h4>Últimos movimientos</h4>
            <MovementsList initialMovements={movementsList} />
            <ButtonDrawer onCreated={onCreated} />
          </section>
        </div>
      </div>
      <Splitter />
    </div>
  );
}
