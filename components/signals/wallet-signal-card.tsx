'use client'

import { cn } from '@/lib/utils'
import { formatTimeAgo, formatCompact } from '@/lib/formatters'
import { ASSET_COLORS } from '@/lib/constants'
import { PelicanIcon } from '@/components/shared/pelican-icon'
import type { WalletSignal } from '@/types/signals'

const ACTION_CONFIG = {
  accumulate: { label: 'Bought', color: 'var(--data-positive)' },
  distribute: { label: 'Sold', color: 'var(--data-negative)' },
  transfer: { label: 'Transferred', color: 'var(--accent-primary)' },
} as const

const ACTION_DOT_COLOR = {
  accumulate: '#22c55e',
  distribute: '#ef4444',
  transfer: '#1DA1C4',
} as const

const ARCHETYPE_STYLES: Record<string, { label: string; color: string }> = {
  'apex-predator':    { label: 'Apex Predator',    color: '#A78BFA' },
  'narrative-surfer': { label: 'Narrative Surfer',  color: '#F59E0B' },
  'yield-farmer':     { label: 'Yield Farmer',     color: '#22c55e' },
  'slow-accumulator': { label: 'Slow Accumulator', color: '#627EEA' },
  'arbitrageur':      { label: 'Arbitrageur',      color: '#1DA1C4' },
}

interface WalletSignalCardProps {
  signal: WalletSignal
  onPelicanClick: () => void
  isPortfolioAsset?: boolean
}

export function WalletSignalCard({ signal, onPelicanClick, isPortfolioAsset }: WalletSignalCardProps) {
  const action = ACTION_CONFIG[signal.action]
  const dotColor = ACTION_DOT_COLOR[signal.action]
  const assetColor = ASSET_COLORS[signal.asset] || 'var(--text-secondary)'
  const archetype = signal.archetype ? ARCHETYPE_STYLES[signal.archetype] || { label: signal.archetype, color: 'var(--text-secondary)' } : null

  // Glow when whale amount is large and relevant to portfolio
  const shouldGlow = isPortfolioAsset === true && signal.amount_usd >= 1_000_000

  return (
    <div
      className={cn(
        'relative flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] px-4 py-3',
        'transition-all duration-200',
        'hover:border-[var(--border-hover)]',
      )}
      style={{
        background: `linear-gradient(135deg, rgba(34,197,94,0.03) 0%, var(--bg-surface) 60%)`,
        borderLeft: '3px solid var(--data-positive)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.3)',
      }}
    >
      {/* Action dot */}
      <div
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: dotColor }}
      />

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="text-[13px] font-medium text-[var(--text-primary)] truncate">
            {signal.wallet_label || signal.wallet_address}
          </span>
          {archetype && (
            <span
              className="inline-flex items-center px-[6px] py-[1px] rounded text-[9px] font-medium uppercase tracking-wider"
              style={{
                color: archetype.color,
                backgroundColor: `color-mix(in srgb, ${archetype.color} 12%, transparent)`,
                border: `1px solid color-mix(in srgb, ${archetype.color} 20%, transparent)`,
              }}
            >
              {archetype.label}
            </span>
          )}
          {isPortfolioAsset && (
            <span
              className="inline-flex items-center px-2 py-[2px] rounded-full text-[10px] font-medium"
              style={{
                color: 'var(--accent-primary)',
                backgroundColor: 'var(--accent-dim)',
              }}
            >
              In your portfolio
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-medium" style={{ color: action.color }}>
            {action.label}
          </span>
          <span className="font-mono text-[13px] tabular-nums" style={{ color: 'var(--accent-primary)' }}>
            ${formatCompact(signal.amount_usd)}
          </span>
          <span
            className="font-mono text-[13px] font-bold"
            style={{ color: assetColor }}
          >
            {signal.asset}
          </span>
        </div>
      </div>

      {/* Right side: time + pelican */}
      <div className="flex items-center gap-1 shrink-0">
        <span className="font-mono text-[11px] tabular-nums text-[var(--text-muted)]">
          {formatTimeAgo(signal.created_at)}
        </span>
        <PelicanIcon onClick={onPelicanClick} size={18} glow={shouldGlow} />
      </div>
    </div>
  )
}
