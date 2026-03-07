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
  return (
    <div
      className={cn(
        'relative rounded-lg border border-[var(--border-subtle)] p-4',
        'bg-[var(--bg-surface)] transition-all duration-150',
        'hover:border-[var(--border-hover)] hover:shadow-[0_2px_12px_rgba(0,0,0,0.3)]',
        'border-l-2',
        isPortfolioAsset ? 'border-l-[var(--accent-primary)]' : 'border-l-[var(--data-warning)]'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-[10px] uppercase tracking-[1.5px] font-semibold text-[var(--data-warning)]">
            Macro Translation
          </span>
          {translation.direction && DIRECTION_SEVERITY[translation.direction] && (
            <SeverityTag type={DIRECTION_SEVERITY[translation.direction]} />
          )}
          <span
            className="inline-flex items-center px-[6px] py-[1px] rounded text-[9px] font-medium uppercase tracking-wider"
            style={{
              color: 'var(--accent-primary)',
              backgroundColor: 'var(--accent-dim)',
              border: '1px solid var(--accent-muted)',
            }}
          >
            ForexAnalytix
          </span>
          <span className="text-[11px] text-[var(--text-muted)]">
            {formatTimeAgo(translation.created_at)}
          </span>
        </div>
        <PelicanIcon onClick={onPelicanClick} size={18} />
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
      <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mb-3">
        {translation.crypto_translation}
      </p>

      {/* Bottom: affected assets + macro indicator */}
      <div className="flex items-center gap-2 flex-wrap">
        {translation.macro_indicator && (
          <span className="inline-flex items-center px-[6px] py-[1px] rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
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
          <span className="text-[9px] uppercase tracking-wider text-[var(--accent-primary)] font-medium">
            In your portfolio
          </span>
        )}
      </div>
    </div>
  )
}
