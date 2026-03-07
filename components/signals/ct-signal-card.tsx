'use client'

import { cn } from '@/lib/utils'
import { formatTimeAgo, formatCompact } from '@/lib/formatters'
import { ASSET_COLORS } from '@/lib/constants'
import { SeverityTag } from '@/components/shared/severity-tag'
import { PelicanIcon } from '@/components/shared/pelican-icon'
import { Heart, Repeat, ChatCircle } from '@phosphor-icons/react'
import type { CTSignal } from '@/types/signals'

interface CTSignalCardProps {
  signal: CTSignal
  onPelicanClick: () => void
  isPortfolioAsset?: boolean
}

export function CTSignalCard({ signal, onPelicanClick, isPortfolioAsset }: CTSignalCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-lg border border-[var(--border-subtle)] p-4',
        'bg-[var(--bg-surface)] transition-all duration-150',
        'hover:border-[var(--border-hover)] hover:shadow-[0_2px_12px_rgba(0,0,0,0.3)]',
        isPortfolioAsset && 'border-l-2 border-l-[var(--accent-primary)]'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-[13px] font-medium text-[var(--accent-primary)]">
            {signal.source_handle}
          </span>
          <SeverityTag type="ct" />
          <span className="text-[11px] text-[var(--text-muted)]">
            {formatTimeAgo(signal.created_at)}
          </span>
        </div>
        <PelicanIcon onClick={onPelicanClick} size={18} />
      </div>

      {/* Original text — quote style */}
      <div className="mb-3 pl-3 border-l-2 border-[var(--accent-muted)]">
        <p className="text-[13px] text-[var(--text-muted)] italic leading-relaxed">
          &ldquo;{signal.original_text}&rdquo;
        </p>
      </div>

      {/* Pelican Translation */}
      {signal.translated_text && (
        <div className="mb-3">
          <span className="text-[10px] uppercase tracking-wider text-[var(--accent-primary)] font-medium mb-1 block">
            Pelican Translation
          </span>
          <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
            {signal.translated_text}
          </p>
        </div>
      )}

      {/* Bottom row: assets + engagement */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          {signal.assets.map((asset) => {
            const color = ASSET_COLORS[asset] || 'var(--text-secondary)'
            return (
              <span
                key={asset}
                className="inline-flex items-center px-[6px] py-[1px] rounded text-[9px] font-bold uppercase tracking-wider"
                style={{
                  color,
                  backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${color} 20%, transparent)`,
                }}
              >
                {asset}
              </span>
            )
          })}
          {isPortfolioAsset && (
            <span className="text-[9px] uppercase tracking-wider text-[var(--accent-primary)] font-medium">
              In your portfolio
            </span>
          )}
        </div>

        {/* Engagement */}
        {signal.engagement && (
          <div className="flex items-center gap-3 text-[var(--text-muted)]">
            <div className="flex items-center gap-1">
              <Heart size={12} weight="regular" />
              <span className="font-mono text-[10px] tabular-nums">
                {formatCompact(signal.engagement.likes)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Repeat size={12} weight="regular" />
              <span className="font-mono text-[10px] tabular-nums">
                {formatCompact(signal.engagement.retweets)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <ChatCircle size={12} weight="regular" />
              <span className="font-mono text-[10px] tabular-nums">
                {formatCompact(signal.engagement.replies)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
