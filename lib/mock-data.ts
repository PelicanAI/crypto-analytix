import type { CryptoPosition, PortfolioSummary } from '@/types/portfolio'
import type { AnalystPost, CTSignal, WalletSignal, MacroTranslation } from '@/types/signals'

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

// ---------------------------------------------------------------------------
// Mock signal data — analyst calls, CT translations, wallet activity, macro
// ---------------------------------------------------------------------------

export const MOCK_ANALYST_POSTS: AnalystPost[] = [
  {
    id: 'analyst-1',
    analyst_id: 'blake',
    analyst_name: 'Blake Morrow',
    methodology: 'harmonic',
    asset: 'BTC',
    direction: 'bullish',
    title: 'BTC Bullish Bat Pattern Completing at $82,400',
    body: 'The bullish bat pattern on the 4H chart is completing at the 0.886 Fibonacci retracement. This is a high-probability reversal zone with confluence from the 200 EMA. Target: $89,500 with stops below $80,800. Risk/reward: 2.8:1.',
    key_levels: { entry: 82400, target: 89500, stop: 80800 },
    confidence: 78,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'analyst-2',
    analyst_id: 'grega',
    analyst_name: 'Grega Horvat',
    methodology: 'elliott-wave',
    asset: 'ETH',
    direction: 'bearish',
    title: 'ETH Wave 4 Correction Targeting $2,050\u2013$2,100',
    body: 'ETH appears to be in a Wave 4 corrective structure after completing Wave 3 at $2,420. The 38.2% retracement sits at $2,100 and the 50% at $2,050. Expecting a consolidation in this zone before Wave 5 targets $2,800+. TradFi analog: similar to a pullback to the 38.2% fib after an impulse move in ES futures.',
    key_levels: { support: 2050, resistance: 2420, wave5_target: 2800 },
    confidence: 72,
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: 'analyst-3',
    analyst_id: 'ryan',
    analyst_name: 'Ryan Littlestone',
    methodology: 'macro',
    asset: 'BTC',
    direction: 'bullish',
    title: 'DXY Breakdown Supports Crypto Risk-On',
    body: "Dollar index broke below 104 support overnight. In my macro framework, sustained DXY weakness below 104 has preceded BTC rallies of 8\u201315% over the following 2 weeks in 4 of 6 historical instances. Combined with the Fed pivot signals from yesterday's minutes, the macro backdrop is turning favorable for risk assets. This is the TradFi cross-asset signal that most crypto traders miss entirely.",
    key_levels: { dxy_support: 104, btc_upside_target: 91000 },
    confidence: 68,
    created_at: new Date(Date.now() - 8 * 3600000).toISOString(),
  },
  {
    id: 'analyst-4',
    analyst_id: 'grega',
    analyst_name: 'Grega Horvat',
    methodology: 'elliott-wave',
    asset: 'SOL',
    direction: 'bullish',
    title: 'SOL Wave 2 Complete \u2014 Impulsive Wave 3 Setup',
    body: 'SOL completed a textbook ABC correction for Wave 2 at $128. The impulsive structure off the lows shows 5 sub-waves forming. Wave 3 typically extends 1.618x Wave 1, projecting a $185 target. Volume profile confirms accumulation at the lows. In ES terms, this looks like a breakout from a bull flag after a measured pullback.',
    key_levels: { wave2_low: 128, wave3_target: 185, invalidation: 118 },
    confidence: 74,
    created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
  {
    id: 'analyst-5',
    analyst_id: 'blake',
    analyst_name: 'Blake Morrow',
    methodology: 'harmonic',
    asset: 'LINK',
    direction: 'bullish',
    title: 'LINK Gartley Pattern at $14.80 Support',
    body: 'A bullish Gartley pattern is completing near $14.80 with the D-point at the 78.6% retracement. This coincides with the 50 EMA on the daily chart. The pattern projects a move to $19.50 with initial resistance at $17.20. Similar setup to a double bottom at the 78.6% fib on NQ futures.',
    key_levels: { entry: 14800, target_1: 17200, target_2: 19500, stop: 13900 },
    confidence: 70,
    created_at: new Date(Date.now() - 18 * 3600000).toISOString(),
  },
]

export const MOCK_CT_SIGNALS: CTSignal[] = [
  {
    id: 'ct-1',
    source_handle: '@CryptoHayes',
    original_text: 'ETH is cooked below 2.2k. Funding negative, OI dropping, no bid. Next stop 1.8k.',
    translated_text: "Bearish on ETH below $2,200. Derivatives metrics confirm weak positioning: funding rates are negative (shorts paying longs, indicating bearish consensus), open interest is declining (traders closing positions, reducing liquidity), and there's limited buying support. Price target: $1,800.",
    assets: ['ETH'],
    signal_type: 'bearish-derivatives',
    engagement: { likes: 4200, retweets: 890, replies: 312 },
    created_at: new Date(Date.now() - 1 * 3600000).toISOString(),
  },
  {
    id: 'ct-2',
    source_handle: '@DegenSpartan',
    original_text: 'SOL funding at 0.025% lmao shorts getting rekt soon. This is the setup.',
    translated_text: 'SOL perpetual futures funding rate is elevated at 0.025% per 8 hours (~34% annualized). This means long position holders are paying a significant premium. In TradFi terms, think of it as paying 34% annual carry on a leveraged futures position. Historically, when funding reaches these extremes, a short squeeze often follows as the overcrowded long side gets liquidated.',
    assets: ['SOL'],
    signal_type: 'funding-extreme',
    engagement: { likes: 2100, retweets: 445, replies: 187 },
    created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  {
    id: 'ct-3',
    source_handle: '@Pentosh1',
    original_text: 'BTC weekly close above 83k is the confirmation. HTF structure still bullish. Dips are for buying until 78k breaks.',
    translated_text: 'BTC maintaining above $83,000 on the weekly chart confirms the bullish trend remains intact on higher timeframes (HTF). The analysis suggests buying pullbacks as long as $78,000 support holds. In TradFi terms, this is a "buy the dip" strategy with a clear stop-loss level \u2014 similar to buying ES pullbacks in a confirmed uptrend.',
    assets: ['BTC'],
    signal_type: 'trend-confirmation',
    engagement: { likes: 6800, retweets: 1420, replies: 534 },
    created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  {
    id: 'ct-4',
    source_handle: '@GCRClassic',
    original_text: 'LINK is the most undervalued L1 play rn. RWA narrative hasnt even started. 3x from here easy.',
    translated_text: 'Bullish thesis on LINK (Chainlink) as a bet on the Real World Asset (RWA) tokenization narrative. RWA refers to bringing traditional assets (bonds, real estate, commodities) onto blockchain \u2014 think of it as the digitization of asset classes you already trade. The analyst sees 3x upside potential, suggesting LINK at current prices is undervalued relative to its position in this growing sector.',
    assets: ['LINK'],
    signal_type: 'narrative-play',
    engagement: { likes: 3400, retweets: 720, replies: 289 },
    created_at: new Date(Date.now() - 7 * 3600000).toISOString(),
  },
  {
    id: 'ct-5',
    source_handle: '@CryptoCapo_',
    original_text: 'Market structure break on the 4h. BTC losing 82k opens the door to 76k. Be careful out there.',
    translated_text: 'Warning: BTC has broken below a key price structure level on the 4-hour chart. If $82,000 fails as support, the next major support sits at $76,000 \u2014 an 8% decline from current levels. In TradFi terms, this is equivalent to a break below a rising trendline on an intraday chart, suggesting the short-term trend may have reversed.',
    assets: ['BTC'],
    signal_type: 'structure-break',
    engagement: { likes: 5100, retweets: 1050, replies: 478 },
    created_at: new Date(Date.now() - 9 * 3600000).toISOString(),
  },
]

export const MOCK_WALLET_SIGNALS: WalletSignal[] = [
  {
    id: 'wallet-1',
    wallet_address: '0x7f4e...3a2d',
    wallet_label: 'Accumulation Whale',
    archetype: 'apex-predator',
    action: 'accumulate',
    asset: 'ETH',
    amount_usd: 4200000,
    created_at: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: 'wallet-2',
    wallet_address: '0x3b8c...f912',
    wallet_label: 'Smart Money Fund',
    archetype: 'narrative-surfer',
    action: 'distribute',
    asset: 'SOL',
    amount_usd: 1800000,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'wallet-3',
    wallet_address: '0xd4a1...8e3f',
    wallet_label: 'DeFi Whale',
    archetype: 'yield-farmer',
    action: 'accumulate',
    asset: 'LINK',
    amount_usd: 890000,
    created_at: new Date(Date.now() - 3.5 * 3600000).toISOString(),
  },
  {
    id: 'wallet-4',
    wallet_address: '0x91cc...2b7a',
    wallet_label: null,
    archetype: 'apex-predator',
    action: 'accumulate',
    asset: 'BTC',
    amount_usd: 12500000,
    created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  {
    id: 'wallet-5',
    wallet_address: '0x5e2f...c401',
    wallet_label: 'MEV Bot Cluster',
    archetype: 'arbitrageur',
    action: 'transfer',
    asset: 'ETH',
    amount_usd: 3100000,
    created_at: new Date(Date.now() - 8 * 3600000).toISOString(),
  },
  {
    id: 'wallet-6',
    wallet_address: '0xa8b3...1d9e',
    wallet_label: 'Institutional Flow',
    archetype: 'slow-accumulator',
    action: 'accumulate',
    asset: 'BTC',
    amount_usd: 8700000,
    created_at: new Date(Date.now() - 14 * 3600000).toISOString(),
  },
]

export const MOCK_MACRO_TRANSLATIONS: MacroTranslation[] = [
  {
    id: 'macro-1',
    source_type: 'forexanalytix',
    source_title: 'DXY Breaks Below 104 Support',
    source_summary: "Blake's morning macro read: Dollar index broke key support at 104. Risk sentiment shifting to risk-on across G10 pairs.",
    crypto_translation: 'When DXY breaks support, it historically signals dollar weakness that benefits risk assets including crypto. BTC has rallied 8\u201315% in the 2 weeks following DXY support breaks in 4 of 6 historical instances. Your portfolio is positioned to benefit from this macro shift.',
    affected_assets: ['BTC', 'ETH'],
    macro_indicator: 'DXY',
    direction: 'crypto-bullish',
    created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  {
    id: 'macro-2',
    source_type: 'forexanalytix',
    source_title: '10Y Yield Curve Steepening \u2014 Risk-On Signal',
    source_summary: 'Ryan\u2019s yield curve monitor: 2s10s spread widening to +45bp. Historically precedes equity and crypto rallies as credit conditions ease.',
    crypto_translation: 'The yield curve is steepening (long-term rates rising faster than short-term). In TradFi, this signals improving economic outlook and easing financial conditions. For crypto, this environment has correlated with BTC rallies in 5 of 7 prior instances. Think of it as the bond market giving a green light to risk assets.',
    affected_assets: ['BTC', 'ETH', 'SOL'],
    macro_indicator: 'Yield Curve',
    direction: 'crypto-bullish',
    created_at: new Date(Date.now() - 10 * 3600000).toISOString(),
  },
  {
    id: 'macro-3',
    source_type: 'forexanalytix',
    source_title: 'VIX Spike to 22 \u2014 Short-Term Risk-Off',
    source_summary: 'Blake\u2019s risk dashboard: VIX jumped to 22 on tariff escalation fears. Credit spreads widening. Short-term caution warranted.',
    crypto_translation: 'Volatility index (VIX) spiked to 22, indicating elevated fear in equity markets. Crypto typically sells off 5\u201310% during VIX spikes above 20, but recovers within 1\u20132 weeks as volatility normalizes. For context, this is the market equivalent of a risk-off move in S&P futures \u2014 your crypto positions may see temporary pressure.',
    affected_assets: ['BTC', 'ETH', 'SOL'],
    macro_indicator: 'VIX',
    direction: 'crypto-bearish',
    created_at: new Date(Date.now() - 16 * 3600000).toISOString(),
  },
]
