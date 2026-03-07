'use client'

import { Suspense, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowsClockwise, Flask, X, Warning } from '@phosphor-icons/react'
import { usePortfolio, type EnrichedPosition } from '@/hooks/use-portfolio'
import { useSnaptrade } from '@/hooks/use-snaptrade'
import { usePelicanPanelContext } from '@/providers/pelican-panel-provider'
import { formatCurrency, formatCurrencyWithSign, formatPercentWithSign } from '@/lib/formatters'
import { EmptyState } from '@/components/shared/empty-state'

import { StatCard } from '@/components/portfolio/stat-card'
import { PelicanInsightCard } from '@/components/portfolio/pelican-insight-card'
import { HoldingsTable } from '@/components/portfolio/holdings-table'
import { PortfolioEmpty } from '@/components/portfolio/portfolio-empty'
import { PortfolioLoading } from '@/components/portfolio/portfolio-loading'

// ---------------------------------------------------------------------------
// Helpers used for Pelican prompt construction (not display formatting)
// ---------------------------------------------------------------------------

function formatPercentLocal(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

function formatFundingRateLocal(rate: number): string {
  return `${(rate * 100).toFixed(4)}%`
}

function correlationLabel(val: number | null): string {
  if (val === null) return ''
  const abs = Math.abs(val)
  if (abs >= 0.8) return 'High'
  if (abs >= 0.5) return 'Moderate'
  return 'Low'
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

// ---------------------------------------------------------------------------
// Main content
// ---------------------------------------------------------------------------

function PortfolioPageContent() {
  const router = useRouter()
  const { portfolio, isLoading, error, isStale, isDemoMode, refresh, lastUpdated } = usePortfolio()
  const { connect, isSyncing, sync, connections, isLoading: connectionsLoading } = useSnaptrade()
  const { openWithPrompt } = usePelicanPanelContext()

  const hasPositions = portfolio && portfolio.positions.length > 0
  const hasConnections = connections.length > 0
  const showEmptyState = !isLoading && !connectionsLoading && !hasPositions && !hasConnections && !isDemoMode

  const sortedPositions = useMemo(() => {
    if (!portfolio?.positions) return []
    return [...portfolio.positions].sort((a, b) => b.allocation_pct - a.allocation_pct)
  }, [portfolio?.positions])

  // Pelican prompt — full portfolio context
  const openPortfolioPelican = () => {
    if (!portfolio) return
    const positionSummary = portfolio.positions
      .map(p => `${p.asset}: ${p.allocation_pct.toFixed(1)}% allocation, ${formatPercentLocal(p.unrealized_pnl_pct)} P&L`)
      .join('\n')

    openWithPrompt('portfolio', {
      visibleMessage: 'Analyze my overall portfolio',
      fullPrompt: `[CRYPTO ANALYTIX - PORTFOLIO ANALYSIS]
TOTAL VALUE: ${formatCurrency(portfolio.total_value)}
TOTAL P&L: ${formatCurrency(portfolio.total_pnl)} (${formatPercentLocal(portfolio.total_pnl_pct)})
BTC CORRELATION: ${portfolio.btc_correlation ?? 'N/A'}
POSITIONS:
${positionSummary}
Provide a comprehensive portfolio analysis. Include: risk assessment, concentration analysis, correlation implications (explain in TradFi terms), and any notable positioning relative to current market conditions.`,
    })
  }

  // Pelican prompt — single position
  const openPositionPelican = (position: EnrichedPosition) => {
    if (!portfolio) return
    openWithPrompt('position', {
      visibleMessage: `Tell me about my ${position.asset} position`,
      fullPrompt: `[CRYPTO ANALYTIX - POSITION ANALYSIS]
POSITION: ${position.asset} | Qty: ${position.quantity} | Entry: ${formatCurrency(position.avg_entry_price)} | Current: ${formatCurrency(position.current_price)}
P&L: ${position.unrealized_pnl >= 0 ? '+' : ''}${formatCurrency(position.unrealized_pnl)} (${formatPercentLocal(position.unrealized_pnl_pct)}) | Allocation: ${position.allocation_pct.toFixed(1)}%
FUNDING RATE: ${position.funding_rate ? formatFundingRateLocal(position.funding_rate.rate) + ' per 8h on ' + position.funding_rate.exchange : 'N/A'}
PORTFOLIO CONTEXT: Total value ${formatCurrency(portfolio.total_value)}, BTC correlation ${portfolio.btc_correlation ?? 'N/A'}
Analyze this position. Include: risk assessment, funding rate implications (explain in TradFi terms like repo rates and carry costs), and how this position fits the overall portfolio.`,
    }, position.asset)
  }

  // --- Empty state ---
  if (showEmptyState) {
    return (
      <PortfolioEmpty
        onConnect={() => connect()}
        onDemoMode={() => router.push('/portfolio?mock=true')}
      />
    )
  }

  // --- Loading state ---
  if (isLoading && !portfolio) {
    return <PortfolioLoading />
  }

  // --- Error state ---
  if (error && !portfolio) {
    return (
      <div className="max-w-[960px] mx-auto" style={{ padding: 'var(--space-page-x)' }}>
        <EmptyState
          icon={Warning}
          title="Failed to Load Portfolio"
          description="We couldn't load your portfolio data. Check your connection and try again."
          actionLabel="Retry"
          onAction={refresh}
        />
      </div>
    )
  }

  if (!portfolio) return null

  const pnlColor = portfolio.total_pnl >= 0 ? 'var(--data-positive)' : 'var(--data-negative)'
  const pnlTint = portfolio.total_pnl >= 0 ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)'

  return (
    <div className="max-w-[960px] mx-auto" style={{ padding: 'var(--space-page-x)' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key="portfolio-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          {/* Demo Mode Banner */}
          {isDemoMode && (
            <div
              className="flex items-center justify-between rounded-lg px-4 mb-6"
              style={{
                background: 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.2)',
                padding: '10px 16px',
              }}
            >
              <div className="flex items-center gap-2">
                <Flask size={16} weight="fill" style={{ color: 'var(--data-warning)' }} />
                <span className="text-[13px] font-medium" style={{ color: 'var(--data-warning)' }}>
                  Demo Mode
                </span>
                <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                  — Viewing sample portfolio data
                </span>
              </div>
              <button
                onClick={() => router.push('/portfolio')}
                className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md cursor-pointer transition-colors duration-150"
                style={{ color: 'var(--data-warning)', background: 'rgba(245,158,11,0.1)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(245,158,11,0.2)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(245,158,11,0.1)' }}
              >
                <X size={12} />
                Exit Demo
              </button>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Portfolio
            </h1>
            <div className="flex items-center gap-3">
              {isStale && (
                <span
                  className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                  style={{ color: 'var(--data-warning)', backgroundColor: 'rgba(245,158,11,0.12)' }}
                >
                  Prices may be delayed
                </span>
              )}
              {lastUpdated && (
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {timeAgo(lastUpdated)}
                </span>
              )}
              <button
                onClick={sync}
                disabled={isSyncing}
                className="p-2 rounded-lg cursor-pointer transition-colors duration-150"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)' }}
                title="Sync portfolio"
              >
                <ArrowsClockwise size={18} className={isSyncing ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: 'var(--space-card-gap)' }}>
            <StatCard
              title="Total Value"
              value={formatCurrency(portfolio.total_value)}
              subtitle={`${formatCurrencyWithSign(portfolio.total_pnl)} (${formatPercentWithSign(portfolio.total_pnl_pct)})`}
              subtitleColor={pnlColor}
            />
            <StatCard
              title="Unrealized P&L"
              value={formatCurrencyWithSign(portfolio.total_pnl)}
              subtitle={formatPercentWithSign(portfolio.total_pnl_pct)}
              subtitleColor={pnlColor}
              accentTint={pnlTint}
            />
            <StatCard
              title="BTC Correlation"
              value={portfolio.btc_correlation !== null ? portfolio.btc_correlation.toFixed(2) : '\u2014'}
              subtitle={correlationLabel(portfolio.btc_correlation)}
            />
            <StatCard
              title="Top Performer"
              value={portfolio.top_performer?.asset ?? '\u2014'}
              subtitle={portfolio.top_performer ? formatPercentWithSign(portfolio.top_performer.change_24h) : ''}
              subtitleColor={
                portfolio.top_performer && portfolio.top_performer.change_24h >= 0
                  ? 'var(--data-positive)'
                  : 'var(--data-negative)'
              }
              accentTint="rgba(34,197,94,0.06)"
            />
          </div>

          {/* Pelican Insight Card */}
          <div className="mt-6">
            <PelicanInsightCard
              portfolio={portfolio}
              onPelicanClick={openPortfolioPelican}
            />
          </div>

          {/* Holdings Table */}
          <div className="mt-6">
            <HoldingsTable
              positions={sortedPositions}
              onPositionClick={openPositionPelican}
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default function PortfolioPage() {
  return (
    <Suspense fallback={<PortfolioLoading />}>
      <PortfolioPageContent />
    </Suspense>
  )
}
