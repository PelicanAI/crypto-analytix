export type CalendarEventType = 'token-unlock' | 'governance' | 'fed-meeting' | 'earnings' | 'expiration' | 'halving' | 'upgrade' | 'other'
export type EventImpact = 'low' | 'medium' | 'high' | 'critical'

export interface CalendarEvent {
  id: string
  title: string
  description: string | null
  event_type: CalendarEventType
  asset: string | null
  event_date: string
  end_date: string | null
  impact: EventImpact
  source: string | null
  source_url: string | null
  pelican_context: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}
