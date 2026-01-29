import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AccountWithMovements } from '@/lib/schemas';
import { Badge } from '../ui/badge';
import { TrendingDown, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { currencyFormatter } from '@/lib/utils';

export const CardAccount = ({
  accountInformation,
}: {
  accountInformation: AccountWithMovements;
}) => {
  return (
    <Card className="w-full gap-3 flex justify-center p-2!">
      <CardHeader className="flex flex-col justify-center items-start mt-2!">
        <CardTitle className="text-primary text-2xl">Balance {accountInformation.currency}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <section className="flex flex-col justify-center items-start mt-2!">
            <h5>Balance disponible</h5>
            <p className="text-5xl">
              {currencyFormatter(
                accountInformation.paidBalance,
                'es-AR',
                accountInformation.currency
              )}{' '}
              <span className="text-2xl opacity-80">{accountInformation.currency}</span>
            </p>
          </section>
          <section className="flex flex-col justify-center items-start">
            <h5 className="text-sm opacity-70">Balance pendiente</h5>
            <p className="text-2xl">
              {currencyFormatter(
                accountInformation.pendingBalance,
                'es-AR',
                accountInformation.currency
              )}{' '}
              <span className="text-base opacity-80">{accountInformation.currency}</span>
            </p>
          </section>
          <section className="flex gap-3">
            <Badge
              variant="secondary"
              className={
                accountInformation.percentChange == null
                  ? 'bg-gray-400 text-white dark:bg-gray-700 px-2!'
                  : accountInformation.percentChange > 0
                    ? 'bg-green-700 text-white dark:bg-green-900 px-2!'
                    : accountInformation.percentChange < 0
                      ? 'bg-red-700 text-white dark:bg-red-900 px-2!'
                      : 'bg-gray-400 text-white dark:bg-gray-700 px-2!'
              }
            >
              {accountInformation.percentChange == null ||
              accountInformation.percentChange === 0 ? (
                <>0,00%</>
              ) : accountInformation.percentChange > 0 ? (
                <>
                  <TrendingUp className="mr-1 h-4 w-4" />
                  {accountInformation.percentChange}%
                </>
              ) : (
                <>
                  <TrendingDown className="mr-1 h-4 w-4" />
                  {accountInformation.percentChange}%
                </>
              )}
            </Badge>
            <p className="opacity-30">comparado al último mes</p>
          </section>
          <section className="flex items-center gap-2">
            <Link
              href={{
                pathname: '/panel/ultimos-movimientos',
                query: { currency: accountInformation.currency },
              }}
              className="flex-1"
            >
              <Button className="w-full bg-secondary text-primary">Ultimos Movimientos</Button>
            </Link>
          </section>
        </div>
      </CardContent>
    </Card>
  );
};
