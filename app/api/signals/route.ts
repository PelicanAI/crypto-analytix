import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import {
  MOCK_ANALYST_POSTS,
  MOCK_CT_SIGNALS,
  MOCK_WALLET_SIGNALS,
  MOCK_MACRO_TRANSLATIONS,
} from '@/lib/mock-data'
import type { SignalFeedItem, SignalFilter, SignalFeedResponse } from '@/types/signals'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const type = (searchParams.get('type') || 'all') as SignalFilter
  const asset = searchParams.get('asset')
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50)
  const before = searchParams.get('before')
  const useMock = searchParams.get('mock') === 'true'

  try {
    let signals: SignalFeedItem[] = []

    if (useMock) {
      signals = buildMockFeed(type, asset, limit, before)
    } else {
      signals = await fetchFromDatabase(supabase, type, asset, limit, before)

      // Fall back to mock data if database is empty
      if (signals.length === 0) {
        signals = buildMockFeed(type, asset, limit, before)
      }
    }

    const response: SignalFeedResponse = {
      signals,
      has_more: signals.length === limit,
      next_cursor: signals.length > 0 ? signals[signals.length - 1].data.created_at : null,
    }

    return NextResponse.json(response)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch signals' }, { status: 500 })
  }
}

function buildMockFeed(
  type: SignalFilter,
  asset: string | null,
  limit: number,
  before: string | null
): SignalFeedItem[] {
  let items: SignalFeedItem[] = []

  if (type === 'all' || type === 'analyst') {
    items.push(...MOCK_ANALYST_POSTS.map((data) => ({ type: 'analyst' as const, data })))
  }
  if (type === 'all' || type === 'ct') {
    items.push(...MOCK_CT_SIGNALS.map((data) => ({ type: 'ct' as const, data })))
  }
  if (type === 'all' || type === 'onchain') {
    items.push(...MOCK_WALLET_SIGNALS.map((data) => ({ type: 'onchain' as const, data })))
  }
  if (type === 'all' || type === 'macro') {
    items.push(...MOCK_MACRO_TRANSLATIONS.map((data) => ({ type: 'macro' as const, data })))
  }

  // Filter by asset
  if (asset) {
    items = items.filter((item) => {
      if (item.type === 'analyst') return item.data.asset === asset
      if (item.type === 'ct') return item.data.assets.includes(asset)
      if (item.type === 'onchain') return item.data.asset === asset
      if (item.type === 'macro') return item.data.affected_assets.includes(asset)
      return false
    })
  }

  // Apply cursor pagination
  if (before) {
    items = items.filter((item) => new Date(item.data.created_at) < new Date(before))
  }

  // Sort by created_at desc
  items.sort((a, b) => new Date(b.data.created_at).getTime() - new Date(a.data.created_at).getTime())

  return items.slice(0, limit)
}

async function fetchFromDatabase(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  type: SignalFilter,
  asset: string | null,
  limit: number,
  before: string | null
): Promise<SignalFeedItem[]> {
  const items: SignalFeedItem[] = []
  const perTable = type === 'all' ? Math.ceil(limit / 4) + 2 : limit

  if (type === 'all' || type === 'analyst') {
    let query = supabase
      .from('analyst_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(perTable)
    if (asset) query = query.eq('asset', asset)
    if (before) query = query.lt('created_at', before)
    const { data } = await query
    if (data) items.push(...data.map((d) => ({ type: 'analyst' as const, data: d })))
  }

  if (type === 'all' || type === 'ct') {
    let query = supabase
      .from('ct_signals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(perTable)
    if (asset) query = query.contains('assets', [asset])
    if (before) query = query.lt('created_at', before)
    const { data } = await query
    if (data) items.push(...data.map((d) => ({ type: 'ct' as const, data: d })))
  }

  if (type === 'all' || type === 'onchain') {
    let query = supabase
      .from('wallet_signals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(perTable)
    if (asset) query = query.eq('asset', asset)
    if (before) query = query.lt('created_at', before)
    const { data } = await query
    if (data) items.push(...data.map((d) => ({ type: 'onchain' as const, data: d })))
  }

  if (type === 'all' || type === 'macro') {
    let query = supabase
      .from('macro_translations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(perTable)
    if (asset) query = query.contains('affected_assets', [asset])
    if (before) query = query.lt('created_at', before)
    const { data } = await query
    if (data) items.push(...data.map((d) => ({ type: 'macro' as const, data: d })))
  }

  // Sort merged results by created_at desc
  items.sort((a, b) => new Date(b.data.created_at).getTime() - new Date(a.data.created_at).getTime())

  return items.slice(0, limit)
}
