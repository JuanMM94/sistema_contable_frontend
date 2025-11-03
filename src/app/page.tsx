"use client";

import { useState } from "react";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@radix-ui/react-navigation-menu";
import styles from "./page.module.css";
import Link from "next/link";
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Splitter } from "@/components/custom/Splitter";
import { CardBalace } from "@/components/custom/CardBalance";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ButtonDrawer } from "@/components/custom/DrawerNewMovement";
import type { Invoice } from "@/types/invoice";

const invoices: Invoice[] = [
  {
    date:"18/10",
    client: "Pablo Perez",
    concept: "Cobranza",
    invoice: "INV001",
    paymentStatus: "Pago",
    totalAmount: "$1.250.000",
    isInput: true,
    paymentMethod: "Efectivo",
  },
  {
    date:"18/10",
    client: "Raul Gimenez",
    concept: "Cobranza",
    invoice: "INV002",
    paymentStatus: "Pendiente",
    totalAmount: "$150.000",
    isInput: false,
    paymentMethod: "Efectivo",
  },
  {
    date:"18/10",
    client: "Marta Maradona",
    concept: "Cobranza",
    invoice: "INV003",
    paymentStatus: "No pago",
    totalAmount: "$350.000",
    isInput: true,
    paymentMethod: "Transferencia",
  },
  {
    date:"18/10",
    client: "Pablo Perez",
    concept: "Cobranza",
    invoice: "INV004",
    paymentStatus: "Pago",
    totalAmount: "$450.000",
    isInput: true,
    paymentMethod: "Efectivo",
  },
  {
    date:"18/10",
    client: "Marta Maradona",
    concept: "Cobranza",
    invoice: "INV005",
    paymentStatus: "Pago",
    totalAmount: "$550.000",
    isInput: true,
    paymentMethod: "Efectivo",
  },
  {
    date:"18/10",
    client: "Juan Miguel",
    concept: "Cobranza",
    invoice: "INV006",
    paymentStatus: "Pendiente",
    totalAmount: "$200.000",
    isInput: true,
    paymentMethod: "Transferencia",
  },
  {
    date:"18/10",
    client: "Marta Maradona",
    concept: "Cobranza",
    invoice: "INV007",
    paymentStatus: "No pago",
    totalAmount: "$300.000",
    isInput: true,
    paymentMethod: "Efectivo",
  },
]

export default function Home() {
  const [invoiceList, setInvoiceList] = useState<Invoice[]>(invoices);

  return (
    <div className={styles.dashboard}>
      <header className={styles.navbar}>
        <div>
          <h1>BananasPro</h1>
        </div>
        <div>
          <p>PABLO PEREZ</p>
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
        <h3>Hola, Carlitos Salvatrucha! (Usuario)</h3>
        <div className={styles.information_container}>
          <section className={styles.card_section}>
            <CardBalace/>
            <CardBalace/>
          </section>
          <section className={styles.table_section}>
            <Table className="w-full">
              <TableCaption>Ultimas transacciones realizadas</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Id de factura</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Metodo</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoiceList.map((invoice) => (
                  <TableRow key={invoice.invoice} className="cursor-pointer">
                    <TableCell className="font-medium">{invoice.invoice}</TableCell>
                    <TableCell className="font-medium">{invoice.date}</TableCell>
                    <TableCell>{invoice.paymentStatus}</TableCell>
                    <TableCell>{invoice.paymentMethod}</TableCell>
                    <TableCell className="text-right">{invoice.totalAmount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>
        </div>
      </div>
      <Splitter/>
      <div className={styles.home}>
        <h3>Hola, Pablo Gimenez! (Admin)</h3>
        <div className={styles.information_container}>
          <section className={styles.table_section}>
            <Table className="w-full">
              <TableCaption>Ultimos movimientos</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Id de factura</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Metodo</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoiceList.map((invoice) => (
                  <TableRow key={invoice.invoice} className="cursor-pointer">
                    <TableCell className="font-medium">{invoice.invoice}</TableCell>
                    <TableCell className="font-medium">{invoice.date}</TableCell>
                    <TableCell>{invoice.paymentStatus}</TableCell>
                    <TableCell>{invoice.paymentMethod}</TableCell>
                    <TableCell className="text-right">{invoice.totalAmount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <ButtonDrawer invoiceAction={setInvoiceList} />
          </section>
        </div>
      </div>
      <Splitter/>
    </div>
  );
}
