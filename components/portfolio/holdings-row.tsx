'use client'

import { CaretUp, CaretDown } from '@phosphor-icons/react'
import { PelicanIcon } from '@/components/shared/pelican-icon'
import { Sparkline } from '@/components/portfolio/sparkline'
import { ASSET_COLORS } from '@/lib/constants'
import {
  formatCurrency,
  formatCurrencyWithSign,
  formatPercentWithSign,
  formatFundingRate,
} from '@/lib/formatters'
import type { EnrichedPosition } from '@/hooks/use-portfolio'

const ASSET_NAMES: Record<string, string> = {
  BTC: 'Bitcoin', ETH: 'Ethereum', SOL: 'Solana', AVAX: 'Avalanche',
  LINK: 'Chainlink', DOT: 'Polkadot', MATIC: 'Polygon', ADA: 'Cardano',
  DOGE: 'Dogecoin', XRP: 'Ripple', BNB: 'BNB Chain', ATOM: 'Cosmos',
  UNI: 'Uniswap', AAVE: 'Aave', ARB: 'Arbitrum', OP: 'Optimism',
}

interface HoldingsRowProps {
  position: EnrichedPosition
  onPositionClick: () => void
}

export function HoldingsRow({ position, onPositionClick }: HoldingsRowProps) {
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
      fundingColor = 'var(--data-positive)'
    } else if (absRate > 0.0002) {
      fundingColor = 'var(--data-negative)'
    } else if (absRate > 0.0001) {
      fundingColor = 'var(--data-warning)'
    }
  }

  // Sparkline color based on trend
  const sparklineColor =
    position.sparkline && position.sparkline.length >= 2
      ? position.sparkline[position.sparkline.length - 1] >= position.sparkline[0]
        ? 'var(--data-positive)'
        : 'var(--data-negative)'
      : 'var(--text-muted)'

  // Glow on Pelican when funding is elevated or P&L change is significant
  const shouldGlow =
    (position.funding_rate && Math.abs(position.funding_rate.rate) > 0.0001) ||
    (position.price_change_24h !== undefined && Math.abs(position.price_change_24h) > 5)

  return (
    <tr
      className="group cursor-pointer border-b last:border-0 transition-colors duration-150"
      style={{ borderColor: 'var(--border-subtle)' }}
      onClick={onPositionClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent'
      }}
    >
      {/* Asset */}
      <td style={{ padding: '14px 16px' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ backgroundColor: brandColor }}
          >
            {position.asset[0]}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span
                className="text-sm font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                {position.asset}
              </span>
              {position.sparkline && (
                <Sparkline
                  data={position.sparkline}
                  color={sparklineColor}
                  width={64}
                  height={22}
                  className="ml-1 opacity-60"
                />
              )}
            </div>
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {name}
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
          {formatCurrency(position.current_price)}
        </span>
      </td>

      {/* 24h % */}
      <td className="hidden md:table-cell text-right" style={{ padding: '14px 16px' }}>
        {position.price_change_24h !== undefined ? (
          <span
            className="font-mono text-[13px] inline-flex items-center justify-end gap-0.5"
            style={{ color: change24hColor, fontVariantNumeric: 'tabular-nums' }}
          >
            {position.price_change_24h >= 0 ? (
              <CaretUp size={12} weight="fill" />
            ) : (
              <CaretDown size={12} weight="fill" />
            )}
            {formatPercentWithSign(position.price_change_24h)}
          </span>
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>--</span>
        )}
      </td>

      {/* P&L */}
      <td className="text-right" style={{ padding: '14px 16px' }}>
        <div className="flex flex-col items-end">
          <span
            className="font-mono text-[13px]"
            style={{ color: pnlColor, fontVariantNumeric: 'tabular-nums' }}
          >
            {formatCurrencyWithSign(position.unrealized_pnl)}
          </span>
          <span
            className="font-mono text-[11px] opacity-80"
            style={{ color: pnlColor, fontVariantNumeric: 'tabular-nums' }}
          >
            {formatPercentWithSign(position.unrealized_pnl_pct)}
          </span>
        </div>
      </td>

      {/* Value */}
      <td className="hidden md:table-cell text-right" style={{ padding: '14px 16px' }}>
        <span
          className="font-mono text-[13px]"
          style={{ color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}
        >
          {formatCurrency(position.current_price * position.quantity)}
        </span>
      </td>

      {/* Funding */}
      <td className="hidden md:table-cell text-right" style={{ padding: '14px 16px' }}>
        {position.funding_rate ? (
          <div className="flex flex-col items-end">
            <span
              className="font-mono text-xs"
              style={{ color: fundingColor, fontVariantNumeric: 'tabular-nums' }}
            >
              {formatFundingRate(position.funding_rate.rate)}
            </span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {position.funding_rate.exchange}
            </span>
          </div>
        ) : (
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>--</span>
        )}
      </td>

      {/* Pelican */}
      <td
        className="w-12 text-center"
        style={{ padding: '14px 4px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <PelicanIcon
          onClick={onPositionClick}
          size={16}
          glow={shouldGlow}
        />
      </td>
    </tr>
  )
}
