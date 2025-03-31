"use client"

import { useState, useEffect } from "react"
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  setHours,
  addMinutes,
  differenceInMinutes,
} from "date-fns"
import { pt } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { CalendarEvent } from "@/lib/types"
import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"

interface WeekViewProps {
  currentDate: Date
  events: CalendarEvent[]
  onSlotSelect: (start: Date, end: Date) => void
  onEventSelect: (eventId: string) => void
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const TIME_SLOT_HEIGHT = 60 // pixels per hour

export function WeekView({ currentDate, events, onSlotSelect, onEventSelect }: WeekViewProps) {
  const [days, setDays] = useState<Date[]>([])
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  useEffect(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 })

    const weekDays = eachDayOfInterval({
      start: weekStart,
      end: weekEnd,
    })

    setDays(weekDays)
  }, [currentDate])

  // Atualizar a função getEventsForDay para garantir compatibilidade com as datas armazenadas
  const getEventsForDay = (day: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.start)
      return isSameDay(eventDate, day)
    })
  }

  const handleCellClick = (day: Date, hour: number) => {
    const start = setHours(day, hour)
    const end = addMinutes(start, 60)
    onSlotSelect(start, end)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    // Implementar lógica de drag and drop para eventos
    console.log("Drag ended", event)
  }

  const getEventPosition = (event: CalendarEvent, day: Date) => {
    const eventStart = new Date(event.start)
    const eventEnd = new Date(event.end)

    if (!isSameDay(eventStart, day)) return null

    const startMinutes = eventStart.getHours() * 60 + eventStart.getMinutes()
    const durationMinutes = differenceInMinutes(eventEnd, eventStart)

    const top = (startMinutes / 60) * TIME_SLOT_HEIGHT
    const height = (durationMinutes / 60) * TIME_SLOT_HEIGHT

    return { top, height }
  }

  return (
    <DndContext sensors={sensors} modifiers={[restrictToVerticalAxis]} onDragEnd={handleDragEnd}>
      <div className="flex flex-col">
        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-8 border-b">
          <div className="p-2 border-r"></div>
          {days.map((day, index) => (
            <div key={index} className="p-2 text-center font-medium border-r">
              <div>{format(day, "EEE", { locale: pt })}</div>
              <div
                className={cn(
                  "inline-flex items-center justify-center w-7 h-7 rounded-full text-sm",
                  isSameDay(day, new Date()) && "bg-primary text-primary-foreground",
                )}
              >
                {format(day, "d")}
              </div>
            </div>
          ))}
        </div>

        {/* Grade de horas */}
        <div className="grid grid-cols-8">
          {/* Coluna de horas */}
          <div className="border-r">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="border-b text-xs text-right pr-2 relative"
                style={{ height: `${TIME_SLOT_HEIGHT}px` }}
              >
                <span className="absolute -top-2 right-2">{hour}:00</span>
              </div>
            ))}
          </div>

          {/* Colunas dos dias */}
          {days.map((day, dayIndex) => {
            const dayEvents = getEventsForDay(day)

            return (
              <div key={dayIndex} className="border-r relative">
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="border-b hover:bg-muted/20 cursor-pointer"
                    style={{ height: `${TIME_SLOT_HEIGHT}px` }}
                    onClick={() => handleCellClick(day, hour)}
                  />
                ))}

                {/* Eventos */}
                {dayEvents.map((event) => {
                  const position = getEventPosition(event, day)
                  if (!position) return null

                  return (
                    <div
                      key={event.id}
                      className={cn(
                        "absolute left-0 right-0 mx-1 p-1 rounded text-xs overflow-hidden",
                        `bg-${event.color || "blue"}-100`,
                        `text-${event.color || "blue"}-800`,
                      )}
                      style={{
                        top: `${position.top}px`,
                        height: `${position.height}px`,
                        minHeight: "20px",
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEventSelect(event.id)
                      }}
                    >
                      <div className="font-medium">{event.title}</div>
                      {position.height > 40 && (
                        <div className="text-xs">
                          {format(new Date(event.start), "HH:mm")} - {format(new Date(event.end), "HH:mm")}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </DndContext>
  )
}

