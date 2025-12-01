'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAdminContext } from '@/providers/AdminFetchProvider';

type InputUserProps = {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export function InputUser({
  value = '',
  onChange,
  onBlur,
  placeholder = 'Elige un usuario...',
  disabled = false,
  className,
}: InputUserProps) {
  const { users } = useAdminContext();
  const [open, setOpen] = React.useState(false);

  const selectedName = users?.find((user) => user.id === value)?.name ?? '';

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) onBlur?.();
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
          disabled={disabled}
        >
          {selectedName ? selectedName : placeholder}
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(320px,90vw)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscando usuarios ..." className="h-9" />
          <CommandList>
            <CommandEmpty>No se encontraron usuarios</CommandEmpty>
            <CommandGroup>
              {users?.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.id}
                  onSelect={(currentValue) => {
                    const nextValue = currentValue === value ? '' : currentValue;
                    onChange?.(nextValue);
                    handleOpenChange(false);
                  }}
                >
                  {user.name}
                  <Check
                    className={cn('ml-auto', value === user.id ? 'opacity-100' : 'opacity-0')}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
