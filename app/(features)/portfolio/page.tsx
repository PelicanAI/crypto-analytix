'use client'

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Wallet,
  ArrowsClockwise,
  CaretUp,
  CaretDown,
  Warning,
} from '@phosphor-icons/react'
import { usePortfolio, type EnrichedPosition } from '@/hooks/use-portfolio'
import { useSnaptrade } from '@/hooks/use-snaptrade'
import { usePelicanPanelContext } from '@/providers/pelican-panel-provider'
import { EmptyState } from '@/components/shared/empty-state'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { PelicanIcon } from '@/components/shared/pelican-icon'
import { ASSET_COLORS } from '@/lib/constants'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ASSET_NAMES: Record<string, string> = {
  BTC: 'Bitcoin', ETH: 'Ethereum', SOL: 'Solana', AVAX: 'Avalanche',
  LINK: 'Chainlink', DOT: 'Polkadot', MATIC: 'Polygon', ADA: 'Cardano',
  DOGE: 'Dogecoin', XRP: 'Ripple', BNB: 'BNB Chain', ATOM: 'Cosmos',
  UNI: 'Uniswap', AAVE: 'Aave', ARB: 'Arbitrum', OP: 'Optimism',
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

function formatFundingRate(rate: number): string {
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
// MiniSparkline — inline SVG sparkline
// ---------------------------------------------------------------------------

function MiniSparkline({
  data,
  width = 60,
  height = 20,
  color,
}: {
  data: number[]
  width?: number
  height?: number
  color: string
}) {
  if (!data || data.length < 2) return null

  // Downsample to ~30 points for performance
  const step = Math.max(1, Math.floor(data.length / 30))
  const sampled = data.filter((_, i) => i % step === 0)

  const min = Math.min(...sampled)
  const max = Math.max(...sampled)
  const range = max - min || 1

  const points = sampled
    .map((val, i) => {
      const x = (i / (sampled.length - 1)) * width
      const y = height - ((val - min) / range) * height
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="inline-block ml-2 opacity-60"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// StatCard
// ---------------------------------------------------------------------------

function StatCard({
  title,
  value,
  subtitle,
  subtitleColor,
}: {
  title: string
  value: string
  subtitle: string
  subtitleColor?: string
}) {
  return (
    <div className="card relative overflow-hidden">
      {/* Accent top border */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: 'var(--accent-gradient-subtle)' }}
      />
      <p
        className="text-[11px] uppercase tracking-wider font-semibold mb-2"
        style={{ color: 'var(--text-muted)' }}
      >
        {title}
      </p>
      <p
        className="text-2xl font-semibold font-mono"
        style={{ color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}
      >
        {value}
      </p>
      {subtitle && (
        <p
          className="text-xs font-mono mt-1"
          style={{ color: subtitleColor ?? 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// PelicanInsightCard
// ---------------------------------------------------------------------------

function PelicanInsightCard({
  portfolio,
  onPelicanClick,
}: {
  portfolio: { total_pnl_pct: number; positions: EnrichedPosition[] }
  onPelicanClick: () => void
}) {
  const btcPos = portfolio.positions.find(p => p.asset === 'BTC')
  const btcAlloc = btcPos ? btcPos.allocation_pct.toFixed(0) : '0'

  const elevatedFunding = portfolio.positions.find(
    p => p.funding_rate && Math.abs(p.funding_rate.rate) > 0.0001
  )

  const direction = portfolio.total_pnl_pct >= 0 ? 'up' : 'down'

  let insight = `Your portfolio is ${direction} ${Math.abs(portfolio.total_pnl_pct).toFixed(1)}% today.`
  if (btcPos) {
    insight += ` BTC is ${Number(btcAlloc) > 40 ? 'driving most of the movement' : 'a significant factor'} at ${btcAlloc}% allocation.`
  }
  if (elevatedFunding) {
    const rate = formatFundingRate(elevatedFunding.funding_rate!.rate)
    insight += ` ${elevatedFunding.asset} funding rates are elevated at ${rate} — consider the carry cost implications on your position.`
  }

  return (
    <div
      className="card relative overflow-hidden flex items-start gap-3"
      style={{ background: 'var(--accent-gradient-subtle)' }}
    >
      <div className="flex-shrink-0 mt-0.5">
        <PelicanIcon onClick={onPelicanClick} size={20} glow />
      </div>
      <p className="flex-1 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        {insight}
      </p>
      <div className="flex-shrink-0">
        <PelicanIcon onClick={onPelicanClick} size={16} />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// HoldingsRow — single table row for a position
// ---------------------------------------------------------------------------

function HoldingsRow({
  position,
  onPelicanClick,
}: {
  position: EnrichedPosition
  onPelicanClick: () => void
}) {
  const brandColor = ASSET_COLORS[position.asset] ?? 'var(--text-muted)'
  const name = ASSET_NAMES[position.asset] ?? position.asset
  const pnlColor = position.unrealized_pnl >= 0 ? 'var(--data-positive)' : 'var(--data-negative)'
  const change24hColor =
    position.price_change_24h !== undefined
      ? position.price_change_24h >= 0
        ? 'var(--data-positive)'
        : 'var(--data-negative)'
      : 'var(--text-muted)'

  // Funding rate severity color
  let fundingColor = 'var(--text-muted)'
  if (position.funding_rate) {
    const absRate = Math.abs(position.funding_rate.rate)
    if (position.funding_rate.rate < 0) {
      fundingColor = 'var(--data-positive)' // negative funding = good for longs
    } else if (absRate > 0.0002) {
      fundingColor = 'var(--data-negative)' // > 0.02%
    } else if (absRate > 0.0001) {
      fundingColor = 'var(--data-warning)' // 0.01% - 0.02%
    }
  }

  // Sparkline color based on trend
  const sparklineColor =
    position.sparkline && position.sparkline.length >= 2
      ? position.sparkline[position.sparkline.length - 1] >= position.sparkline[0]
        ? 'var(--data-positive)'
        : 'var(--data-negative)'
      : 'var(--text-muted)'

  return (
    <tr className="group">
      {/* Asset */}
      <td className="!py-3">
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ backgroundColor: brandColor }}
          >
            {position.asset[0]}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center">
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {position.asset}
              </span>
              {position.sparkline && (
                <MiniSparkline data={position.sparkline} color={sparklineColor} />
              )}
            </div>
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {name}
            </span>
          </div>
        </div>
      </td>

      {/* Price */}
      <td>
        <span className="font-mono text-sm" style={{ color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
          {formatCurrency(position.current_price)}
        </span>
      </td>

      {/* 24h % */}
      <td className="hidden md:table-cell">
        {position.price_change_24h !== undefined ? (
          <span className="font-mono text-sm inline-flex items-center gap-0.5" style={{ color: change24hColor, fontVariantNumeric: 'tabular-nums' }}>
            {position.price_change_24h >= 0 ? <CaretUp size={12} weight="fill" /> : <CaretDown size={12} weight="fill" />}
            {formatPercent(position.price_change_24h)}
          </span>
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>--</span>
        )}
      </td>

      {/* P&L */}
      <td>
        <div className="flex flex-col">
          <span className="font-mono text-sm" style={{ color: pnlColor, fontVariantNumeric: 'tabular-nums' }}>
            {position.unrealized_pnl >= 0 ? '+' : ''}{formatCurrency(position.unrealized_pnl)}
          </span>
          <span className="font-mono text-[11px]" style={{ color: pnlColor, fontVariantNumeric: 'tabular-nums' }}>
            {formatPercent(position.unrealized_pnl_pct)}
          </span>
        </div>
      </td>

      {/* Value */}
      <td className="hidden md:table-cell">
        <span className="font-mono text-sm" style={{ color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
          {formatCurrency(position.current_price * position.quantity)}
        </span>
      </td>

      {/* Funding */}
      <td className="hidden md:table-cell">
        {position.funding_rate ? (
          <div className="flex flex-col">
            <span className="font-mono text-sm" style={{ color: fundingColor, fontVariantNumeric: 'tabular-nums' }}>
              {formatFundingRate(position.funding_rate.rate)}
            </span>
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {position.funding_rate.exchange}
            </span>
          </div>
        ) : (
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>--</span>
        )}
      </td>

      {/* Pelican */}
      <td className="!py-3">
        <PelicanIcon onClick={onPelicanClick} size={16} />
      </td>
    </tr>
  )
}

// ---------------------------------------------------------------------------
// Loading skeleton for the portfolio view
// ---------------------------------------------------------------------------

function PortfolioLoadingState() {
  return (
    <div className="max-w-[960px] mx-auto" style={{ padding: 'var(--space-page-x)' }}>
      <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: 'var(--space-card-gap)' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <LoadingSkeleton key={i} variant="card" />
        ))}
      </div>
      <div className="mt-6">
        <LoadingSkeleton variant="row" count={5} />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Error state
// ---------------------------------------------------------------------------

function PortfolioErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="max-w-[960px] mx-auto" style={{ padding: 'var(--space-page-x)' }}>
      <EmptyState
        icon={Warning}
        title="Failed to Load Portfolio"
        description="We couldn't load your portfolio data. Check your connection and try again."
        actionLabel="Retry"
        onAction={onRetry}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function PortfolioPage() {
  const router = useRouter()
  const { portfolio, isLoading, error, isStale, refresh, lastUpdated } = usePortfolio()
  const { connect, isSyncing, sync, connections, isLoading: connectionsLoading } = useSnaptrade()
  const { openWithPrompt } = usePelicanPanelContext()

  const hasPositions = portfolio && portfolio.positions.length > 0
  const hasConnections = connections.length > 0
  const showEmptyState = !isLoading && !connectionsLoading && !hasPositions && !hasConnections

  // Sorted positions by allocation descending
  const sortedPositions = useMemo(() => {
    if (!portfolio?.positions) return []
    return [...portfolio.positions].sort((a, b) => b.allocation_pct - a.allocation_pct)
  }, [portfolio?.positions])

  // Open Pelican with full portfolio context
  const openPortfolioPelican = () => {
    if (!portfolio) return
    const positionSummary = portfolio.positions
      .map(p => `${p.asset}: ${p.allocation_pct.toFixed(1)}% allocation, ${formatPercent(p.unrealized_pnl_pct)} P&L`)
      .join('\n')

    openWithPrompt('portfolio', {
      visibleMessage: 'Analyze my overall portfolio',
      fullPrompt: `[CRYPTO ANALYTIX - PORTFOLIO ANALYSIS]
TOTAL VALUE: ${formatCurrency(portfolio.total_value)}
TOTAL P&L: ${formatCurrency(portfolio.total_pnl)} (${formatPercent(portfolio.total_pnl_pct)})
BTC CORRELATION: ${portfolio.btc_correlation ?? 'N/A'}
POSITIONS:
${positionSummary}
Provide a comprehensive portfolio analysis. Include: risk assessment, concentration analysis, correlation implications (explain in TradFi terms), and any notable positioning relative to current market conditions.`,
    })
  }

  // Open Pelican for a specific position
  const openPositionPelican = (position: EnrichedPosition) => {
    if (!portfolio) return
    openWithPrompt('position', {
      visibleMessage: `Tell me about my ${position.asset} position`,
      fullPrompt: `[CRYPTO ANALYTIX - POSITION ANALYSIS]
POSITION: ${position.asset} | Qty: ${position.quantity} | Entry: ${formatCurrency(position.avg_entry_price)} | Current: ${formatCurrency(position.current_price)}
P&L: ${position.unrealized_pnl >= 0 ? '+' : ''}${formatCurrency(position.unrealized_pnl)} (${formatPercent(position.unrealized_pnl_pct)}) | Allocation: ${position.allocation_pct.toFixed(1)}%
FUNDING RATE: ${position.funding_rate ? formatFundingRate(position.funding_rate.rate) + ' per 8h on ' + position.funding_rate.exchange : 'N/A'}
PORTFOLIO CONTEXT: Total value ${formatCurrency(portfolio.total_value)}, BTC correlation ${portfolio.btc_correlation ?? 'N/A'}
Analyze this position. Include: risk assessment, funding rate implications (explain in TradFi terms like repo rates and carry costs), and how this position fits the overall portfolio.`,
    }, position.asset)
  }

  // --- Empty state ---
  if (showEmptyState) {
    return (
      <div className="max-w-[960px] mx-auto" style={{ padding: 'var(--space-page-x)' }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <EmptyState
            icon={Wallet}
            title="Connect Your Exchange"
            description="Link your Kraken, Coinbase, or other exchange to see your portfolio with real-time analytics and Pelican AI insights."
            actionLabel="Connect Exchange"
            onAction={() => connect()}
          />
          <p className="text-center mt-4">
            <button
              onClick={() => router.push('/portfolio?mock=true')}
              className="text-xs cursor-pointer transition-colors duration-150"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              Or try demo mode
            </button>
          </p>
        </motion.div>
      </div>
    )
  }

  // --- Loading state ---
  if (isLoading && !portfolio) {
    return <PortfolioLoadingState />
  }

  // --- Error state (no cached data) ---
  if (error && !portfolio) {
    return <PortfolioErrorState onRetry={refresh} />
  }

  // --- Portfolio loaded ---
  if (!portfolio) return null

  const pnl24hColor = portfolio.total_pnl >= 0 ? 'var(--data-positive)' : 'var(--data-negative)'

  return (
    <div className="max-w-[960px] mx-auto" style={{ padding: 'var(--space-page-x)' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key="portfolio-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Portfolio
            </h1>
            <div className="flex items-center gap-3">
              {isStale && (
                <span
                  className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                  style={{
                    color: 'var(--data-warning)',
                    backgroundColor: 'rgba(245,158,11,0.12)',
                  }}
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
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                title="Sync portfolio"
              >
                <ArrowsClockwise
                  size={18}
                  className={isSyncing ? 'animate-spin' : ''}
                />
              </button>
            </div>
          </div>

          {/* Stat Cards */}
          <div
            className="grid grid-cols-2 lg:grid-cols-4"
            style={{ gap: 'var(--space-card-gap)' }}
          >
            <StatCard
              title="Total Value"
              value={formatCurrency(portfolio.total_value)}
              subtitle={`${portfolio.total_pnl >= 0 ? '+' : ''}${formatCurrency(portfolio.total_pnl)} (${formatPercent(portfolio.total_pnl_pct)})`}
              subtitleColor={pnl24hColor}
            />
            <StatCard
              title="Unrealized P&L"
              value={`${portfolio.total_pnl >= 0 ? '+' : ''}${formatCurrency(portfolio.total_pnl)}`}
              subtitle={formatPercent(portfolio.total_pnl_pct)}
              subtitleColor={pnl24hColor}
            />
            <StatCard
              title="BTC Correlation"
              value={portfolio.btc_correlation !== null ? portfolio.btc_correlation.toFixed(2) : '\u2014'}
              subtitle={correlationLabel(portfolio.btc_correlation)}
            />
            <StatCard
              title="Top Performer"
              value={portfolio.top_performer?.asset ?? '\u2014'}
              subtitle={portfolio.top_performer ? formatPercent(portfolio.top_performer.change_24h) : ''}
              subtitleColor={
                portfolio.top_performer && portfolio.top_performer.change_24h >= 0
                  ? 'var(--data-positive)'
                  : 'var(--data-negative)'
              }
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
            <div className="card !p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Asset</th>
                      <th>Price</th>
                      <th className="hidden md:table-cell">24h</th>
                      <th>P&L</th>
                      <th className="hidden md:table-cell">Value</th>
                      <th className="hidden md:table-cell">Funding</th>
                      <th className="w-12" />
                    </tr>
                  </thead>
                  <tbody>
                    {sortedPositions.map((position) => (
                      <HoldingsRow
                        key={position.id}
                        position={position}
                        onPelicanClick={() => openPositionPelican(position)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
