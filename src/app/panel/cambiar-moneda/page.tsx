'use client';

import { InputCurrency } from '@/components/custom/InputCurrency';
import { Loading } from '@/components/custom/Loading';
import { Splitter } from '@/components/custom/Splitter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { currencyFormatter } from '@/lib/utils';
import { CurrencySwapData, useSession } from '@/providers/RouteFetchProvider';
import { ArrowLeftRight, MoveLeft } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function Page() {
  const { loading, user, exchangeRate, getExchangeRates, postCurrencySwap } = useSession();

  const [amountToTransfer, setAmountToTransfer] = useState<string>('');
  const [amountError, setAmountError] = useState<string | null>(null);
  const [rateChangeNote, setRateChangeNote] = useState<string | null>(null);

  const [fromTo, setFromTo] = useState<{ from: 'ARS' | 'USD'; to: 'ARS' | 'USD' }>({
    from: 'ARS',
    to: 'USD',
  });

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

  const accountNames: Record<'ARS' | 'USD', string> = {
    ARS: 'Pesos Argentinos',
    USD: 'Dolares Estado Unidences',
  };

  const fromAccount = user!.accounts!.find((acc) => acc.currency === fromTo.from)!;
  const toAccount = user!.accounts!.find((acc) => acc.currency === fromTo.to)!;
  const fromBalance = Number(fromAccount.amount) || 0;
  const toBalance = Number(toAccount.amount) || 0;

  const rateLabel =
    exchangeRate && fromTo.from === 'USD'
      ? `1 USD = ${exchangeRate.sell} ARS`
      : exchangeRate
        ? `1 ARS = ${(1 / exchangeRate.buy).toFixed(4)} USD`
        : 'Cargando...';

  const transferValue = Number(amountToTransfer) || 0;
  const convertedAmount =
    exchangeRate && transferValue > 0
      ? fromTo.from === 'USD'
        ? transferValue * exchangeRate.sell
        : exchangeRate.buy !== 0
          ? transferValue / exchangeRate.buy
          : 0
      : 0;
  const newFromBalance = fromBalance - transferValue;
  const newToBalance = toBalance + convertedAmount;

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
    if (parsed > fromBalance) {
      setAmountToTransfer(fromBalance.toFixed(2));
      setAmountError('El monto excede el saldo disponible en esta cuenta.');
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
      fromCurrency: fromTo.from,
      toCurrency: fromTo.to,
      amount: transferValue,
      clientRate: exchangeRate,
    };

    try {
      await postCurrencySwap(data);
    } catch (err) {
      // TODO: surface toast with the error message.
      console.error('Currency swap failed', err);
    }
  };

  return (
    <div className="w-full max-w-2xl px-4">
      <div
        className="flex flex-row items-center gap-2 mb-4 cursor-pointer"
        onClick={() => history.back()}
      >
        <MoveLeft size={24} />
        <h5>Volver</h5>
      </div>
      <h2>Cambiar entre cuentas</h2>
      <p>Transfiere fondos entre tus cuentas ARS y USD</p>
      {!loading ? (
        <Card>
          <CardContent className="flex flex-col gap-3">
            <div>
              <p className="opacity-50">Desde</p>
              <Card>
                <CardContent className="flex flex-row items-center justify-between">
                  <div>
                    <h4>{accountNames[fromTo.from]}</h4>
                    <p className="opacity-50">{fromAccount.id}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <h4>
                      <b>{currencyFormatter(fromAccount.amount, 'es-AR', fromTo.from)}</b>
                    </h4>
                    <p className="opacity-50">{fromTo.from}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="flex items-center">
              <Splitter />
              <div
                className="border w-12 h-12 rounded-full flex items-center justify-center mx-auto my-4 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => {
                  setFromTo(({ from, to }) => ({ from: to, to: from }));
                  setAmountToTransfer('');
                  setAmountError(null);
                }}
              >
                <ArrowLeftRight size={32} className="opacity-75 w-100" />
              </div>
              <Splitter />
            </div>
            <div>
              <p className="opacity-50">Hasta</p>
              <Card>
                <CardContent className="flex flex-row items-center justify-between">
                  <div>
                    <h4>{accountNames[fromTo.to]}</h4>
                    <p className="opacity-50">{toAccount.id}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <h4>
                      <b>{currencyFormatter(toAccount.amount, 'es-AR', fromTo.to)}</b>
                    </h4>
                    <p className="opacity-50">{fromTo.to}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            <Splitter />
            <div>
              <div className="grid w-full items-center gap-3">
                <Label htmlFor="amount" className="opacity-50">
                  Cantidad a transferir
                </Label>
                <div className="flex items-center ">
                  <div className="flex h-10 items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
                    {fromTo.from}
                  </div>
                  <InputCurrency
                    id="amount"
                    currency={fromTo.from}
                    placeholder="0.00"
                    className="rounded-none flex-1 h-10"
                    formatCurrencyValue={(raw, currency) =>
                      currencyFormatter(raw, 'es-AR', currency, true)
                    }
                    value={amountToTransfer}
                    onValueChange={handleAmountChange}
                  />
                  <div className="flex flex-1 h-10 items-center rounded-r-md border border-l-0 bg-muted px-3 text-sm text-muted-foreground">
                    Cambio: {rateLabel}
                  </div>
                </div>
                {amountError ? <p className="text-sm text-destructive">{amountError}</p> : null}
                <div className="flex justify-between w-full mt-1">
                  <Label htmlFor="amount" className="opacity-50">
                    Cantidad disponible de {fromTo.from}:{' '}
                    {currencyFormatter(fromAccount.amount, 'es-AR', fromTo.from, true)}
                  </Label>
                  <button
                    type="button"
                    className="text-primary cursor-pointer"
                    onClick={() => {
                      setAmountError(null);
                      setAmountToTransfer(fromBalance.toFixed(2));
                    }}
                  >
                    Usar todo
                  </button>
                </div>
              </div>
            </div>
            <Card className="mt-4">
              <CardContent className="flex flex-col gap-3">
                <h5>Resumen</h5>
                <div className="flex flex-row justify-between">
                  <p className="opacity-75">Desde ARS</p>
                  <p className="text-red-600 font-semibold">
                    -{currencyFormatter(transferValue, 'es-AR', fromTo.from, true)}
                  </p>
                </div>
                <div className="flex flex-row justify-between">
                  <p className="opacity-75">Hacia USD</p>
                  <p className="text-green-600 font-semibold">
                    +{currencyFormatter(convertedAmount, 'es-AR', fromTo.to, true)}
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
                    variant={'secondary'}
                    className="flex-1"
                    onClick={() => {
                      setRateChangeNote(null);
                      getExchangeRates();
                    }}
                  >
                    Actualizar cotización
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
                {rateChangeNote ? (
                  <p className="text-sm text-muted-foreground text-right">{rateChangeNote}</p>
                ) : null}
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      ) : (
        <>
          <Loading />
        </>
      )}
    </div>
  );
}
