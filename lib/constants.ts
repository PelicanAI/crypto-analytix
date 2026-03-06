export const PELICAN_PANEL_WIDTH = 440

export const APP_NAME = 'Crypto Analytix'
export const APP_DESCRIPTION = 'AI-powered crypto analysis for traditional traders'

export const PLAN_TIERS = {
  free: { name: 'Free', price: 0, credits: 10, features: ['daily-brief', 'education', 'portfolio-view'] },
  lite: { name: 'Lite', price: 29, credits: 1000, features: ['daily-brief', 'education', 'portfolio-view', 'analyst-feed', 'community', 'alerts', 'watchlist'] },
  pro: { name: 'Pro', price: 99, credits: 3500, features: ['daily-brief', 'education', 'portfolio-view', 'analyst-feed', 'community', 'alerts', 'watchlist', 'pelican-ai', 'signal-aggregation', 'wallet-tracking', 'ct-translation'] },
} as const

export type PlanType = keyof typeof PLAN_TIERS

export const NAV_ITEMS = [
  { id: 'portfolio', label: 'Home', path: '/portfolio', iconName: 'House' },
  { id: 'signals', label: 'Signals', path: '/signals', iconName: 'Lightning' },
  { id: 'calendar', label: 'Calendar', path: '/calendar', iconName: 'CalendarBlank' },
  { id: 'learn', label: 'Learn', path: '/learn', iconName: 'GraduationCap' },
  { id: 'community', label: 'Chat', path: '/community', iconName: 'ChatCircle' },
] as const

export const REFRESH_INTERVALS = {
  portfolio: 60_000,
  signals: 30_000,
  brief: 300_000,
  prices: 15_000,
} as const

export const ASSET_COLORS: Record<string, string> = {
  BTC: '#F7931A',
  ETH: '#627EEA',
  SOL: '#9945FF',
  AVAX: '#E84142',
  LINK: '#2A5ADA',
  DOT: '#E6007A',
  MATIC: '#8247E5',
  ADA: '#0033AD',
  DOGE: '#C3A634',
  XRP: '#23292F',
  BNB: '#F3BA2F',
  ATOM: '#2E3148',
  UNI: '#FF007A',
  AAVE: '#B6509E',
  ARB: '#28A0F0',
  OP: '#FF0420',
}

export const SEVERITY_CONFIG = {
  macro:    { label: 'MACRO',    color: 'var(--data-negative)' },
  analyst:  { label: 'ANALYST',  color: 'var(--accent-primary)' },
  signal:   { label: 'FUNDING',  color: 'var(--data-warning)' },
  onchain:  { label: 'ON-CHAIN', color: 'var(--data-positive)' },
  ct:       { label: 'CT SIGNAL', color: '#A78BFA' },
  positive: { label: 'BULLISH',  color: 'var(--data-positive)' },
  negative: { label: 'BEARISH',  color: 'var(--data-negative)' },
  warning:  { label: 'CAUTION',  color: 'var(--data-warning)' },
  neutral:  { label: 'NEUTRAL',  color: 'var(--data-neutral)' },
} as const

export type SeverityType = keyof typeof SEVERITY_CONFIG
