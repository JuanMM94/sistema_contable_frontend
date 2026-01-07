'use client';

import styles from '../../page.module.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from '@/providers/RouteFetchProvider';
import { MoveLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Page() {
  const { user, loading } = useSession();

  const infoRows = [
    { label: 'ID', value: user?.id ?? '-' },
    { label: 'Nombre', value: user?.name ?? '-' },
    { label: 'Email', value: user?.email ?? '-' },
    { label: 'Movimientos', value: String(user?.movements?.length ?? 0) },
  ];

  const changePassword = async (currentPassword: string, newPassword: string) => {

  }

  return (
    <div className={styles.dashboard}>
      <div className="w-[70vw] p-4 flex flex-col gap-8">
        <div
          className="flex flex-row items-center gap-2 mb-4 cursor-pointer"
          onClick={() => history.back()}
        >
          <MoveLeft size={24} />
          <h5>Volver</h5>
        </div>
        <h3>Mi perfil</h3>
        <div className={styles.information_container}>
          <section className="w-full">
            <Card>
              <CardHeader>
                <CardTitle>Información de la cuenta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {infoRows.map((row) => (
                    <div key={row.label} className="flex flex-col gap-1">
                      <span className="text-sm opacity-60">{row.label}</span>
                      <span className="text-base">{row.value}</span>
                    </div>
                  ))}
                </div>
                <div className='py-4'>
                    <section  className="grid gap-4 sm:grid-cols-2">
                      {loading ? (
                        <></>
                      ) : user?.accounts && user.accounts.length > 0 ? (
                        user.accounts.map((acc) => (
                          <div key={acc.id} className="flex flex-col gap-1">
                            <span className="text-sm opacity-60">Cuenta en {acc.currency}</span>
                            <span className="text-base">{acc.amount}</span>
                          </div>
                        ) )
                      ) : (
                        <p className="opacity-60">No hay cuentas disponibles.</p>
                      )}
                    </section>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-[20vw]" variant="outline">
                Cambiar contraseña
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cambiar contraseña</DialogTitle>
                <DialogDescription>
                  Ingresá tu contraseña actual y la nueva para actualizarla.
                </DialogDescription>
              </DialogHeader>
              <form
                className="grid gap-4"
                onSubmit={(event) => {
                  event.preventDefault();
                }}
              >
                <div className="grid gap-2">
                  <Label htmlFor="current-password">Contraseña actual</Label>
                  <Input
                    id="current-password"
                    name="currentPassword"
                    type="password"
                    autoComplete="current-password"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-password">Nueva contraseña</Label>
                  <Input
                    id="new-password"
                    name="newPassword"
                    type="password"
                    autoComplete="new-password"
                  />
                </div>
                <DialogFooter>
                  <Button type="submit">Guardar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
      </div>
    </div>
  );
}
