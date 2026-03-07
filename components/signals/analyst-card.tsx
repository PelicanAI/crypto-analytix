'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { formatTimeAgo, formatCurrency } from '@/lib/formatters'
import { ASSET_COLORS } from '@/lib/constants'
import { SeverityTag } from '@/components/shared/severity-tag'
import { PelicanIcon } from '@/components/shared/pelican-icon'
import type { AnalystPost } from '@/types/signals'
import type { SeverityType } from '@/lib/constants'

const ANALYST_AVATARS: Record<string, { initials: string; color: string }> = {
  blake: { initials: 'BM', color: '#FF9F43' },
  grega: { initials: 'GH', color: '#A78BFA' },
  ryan:  { initials: 'RL', color: '#38BDF8' },
}

const METHODOLOGY_SEVERITY: Record<string, SeverityType> = {
  harmonic: 'harmonic',
  'elliott-wave': 'elliott-wave',
  macro: 'macro',
  pfi: 'pfi',
  technical: 'technical',
  candlestick: 'candlestick',
}

const DIRECTION_SEVERITY: Record<string, SeverityType> = {
  bullish: 'positive',
  bearish: 'negative',
  neutral: 'neutral',
}

interface AnalystCardProps {
  post: AnalystPost
  onPelicanClick: () => void
  isPortfolioAsset?: boolean
}

export function AnalystCard({ post, onPelicanClick, isPortfolioAsset }: AnalystCardProps) {
  const [expanded, setExpanded] = useState(false)
  const avatar = ANALYST_AVATARS[post.analyst_id] || { initials: post.analyst_name.slice(0, 2).toUpperCase(), color: 'var(--accent-primary)' }
  const assetColor = ASSET_COLORS[post.asset] || 'var(--text-secondary)'

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
          {/* Avatar */}
          <div
            className="flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold"
            style={{ backgroundColor: `color-mix(in srgb, ${avatar.color} 20%, transparent)`, color: avatar.color }}
          >
            {avatar.initials}
          </div>
          {/* Name + time */}
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-[var(--text-primary)]">
              {post.analyst_name}
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">
              {formatTimeAgo(post.created_at)}
            </span>
          </div>
        </div>
        <PelicanIcon onClick={onPelicanClick} size={18} />
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 mb-2.5 flex-wrap">
        <SeverityTag type={METHODOLOGY_SEVERITY[post.methodology] || 'analyst'} />
        <SeverityTag type={DIRECTION_SEVERITY[post.direction] || 'neutral'} />
        <span
          className="inline-flex items-center px-[7px] py-[2px] rounded text-[9px] font-bold uppercase tracking-wider"
          style={{
            color: assetColor,
            backgroundColor: `color-mix(in srgb, ${assetColor} 12%, transparent)`,
            border: `1px solid color-mix(in srgb, ${assetColor} 20%, transparent)`,
          }}
        >
          {post.asset}
        </span>
        {isPortfolioAsset && (
          <span className="text-[9px] uppercase tracking-wider text-[var(--accent-primary)] font-medium">
            In your portfolio
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-[15px] font-semibold text-[var(--text-primary)] mb-1.5 leading-snug">
        {post.title}
      </h3>

      {/* Body */}
      {post.body && (
        <div className="mb-3">
          <p
            className={cn(
              'text-[13px] text-[var(--text-secondary)] leading-relaxed',
              !expanded && 'line-clamp-3'
            )}
          >
            {post.body}
          </p>
          {post.body.length > 200 && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="text-[12px] text-[var(--accent-primary)] hover:text-[var(--accent-hover)] mt-1 cursor-pointer transition-colors"
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}

      {/* Key levels */}
      {post.key_levels && Object.keys(post.key_levels).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {Object.entries(post.key_levels).map(([label, value]) => (
            <div
              key={label}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
            >
              <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                {label.replace(/_/g, ' ')}
              </span>
              <span className="font-mono text-[11px] tabular-nums text-[var(--text-primary)]">
                {typeof value === 'number' && value > 999 ? formatCurrency(value, 0) : `$${value}`}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Confidence bar */}
      {post.confidence > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
            Confidence
          </span>
          <div className="flex-1 h-[3px] rounded-full bg-[var(--bg-elevated)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${post.confidence}%`,
                background: 'var(--accent-gradient)',
              }}
            />
          </div>
          <span className="font-mono text-[11px] tabular-nums text-[var(--text-secondary)]">
            {post.confidence}%
          </span>
        </div>
      )}
    </div>
  )
}
