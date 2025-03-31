"use client"

import { useState } from "react"
import { CalendarHeader } from "@/components/calendar-header"
import { MonthView } from "@/components/month-view"
import { WeekView } from "@/components/week-view"
import { EventModal } from "@/components/event-modal"
import { EventListModal } from "@/components/event-list-modal"
import { useEvents } from "@/hooks/use-events"
import type { ViewType } from "@/lib/types"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function CalendarApp() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<ViewType>("month")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isListModalOpen, setIsListModalOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<{
    start: Date
    end: Date
  } | null>(null)
  const [editingEvent, setEditingEvent] = useState<string | null>(null)

  const { events, isLoading, error, fetchEvents } = useEvents()
  const { toast } = useToast()

  const handleDateChange = (date: Date) => {
    setCurrentDate(date)
  }

  const handleViewChange = (newView: ViewType) => {
    setView(newView)
  }

  const handleSlotSelect = (start: Date, end: Date) => {
    setSelectedSlot({ start, end })
    setEditingEvent(null)
    setIsModalOpen(true)
  }

  const handleEventSelect = (eventId: string) => {
    setEditingEvent(eventId)
    setSelectedSlot(null)
    setIsModalOpen(true)
  }

  const handleDayClick = (day: Date, dayEvents: any[]) => {
    if (dayEvents.length > 0) {
      // Se há eventos, abrir o modal de lista
      setSelectedDay(day)
      setIsListModalOpen(true)
    } else {
      // Se não há eventos, criar um novo
      const start = new Date(day)
      start.setHours(9, 0, 0, 0)
      const end = new Date(day)
      end.setHours(10, 0, 0, 0)
      handleSlotSelect(start, end)
    }
  }

  const handleCloseModal = async (action?: "added" | "updated" | "deleted", title?: string) => {
    setIsModalOpen(false)
    setSelectedSlot(null)
    setEditingEvent(null)

    // Atualizar a lista de eventos após uma ação
    if (action) {
      await fetchEvents()

      // Mostrar toast com base na ação realizada
      if (title) {
        const messages = {
          added: `Evento "${title}" adicionado com sucesso!`,
          updated: `Evento "${title}" atualizado com sucesso!`,
          deleted: `Evento "${title}" excluído com sucesso!`,
        }

        const variants = {
          added: "default",
          updated: "default",
          deleted: "destructive",
        } as const

        toast({
          title: action === "deleted" ? "Evento excluído" : "Sucesso",
          description: messages[action],
          variant: variants[action],
        })
      }
    }
  }

  const handleCloseListModal = () => {
    setIsListModalOpen(false)
    setSelectedDay(null)
  }

  if (isLoading && events.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg">Carregando eventos...</p>
        </div>
      </div>
    )
  }

  if (error && events.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center max-w-md p-6 bg-red-50 rounded-lg border border-red-200">
          <h2 className="text-xl font-bold text-red-700 mb-2">Erro ao carregar eventos</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchEvents()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onDateChange={handleDateChange}
        onViewChange={handleViewChange}
      />

      <div className="mt-4 bg-white rounded-lg shadow">
        {isLoading && events.length > 0 && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {view === "month" ? (
          <MonthView
            currentDate={currentDate}
            events={events}
            onSlotSelect={handleSlotSelect}
            onEventSelect={handleEventSelect}
            onDayClick={handleDayClick}
          />
        ) : (
          <WeekView
            currentDate={currentDate}
            events={events}
            onSlotSelect={handleSlotSelect}
            onEventSelect={handleEventSelect}
          />
        )}
      </div>

      {isModalOpen && (
        <EventModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          selectedSlot={selectedSlot}
          editingEventId={editingEvent}
        />
      )}

      {isListModalOpen && selectedDay && (
        <EventListModal
          isOpen={isListModalOpen}
          onClose={handleCloseListModal}
          day={selectedDay}
          events={events}
          onEventSelect={handleEventSelect}
          onCreateEvent={() => {
            handleCloseListModal()
            if (selectedDay) {
              const start = new Date(selectedDay)
              start.setHours(9, 0, 0, 0)
              const end = new Date(selectedDay)
              end.setHours(10, 0, 0, 0)
              handleSlotSelect(start, end)
            }
          }}
        />
      )}

      <Toaster />
    </div>
  )
}

