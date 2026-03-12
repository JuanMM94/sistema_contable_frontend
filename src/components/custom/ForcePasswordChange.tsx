'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type ForcePasswordChangeProps = {
  open: boolean;
  onPasswordChanged: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<{
    success: boolean;
    message: string;
  }>;
};

export function ForcePasswordChange({ open, onPasswordChanged }: ForcePasswordChangeProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const showMismatch = confirmPassword.length > 0 && !passwordsMatch;
  const isPasswordValid = newPassword.length >= 8;
  const showInvalidLength = newPassword.length > 0 && !isPasswordValid;

  const toggleVisibility = (field: keyof typeof passwordVisibility) => {
    setPasswordVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!passwordsMatch) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!isPasswordValid) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await onPasswordChanged(currentPassword, newPassword);

      if (result.success) {
        // Reset form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setError(null);
      } else {
        setError(result.message);
      }
    } catch {
      setError('Error al cambiar la contraseña. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        showCloseButton={false}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Cambio de contraseña requerido</DialogTitle>
          <DialogDescription>
            Tu contraseña fue restablecida por un administrador. Por seguridad, debes cambiarla
            antes de continuar.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          {/* Current Password */}
          <div className="grid gap-2">
            <Label htmlFor="current-password">Contraseña temporal</Label>
            <div className="relative">
              <Input
                id="current-password"
                name="currentPassword"
                type={passwordVisibility.current ? 'text' : 'password'}
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="pr-10"
                required
                disabled={isSubmitting}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute right-1 top-1/2 -translate-y-1/2"
                onClick={() => toggleVisibility('current')}
                aria-label={
                  passwordVisibility.current
                    ? 'Ocultar contraseña temporal'
                    : 'Mostrar contraseña temporal'
                }
                disabled={isSubmitting}
              >
                {passwordVisibility.current ? <Eye /> : <EyeOff />}
              </Button>
            </div>
          </div>

          {/* New Password */}
          <div className="grid gap-2">
            <Label htmlFor="new-password">Nueva contraseña</Label>
            <div className="relative">
              <Input
                id="new-password"
                name="newPassword"
                type={passwordVisibility.new ? 'text' : 'password'}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pr-10"
                required
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              >
                {passwordVisibility.new ? <Eye /> : <EyeOff />}
              </Button>
            </div>
            {showInvalidLength && (
              <p className="text-sm text-red-600">La contraseña debe tener al menos 8 caracteres</p>
            )}
          </div>

          {/* Confirm Password */}
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
                required
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              >
                {passwordVisibility.confirm ? <Eye /> : <EyeOff />}
              </Button>
            </div>
            {showMismatch && <p className="text-sm text-red-600">Las contraseñas no coinciden</p>}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={!passwordsMatch || !isPasswordValid || isSubmitting}>
              {isSubmitting ? 'Cambiando...' : 'Cambiar contraseña'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
