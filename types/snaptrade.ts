export interface SnapTradeUser {
  userId: string
  userSecret: string
}

export interface SnapTradeAccount {
  id: string
  brokerage: string
  number: string
  name: string
}

export interface SnapTradePosition {
  symbol: string
  units: number
  price: number
  currency: string
  average_purchase_price: number | null
}

export interface SnapTradeBalance {
  currency: string
  cash: number
}
