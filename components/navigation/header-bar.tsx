'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, CaretUp, CaretDown, Newspaper } from '@phosphor-icons/react'
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
        <div className="shimmer h-[22px] w-[120px] rounded" />
        <div className="shimmer h-[14px] w-[90px] rounded" />
      </div>
    </div>
  )
}

function getBtcCorrelationColor(correlation: number): string {
  if (correlation >= 0.8) return 'var(--data-warning)'
  if (correlation >= 0.5) return 'var(--text-secondary)'
  return 'var(--data-positive)'
}

function PortfolioHeader() {
  const { portfolio } = usePortfolio()

  const totalValue = portfolio?.total_value ?? 0
  const totalPnl = portfolio?.total_pnl ?? 0
  const totalPnlPct = portfolio?.total_pnl_pct ?? 0
  const btcCorrelation = portfolio?.btc_correlation ?? 0
  const pnlColor = totalPnl >= 0 ? 'var(--data-positive)' : totalPnl < 0 ? 'var(--data-negative)' : 'var(--data-neutral)'
  const sparkData = MOCK_SPARKLINES.BTC?.slice(-24) || []
  const PnlCaret = totalPnl >= 0 ? CaretUp : CaretDown

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
          <span className="flex items-center gap-0.5 font-mono text-xs tabular-nums" style={{ color: pnlColor }}>
            <PnlCaret size={10} weight="fill" />
            {formatCurrencyWithSign(totalPnl)} ({formatPercentWithSign(totalPnlPct)})
          </span>
        </div>
      </div>
      <div className="hidden md:block">
        <Sparkline data={sparkData.length > 0 ? sparkData : [0]} color={pnlColor} width={80} height={24} />
      </div>
      {/* BTC beta badge */}
      <div
        className="hidden md:flex items-center gap-1.5 rounded-lg"
        style={{
          background: 'var(--bg-surface)',
          padding: '4px 10px',
        }}
        title="Your portfolio's correlation to BTC"
      >
        <span className="text-[11px] text-[var(--text-muted)]">BTC {'\u03B2'}</span>
        <span
          className="font-mono text-[11px] tabular-nums"
          style={{ color: btcCorrelation > 0 ? getBtcCorrelationColor(btcCorrelation) : 'var(--text-muted)' }}
        >
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

function PelicanPortalHeader() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[10px] uppercase tracking-[1.5px] font-medium text-[var(--text-muted)]">
        Pelican Portal
      </span>
      <LiveDot size={6} />
      <span className="text-[11px] text-[var(--text-muted)]">Active</span>
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

function SmartMoneyHeader() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[10px] uppercase tracking-[1.5px] font-medium text-[var(--text-muted)]">
        Smart Money Tracker
      </span>
      <LiveDot size={6} />
      <span className="text-[11px] text-[var(--text-muted)]">Live</span>
    </div>
  )
}

function ScreenerHeader() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[10px] uppercase tracking-[1.5px] font-medium text-[var(--text-muted)]">
        Token Screener
      </span>
    </div>
  )
}

function AlertsHeader() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[10px] uppercase tracking-[1.5px] font-medium text-[var(--text-muted)]">
        AI Alerts
      </span>
      <span
        className="inline-flex items-center rounded-full px-1.5 py-0.5 font-mono text-[10px] tabular-nums font-medium"
        style={{
          background: 'var(--accent-muted)',
          color: 'var(--accent-primary)',
        }}
      >
        7 New
      </span>
    </div>
  )
}

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/calendar': 'Calendar',
  '/learn': 'Learn',
  '/community': 'Community',
  '/settings': 'Settings',
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
    if (pathname === '/pelican-portal') {
      return <PelicanPortalHeader />
    }
    if (pathname === '/signals') {
      return <SignalsHeader />
    }
    if (pathname === '/brief') {
      return <BriefHeader />
    }
    if (pathname === '/smart-money') {
      return <SmartMoneyHeader />
    }
    if (pathname === '/screener') {
      return <ScreenerHeader />
    }
    if (pathname === '/alerts') {
      return <AlertsHeader />
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
        backdropFilter: 'blur(20px) saturate(1.3)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.3)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.05)',
      }}
    >
      {/* Left group */}
      <div className="flex items-center gap-4">
        {renderHeaderContent()}
      </div>

      {/* Right group */}
      <div className="flex items-center gap-2">
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
          className="hidden sm:flex relative items-center justify-center w-8 h-8 rounded-lg
            border border-[var(--border-subtle)] cursor-pointer
            transition-all duration-150
            hover:border-[var(--border-hover)] hover:bg-[rgba(255,255,255,0.03)]"
          title="Daily Brief"
        >
          <Newspaper size={16} weight="regular" className="text-[var(--text-secondary)]" />
          {/* Notification dot */}
          <span
            className="absolute top-0 right-0 w-[6px] h-[6px] rounded-full"
            style={{ background: 'var(--accent-primary)' }}
          />
        </Link>

        {/* Notification bell */}
        <button
          type="button"
          className="relative flex items-center justify-center w-8 h-8 rounded-lg
            border border-[var(--border-subtle)] cursor-pointer
            transition-all duration-150
            hover:border-[var(--border-hover)] hover:bg-[rgba(255,255,255,0.03)]"
        >
          <Bell size={16} weight="regular" className="text-[var(--text-secondary)]" />
          {/* Notification dot */}
          <span
            className="absolute top-0 right-0 w-[6px] h-[6px] rounded-full"
            style={{ background: 'var(--accent-primary)' }}
          />
        </button>
      </div>
    </header>
  )
}
