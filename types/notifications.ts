export interface NotificationPreferences {
  id: string
  user_id: string
  funding_rate: boolean
  whale_moves: boolean
  analyst_calls: boolean
  price_levels: boolean
  correlation: boolean
  daily_brief: boolean
  calendar_events: boolean
  trading_rule_violations: boolean
}

export interface NotificationHistoryItem {
  id: string
  user_id: string
  type: string
  title: string
  body: string
  asset: string | null
  read: boolean
  created_at: string
}
