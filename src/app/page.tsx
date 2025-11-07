'use client';

import { useState } from 'react';
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
import { CardBalace } from '@/components/custom/CardBalance';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ButtonDrawer } from '@/components/custom/DrawerNewMovement';
import type { Invoice } from '@/types/invoice';
import { invoices } from '@/mock/invoices';
import { formatCurrencyValue } from '@/lib/utils';
import { formatShortDate } from '@/lib/date_utils';
import { Button } from '@/components/ui/button';
import { PAYMENT_METHOD_OPTIONS, STATUS_OPTIONS } from '@/lib/global_variables';

const paymentMethodLabelMap = new Map(
  PAYMENT_METHOD_OPTIONS.map(({ value, label }) => [value, label] as const),
);

const paymentStatusLabelMap = new Map(
  STATUS_OPTIONS.map(({ value, label }) => [value, label] as const),
);

const getPaymentMethodLabel = (value: string) => paymentMethodLabelMap.get(value) ?? value;

const getPaymentStatusLabel = (value: string) => paymentStatusLabelMap.get(value) ?? value;

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
      <Splitter />
      <div className={styles.home}>
        <h3>Hola, Carlitos Salvatrucha! (Usuario)</h3>
        <div className={styles.information_container}>
          <section className={styles.card_section}>
            <CardBalace />
            <CardBalace />
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
                {invoiceList.map((invoice) => {
                  const paymentStatusLabel = getPaymentStatusLabel(invoice.paymentStatus);
                  const paymentMethodLabel = getPaymentMethodLabel(invoice.paymentMethod);

                  return (
                    <TableRow key={invoice.invoice} className="cursor-pointer">
                      <TableCell className="font-medium">{invoice.invoice}</TableCell>
                      <TableCell className="font-medium">
                        {formatShortDate(new Date(invoice.date))}
                      </TableCell>
                      <TableCell>{paymentStatusLabel}</TableCell>
                      <TableCell>{paymentMethodLabel}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrencyValue(invoice.totalAmount)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </section>
        </div>
      </div>
      <Splitter />
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
                  <TableHead>Pagador</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Metodo</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-center" colSpan={2}>
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoiceList.map((invoice) => {
                  const paymentStatusLabel = getPaymentStatusLabel(invoice.paymentStatus);
                  const paymentMethodLabel = getPaymentMethodLabel(invoice.paymentMethod);

                  return (
                    <TableRow key={invoice.invoice} className="cursor-pointer">
                      <TableCell className="font-medium">{invoice.invoice}</TableCell>
                      <TableCell className="font-medium">
                        {formatShortDate(new Date(invoice.date))}
                      </TableCell>
                      <TableCell className="font-medium">{invoice.payer}</TableCell>
                      <TableCell>{paymentStatusLabel}</TableCell>
                      <TableCell>{paymentMethodLabel}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrencyValue(invoice.totalAmount)}
                      </TableCell>
                      <TableCell className="text-center text-blue-600">
                        <Button variant="ghost" className="cursor-pointer">
                          Editar
                        </Button>
                      </TableCell>
                      <TableCell className="text-center text-red-400">
                        <Button variant="ghost" className="cursor-pointer">
                          Borrar
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <ButtonDrawer setInvoiceList={setInvoiceList} />
          </section>
        </div>
      </div>
      <Splitter />
    </div>
  );
}
