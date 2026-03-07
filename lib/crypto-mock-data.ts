// ─── Portfolio Mock Data ─────────────────────────────────────
export interface MockPosition {
  asset: string
  name: string
  quantity: number
  avg_entry_price: number
  current_price: number
  price_change_24h: number
  price_change_7d: number
  unrealized_pnl: number
  unrealized_pnl_pct: number
  allocation_pct: number
  funding_rate: { rate: number; exchange: string } | null
  sparkline: number[]
  volume_24h: number
  pelican_signal: string
}

function generateSparkline(base: number, points: number = 24, volatility: number = 0.02): number[] {
  const data: number[] = [base]
  for (let i = 1; i < points; i++) {
    const change = (Math.random() - 0.48) * volatility * base
    data.push(Math.max(data[i - 1]! + change, base * 0.85))
  }
  return data
}

export const MOCK_POSITIONS: MockPosition[] = [
  {
    asset: 'BTC', name: 'Bitcoin', quantity: 0.52, avg_entry_price: 78400,
    current_price: 84230, price_change_24h: 7.44, price_change_7d: 2.1,
    unrealized_pnl: 3031.60, unrealized_pnl_pct: 7.44,
    allocation_pct: 66, funding_rate: { rate: 0.0082, exchange: 'Binance' },
    sparkline: generateSparkline(84230), volume_24h: 74200000000,
    pelican_signal: 'Accumulation Zone',
  },
  {
    asset: 'ETH', name: 'Ethereum', quantity: 4.2, avg_entry_price: 2340,
    current_price: 2180, price_change_24h: -6.84, price_change_7d: -3.2,
    unrealized_pnl: -672, unrealized_pnl_pct: -6.84,
    allocation_pct: 14, funding_rate: { rate: 0.012, exchange: 'Binance' },
    sparkline: generateSparkline(2180), volume_24h: 14500000000,
    pelican_signal: 'Momentum Breakout',
  },
  {
    asset: 'SOL', name: 'Solana', quantity: 48, avg_entry_price: 142,
    current_price: 138.50, price_change_24h: -2.46, price_change_7d: 1.8,
    unrealized_pnl: -168, unrealized_pnl_pct: -2.46,
    allocation_pct: 10, funding_rate: { rate: 0.025, exchange: 'Bybit' },
    sparkline: generateSparkline(138.5), volume_24h: 1400000000,
    pelican_signal: 'Distribution',
  },
  {
    asset: 'AVAX', name: 'Avalanche', quantity: 95, avg_entry_price: 35.50,
    current_price: 34.80, price_change_24h: -1.97, price_change_7d: -4.1,
    unrealized_pnl: -66.50, unrealized_pnl_pct: -1.97,
    allocation_pct: 5, funding_rate: { rate: -0.003, exchange: 'Binance' },
    sparkline: generateSparkline(34.8), volume_24h: 310000000,
    pelican_signal: 'Whale Alert',
  },
  {
    asset: 'LINK', name: 'Chainlink', quantity: 180, avg_entry_price: 14.20,
    current_price: 16.85, price_change_24h: 18.66, price_change_7d: 12.3,
    unrealized_pnl: 477, unrealized_pnl_pct: 18.66,
    allocation_pct: 5, funding_rate: { rate: 0.005, exchange: 'Binance' },
    sparkline: generateSparkline(16.85), volume_24h: 780000000,
    pelican_signal: 'Smart Money Inflow',
  },
]

export const MOCK_PORTFOLIO_SUMMARY = {
  total_value: 65942.60,
  total_pnl: 2602.10,
  total_pnl_pct: 4.11,
  btc_correlation: 0.78,
  top_performer: { asset: 'LINK', change_24h: 18.66 },
  positions: MOCK_POSITIONS,
}

// ─── Smart Money Feed ────────────────────────────────────────
export interface SmartMoneyEntry {
  id: string
  time: string
  wallet_label: string
  archetype: string
  action: string
  token: string
  amount: string
  pelican_commentary: string
}

