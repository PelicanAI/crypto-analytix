'use client'

import useSWR from 'swr'
import { useState, useMemo, useCallback } from 'react'
import type { CalendarEvent } from '@/types/calendar'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CalendarEventEnriched extends CalendarEvent {
  user_holds: boolean
}

interface CalendarApiResponse {
  events: CalendarEventEnriched[]
  month: string
}

export interface UseCalendarReturn {
  events: CalendarEventEnriched[]
  isLoading: boolean
  error: Error | null
  currentMonth: string                 // YYYY-MM
  setMonth: (month: string) => void
  selectedDate: string | null          // YYYY-MM-DD
  setSelectedDate: (date: string | null) => void
  eventsForDate: (date: string) => CalendarEventEnriched[]
  upcomingEvents: CalendarEventEnriched[]
}

// ---------------------------------------------------------------------------
// Fetcher
// ---------------------------------------------------------------------------

async function calendarFetcher(url: string): Promise<CalendarApiResponse> {
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Calendar fetch failed: ${res.status}`)
  }
  return res.json()
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function useCalendar(): UseCalendarReturn {
  const [currentMonth, setCurrentMonth] = useState<string>(getCurrentMonth)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const url = `/api/calendar?month=${currentMonth}`

  const { data, error, isLoading } = useSWR<CalendarApiResponse>(
    ['calendar', currentMonth],
    () => calendarFetcher(url),
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  )

  const events = data?.events ?? []

  const eventsForDate = useCallback(
    (date: string): CalendarEventEnriched[] => {
      return events.filter((e) => e.event_date.startsWith(date))
    },
    [events]
  )

  const upcomingEvents = useMemo(() => {
    const now = new Date().toISOString()
    return events
      .filter((e) => e.event_date >= now)
      .slice(0, 5)
  }, [events])

  const handleSetMonth = useCallback((month: string) => {
    setCurrentMonth(month)
    setSelectedDate(null)
  }, [])

  return {
    events,
    isLoading,
    error: error ?? null,
    currentMonth,
    setMonth: handleSetMonth,
    selectedDate,
    setSelectedDate,
    eventsForDate,
    upcomingEvents,
  }
}
