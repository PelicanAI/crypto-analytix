export interface WatchlistItem {
  id: string
  user_id: string
  asset: string
  notes: string | null
  created_at: string
  current_price?: number
  price_change_24h?: number
  funding_rate?: number
  sparkline?: number[]
}

export type AlertType = 'price-above' | 'price-below' | 'funding-above' | 'funding-below' | 'whale-activity' | 'analyst-call'

export interface WatchlistAlert {
  id: string
  user_id: string
  watchlist_id: string
  alert_type: AlertType
  condition: Record<string, unknown>
  enabled: boolean
  last_triggered: string | null
  created_at: string
}
