import { InputCurrency } from '@/components/custom/InputCurrency';
import { Loading } from '@/components/custom/Loading';
import { Splitter } from '@/components/custom/Splitter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { currencyFormatter } from '@/lib/utils';
import { ArrowLeftRight, MoveLeft } from 'lucide-react';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAdminContext } from '@/providers/AdminFetchProvider';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { InputUser } from '@/components/custom/InputUser';
import { useForm, FieldErrors, useWatch } from 'react-hook-form';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CurrencySwapData, InputSwap } from '@/lib/schemas';

const deriveFromTo = (value: string | null): { from: 'ARS' | 'USD'; to: 'ARS' | 'USD' } => {
  const from = value === 'USD' ? 'USD' : 'ARS';
  return { from, to: from === 'ARS' ? 'USD' : 'ARS' };
};

type FormNewSwapProps = {
  onCreated?: (payload: InputSwap) => void | Promise<void>;
  onCancel?: () => void;
  formId?: string;
  renderActions?: (formId: string) => ReactNode;
};

export function FormNewSwap({ onCreated, formId = 'new-movement-form' }: FormNewSwapProps) {
  const {
    exchangeRate,
    getExchangeRates,
    postCurrencySwap,
    getUserToCurrencySwap,
    userToCurrencySwap,
    userToCurrencySwapError,
    userToCurrencySwapLoading,
  } = useAdminContext();
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialUserId = searchParams.get('userId') ?? '';
  const [amountToTransfer, setAmountToTransfer] = useState<string>('');
  const [amountError, setAmountError] = useState<string | null>(null);
  const [rateChangeNote, setRateChangeNote] = useState<string | null>(null);

  const [fromTo, setFromTo] = useState<{ from: 'ARS' | 'USD'; to: 'ARS' | 'USD' }>(() =>
    deriveFromTo(searchParams.get('from')),
  );

  const lastRateRef = useRef(exchangeRate);

  useEffect(() => {
    // Fetch exchange rates on mount
    getExchangeRates();
  }, [getExchangeRates]);

  useEffect(() => {
    if (!exchangeRate) return;
    if (lastRateRef.current) {
      const prev = lastRateRef.current;
      const sellDiff = exchangeRate.sell - prev.sell;
      if (sellDiff !== 0) {
        const direction = sellDiff > 0 ? 'subió' : 'bajó';
        setRateChangeNote(
          `La cotización de venta ${direction} ${Math.abs(sellDiff).toFixed(2)} ARS (de ${prev.sell} a ${exchangeRate.sell}).`,
        );
      } else {
        setRateChangeNote('La cotización se mantuvo igual tras la actualización.');
      }
    }
    lastRateRef.current = exchangeRate;
  }, [exchangeRate]);

  const fromBalance = 0;
  const toBalance = 0;

  const rateLabel =
    exchangeRate && fromTo.from === 'USD'
      ? `1 USD = ${exchangeRate.sell} ARS`
      : exchangeRate
        ? `1 ARS = ${(1 / exchangeRate.sell).toFixed(6)} USD`
        : 'Cargando...';

  const transferValue = Number(amountToTransfer) || 0;

  const handleAmountChange = (nextRaw: string) => {
    if (!nextRaw) {
      setAmountToTransfer('');
      setAmountError(null);
      return;
    }

    const parsed = Number(nextRaw);
    if (Number.isNaN(parsed)) {
      setAmountToTransfer(nextRaw);
      return;
    }

    const acc = userToCurrencySwap?.accounts?.find((a) => a.currency === fromTo.from);
    if (!acc) {
      // no user yet / still loading => just accept typing, or block it
      setAmountToTransfer(nextRaw);
      setAmountError(null);
      return;
    }

    const balance = Number(acc.paidBalance) || 0;

    if (parsed > balance) {
      setAmountToTransfer(balance.toFixed(2));
      setAmountError('El monto excede el saldo pagado disponible en esta cuenta.');
      return;
    }

    setAmountError(null);
    setAmountToTransfer(nextRaw);
  };

  const sendSwapRequest = async () => {

    if (!exchangeRate) {
      // TODO: surface toast for missing exchange rate.
      return;
    }
    const data: CurrencySwapData = {
      userId: form.getValues('userId'),
      fromCurrency: fromTo.from,
      toCurrency: fromTo.to,
      amountChange: transferValue,
      adminRate: rateValue,
      amountTotal: adjustedConvertedAmount,
    };

    try {
      await postCurrencySwap(data);
    } catch (err) {
      // TODO: surface toast with the error message.
      console.error('Currency swap failed', err);
    }
  };

  const form = useForm<z.infer<typeof InputSwap>>({
    resolver: zodResolver(InputSwap),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues: {
      userId: initialUserId,
      fromCurrency: 'ARS',
      toCurrency: 'USD',
      adminRate: '',
      amountChange: transferValue,
      amountTotal: 0,
    },
  });

  const userId = useWatch({ control: form.control, name: 'userId' });
  const fromCurrency = useWatch({ control: form.control, name: 'fromCurrency' }) ?? 'ARS';
  const toCurrency = useWatch({ control: form.control, name: 'toCurrency' }) ?? 'USD';
  const adminRate = useWatch({ control: form.control, name: 'adminRate' });
  const isAdminRateDirty = form.formState.dirtyFields.adminRate;

  const baseRate =
    exchangeRate && toCurrency === 'ARS'
      ? exchangeRate.sell
      : exchangeRate
        ? 1 / exchangeRate.sell
        : 0;

  const rateValue =
    typeof adminRate === 'number' ? adminRate : adminRate ? Number(adminRate) : baseRate;

  const adjustedConvertedAmount = transferValue > 0 ? transferValue * rateValue : 0;
  const newFromBalance = fromBalance - transferValue;
  const newToBalance = toBalance + adjustedConvertedAmount;

  useEffect(() => {
    if (!exchangeRate) return;
    if (isAdminRateDirty) return;
    form.setValue('adminRate', baseRate, { shouldDirty: false });
  }, [exchangeRate, form, isAdminRateDirty, baseRate]);

  const fromAcc = userToCurrencySwap?.accounts?.find((a) => a.currency === fromCurrency);
  const toAcc = userToCurrencySwap?.accounts?.find((a) => a.currency === toCurrency);

  const updateUserIdParam = (nextUserId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextUserId) {
      params.set('userId', nextUserId);
    } else {
      params.delete('userId');
    }
    const query = params.toString();
    router.replace(query ? `?${query}` : '?');
  };

  const handleError = (errors: FieldErrors<InputSwap>) => {
    console.warn('Submit blocked', errors);
  };

  async function onSubmit(values: z.infer<typeof InputSwap>) {
    const payload: InputSwap = {
      userId: values.userId,
      fromCurrency: values.fromCurrency,
      toCurrency: values.toCurrency,
      adminRate: values.adminRate,
      amountChange: transferValue,
      amountTotal: adjustedConvertedAmount,
    };
    await onCreated?.(payload);
    router.refresh(); // refetches RSC data
  }

  const swapCurrencies = () => {
    const from = form.getValues('fromCurrency');
    const to = form.getValues('toCurrency');
    form.setValue('fromCurrency', to, { shouldDirty: true });
    form.setValue('toCurrency', from, { shouldDirty: true });
    setFromTo({ from: to as 'ARS' | 'USD', to: from as 'ARS' | 'USD' });
    // your extra resets
    setAmountToTransfer('');
    setAmountError(null);
    form.setValue('amountChange', 0, { shouldDirty: true });
    if (exchangeRate) {
      const nextBaseRate = from === 'ARS' ? exchangeRate.sell : 1 / exchangeRate.sell;
      form.resetField('adminRate', { defaultValue: nextBaseRate });
    } else {
      form.resetField('adminRate');
    }
  };

  useEffect(() => {
    if (!userId) return;
    void getUserToCurrencySwap(userId);
  }, [userId, getUserToCurrencySwap]);

  return (
    <div className="w-full max-w-2xl px-4">
      <div
        className="flex flex-row items-center gap-2 mb-4 cursor-pointer"
        onClick={() => history.back()}
      >
        <MoveLeft size={24} />
        <h5>Volver</h5>
      </div>
      <Card>
        <CardContent className="flex flex-col gap-3">
          <h2>Transfiere montos entre cuentas</h2>
          <div>
            <h5>Seleccione el usuario que hara la transferencia</h5>
          </div>
          <Form {...form}>
            <form
              id={formId}
              onSubmit={form.handleSubmit(onSubmit, handleError)}
              className="flex flex-col gap-6"
            >
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <FormLabel>Usuario</FormLabel>
                    <FormControl>
                      <InputUser
                        value={field.value}
                        onChange={(nextValue) => {
                          field.onChange(nextValue);
                          updateUserIdParam(nextValue);
                        }}
                        placeholder="Elegí un usuario..."
                        onBlur={field.onBlur}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {userToCurrencySwapLoading && <Loading />}
              {userToCurrencySwapError && (
                <p className="text-sm text-red-500">{userToCurrencySwapError}</p>
              )}

              {userToCurrencySwap?.accounts && fromAcc && toAcc && (
                <>
                  {/* FROM */}
                  <FormField
                    control={form.control}
                    name="fromCurrency"
                    render={() => (
                      <FormItem>
                        <FormLabel>Desde</FormLabel>
                        <FormControl>
                          <Card>
                            <CardContent className="flex flex-row items-center justify-between">
                              <h4>
                                {currencyFormatter(fromAcc.paidBalance, 'es-AR', fromCurrency, false)}
                              </h4>
                              <p className="opacity-50">{fromCurrency}</p>
                            </CardContent>
                          </Card>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* SWAP */}
                  <div className="flex items-center">
                    <Splitter />
                    <div
                      onClick={swapCurrencies}
                      className="border w-12 h-12 rounded-full flex items-center justify-center mx-auto my-4 cursor-pointer hover:shadow-lg transition-shadow"
                    >
                      <ArrowLeftRight size={32} className="opacity-75 w-100" />
                    </div>
                    <Splitter />
                  </div>

                  {/* TO */}
                  <FormField
                    control={form.control}
                    name="toCurrency"
                    render={() => (
                      <FormItem>
                        <FormLabel>Hasta</FormLabel>
                        <FormControl>
                          <Card>
                            <CardContent className="flex flex-row items-center justify-between">
                              <h4>{currencyFormatter(toAcc.paidBalance, 'es-AR', toCurrency, false)}</h4>
                              <p className="opacity-50">{toCurrency}</p>
                            </CardContent>
                          </Card>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* AMOUNT */}
                  <FormField
                    control={form.control}
                    name="amountChange"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="opacity-50">Cantidad a transferir</FormLabel>

                        <div className="flex items-center">
                          <div className="flex h-10 items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
                            {fromCurrency}
                          </div>

                          <FormControl>
                            <InputCurrency
                              id="amount"
                              currency={fromCurrency}
                              placeholder="0.00"
                              className="rounded-none flex-1 h-10"
                              formatCurrencyValue={(raw, currency) =>
                                currencyFormatter(raw, 'es-AR', currency, true)
                              }
                              value={field.value != null ? String(field.value) : ''}
                              onValueChange={(nextRaw) => {
                                handleAmountChange(nextRaw); // uses fromAcc.amount check
                                const n = Number(nextRaw);
                                field.onChange(Number.isFinite(n) ? n : undefined);
                              }}
                              onBlur={field.onBlur}
                            />
                          </FormControl>
                        </div>

                        {amountError ? (
                          <p className="text-sm text-destructive">{amountError}</p>
                        ) : null}
                        <FormMessage />
                        <div className="flex justify-between w-full mt-1">
                          <Label htmlFor="amount" className="opacity-50">
                            Cantidad pagada disponible de {fromCurrency}:{' '}
                            {currencyFormatter(fromAcc.paidBalance, 'es-AR', fromCurrency)}
                          </Label>

                          <button
                            type="button"
                            className="text-primary cursor-pointer"
                            onClick={() => {
                              setAmountError(null);
                              const max = Number(fromAcc.paidBalance) || 0;
                              setAmountToTransfer(max.toFixed(2));
                              field.onChange(max);
                            }}
                          >
                            Usar todo
                          </button>
                        </div>
                      </FormItem>
                    )}
                  />
                  {/* ADMINRATE */}
                  <FormField
                    control={form.control}
                    name="adminRate"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="opacity-50">Tipo de cambio</FormLabel>
                        <div className="flex items-center">
                          <div className="flex h-10 items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
                            {toCurrency}
                          </div>
                          <FormControl>
                            <InputCurrency
                              id="amount"
                              currency={toCurrency}
                              placeholder="0.00"
                              className="rounded-none flex-1 h-10 mr-2"
                              formatCurrencyValue={(raw, currency, decimals) =>
                                currencyFormatter(raw, 'es-AR', currency, true, decimals)
                              }
                              value={field.value != null ? String(field.value) : ''}
                              onValueChange={(nextRaw) => {
                                const n = Number(nextRaw);
                                field.onChange(Number.isFinite(n) ? n : undefined);
                              }}
                              onBlur={field.onBlur}
                              decimals={toCurrency === 'USD' ? 6 : 2}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant={'secondary'}
                            className="flex-1"
                            onClick={() => {
                              setRateChangeNote(null);
                              getExchangeRates();
                            }}
                          >
                            Actualizar cotización
                          </Button>
                        </div>
                        <FormMessage />
                        <div className="flex justify-between w-full mt-1">
                          <Label htmlFor="adminRate" className="opacity-50">
                            Ultimo tipo de cambio disponible (
                            {lastRateRef.current?.updatedAt
                              ? new Date(lastRateRef.current.updatedAt).toLocaleString()
                              : 'sin datos'}
                            ): {rateLabel}
                          </Label>
                        </div>
                        {rateChangeNote ? (
                          <p className="text-sm text-muted-foreground">{rateChangeNote}</p>
                        ) : null}
                      </FormItem>
                    )}
                  />
                  <Card className="mt-4">
                    <CardContent className="flex flex-col gap-3">
                      <h5>Resumen</h5>
                      <div className="flex flex-row justify-between">
                        <p className="opacity-75">Desde {fromTo.from}</p>
                        <p className="text-red-600 font-semibold">
                          -{currencyFormatter(transferValue, 'es-AR', fromTo.from, true)}
                        </p>
                      </div>
                      <div className="flex flex-row justify-between">
                        <p className="opacity-75">Hacia {fromTo.to}</p>
                        <p className="text-green-600 font-semibold">
                          +{currencyFormatter(adjustedConvertedAmount, 'es-AR', fromTo.to, true)}
                        </p>
                      </div>
                      <Splitter />
                      <div className="flex flex-row justify-between">
                        <p className="opacity-75">Nuevo balance de ARS</p>
                        <p className="font-semibold">
                          {currencyFormatter(
                            fromTo.from === 'ARS' ? newFromBalance : newToBalance,
                            'es-AR',
                            'ARS',
                          )}
                        </p>
                      </div>
                      <div className="flex flex-row justify-between">
                        <p className="opacity-75">Nuevo balance de USD</p>
                        <p className="font-semibold">
                          {currencyFormatter(
                            fromTo.from === 'USD' ? newFromBalance : newToBalance,
                            'es-AR',
                            'USD',
                          )}
                        </p>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          type="button"
                          variant={'outline'}
                          className="flex-1"
                          onClick={() => {
                            setAmountToTransfer('');
                            setAmountError(null);
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="button"
                          variant={'default'}
                          className="flex-1"
                          onClick={() => {
                            sendSwapRequest();
                          }}
                        >
                          Confirmar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
