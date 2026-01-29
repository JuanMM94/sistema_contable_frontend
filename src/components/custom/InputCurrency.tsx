'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';

type Currency = 'USD' | 'ARS';

type InputCurrencyProps = Omit<
  React.ComponentProps<typeof Input>,
  'value' | 'onChange' | 'type' | 'inputMode'
> & {
  currency: Currency;
  value: string; // canonical/raw (recommended: "1234.56")
  onValueChange: (nextRaw: string) => void;
  formatCurrencyValue: (raw: string, currency: Currency, decimals: number) => string;
  decimals?: number; // default 2
};

function parseToCanonical(draft: string, decimals: number) {
  // Accept "1.234,56" or "1,234.56" or "1234.56" and normalize to "1234.56"
  const cleaned = draft.replace(/[^\d.,]/g, '');
  if (!cleaned) return '';

  const lastDot = cleaned.lastIndexOf('.');
  const lastComma = cleaned.lastIndexOf(',');

  const decSep = lastDot === -1 && lastComma === -1 ? null : lastDot > lastComma ? '.' : ',';

  const parts = decSep ? cleaned.split(decSep) : [cleaned];
  const intPart = (parts[0] ?? '').replace(/[^\d]/g, '');
  const decPart = (parts[1] ?? '').replace(/[^\d]/g, '').slice(0, decimals);

  if (!intPart) return '';
  return decPart ? `${intPart}.${decPart}` : intPart;
}

export function InputCurrency({
  currency,
  value,
  onValueChange,
  formatCurrencyValue,
  decimals = 2,
  ...props
}: InputCurrencyProps) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState('');

  const commit = React.useCallback(() => {
    const next = parseToCanonical(draft, decimals);
    onValueChange(next);
    setEditing(false);
  }, [draft, decimals, onValueChange]);

  return (
    <Input
      {...props}
      type="text"
      inputMode="decimal"
      value={editing ? draft : formatCurrencyValue(value, currency, decimals)}
      onFocus={(e) => {
        setEditing(true);
        setDraft(value); // start from canonical; change to formatted if you prefer
        props.onFocus?.(e);
      }}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={(e) => {
        commit();
        props.onBlur?.(e);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.currentTarget.blur(); // triggers commit via onBlur
        }
        if (e.key === 'Escape') {
          setEditing(false);
          setDraft(value);
        }
        props.onKeyDown?.(e);
      }}
    />
  );
}
