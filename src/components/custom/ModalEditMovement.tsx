import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
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
import { Movement, MovementEditFormSchema, MovementTypeSchema } from '@/lib/schemas';
import { useAdminContext } from '@/providers/AdminFetchProvider';
import z from 'zod';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';

export default function EditMovementDialog({ movement }: { movement: Movement }) {
  const { patchMovementRequest, movementById } = useAdminContext();
  const [isOpen, setIsOpen] = useState(false);
  const [globalLink, setGlobalLink] = useState(false);

  const formId = `edit-movement-${movement.id}`;
  const form = useForm<MovementEditFormSchema>({
    defaultValues: {
      firstmovement: {
        id: movement.id,
        payer: movement.payer ?? '',
        concept: movement.concept ?? '',
        note: movement.note ?? '',
        status: movement.status,
        method: movement.method,
        type: movement.type,
        member: movement.account?.user?.id ?? '',
      },
      secondmovement: undefined,
    },
  });

  const counterpart = movement.counterpartId ? movementById.get(movement.counterpartId) : undefined;

  const editMovementArray = useMemo(() => {
    if (!isOpen) return [];
    const nextMovements: Array<{ key: 'firstmovement' | 'secondmovement'; movement: Movement }> = [
      { key: 'firstmovement', movement },
    ];
    if (counterpart) nextMovements.push({ key: 'secondmovement', movement: counterpart });
    return nextMovements;
  }, [isOpen, movement, counterpart]);

  useEffect(() => {
    if (!isOpen) return;
    form.reset({
      firstmovement: {
        id: movement.id,
        payer: movement.payer ?? '',
        concept: movement.concept ?? '',
        note: movement.note ?? '',
        status: movement.status,
        method: movement.method,
        type: movement.type,
        member: movement.account?.user?.id ?? '',
      },
      secondmovement: counterpart
        ? {
            id: counterpart.id,
            payer: counterpart.payer ?? '',
            concept: counterpart.concept ?? '',
            note: counterpart.note ?? '',
            status: counterpart.status,
            method: counterpart.method,
            type: counterpart.type,
            member: counterpart.account?.user?.id ?? '',
          }
        : undefined,
    });
  }, [isOpen, movement, counterpart, form]);

  const firstWatch = useWatch({ control: form.control, name: 'firstmovement' });

  const firstPayer = firstWatch.payer;
  const firstMethod = firstWatch.method;
  const firstStatus = firstWatch.status;
  const firstConcept = firstWatch.concept;
  const firstType = firstWatch.type;
  const firstNote = firstWatch.note;

  useEffect(() => {
    if (!globalLink) return;
    const hasSecond = editMovementArray.some((entry) => entry.key === 'secondmovement');
    if (!hasSecond) return;
    const currentSecondPayer = form.getValues('secondmovement.payer');
    const currentSecondMethod = form.getValues('secondmovement.method');
    const currentSecondStatus = form.getValues('secondmovement.status');
    const currentSecondConcept = form.getValues('secondmovement.concept');
    const currentSecondType = form.getValues('secondmovement.type');
    const currentSecondNote = form.getValues('secondmovement.note');

    const oppositeType = (t: z.infer<typeof MovementTypeSchema>) =>
      t === 'EGRESS' ? 'INCOME' : 'EGRESS';

    if (currentSecondPayer !== firstPayer) {
      form.setValue('secondmovement.payer', firstPayer, { shouldDirty: true });
    }
    if (currentSecondMethod !== firstMethod) {
      form.setValue('secondmovement.method', firstMethod, { shouldDirty: true });
    }
    if (currentSecondStatus !== firstStatus) {
      form.setValue('secondmovement.status', firstStatus, { shouldDirty: true });
    }
    if (currentSecondConcept !== firstConcept) {
      form.setValue('secondmovement.concept', firstConcept, { shouldDirty: true });
    }
    const nextSecondType = oppositeType(firstType as z.infer<typeof MovementTypeSchema>);
    if (currentSecondType !== nextSecondType) {
      form.setValue('secondmovement.type', nextSecondType, { shouldDirty: true });
    }
    if (currentSecondNote !== firstNote) {
      form.setValue('secondmovement.note', firstNote, { shouldDirty: true });
    }
  }, [
    globalLink,
    firstPayer,
    firstMethod,
    firstStatus,
    firstConcept,
    firstType,
    firstNote,
    editMovementArray,
    form,
  ]);

  const onSubmit = async () => {
    try {
      // Send payload as disabled fields are not included in values
      const payload = {
        firstmovement: form.getValues('firstmovement'),
        secondmovement: editMovementArray.some((entry) => entry.key === 'secondmovement')
          ? form.getValues('secondmovement')
          : undefined,
        hasCounterpart: globalLink,
      } as MovementEditFormSchema;
      await patchMovementRequest(payload);
      setIsOpen(false);
      toast.success('Movimientos actualizados exitosamente', {
        description: `${editMovementArray.length > 1 ? 'movimientos actualizados.' : 'movimiento actualizado.'}`,
      });
    } catch (error) {
      toast.error('Error al editar movimiento', {
        description: error instanceof Error ? error.message : 'No se pudo modificar el movimiento',
      });
    }
  };

  const isSubmitting = form.formState.isSubmitting;
  const handleOpenChange = (nextOpen: boolean) => {
    setIsOpen(nextOpen);
    if (nextOpen) {
      setGlobalLink(Boolean(counterpart));
    } else {
      setGlobalLink(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button type="button" className="text-blue-600 hover:underline cursor-pointer">
          Editar
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
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
            <input type="hidden" />
            {editMovementArray.map((entry, index) => (
              <div
                key={entry.movement.id}
                className="sm:col-span-2 grid gap-4 sm:grid-cols-2 rounded border p-4"
              >
                {editMovementArray.length > 1 ? (
                  <div className="sm:col-span-2 text-sm font-medium text-muted-foreground">
                    Movimiento {index + 1}
                  </div>
                ) : null}
                <input type="hidden" {...form.register(`${entry.key}.id`)} />
                <input type="hidden" {...form.register(`${entry.key}.member`)} />
                {entry.key === 'firstmovement' && editMovementArray.length > 1 ? (
                  <div className="flex items-center space-x-2 sm:col-span-2 text-xs text-muted-foreground">
                    <Switch
                      checked={globalLink}
                      onCheckedChange={setGlobalLink}
                      id="airplane-mode"
                    />
                    <Label htmlFor="airplane-mode">Cliente vinculado entre movimientos</Label>
                  </div>
                ) : null}
                <FormField
                  control={form.control}
                  name={`${entry.key}.payer`}
                  disabled={entry.key === 'secondmovement' && globalLink}
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
                  name={`${entry.key}.concept`}
                  disabled={entry.key === 'secondmovement' && globalLink}
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
                  name={`${entry.key}.status`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <FormControl>
                        <Select
                          disabled={entry.key === 'secondmovement' && globalLink}
                          value={field.value}
                          onValueChange={field.onChange}
                        >
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
                  name={`${entry.key}.method`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{'Método'}</FormLabel>
                      <FormControl>
                        <Select
                          disabled={entry.key === 'secondmovement' && globalLink}
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un método" />
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
                  name={`${entry.key}.type`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <FormControl>
                        <Select
                          disabled={entry.key === 'secondmovement' && globalLink}
                          value={field.value}
                          onValueChange={field.onChange}
                        >
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
                  name={`${entry.key}.note`}
                  disabled={entry.key === 'secondmovement' && globalLink}
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

// C:\Development\sistema_contable_frontend\src\components\custom\ModalEditMovement.tsx
//   67:5  error  Error: Calling setState synchronously within an effect can trigger cascading renders

// Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following:
// * Update external systems with the latest state from React.
// * Subscribe for updates from some external system, calling setState in a callback function when external state changes.

// Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect).

// C:\Development\sistema_contable_frontend\src\components\custom\ModalEditMovement.tsx:67:5
//   65 |
//   66 |     const hasSecond = editMovementArray.some((e) => e.key === "secondmovement");
// > 67 |     setGlobalLink(hasSecond);
//      |     ^^^^^^^^^^^^^ Avoid calling setState() directly within an effect
//   68 |
//   69 |     didInitLink.current = true;
//   70 |   }, [isOpen, editMovementArray]);                            react-hooks/set-state-in-effect
//   81:5  error  Error: Calling setState synchronously within an effect can trigger cascading renders

// Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following:
// * Update external systems with the latest state from React.
// * Subscribe for updates from some external system, calling setState in a callback function when external state changes.

// Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect).

// C:\Development\sistema_contable_frontend\src\components\custom\ModalEditMovement.tsx:81:5
//   79 |     if (counterpart) nextMovements.push({ key: 'secondmovement', movement: counterpart });
//   80 |
// > 81 |     setEditMovementArray(nextMovements);
//      |     ^^^^^^^^^^^^^^^^^^^^ Avoid calling setState() directly within an effect
//   82 |     form.reset({
//   83 |       firstmovement: {
//   84 |         id: movement.id,  react-hooks/set-state-in-effect

// ✖ 2 problems (2 errors, 0 warnings)