export const MOCK_SMART_MONEY_FEED: SmartMoneyEntry[] = [
  {
    id: 'sm1', time: '08:58 PM', wallet_label: 'Wintermute',
    archetype: 'Market Maker', action: 'Accumulated', token: 'UNI',
    amount: '250k UNI ($1.2M)',
    pelican_commentary: 'Interpreted as strategic positioning ahead of v4 launch.',
  },
  {
    id: 'sm2', time: '08:53 PM', wallet_label: 'Wintermute',
    archetype: 'Market Maker', action: 'Accumulated', token: 'BNB',
    amount: '250k Binance ($15.5M)',
    pelican_commentary: 'Interpreted as strategic positioning ahead of v4 launch.',
  },
  {
    id: 'sm3', time: '08:52 PM', wallet_label: 'Jump Trading',
    archetype: 'Prop Desk', action: 'Transferred', token: 'ETH',
    amount: '5k ETH ($19.8M) to Binance',
    pelican_commentary: 'Likely liquidity provision for new pair.',
  },
  {
    id: 'sm4', time: '07:31 PM', wallet_label: 'Smart Money Fund',
    archetype: 'Narrative Surfer', action: 'Sold', token: 'SOL',
    amount: '$1.8M SOL',
    pelican_commentary: 'Profit-taking after 340% run. Still holds 40% of original position.',
  },
  {
    id: 'sm5', time: '06:15 PM', wallet_label: 'Galaxy Digital',
    archetype: 'Institutional', action: 'Accumulated', token: 'BTC',
    amount: '420 BTC ($35.4M)',
    pelican_commentary: 'Consistent weekly DCA pattern. 12th consecutive week of accumulation.',
  },
]

// ─── Crypto Market Overview ──────────────────────────────────
export const MOCK_MARKET_OVERVIEW = {
  btc_dominance: 58.4,
  total_market_cap: 2.87, // in trillions
  fear_greed_index: 72,
  fear_greed_label: 'Greed',
  eth_btc_ratio: 0.0259,
  sectors: [
    { name: 'Layer 1s', change: 2.3 },
    { name: 'DeFi', change: -1.8 },
    { name: 'Layer 2s', change: 5.1 },
    { name: 'AI & Data', change: 8.4 },
  ],
}

// ─── Analyst Signals ─────────────────────────────────────────
export const MOCK_ANALYST_POSTS = [
  {
    id: 'ap1', type: 'analyst' as const, asset: 'BTC',
    analyst_name: 'Blake Morrow', analyst_avatar_color: '#2A5ADA',
    methodology: 'HARMONIC', direction: 'BULLISH' as const,
    title: 'BTC Bullish Bat Pattern Completing at $82,400',
    body: 'The bullish bat pattern on the 4H chart is completing at the 0.886 Fibonacci retracement. This is a high-probability reversal zone with confluence from the 200 EMA. Target: $89,500 with stops below $80,800. Risk/reward: 2.8:1.',
    key_levels: { entry: '$82,400', target: '$89,500', stop: '$80,800' },
    confidence: 78,
    timestamp: '2h ago',
    in_portfolio: true,
  },
  {
    id: 'ap2', type: 'analyst' as const, asset: 'ETH',
    analyst_name: 'Grega Horvat', analyst_avatar_color: '#9945FF',
    methodology: 'ELLIOTT WAVE', direction: 'BEARISH' as const,
    title: 'ETH Wave 4 Correction Targeting $1,950',
    body: 'ETH appears to be in a wave 4 corrective structure after completing impulse wave 3 near $2,400. The 0.382 Fibonacci retracement of wave 3 targets $1,950-$2,000 zone.',
    key_levels: { entry: '$2,150', target: '$1,950', stop: '$2,420' },
    confidence: 65,
    timestamp: '4h ago',
    in_portfolio: true,
  },
]

export const MOCK_CT_SIGNALS = [
  {
    id: 'ct1', type: 'ct' as const, asset: 'ETH',
    author: '@CryptoHayes', author_badge: 'ETH',
    original_tweet: '"ETH is cooked below 2.2k. Funding negative, OI dropping, no bid. Next stop 1.8k."',
    pelican_translation: 'Bearish on ETH below $2,200. Derivatives metrics confirm weak positioning: funding rates are negative (shorts paying longs, indicating bearish consensus), open interest is declining (traders closing positions, reducing liquidity), and there\'s limited buying support. Price target: $1,800.',
    engagement: { likes: 4200, retweets: 890 },
    timestamp: '1h ago',
    in_portfolio: true,
  },
  {
    id: 'ct2', type: 'ct' as const, asset: 'SOL',
    author: '@DegenSpartan', author_badge: 'SOL',
    original_tweet: '"SOL funding at 0.025% lmao shorts getting rekt soon. This is the setup."',
    pelican_translation: 'SOL perpetual futures funding rate is elevated at 0.025% per 8 hours (~34% annualized). This means long position holders are paying a significant premium. In TradFi terms, think of it as paying 34% annual carry on a leveraged futures position. Historically, when funding reaches these extremes, a short squeeze often follows as the overcrowded long side gets liquidated.',
    engagement: { likes: 2100, retweets: 445 },
    timestamp: '3h ago',
    in_portfolio: true,
  },
]

