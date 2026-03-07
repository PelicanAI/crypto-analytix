'use client'

import { cn } from '@/lib/utils'
import { formatTimeAgo, formatCompact } from '@/lib/formatters'
import { ASSET_COLORS } from '@/lib/constants'
import { PelicanIcon } from '@/components/shared/pelican-icon'
import type { WalletSignal } from '@/types/signals'

const ACTION_CONFIG = {
  accumulate: { label: 'Bought', color: 'var(--data-positive)', dot: 'bg-[var(--data-positive)]' },
  distribute: { label: 'Sold', color: 'var(--data-negative)', dot: 'bg-[var(--data-negative)]' },
  transfer: { label: 'Transferred', color: 'var(--accent-primary)', dot: 'bg-[var(--accent-primary)]' },
} as const

const ARCHETYPE_LABELS: Record<string, string> = {
  'apex-predator': 'Apex Predator',
  'narrative-surfer': 'Narrative Surfer',
  'yield-farmer': 'Yield Farmer',
  'slow-accumulator': 'Slow Accumulator',
  'arbitrageur': 'Arbitrageur',
}

interface WalletSignalCardProps {
  signal: WalletSignal
  onPelicanClick: () => void
  isPortfolioAsset?: boolean
}

export function WalletSignalCard({ signal, onPelicanClick, isPortfolioAsset }: WalletSignalCardProps) {
  const action = ACTION_CONFIG[signal.action]
  const assetColor = ASSET_COLORS[signal.asset] || 'var(--text-secondary)'
  const archetypeLabel = signal.archetype ? ARCHETYPE_LABELS[signal.archetype] || signal.archetype : null

  return (
    <div
      className={cn(
        'relative flex items-center gap-3 rounded-lg border border-[var(--border-subtle)] px-4 py-3',
        'bg-[var(--bg-surface)] transition-all duration-150',
        'hover:border-[var(--border-hover)] hover:shadow-[0_2px_12px_rgba(0,0,0,0.3)]',
        isPortfolioAsset && 'border-l-2 border-l-[var(--accent-primary)]'
      )}
    >
      {/* Action dot */}
      <div className={cn('w-2.5 h-2.5 rounded-full shrink-0', action.dot)} />

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="text-[13px] font-medium text-[var(--text-primary)] truncate">
            {signal.wallet_label || signal.wallet_address}
          </span>
          {archetypeLabel && (
            <span
              className="inline-flex items-center px-[6px] py-[1px] rounded text-[9px] font-medium uppercase tracking-wider"
              style={{
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {archetypeLabel}
            </span>
          )}
          {isPortfolioAsset && (
            <span className="text-[9px] uppercase tracking-wider text-[var(--accent-primary)] font-medium">
              In your portfolio
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-medium" style={{ color: action.color }}>
            {action.label}
          </span>
          <span className="font-mono text-[13px] tabular-nums text-[var(--text-primary)]">
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
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-[11px] text-[var(--text-muted)]">
          {formatTimeAgo(signal.created_at)}
        </span>
        <PelicanIcon onClick={onPelicanClick} size={18} />
      </div>
    </div>
  )
}
