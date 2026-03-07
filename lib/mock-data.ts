import type { CryptoPosition, PortfolioSummary } from '@/types/portfolio'

// ---------------------------------------------------------------------------
// Sparkline generator — realistic random walk from start to end
// ---------------------------------------------------------------------------

function generateSparkline(
  start: number,
  end: number,
  points: number,
  volatility: number
): number[] {
  const data: number[] = [start]
  const drift = (end - start) / points

  // Use a seeded approach for deterministic output across renders.
  // We use a simple LCG so the sparklines don't jump on every import.
  let seed = Math.round(start * 100 + end * 100 + points)
  function seededRandom(): number {
    seed = (seed * 1664525 + 1013904223) & 0x7fffffff
    return seed / 0x7fffffff
  }

  for (let i = 1; i < points; i++) {
    const prev = data[i - 1]
    const noise = (seededRandom() - 0.5) * 2 * volatility * prev
    const progress = i / points
    // Pull toward the target end value as we get closer
    const pull = (end - prev) * progress * 0.05
    const next = prev + drift + noise + pull
    data.push(Math.max(next, start * 0.8)) // floor at 80% of start to avoid negatives
  }

  // Ensure the last point is the target end value
  data[data.length - 1] = end
  return data
}

// ---------------------------------------------------------------------------
// Mock positions — "futures trader entering crypto" portfolio
// ---------------------------------------------------------------------------

const now = new Date().toISOString()

export const MOCK_POSITIONS: CryptoPosition[] = [
  {
    id: 'mock-btc',
    user_id: 'mock-user',
    source: 'manual',
    source_id: null,
    asset: 'BTC',
    chain: null,
    quantity: 0.52,
    avg_entry_price: 78400,
    current_price: 84230,
    unrealized_pnl: 3031.6,
    unrealized_pnl_pct: 7.44,
    allocation_pct: 0, // recalculated below
    last_updated: now,
  },
  {
    id: 'mock-eth',
    user_id: 'mock-user',
    source: 'manual',
    source_id: null,
    asset: 'ETH',
    chain: null,
    quantity: 4.2,
    avg_entry_price: 2340,
    current_price: 2180,
    unrealized_pnl: -672,
    unrealized_pnl_pct: -6.84,
    allocation_pct: 0,
    last_updated: now,
  },
  {
    id: 'mock-sol',
    user_id: 'mock-user',
    source: 'manual',
    source_id: null,
    asset: 'SOL',
    chain: null,
    quantity: 48,
    avg_entry_price: 142,
    current_price: 138.5,
    unrealized_pnl: -168,
    unrealized_pnl_pct: -2.46,
    allocation_pct: 0,
    last_updated: now,
  },
  {
    id: 'mock-link',
    user_id: 'mock-user',
    source: 'manual',
    source_id: null,
    asset: 'LINK',
    chain: null,
    quantity: 180,
    avg_entry_price: 14.2,
    current_price: 16.85,
    unrealized_pnl: 477,
    unrealized_pnl_pct: 18.66,
    allocation_pct: 0,
    last_updated: now,
  },
  {
    id: 'mock-avax',
    user_id: 'mock-user',
    source: 'manual',
    source_id: null,
    asset: 'AVAX',
    chain: null,
    quantity: 95,
    avg_entry_price: 35.5,
    current_price: 34.8,
    unrealized_pnl: -66.5,
    unrealized_pnl_pct: -1.97,
    allocation_pct: 0,
    last_updated: now,
  },
]

// Compute correct allocation percentages
;(function computeAllocations() {
  const totalValue = MOCK_POSITIONS.reduce(
    (sum, p) => sum + p.quantity * p.current_price,
    0
  )
  for (const p of MOCK_POSITIONS) {
    p.allocation_pct = parseFloat(
      (((p.quantity * p.current_price) / totalValue) * 100).toFixed(1)
    )
  }
})()

// ---------------------------------------------------------------------------
// Mock portfolio summary
// ---------------------------------------------------------------------------

export function getMockPortfolioSummary(): PortfolioSummary {
  const totalValue = MOCK_POSITIONS.reduce(
    (sum, p) => sum + p.quantity * p.current_price,
    0
  )
  const totalPnl = MOCK_POSITIONS.reduce((sum, p) => sum + p.unrealized_pnl, 0)
  const costBasis = totalValue - totalPnl
  const totalPnlPct = costBasis > 0 ? (totalPnl / costBasis) * 100 : 0

  return {
    total_value: parseFloat(totalValue.toFixed(2)),
    total_pnl: parseFloat(totalPnl.toFixed(2)),
    total_pnl_pct: parseFloat(totalPnlPct.toFixed(2)),
    btc_correlation: 0.78,
    positions: MOCK_POSITIONS,
    last_updated: now,
  }
}

// ---------------------------------------------------------------------------
// Mock sparklines — 168 data points (7 days, hourly)
// ---------------------------------------------------------------------------

export const MOCK_SPARKLINES: Record<string, number[]> = {
  BTC: generateSparkline(78000, 84230, 168, 0.008),
  ETH: generateSparkline(2300, 2180, 168, 0.012),
  SOL: generateSparkline(145, 138.5, 168, 0.018),
  LINK: generateSparkline(14.5, 16.85, 168, 0.015),
  AVAX: generateSparkline(35, 34.8, 168, 0.014),
}

// ---------------------------------------------------------------------------
// Mock funding rate context — TradFi-translated descriptions for Pelican
// ---------------------------------------------------------------------------

export const MOCK_FUNDING_CONTEXT: Record<string, string> = {
  BTC: 'neutral (0.008%, similar to overnight repo rates in the TradFi world)',
  ETH: 'slightly elevated (0.012%, longs are paying shorts — moderate crowding)',
  SOL: 'elevated (0.025%, significant long crowding — similar to heavily shorted squeeze conditions in reverse)',
  LINK: 'low positive (0.005%, minimal directional bias in derivatives)',
  AVAX: 'negative (-0.003%, shorts paying longs — contrarian bullish signal)',
}
