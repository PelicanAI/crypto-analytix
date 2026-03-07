import type { CryptoPosition, PortfolioSummary } from '@/types/portfolio'
import type { AnalystPost, CTSignal, WalletSignal, MacroTranslation } from '@/types/signals'
import type {
  EducationModule,
  EducationProgress,
  EducationOverview,
} from '@/types/education'

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

// ---------------------------------------------------------------------------
// Mock education modules — TradFi-to-crypto curriculum
// ---------------------------------------------------------------------------

export const MOCK_EDUCATION_MODULES: EducationModule[] = [
  {
    slug: 'spot-vs-futures',
    title: 'Spot vs Futures in Crypto',
    description: 'Understand the difference between buying crypto directly and trading crypto futures — and why it matters for your strategy.',
    tradfi_analog: 'Buying physical gold vs trading GC futures on COMEX',
    category: 'fundamentals',
    estimated_minutes: 4,
    sort_order: 1,
    prerequisites: [],
    content: {
      sections: [
        {
          type: 'intro',
          heading: 'What You Already Know',
          body: 'As a futures trader, you already understand the distinction between owning a physical commodity and holding a futures contract on that commodity. When you trade ES, you never take delivery of 500 stocks — you are trading a derivative contract that tracks the S&P 500 index. When you trade GC, you are not storing gold bars in your basement. You are trading standardized contracts with expiration dates, margin requirements, and settlement procedures. This same spot-versus-derivative distinction exists in crypto, but with important structural differences that affect how you manage risk and size positions.',
        },
        {
          type: 'concept',
          heading: 'How It Works in Crypto',
          body: 'In crypto, "spot" means buying and owning the actual cryptocurrency — 1 BTC in your wallet is 1 BTC. You own the asset outright, there is no expiration date, no margin call, and no counterparty risk beyond the exchange or wallet holding your coins. Crypto futures come in two flavors: traditional dated futures (like CME BTC futures that expire quarterly, which work almost identically to what you trade now) and perpetual swaps (a crypto-native innovation with no expiration date — more on this in the next module). The key difference from TradFi: most crypto "futures" trading happens on perpetual swaps, not dated contracts. Over 75% of crypto derivatives volume is in perps.',
        },
        {
          type: 'tradfi_bridge',
          heading: 'The TradFi Bridge',
          body: 'Think of spot crypto like buying physical gold and storing it in a vault. You own the asset, you bear the custody risk, and your P&L is purely the price movement. Crypto futures on CME work almost identically to the GC or ES contracts you already trade: standardized sizes, quarterly expiration, cash-settled (no delivery of actual BTC), and cleared through a regulated exchange. The major difference is that in crypto, most leveraged trading happens on perpetual swaps on offshore exchanges (Binance, Bybit, OKX) rather than on CME. These perp markets often have more liquidity and tighter spreads than CME, but come with different counterparty risk since they are not regulated like CME/CFTC-supervised markets.',
        },
        {
          type: 'example',
          heading: 'A Concrete Example',
          body: 'Say you want $50,000 of BTC exposure. Spot: you buy 0.59 BTC at $84,230 on Coinbase. You now own 0.59 BTC. No margin, no liquidation, no expiration. If BTC drops 20%, you are down $10,000 but you still own your BTC and can hold indefinitely. CME futures: you buy 1 Micro BTC contract (1/10 of 1 BTC, ~$8,423 notional) with roughly $1,800 initial margin. To get $50,000 notional, you need about 6 contracts. If BTC drops 20%, you lose $10,000 against ~$10,800 margin — you will face a margin call. The leverage amplifies both gains and losses, just like any futures product you trade today. The P&L math is identical to what you know.',
        },
        {
          type: 'key_takeaway',
          heading: 'Key Takeaway',
          body: 'Spot crypto is the simplest way to get exposure — you own the asset, there is no expiration or margin. Crypto futures on CME work like the contracts you already trade. Perpetual swaps are the dominant crypto derivative and have no TradFi equivalent — understanding them is essential and covered in the next module. For a TradFi trader entering crypto, starting with spot positions while you learn the market structure is the lowest-risk approach.',
        },
      ],
      quiz: [
        {
          question: 'What is the main difference between spot crypto and crypto futures?',
          options: [
            'Spot crypto is always cheaper than futures',
            'Spot means owning the actual asset with no expiration or margin; futures are derivative contracts with leverage and potential liquidation',
            'Futures are only available for Bitcoin',
            'Spot crypto cannot be traded on exchanges',
          ],
          correct: 1,
          explanation: 'Spot means you own the actual cryptocurrency outright — no expiration, no margin calls, no liquidation risk. Futures are derivative contracts where you trade with leverage and face margin requirements, just like ES or GC futures in TradFi.',
        },
        {
          question: 'Which crypto derivative dominates trading volume and has no direct TradFi equivalent?',
          options: [
            'CME Bitcoin futures',
            'Bitcoin options on Deribit',
            'Perpetual swaps (perps)',
            'Crypto ETFs',
          ],
          correct: 2,
          explanation: 'Perpetual swaps account for over 75% of crypto derivatives volume. Unlike CME futures which expire quarterly (just like TradFi), perps never expire and use a funding rate mechanism to keep prices anchored to spot. This is a crypto-native innovation with no direct analog in traditional markets.',
        },
      ],
    },
  },
  {
    slug: 'perpetual-swaps',
    title: 'Perpetual Swaps Explained',
    description: 'The crypto-native derivative that dominates trading volume. Learn how perps work, why they never expire, and what the funding mechanism means.',
    tradfi_analog: 'An ES futures contract that auto-rolls every 8 hours with a variable roll cost',
    category: 'derivatives',
    estimated_minutes: 5,
    sort_order: 2,
    prerequisites: [],
    content: {
      sections: [
        {
          type: 'intro',
          heading: 'What You Already Know',
          body: 'You are familiar with the mechanics of futures contract rollovers. Every quarter, you roll your ES or NQ positions from the expiring front month to the next contract. The roll cost depends on the contango or backwardation in the term structure — if the front month is trading below the next expiry, you pay a premium to roll forward. You manage this routinely. Now imagine a futures contract that never expires and instead of quarterly rolls, automatically adjusts every 8 hours through a payment mechanism between longs and shorts. That is a perpetual swap, and it is the most heavily traded instrument in all of crypto.',
        },
        {
          type: 'concept',
          heading: 'How Perpetual Swaps Work',
          body: 'A perpetual swap (perp) tracks the spot price of a cryptocurrency but never settles or expires. To keep the perp price anchored to spot, exchanges use a "funding rate" — a periodic payment exchanged directly between long and short position holders every 8 hours (some exchanges use 1-hour or 4-hour intervals). When the perp trades above spot (market is net long/bullish), longs pay shorts. When the perp trades below spot (market is net short/bearish), shorts pay longs. This creates an economic incentive for traders to take the other side and push the perp price back toward spot. Perps typically offer leverage up to 100x (though 5-20x is standard for non-degenerate trading), and positions can be held indefinitely as long as you maintain sufficient margin and can absorb funding payments.',
        },
        {
          type: 'tradfi_bridge',
          heading: 'The TradFi Bridge',
          body: 'The closest TradFi analogy is an auto-rolling futures contract where the roll cost changes dynamically based on supply and demand for leverage. Imagine if your ES futures position automatically rolled every 8 hours, and the roll cost was determined by whether more traders were long or short at that moment. When the market is euphoric and everyone is leveraged long, you would pay a hefty roll premium — like rolling into a steep contango. When the market is fearful and skewed short, you would actually receive a payment for holding your long — like rolling into backwardation. The funding rate IS the roll cost, just paid continuously instead of quarterly. Another useful analogy: funding is similar to the overnight repo rate in fixed income. Longs are effectively borrowing to maintain leveraged exposure, and the funding rate is the cost of that leverage.',
        },
        {
          type: 'example',
          heading: 'Perp Trading in Practice',
          body: 'You open a $100,000 long BTC perpetual swap position on Bybit with 10x leverage, posting $10,000 as margin. The current funding rate is +0.01% every 8 hours. Every 8 hours, you pay 0.01% of your $100,000 position = $10. That is $30/day or roughly $10,950/year — an 10.95% annualized cost on your position. If BTC rises 5% ($4,200 move), your P&L is +$5,000 on $10,000 margin = 50% return. If BTC drops 5%, you lose $5,000, leaving $5,000 in margin. At roughly 8-9% below entry (depending on the exchange liquidation engine), your position gets liquidated — the exchange force-closes your trade and you lose your margin. This is identical to how margin calls work on leveraged futures, except liquidation in crypto happens automatically with no margin call phone call from your FCM.',
        },
        {
          type: 'key_takeaway',
          heading: 'Key Takeaway',
          body: 'Perpetual swaps are futures contracts that never expire, using a funding rate mechanism to stay anchored to spot price. Think of them as auto-rolling futures with a variable roll cost paid every 8 hours. The funding rate tells you who is paying whom — positive funding means longs pay shorts (bullish crowding), negative means shorts pay longs (bearish crowding). This is the most important crypto-native instrument to understand because it dominates volume and the funding rate is one of the most powerful sentiment indicators in crypto markets.',
        },
      ],
      quiz: [
        {
          question: 'What keeps a perpetual swap price anchored to the spot price?',
          options: [
            'An expiration and settlement date, like CME futures',
            'The funding rate — periodic payments between longs and shorts that incentivize price convergence',
            'A central market maker that guarantees the price',
            'Government regulation requiring price matching',
          ],
          correct: 1,
          explanation: 'The funding rate is the mechanism that keeps perp prices tracking spot. When perps trade above spot, longs pay shorts, incentivizing arbitrageurs to short the perp and buy spot, pushing the price back down. The reverse happens when perps trade below spot. There is no expiration date — just this continuous economic incentive.',
        },
        {
          question: 'When the funding rate is positive (+0.01%), what does this tell you about market positioning?',
          options: [
            'More traders are short — bears are paying bulls',
            'The market is neutral with balanced positioning',
            'More traders are long — longs are paying shorts, indicating bullish crowding',
            'The exchange is charging a fee to all traders equally',
          ],
          correct: 2,
          explanation: 'A positive funding rate means the perpetual swap is trading above spot, indicating net long/bullish positioning. Long position holders pay short position holders every funding interval. In TradFi terms, it is like the futures contract trading at a premium to spot (contango), and you are paying the carry cost to stay long. Elevated positive funding often signals overcrowded longs and can precede a correction.',
        },
      ],
    },
  },
  {
    slug: 'funding-rates',
    title: 'Funding Rates Deep Dive',
    description: 'The most powerful sentiment indicator in crypto derivatives. Learn to read funding like you read the COT report — as a window into market positioning.',
    tradfi_analog: 'Overnight repo rates + CFTC Commitment of Traders positioning data',
    category: 'derivatives',
    estimated_minutes: 6,
    sort_order: 3,
    prerequisites: ['perpetual-swaps'],
    content: {
      sections: [
        {
          type: 'intro',
          heading: 'What You Already Know',
          body: 'As a futures trader, you are familiar with the cost of carry — the interest rate differential between spot and futures prices that determines whether a contract trades at a premium or discount to spot. You probably also follow the CFTC Commitment of Traders (COT) report, which shows you the positioning of commercials, large speculators, and small speculators. When large specs are heavily net long, you know the trade is crowded and a reversal may be near. Funding rates in crypto give you both of these signals in real-time: the cost of maintaining leveraged exposure AND a live positioning indicator, updated every 8 hours instead of weekly like the COT report.',
        },
        {
          type: 'concept',
          heading: 'Funding Rate Mechanics',
          body: 'The funding rate has two components: an interest rate component (usually fixed at 0.01% per 8 hours, representing the base cost of borrowing) and a premium/discount component (variable, based on the difference between the perp price and the spot index price). When demand for longs exceeds shorts, the perp trades above spot, the premium component increases, and longs pay more. The rate is typically expressed as a percentage per 8-hour period. A rate of +0.01% is considered neutral (just the base interest rate). Rates above +0.02% indicate bullish crowding. Rates above +0.05% are extreme — historically, this level has preceded significant pullbacks in 70%+ of cases. Negative funding (shorts paying longs) below -0.01% indicates bearish crowding and has historically preceded bounces.',
        },
        {
          type: 'tradfi_bridge',
          heading: 'The TradFi Bridge',
          body: 'Think of funding as the overnight repo rate for perpetual swaps. When funding is +0.01% every 8 hours, that is roughly 10.95% annualized — comparable to a high-yield overnight borrowing rate. Longs are paying this to shorts, just like how in TradFi the party with the long futures position effectively pays the cost of carry. But the real power is using funding as a positioning indicator, similar to the COT report. When funding spikes to +0.05% across major assets, it tells you the same thing as seeing large speculators at extreme net long positions in the COT data: the trade is crowded, and a reversal is becoming more likely. The advantage over COT? Funding updates every 8 hours (some exchanges every hour), not weekly. You get real-time positioning data that TradFi traders wait days for.',
        },
        {
          type: 'example',
          heading: 'Reading Funding Rates in Practice',
          body: 'Yesterday, BTC perpetual swap funding rate was +0.015% per 8-hour period. If you hold a $100,000 long position: you pay 0.015% x $100,000 = $15 every 8 hours, or $45/day. Annualized, that is $16,425/year or roughly 16.4% of your position. In TradFi terms, that is like paying 16.4% annual financing on a leveraged futures position — expensive, and a sign the market is crowded on the long side. Now compare: SOL funding hit +0.035% yesterday. That is $35 per 8 hours on a $100,000 position, or $105/day, or 38.3% annualized. That is extreme. Historical data shows that when SOL funding exceeds +0.03%, the price dropped within 72 hours in 6 of the last 8 instances. Meanwhile, ETH funding was -0.005% — shorts paying longs. This is a contrarian bullish signal, similar to seeing commercials heavily long on the COT report while large specs are short.',
        },
        {
          type: 'key_takeaway',
          heading: 'Key Takeaway',
          body: 'Funding rates are the crypto equivalent of the overnight repo rate plus the COT report, updated in real-time. Use them the same way: extreme positive funding (above +0.03%) signals overcrowded longs and elevated pullback risk. Negative funding signals overcrowded shorts and potential bounce setups. The annualized cost of carry matters for position sizing — if you are paying 30%+ annualized to hold a long, the trade needs significant upside to justify the carry. Pelican tracks funding across all your holdings and alerts you when rates reach historically significant levels.',
        },
      ],
      quiz: [
        {
          question: 'A funding rate of +0.035% per 8 hours is approximately what annualized cost?',
          options: [
            '3.5% annualized',
            '10.5% annualized',
            '38.3% annualized',
            '105% annualized',
          ],
          correct: 2,
          explanation: 'To annualize an 8-hour funding rate: 0.035% x 3 (periods per day) x 365 = 38.3% annualized. This is an extremely elevated cost of carry. In TradFi terms, imagine paying 38.3% annual interest to maintain a leveraged long position — the trade needs substantial upside to overcome this financing cost. Rates at this level historically signal overcrowded positioning.',
        },
        {
          question: 'How is the funding rate most similar to a TradFi concept you already use?',
          options: [
            'The bid-ask spread on an options chain',
            'The overnight repo rate combined with CFTC Commitment of Traders positioning data',
            'The dividend yield on a stock',
            'The margin requirement set by your FCM',
          ],
          correct: 1,
          explanation: 'The funding rate combines two TradFi concepts: the cost of carry (like the overnight repo rate — what it costs to maintain leveraged exposure) and a real-time positioning indicator (like the COT report, showing whether the market is crowded long or short). Unlike the weekly COT report, funding updates every 8 hours, giving you faster positioning data.',
        },
      ],
    },
  },
  {
    slug: 'custody-wallets',
    title: 'Custody & Wallets',
    description: 'In TradFi, your broker holds your assets. In crypto, you can be your own custodian. Learn the tradeoffs and why "not your keys, not your coins" matters.',
    tradfi_analog: 'Holding bearer bonds in a personal safe vs a brokerage account at Fidelity',
    category: 'fundamentals',
    estimated_minutes: 4,
    sort_order: 4,
    prerequisites: [],
    content: {
      sections: [
        {
          type: 'intro',
          heading: 'What You Already Know',
          body: 'In traditional finance, you never think about custody because it is handled for you. Your ES positions are held by your FCM and cleared through CME. Your stock portfolio sits in a brokerage account protected by SIPC insurance up to $500K. When Lehman Brothers collapsed, customer assets were segregated and eventually returned because of SIPC protections and regulatory frameworks. You trust this system because it has decades of legal precedent and regulatory oversight. Crypto operates differently. While you can hold crypto on an exchange (similar to a brokerage account), you also have the option to take direct custody — something that has no real equivalent in modern TradFi outside of holding physical cash or bearer instruments.',
        },
        {
          type: 'concept',
          heading: 'Crypto Custody Models',
          body: 'There are three custody models in crypto. Exchange custody: you keep crypto on Coinbase, Kraken, or another exchange. They hold the private keys (think of private keys as the combination to your safe). This feels familiar — it is like a brokerage account. But exchanges are not SIPC-insured and have historically been hacked or gone bankrupt (Mt. Gox, FTX). Self-custody with a hot wallet: a software wallet on your phone or computer (like MetaMask). You control the private keys, but the keys are on an internet-connected device. Self-custody with a cold wallet: a hardware device (like Ledger or Trezor) that stores your keys offline. This is the most secure option — analogous to storing bearer bonds in a fireproof safe that is never connected to the internet. The tradeoff: if you lose your private keys or seed phrase, there is no customer service to call. The assets are gone permanently.',
        },
        {
          type: 'tradfi_bridge',
          heading: 'The TradFi Bridge',
          body: 'Think of it this way. Exchange custody (Coinbase/Kraken) is like a brokerage account at Fidelity — convenient, but you are trusting a third party. The difference: Fidelity is regulated by the SEC/FINRA with SIPC insurance; crypto exchanges have less regulatory protection (though this is improving with licensed custodians like Coinbase Prime). Self-custody is like holding physical bearer bonds or gold bars in a personal safe. Nobody can freeze your account, nobody can deny you access, but if your house burns down and you did not back up the combination, everything is lost. The "seed phrase" (a 12 or 24 word recovery phrase) IS the combination to the safe. If someone gets it, they can take everything. If you lose it and your device fails, your crypto is permanently inaccessible.',
        },
        {
          type: 'example',
          heading: 'Practical Custody Decisions',
          body: 'For a TradFi trader entering crypto, the practical approach is layered custody. Active trading capital: keep on a reputable regulated exchange (Coinbase, Kraken, Gemini). These have insurance programs, SOC 2 compliance, and regulatory oversight. This is your "brokerage account." Long-term holdings (more than you would risk losing on an exchange): move to a hardware wallet like Ledger Nano X ($150). Write down your 24-word seed phrase on metal (not paper — fire/water risk) and store it in a bank safe deposit box. This is your "personal vault." For reference, when FTX collapsed in November 2022, users with assets on the exchange lost access to approximately $8 billion. Users who had moved their crypto to self-custody beforehand were completely unaffected. This is why the crypto community says "not your keys, not your coins."',
        },
        {
          type: 'key_takeaway',
          heading: 'Key Takeaway',
          body: 'Crypto custody is a spectrum between convenience (exchange accounts) and security (self-custody). As a TradFi trader, start with exchange custody on regulated platforms — it feels familiar and works well for active trading. As your holdings grow, consider moving long-term positions to a hardware wallet. The seed phrase is the single most important thing to protect. Never store it digitally, never share it, and always have a physical backup in a secure location. Crypto Analytix connects to your exchange accounts via read-only API access — we never have withdrawal permissions or access to your private keys.',
        },
      ],
      quiz: [
        {
          question: 'What is a "seed phrase" in crypto custody?',
          options: [
            'A password you set on your exchange account',
            'A 12 or 24 word recovery phrase that controls access to your crypto — like the combination to a safe holding bearer bonds',
            'A two-factor authentication code from Google Authenticator',
            'A special API key provided by your exchange',
          ],
          correct: 1,
          explanation: 'A seed phrase (also called a recovery phrase or mnemonic) is a sequence of 12 or 24 words that mathematically generates all the private keys for your wallet. Anyone with this phrase can access and move your crypto. If you lose it and your device fails, your assets are permanently inaccessible. In TradFi terms, it is like the combination to a vault holding bearer instruments — whoever has the combination controls the assets.',
        },
        {
          question: 'Which custody approach most closely mirrors how your current brokerage account works?',
          options: [
            'A hardware wallet stored in a safe deposit box',
            'A hot wallet app on your smartphone',
            'Exchange custody on a regulated platform like Coinbase or Kraken',
            'Printing private keys on paper and storing them at home',
          ],
          correct: 2,
          explanation: 'Exchange custody on regulated platforms is the closest to the brokerage model you are used to. Coinbase, Kraken, and Gemini operate with regulatory oversight, insurance programs, and account recovery processes. The key difference from TradFi: these exchanges are not SIPC-insured, so the protection level is lower than your Fidelity or Schwab account. But for active trading capital, it is the most practical starting point.',
        },
      ],
    },
  },
  {
    slug: 'exchange-risk',
    title: 'Exchange Risk & Counterparty Risk',
    description: 'FTX collapsed and $8 billion vanished. Learn how crypto exchange risk differs from your regulated broker, and how to protect yourself.',
    tradfi_analog: 'MF Global / Lehman Brothers counterparty risk, but without SIPC insurance',
    category: 'risk',
    estimated_minutes: 5,
    sort_order: 5,
    prerequisites: [],
    content: {
      sections: [
        {
          type: 'intro',
          heading: 'What You Already Know',
          body: 'Counterparty risk is not a new concept to you. When MF Global collapsed in 2011, $1.6 billion in customer funds were improperly used. When Lehman Brothers failed in 2008, the unwind took years. You understand that every time you deposit money with a broker, you are trusting a counterparty. The difference: in TradFi, you have SIPC insurance (up to $500K), CFTC-regulated customer fund segregation, and a legal framework refined over decades. Your FCM cannot legally commingle your margin funds with their operating capital. In crypto, these protections are still developing. FTX proved in November 2022 that even a $32 billion exchange can commit fraud, commingle customer funds, and collapse overnight — taking $8 billion in customer assets with it.',
        },
        {
          type: 'concept',
          heading: 'Crypto Exchange Risk Landscape',
          body: 'Crypto exchange risk falls into several categories. Insolvency risk: the exchange runs out of money (FTX). Hack risk: external attackers steal funds (Mt. Gox lost 850,000 BTC in 2014; Bitfinex lost $72M in 2016). Regulatory risk: governments freeze or shut down exchanges (Binance has been restricted in multiple jurisdictions). Commingling risk: the exchange uses customer deposits for their own trading or lending (FTX/Alameda). Withdrawal risk: the exchange halts withdrawals during market stress, preventing you from accessing your capital when you need it most. The good news: the regulatory landscape is improving. Coinbase is publicly listed and SEC-regulated. Kraken has a banking charter. CME offers regulated BTC/ETH futures cleared through established infrastructure. The post-FTX era has accelerated regulation.',
        },
        {
          type: 'tradfi_bridge',
          heading: 'The TradFi Bridge',
          body: 'The best TradFi analogy: imagine trading through a broker that is not FINRA-regulated, not SIPC-insured, and operates from an offshore jurisdiction. That was the state of most crypto exchanges until recently. Now compare the risk tiers. CME crypto futures: regulated by CFTC, cleared through CME Clearing, customer funds segregated — identical regulatory protection to your ES/NQ/GC trading. Coinbase/Kraken (US regulated): SEC/state-regulated, audited, proof-of-reserves published, but NOT SIPC-insured. Think of it as a well-run offshore broker with regular audits but without the federal insurance backstop. Binance/Bybit (offshore): not US-regulated, higher liquidity and product range, but you are taking on additional jurisdictional and regulatory risk. Like trading through an unregulated prime broker — the spreads might be better, but your recourse if something goes wrong is limited.',
        },
        {
          type: 'example',
          heading: 'Managing Exchange Risk',
          body: 'A practical risk management framework for crypto exchanges, using TradFi risk principles you already apply. Rule 1: Never have more capital on any single exchange than you can afford to lose entirely. If you would not put $200K with an unregulated offshore broker, do not put $200K on Binance. Rule 2: Diversify exchange exposure. Split active trading capital across 2-3 exchanges. If one freezes withdrawals, you still have capital elsewhere. Rule 3: Use regulated venues when possible. CME for futures (same protections as your current trading). Coinbase or Kraken for spot. Rule 4: Verify proof-of-reserves. Reputable exchanges now publish cryptographic proof that they hold customer assets 1:1. Coinbase, Kraken, and Bitfinex all do this. Rule 5: Move long-term holdings off exchanges entirely (self-custody, covered in the previous module). Only keep active trading capital on exchange — same principle as not keeping your retirement savings in your day-trading margin account.',
        },
        {
          type: 'key_takeaway',
          heading: 'Key Takeaway',
          body: 'Crypto exchange risk is real but manageable with the same counterparty risk principles you already use in TradFi. Prefer regulated exchanges (CME, Coinbase, Kraken). Diversify exchange exposure. Never over-concentrate on a single venue. Move long-term holdings to self-custody. The regulatory environment is rapidly improving — the FTX collapse accelerated oversight worldwide. Crypto Analytix monitors your exchange connections and can alert you to any issues with your connected platforms.',
        },
      ],
      quiz: [
        {
          question: 'Which crypto trading venue offers the most similar regulatory protections to your current futures broker?',
          options: [
            'Binance — it has the most liquidity',
            'CME Bitcoin/Ethereum futures — CFTC-regulated with standard clearing',
            'A decentralized exchange like Uniswap',
            'Any exchange with proof-of-reserves',
          ],
          correct: 1,
          explanation: 'CME crypto futures are regulated by the CFTC and cleared through CME Clearing, offering the same regulatory protections as ES, NQ, or GC futures. Customer funds are segregated, the clearing house guarantees trades, and you trade through your existing FCM. For a TradFi trader, this is the most familiar and protected way to trade crypto derivatives.',
        },
        {
          question: 'What key protection exists for your stock brokerage account that does NOT exist for most crypto exchange accounts?',
          options: [
            'Two-factor authentication',
            'SIPC insurance coverage (up to $500K)',
            'The ability to place limit orders',
            'Password-protected account access',
          ],
          correct: 1,
          explanation: 'SIPC insurance protects brokerage customers up to $500,000 if a broker-dealer fails. No crypto exchange currently offers SIPC-equivalent protection. Coinbase has private insurance for some holdings, but it is not federally guaranteed. This is why diversifying exchange exposure and using self-custody for large holdings is important — you are your own risk manager in crypto.',
        },
      ],
    },
  },
  {
    slug: '24-7-trading',
    title: '24/7 Trading & Its Implications',
    description: 'Crypto never closes. No 4:15 PM bell, no weekend break. Learn how this changes risk management, position sizing, and your sleep schedule.',
    tradfi_analog: 'FX markets (24/5) but without the weekend break, plus higher weekend volatility',
    category: 'fundamentals',
    estimated_minutes: 4,
    sort_order: 6,
    prerequisites: [],
    content: {
      sections: [
        {
          type: 'intro',
          heading: 'What You Already Know',
          body: 'If you trade forex, you already handle near-continuous markets — 24 hours a day, 5 days a week, from Sydney open to New York close. You know the rhythm: Asian session is quieter, London open brings volatility, New York/London overlap is peak liquidity. You manage overnight risk through position sizing and stop orders that execute while you sleep. If you trade futures, you have the Sunday night Globex open and overnight sessions. You are not a stranger to markets that move while you are away. But you have always had the weekend. Saturday and Sunday, markets are closed, your positions are frozen, and you can decompress. Crypto eliminates that last safe haven. The market runs 24 hours a day, 7 days a week, 365 days a year. Christmas morning, your birthday, 3 AM on a random Tuesday — it never stops.',
        },
        {
          type: 'concept',
          heading: 'How 24/7 Changes Everything',
          body: 'The most significant impact of 24/7 trading is on risk management. There are no gaps in the traditional sense (like overnight or weekend gaps on stocks), but there are liquidity troughs. Weekend liquidity is typically 30-50% lower than weekday volume. Asian session (8 PM - 4 AM ET) has lower liquidity for USD-denominated pairs. Major moves can happen at any hour — the March 2023 banking crisis moved BTC 15% on a Sunday. Liquidation cascades can happen at 4 AM when you are asleep, and by the time you wake up, your leveraged position may have been liquidated hours ago. The flipside: no gap risk means limit orders and stop-losses execute in real-time (assuming the exchange stays up and the order book has liquidity at your level). Your stop at $80,000 will get hit at or near $80,000, not gapped through to $78,000 on a Monday morning open.',
        },
        {
          type: 'tradfi_bridge',
          heading: 'The TradFi Bridge',
          body: 'Think of crypto as forex trading with three key differences. First, there is no weekend close. In FX, you close your riskier positions Friday afternoon or size down for the weekend. In crypto, the "weekend" is actually when some of the largest moves happen because liquidity is thin and liquidation cascades amplify price swings. Second, there are no circuit breakers. When ES hits limit down, trading halts. When crypto drops 20%, trading continues without pause. Flash crashes to near-zero have happened on individual exchanges (Binance ETH flash crash 2022). Third, settlement is near-instant. In TradFi, T+2 for equities, T+1 for futures. In crypto spot, settlement is typically T+0 — you send crypto and it arrives in minutes (or seconds on fast chains). This changes capital efficiency because you are not waiting for settlement to free up margin.',
        },
        {
          type: 'example',
          heading: 'Adapting Your Risk Management',
          body: 'Practical adaptations for a TradFi trader in a 24/7 market. Position sizing: reduce leverage compared to your TradFi positions. If you use 5x on ES, consider 2-3x on BTC perps, because you cannot monitor the position during all hours and there are no circuit breakers. Stop-losses: always use them on leveraged positions. Unlike stocks that can gap through stops, crypto stops execute in real-time (barring extreme liquidity events). Set stops wider than you would on ES to account for crypto volatility — BTC routinely moves 3-5% intraday, which would be extraordinary for ES. Alerts: set price alerts on your phone for key levels, especially during off-hours. The "What I Missed" feature in Crypto Analytix is specifically designed for this — open the app after sleeping and immediately see what happened to your portfolio and why. Weekend discipline: some traders reduce positions by 30-50% before Friday evening to manage thin weekend liquidity, similar to how you might lighten up before a 3-day holiday weekend.',
        },
        {
          type: 'key_takeaway',
          heading: 'Key Takeaway',
          body: 'Crypto is 24/7 with no circuit breakers and variable liquidity. Adapt by reducing leverage versus your TradFi norms, always using stop-losses on leveraged positions, and building a system for monitoring during off-hours. The biggest danger is not the 24/7 nature itself — it is treating a 24/7 market with the same leverage and position sizing you use in a market that closes at 4:15 PM and gives you a weekend break. Respect the continuous risk exposure by sizing appropriately.',
        },
      ],
      quiz: [
        {
          question: 'What is the biggest risk management implication of crypto trading 24/7?',
          options: [
            'You have to trade 24 hours a day to be profitable',
            'There is never any volatility because the market is always open',
            'Your leveraged positions are exposed to continuous risk with no scheduled breaks, requiring adjusted position sizing and always-on stop-losses',
            'Weekend trading is always more profitable due to lower competition',
          ],
          correct: 2,
          explanation: 'The core implication: your positions are at risk every hour of every day. There is no closing bell to guarantee a break. A liquidation cascade can happen at 3 AM on a Saturday when liquidity is at its thinnest. This means you should reduce leverage compared to TradFi norms, always use stops on leveraged positions, and size positions assuming you cannot intervene for 8+ hours at a time.',
        },
        {
          question: 'How does crypto weekend liquidity compare to weekday liquidity?',
          options: [
            'Weekend liquidity is higher because retail traders are off work',
            'Weekend liquidity is typically 30-50% lower, making prices more susceptible to large moves and liquidation cascades',
            'There is no difference — crypto liquidity is constant',
            'Weekend markets are closed, just like TradFi',
          ],
          correct: 1,
          explanation: 'Weekend crypto liquidity is typically 30-50% lower than weekday volume. This thinner order book means large orders (or liquidation cascades) can move prices more dramatically. Many of the biggest crypto moves have occurred on weekends. Smart risk management means reducing leverage or position size heading into weekends, similar to how you might lighten up before a long holiday weekend in TradFi.',
        },
      ],
    },
  },
  {
    slug: 'token-selection',
    title: 'Token Selection for TradFi Traders',
    description: 'There are 20,000+ tokens. Most are worthless. Learn the framework for evaluating which crypto assets deserve your capital — using analysis principles you already apply.',
    tradfi_analog: 'Stock screening with fundamental + technical filters, but for a new asset class',
    category: 'strategy',
    estimated_minutes: 7,
    sort_order: 7,
    prerequisites: [],
    content: {
      sections: [
        {
          type: 'intro',
          heading: 'What You Already Know',
          body: 'You already have a framework for asset selection. In equities, you screen by market cap, volume, sector, earnings growth, and technical setup. In futures, you trade liquid contracts with sufficient volume and tight spreads — you would never trade a thinly listed agricultural contract without understanding the supply/demand dynamics. You know that liquidity is king, and that trading illiquid instruments amplifies slippage and makes position management difficult. Apply these same principles to crypto. Of the 20,000+ tokens listed on CoinGecko, fewer than 100 have the liquidity, track record, and fundamental underpinnings to deserve serious capital allocation. The other 19,900+ are the crypto equivalent of OTC penny stocks — high risk, high information asymmetry, and dominated by insiders.',
        },
        {
          type: 'concept',
          heading: 'The Crypto Asset Evaluation Framework',
          body: 'Evaluate crypto assets through five lenses. Market cap and liquidity: focus on the top 30 by market cap ($1B+). These have sufficient liquidity for meaningful position sizes without moving the market. Daily trading volume should exceed $100M. Purpose and revenue: does the protocol generate actual revenue? Bitcoin is a store of value/digital gold. Ethereum processes $10B+ in daily transaction volume and generates fee revenue. Solana is a high-speed settlement layer. Chainlink provides oracle data that DeFi protocols depend on. If you cannot articulate what the protocol does and how it generates revenue in two sentences, move on. Network effects: the strongest crypto assets have growing user adoption, developer activity, and ecosystem expansion — similar to how you evaluate a tech stock network effect (more users = more value = more users). Token economics: understand inflation schedule (is the supply increasing, diluting your position?), staking yield (comparable to a dividend), and unlock schedules (large token unlocks act like insider selling). Technical infrastructure: is the blockchain actually used? Transaction count, total value locked in DeFi (TVL), and active addresses are the crypto equivalents of daily active users and revenue metrics.',
        },
        {
          type: 'tradfi_bridge',
          heading: 'The TradFi Bridge',
          body: 'Map your existing screening framework directly. Market cap tiers: BTC and ETH are the "mega-caps" — the AAPL and MSFT of crypto. SOL, ADA, AVAX, LINK, DOT are the "large caps." Everything below the top 30 is progressively riskier, like going from S&P 500 stocks to Russell 2000 to micro-caps. Revenue generation: Ethereum earning $5-15M/day in fees is comparable to a SaaS company with strong recurring revenue. Protocols like Uniswap (decentralized exchange) generate trading fee revenue that accrues to token holders — similar to how exchange stocks like ICE or CME Group generate revenue from transaction fees. Token unlocks are like insider selling windows: when a protocol has 20% of total supply unlocking in a single month, expect selling pressure, just like you would expect selling pressure when a stock IPO lockup expires. Staking yield (3-7% on ETH, SOL, etc.) is comparable to a dividend yield, paid for helping secure the network. The key difference from stocks: most crypto assets do not have earnings in the traditional P/E sense. Valuation frameworks are earlier-stage, more like venture capital metrics (total addressable market, adoption growth rate) than mature equity metrics.',
        },
        {
          type: 'example',
          heading: 'Building a Starting Portfolio',
          body: 'A conservative starting crypto allocation for a TradFi trader. Core holdings (70-80% of crypto allocation): BTC (40-50%) — the "digital gold" thesis. Lowest volatility of major cryptos. Most institutional adoption (ETFs, CME futures, corporate treasuries). If you are only going to hold one crypto asset, this is it. ETH (20-30%) — the "crypto operating system." Generates fee revenue, has a deflationary supply mechanism, and is the foundation of the DeFi ecosystem. Think of it as both the platform and the toll road. Satellite holdings (20-30%): SOL (5-10%) — high-speed alternative to Ethereum. Higher risk/reward, faster growing ecosystem. LINK (5-10%) — infrastructure play on oracle data that all DeFi protocols need. The "picks and shovels" play. This mirrors how you might structure a traditional portfolio: index-like core with selective satellite positions. Start here, and as you learn the market, you can make informed decisions about expanding into more specific sectors (DeFi, Layer 2s, Real World Assets). Never allocate more than 5% to any single asset outside the top 10 by market cap until you deeply understand the tokenomics and risk profile.',
        },
        {
          type: 'key_takeaway',
          heading: 'Key Takeaway',
          body: 'Apply your existing asset selection discipline. Focus on the top 30 by market cap. Demand liquidity (over $100M daily volume). Understand what the protocol does and how it generates value. Watch token unlock schedules like IPO lockup expirations. Start with BTC and ETH as core holdings, then add selective satellite positions as your crypto knowledge grows. The same rule applies here as in TradFi: if you cannot explain why you own it in two sentences, you should not own it. Pelican helps by providing protocol analysis, tokenomics breakdowns, and alerts on token unlocks for assets in your portfolio and watchlist.',
        },
      ],
      quiz: [
        {
          question: 'What is the crypto equivalent of an IPO lockup expiration that you should monitor?',
          options: [
            'Bitcoin halving events',
            'Exchange listing announcements',
            'Token unlock schedules — when large portions of a token supply become available for selling',
            'Smart contract audits',
          ],
          correct: 2,
          explanation: 'Token unlock schedules work just like IPO lockup expirations. When a large portion of tokens (often held by early investors, team members, or the protocol treasury) unlock and become tradeable, expect selling pressure. A protocol with 20% of supply unlocking in a single month faces the same dynamic as a stock with a massive insider selling window. Crypto Analytix tracks these events in the calendar feature.',
        },
        {
          question: 'For a TradFi trader building their first crypto portfolio, which approach aligns best with prudent risk management?',
          options: [
            'Allocate equally across 50 different tokens for maximum diversification',
            'Put everything into one high-conviction small-cap altcoin for maximum upside',
            'Build a core of BTC (40-50%) and ETH (20-30%), with selective satellite positions in top-30 assets for the remainder',
            'Only trade crypto futures on CME, never hold spot',
          ],
          correct: 2,
          explanation: 'A core-satellite approach mirrors prudent portfolio construction in TradFi. BTC and ETH provide the liquid, established core (analogous to holding large-cap index exposure). Selective satellite positions in top-30 assets (SOL, LINK, etc.) provide higher risk/reward exposure. Spreading across 50 tokens creates unmanageable complexity, and concentrating in a single small-cap is imprudent for a new entrant to the asset class.',
        },
      ],
    },
  },
]

