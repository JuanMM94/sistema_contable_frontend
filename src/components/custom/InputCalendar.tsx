"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false
  }
  return !isNaN(date.getTime())
}

function formatShortDate(date: Date | undefined) {
  if (!isValidDate(date)) {
    return ""
  }

  const day = String(date!.getDate()).padStart(2, "0")
  const month = String(date!.getMonth() + 1).padStart(2, "0")
  const year = String(date!.getFullYear()).slice(-2)

  return `${day}/${month}/${year}`
}

function formatISODate(date: Date) {
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = String(date.getFullYear()).padStart(4, "0")

  return `${year}-${month}-${day}`
}

function parseISODate(value: string | null | undefined) {
  if (!value) {
    return undefined
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
  if (!match) {
    return undefined
  }

  const [, year, month, day] = match
  const parsed = new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  )

  if (!isValidDate(parsed)) {
    return undefined
  }

  return parsed
}

function maskShortDateInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 6)
  const day = digits.slice(0, 2)
  const month = digits.slice(2, 4)
  const year = digits.slice(4, 6)

  return [day, month, year].filter(Boolean).join("/")
}

function isCompleteShortDate(value: string) {
  return /^\d{2}\/\d{2}\/\d{2}$/.test(value)
}

function resolveFullYear(twoDigitYear: number, contextDate?: Date) {
  if (Number.isNaN(twoDigitYear) || twoDigitYear < 0 || twoDigitYear > 99) {
    return null
  }

  const reference = contextDate ?? new Date()
  const referenceYear = reference.getFullYear()
  const century = Math.floor(referenceYear / 100) * 100

  let candidate = century + twoDigitYear

  if (candidate > referenceYear + 20) {
    candidate -= 100
  } else if (candidate < referenceYear - 80) {
    candidate += 100
  }

  return candidate
}

function shortDateToISO(value: string, contextDate?: Date) {
  if (!isCompleteShortDate(value)) {
    return null
  }

  const [dayString, monthString, yearString] = value.split("/")
  const day = Number(dayString)
  const month = Number(monthString)
  const shortYear = Number(yearString)

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null
  }

  const fullYear = resolveFullYear(shortYear, contextDate)
  if (fullYear === null) {
    return null
  }

  const candidate = new Date(fullYear, month - 1, day)
  if (!isValidDate(candidate)) {
    return null
  }

  if (
    candidate.getFullYear() !== fullYear ||
    candidate.getMonth() !== month - 1 ||
    candidate.getDate() !== day
  ) {
    return null
  }

  return formatISODate(candidate)
}

type Calendar28Props = {
  value?: string | null
  onChange?: (value: string) => void
  onBlur?: React.FocusEventHandler<HTMLInputElement>
  name?: string
  id?: string
  disabled?: boolean
  label?: string
}

export const Calendar28 = React.forwardRef<HTMLInputElement, Calendar28Props>(
  (
    {
      value,
      onChange,
      onBlur,
      name,
      id,
      disabled,
      label = "Fecha",
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false)
    const initialDate = React.useMemo(
      () => parseISODate(value ?? undefined),
      [value]
    )
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
      initialDate
    )
    const [displayMonth, setDisplayMonth] = React.useState<Date>(
      initialDate ?? new Date()
    )
    const [inputValue, setInputValue] = React.useState<string>(() =>
      formatShortDate(initialDate)
    )

    React.useEffect(() => {
      const nextDate = parseISODate(value ?? undefined)
      setSelectedDate(nextDate)
      setInputValue(formatShortDate(nextDate))
      if (nextDate) {
        setDisplayMonth(nextDate)
      }
    }, [value])

    const inputId = id ?? name ?? "date"

    const emitChange = React.useCallback(
      (isoDate: string) => {
        if (onChange) {
          onChange(isoDate)
        }
      },
      [onChange]
    )

    const handleInputChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const maskedValue = maskShortDateInput(event.target.value)
        setInputValue(maskedValue)

        if (!maskedValue) {
          setSelectedDate(undefined)
          emitChange("")
          return
        }

        if (!isCompleteShortDate(maskedValue)) {
          return
        }

        const isoString = shortDateToISO(
          maskedValue,
          selectedDate ?? displayMonth
        )
        if (!isoString) {
          return
        }

        const parsed = parseISODate(isoString)
        setSelectedDate(parsed)
        if (parsed) {
          setDisplayMonth(parsed)
        }
        emitChange(isoString)
      },
      [displayMonth, emitChange, selectedDate]
    )

    const handleCalendarSelect = React.useCallback(
      (date: Date | undefined) => {
        if (!date) {
          setSelectedDate(undefined)
          setInputValue("")
          emitChange("")
          return
        }

        setSelectedDate(date)
        setDisplayMonth(date)
        setInputValue(formatShortDate(date))
        emitChange(formatISODate(date))
        setOpen(false)
      },
      [emitChange]
    )

    const handleBlur = React.useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        if (onBlur) {
          onBlur(event)
        }

        if (!inputValue) {
          setSelectedDate(undefined)
          emitChange("")
          return
        }

        if (!isCompleteShortDate(inputValue)) {
          setInputValue(formatShortDate(selectedDate))
          return
        }

        const isoString = shortDateToISO(
          inputValue,
          selectedDate ?? displayMonth
        )

        if (!isoString) {
          setInputValue(formatShortDate(selectedDate))
          return
        }

        if (value !== isoString) {
          emitChange(isoString)
        }

        const parsed = parseISODate(isoString)
        setSelectedDate(parsed)
        if (parsed) {
          setDisplayMonth(parsed)
        }
      },
      [displayMonth, emitChange, inputValue, onBlur, selectedDate, value]
    )

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
              if (event.key === "ArrowDown") {
                event.preventDefault()
                setOpen(true)
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
    )
  }
)

Calendar28.displayName = "Calendar28"
