export type ViewType = "month" | "week"

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: Date | string
  end: Date | string
  color?: string
}

