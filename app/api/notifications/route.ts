import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// Default notification preferences for new users
// ---------------------------------------------------------------------------

const DEFAULTS = {
  daily_brief: true,
  funding_rate: true,
  whale_moves: true,
  analyst_calls: true,
  price_levels: true,
  calendar_events: true,
  trading_rule_violations: true,
  correlation: true,
}

const ALLOWED_KEYS = new Set(Object.keys(DEFAULTS))

// ---------------------------------------------------------------------------
// GET /api/notifications — fetch user notification preferences
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      logger.error('Failed to fetch notification preferences', { error: error.message })
      return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json(DEFAULTS)
    }

    // Return only the preference fields, not user_id or id
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
const { user_id, id, ...preferences } = data
    return NextResponse.json(preferences)
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    logger.error('Notification preferences GET failed', { error: error.message })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/notifications — update user notification preferences
// ---------------------------------------------------------------------------

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate: only allow known preference keys with boolean values
    const updates: Record<string, boolean> = {}
    for (const [key, value] of Object.entries(body)) {
      if (ALLOWED_KEYS.has(key) && typeof value === 'boolean') {
        updates[key] = value
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid preference fields provided' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert(
        { user_id: user.id, ...updates },
        { onConflict: 'user_id' }
      )
      .select()
      .single()

    if (error) {
      logger.error('Failed to update notification preferences', { error: error.message })
      return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 })
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
const { user_id, id, ...preferences } = data
    return NextResponse.json(preferences)
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    logger.error('Notification preferences PATCH failed', { error: error.message })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
