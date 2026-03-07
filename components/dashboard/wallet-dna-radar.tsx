'use client'

import { useRouter } from 'next/navigation'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts'
import { buildChatUrl, walletDnaPrompt } from '@/lib/pelican-prompts'

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const RADAR_DATA = [
  { axis: 'Risk', value: 85 },
  { axis: 'Yield', value: 62 },
  { axis: 'Frequency', value: 78 },
  { axis: 'Diversity', value: 45 },
  { axis: 'Holding', value: 30 },
  { axis: 'Activity', value: 90 },
]

const MINI_STATS = [
  { label: 'Avg Hold Time', value: '14.2 Days' },
  { label: 'Sharpe Ratio', value: '2.94' },
  { label: 'Win Rate', value: '78%' },
]

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function WalletDNARadar() {
  const router = useRouter()

  return (
    <div
      className="rounded-xl border overflow-hidden cursor-pointer transition-all duration-200 hover:border-[var(--border-hover)]"
      onClick={() => router.push(buildChatUrl(walletDnaPrompt()))}
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.3)',
      }}
    >
      <div style={{ padding: '16px 20px' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h3
            className="text-[11px] uppercase font-medium"
            style={{ color: 'var(--text-muted)', letterSpacing: '1.5px' }}
          >
            Wallet DNA
          </h3>

          {/* Archetype badge */}
          <span
            className="text-[11px] font-semibold px-2.5 py-1 rounded-full text-white"
            style={{
              background: 'var(--accent-gradient)',
            }}
          >
            Apex Predator
          </span>
        </div>

        {/* Radar chart */}
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={RADAR_DATA} cx="50%" cy="50%" outerRadius="72%">
              <PolarGrid
                gridType="polygon"
                stroke="var(--border-subtle)"
                strokeOpacity={1}
              />
              <PolarAngleAxis
                dataKey="axis"
                tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              />
              <Radar
                name="Wallet DNA"
                dataKey="value"
                stroke="var(--accent-primary)"
                strokeWidth={2}
                fill="var(--accent-primary)"
                fillOpacity={0.2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mini stats row */}
      <div
        className="flex items-center justify-between"
        style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        {MINI_STATS.map((stat, i) => (
          <div key={stat.label} className="flex items-center gap-1.5">
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {stat.label}:
            </span>
            <span
              className="font-mono text-[12px] font-medium"
              style={{ color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}
            >
              {stat.value}
            </span>
            {i < MINI_STATS.length - 1 && (
              <span
                className="ml-2 text-[11px]"
                style={{ color: 'var(--border-default)' }}
              >
                |
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
