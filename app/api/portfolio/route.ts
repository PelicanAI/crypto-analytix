import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getPrices, getSparklines } from '@/lib/coingecko'
import { getFundingRates } from '@/lib/coinalyze'
import { getMockPortfolioSummary, MOCK_SPARKLINES } from '@/lib/mock-data'
import { logger } from '@/lib/logger'
import type { CryptoPosition } from '@/types/portfolio'
import type { FundingRateData } from '@/lib/coinalyze'

export const maxDuration = 30
export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EnrichedPosition extends CryptoPosition {
  funding_rate?: FundingRateData
  sparkline?: number[]
  price_change_24h?: number
}

interface EnrichedPortfolioResponse {
  total_value: number
  total_pnl: number
  total_pnl_pct: number
  btc_correlation: number | null
  positions: EnrichedPosition[]
  last_updated: string
  is_stale: boolean
  top_performer: { asset: string; change_24h: number } | null
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

/**
 * Pearson correlation coefficient between two arrays of equal length.
 * Returns null if arrays are too short or have zero variance.
 */
function pearsonCorrelation(a: number[], b: number[]): number | null {
  const n = Math.min(a.length, b.length)
  if (n < 10) return null

  const xa = a.slice(0, n)
  const xb = b.slice(0, n)

  const meanA = xa.reduce((s, v) => s + v, 0) / n
  const meanB = xb.reduce((s, v) => s + v, 0) / n

  let num = 0
  let denomA = 0
  let denomB = 0

  for (let i = 0; i < n; i++) {
    const da = xa[i] - meanA
    const db = xb[i] - meanB
    num += da * db
    denomA += da * da
    denomB += db * db
  }

  const denom = Math.sqrt(denomA * denomB)
  if (denom === 0) return null

  return round2(num / denom)
}

// ---------------------------------------------------------------------------
// GET /api/portfolio
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ----- Mock mode -----
  const useMock = request.nextUrl.searchParams.get('mock') === 'true'
  if (useMock) {
    const mockSummary = getMockPortfolioSummary()
    const mockFunding = await getFundingRates(
      mockSummary.positions.map((p) => p.asset)
    )

    const mockPositions: EnrichedPosition[] = mockSummary.positions.map((p) => ({
      ...p,
      funding_rate: mockFunding[p.asset],
      sparkline: MOCK_SPARKLINES[p.asset],
      price_change_24h: round2(
        ((p.current_price - p.avg_entry_price) / p.avg_entry_price) * 100
      ),
    }))

    // Top performer by 24h change
    let topPerformer: EnrichedPortfolioResponse['top_performer'] = null
    for (const p of mockPositions) {
      if (
        p.price_change_24h !== undefined &&
        (topPerformer === null ||
          Math.abs(p.price_change_24h) > Math.abs(topPerformer.change_24h))
      ) {
        topPerformer = { asset: p.asset, change_24h: p.price_change_24h }
      }
    }

    const response: EnrichedPortfolioResponse = {
      total_value: mockSummary.total_value,
      total_pnl: mockSummary.total_pnl,
      total_pnl_pct: mockSummary.total_pnl_pct,
      btc_correlation: mockSummary.btc_correlation,
      positions: mockPositions,
      last_updated: mockSummary.last_updated,
      is_stale: false,
      top_performer: topPerformer,
    }

    return NextResponse.json(response)
  }

  // ----- Real data -----
  const { data: positions, error: dbError } = await supabase
    .from('crypto_positions')
    .select('*')
    .eq('user_id', user.id)

  if (dbError) {
    logger.error('Failed to fetch positions', { error: dbError.message })
    return NextResponse.json(
      { error: 'Failed to fetch portfolio' },
      { status: 500 }
    )
  }

  // No positions — return empty portfolio
  if (!positions || positions.length === 0) {
    const response: EnrichedPortfolioResponse = {
      total_value: 0,
      total_pnl: 0,
      total_pnl_pct: 0,
      btc_correlation: null,
      positions: [],
      last_updated: new Date().toISOString(),
      is_stale: false,
      top_performer: null,
    }
    return NextResponse.json(response)
  }

  // Unique tickers
  const tickers = Array.from(new Set(positions.map((p: CryptoPosition) => p.asset.toUpperCase())))

