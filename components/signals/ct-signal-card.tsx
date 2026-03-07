'use client'

import { cn } from '@/lib/utils'
import { formatTimeAgo, formatCompact } from '@/lib/formatters'
import { ASSET_COLORS } from '@/lib/constants'
import { PelicanIcon } from '@/components/shared/pelican-icon'
import { Heart, Repeat } from '@phosphor-icons/react'
import type { CTSignal } from '@/types/signals'

interface CTSignalCardProps {
  signal: CTSignal
  onPelicanClick: () => void
  isPortfolioAsset?: boolean
}

export function CTSignalCard({ signal, onPelicanClick, isPortfolioAsset }: CTSignalCardProps) {
  // Glow Pelican when engagement is high and relevant to portfolio
  const shouldGlow = isPortfolioAsset === true && signal.engagement != null && signal.engagement.likes > 500

  return (
    <div
      className={cn(
        'relative rounded-xl border border-[var(--border-subtle)] p-4',
        'transition-all duration-200',
        'hover:border-[var(--border-hover)]',
      )}
      style={{
        background: `linear-gradient(135deg, rgba(167,139,250,0.04) 0%, var(--bg-surface) 60%)`,
        borderLeft: '3px solid #A78BFA',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.3)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Source handle with purple accent */}
          <span className="text-[13px] font-medium truncate" style={{ color: '#A78BFA' }}>
            {signal.source_handle}
          </span>
          {/* Asset pills */}
          <div className="flex items-center gap-1.5 flex-wrap shrink-0">
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
          </div>
          {/* Portfolio badge */}
          {isPortfolioAsset && (
            <span
              className="inline-flex items-center px-2 py-[2px] rounded-full text-[10px] font-medium shrink-0"
              style={{
                color: 'var(--accent-primary)',
                backgroundColor: 'var(--accent-dim)',
              }}
            >
              In your portfolio
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="font-mono text-[11px] tabular-nums text-[var(--text-muted)]">
            {formatTimeAgo(signal.created_at)}
          </span>
          <PelicanIcon onClick={onPelicanClick} size={18} glow={shouldGlow} />
        </div>
      </div>

      {/* Original text — quote block */}
      <div
        className="mb-3 pl-3"
        style={{ borderLeft: '2px solid var(--border-default)' }}
      >
        <p className="text-[12px] text-[var(--text-muted)] italic leading-relaxed">
          &ldquo;{signal.original_text}&rdquo;
        </p>
      </div>

      {/* Pelican Translation */}
      {signal.translated_text && (
        <div className="mb-3">
          <span
            className="text-[10px] uppercase font-semibold mb-1.5 block"
            style={{
              color: 'var(--accent-primary)',
              letterSpacing: '1px',
            }}
          >
            Pelican Translation
          </span>
          <p className="text-[13px] text-[var(--text-secondary)] leading-[1.7]">
            {signal.translated_text}
          </p>
        </div>
      )}

      {/* Engagement metrics */}
      {signal.engagement && (
        <div className="flex items-center gap-3 text-[var(--text-muted)]">
          <div className="flex items-center gap-1">
            <Heart size={12} weight="regular" />
            <span className="font-mono text-[11px] tabular-nums">
              {formatCompact(signal.engagement.likes)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Repeat size={12} weight="regular" />
            <span className="font-mono text-[11px] tabular-nums">
              {formatCompact(signal.engagement.retweets)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
