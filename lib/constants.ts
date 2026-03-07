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
  // MARKETS
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', iconName: 'SquaresFour', external: false, group: 'markets' },
  { id: 'portfolio', label: 'Portfolio', path: '/portfolio', iconName: 'Wallet', external: false, group: 'markets' },
  { id: 'screener', label: 'Screener', path: '/screener', iconName: 'MagnifyingGlass', external: false, group: 'markets' },
  // INTELLIGENCE
  { id: 'signals', label: 'Signals', path: '/signals', iconName: 'Lightning', external: false, group: 'intelligence' },
  { id: 'calendar', label: 'Calendar', path: '/calendar', iconName: 'CalendarBlank', external: false, group: 'intelligence' },
  { id: 'smart-money', label: 'Whales', path: '/smart-money', iconName: 'TrendUp', external: false, group: 'intelligence' },
  // PELICAN AI
  { id: 'pelican-portal', label: 'Pelican', path: '/pelican-portal', iconName: 'Bird', external: false, group: 'pelican' },
  { id: 'alerts', label: 'Alerts', path: '/alerts', iconName: 'Bell', external: false, group: 'pelican' },
  // LEARN & COMMUNITY
  { id: 'learn', label: 'Learn', path: '/learn', iconName: 'GraduationCap', external: false, group: 'learn' },
  { id: 'community', label: 'Chat', path: 'https://www.forexanalytix.com/community', iconName: 'ChatCircle', external: true, group: 'learn' },
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
  // Methodology badges for analyst cards
  harmonic:       { label: 'HARMONIC',      color: '#FF9F43' },
  'elliott-wave': { label: 'ELLIOTT WAVE',  color: '#A78BFA' },
  pfi:            { label: 'PFI',           color: '#FF6B6B' },
  technical:      { label: 'TECHNICAL',     color: 'var(--accent-primary)' },
  candlestick:    { label: 'CANDLESTICK',   color: '#F59E0B' },
  // Macro direction badges
  'crypto-bullish':  { label: 'CRYPTO BULLISH',  color: 'var(--data-positive)' },
  'crypto-bearish':  { label: 'CRYPTO BEARISH',  color: 'var(--data-negative)' },
} as const

export type SeverityType = keyof typeof SEVERITY_CONFIG
