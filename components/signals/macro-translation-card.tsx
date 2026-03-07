'use client'

import { cn } from '@/lib/utils'
import { formatTimeAgo } from '@/lib/formatters'
import { ASSET_COLORS } from '@/lib/constants'
import { SeverityTag } from '@/components/shared/severity-tag'
import { PelicanIcon } from '@/components/shared/pelican-icon'
import type { MacroTranslation } from '@/types/signals'
import type { SeverityType } from '@/lib/constants'

const DIRECTION_SEVERITY: Record<string, SeverityType> = {
  'crypto-bullish': 'crypto-bullish',
  'crypto-bearish': 'crypto-bearish',
}

interface MacroTranslationCardProps {
  translation: MacroTranslation
  onPelicanClick: () => void
  isPortfolioAsset?: boolean
}

export function MacroTranslationCard({ translation, onPelicanClick, isPortfolioAsset }: MacroTranslationCardProps) {
  // Glow when portfolio relevant
  const shouldGlow = isPortfolioAsset === true

  return (
    <div
      className={cn(
        'relative rounded-xl border border-[var(--border-subtle)] p-4',
        'transition-all duration-200',
        'hover:border-[var(--border-hover)]',
      )}
      style={{
        background: `linear-gradient(135deg, rgba(245,158,11,0.04) 0%, var(--bg-surface) 60%)`,
        borderLeft: '3px solid var(--data-warning)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.3)',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span
            className="text-[10px] uppercase font-semibold"
            style={{
              color: 'var(--data-warning)',
              letterSpacing: '1.5px',
            }}
          >
            Macro Translation
          </span>
          {/* ForexAnalytix badge */}
          <span
            className="inline-flex items-center px-[6px] py-[1px] rounded text-[10px] font-semibold"
            style={{
              color: 'var(--accent-primary)',
              backgroundColor: 'rgba(29,161,196,0.08)',
              border: '1px solid var(--accent-muted)',
            }}
          >
            ForexAnalytix
          </span>
          {translation.direction && DIRECTION_SEVERITY[translation.direction] && (
            <SeverityTag type={DIRECTION_SEVERITY[translation.direction]} />
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="font-mono text-[11px] tabular-nums text-[var(--text-muted)]">
            {formatTimeAgo(translation.created_at)}
          </span>
          <PelicanIcon onClick={onPelicanClick} size={18} glow={shouldGlow} />
        </div>
      </div>

      {/* Source title */}
      <h3 className="text-[15px] font-semibold text-[var(--text-primary)] mb-1.5 leading-snug">
        {translation.source_title}
      </h3>

      {/* Source summary */}
      {translation.source_summary && (
        <p className="text-[12px] text-[var(--text-muted)] mb-2 leading-relaxed italic">
          {translation.source_summary}
        </p>
      )}

      {/* Crypto translation */}
      <p className="text-[13px] text-[var(--text-secondary)] leading-[1.7] mb-3">
        {translation.crypto_translation}
      </p>

      {/* Bottom: macro indicator + affected assets + portfolio badge */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {translation.macro_indicator && (
          <span
            className="inline-flex items-center px-[6px] py-[1px] rounded text-[9px] font-mono font-bold uppercase tracking-wider"
            style={{
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {translation.macro_indicator}
          </span>
        )}
        {translation.affected_assets.map((asset) => {
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
    </div>
  )
}
