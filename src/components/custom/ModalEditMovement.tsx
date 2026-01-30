import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import {
  PAYMENT_STATUS_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_TYPES_OPTIONS,
} from '@/lib/global_variables';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { EditMovement, Movement } from '@/lib/schemas';
import { useAdminContext } from '@/providers/AdminFetchProvider';

export default function EditMovementDialog({ movement }: { movement: Movement }) {
  const { patchMovementRequest } = useAdminContext();
  const [isOpen, setIsOpen] = useState(false);
  const [editMovementArray] = useState<Movement[]>([]);

  const formId = `edit-movement-${movement.id}`;
  const form = useForm<{ movements: EditMovement[] }>({
    defaultValues: { movements: [] },
  });

  // useEffect(() => {
  //   if (!isOpen) return;

  //   const nextMovements: Movement[] = [movement];

  //   if (movement.counterpartId) {
  //     const cp = movementById.get(movement.counterpartId);
  //     if (cp) nextMovements.push(cp);
  //   }

  //   setEditMovementArray(nextMovements);
  //   form.reset({
  //     movements: nextMovements.map((item) => ({
  //       movementId: item.id,
  //       payer: item.payer ?? '',
  //       concept: item.concept ?? '',
  //       note: item.note ?? '',
  //       status: item.status,
  //       method: item.method,
  //       type: item.type,
  //     })),
  //   });
  // }, [isOpen, movement, movementById, form]);

  const onSubmit = async (values: { movements: EditMovement[] }) => {
    try {
      await Promise.all(values.movements.map((item) => patchMovementRequest(item)));
      toast.success('Movimientos actualizados exitosamente', {
        description: `${values.movements.length} movimiento(s) actualizado(s).`,
      });
    } catch (error) {
      toast.error('Error al editar movimiento', {
        description: error instanceof Error ? error.message : 'No se pudo modificar el movimiento',
      });
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button type="button" className="text-blue-600 hover:underline cursor-pointer">
          Editar
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar movimiento</DialogTitle>
          <DialogDescription>Actualiza los datos del movimiento seleccionado.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id={formId}
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 sm:grid-cols-2"
          >
            {editMovementArray.map((item, index) => (
              <div
                key={item.id}
                className="sm:col-span-2 grid gap-4 sm:grid-cols-2 rounded border p-4"
              >
                {editMovementArray.length > 1 ? (
                  <div className="sm:col-span-2 text-sm font-medium text-muted-foreground">
                    Movimiento {index + 1}
                  </div>
                ) : null}
                <input type="hidden" {...form.register(`movements.${index}.movementId`)} />
                <FormField
                  control={form.control}
                  name={`movements.${index}.payer`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre del cliente" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`movements.${index}.concept`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Concepto</FormLabel>
                      <FormControl>
                        <Input placeholder="Concepto del movimiento" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`movements.${index}.status`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un estado" />
                          </SelectTrigger>
                          <SelectContent>
                            {PAYMENT_STATUS_OPTIONS.map((opt) => (
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
                <FormField
                  control={form.control}
                  name={`movements.${index}.method`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{'M\u00e9todo'}</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un m\u00e9todo" />
                          </SelectTrigger>
                          <SelectContent>
                            {PAYMENT_METHOD_OPTIONS.map((opt) => (
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
                <FormField
                  control={form.control}
                  name={`movements.${index}.type`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {PAYMENT_TYPES_OPTIONS.map((opt) => (
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
                <FormField
                  control={form.control}
                  name={`movements.${index}.note`}
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Nota</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Notas opcionales" className="min-h-24" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </form>
        </Form>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit" form={formId} disabled={isSubmitting} aria-busy={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