  // Fetch external data in parallel — never throw
  let isStale = false
  const [prices, sparklines, fundingRates] = await Promise.all([
    getPrices(tickers).catch((err) => {
      logger.error('getPrices failed in portfolio route', {
        error: err instanceof Error ? err.message : String(err),
      })
      isStale = true
      return {} as Record<string, { usd: number; usd_24h_change: number | null }>
    }),
    getSparklines(tickers).catch((err) => {
      logger.error('getSparklines failed in portfolio route', {
        error: err instanceof Error ? err.message : String(err),
      })
      return {} as Record<string, number[]>
    }),
    getFundingRates(tickers).catch((err) => {
      logger.error('getFundingRates failed in portfolio route', {
        error: err instanceof Error ? err.message : String(err),
      })
      return {} as Record<string, FundingRateData>
    }),
  ])

  // If no prices came back at all from CoinGecko, flag stale
  if (Object.keys(prices).length === 0 && tickers.length > 0) {
    isStale = true
  }

  // ----- Enrich positions -----
  const enrichedPositions: EnrichedPosition[] = positions.map(
    (p: CryptoPosition) => {
      const ticker = p.asset.toUpperCase()
      const priceData = prices[ticker]

      const currentPrice = priceData ? priceData.usd : p.current_price
      const unrealizedPnl = round2((currentPrice - p.avg_entry_price) * p.quantity)
      const unrealizedPnlPct =
        p.avg_entry_price > 0
          ? round2(((currentPrice - p.avg_entry_price) / p.avg_entry_price) * 100)
          : 0

      return {
        ...p,
        current_price: currentPrice,
        unrealized_pnl: unrealizedPnl,
        unrealized_pnl_pct: unrealizedPnlPct,
        funding_rate: fundingRates[ticker],
        sparkline: sparklines[ticker],
        price_change_24h: priceData?.usd_24h_change
          ? round2(priceData.usd_24h_change)
          : undefined,
        // allocation_pct recalculated below
        allocation_pct: 0,
      }
    }
  )

  // ----- Calculate totals -----
  const totalValue = round2(
    enrichedPositions.reduce(
      (sum, p) => sum + p.current_price * p.quantity,
      0
    )
  )

  // Recalculate allocation percentages
  if (totalValue > 0) {
    for (const p of enrichedPositions) {
      p.allocation_pct = round2(
        ((p.current_price * p.quantity) / totalValue) * 100
      )
    }
  }

  const totalPnl = round2(
    enrichedPositions.reduce((sum, p) => sum + p.unrealized_pnl, 0)
  )
  const costBasis = totalValue - totalPnl
  const totalPnlPct = costBasis > 0 ? round2((totalPnl / costBasis) * 100) : 0

  // ----- BTC correlation -----
  let btcCorrelation: number | null = null
  const btcSparkline = sparklines['BTC']

  if (btcSparkline && btcSparkline.length >= 10) {
    // Get top 3 non-BTC positions by value
    const nonBtcPositions = enrichedPositions
      .filter((p) => p.asset.toUpperCase() !== 'BTC')
      .sort((a, b) => b.current_price * b.quantity - a.current_price * a.quantity)
      .slice(0, 3)

    const correlations: number[] = []
    for (const pos of nonBtcPositions) {
      const posSparkline = sparklines[pos.asset.toUpperCase()]
      if (posSparkline && posSparkline.length >= 10) {
        const corr = pearsonCorrelation(btcSparkline, posSparkline)
        if (corr !== null) {
          correlations.push(corr)
        }
      }
    }

    if (correlations.length > 0) {
      btcCorrelation = round2(
        correlations.reduce((s, c) => s + c, 0) / correlations.length
      )
    }
  }

  // ----- Top performer -----
  let topPerformer: EnrichedPortfolioResponse['top_performer'] = null
  for (const p of enrichedPositions) {
    if (
      p.price_change_24h !== undefined &&
      (topPerformer === null ||
        Math.abs(p.price_change_24h) > Math.abs(topPerformer.change_24h))
    ) {
      topPerformer = { asset: p.asset, change_24h: p.price_change_24h }
    }
  }

  // ----- Response -----
  const response: EnrichedPortfolioResponse = {
    total_value: totalValue,
    total_pnl: totalPnl,
    total_pnl_pct: totalPnlPct,
    btc_correlation: btcCorrelation,
    positions: enrichedPositions,
    last_updated: new Date().toISOString(),
    is_stale: isStale,
    top_performer: topPerformer,
  }

  return NextResponse.json(response)
}
