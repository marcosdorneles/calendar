"use client"

import { useState, useEffect } from "react"
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
} from "date-fns"
import { cn } from "@/lib/utils"
import type { CalendarEvent } from "@/lib/types"

interface MonthViewProps {
  currentDate: Date
  events: CalendarEvent[]
  onSlotSelect: (start: Date, end: Date) => void
  onEventSelect: (eventId: string) => void
  onDayClick: (day: Date, dayEvents: CalendarEvent[]) => void
}

export function MonthView({ currentDate, events, onSlotSelect, onEventSelect, onDayClick }: MonthViewProps) {
  const [days, setDays] = useState<Date[]>([])

  useEffect(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

    const calendarDays = eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd,
    })

    setDays(calendarDays)
  }, [currentDate])

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.start)
      return isSameDay(eventDate, day)
    })
  }

  return (
    <div className="grid grid-cols-7 border-t border-l">
      {/* Cabeçalho dos dias da semana */}
      {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day, index) => (
        <div key={index} className="p-2 text-center font-medium border-r border-b">
          {day}
        </div>
      ))}

      {/* Células dos dias */}
      {days.map((day, index) => {
        const dayEvents = getEventsForDay(day)
        const isCurrentMonth = isSameMonth(day, currentDate)
        const hasEvents = dayEvents.length > 0

        return (
          <div
            key={index}
            className={cn(
              "min-h-[100px] p-1 border-r border-b relative",
              !isCurrentMonth && "bg-muted/30 text-muted-foreground",
              hasEvents && isCurrentMonth && "hover:bg-muted/10 cursor-pointer",
            )}
            onClick={() => onDayClick(day, dayEvents)}
          >
            <div className="text-right p-1">
              <span
                className={cn(
                  "inline-flex items-center justify-center w-7 h-7 rounded-full text-sm",
                  isSameDay(day, new Date()) && "bg-primary text-primary-foreground",
                )}
              >
                {format(day, "d")}
              </span>
            </div>

            <div className="space-y-1 mt-1">
              {dayEvents.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    "text-xs p-1 rounded truncate",
                    `bg-${event.color || "blue"}-100`,
                    `text-${event.color || "blue"}-800`,
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    onEventSelect(event.id)
                  }}
                >
                  {format(new Date(event.start), "HH:mm")} {event.title}
                </div>
              ))}

              {dayEvents.length > 3 && (
                <div className="text-xs text-muted-foreground px-1">+{dayEvents.length - 3} mais</div>
              )}
            </div>

            {/* Indicador visual para dias com eventos */}
            {hasEvents && isCurrentMonth && (
              <div className="absolute bottom-1 left-0 right-0 flex justify-center">
                <div className="flex space-x-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  {dayEvents.length > 1 && <span className="h-1.5 w-1.5 rounded-full bg-green-500" />}
                  {dayEvents.length > 2 && <span className="h-1.5 w-1.5 rounded-full bg-red-500" />}
                  {dayEvents.length > 3 && <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

