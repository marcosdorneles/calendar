"use client"

import { useState, useEffect } from "react"
import type { CalendarEvent } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export function useEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Função para buscar todos os eventos
  const fetchEvents = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("http://localhost:3000/event", {
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Erro ao buscar eventos: ${response.status}`)
      }

      const data = await response.json()
      setEvents(data)
    } catch (err) {
      console.error("Erro ao buscar eventos:", err)
      setError(err instanceof Error ? err.message : "Erro desconhecido ao buscar eventos")
      toast({
        title: "Erro",
        description: "Não foi possível carregar os eventos. Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Carregar eventos ao inicializar o componente
  useEffect(() => {
    fetchEvents()
  }, [])

  // Função para adicionar um evento
  const addEvent = async (eventData: Omit<CalendarEvent, "id">) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("http://localhost:3000/event/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: eventData.title,
          description: eventData.description || "",
          start: eventData.start instanceof Date ? eventData.start.toISOString() : eventData.start,
          end: eventData.end instanceof Date ? eventData.end.toISOString() : eventData.end,
          color: eventData.color || "blue",
        }),
      })

      if (!response.ok) {
        throw new Error(`Erro ao criar evento: ${response.status}`)
      }

      const newEvent = await response.json()
      setEvents((prev) => [...prev, newEvent])
      return newEvent
    } catch (err) {
      console.error("Erro ao adicionar evento:", err)
      setError(err instanceof Error ? err.message : "Erro desconhecido ao adicionar evento")
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o evento. Tente novamente mais tarde.",
        variant: "destructive",
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Função para atualizar um evento
  const updateEvent = async (id: string, eventData: Omit<CalendarEvent, "id">) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`http://localhost:3000/event/update/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: eventData.title,
          description: eventData.description || "",
          start: eventData.start instanceof Date ? eventData.start.toISOString() : eventData.start,
          end: eventData.end instanceof Date ? eventData.end.toISOString() : eventData.end,
          color: eventData.color || "blue",
        }),
      })

      if (!response.ok) {
        throw new Error(`Erro ao atualizar evento: ${response.status}`)
      }

      const updatedEvent = await response.json()
      setEvents((prev) => prev.map((event) => (event.id === id ? updatedEvent : event)))
      return updatedEvent
    } catch (err) {
      console.error("Erro ao atualizar evento:", err)
      setError(err instanceof Error ? err.message : "Erro desconhecido ao atualizar evento")
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o evento. Tente novamente mais tarde.",
        variant: "destructive",
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Função para excluir um evento
  const deleteEvent = async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`http://localhost:3000/event/delete/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Erro ao excluir evento: ${response.status}`)
      }

      setEvents((prev) => prev.filter((event) => event.id !== id))
      return true
    } catch (err) {
      console.error("Erro ao excluir evento:", err)
      setError(err instanceof Error ? err.message : "Erro desconhecido ao excluir evento")
      toast({
        title: "Erro",
        description: "Não foi possível excluir o evento. Tente novamente mais tarde.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    events,
    isLoading,
    error,
    fetchEvents,
    addEvent,
    updateEvent,
    deleteEvent,
  }
}

