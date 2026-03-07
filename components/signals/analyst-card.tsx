'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { formatTimeAgo, formatCurrency } from '@/lib/formatters'
import { ASSET_COLORS } from '@/lib/constants'
import { SeverityTag } from '@/components/shared/severity-tag'
import { PelicanIcon } from '@/components/shared/pelican-icon'
import type { AnalystPost } from '@/types/signals'
import type { SeverityType } from '@/lib/constants'

const ANALYST_AVATARS: Record<string, { initials: string; color: string }> = {
  blake: { initials: 'BM', color: '#2A5ADA' },
  grega: { initials: 'GH', color: '#A78BFA' },
  ryan:  { initials: 'RL', color: '#22c55e' },
}

const METHODOLOGY_SEVERITY: Record<string, SeverityType> = {
  harmonic: 'harmonic',
  'elliott-wave': 'elliott-wave',
  macro: 'macro',
  pfi: 'pfi',
  technical: 'technical',
  candlestick: 'candlestick',
}

const DIRECTION_STYLES: Record<string, { label: string; color: string }> = {
  bullish:  { label: 'BULLISH',  color: 'var(--data-positive)' },
  bearish:  { label: 'BEARISH',  color: 'var(--data-negative)' },
  neutral:  { label: 'NEUTRAL',  color: 'var(--data-neutral)' },
}

interface AnalystCardProps {
  post: AnalystPost
  onPelicanClick: () => void
  isPortfolioAsset?: boolean
}

export function AnalystCard({ post, onPelicanClick, isPortfolioAsset }: AnalystCardProps) {
  const [expanded, setExpanded] = useState(false)
  const reducedMotion = useReducedMotion()
  const bodyRef = useRef<HTMLDivElement>(null)
  const avatar = ANALYST_AVATARS[post.analyst_id] || { initials: post.analyst_name.slice(0, 2).toUpperCase(), color: 'var(--accent-primary)' }
  const assetColor = ASSET_COLORS[post.asset] || 'var(--text-secondary)'
  const direction = DIRECTION_STYLES[post.direction] || DIRECTION_STYLES.neutral

  // Determine if Pelican should glow: high confidence + portfolio relevant
  const shouldGlow = isPortfolioAsset === true && post.confidence >= 75

  const toggleExpand = useCallback(() => setExpanded((prev) => !prev), [])

  return (
    <div
      className={cn(
        'relative rounded-xl border border-[var(--border-subtle)] p-4',
        'transition-all duration-200',
        'hover:border-[var(--border-hover)]',
      )}
      style={{
        background: `linear-gradient(135deg, rgba(29,161,196,0.04) 0%, var(--bg-surface) 60%)`,
        borderLeft: '3px solid var(--accent-primary)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.3)',
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          {/* Analyst avatar */}
          <div
            className="flex items-center justify-center w-8 h-8 rounded-full text-[11px] font-bold flex-shrink-0"
            style={{
              backgroundColor: `color-mix(in srgb, ${avatar.color} 20%, transparent)`,
              color: avatar.color,
              border: `1px solid color-mix(in srgb, ${avatar.color} 30%, transparent)`,
            }}
          >
            {avatar.initials}
          </div>
          {/* Name + methodology */}
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-medium text-[var(--text-primary)]">
              {post.analyst_name}
            </span>
            <div className="flex items-center gap-1.5">
              <SeverityTag type={METHODOLOGY_SEVERITY[post.methodology] || 'analyst'} />
            </div>
          </div>
        </div>

        {/* Right side: time + pelican */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="font-mono text-[11px] tabular-nums text-[var(--text-muted)]">
            {formatTimeAgo(post.created_at)}
          </span>
          <PelicanIcon onClick={onPelicanClick} size={18} glow={shouldGlow} />
        </div>
      </div>

      {/* Badges row */}
      <div className="flex items-center gap-2 mb-2.5 flex-wrap">
        {/* Direction pill */}
        <span
          className="inline-flex items-center px-2 py-[2px] rounded-full text-[10px] font-semibold uppercase tracking-wider"
          style={{
            color: direction.color,
            backgroundColor: `color-mix(in srgb, ${direction.color} 12%, transparent)`,
            border: `1px solid color-mix(in srgb, ${direction.color} 25%, transparent)`,
          }}
        >
          {direction.label}
        </span>
        {/* Asset badge */}
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
        {/* Portfolio relevance badge */}
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

      {/* Title */}
      <h3 className="text-[15px] font-semibold text-[var(--text-primary)] mb-1.5 leading-snug">
        {post.title}
      </h3>

      {/* Body with expand/collapse */}
      {post.body && (
        <div className="mb-3">
          <AnimatePresence initial={false}>
            <motion.div
              ref={bodyRef}
              key="body"
              initial={false}
              animate={{
                height: expanded ? 'auto' : '3.9em',
              }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <p className="text-[13px] text-[var(--text-secondary)] leading-[1.7]">
                {post.body}
              </p>
            </motion.div>
          </AnimatePresence>
          {post.body.length > 160 && (
            <button
              type="button"
              onClick={toggleExpand}
              className="text-[12px] text-[var(--accent-primary)] hover:text-[var(--accent-hover)] mt-1 cursor-pointer transition-colors duration-150"
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}

      {/* Key levels as chips */}
      {post.key_levels && Object.keys(post.key_levels).length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {Object.entries(post.key_levels).map(([label, value]) => (
            <div
              key={label}
              className="inline-flex items-center gap-1.5 px-2 py-[2px] rounded-md"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
              }}
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
        <div className="flex items-center gap-2.5">
          <div className="flex-1 h-[3px] rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-elevated)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${post.confidence}%`,
                background: 'var(--accent-gradient)',
              }}
            />
          </div>
          <span className="font-mono text-[10px] tabular-nums text-[var(--text-muted)]">
            {post.confidence}%
          </span>
        </div>
      )}
    </div>
  )
}
