import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export const maxDuration = 30
export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface KeyLevel {
  asset: string
  level: string
  type: 'support' | 'resistance'
  note: string
}

interface BriefContent {
  overnight_summary: string
  portfolio_impact: string
  key_levels: KeyLevel[]
  one_thing_to_learn: {
    topic: string
    content: string
  }
  market_snapshot: {
    btc_price: number
    btc_change_24h: number
    eth_price: number
    eth_change_24h: number
    portfolio_value: number
    portfolio_change_24h: number
  }
  generated_at: string
}

// ---------------------------------------------------------------------------
// Mock brief content — realistic and references portfolio assets
// ---------------------------------------------------------------------------

function generateMockBrief(): BriefContent {
  return {
    overnight_summary:
      'Crypto markets traded mixed overnight as BTC held above $84,000 support after briefly testing $83,400. ' +
      'ETH underperformed with continued selling pressure from Ethereum Foundation wallet movements. ' +
      'SOL showed relative strength, bouncing off its 20-day EMA at $136. ' +
      'Macro backdrop remains supportive — DXY weakened below 104 and 10Y yields ticked down to 4.28%. ' +
      'Blake noted in his pre-market that the Dollar weakness is a tailwind for risk assets, ' +
      'similar to the Nov 2023 setup that preceded a 40% BTC rally.',

    portfolio_impact:
      'Your portfolio is up $2,602 (+4.86%) overall. BTC is driving most of the gains at +7.4%, ' +
      'while ETH is the main drag at -6.8%. LINK continues to outperform at +18.7% — ' +
      'the strongest position in your book. AVAX and SOL are both slightly red but holding key levels. ' +
      'Your BTC correlation is 0.78 — moderate. Consider that if BTC pulls back to $80K, ' +
      'your portfolio could see a ~6% drawdown based on current correlation.',

    key_levels: [
      {
        asset: 'BTC',
        level: '$82,400',
        type: 'support',
        note: "Grega's Elliott Wave count puts Wave 4 support here. A break below targets $78,000.",
      },
      {
        asset: 'BTC',
        level: '$87,500',
        type: 'resistance',
        note: 'Previous swing high and heavy options open interest. A close above could trigger $90K+ move.',
      },
      {
        asset: 'ETH',
        level: '$2,100',
        type: 'support',
        note: 'Major support confluence — 200-day MA + horizontal support. Critical to hold for bulls.',
      },
      {
        asset: 'SOL',
        level: '$145',
        type: 'resistance',
        note: 'Daily resistance from March highs. Funding rates are elevated — watch for rejection here.',
      },
    ],

    one_thing_to_learn: {
      topic: 'Funding Rates',
      content:
        'Think of funding rates like overnight repo rates in the futures market. ' +
        'In crypto perpetual contracts, longs and shorts pay each other every 8 hours based on market imbalance. ' +
        'When funding is positive (like SOL at +0.025% right now), longs pay shorts — ' +
        "it's the cost of carrying a long position. At 0.025% per 8 hours, that's roughly 0.075% per day, " +
        "or ~27% annualized. That's significant carry cost. " +
        'When funding goes negative (like AVAX at -0.003%), shorts pay longs — ' +
        "you're getting paid to hold. Historically, extreme positive funding often precedes corrections " +
        'as the trade gets too crowded, similar to a heavily shorted stock becoming a squeeze candidate in reverse.',
    },

    market_snapshot: {
      btc_price: 84230,
      btc_change_24h: 1.82,
      eth_price: 2180,
      eth_change_24h: -1.35,
      portfolio_value: 56170,
      portfolio_change_24h: 0.73,
    },

    generated_at: new Date().toISOString(),
  }
}

// ---------------------------------------------------------------------------
// GET /api/brief
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const useMock = request.nextUrl.searchParams.get('mock') === 'true'

  if (useMock) {
    return NextResponse.json(generateMockBrief())
  }

  // Check for cached brief today
  const today = new Date().toISOString().split('T')[0]

  const { data: cached, error: cacheError } = await supabase
    .from('daily_briefs')
    .select('content, generated_at')
    .eq('user_id', user.id)
    .eq('brief_date', today)
    .maybeSingle()

  if (cacheError) {
    logger.error('Failed to query daily_briefs', { error: cacheError.message })
  }

  if (cached) {
    return NextResponse.json({
      ...cached.content,
      generated_at: cached.generated_at,
    })
  }

  // Generate and cache a new brief
  const brief = generateMockBrief()

  const { error: insertError } = await supabase
    .from('daily_briefs')
    .insert({
      user_id: user.id,
      brief_date: today,
      content: brief,
      generated_at: brief.generated_at,
    })

  if (insertError) {
    logger.error('Failed to cache daily brief', { error: insertError.message })
    // Still return the brief even if caching fails
  }

  return NextResponse.json(brief)
}
