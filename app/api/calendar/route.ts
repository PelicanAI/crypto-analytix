import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { MOCK_CALENDAR_EVENTS } from '@/lib/mock-data'
import type { CalendarEvent } from '@/types/calendar'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export interface CalendarEventEnriched extends CalendarEvent {
  user_holds: boolean
}

export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const now = new Date()
  const monthParam = searchParams.get('month') || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const assetFilter = searchParams.get('asset')

  // Parse month start/end
  const [yearStr, monthStr] = monthParam.split('-')
  const year = parseInt(yearStr, 10)
  const month = parseInt(monthStr, 10) // 1-indexed
  const monthStart = new Date(year, month - 1, 1).toISOString()
  const monthEnd = new Date(year, month, 1).toISOString()

  try {
    // Try fetching from database first
    let events: CalendarEvent[] = []

    let query = supabase
      .from('calendar_events')
      .select('*')
      .gte('event_date', monthStart)
      .lt('event_date', monthEnd)
      .order('event_date', { ascending: true })

    if (assetFilter) {
      query = query.eq('asset', assetFilter)
    }

    const { data, error } = await query

    if (!error && data && data.length > 0) {
      events = data as CalendarEvent[]
    } else {
      // Fall back to mock data filtered to the requested month
      events = MOCK_CALENDAR_EVENTS.filter((e) => {
        const eventDate = new Date(e.event_date)
        return eventDate >= new Date(monthStart) && eventDate < new Date(monthEnd)
      })

      if (assetFilter) {
        events = events.filter((e) => e.asset === assetFilter)
      }

      events.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
    }

    // Fetch user's held assets for enrichment
    const { data: positions } = await supabase
      .from('crypto_positions')
      .select('asset')
      .eq('user_id', user.id)

    const heldAssets = new Set(
      positions?.map((p: { asset: string }) => p.asset) ?? []
    )

    // Enrich events with user_holds flag
    const enriched: CalendarEventEnriched[] = events.map((event) => ({
      ...event,
      user_holds: event.asset ? heldAssets.has(event.asset) : false,
    }))

    return NextResponse.json({ events: enriched, month: monthParam })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch calendar events' }, { status: 500 })
  }
}
