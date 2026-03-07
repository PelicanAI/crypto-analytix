'use client'

import { Suspense, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flask, X, CaretUp, CaretDown } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { formatCurrency, formatCurrencyWithSign, formatPercentWithSign, formatCompact, formatTimeAgo } from '@/lib/formatters'
import { StatCard } from '@/components/portfolio/stat-card'
import { ASSET_COLORS } from '@/lib/constants'
import { MOCK_TOP_MOVERS, MOCK_SMART_MONEY_FEED, getMockPortfolioSummary } from '@/lib/mock-data'
import type { TopMover, SmartMoneyEntry } from '@/lib/mock-data'
import {
  buildChatUrl,
  topMoverPrompt,
  smartMoneyPrompt,
  portfolioValuePrompt,
  pnlPrompt,
  alertsPrompt,
  walletHealthPrompt,
} from '@/lib/pelican-prompts'
import { PortfolioPerformanceChart } from '@/components/dashboard/portfolio-performance-chart'
import { PelicanMarketPulse } from '@/components/dashboard/pelican-market-pulse'
import { WalletDNARadar } from '@/components/dashboard/wallet-dna-radar'

// ---------------------------------------------------------------------------
// Pelican signal badge colors
// ---------------------------------------------------------------------------

const SIGNAL_COLORS: Record<string, { bg: string; text: string }> = {
  accumulation: { bg: 'rgba(34,197,94,0.12)', text: 'var(--data-positive)' },
  momentum:     { bg: 'rgba(29,161,196,0.12)', text: 'var(--accent-primary)' },
  distribution: { bg: 'rgba(239,68,68,0.12)', text: 'var(--data-negative)' },
  whale:        { bg: 'rgba(245,158,11,0.12)', text: 'var(--data-warning)' },
  'smart-money':{ bg: 'rgba(167,139,250,0.12)', text: '#A78BFA' },
}

// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------

