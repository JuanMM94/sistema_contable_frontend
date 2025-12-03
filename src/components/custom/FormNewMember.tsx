'use client';

import { type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FieldErrors } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import type { InputMember } from '@/lib/schemas';
import { MEMBER_AVAILABLE_ROLES } from '@/lib/global_variables';

const formSchema = z.object({
  name: z.string(),
  email: z.email().nonempty('El email es obligatorio'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER').nonoptional(),
});

type FormNewMemberProps = {
  onCreated?: (payload: InputMember) => void | Promise<void>;
  onCancel?: () => void;
  formId?: string;
  renderActions?: (formId: string) => ReactNode;
};

export function FormNewMember({
  onCreated,
  onCancel,
  formId = 'new-member-form',
  renderActions,
}: FormNewMemberProps) {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      name: '',
      password: '',
      role: 'MEMBER',
    },
  });

  const handleError = (errors: FieldErrors<InputMember>) => {
    console.warn('Submit blocked', errors);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const payload: InputMember = {
      email: values.email,
      name: values.name,
      password: values.password,
      role: values.role,
    };
    await onCreated?.(payload);
    router.refresh();
  }

  const actions =
    renderActions !== undefined ? (
      renderActions(formId)
    ) : (
      <div className="flex w-100 flex-col gap-2 lg:flex-col sm:flex-row justify-end sm:gap-5">
        <Button type="submit" form={formId} className="w-full sm:w-auto">
          Crear nuevo usuario
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    );

  return (
    <div className="flex flex-col gap-5 w-[70vw]">
      <Form {...form}>
        <form
          id={formId}
          onSubmit={form.handleSubmit(onSubmit, handleError)}
          className="grid grid-cols-1 gap-6 auto-rows-min md:grid-cols-2"
        >
          {/* email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="md:col-span-1">
                <FormLabel>Email del usuario</FormLabel>
                <FormControl>
                  <Input placeholder="ej. pepito-miembro@gmail.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="md:col-span-1">
                <FormLabel>Nombre del usuario</FormLabel>
                <FormControl>
                  <Input placeholder="ej. Pepito Rodriguez" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="md:col-span-1">
                <FormLabel>Contraseña del usuario</FormLabel>
                <FormControl>
                  <Input placeholder="ej. pepito1234" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* role */}
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="md:col-span-1">
                <FormLabel>Estado de transacción</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger id="status" className="w-full">
                      <SelectValue placeholder="Rol del usuario" />
                    </SelectTrigger>
                    <SelectContent>
                      {MEMBER_AVAILABLE_ROLES.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
        <p className="font-light text-xs">
          Luego de la creación, podras copiar facilmente la información para enviarsela al usuario.
        </p>
      </Form>

      {actions}
    </div>
  );
}
