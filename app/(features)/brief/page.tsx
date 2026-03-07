'use client'

import { Suspense } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { Icon as PhosphorIcon } from '@phosphor-icons/react'
import {
  Newspaper,
  ArrowsClockwise,
  CaretUp,
  CaretDown,
  BookOpen,
  Target,
  ChartLine,
  Briefcase,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { useBrief, type KeyLevel } from '@/hooks/use-brief'
import { usePelicanPanelContext } from '@/providers/pelican-panel-provider'
import { PelicanIcon } from '@/components/shared/pelican-icon'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import WhatIMissed from '@/components/brief/what-i-missed'

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function fmtCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function fmtPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/New_York',
  })
}

function fmtDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

// ---------------------------------------------------------------------------
// Section label (reusable)
// ---------------------------------------------------------------------------

function SectionLabel({
  icon: Icon,
  label,
}: {
  icon: PhosphorIcon
  label: string
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon size={14} weight="bold" style={{ color: 'var(--accent-primary)' }} />
      <span
        className="text-[10px] uppercase tracking-[1.5px] font-semibold"
        style={{ color: 'var(--accent-primary)', letterSpacing: '1.5px' }}
      >
        {label}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Market snapshot bar item
// ---------------------------------------------------------------------------

function SnapshotItem({
  label,
  value,
  change,
  isLast,
}: {
  label: string
  value: string
  change: number
  isLast: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-1',
        !isLast && 'border-r'
      )}
      style={{ borderColor: 'var(--border-subtle)' }}
    >
      <span
        className="text-[10px] uppercase tracking-[1px] font-semibold"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </span>
      <span
        className="font-mono text-[14px] font-semibold tabular-nums"
        style={{ color: 'var(--text-primary)' }}
      >
        {value}
      </span>
      <span
        className="font-mono text-[12px] tabular-nums flex items-center gap-0.5"
        style={{
          color: change >= 0 ? 'var(--data-positive)' : 'var(--data-negative)',
        }}
      >
        {change >= 0 ? (
          <CaretUp size={10} weight="fill" />
        ) : (
          <CaretDown size={10} weight="fill" />
        )}
        {fmtPercent(change)}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Key level row
// ---------------------------------------------------------------------------

function KeyLevelRow({ level, isLast }: { level: KeyLevel; isLast: boolean }) {
  const isSupport = level.type === 'support'
  const color = isSupport ? 'var(--data-positive)' : 'var(--data-negative)'
  const bgColor = isSupport ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)'

  return (
    <li
      className={cn('py-2.5', !isLast && 'border-b')}
      style={{ borderColor: 'rgba(255,255,255,0.04)' }}
    >
      <div className="flex items-center gap-2 flex-wrap">
        {/* Asset pill — brand-colored */}
        <span
          className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono"
          style={{
            color,
            backgroundColor: bgColor,
          }}
        >
          {level.asset}
        </span>
        {/* Price level */}
        <span
          className="font-mono text-[13px] font-semibold tabular-nums"
          style={{ color }}
        >
          {level.level}
        </span>
        {/* Type badge */}
        <span
          className="text-[9px] uppercase tracking-wider px-1.5 py-[1px] rounded font-medium"
          style={{ color, backgroundColor: bgColor }}
        >
          {level.type}
        </span>
      </div>
      <p
        className="text-[13px] leading-relaxed mt-1"
        style={{ color: 'var(--text-secondary)' }}
      >
        {level.note}
      </p>
    </li>
  )
}

// ---------------------------------------------------------------------------
// Loading state
// ---------------------------------------------------------------------------

function BriefLoadingState() {
  return (
    <div className="max-w-3xl mx-auto" style={{ padding: 'var(--space-page-x)' }}>
      {/* Header shimmer */}
      <div className="mb-6">
        <div className="shimmer rounded h-6 w-[160px] mb-2" />
        <div className="shimmer rounded h-4 w-[240px]" />
      </div>
      {/* Snapshot bar shimmer */}
      <div className="shimmer rounded-xl h-[56px] w-full mb-6" />
      {/* Card shimmers */}
      <div className="space-y-4">
        <LoadingSkeleton variant="card" />
        <LoadingSkeleton variant="card" />
        <LoadingSkeleton variant="card" />
        <LoadingSkeleton variant="card" />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main content
// ---------------------------------------------------------------------------

function BriefPageContent() {
  const { brief, whatIMissed, isLoading, error, refreshBrief, dismissWhatIMissed } = useBrief()
  const { openWithPrompt } = usePelicanPanelContext()
  const reducedMotion = useReducedMotion()

  // Pelican prompt builders
  const openOvernightPelican = () => {
    if (!brief) return
    openWithPrompt('daily-brief', {
      visibleMessage: 'Explain the overnight market moves',
      fullPrompt: `[CRYPTO ANALYTIX - DAILY BRIEF: OVERNIGHT]
SUMMARY: ${brief.overnight_summary}
PORTFOLIO: ${brief.portfolio_impact}
Provide a deeper analysis of the overnight moves. Explain how each development impacts a portfolio holding BTC, ETH, SOL, LINK, and AVAX. Use TradFi analogies for any crypto-specific concepts.`,
    })
  }

  const openPortfolioPelican = () => {
    if (!brief) return
    openWithPrompt('daily-brief', {
      visibleMessage: 'Analyze the portfolio impact',
      fullPrompt: `[CRYPTO ANALYTIX - DAILY BRIEF: PORTFOLIO IMPACT]
IMPACT: ${brief.portfolio_impact}
MARKET SNAPSHOT: BTC ${fmtPercent(brief.market_snapshot.btc_change_24h)}, ETH ${fmtPercent(brief.market_snapshot.eth_change_24h)}
What should I focus on today given this portfolio impact? Assess risk, identify which positions need attention, and suggest any adjustments. Explain in TradFi terms.`,
    })
  }

  const openLevelsPelican = () => {
    if (!brief) return
    const levelsText = brief.key_levels
      .map((l) => `${l.asset} ${l.type}: ${l.level} — ${l.note}`)
      .join('\n')
    openWithPrompt('daily-brief', {
      visibleMessage: 'Tell me about these key levels',
      fullPrompt: `[CRYPTO ANALYTIX - DAILY BRIEF: KEY LEVELS]
LEVELS:
${levelsText}
Analyze these levels. Which are most critical? How should I think about position sizing around these levels? Compare to support/resistance concepts a futures trader would know.`,
    })
  }

  const openLearnPelican = () => {
    if (!brief) return
    openWithPrompt('education', {
      visibleMessage: `Explain ${brief.one_thing_to_learn.topic} in more detail`,
      fullPrompt: `[CRYPTO ANALYTIX - DAILY BRIEF: EDUCATION]
TOPIC: ${brief.one_thing_to_learn.topic}
BRIEF: ${brief.one_thing_to_learn.content}
Go deeper on this topic. The user is an experienced traditional finance trader (futures, forex, equities) learning crypto. Use direct TradFi comparisons. Include practical examples using their portfolio assets (BTC, ETH, SOL, LINK, AVAX).`,
    })
  }

  // Animation variants
  const fadeUp = reducedMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
      }

  // Loading
  if (isLoading && !brief) {
    return <BriefLoadingState />
  }

  // Error with no cached data
  if (error && !brief) {
    return (
      <div className="max-w-3xl mx-auto" style={{ padding: 'var(--space-page-x)' }}>
        <EmptyState
          icon={Newspaper}
          title="Brief Unavailable"
          description="We couldn't load today's brief. Try refreshing."
          actionLabel="Retry"
          onAction={refreshBrief}
        />
      </div>
    )
  }

  // No data at all
  if (!brief) return null

  const snap = brief.market_snapshot
  const snapshotItems = [
    { label: 'BTC', value: fmtCurrency(snap.btc_price), change: snap.btc_change_24h },
    { label: 'ETH', value: fmtCurrency(snap.eth_price), change: snap.eth_change_24h },
    { label: 'Portfolio', value: fmtCurrency(snap.portfolio_value), change: snap.portfolio_change_24h },
  ]

  return (
    <div className="max-w-3xl mx-auto" style={{ padding: 'var(--space-page-x)' }}>
      <motion.div
        initial={fadeUp.initial}
        animate={fadeUp.animate}
        transition={{ duration: 0.3 }}
      >
        {/* What I Missed modal (if applicable) */}
        <WhatIMissed data={whatIMissed} onDismiss={dismissWhatIMissed} />

        {/* ---- Page Header ---- */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className="text-xl font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              Daily Brief
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <p
                className="text-[14px]"
                style={{ color: 'var(--text-secondary)' }}
              >
                {fmtDate()}
              </p>
              {brief.generated_at && (
                <span
                  className="font-mono text-[11px] tabular-nums"
                  style={{ color: 'var(--text-muted)' }}
                >
                  &middot; Generated at {fmtTime(brief.generated_at)} ET
                </span>
              )}
            </div>
          </div>
          <motion.button
            type="button"
            onClick={refreshBrief}
            className="p-2.5 rounded-lg cursor-pointer transition-colors duration-150
              text-[var(--text-muted)] hover:text-[var(--accent-primary)]
              hover:bg-[var(--accent-dim)]"
            title="Refresh brief"
            whileHover={{ rotate: 90 }}
            whileTap={{ scale: 0.9, rotate: 180 }}
          >
            <ArrowsClockwise size={18} />
          </motion.button>
        </div>

        {/* ---- Market Snapshot Bar ---- */}
        <motion.div
          className="flex items-center justify-between rounded-xl px-2 py-3 mb-6 overflow-x-auto themed-scroll"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.15)',
          }}
          initial={reducedMotion ? undefined : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          {snapshotItems.map((item, i) => (
            <SnapshotItem
              key={item.label}
              label={item.label}
              value={item.value}
              change={item.change}
              isLast={i === snapshotItems.length - 1}
            />
          ))}
        </motion.div>

        {/* ---- Content Sections ---- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 1. Overnight Summary */}
          <motion.div
            className="card rounded-xl"
            style={{ padding: '20px' }}
            initial={reducedMotion ? undefined : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <SectionLabel icon={ChartLine} label="Overnight" />
                <p
                  className="text-[14px] leading-[1.8]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {brief.overnight_summary}
                </p>
              </div>
              <PelicanIcon onClick={openOvernightPelican} size={16} />
            </div>
          </motion.div>

          {/* 2. Your Portfolio — gradient tint because personalized */}
          <motion.div
            className="relative overflow-hidden rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(29,161,196,0.04) 0%, var(--bg-surface) 60%)',
              border: '1px solid var(--border-subtle)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.15)',
              padding: '20px',
              transition: 'border-color 200ms ease, box-shadow 200ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-hover)'
              e.currentTarget.style.boxShadow =
                '0 2px 4px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)'
              e.currentTarget.style.boxShadow =
                '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.15)'
            }}
            initial={reducedMotion ? undefined : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <SectionLabel icon={Briefcase} label="Your Portfolio" />
                <p
                  className="text-[14px] leading-[1.8]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {brief.portfolio_impact}
                </p>
              </div>
              <PelicanIcon onClick={openPortfolioPelican} size={16} glow />
            </div>
          </motion.div>

          {/* 3. Key Levels Today */}
          <motion.div
            className="card rounded-xl"
            style={{ padding: '20px' }}
            initial={reducedMotion ? undefined : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <SectionLabel icon={Target} label="Key Levels Today" />
                <ul>
                  {brief.key_levels.map((level, i) => (
                    <KeyLevelRow
                      key={`${level.asset}-${level.type}-${i}`}
                      level={level}
                      isLast={i === brief.key_levels.length - 1}
                    />
                  ))}
                </ul>
              </div>
              <PelicanIcon onClick={openLevelsPelican} size={16} />
            </div>
          </motion.div>

          {/* 4. One Thing to Learn — featured section */}
          <motion.div
            className="relative overflow-hidden rounded-xl"
            style={{
              background:
                'linear-gradient(135deg, rgba(29,161,196,0.06) 0%, var(--bg-surface) 70%)',
              border: '1px solid var(--border-subtle)',
              borderLeft: '3px solid var(--accent-primary)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.15)',
              padding: '20px',
              transition: 'border-color 200ms ease, box-shadow 200ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-hover)'
              e.currentTarget.style.borderLeftColor = 'var(--accent-primary)'
              e.currentTarget.style.boxShadow =
                '0 2px 4px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)'
              e.currentTarget.style.borderLeftColor = 'var(--accent-primary)'
              e.currentTarget.style.boxShadow =
                '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.15)'
            }}
            initial={reducedMotion ? undefined : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <SectionLabel icon={BookOpen} label="One Thing to Learn" />
                <span
                  className="inline-flex items-center px-[7px] py-[2px] rounded text-[9px] font-semibold uppercase tracking-wider mb-3"
                  style={{
                    color: 'var(--accent-primary)',
                    backgroundColor: 'color-mix(in srgb, var(--accent-primary) 12%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--accent-primary) 20%, transparent)',
                  }}
                >
                  {brief.one_thing_to_learn.topic}
                </span>
                <p
                  className="text-[14px] leading-[1.8]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {brief.one_thing_to_learn.content}
                </p>
              </div>
              <PelicanIcon onClick={openLearnPelican} size={16} glow />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page export (Suspense wrapper for useSearchParams)
// ---------------------------------------------------------------------------

export default function BriefPage() {
  return (
    <Suspense fallback={<BriefLoadingState />}>
      <BriefPageContent />
    </Suspense>
  )
}
