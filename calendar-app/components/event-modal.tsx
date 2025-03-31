"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { pt } from "date-fns/locale"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useEvents } from "@/hooks/use-events"
import type { CalendarEvent } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface EventModalProps {
  isOpen: boolean
  onClose: (action?: "added" | "updated" | "deleted", title?: string) => void
  selectedSlot: { start: Date; end: Date } | null
  editingEventId: string | null
}

const COLOR_OPTIONS = [
  { value: "blue", label: "Azul" },
  { value: "green", label: "Verde" },
  { value: "red", label: "Vermelho" },
  { value: "yellow", label: "Amarelo" },
  { value: "purple", label: "Roxo" },
]

export function EventModal({ isOpen, onClose, selectedSlot, editingEventId }: EventModalProps) {
  const { events, addEvent, updateEvent, deleteEvent, isLoading } = useEvents()

  const [formData, setFormData] = useState<Omit<CalendarEvent, "id">>({
    title: "",
    description: "",
    start: new Date(),
    end: new Date(),
    color: "blue",
  })

  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (editingEventId) {
      const eventToEdit = events.find((e) => e.id === editingEventId)
      if (eventToEdit) {
        setFormData({
          title: eventToEdit.title,
          description: eventToEdit.description || "",
          start: new Date(eventToEdit.start),
          end: new Date(eventToEdit.end),
          color: eventToEdit.color || "blue",
        })
      }
    } else if (selectedSlot) {
      setFormData({
        title: "",
        description: "",
        start: selectedSlot.start,
        end: selectedSlot.end,
        color: "blue",
      })
    }
  }, [editingEventId, selectedSlot, events])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleColorChange = (color: string) => {
    setFormData((prev) => ({ ...prev, color }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      if (editingEventId) {
        await updateEvent(editingEventId, formData)
        onClose("updated", formData.title)
      } else {
        await addEvent(formData)
        onClose("added", formData.title)
      }
    } catch (error) {
      console.error("Erro ao salvar evento:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (editingEventId) {
      setIsSaving(true)
      try {
        const eventToDelete = events.find((e) => e.id === editingEventId)
        await deleteEvent(editingEventId)
        onClose("deleted", eventToDelete?.title)
      } catch (error) {
        console.error("Erro ao excluir evento:", error)
      } finally {
        setIsSaving(false)
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => !isSaving && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingEventId ? "Editar Evento" : "Novo Evento"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              disabled={isSaving}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Início</Label>
              <div className="text-sm">{format(formData.start, "PPp", { locale: pt })}</div>
            </div>

            <div className="space-y-2">
              <Label>Fim</Label>
              <div className="text-sm">{format(formData.end, "PPp", { locale: pt })}</div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <Select value={formData.color} onValueChange={handleColorChange} disabled={isSaving}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COLOR_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-2 bg-${option.value}-500`} />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            {editingEventId && (
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  "Excluir"
                )}
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button type="button" variant="outline" onClick={() => onClose()} disabled={isSaving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingEventId ? "Salvando..." : "Criando..."}
                  </>
                ) : editingEventId ? (
                  "Salvar"
                ) : (
                  "Criar"
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