// ---------------------------------------------------------------------------
// Mock education progress — 2 completed, 1 in progress
// ---------------------------------------------------------------------------

export const MOCK_EDUCATION_PROGRESS: Record<string, EducationProgress> = {
  'spot-vs-futures': {
    id: 'progress-1',
    user_id: 'mock-user',
    module_slug: 'spot-vs-futures',
    completed: true,
    completed_at: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
    started_at: new Date(Date.now() - 8 * 24 * 3600000).toISOString(),
    quiz_score: 100,
  },
  'perpetual-swaps': {
    id: 'progress-2',
    user_id: 'mock-user',
    module_slug: 'perpetual-swaps',
    completed: true,
    completed_at: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
    started_at: new Date(Date.now() - 6 * 24 * 3600000).toISOString(),
    quiz_score: 50,
  },
  'funding-rates': {
    id: 'progress-3',
    user_id: 'mock-user',
    module_slug: 'funding-rates',
    completed: false,
    completed_at: null,
    started_at: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
    quiz_score: null,
  },
}

// ---------------------------------------------------------------------------
// Mock education overview helper
// ---------------------------------------------------------------------------

export function getMockEducationOverview(): EducationOverview {
  const progress = MOCK_EDUCATION_PROGRESS
  const completedCount = Object.values(progress).filter((p) => p.completed).length

  // Recommended next: first non-completed module whose prerequisites are all met
  let recommendedNext: string | null = null
  for (const mod of MOCK_EDUCATION_MODULES) {
    const prog = progress[mod.slug]
    if (prog?.completed) continue
    const prereqsMet = mod.prerequisites.every((pre) => progress[pre]?.completed)
    if (prereqsMet) {
      // Prefer a module already started, otherwise take the first eligible
      if (prog?.started_at) {
        recommendedNext = mod.slug
        break
      }
      if (!recommendedNext) {
        recommendedNext = mod.slug
      }
    }
  }

  return {
    modules: MOCK_EDUCATION_MODULES,
    progress,
    completedCount,
    totalCount: MOCK_EDUCATION_MODULES.length,
    recommendedNext,
  }
}
