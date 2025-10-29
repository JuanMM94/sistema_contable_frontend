"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Field, FieldLabel } from "../ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Calendar28 } from "./InputCalendar";

function getTodayISODate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // months are 0-indexed
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const moneyNumberSchema = z
  .number()
  .positive({ message: "Amount must be positive." })
  .refine(
    (val) => Number.isFinite(val) && /^\d+\.\d{2}$/.test(val.toFixed(2)),
    { message: "Must have exactly 2 decimal places." }
  );

const formSchema = z.object({
  date: z.iso.datetime(getTodayISODate()),
  client: z.string(),
  concept: z.string(),
  method: z.literal(["Efectivo", "Deposito", "Transferencia"]),
  totalAmount: moneyNumberSchema,
  paymentStatus: z.literal(["Pago", "Pendiente", "No pago"]),
  isInput: z.boolean().parse(true),
});

export function ButtonDrawer() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      method: "Efectivo",
      date: getTodayISODate(),
      concept: "",
      totalAmount: 0.0,
      paymentStatus: "Pendiente",
      isInput: true,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Nuevo Movimiento</Button>
      </DrawerTrigger>
      <DrawerContent className="flex items-center">
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Nuevo Movimiento</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8 flex flex-col gap-6"
              >
                <Field>
                  <FieldLabel htmlFor="method-used">
                    Metodo de transacción
                  </FieldLabel>
                  <Select defaultValue="cash">
                    <SelectTrigger id="method-used">
                      <SelectValue placeholder="Metodo de transacción" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Efectivo</SelectItem>
                      <SelectItem value="check">Cheque</SelectItem>
                      <SelectItem value="wiretransfer">
                        Transferencia Bancaria
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <FormField
                  control={form.control}
                  name="concept"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Concepto</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="ej. Cobranza / Compra dolar a 1.420"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Calendar28/>

                <Button type="submit">Submit</Button>
              </form>
            </Form>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
