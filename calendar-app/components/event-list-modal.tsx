"use client"

import { format, isSameDay } from "date-fns"
import { pt } from "date-fns/locale"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { CalendarEvent } from "@/lib/types"
import { cn } from "@/lib/utils"

interface EventListModalProps {
  isOpen: boolean
  onClose: () => void
  day: Date
  events: CalendarEvent[]
  onEventSelect: (eventId: string) => void
  onCreateEvent: () => void
}

export function EventListModal({ isOpen, onClose, day, events, onEventSelect, onCreateEvent }: EventListModalProps) {
  // Filtrar eventos para o dia selecionado
  const dayEvents = events
    .filter((event) => {
      const eventDate = new Date(event.start)
      return isSameDay(eventDate, day)
    })
    .sort((a, b) => {
      return new Date(a.start).getTime() - new Date(b.start).getTime()
    })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Eventos para {format(day, "d 'de' MMMM", { locale: pt })}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[300px] mt-4">
          {dayEvents.length > 0 ? (
            <div className="space-y-2">
              {dayEvents.map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    "p-3 rounded-md cursor-pointer hover:opacity-80 transition-opacity",
                    `bg-${event.color || "blue"}-100`,
                    `text-${event.color || "blue"}-800`,
                  )}
                  onClick={() => {
                    onClose()
                    onEventSelect(event.id)
                  }}
                >
                  <div className="font-medium">{event.title}</div>
                  <div className="text-sm mt-1">
                    {format(new Date(event.start), "HH:mm")} - {format(new Date(event.end), "HH:mm")}
                  </div>
                  {event.description && <div className="text-sm mt-1 line-clamp-2">{event.description}</div>}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">Nenhum evento encontrado para este dia.</div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button onClick={onCreateEvent}>Adicionar Novo Evento</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

