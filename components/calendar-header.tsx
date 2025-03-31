"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { format, addMonths, addWeeks, subMonths, subWeeks } from "date-fns"
import { pt } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import type { ViewType } from "@/lib/types"

interface CalendarHeaderProps {
  currentDate: Date
  view: ViewType
  onDateChange: (date: Date) => void
  onViewChange: (view: ViewType) => void
}

export function CalendarHeader({ currentDate, view, onDateChange, onViewChange }: CalendarHeaderProps) {
  const handlePrevious = () => {
    if (view === "month") {
      onDateChange(subMonths(currentDate, 1))
    } else {
      onDateChange(subWeeks(currentDate, 1))
    }
  }

  const handleNext = () => {
    if (view === "month") {
      onDateChange(addMonths(currentDate, 1))
    } else {
      onDateChange(addWeeks(currentDate, 1))
    }
  }

  const handleToday = () => {
    onDateChange(new Date())
  }

  const formatTitle = () => {
    if (view === "month") {
      return format(currentDate, "MMMM yyyy", { locale: pt })
    } else {
      const start = format(currentDate, "d", { locale: pt })
      const end = format(addWeeks(currentDate, 1), "d 'de' MMMM yyyy", { locale: pt })
      return `${start} - ${end}`
    }
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
      <div className="flex items-center mb-4 sm:mb-0">
        <h1 className="text-2xl font-bold capitalize">{formatTitle()}</h1>
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={handleToday}>
          Hoje
        </Button>
        <div className="flex items-center space-x-1">
          <Button variant="outline" size="icon" onClick={handlePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-1">
          <Button variant={view === "month" ? "default" : "outline"} size="sm" onClick={() => onViewChange("month")}>
            Mês
          </Button>
          <Button variant={view === "week" ? "default" : "outline"} size="sm" onClick={() => onViewChange("week")}>
            Semana
          </Button>
        </div>
      </div>
    </div>
  )
}

