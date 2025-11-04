'use client';

import { useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { FieldErrors, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Field, FieldLabel } from '../ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar28 } from './InputCalendar';
import { formatISODate } from '@/lib/date_utils';
import { Textarea } from '../ui/textarea';
import type { Invoice } from '@/types/invoice';
import {
  caretFromDigitPosition,
  countDigitsBeforeCaret,
  formatCurrencyValue,
  maskCurrencyInput,
  moneyInputRegex,
  parseMoneyInput,
  toPlainAmount,
} from '@/lib/utils';
import {
  PAYMENT_METHOD_OPTIONS,
  STATUS_OPTIONS,
  TRANSACTION_TYPES_OPTION,
} from '@/lib/global_variables';

const moneyNumberSchema = z
  .number()
  .positive({ message: 'Amount must be positive.' })
  .refine((val) => Number.isFinite(val) && /^\d+\.\d{2}$/.test(val.toFixed(2)), {
    message: 'Must have exactly 2 decimal places.',
  });

const formSchema = z.object({
  date: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'Formato ISO8601 inválido',
  }),
  payer: z.string(),
  concept: z.string(),
  note: z.string().optional(),
  paymentMethod: z.enum(['cash', 'deposit', 'wire']),
  totalAmount: moneyNumberSchema,
  paymentStatus: z.enum(['paid', 'pending', 'not-paid']),
  type: z.enum(['income', 'egress']),
});

type ButtonDrawerProps = {
  setInvoiceList: Dispatch<SetStateAction<Invoice[]>>;
};

