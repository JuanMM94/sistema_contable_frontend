'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { formatDateFromISO } from '@/lib/date_utils';
import {
  currencyFormatter,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  getPaymentTypeLabel,
} from '@/lib/utils';
import styles from '../../app/page.module.css';
import { Movement } from '@/lib/schemas';
import { useAdminContext } from '@/providers/AdminFetchProvider';

// function EditMovementDialog({ movement }: { movement: Movement }) {

//   const {updateMovement} = useAdminContext()
//   const [isOpen, setIsOpen] = useState(false);

//   const formId = `edit-movement-${movement.id}`;
//   const form = useForm<EditMovement>({
//     defaultValues: {
//       movementId: movement.id,
//       payer: movement.payer ?? '',
//       concept: movement.concept ?? '',
//       note: movement.note ?? '',
//       status: movement.status,
//       method: movement.method,
//       type: movement.type,
//     },
//   });

//   const onSubmit = async (values: EditMovement) => {
//     try {
//       await updateMovement(values);
//       toast.success('Movimiento actualizado exitosamente', {
//         description: values.movementId ? `${values.movementId} ha sido actualizado.` : "Movimiento actualizado.",
//       });
//     } catch (error) {
//       toast.error('Error al editar movimiento', {
//         description: error instanceof Error ? error.message : 'No se pudo modificar el movimiento',
//       });
//     }
//   };

//   const isSubmitting = form.formState.isSubmitting;

//   return (
//     <Dialog open={isOpen} onOpenChange={setIsOpen}>
//       <DialogTrigger asChild>
//         <button type="button" className="text-blue-600 hover:underline cursor-pointer">
//           Editar
//         </button>
//       </DialogTrigger>
//       <DialogContent className="sm:max-w-2xl">
//         <DialogHeader>
//           <DialogTitle>Editar movimiento</DialogTitle>
//           <DialogDescription>
//             Actualiza los datos del movimiento seleccionado.
//           </DialogDescription>
//         </DialogHeader>
//         <Form {...form}>
//           <form
//             id={formId}
//             onSubmit={form.handleSubmit(onSubmit)}
//             className="grid gap-4 sm:grid-cols-2"
//           >
//             <FormField
//               control={form.control}
//               name="payer"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Cliente</FormLabel>
//                   <FormControl>
//                     <Input placeholder="Nombre del cliente" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="concept"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Concepto</FormLabel>
//                   <FormControl>
//                     <Input placeholder="Concepto del movimiento" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="status"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Estado</FormLabel>
//                   <FormControl>
//                     <Select
//                       value={field.value}
//                       onValueChange={field.onChange}
//                       defaultValue={field.value}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Selecciona un estado" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {PAYMENT_STATUS_OPTIONS.map((opt) => (
//                           <SelectItem key={opt.value} value={opt.value}>
//                             {opt.label}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="method"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>{'M\u00e9todo'}</FormLabel>
//                   <FormControl>
//                     <Select
//                       value={field.value}
//                       onValueChange={field.onChange}
//                       defaultValue={field.value}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Selecciona un método" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {PAYMENT_METHOD_OPTIONS.map((opt) => (
//                           <SelectItem key={opt.value} value={opt.value}>
//                             {opt.label}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="type"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Tipo</FormLabel>
//                   <FormControl>
//                     <Select
//                       value={field.value}
//                       onValueChange={field.onChange}
//                       defaultValue={field.value}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Selecciona un tipo" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {PAYMENT_TYPES_OPTIONS.map((opt) => (
//                           <SelectItem key={opt.value} value={opt.value}>
//                             {opt.label}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="note"
//               render={({ field }) => (
//                 <FormItem className="sm:col-span-2">
//                   <FormLabel>Nota</FormLabel>
//                   <FormControl>
//                     <Textarea placeholder="Notas opcionales" className="min-h-24" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//           </form>
//         </Form>
//         <DialogFooter>
//           <DialogClose asChild>
//             <Button type="button" variant="outline">
//               Cancelar
//             </Button>
//           </DialogClose>
//           <Button type="submit" form={formId} disabled={isSubmitting} aria-busy={isSubmitting}>
//             {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

function ListMovementsUser({ initialMovements }: { initialMovements: Movement[] | [] }) {
  return (
    <section className={styles.table_section}>
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Id de factura</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Método</TableHead>
            <TableHead>Moneda</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Nota</TableHead>
            <TableHead className="text-right">Cantidad</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialMovements.map((movement) => {
            return (
              <TableRow key={movement.id}>
                <TableCell className="font-medium">{movement.id.slice(0, 8)}...</TableCell>
                <TableCell className="font-medium">
                  {formatDateFromISO(movement.date)}
                </TableCell>
                <TableCell className="font-medium">{movement.payer}</TableCell>
                <TableCell>{getPaymentStatusLabel(movement.status)}</TableCell>
                <TableCell>{getPaymentMethodLabel(movement.method)}</TableCell>
                <TableCell>{movement.currency}</TableCell>
                <TableCell>{getPaymentTypeLabel(movement.type)}</TableCell>
                <TableCell>{movement.concept}</TableCell>
                <TableCell
                  className={`text-right ${movement.type === 'EGRESS' ? 'text-red-600' : 'text-green-600'}`}
                >
                  {currencyFormatter(movement.amount, 'es-AR', movement.currency, true)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </section>
  );
}

function ListMovementsAdmin() {
  const { movements } = useAdminContext();
  const rows = movements ?? [];

  return (
    <section className={styles.table_section}>
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Id de factura</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Usuario</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Método</TableHead>
            <TableHead>Moneda</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Nota</TableHead>
            <TableHead className="text-right">Cantidad</TableHead>
            {/* <TableHead className="text-center">Acciones</TableHead> */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((movement) => {
            return (
              <TableRow key={movement.id}>
                <TableCell className="font-medium">{movement.id.slice(0, 8)}...</TableCell>
                <TableCell className="font-medium">
                  {formatDateFromISO(movement.date)}
                </TableCell>
                <TableCell className="font-medium">{movement.account.user.name}</TableCell>
                <TableCell className="font-medium">{movement.payer}</TableCell>
                <TableCell>{getPaymentStatusLabel(movement.status)}</TableCell>
                <TableCell>{getPaymentMethodLabel(movement.method)}</TableCell>
                <TableCell>{movement.currency}</TableCell>
                <TableCell>{getPaymentTypeLabel(movement.type)}</TableCell>
                <TableCell>{movement.concept}</TableCell>
                <TableCell
                  className={`text-right ${movement.type === 'EGRESS' ? 'text-red-600' : 'text-green-600'}`}
                >
                  {currencyFormatter(movement.amount, 'es-AR', movement.currency, true)}
                </TableCell>
                {/* <TableCell className="text-center">
                    <div className="inline-flex items-center justify-center gap-3">
                      <EditMovementDialog movement={movement} />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            type="button"
                            className="text-red-600 hover:underline cursor-pointer"
                          >
                            Borrar
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Eliminar movimiento</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción es permanente. ¿Estas seguro de borrar este movimiento?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction variant="destructive" onClick={async () =>{
                              await deleteMovement({movementId:movement.id});
                            }}>Borrar</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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

export { ListMovementsUser, ListMovementsAdmin };
