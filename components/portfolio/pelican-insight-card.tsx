'use client'

import { Bird } from '@phosphor-icons/react'
import { PelicanIcon } from '@/components/shared/pelican-icon'
import type { EnrichedPosition } from '@/hooks/use-portfolio'

interface PelicanInsightCardProps {
  portfolio: { total_pnl_pct: number; positions: EnrichedPosition[] }
  onPelicanClick: () => void
}

function formatFundingRateLocal(rate: number): string {
  return `${(rate * 100).toFixed(4)}%`
}

export function PelicanInsightCard({
  portfolio,
  onPelicanClick,
}: PelicanInsightCardProps) {
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
    const rate = formatFundingRateLocal(elevatedFunding.funding_rate!.rate)
    insight += ` ${elevatedFunding.asset} funding rates are elevated at ${rate} \u2014 consider the carry cost implications on your position.`
  }

  return (
    <button
      type="button"
      onClick={onPelicanClick}
      className="w-full text-left flex items-start gap-3 rounded-xl border transition-colors duration-200 cursor-pointer"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)',
        borderLeft: '3px solid var(--accent-primary)',
        padding: '16px 20px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--bg-elevated)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--bg-surface)'
      }}
    >
      {/* Pelican avatar */}
      <div
        className="flex-shrink-0 flex items-center justify-center rounded-[7px]"
        style={{
          width: 24,
          height: 24,
          background: 'var(--accent-gradient)',
        }}
      >
        <Bird size={14} weight="fill" className="text-white" />
      </div>

      {/* Insight text */}
      <p
        className="flex-1 text-[13px] leading-[1.7]"
        style={{ color: 'var(--text-secondary)' }}
      >
        {insight}
      </p>

      {/* Pelican icon for deeper analysis */}
      <div className="flex-shrink-0">
        <PelicanIcon onClick={onPelicanClick} size={16} />
      </div>
    </button>
  )
}
