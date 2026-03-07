'use client'

import { useState, useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { ASSET_COLORS } from '@/lib/constants'
import { MOCK_POSITIONS } from '@/lib/mock-data'

// ---------------------------------------------------------------------------
// Time period definitions
// ---------------------------------------------------------------------------

const TIME_PERIODS = [
  { key: '24H', points: 24, label: 'hour' },
  { key: '7D', points: 7, label: 'day' },
  { key: '30D', points: 30, label: 'day' },
  { key: '90D', points: 90, label: 'day' },
  { key: 'YTD', points: 65, label: 'day' },
  { key: 'ALL', points: 180, label: 'day' },
] as const

type PeriodKey = (typeof TIME_PERIODS)[number]['key']

// ---------------------------------------------------------------------------
// Synthetic data generator (seeded random walk)
// ---------------------------------------------------------------------------

function generatePortfolioHistory(
  totalValue: number,
  points: number,
  periodKey: string
): { date: string; value: number }[] {
  // Seeded LCG for deterministic output per period
  let seed = periodKey.charCodeAt(0) * 1000 + points * 7 + Math.round(totalValue)
  function rand(): number {
    seed = (seed * 1664525 + 1013904223) & 0x7fffffff
    return seed / 0x7fffffff
  }

  const now = new Date()
  const data: { date: string; value: number }[] = []
  const volatility = 0.012
  let value = totalValue * (0.92 + rand() * 0.06) // start slightly lower

  for (let i = 0; i < points; i++) {
    const date = new Date(now)
    if (periodKey === '24H') {
      date.setHours(date.getHours() - (points - 1 - i))
    } else {
      date.setDate(date.getDate() - (points - 1 - i))
    }

    const label =
      periodKey === '24H'
        ? date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

    data.push({ date: label, value: parseFloat(value.toFixed(2)) })

    // Random walk with drift toward current value
    const noise = (rand() - 0.48) * volatility * value
    const pull = (totalValue - value) * 0.02
    value = Math.max(value + noise + pull, totalValue * 0.7)
  }

  // Final point = current value
  data[data.length - 1].value = totalValue
  return data
}

// ---------------------------------------------------------------------------
// Custom tooltip
// ---------------------------------------------------------------------------

function ChartTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-lg border px-3 py-2"
      style={{
        background: 'var(--bg-elevated)',
        borderColor: 'var(--border-default)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
      }}
    >
      <p className="text-[11px] mb-0.5" style={{ color: 'var(--text-muted)' }}>
        {label}
      </p>
      <p
        className="font-mono text-[14px] font-semibold"
        style={{ color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}
      >
        ${payload[0].value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Allocation bar
// ---------------------------------------------------------------------------

function AllocationBar() {
  const sorted = [...MOCK_POSITIONS].sort(
    (a, b) => b.allocation_pct - a.allocation_pct
  )

  return (
    <div>
      {/* Stacked bar */}
      <div className="flex rounded-full overflow-hidden h-[6px]">
        {sorted.map((pos) => (
          <div
            key={pos.asset}
            style={{
              width: `${pos.allocation_pct}%`,
              backgroundColor: ASSET_COLORS[pos.asset] ?? 'var(--text-muted)',
            }}
          />
        ))}
      </div>

      {/* Labels */}
      <div className="flex items-center gap-3 mt-2 flex-wrap">
        {sorted.map((pos) => (
          <div key={pos.asset} className="flex items-center gap-1.5">
            <span
              className="w-[8px] h-[8px] rounded-full flex-shrink-0"
              style={{ backgroundColor: ASSET_COLORS[pos.asset] ?? 'var(--text-muted)' }}
            />
            <span
              className="font-mono text-[11px]"
              style={{ color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}
            >
              {pos.asset} {pos.allocation_pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function PortfolioPerformanceChart() {
  const [activePeriod, setActivePeriod] = useState<PeriodKey>('30D')

  const totalValue = useMemo(
    () =>
      MOCK_POSITIONS.reduce(
        (sum, p) => sum + p.quantity * p.current_price,
        0
      ),
    []
  )

  const chartData = useMemo(() => {
    const period = TIME_PERIODS.find((p) => p.key === activePeriod)!
    return generatePortfolioHistory(totalValue, period.points, activePeriod)
  }, [activePeriod, totalValue])

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.3)',
      }}
    >
      <div style={{ padding: '16px 20px 12px' }}>
        {/* Header row with period tabs */}
        <div className="flex items-center justify-between mb-3">
          <h3
            className="text-[11px] uppercase font-medium"
            style={{ color: 'var(--text-muted)', letterSpacing: '1.5px' }}
          >
            Portfolio Performance
          </h3>

          <div className="flex items-center gap-1">
            {TIME_PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => setActivePeriod(p.key)}
                className="px-2 py-1 rounded-md text-[11px] font-medium transition-colors duration-150 cursor-pointer"
                style={{
                  backgroundColor:
                    activePeriod === p.key
                      ? 'var(--bg-elevated)'
                      : 'transparent',
                  color:
                    activePeriod === p.key
                      ? 'var(--text-primary)'
                      : 'var(--text-muted)',
                }}
                onMouseEnter={(e) => {
                  if (activePeriod !== p.key) {
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (activePeriod !== p.key) {
                    e.currentTarget.style.color = 'var(--text-muted)'
                  }
                }}
              >
                {p.key}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 4, right: 4, bottom: 0, left: 4 }}
            >
              <defs>
                <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                interval="preserveStartEnd"
                minTickGap={40}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                tickFormatter={(v: number) =>
                  '$' + (v / 1000).toFixed(1) + 'K'
                }
                width={52}
                domain={['dataMin * 0.98', 'dataMax * 1.02']}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{
                  stroke: 'var(--border-default)',
                  strokeDasharray: '4 4',
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--accent-primary)"
                strokeWidth={2}
                fill="url(#portfolioGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Allocation bar */}
      <div
        style={{
          padding: '12px 20px 16px',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <p
          className="text-[11px] uppercase font-medium mb-2"
          style={{ color: 'var(--text-muted)', letterSpacing: '1.5px' }}
        >
          Asset Allocation
        </p>
        <AllocationBar />
      </div>
    </div>
  )
}
