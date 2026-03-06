export interface CryptoPosition {
  id: string
  user_id: string
  source: 'snaptrade' | 'wallet' | 'manual'
  source_id: string | null
  asset: string
  chain: string | null
  quantity: number
  avg_entry_price: number
  current_price: number
  unrealized_pnl: number
  unrealized_pnl_pct: number
  allocation_pct: number
  last_updated: string
}

export interface PortfolioSnapshot {
  id: string
  user_id: string
  total_value: number
  btc_allocation: number
  eth_allocation: number
  alt_allocation: number
  tradfi_allocation: number
  btc_correlation: number
  snapshot_date: string
}

export interface PortfolioSummary {
  total_value: number
  total_pnl: number
  total_pnl_pct: number
  btc_correlation: number
  positions: CryptoPosition[]
  last_updated: string
}

export interface SnapTradeConnection {
  id: string
  user_id: string
  snaptrade_user_id: string
  broker_name: string
  account_ids: string[]
  last_sync: string | null
  status: 'active' | 'error' | 'revoked' | 'syncing'
  created_at: string
}

export interface WalletConnection {
  id: string
  user_id: string
  chain: 'evm' | 'solana' | 'bitcoin'
  address: string
  label: string | null
  last_sync: string | null
  created_at: string
}
