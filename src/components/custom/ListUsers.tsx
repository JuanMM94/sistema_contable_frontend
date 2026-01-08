'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import styles from '../../app/page.module.css';
// import { Button } from '../ui/button';
import { currencyFormatter } from '@/lib/utils';
import { useAdminContext } from '@/providers/AdminFetchProvider';

export default function ListUsers() {
  const { users } = useAdminContext();

  return (
    <section className={styles.table_section}>
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Id</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-right">Disponible en USD</TableHead>
            <TableHead className="text-right">Disponible en ARS</TableHead>
            {/* <TableHead className="text-center" colSpan={3}>
              Acciones
            </TableHead> */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users!.map((user) => {
            return (
              <TableRow key={user.id} className="cursor-pointer">
                <TableCell className="font-medium">{user.id.slice(0, 8)}...</TableCell>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="font-medium">{user.email}</TableCell>
                <TableCell className="text-right">
                  {currencyFormatter(
                    user.accounts?.find((acc) => acc.currency === 'USD')?.amount ?? 0,
                    'es-AR',
                    'USD',
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {currencyFormatter(
                    user.accounts?.find((acc) => acc.currency === 'ARS')?.amount ?? 0,
                    'es-AR',
                    'ARS',
                  )}
                </TableCell>
                {/* <TableCell className="text-center" colSpan={3}>
                  <div className="flex justify-center gap-2">
                    <Button variant="ghost" className="cursor-pointer text-blue-600 p-1!">
                      Movimientos
                    </Button>
                    <Button variant="ghost" className="cursor-pointer text-blue-600 p-1!">
                      Editar
                    </Button>
                    <Button variant="ghost" className="cursor-pointer text-red-400 p-1!">
                      Borrar
                    </Button>
                  </div>
                </TableCell> */}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </section>
  );
}
