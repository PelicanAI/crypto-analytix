'use client'

import { Suspense } from 'react'
import { motion } from 'framer-motion'
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
import { useBrief } from '@/hooks/use-brief'
import { usePelicanPanelContext } from '@/providers/pelican-panel-provider'
import { PelicanIcon } from '@/components/shared/pelican-icon'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { EmptyState } from '@/components/shared/empty-state'

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

// ---------------------------------------------------------------------------
// Section components
// ---------------------------------------------------------------------------

function SectionHeader({
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
        className="text-[11px] uppercase tracking-[1.5px] font-semibold"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Loading state
// ---------------------------------------------------------------------------

function BriefLoadingState() {
  return (
    <div className="max-w-3xl mx-auto" style={{ padding: 'var(--space-page-x)' }}>
      <div className="mb-8">
        <LoadingSkeleton variant="text" />
      </div>
      <div className="space-y-6">
        <LoadingSkeleton variant="card" />
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
  const { brief, isLoading, error, refreshBrief } = useBrief()
  const { openWithPrompt } = usePelicanPanelContext()

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
MARKET SNAPSHOT: BTC ${formatPercent(brief.market_snapshot.btc_change_24h)}, ETH ${formatPercent(brief.market_snapshot.eth_change_24h)}
What should I focus on today given this portfolio impact? Assess risk, identify which positions need attention, and suggest any adjustments. Explain in TradFi terms.`,
    })
  }

  const openLevelsPelican = () => {
    if (!brief) return
    const levelsText = brief.key_levels.map(l => `${l.asset} ${l.type}: ${l.level} — ${l.note}`).join('\n')
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

  return (
    <div className="max-w-3xl mx-auto" style={{ padding: 'var(--space-page-x)' }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className="text-xl font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              Daily Brief
            </h1>
            <p
              className="text-[13px] mt-0.5"
              style={{ color: 'var(--text-muted)' }}
            >
              {formatDate()}
              {brief.generated_at && (
                <> &middot; Generated at {formatTime(brief.generated_at)}</>
              )}
            </p>
          </div>
          <button
            onClick={refreshBrief}
            className="p-2 rounded-lg cursor-pointer transition-colors duration-150"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            title="Refresh brief"
          >
            <ArrowsClockwise size={18} />
          </button>
        </div>

        {/* Market snapshot bar */}
        <div
          className="flex items-center justify-between rounded-xl px-5 py-3.5 mb-6 overflow-x-auto"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {[
            { label: 'BTC', value: formatCurrency(snap.btc_price), change: snap.btc_change_24h },
            { label: 'ETH', value: formatCurrency(snap.eth_price), change: snap.eth_change_24h },
            { label: 'Portfolio', value: formatCurrency(snap.portfolio_value), change: snap.portfolio_change_24h },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 px-2">
              <span
                className="text-[11px] uppercase tracking-wider font-semibold"
                style={{ color: 'var(--text-muted)' }}
              >
                {item.label}
              </span>
              <span
                className="font-mono text-sm font-semibold tabular-nums"
                style={{ color: 'var(--text-primary)' }}
              >
                {item.value}
              </span>
              <span
                className="font-mono text-[12px] tabular-nums flex items-center gap-0.5"
                style={{
                  color: item.change >= 0 ? 'var(--data-positive)' : 'var(--data-negative)',
                }}
              >
                {item.change >= 0 ? (
                  <CaretUp size={10} weight="fill" />
                ) : (
                  <CaretDown size={10} weight="fill" />
                )}
                {formatPercent(item.change)}
              </span>
            </div>
          ))}
        </div>

        {/* Content sections */}
        <div className="space-y-5">
          {/* Overnight Summary */}
          <div className="card">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <SectionHeader icon={ChartLine} label="Overnight" />
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {brief.overnight_summary}
                </p>
              </div>
              <PelicanIcon onClick={openOvernightPelican} size={16} />
            </div>
          </div>

          {/* Portfolio Impact */}
          <div className="card">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <SectionHeader icon={Briefcase} label="Your Portfolio" />
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {brief.portfolio_impact}
                </p>
              </div>
              <PelicanIcon onClick={openPortfolioPelican} size={16} />
            </div>
          </div>

          {/* Key Levels */}
          <div className="card">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <SectionHeader icon={Target} label="Key Levels Today" />
                <ul className="space-y-3">
                  {brief.key_levels.map((level, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span
                        className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor:
                            level.type === 'support'
                              ? 'var(--data-positive)'
                              : 'var(--data-negative)',
                        }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[12px] font-semibold"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {level.asset}
                          </span>
                          <span
                            className="font-mono text-[12px] font-semibold tabular-nums"
                            style={{
                              color:
                                level.type === 'support'
                                  ? 'var(--data-positive)'
                                  : 'var(--data-negative)',
                            }}
                          >
                            {level.level}
                          </span>
                          <span
                            className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded"
                            style={{
                              color:
                                level.type === 'support'
                                  ? 'var(--data-positive)'
                                  : 'var(--data-negative)',
                              backgroundColor:
                                level.type === 'support'
                                  ? 'rgba(34,197,94,0.1)'
                                  : 'rgba(239,68,68,0.1)',
                            }}
                          >
                            {level.type}
                          </span>
                        </div>
                        <p
                          className="text-[13px] leading-relaxed mt-0.5"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {level.note}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <PelicanIcon onClick={openLevelsPelican} size={16} />
            </div>
          </div>

          {/* One Thing to Learn */}
          <div
            className="card relative overflow-hidden"
            style={{
              borderLeft: '3px solid var(--accent-primary)',
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <SectionHeader icon={BookOpen} label="One Thing to Learn" />
                <span
                  className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full mb-3"
                  style={{
                    color: 'var(--accent-primary)',
                    backgroundColor: 'var(--accent-muted)',
                  }}
                >
                  {brief.one_thing_to_learn.topic}
                </span>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {brief.one_thing_to_learn.content}
                </p>
              </div>
              <PelicanIcon onClick={openLearnPelican} size={16} />
            </div>
          </div>
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
