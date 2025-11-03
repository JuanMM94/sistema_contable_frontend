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
import { dateFormatter } from "@/lib/global_variables"

function formatDate(date: Date | undefined) {
  if (!date) {
    return ""
  }
  return dateFormatter.format(date)
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false
  }
  return !isNaN(date.getTime())
}

function maskShortDateInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 6)
  const day = digits.slice(0, 2)
  const month = digits.slice(2, 4)
  const year = digits.slice(4, 6)

  return [day, month, year].filter(Boolean).join("/")
}

function parseShortDate(value: string) {
  const [day, month, year] = value.split("/")

  if (
    !day ||
    !month ||
    !year ||
    day.length !== 2 ||
    month.length !== 2 ||
    year.length !== 2
  ) {
    return undefined
  }

  const dayNumber = Number(day)
  const monthIndex = Number(month) - 1
  const yearNumber = Number(year)

  if (
    Number.isNaN(dayNumber) ||
    Number.isNaN(monthIndex) ||
    Number.isNaN(yearNumber)
  ) {
    return undefined
  }

  const fullYear = 2000 + yearNumber
  const parsedDate = new Date(fullYear, monthIndex, dayNumber)

  if (
    parsedDate.getFullYear() !== fullYear ||
    parsedDate.getMonth() !== monthIndex ||
    parsedDate.getDate() !== dayNumber
  ) {
    return undefined
  }

  return parsedDate
}

export function Calendar28() {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(
    new Date()
  )
  const [month, setMonth] = React.useState<Date | undefined>(date)
  const [value, setValue] = React.useState(formatDate(date))

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor="date" className="px-1">
        Fecha
      </Label>
      <div className="relative flex gap-2">
        <Input
          id="date"
          value={value}
          className="bg-background pr-10"
          onChange={(e) => {
            const maskedValue = maskShortDateInput(e.target.value)
            setValue(maskedValue)

            if (!maskedValue) {
              setDate(undefined)
              return
            }

            if (maskedValue.length === 8) {
              const parsedDate = parseShortDate(maskedValue)

              if (isValidDate(parsedDate)) {
                setDate(parsedDate)
                setMonth(parsedDate)
              } else {
                setDate(undefined)
              }
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setOpen(true)
            }
          }}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date-picker"
              variant="ghost"
              className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
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
              selected={date}
              captionLayout="dropdown"
              month={month}
              onMonthChange={setMonth}
              onSelect={(date) => {
                setDate(date)
                setValue(formatDate(date))
                setOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
