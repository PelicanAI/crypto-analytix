export type SignalType = 'analyst' | 'ct' | 'onchain' | 'macro'
export type SignalSeverity = 'positive' | 'negative' | 'warning' | 'neutral'
export type AnalystMethodology = 'harmonic' | 'elliott-wave' | 'macro' | 'pfi' | 'candlestick' | 'technical'

export interface AnalystPost {
  id: string
  analyst_id: string
  analyst_name: string
  asset: string
  direction: 'bullish' | 'bearish' | 'neutral'
  methodology: AnalystMethodology | string
  title: string
  body: string
  key_levels?: Record<string, number> | null
  confidence: number
  created_at: string
}

export interface CTSignal {
  id: string
  source_handle: string
  original_text: string
  translated_text: string | null
  assets: string[]
  signal_type: string
  engagement: { likes: number; retweets: number; replies: number } | null
  created_at: string
}

export interface WalletSignal {
  id: string
  wallet_address: string
  wallet_label: string | null
  archetype: string | null
  action: 'accumulate' | 'distribute' | 'transfer'
  asset: string
  amount_usd: number
  tx_hash?: string | null
  chain?: string | null
  created_at: string
}

export interface MacroTranslation {
  id: string
  source_type: string
  source_title: string
  source_summary: string | null
  crypto_translation: string
  affected_assets: string[]
  macro_indicator: string | null
  direction: string | null
  created_at: string
}

export type SignalFeedItem =
  | { type: 'analyst'; data: AnalystPost }
  | { type: 'ct'; data: CTSignal }
  | { type: 'onchain'; data: WalletSignal }
  | { type: 'macro'; data: MacroTranslation }

export type SignalFilter = 'all' | 'analyst' | 'ct' | 'onchain' | 'macro'

export interface SignalFeedResponse {
  signals: SignalFeedItem[]
  has_more: boolean
  next_cursor: string | null
}
