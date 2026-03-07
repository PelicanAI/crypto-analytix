'use client'

import { HoldingsRow } from '@/components/portfolio/holdings-row'
import type { EnrichedPosition } from '@/hooks/use-portfolio'

interface HoldingsTableProps {
  positions: EnrichedPosition[]
  onPositionClick: (position: EnrichedPosition) => void
}

export function HoldingsTable({ positions, onPositionClick }: HoldingsTableProps) {
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
            <tr
              style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
            >
              <th
                className="text-left text-[11px] uppercase font-semibold"
                style={{
                  color: 'var(--text-muted)',
                  letterSpacing: '0.05em',
                  padding: '12px 16px',
                }}
              >
                Asset
              </th>
              <th
                className="text-right text-[11px] uppercase font-semibold"
                style={{
                  color: 'var(--text-muted)',
                  letterSpacing: '0.05em',
                  padding: '12px 16px',
                }}
              >
                Price
              </th>
              <th
                className="hidden md:table-cell text-right text-[11px] uppercase font-semibold"
                style={{
                  color: 'var(--text-muted)',
                  letterSpacing: '0.05em',
                  padding: '12px 16px',
                }}
              >
                24h
              </th>
              <th
                className="text-right text-[11px] uppercase font-semibold"
                style={{
                  color: 'var(--text-muted)',
                  letterSpacing: '0.05em',
                  padding: '12px 16px',
                }}
              >
                P&L
              </th>
              <th
                className="hidden md:table-cell text-right text-[11px] uppercase font-semibold"
                style={{
                  color: 'var(--text-muted)',
                  letterSpacing: '0.05em',
                  padding: '12px 16px',
                }}
              >
                Value
              </th>
              <th
                className="hidden md:table-cell text-right text-[11px] uppercase font-semibold"
                style={{
                  color: 'var(--text-muted)',
                  letterSpacing: '0.05em',
                  padding: '12px 16px',
                }}
              >
                Funding
              </th>
              <th
                className="w-12 text-center text-[11px] uppercase font-semibold"
                style={{
                  color: 'var(--text-muted)',
                  letterSpacing: '0.05em',
                  padding: '12px 4px',
                }}
              />
            </tr>
          </thead>
          <tbody>
            {positions.map((position) => (
              <HoldingsRow
                key={position.id}
                position={position}
                onPositionClick={() => onPositionClick(position)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