export function ButtonDrawer({ setInvoiceList: setInvoiceList }: ButtonDrawerProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      paymentMethod: 'cash',
      date: formatISODate(new Date()),
      payer: '',
      concept: '',
      note: '',
      totalAmount: 0.0,
      paymentStatus: 'pending',
      type: 'income',
    },
  });

  const [amountDisplay, setAmountDisplay] = useState<string>('');
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const amountInputRef = useRef<HTMLInputElement | null>(null);

  const handleError = (errors: FieldErrors<z.infer<typeof formSchema>>) => {
    console.warn('Submit blocked', errors);
  };

  useEffect(() => {
    console.log('Form errors', form.formState.errors);
  }, [form.formState.errors]);

  useEffect(() => {
    const sub = form.watch((values, info) => {
      if (info.name) {
        console.log('Changed:', info.name, '→', values[info.name as keyof typeof values]);
      }
    });
    return () => sub.unsubscribe();
  }, [form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    setInvoiceList((prev) => {
      const lastNumericId = prev.reduce((max, invoice) => {
        const numericPart = Number(invoice.invoice.replace(/\D/g, ''));
        if (!Number.isFinite(numericPart)) {
          return max;
        }
        return Math.max(max, numericPart);
      }, 0);

      const nextNumericId = lastNumericId + 1;
      const nextInvoiceId = `INV${String(nextNumericId).padStart(3, '0')}`;

      const newInvoice: Invoice = {
        invoice: nextInvoiceId,
        ...values,
      };

      return [...prev, newInvoice];
    });
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Nuevo Movimiento</Button>
      </DrawerTrigger>
      <DrawerContent className="flex justify-center items-center px-4 sm:px-6">
        <div className="mx-auto flex w-full max-w-5xl max-h-[90vh] flex-col min-h-0 gap-5">
          <DrawerHeader className="shrink-0 px-4 sm:px-6">
            <DrawerTitle>Nuevo Movimiento</DrawerTitle>
          </DrawerHeader>
          <div className="min-h-0 flex-1 overflow-y-auto p-4 pb-0 sm:p-6 sm:pb-0">
            <Form {...form}>
              <form
                id="new-movement-form"
                onSubmit={form.handleSubmit(onSubmit, handleError)}
                className="grid grid-cols-1 gap-6 auto-rows-min md:grid-cols-2"
              >
                <FormField
                  control={form.control}
                  name="payer"
                  render={({ field }) => (
                    <FormItem className="md:col-span-1">
                      <FormLabel>Nombre del cliente</FormLabel>
                      <FormControl>
                        <Input placeholder="ej. Pedro Martinez" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem className="md:col-span-1">
                      <FormLabel>Método de transacción</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger id="method-used" className="w-full">
                            <SelectValue placeholder="Método de transacción" />
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
                  name="paymentStatus"
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
                            <SelectValue placeholder="Estado de transacción" />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((opt) => (
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
                  name="type"
                  render={({ field }) => (
                    <FormItem className="md:col-span-1">
                      <FormLabel>Tipo de transacción</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger id="type" className="w-full">
                            <SelectValue placeholder="Tipo de transacción" />
                          </SelectTrigger>
                          <SelectContent>
                            {TRANSACTION_TYPES_OPTION.map((opt) => (
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
                  name="concept"
                  render={({ field }) => (
                    <FormItem className="md:col-span-1">
                      <FormLabel>Concepto</FormLabel>
                      <FormControl>
                        <Input placeholder="ej. Cobranza / Compra dolar a 1.420" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="totalAmount"
                  render={({ field }) => (
                    <FormItem className="md:col-span-1">
                      <FormLabel>Monto total</FormLabel>
                      <FormControl>
                        <Input
                          ref={(element) => {
                            field.ref(element);
                            amountInputRef.current = element;
                          }}
                          name={field.name}
                          inputMode="decimal"
                          placeholder="ej. 1.420,00"
                          value={isAmountFocused ? amountDisplay : formatCurrencyValue(field.value)}
                          onFocus={() => {
                            setIsAmountFocused(true);
                            setAmountDisplay(toPlainAmount(field.value));
                          }}
                          onBlur={() => {
                            field.onBlur();

                            const parsedValue = parseMoneyInput(amountDisplay);
                            if (parsedValue === null) {
                              setAmountDisplay('');
                              field.onChange(0);
                              setIsAmountFocused(false);
                              return;
                            }

                            field.onChange(parsedValue);
                            setAmountDisplay('');
                            setIsAmountFocused(false);
                          }}
                          onChange={(event) => {
                            const inputElement = event.target;
                            const rawValue = inputElement.value;
                            const selectionStart = inputElement.selectionStart ?? rawValue.length;

                            const digitsBeforeCaret = countDigitsBeforeCaret(
                              rawValue,
                              selectionStart,
                            );
                            const insertedChar =
                              selectionStart > 0 ? rawValue[selectionStart - 1] : undefined;

                            const maskedValue = maskCurrencyInput(rawValue);

                            if (!maskedValue) {
                              setAmountDisplay('');
                              field.onChange(0);
                              return;
                            }

                            if (!moneyInputRegex.test(maskedValue)) {
                              return;
                            }

                            setAmountDisplay(maskedValue);

                            const parsedValue = parseMoneyInput(maskedValue);

                            if (parsedValue !== null) {
                              field.onChange(parsedValue);
                            }

                            let nextCaretPosition = caretFromDigitPosition(
                              maskedValue,
                              digitsBeforeCaret,
                            );

                            if (
                              insertedChar &&
                              /[.,]/.test(insertedChar) &&
                              (maskedValue[nextCaretPosition] === ',' ||
                                maskedValue[nextCaretPosition] === '.')
                            ) {
                              nextCaretPosition = Math.min(
                                maskedValue.length,
                                nextCaretPosition + 1,
                              );
                            }

                            requestAnimationFrame(() => {
                              if (amountInputRef.current) {
                                amountInputRef.current.setSelectionRange(
                                  nextCaretPosition,
                                  nextCaretPosition,
                                );
                              }
                            });
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <div className="md:col-span-2">
                      <Calendar28 {...field} />
                    </div>
                  )}
                />

                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>
                        Nota <i>opcional</i>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Agrega información opcional a este movimiento"
                          {...field}
                          className="min-h-24"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
          <DrawerFooter className="shrink-0 px-4 sm:px-6 flex self-end">
            <div className="flex w-100 flex-col gap-2 lg:flex-col sm:flex-row justify-end sm:gap-5">
              <Button type="submit" form="new-movement-form" className="w-full sm:w-auto">
                Submit
              </Button>
              <DrawerClose asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  Cancelar
                </Button>
              </DrawerClose>
            </div>
          </DrawerFooter>
        </div>
        {/* This is the padding in the bottom of the drawer */}
        <div aria-hidden className="h-6 sm:h-8" />
      </DrawerContent>
    </Drawer>
  );
}
