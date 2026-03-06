export type SignalType = 'analyst' | 'ct' | 'onchain' | 'macro'
export type SignalSeverity = 'positive' | 'negative' | 'warning' | 'neutral'
export type AnalystMethodology = 'harmonic' | 'elliott-wave' | 'macro' | 'pfi' | 'candlestick' | 'technical'

export interface AnalystPost {
  id: string
  analyst_id: string
  analyst_name: string
  asset: string
  direction: 'bullish' | 'bearish' | 'neutral'
  methodology: AnalystMethodology
  title: string
  body: string
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
  engagement: string | null
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
  created_at: string
}

export type SignalFeedItem =
  | { type: 'analyst'; data: AnalystPost }
  | { type: 'ct'; data: CTSignal }
  | { type: 'onchain'; data: WalletSignal }
