"use client";

import { useRef, useState } from "react";
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
import { Textarea } from "../ui/textarea";

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const moneyInputRegex = /^(\d{1,3}(?:\.\d{3})*|\d+)(?:,\d{0,2})?$/;

function formatCurrencyValue(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value) || value === 0) {
    return "";
  }

  return currencyFormatter.format(value);
}

function parseMoneyInput(value: string): number | null {
  if (!value) {
    return null;
  }

  const trimmedValue = value.trim();

  if (!moneyInputRegex.test(trimmedValue)) {
    return null;
  }

  const normalized = trimmedValue.replace(/\./g, "").replace(",", ".");

  const numeric = Number(normalized);

  if (Number.isNaN(numeric)) {
    return null;
  }

  return Math.round(numeric * 100) / 100;
}

function maskCurrencyInput(rawValue: string) {
  if (!rawValue) {
    return "";
  }

  let workingValue = rawValue.replace(/\s/g, "");
  if (!workingValue) {
    return "";
  }

  const commaCount = (workingValue.match(/,/g) ?? []).length;
  const dotCount = (workingValue.match(/\./g) ?? []).length;

  if (commaCount === 0 && dotCount === 1) {
    const dotIndex = workingValue.lastIndexOf(".");
    const decimalsLength = workingValue.length - dotIndex - 1;

    if (decimalsLength > 0 && decimalsLength <= 2) {
      workingValue =
        workingValue.slice(0, dotIndex) +
        "," +
        workingValue.slice(dotIndex + 1);
    }
  }

  const normalized = workingValue.replace(/\./g, "");
  const hasComma = normalized.includes(",");
  const endsWithComma = hasComma && normalized.endsWith(",");
  const [rawInteger = "", rawDecimals = ""] = normalized.split(",", 2);

  const integerDigits = rawInteger.replace(/\D/g, "");
  const decimalDigits = rawDecimals.replace(/\D/g, "").slice(0, 2);

  let normalizedInteger = integerDigits.replace(/^0+(?=\d)/, "");

  if (!normalizedInteger && (hasComma || decimalDigits)) {
    normalizedInteger = "0";
  }

  if (!normalizedInteger && !decimalDigits) {
    return "";
  }

  const groupedInteger = normalizedInteger
    ? normalizedInteger.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    : "0";

  if (!hasComma) {
    return groupedInteger;
  }

  if (!decimalDigits && !endsWithComma) {
    return groupedInteger;
  }

  return `${groupedInteger},${decimalDigits}`;
}

function countDigitsBeforeCaret(value: string, caretPosition: number) {
  let count = 0;
  for (let i = 0; i < caretPosition && i < value.length; i++) {
    if (/\d/.test(value[i])) {
      count++;
    }
  }
  return count;
}

function caretFromDigitPosition(value: string, digitPosition: number) {
  if (digitPosition <= 0) {
    return 0;
  }

  let digitsSeen = 0;
  for (let i = 0; i < value.length; i++) {
    if (/\d/.test(value[i])) {
      digitsSeen++;
      if (digitsSeen === digitPosition) {
        return i + 1;
      }
    }
  }

  return value.length;
}

function toPlainAmount(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value) || value === 0) {
    return "";
  }

  return maskCurrencyInput(value.toFixed(2).replace(".", ","));
}

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
  note: z.string().optional(),
  method: z.literal(["Efectivo", "Deposito", "Transferencia"]),
  totalAmount: moneyNumberSchema,
  status: z.literal(["Pago", "Pendiente", "No pago"]),
  isInput: z.boolean().parse(true),
});

export function ButtonDrawer() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      method: "Efectivo",
      date: getTodayISODate(),
      concept: "",
      note: "",
      totalAmount: 0.0,
      status: "Pendiente",
      isInput: true,
    },
  });

  const [amountDisplay, setAmountDisplay] = useState<string>("");
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const amountInputRef = useRef<HTMLInputElement | null>(null);

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
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
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid grid-cols-1 gap-6 auto-rows-min md:grid-cols-2"
              >
                <Field className="md:col-span-1">
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
                <Field className="md:col-span-1">
                  <FieldLabel htmlFor="current-state">
                    Estado de la transacción
                  </FieldLabel>
                  <Select defaultValue="paid">
                    <SelectTrigger id="current-state">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Pago</SelectItem>
                      <SelectItem value="not-paid">No Pago</SelectItem>
                      <SelectItem value="pending">
                        Pendiente
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <FormField
                  control={form.control}
                  name="concept"
                  render={({ field }) => (
                    <FormItem className="md:col-span-1">
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
                          value={
                            isAmountFocused
                              ? amountDisplay
                              : formatCurrencyValue(field.value)
                          }
                          onFocus={() => {
                            setIsAmountFocused(true);
                            setAmountDisplay(toPlainAmount(field.value));
                          }}
                          onBlur={() => {
                            field.onBlur();

                            const parsedValue = parseMoneyInput(amountDisplay);
                            if (parsedValue === null) {
                              setAmountDisplay("");
                              field.onChange(0);
                              setIsAmountFocused(false);
                              return;
                            }

                            field.onChange(parsedValue);
                            setAmountDisplay("");
                            setIsAmountFocused(false);
                          }}
                          onChange={(event) => {
                            const inputElement = event.target;
                            const rawValue = inputElement.value;
                            const selectionStart =
                              inputElement.selectionStart ?? rawValue.length;

                            const digitsBeforeCaret = countDigitsBeforeCaret(
                              rawValue,
                              selectionStart
                            );
                            const insertedChar =
                              selectionStart > 0
                                ? rawValue[selectionStart - 1]
                                : undefined;

                            const maskedValue = maskCurrencyInput(rawValue);

                            if (!maskedValue) {
                              setAmountDisplay("");
                              field.onChange(0);
                              return;
                            }

                            if (!moneyInputRegex.test(maskedValue)) {
                              return;
                            }

                            setAmountDisplay(maskedValue);

                            const parsedValue =
                              parseMoneyInput(maskedValue);

                            if (parsedValue !== null) {
                              field.onChange(parsedValue);
                            }

                            let nextCaretPosition = caretFromDigitPosition(
                              maskedValue,
                              digitsBeforeCaret
                            );

                            if (
                              insertedChar &&
                              /[.,]/.test(insertedChar) &&
                              (maskedValue[nextCaretPosition] === "," ||
                                maskedValue[nextCaretPosition] === ".")
                            ) {
                              nextCaretPosition = Math.min(
                                maskedValue.length,
                                nextCaretPosition + 1
                              );
                            }

                            requestAnimationFrame(() => {
                              if (amountInputRef.current) {
                                amountInputRef.current.setSelectionRange(
                                  nextCaretPosition,
                                  nextCaretPosition
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
                <div className="md:col-span-2">
                  <Calendar28 />
                </div>

                <FormField control={form.control} name="note" render={({field}) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Nota <i>opcional</i></FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Agrega información opcional a este movimiento"
                        {...field}
                        className="min-h-24"
                      />
                    </FormControl>
                  </FormItem>
                )}/>

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
