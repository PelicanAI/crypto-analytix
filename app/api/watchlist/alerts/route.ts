import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { AlertType } from '@/types/watchlist'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const VALID_ALERT_TYPES: AlertType[] = [
  'price-above',
  'price-below',
  'funding-above',
  'funding-below',
  'whale-activity',
  'analyst-call',
]

// ---------------------------------------------------------------------------
// POST — Create an alert on a watchlist item
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { watchlist_id, alert_type, condition } = body

    if (!watchlist_id || typeof watchlist_id !== 'string') {
      return NextResponse.json({ error: 'watchlist_id is required' }, { status: 400 })
    }

    if (!VALID_ALERT_TYPES.includes(alert_type)) {
      return NextResponse.json(
        { error: `Invalid alert_type. Must be one of: ${VALID_ALERT_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate condition for price/funding types
    if (['price-above', 'price-below'].includes(alert_type)) {
      if (!condition?.price || typeof condition.price !== 'number' || condition.price <= 0) {
        return NextResponse.json({ error: 'Price threshold must be a positive number' }, { status: 400 })
      }
    }

    if (['funding-above', 'funding-below'].includes(alert_type)) {
      if (condition?.rate === undefined || typeof condition.rate !== 'number') {
        return NextResponse.json({ error: 'Funding rate threshold is required' }, { status: 400 })
      }
    }

    // Verify watchlist_id belongs to user
    const { data: watchlistItem, error: lookupError } = await supabase
      .from('watchlist')
      .select('id')
      .eq('id', watchlist_id)
      .eq('user_id', user.id)
      .single()

    if (lookupError || !watchlistItem) {
      return NextResponse.json({ error: 'Watchlist item not found' }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('watchlist_alerts')
      .insert({
        user_id: user.id,
        watchlist_id,
        alert_type,
        condition: condition ?? {},
        enabled: true,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ alert: data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// DELETE — Remove an alert by id
// ---------------------------------------------------------------------------

export async function DELETE(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id } = body

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Alert ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('watchlist_alerts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete alert' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// PATCH — Toggle alert enabled/disabled
// ---------------------------------------------------------------------------

export async function PATCH(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, enabled } = body

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Alert ID is required' }, { status: 400 })
    }

    if (typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'enabled must be a boolean' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('watchlist_alerts')
      .update({ enabled })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ alert: data })
  } catch {
    return NextResponse.json({ error: 'Failed to toggle alert' }, { status: 500 })
  }
}
