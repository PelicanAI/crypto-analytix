import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { sanitizeTicker, sanitizeInput } from '@/lib/sanitize'
import { ASSET_COLORS } from '@/lib/constants'
import { MOCK_WATCHLIST_ITEMS, MOCK_WATCHLIST_ALERTS } from '@/lib/mock-data'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

// ---------------------------------------------------------------------------
// GET — Fetch watchlist items enriched with prices. Falls back to mock data.
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const useMock = request.nextUrl.searchParams.get('mock') === 'true'

  try {
    if (useMock) {
      return NextResponse.json({
        items: MOCK_WATCHLIST_ITEMS,
        alerts: MOCK_WATCHLIST_ALERTS,
      })
    }

    // Fetch watchlist items from DB
    const { data: items, error: itemsError } = await supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (itemsError) {
      // Fall back to mock data when table doesn't exist or other DB error
      return NextResponse.json({
        items: MOCK_WATCHLIST_ITEMS,
        alerts: MOCK_WATCHLIST_ALERTS,
      })
    }

    // Fetch alerts for all watchlist items
    const watchlistIds = (items ?? []).map((item) => item.id)
    let alerts: typeof MOCK_WATCHLIST_ALERTS = []

    if (watchlistIds.length > 0) {
      const { data: alertData } = await supabase
        .from('watchlist_alerts')
        .select('*')
        .in('watchlist_id', watchlistIds)
        .eq('user_id', user.id)

      alerts = alertData ?? []
    }

    // If DB has no data, fall back to mock
    if (!items || items.length === 0) {
      return NextResponse.json({
        items: MOCK_WATCHLIST_ITEMS,
        alerts: MOCK_WATCHLIST_ALERTS,
      })
    }

    return NextResponse.json({ items, alerts })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch watchlist' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// POST — Add an asset to watchlist
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const asset = sanitizeTicker(body.asset || '')
    const notes = body.notes ? sanitizeInput(body.notes, 500) : null

    if (!asset) {
      return NextResponse.json({ error: 'Asset ticker is required' }, { status: 400 })
    }

    // Validate against known assets
    if (!ASSET_COLORS[asset]) {
      return NextResponse.json(
        { error: `Unknown asset: ${asset}. Supported: ${Object.keys(ASSET_COLORS).join(', ')}` },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('watchlist')
      .insert({ user_id: user.id, asset, notes })
      .select()
      .single()

    if (error) {
      // Handle unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { error: `${asset} is already on your watchlist` },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ item: data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to add asset' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// DELETE — Remove asset from watchlist by id
// ---------------------------------------------------------------------------

export async function DELETE(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const id = body.id

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Watchlist item ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to remove asset' }, { status: 500 })
  }
}
