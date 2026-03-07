import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export const maxDuration = 30
export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WhatIMissedResponse {
  show: boolean
  hours_away?: number
  headline?: string
  portfolio_impact?: string
  changes?: { asset: string; change: string; direction: 'up' | 'down' }[]
  action_items?: string[]
}

// ---------------------------------------------------------------------------
// Mock catch-up content
// ---------------------------------------------------------------------------

function generateMockCatchup(hoursAway: number): WhatIMissedResponse {
  return {
    show: true,
    hours_away: hoursAway,
    headline:
      hoursAway > 12
        ? 'BTC tested $83,400 support overnight, SOL bounced strongly'
        : 'BTC pulled back 1.2% but held key support at $83,400',
    portfolio_impact:
      hoursAway > 12
        ? 'Your portfolio dipped $410 (–0.7%) while you were away, mainly from ETH weakness. Now recovering.'
        : 'Your portfolio is roughly flat — BTC dip offset by LINK strength.',
    changes: [
      { asset: 'BTC', change: '-1.2%', direction: 'down' },
      { asset: 'ETH', change: '-2.1%', direction: 'down' },
      { asset: 'SOL', change: '+3.4%', direction: 'up' },
      { asset: 'LINK', change: '+1.8%', direction: 'up' },
    ],
    action_items: [
      'SOL funding rate spiked to +0.03% — elevated carry cost on your position',
      'Blake posted a bearish harmonic on ETH targeting $2,050',
      hoursAway > 12
        ? 'Grega updated his BTC wave count — now sees potential Wave 5 to $92K'
        : 'No major analyst updates while you were away',
    ],
  }
}

// ---------------------------------------------------------------------------
// GET /api/brief/what-i-missed
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const useMock = request.nextUrl.searchParams.get('mock') === 'true'

  if (useMock) {
    // In mock mode, simulate 8 hours away
    return NextResponse.json(generateMockCatchup(8))
  }

  // Query last_active from user_sessions
  const { data: session, error: sessionError } = await supabase
    .from('user_sessions')
    .select('last_active')
    .eq('user_id', user.id)
    .maybeSingle()

  if (sessionError) {
    logger.error('Failed to query user_sessions', { error: sessionError.message })
    return NextResponse.json({ show: false } satisfies WhatIMissedResponse)
  }

  // No session record or active recently
  if (!session) {
    return NextResponse.json({ show: false } satisfies WhatIMissedResponse)
  }

  const lastActive = new Date(session.last_active)
  const hoursAway = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60)

  if (hoursAway < 4) {
    return NextResponse.json({ show: false } satisfies WhatIMissedResponse)
  }

  // Generate catch-up content
  const catchup = generateMockCatchup(Math.round(hoursAway))
  return NextResponse.json(catchup)
}