export const MOCK_WALLET_SIGNALS = [
  {
    id: 'ws1', type: 'onchain' as const, asset: 'ETH',
    wallet_label: 'Accumulation Whale', archetype: 'APEX PREDATOR',
    action: 'Bought', amount: '$4.2M ETH',
    timestamp: '51m ago', in_portfolio: true,
  },
  {
    id: 'ws2', type: 'onchain' as const, asset: 'SOL',
    wallet_label: 'Smart Money Fund', archetype: 'NARRATIVE SURFER',
    action: 'Sold', amount: '$1.8M SOL',
    timestamp: '2h ago', in_portfolio: true,
  },
]

export const MOCK_MACRO_TRANSLATIONS = [
  {
    id: 'mt1', type: 'macro' as const,
    source: 'ForexAnalytix', analyst: 'Blake Morrow',
    title: 'DXY Breaking Below 104 Support',
    body: 'The US Dollar Index is breaking below the critical 104 support level. Historically, sustained DXY weakness correlates with crypto strength as capital rotates into risk assets. The last time DXY broke below this level in October 2023, BTC rallied 45% over the following 8 weeks.',
    affected_assets: ['BTC', 'ETH', 'SOL'],
    timestamp: '5h ago',
  },
]

// ─── Calendar Events ─────────────────────────────────────────
export const MOCK_CALENDAR_EVENTS = [
  {
    id: 'ce1', title: 'ARB Governance Vote — Treasury Allocation',
    type: 'governance', impact: 'medium', asset: 'ARB',
    date: '2026-03-12', time: '12:14 PM',
    description: 'Arbitrum DAO vote on treasury allocation for ecosystem grants. $50M proposal under consideration. Historically governance votes with treasury impact create 5-10% price movement in the 24 hours surrounding the vote.',
    source: 'Arbitrum DAO', source_url: '#',
  },
  {
    id: 'ce2', title: 'ETH Dencun Upgrade Anniversary',
    type: 'upgrade', impact: 'low', asset: 'ETH',
    date: '2026-03-13', time: '12:14 PM',
    description: 'One-year anniversary of Ethereum\'s Dencun upgrade that introduced EIP-4844 (proto-danksharding). L2 transaction costs dropped 95%. Market typically rallies as upgrade anniversaries remind traders of fundamental progress.',
    source: 'Ethereum Foundation', source_url: '#',
  },
  {
    id: 'ce3', title: 'BTC Options Expiry — $4.2B Notional',
    type: 'expiration', impact: 'high', asset: 'BTC',
    date: '2026-03-14', time: '12:14 PM',
    description: '$4.2 billion in BTC options expire. Max pain at $82,000. Large expirations create volatility as market makers unwind delta hedges. Think of it like a massive futures expiration on CME — positioning drives short-term price action.',
    source: 'Deribit', source_url: '#',
  },
  {
    id: 'ce4', title: 'SOL Token Unlock — $400M Vesting Release',
    type: 'token_unlock', impact: 'high', asset: 'SOL',
    date: '2026-03-15', time: '12:14 PM',
    description: '$400M worth of SOL tokens unlock from early investor and team vesting schedules. Token unlocks are like insider lock-up expirations in IPOs — they increase circulating supply and can create selling pressure if holders choose to realize gains.',
    source: 'Solana Foundation', source_url: '#',
  },
  {
    id: 'ce5', title: 'FOMC Meeting Minutes Release',
    type: 'fed_meeting', impact: 'high', asset: 'BTC',
    date: '2026-03-19', time: '2:00 PM',
    description: 'Federal Reserve releases minutes from the March FOMC meeting. Hawkish surprises typically cause crypto to sell off as risk appetite decreases. Dovish signals boost crypto as traders price in easier monetary conditions.',
    source: 'Federal Reserve', source_url: '#',
  },
  {
    id: 'ce6', title: 'AAVE V4 Governance Proposal',
    type: 'governance', impact: 'medium', asset: 'AAVE',
    date: '2026-03-20', time: '10:00 AM',
    description: 'Aave governance vote on V4 architecture changes including unified liquidity layer and risk engine overhaul. Major protocol upgrades typically drive 10-20% moves in governance tokens.',
    source: 'Aave DAO', source_url: '#',
  },
  {
    id: 'ce7', title: 'ETH Futures Quarterly Expiry',
    type: 'expiration', impact: 'medium', asset: 'ETH',
    date: '2026-03-21', time: '8:00 AM',
    description: 'CME Ethereum futures quarterly contract expires. Open interest rollover can cause short-term volatility. Watch for basis trade unwinds.',
    source: 'CME Group', source_url: '#',
  },
  {
    id: 'ce8', title: 'BTC Halving Countdown — 180 Days',
    type: 'halving', impact: 'low', asset: 'BTC',
    date: '2026-03-25', time: '12:00 PM',
    description: 'Approximately 180 days until the next Bitcoin halving event. Historically, BTC enters a bullish trend 3-6 months before the halving as supply reduction expectations are priced in.',
    source: 'Bitcoin Network', source_url: '#',
  },
  {
    id: 'ce9', title: 'OP Token Unlock — $120M',
    type: 'token_unlock', impact: 'medium', asset: 'OP',
    date: '2026-03-26', time: '12:00 PM',
    description: '$120M in OP tokens unlock from investor vesting. Smaller than SOL unlock but still significant relative to daily trading volume.',
    source: 'Optimism Foundation', source_url: '#',
  },
  {
    id: 'ce10', title: 'MicroStrategy Earnings',
    type: 'earnings', impact: 'medium', asset: 'BTC',
    date: '2026-03-28', time: '4:00 PM',
    description: 'MicroStrategy Q1 2026 earnings. Market watches for BTC acquisition updates and treasury strategy. MSTR price action correlates with BTC sentiment.',
    source: 'MicroStrategy', source_url: '#',
  },
]

