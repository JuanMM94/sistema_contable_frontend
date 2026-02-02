'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from '@/providers/RouteFetchProvider';
import { Eye, EyeOff, Loader, MoveLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

export default function Page() {
  const [open, setOpen] = useState(false);
  const { user, loading, changePassword } = useSession();
  const [bothPasswords, setBothPassword] = useState({ currentPassword: '', newPassword: '' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisibility, setPasswordVisibility] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const passwordsMatch =
    bothPasswords.newPassword.length > 0 && bothPasswords.newPassword === confirmPassword;
  const showMismatch = confirmPassword.length > 0 && !passwordsMatch;
  const toggleVisibility = (field: keyof typeof passwordVisibility) => {
    setPasswordVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const infoRows = [
    { label: 'ID', value: user?.id ?? '-' },
    { label: 'Nombre', value: user?.name ?? '-' },
    { label: 'Email', value: user?.email ?? '-' },
    { label: 'Movimientos', value: String(user?.movements?.length ?? 0) },
  ];

  return (
    <div className="lg:w-[70vw] w-[90vw] p-4 flex flex-col gap-8 m-auto">
      <div
        className="flex flex-row items-center gap-2 mb-4 cursor-pointer"
        onClick={() => history.back()}
      >
        <MoveLeft size={24} />
        <h5>Volver</h5>
      </div>
      <h3>Mi perfil</h3>
      <div>
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
              <div className="py-4">
                <section className="grid gap-4 sm:grid-cols-2">
                  {loading ? (
                    <Loader />
                  ) : user?.accounts && user.accounts.length > 0 ? (
                    user.accounts.map((acc) => (
                      <div key={acc.id} className="flex flex-col gap-1">
                        <span className="text-sm opacity-60">Cuenta en {acc.currency}</span>
                        <span className="text-base">
                          Pagado: {acc.paidBalance} {acc.currency}
                        </span>
                        <span className="text-sm opacity-70">
                          Pendiente: {acc.pendingBalance} {acc.currency}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="opacity-60">No hay cuentas disponibles.</p>
                  )}
                </section>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
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
            onSubmit={async (event) => {
              event.preventDefault();
              if (!passwordsMatch) {
                return;
              }
              const response = await changePassword(bothPasswords);
              if (response.success) {
                setOpen(false);
                setBothPassword({ currentPassword: '', newPassword: '' });
              }
              // TOAST HERE LATER
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="current-password">Contraseña actual</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  name="currentPassword"
                  type={passwordVisibility.current ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={bothPasswords.currentPassword}
                  onChange={(e) =>
                    setBothPassword({ ...bothPasswords, currentPassword: e.target.value })
                  }
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  onClick={() => toggleVisibility('current')}
                  aria-label={
                    passwordVisibility.current
                      ? 'Ocultar contraseña actual'
                      : 'Mostrar contraseña actual'
                  }
                >
                  {passwordVisibility.current ? <Eye /> : <EyeOff />}
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">Nueva contraseña</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  name="newPassword"
                  type={passwordVisibility.new ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={bothPasswords.newPassword}
                  onChange={(e) =>
                    setBothPassword({ ...bothPasswords, newPassword: e.target.value })
                  }
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  onClick={() => toggleVisibility('new')}
                  aria-label={
                    passwordVisibility.new ? 'Ocultar nueva contraseña' : 'Mostrar nueva contraseña'
                  }
                >
                  {passwordVisibility.new ? <Eye /> : <EyeOff />}
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Repetir nueva contraseña</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  name="confirmPassword"
                  type={passwordVisibility.confirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10"
                  aria-invalid={showMismatch}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  onClick={() => toggleVisibility('confirm')}
                  aria-label={
                    passwordVisibility.confirm
                      ? 'Ocultar confirmación de contraseña'
                      : 'Mostrar confirmación de contraseña'
                  }
                >
                  {passwordVisibility.confirm ? <Eye /> : <EyeOff />}
                </Button>
              </div>
              {showMismatch ? (
                <p className="text-sm text-red-600">Las contraseñas no coinciden.</p>
              ) : null}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button type="submit" disabled={!passwordsMatch}>
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
