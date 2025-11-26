'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FieldErrors } from 'react-hook-form';
import { z } from 'zod';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar28 } from './InputCalendar';
import { formatISODate } from '@/lib/date_utils';
import {
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  PAYMENT_TYPES_OPTIONS,
} from '@/lib/global_variables';
import {
  maskCurrencyInput,
  parseMoneyInput,
  countDigitsBeforeCaret,
  caretFromDigitPosition,
  moneyInputRegex,
  toPlainAmount,
} from '@/lib/utils';
import type { NewMovementInputT } from '@/lib/schemas';

const moneyNumberSchema = z
  .number()
  .positive()
  .refine((v) => /^\d+\.\d{2}$/.test(v.toFixed(2)), {
    message: 'Must have exactly 2 decimal places.',
  });

const formSchema = z.object({
  date: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), { message: 'Formato ISO8601 inválido' }),
  payer: z.string().min(1),
  concept: z.string().min(1),
  note: z.string().optional(),
  method: z.enum(['CASH', 'DEPOSIT', 'WIRE']),
  amount: moneyNumberSchema,
  status: z.enum(['PAID', 'UNPAID', 'PENDING']),
  type: z.enum(['INCOME', 'EGRESS']),
});

const ACCOUNT_ID = 'cmhmg8qtg0001w53gjg9vsjkn'; // Current user -- IMPORTANT CHANGE --
const DEFAULT_CURRENCY: NewMovementInputT['currency'] = 'USD';

type ButtonDrawerProps = { onCreated?: (payload: NewMovementInputT) => void | Promise<void> };

export function ButtonDrawer({ onCreated }: ButtonDrawerProps) {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      method: 'CASH',
      date: formatISODate(new Date()),
      payer: '',
      concept: '',
      note: '',
      amount: 0.0,
      status: 'PENDING',
      type: 'INCOME',
    },
  });

  const [amountDisplay, setAmountDisplay] = useState('');
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const amountInputRef = useRef<HTMLInputElement | null>(null);

  const handleError = (errors: FieldErrors<z.infer<typeof formSchema>>) => {
    // Form validation errors - handled by FormMessage components
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // build server payload
    const payload: NewMovementInputT = {
      accountId: ACCOUNT_ID,
      payer: values.payer,
      concept: values.concept,
      amount: values.amount.toFixed(2), // send as string for Decimal
      note: values.note || undefined,
      date: new Date(values.date),
      exchangeRate: undefined,
      currency: DEFAULT_CURRENCY,
      status: values.status,
      method: values.method,
      type: values.type,
    };

    await onCreated?.(payload as NewMovementInputT);
    router.refresh(); // refetches RSC data
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
                {/* payer */}
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
                {/* method */}
                <FormField
                  control={form.control}
                  name="method"
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
                {/* status */}
                <FormField
                  control={form.control}
                  name="status"
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
                {/* type */}
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
                {/* concept */}
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
                {/* amount (masked) */}
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem className="md:col-span-1">
                      <FormLabel>Monto total</FormLabel>
                      <FormControl>
                        <Input
                          ref={(el) => {
                            field.ref(el);
                            amountInputRef.current = el;
                          }}
                          name={field.name}
                          inputMode="decimal"
                          placeholder="ej. 1.420,00"
                          value={isAmountFocused ? amountDisplay : field.value.toFixed(2)}
                          onFocus={() => {
                            setIsAmountFocused(true);
                            setAmountDisplay(toPlainAmount(field.value));
                          }}
                          onBlur={() => {
                            field.onBlur();
                            const parsed = parseMoneyInput(amountDisplay);
                            field.onChange(parsed ?? 0);
                            setAmountDisplay('');
                            setIsAmountFocused(false);
                          }}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const caret = e.target.selectionStart ?? raw.length;
                            const digitsBefore = countDigitsBeforeCaret(raw, caret);
                            const inserted = caret > 0 ? raw[caret - 1] : undefined;
                            const masked = maskCurrencyInput(raw);
                            if (!masked) {
                              setAmountDisplay('');
                              field.onChange(0);
                              return;
                            }
                            if (!moneyInputRegex.test(masked)) return;
                            setAmountDisplay(masked);
                            const parsed = parseMoneyInput(masked);
                            if (parsed !== null) field.onChange(parsed);
                            let nextCaret = caretFromDigitPosition(masked, digitsBefore);
                            if (
                              inserted &&
                              /[.,]/.test(inserted) &&
                              (masked[nextCaret] === ',' || masked[nextCaret] === '.')
                            ) {
                              nextCaret = Math.min(masked.length, nextCaret + 1);
                            }
                            requestAnimationFrame(() =>
                              amountInputRef.current?.setSelectionRange(nextCaret, nextCaret),
                            );
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* date */}
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <div className="md:col-span-2">
                      <Calendar28 {...field} />
                    </div>
                  )}
                />
                {/* note */}
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
                Guardar
              </Button>
              <DrawerClose asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  Cancelar
                </Button>
              </DrawerClose>
            </div>
          </DrawerFooter>
        </div>
        <div aria-hidden className="h-6 sm:h-8" />
      </DrawerContent>
    </Drawer>
  );
}
