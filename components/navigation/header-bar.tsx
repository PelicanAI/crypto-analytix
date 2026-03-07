'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Newspaper } from '@phosphor-icons/react'
import { LiveDot } from '@/components/shared/live-dot'
import { Sparkline } from '@/components/portfolio/sparkline'
import { usePortfolio } from '@/hooks/use-portfolio'
import { formatCurrency, formatCurrencyWithSign, formatPercentWithSign } from '@/lib/formatters'
import { MOCK_SPARKLINES } from '@/lib/mock-data'

function PortfolioHeaderSkeleton() {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-[1.5px] font-medium text-[var(--text-muted)]">
        Portfolio
      </span>
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[22px] font-semibold tabular-nums text-[var(--text-primary)]">
          $0.00
        </span>
        <span className="font-mono text-xs tabular-nums text-[var(--data-neutral)]">
          +$0.00 (+0.00%)
        </span>
      </div>
    </div>
  )
}

function PortfolioHeader() {
  const { portfolio } = usePortfolio()

  const totalValue = portfolio?.total_value ?? 0
  const totalPnl = portfolio?.total_pnl ?? 0
  const totalPnlPct = portfolio?.total_pnl_pct ?? 0
  const btcCorrelation = portfolio?.btc_correlation ?? 0
  const pnlColor = totalPnl >= 0 ? 'var(--data-positive)' : totalPnl < 0 ? 'var(--data-negative)' : 'var(--data-neutral)'
  const sparkData = MOCK_SPARKLINES.BTC?.slice(-24) || []

  return (
    <>
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-[1.5px] font-medium text-[var(--text-muted)]">
          Portfolio
        </span>
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[22px] font-semibold tabular-nums text-[var(--text-primary)]">
            {formatCurrency(totalValue)}
          </span>
          <span className="font-mono text-xs tabular-nums" style={{ color: pnlColor }}>
            {formatCurrencyWithSign(totalPnl)} ({formatPercentWithSign(totalPnlPct)})
          </span>
        </div>
      </div>
      <div className="hidden md:block">
        <Sparkline data={sparkData.length > 0 ? sparkData : [0]} color={pnlColor} width={60} height={24} />
      </div>
      {/* BTC beta badge */}
      <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md border border-[var(--border-subtle)]">
        <span className="text-[11px] text-[var(--text-muted)]">BTC B</span>
        <span className="font-mono text-[11px] text-[var(--text-secondary)] tabular-nums">
          {btcCorrelation > 0 ? btcCorrelation.toFixed(2) : '--'}
        </span>
      </div>
    </>
  )
}

function PageHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[10px] uppercase tracking-[1.5px] font-medium text-[var(--text-muted)]">
        {label}
      </span>
    </div>
  )
}

function SignalsHeader() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[10px] uppercase tracking-[1.5px] font-medium text-[var(--text-muted)]">
        Signals
      </span>
      <LiveDot size={6} />
      <span className="text-[11px] text-[var(--text-muted)]">Live</span>
    </div>
  )
}

function BriefHeader() {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-[1.5px] font-medium text-[var(--text-muted)]">
        Daily Brief
      </span>
      <span className="text-[13px] text-[var(--text-secondary)]">
        {today}
      </span>
    </div>
  )
}

const ROUTE_LABELS: Record<string, string> = {
  '/calendar': 'Calendar',
  '/learn': 'Learn',
  '/community': 'Community',
  '/settings': 'Settings',
  '/alerts': 'Alerts',
  '/pelican-portal': 'Pelican Portal',
  '/watchlist': 'Watchlist',
}

export default function HeaderBar() {
  const pathname = usePathname()

  const renderHeaderContent = () => {
    if (pathname === '/portfolio' || pathname === '/') {
      return (
        <Suspense fallback={<PortfolioHeaderSkeleton />}>
          <PortfolioHeader />
        </Suspense>
      )
    }
    if (pathname === '/signals') {
      return <SignalsHeader />
    }
    if (pathname === '/brief') {
      return <BriefHeader />
    }
    const label = ROUTE_LABELS[pathname] || pathname.split('/').pop()?.replace(/-/g, ' ') || ''
    return <PageHeader label={label.charAt(0).toUpperCase() + label.slice(1)} />
  }

  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between px-5 md:px-7 py-3
        border-b border-[var(--border-subtle)]"
      style={{
        backgroundColor: 'rgba(from var(--bg-base) r g b / 0.8)',
        backdropFilter: 'blur(20px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.2)',
      }}
    >
      {/* Left group */}
      <div className="flex items-center gap-4">
        {renderHeaderContent()}
      </div>

      {/* Right group */}
      <div className="flex items-center gap-3">
        {/* Live indicator -- hidden on mobile, only on portfolio */}
        {(pathname === '/portfolio' || pathname === '/') && (
          <div className="hidden md:flex items-center gap-1.5">
            <LiveDot size={6} />
            <span className="text-[11px] text-[var(--text-muted)]">Live</span>
          </div>
        )}

        {/* Daily Brief link */}
        <Link
          href="/brief"
          className="flex items-center justify-center w-8 h-8 rounded-lg
            border border-[var(--border-subtle)] cursor-pointer
            transition-all duration-150
            hover:border-[var(--border-hover)] hover:bg-[rgba(255,255,255,0.03)]"
          title="Daily Brief"
        >
          <Newspaper size={16} weight="regular" className="text-[var(--text-secondary)]" />
        </Link>

        {/* Notification bell */}
        <button
          type="button"
          className="flex items-center justify-center w-8 h-8 rounded-lg
            border border-[var(--border-subtle)] cursor-pointer
            transition-all duration-150
            hover:border-[var(--border-hover)] hover:bg-[rgba(255,255,255,0.03)]"
        >
          <Bell size={16} weight="regular" className="text-[var(--text-secondary)]" />
        </button>
      </div>
    </header>
  )
}
