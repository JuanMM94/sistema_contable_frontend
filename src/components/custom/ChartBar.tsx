'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Calendar28 } from '@/components/custom/InputCalendar';
import { formatISODate, formatToLocaleDate, parseISODate } from '@/lib/date_utils';
import { useAdminContext } from '@/providers/AdminFetchProvider';

export const description = 'A multiple bar chart';

const getFallbackChartData = () => {
  const now = new Date();
  const months: { month: string; income: number; egress: number }[] = [];

  for (let index = 5; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    months.push({
      month: formatISODate(date),
      income: 0,
      egress: 0,
    });
  }

  return months;
};

const chartConfig = {
  income: {
    label: 'Ingresos',
    color: 'var(--chart-1)',
  },
  egress: {
    label: 'Egresos',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

export function ChartBarMultiple() {
  const { getMovementFilter, filter } = useAdminContext();
  const [from, setFrom] = React.useState('');
  const [to, setTo] = React.useState('');
  const [isFiltering, setIsFiltering] = React.useState(false);
  const [filterError, setFilterError] = React.useState<string | null>(null);
  const didInitialFetch = React.useRef(false);

  const fallbackChartData = React.useMemo(getFallbackChartData, []);

  const chartData = React.useMemo(() => {
    if (!filter || filter.length === 0) return fallbackChartData;
    const mapped = filter
      .map((item) => {
        if (!item) return null;
        const raw = 'movementWithLimit' in item ? item.movementWithLimit : item;
        if (!raw || typeof raw !== 'object') return null;
        if (!('month' in raw)) return null;
        return {
          month: String(
            new Intl.DateTimeFormat('es-AR', {
              timeZone: 'UTC',
              month: '2-digit',
              year: 'numeric',
            }).format(new Date(raw.month)),
          ),
          income: Number(raw.income ?? 0),
          egress: Number(raw.egress ?? 0),
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    return mapped.length > 0 ? mapped : fallbackChartData;
  }, [fallbackChartData, filter]);

  const formattedFrom = parseISODate(from);
  const formattedTo = parseISODate(to);
  const filterSummary =
    formattedFrom && formattedTo
      ? `Desde ${formatToLocaleDate(formattedFrom, 'day')} hasta ${formatToLocaleDate(
          formattedTo,
          'day',
        )}`
      : 'Sin filtros aplicados';

  const currencyFormatter = React.useMemo(
    () => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }),
    [],
  );

  React.useEffect(() => {
    if (didInitialFetch.current) return;
    if (filter && filter.length > 0) {
      didInitialFetch.current = true;
      return;
    }
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const initialFrom = formatISODate(start);
    const initialTo = formatISODate(end);
    setFrom(initialFrom);
    setTo(initialTo);
    didInitialFetch.current = true;
    setIsFiltering(true);
    void getMovementFilter({ target: 'movements', from: initialFrom, to: initialTo })
      .catch((error) => {
        setFilterError(error instanceof Error ? error.message : 'No se pudo cargar el filtro.');
      })
      .finally(() => {
        setIsFiltering(false);
      });
  }, [filter, getMovementFilter]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!from || !to) {
      setFilterError('Completa target, from y to para aplicar el filtro.');
      return;
    }
    setFilterError(null);
    setIsFiltering(true);
    try {
      await getMovementFilter({ target: 'movements', from, to });
    } catch (error) {
      setFilterError(error instanceof Error ? error.message : 'No se pudo cargar el filtro.');
    } finally {
      setIsFiltering(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingresos - Egresos (Totales por mes)</CardTitle>
        <CardDescription>{filterSummary}</CardDescription>
        <form className="mt-4 flex flex-wrap items-end gap-3" onSubmit={handleSubmit}>
          <div className="min-w-[180px]">
            <Calendar28 label="Desde" value={from} onChange={setFrom} />
          </div>
          <div className="min-w-[180px]">
            <Calendar28 label="Hasta" value={to} onChange={setTo} />
          </div>
          <button
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
            type="submit"
            disabled={isFiltering}
          >
            {isFiltering ? (
              <>
                <Spinner className="mr-2 size-4" />
                Cargando
              </>
            ) : (
              'Aplicar'
            )}
          </button>
        </form>
        {filterError ? <p className="mt-2 text-sm text-destructive">{filterError}</p> : null}
      </CardHeader>
      <CardContent>
        <div className="relative">
          <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={true}
                tickMargin={10}
                tickSize={10}
                axisLine={true}
                tickFormatter={(value) => {
                  const parsed = parseISODate(value);
                  return parsed ? formatToLocaleDate(parsed, 'day') : value;
                }}
              />
              <ChartTooltip
                cursor={true}
                content={
                  <ChartTooltipContent
                    indicator="dashed"
                    formatter={(value) =>
                      typeof value === 'number'
                        ? currencyFormatter.format(value)
                        : currencyFormatter.format(Number(value) || 0)
                    }
                  />
                }
              />
              <Bar dataKey="income" fill="var(--color-secondary)" radius={4}>
                <LabelList
                  position="top"
                  offset={12}
                  className="fill-foreground"
                  fontSize={12}
                  formatter={(value: number) => currencyFormatter.format(Number(value) || 0)}
                />
              </Bar>
              <Bar dataKey="egress" fill="var(--color-primary)" radius={4}>
                <LabelList
                  position="top"
                  offset={12}
                  className="fill-foreground"
                  fontSize={12}
                  formatter={(value: number) => currencyFormatter.format(Number(value) || 0)}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
          {isFiltering ? (
            <div className="absolute inset-0 flex items-center justify-center rounded-md bg-background/70">
              <Spinner className="size-6" />
            </div>
          ) : null}
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        {/* <div className="flex gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div> */}
        <div className="text-muted-foreground leading-none">
          Muestra los ingresos y egresos del rango ingresado
        </div>
      </CardFooter>
    </Card>
  );
}
