/**
 * Number formatting utilities.
 * ALL return strings ready for display in font-mono tabular-nums elements.
 */

export function formatCurrency(value: number, decimals = 2): string {
  return '$' + Math.abs(value).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function formatCurrencyWithSign(value: number, decimals = 2): string {
  const sign = value >= 0 ? '+' : '\u2212'
  return sign + formatCurrency(value, decimals)
}

export function formatPercent(value: number, decimals = 2): string {
  return Math.abs(value).toFixed(decimals) + '%'
}

export function formatPercentWithSign(value: number, decimals = 2): string {
  const sign = value >= 0 ? '+' : '\u2212'
  return sign + formatPercent(value, decimals)
}

export function formatNumber(value: number, decimals = 2): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function formatCompact(value: number): string {
  if (Math.abs(value) >= 1e9) return (value / 1e9).toFixed(1) + 'B'
  if (Math.abs(value) >= 1e6) return (value / 1e6).toFixed(1) + 'M'
  if (Math.abs(value) >= 1e3) return (value / 1e3).toFixed(1) + 'K'
  return value.toFixed(0)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatTimeAgo(date: Date | string): string {
  const now = new Date()
  const d = typeof date === 'string' ? new Date(date) : date
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'now'
  if (diffMins < 60) return diffMins + 'm ago'
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return diffHours + 'h ago'
  const diffDays = Math.floor(diffHours / 24)
  return diffDays + 'd ago'
}

export function formatFundingRate(rate: number): string {
  const sign = rate >= 0 ? '+' : '\u2212'
  return sign + (Math.abs(rate) * 100).toFixed(3) + '%'
}

export function pnlColorClass(value: number): string {
  if (value > 0) return 'text-data-positive'
  if (value < 0) return 'text-data-negative'
  return 'text-data-neutral'
}

export function fundingRateColorClass(rate: number): string {
  if (Math.abs(rate) > 0.0005) return 'text-data-warning'
  if (rate > 0) return 'text-muted'
  if (rate < 0) return 'text-data-positive'
  return 'text-data-neutral'
}