// ─── Brief Data ──────────────────────────────────────────────
export const MOCK_BRIEF = {
  generated_at: new Date().toISOString(),
  market_snapshot: {
    btc_price: 84230, btc_change_24h: 7.44,
    eth_price: 2180, eth_change_24h: -6.84,
    total_market_cap: '2.87T', btc_dominance: 58.4,
  },
  overnight_summary: 'Bitcoin pushed above $84,000 overnight as Asian markets opened with risk-on sentiment following a weaker-than-expected US CPI print. BTC dominance continues climbing, now at 58.4%, suggesting capital is consolidating into BTC rather than rotating into altcoins. ETH underperformed, dropping 6.8% as funding rates turned negative — a sign of bearish derivatives positioning. SOL held relatively stable despite a large upcoming token unlock ($400M in 5 days).',
  portfolio_impact: 'Your portfolio is up 4.1% today, primarily driven by BTC (+7.4%) which represents 66% of your allocation. ETH is dragging performance with a -6.8% decline. LINK is your standout performer at +18.7% following a Chainlink staking expansion announcement. SOL funding rates on Bybit are elevated at 0.025% per 8h — this is costing you approximately $1.66/day in carry.',
  key_levels: [
    { asset: 'BTC', level: '$82,000', type: 'support' as const, note: 'Previous resistance turned support. Max pain level for Friday options expiry.' },
    { asset: 'BTC', level: '$87,500', type: 'resistance' as const, note: 'Major resistance from January highs. Break above triggers $90K+ targets.' },
    { asset: 'ETH', level: '$2,100', type: 'support' as const, note: 'Key support. Break below opens $1,950 (wave 4 Fibonacci target per Grega).' },
    { asset: 'SOL', level: '$130', type: 'support' as const, note: 'Critical support ahead of token unlock. Failure here targets $115.' },
  ],
  one_thing_to_learn: {
    topic: 'Funding Rates',
    content: 'Your SOL position has an elevated funding rate of 0.025% per 8 hours. In TradFi terms, this is equivalent to paying ~34% annualized carry on a leveraged futures position. This means long holders are paying short holders every 8 hours to maintain their positions. When funding is this elevated, it often signals overcrowded long positioning — and historically precedes either a squeeze (shorts get liquidated) or a flush (longs get liquidated). Monitor the rate and consider whether the carry cost justifies holding.',
  },
}

// ─── Education (module list only — full content is in Supabase) ──
export const MOCK_EDUCATION_MODULES = [
  { slug: 'spot-vs-futures', title: 'Spot vs Futures in Crypto', category: 'fundamentals', estimated_minutes: 4, tradfi_analog: 'Buying AAPL shares vs trading ES futures' },
  { slug: 'perpetual-swaps', title: 'Perpetual Swaps: Futures That Never Expire', category: 'derivatives', estimated_minutes: 5, tradfi_analog: 'ES futures that auto-roll every 8 hours' },
  { slug: 'funding-rates', title: 'Funding Rates Explained', category: 'derivatives', estimated_minutes: 6, tradfi_analog: 'Overnight repo rate, settled 3x daily' },
  { slug: 'custody-wallets', title: 'Custody and Wallets', category: 'fundamentals', estimated_minutes: 4, tradfi_analog: 'DTCC custody vs holding physical gold' },
  { slug: 'exchange-risk', title: 'Exchange Risk and Counterparty Risk', category: 'risk', estimated_minutes: 5, tradfi_analog: 'Remember MF Global? Same concept.' },
  { slug: '24-7-trading', title: '24/7 Markets: No Close, No Gaps', category: 'fundamentals', estimated_minutes: 4, tradfi_analog: 'Crypto never closes. No gaps, but funding compounds.' },
  { slug: 'token-selection', title: 'Picking Tokens: Beyond the Top 10', category: 'strategy', estimated_minutes: 7, tradfi_analog: 'Equity analysis but the company is a protocol' },
]
