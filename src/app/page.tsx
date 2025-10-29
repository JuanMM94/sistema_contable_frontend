import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@radix-ui/react-navigation-menu";
import styles from "./page.module.css";
import Link from "next/link";
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Splitter } from "@/components/custom/Splitter";
import { CardBalace } from "@/components/custom/CardBalance";

export default function Home() {
  return (
    <div className={styles.dashboard}>
      <header className={styles.navbar}>
        <div>
          <h1>BananasPro</h1>
        </div>
        <div>
          <p>Carlitos Salvatrucha</p>
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
      <Splitter/>
      <div className={styles.home}>
        <h3>Hola, Carlitos Salvatrucha!</h3>
        <CardBalace/>
        <CardBalace/>
      </div>
    </div>
  );
}
