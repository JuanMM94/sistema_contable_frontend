'use client';

import * as React from 'react';
import { CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  formatISODate,
  formatToLocaleDate,
  fullDateToISO,
  isCompleteFullDate,
  maskFullDateInput,
  parseISODate,
} from '@/lib/date_utils';

type Calendar28Props = {
  value?: string | null;
  onChange?: (value: string) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  name?: string;
  id?: string;
  disabled?: boolean;
  label?: string;
};

export const Calendar28 = React.forwardRef<HTMLInputElement, Calendar28Props>(
  ({ value, onChange, onBlur, name, id, disabled, label = 'Fecha' }, ref) => {
    const [open, setOpen] = React.useState(false);
    const initialDate = React.useMemo(() => parseISODate(value ?? undefined), [value]);
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(initialDate);
    const [displayMonth, setDisplayMonth] = React.useState<Date>(initialDate ?? new Date());
    const formatDisplayDate = React.useCallback(
      (date?: Date) => (date ? formatToLocaleDate(date) : ''),
      [],
    );
    const [inputValue, setInputValue] = React.useState<string>(() =>
      formatDisplayDate(initialDate),
    );

    React.useEffect(() => {
      const nextDate = parseISODate(value ?? undefined);
      setSelectedDate(nextDate);
      setInputValue(formatDisplayDate(nextDate));
      if (nextDate) {
        setDisplayMonth(nextDate);
      }
    }, [formatDisplayDate, value]);

    const inputId = id ?? name ?? 'date';

    const emitChange = React.useCallback(
      (isoDate: string) => {
        if (onChange) {
          onChange(isoDate);
        }
      },
      [onChange],
    );

    const handleInputChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const maskedValue = maskFullDateInput(event.target.value);
        setInputValue(maskedValue);

        if (!maskedValue) {
          setSelectedDate(undefined);
          emitChange('');
          return;
        }

        if (!isCompleteFullDate(maskedValue)) {
          return;
        }

        const isoString = fullDateToISO(maskedValue);
        if (!isoString) {
          return;
        }

        const parsed = parseISODate(isoString);
        setSelectedDate(parsed);
        if (parsed) {
          setDisplayMonth(parsed);
        }
        emitChange(isoString);
      },
      [emitChange],
    );

    const handleCalendarSelect = React.useCallback(
      (date: Date | undefined) => {
        if (!date) {
          setSelectedDate(undefined);
          setInputValue('');
          emitChange('');
          return;
        }

        setSelectedDate(date);
        setDisplayMonth(date);
        setInputValue(formatDisplayDate(date));
        emitChange(formatISODate(date));
        setOpen(false);
      },
      [emitChange, formatDisplayDate],
    );

    const handleBlur = React.useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        if (onBlur) {
          onBlur(event);
        }

        if (!inputValue) {
          setSelectedDate(undefined);
          emitChange('');
          return;
        }

        if (!isCompleteFullDate(inputValue)) {
          setInputValue(formatDisplayDate(selectedDate));
          return;
        }

        const isoString = fullDateToISO(inputValue);

        if (!isoString) {
          setInputValue(formatDisplayDate(selectedDate));
          return;
        }

        if (value !== isoString) {
          emitChange(isoString);
        }

        const parsed = parseISODate(isoString);
        setSelectedDate(parsed);
        if (parsed) {
          setDisplayMonth(parsed);
        }
      },
      [emitChange, formatDisplayDate, inputValue, onBlur, selectedDate, value],
    );

    return (
      <div className="flex flex-col gap-3">
        <Label htmlFor={inputId} className="px-1">
          {label}
        </Label>
        <div className="relative flex gap-2">
          <Input
            ref={ref}
            id={inputId}
            name={name}
            value={inputValue}
            disabled={disabled}
            className="bg-background pr-10"
            onChange={handleInputChange}
            onBlur={handleBlur}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault();
                setOpen(true);
              }
            }}
          />
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                id={`${inputId}-picker`}
                variant="ghost"
                className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                type="button"
                disabled={disabled}
              >
                <CalendarIcon className="size-3.5" />
                <span className="sr-only">Elige una fecha</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="end"
              alignOffset={-8}
              sideOffset={10}
            >
              <Calendar
                mode="single"
                selected={selectedDate}
                captionLayout="dropdown"
                month={displayMonth}
                onMonthChange={setDisplayMonth}
                onSelect={handleCalendarSelect}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    );
  },
);

Calendar28.displayName = 'Calendar28';