function SectionHeader({ title, live }: { title: string; live?: boolean }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <h2
        className="text-[11px] uppercase font-medium"
        style={{ color: 'var(--text-muted)', letterSpacing: '1.5px' }}
      >
        {title}
      </h2>
      {live && (
        <span className="relative flex items-center gap-1.5">
          <span
            className="w-[6px] h-[6px] rounded-full animate-pulse"
            style={{ backgroundColor: 'var(--data-positive)' }}
          />
          <span
            className="text-[10px] uppercase font-medium"
            style={{ color: 'var(--data-positive)', letterSpacing: '0.5px' }}
          >
            Live
          </span>
        </span>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Top Movers Table
// ---------------------------------------------------------------------------

function TopMoversTable({ movers }: { movers: TopMover[] }) {
  const router = useRouter()

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.15)',
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {['Token', 'Price', '24h %', '7d %', 'Volume (24h)', 'Pelican Signal'].map(
                (label, i) => (
                  <th
                    key={label}
                    className={`text-[11px] uppercase font-semibold ${
                      i === 0 ? 'text-left' : 'text-right'
                    } ${i >= 2 && i <= 4 ? 'hidden md:table-cell' : ''}`}
                    style={{
                      color: 'var(--text-muted)',
                      letterSpacing: '0.05em',
                      padding: '12px 16px',
                    }}
                  >
                    {label}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {movers.map((mover) => {
              const brandColor = ASSET_COLORS[mover.asset] ?? 'var(--text-muted)'
              const change24hColor = mover.change_24h >= 0 ? 'var(--data-positive)' : 'var(--data-negative)'
              const change7dColor = mover.change_7d >= 0 ? 'var(--data-positive)' : 'var(--data-negative)'
              const signal = SIGNAL_COLORS[mover.pelican_signal_type] ?? SIGNAL_COLORS.momentum

              return (
                <tr
                  key={mover.asset}
                  className="group cursor-pointer border-b last:border-0 transition-colors duration-150"
                  style={{ borderColor: 'var(--border-subtle)' }}
                  onClick={() =>
                    router.push(
                      buildChatUrl(topMoverPrompt(mover.asset, mover.price, mover.change_24h))
                    )
                  }
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  {/* Token */}
                  <td style={{ padding: '14px 16px' }}>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-[28px] h-[28px] rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: brandColor }}
                      >
                        {mover.asset[0]}
                      </div>
                      <div className="flex flex-col">
                        <span
                          className="text-[14px] font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {mover.asset}
                        </span>
                        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          {mover.name}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="text-right" style={{ padding: '14px 16px' }}>
                    <span
                      className="font-mono text-[13px]"
                      style={{ color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}
                    >
                      {formatCurrency(mover.price)}
                    </span>
                  </td>

                  {/* 24h % */}
                  <td className="hidden md:table-cell text-right" style={{ padding: '14px 16px' }}>
                    <span
                      className="font-mono text-[13px] inline-flex items-center justify-end gap-0.5"
                      style={{ color: change24hColor, fontVariantNumeric: 'tabular-nums' }}
                    >
                      {mover.change_24h >= 0 ? (
                        <CaretUp size={12} weight="fill" />
                      ) : (
                        <CaretDown size={12} weight="fill" />
                      )}
                      {formatPercentWithSign(mover.change_24h)}
                    </span>
                  </td>

                  {/* 7d % */}
                  <td className="hidden md:table-cell text-right" style={{ padding: '14px 16px' }}>
                    <span
                      className="font-mono text-[13px] inline-flex items-center justify-end gap-0.5"
                      style={{ color: change7dColor, fontVariantNumeric: 'tabular-nums' }}
                    >
                      {mover.change_7d >= 0 ? (
                        <CaretUp size={12} weight="fill" />
                      ) : (
                        <CaretDown size={12} weight="fill" />
                      )}
                      {formatPercentWithSign(mover.change_7d)}
                    </span>
                  </td>

                  {/* Volume */}
                  <td className="hidden md:table-cell text-right" style={{ padding: '14px 16px' }}>
                    <span
                      className="font-mono text-[13px]"
                      style={{ color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}
                    >
                      ${formatCompact(mover.volume_24h)}
                    </span>
                  </td>

                  {/* Pelican Signal */}
                  <td className="text-right" style={{ padding: '14px 16px' }}>
                    <span
                      className="inline-block text-[11px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap"
                      style={{
                        backgroundColor: signal.bg,
                        color: signal.text,
                      }}
                    >
                      {mover.pelican_signal}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Smart Money Activity Feed
// ---------------------------------------------------------------------------

function SmartMoneyFeed({ entries }: { entries: SmartMoneyEntry[] }) {
  const router = useRouter()

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.15)',
      }}
    >
      <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="transition-colors duration-150 cursor-pointer"
            style={{ padding: '14px 16px' }}
            onClick={() =>
              router.push(
                buildChatUrl(smartMoneyPrompt(entry.wallet_label, entry.action, entry.amount_display, entry.asset))
              )
            }
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            {/* Top row: time + wallet + action */}
            <div className="flex items-start gap-3">
              {/* Timestamp */}
              <span
                className="font-mono text-[11px] flex-shrink-0 mt-0.5"
                style={{ color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums', minWidth: 48 }}
              >
                {formatTimeAgo(entry.time)}
              </span>

              <div className="flex-1 min-w-0">
                {/* Action line */}
                <p className="text-[13px]" style={{ color: 'var(--text-primary)' }}>
                  <span className="font-medium">{entry.wallet_label}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {' '}{entry.action}{' '}
                  </span>
                  <span className="font-semibold">{entry.amount_display}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{' '}(</span>
                  <span style={{ color: 'var(--accent-primary)' }}>
                    ${formatCompact(entry.amount_usd)}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>)</span>
                </p>

                {/* Pelican commentary */}
                <p
                  className="text-[12px] italic mt-1.5 leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  &ldquo;{entry.pelican_commentary}&rdquo;
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Shimmer loading skeleton for dashboard stat cards
// ---------------------------------------------------------------------------

function DashboardLoading() {
  return (
    <div className="max-w-[960px] mx-auto" style={{ padding: 'var(--space-page-x)' }}>
      {/* Header skeleton */}
      <div className="shimmer rounded h-[24px] w-[120px] mb-6" />

      {/* Stat card skeletons */}
      <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: 'var(--space-card-gap)' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border overflow-hidden"
            style={{
              background: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
              padding: '16px 20px',
            }}
          >
            <div className="shimmer rounded" style={{ width: '40%', height: 10, marginBottom: 12 }} />
            <div className="shimmer rounded" style={{ width: '60%', height: 24, marginBottom: 8 }} />
            <div className="shimmer rounded" style={{ width: '50%', height: 14 }} />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="mt-8">
        <div className="shimmer rounded h-[14px] w-[100px] mb-4" />
        <div
          className="rounded-xl border overflow-hidden"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', padding: '16px' }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3">
              <div className="shimmer rounded-full w-[28px] h-[28px]" />
              <div className="shimmer rounded w-[60px] h-[14px]" />
              <div className="flex-1" />
              <div className="shimmer rounded w-[80px] h-[14px]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main dashboard content
// ---------------------------------------------------------------------------

function DashboardContent() {
  const router = useRouter()

  // Use mock data directly — no API dependency, always shows real values
  const portfolio = useMemo(() => getMockPortfolioSummary(), [])
  const isDemoMode = true

  // Derive values from mock portfolio
  const totalValue = portfolio.total_value
  const totalPnl = portfolio.total_pnl
  const totalPnlPct = portfolio.total_pnl_pct
  const pnlColor = totalPnl >= 0 ? 'var(--data-positive)' : 'var(--data-negative)'
  const pnlTint = totalPnl >= 0 ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)'

  return (
    <div className="max-w-[960px] mx-auto" style={{ padding: 'var(--space-page-x)' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key="dashboard-content"
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
                onClick={() => router.push('/dashboard')}
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
          <h1 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
            Dashboard
          </h1>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: 'var(--space-card-gap)' }}>
            {/* Card 1 — Portfolio Value */}
            <div className="cursor-pointer" onClick={() => router.push(buildChatUrl(portfolioValuePrompt(totalValue)))}>
              <StatCard
                title="Portfolio Value"
                value={formatCurrency(totalValue)}
                subtitle={`${formatCurrencyWithSign(totalPnl)} (${formatPercentWithSign(totalPnlPct)})`}
                subtitleColor={pnlColor}
              />
            </div>

            {/* Card 2 — 24h P&L */}
            <div className="cursor-pointer" onClick={() => router.push(buildChatUrl(pnlPrompt(totalPnl, totalPnlPct)))}>
              <StatCard
                title="24h P&L"
                value={formatCurrencyWithSign(totalPnl)}
                subtitle={formatPercentWithSign(totalPnlPct)}
                subtitleColor={pnlColor}
                accentTint={pnlTint}
              />
            </div>

            {/* Card 3 — AI Alerts Today */}
            <div className="cursor-pointer" onClick={() => router.push(buildChatUrl(alertsPrompt()))}>
              <StatCard
                title="AI Alerts Today"
                value="7"
                subtitle="3 High Impact"
                subtitleColor="var(--data-warning)"
              />
            </div>

            {/* Card 4 — Wallet Health Score */}
            <div className="cursor-pointer" onClick={() => router.push(buildChatUrl(walletHealthPrompt()))}>
              <StatCard
                title="Wallet Health"
                value="82/100"
                subtitle="Strong"
                subtitleColor="var(--data-positive)"
              />
            </div>
          </div>

          {/* Portfolio Performance Chart — full width */}
          <div className="mt-8">
            <PortfolioPerformanceChart />
          </div>

          {/* Pelican Market Pulse + Wallet DNA — 2-column on lg */}
          <div className="grid grid-cols-1 lg:grid-cols-2 mt-6" style={{ gap: 'var(--space-card-gap)' }}>
            <PelicanMarketPulse />
            <WalletDNARadar />
          </div>

          {/* Top Movers */}
          <div className="mt-8">
            <SectionHeader title="Top Movers" />
            <TopMoversTable movers={MOCK_TOP_MOVERS} />
          </div>

          {/* Smart Money Activity */}
          <div className="mt-8">
            <SectionHeader title="Smart Money Activity" live />
            <SmartMoneyFeed entries={MOCK_SMART_MONEY_FEED} />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  )
}
