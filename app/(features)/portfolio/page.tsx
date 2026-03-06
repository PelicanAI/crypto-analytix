'use client'

import { Wallet } from '@phosphor-icons/react'
import { EmptyState } from '@/components/shared/empty-state'
import { usePelicanPanelContext } from '@/providers/pelican-panel-provider'

export default function PortfolioPage() {
  const { openWithPrompt } = usePelicanPanelContext()

  return (
    <div className="p-[var(--space-page-x)]">
      {/* Temporary test buttons — remove in Session 6 */}
      <div className="flex gap-3 mb-8 flex-wrap">
        <button
          onClick={() => openWithPrompt('position', {
            visibleMessage: 'Analyze my BTC position',
            fullPrompt: '[POSITION ANALYSIS] Asset: BTC | Qty: 0.52 | Entry: $78,400 | Current: $84,230 | P&L: +$3,031 (+7.44%) | Allocation: 66.2% | Funding: +0.0082% | Portfolio correlation to BTC: 0.87. Provide contextual analysis of this position including risk assessment, funding rate implications, and any relevant analyst calls.',
          }, 'BTC')}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer hover:scale-[1.02]"
          style={{ background: 'var(--accent-primary)', color: 'white' }}
        >
          Test: BTC Position
        </button>
        <button
          onClick={() => openWithPrompt('funding-rate', {
            visibleMessage: 'Explain SOL funding rate',
            fullPrompt: '[FUNDING RATE ANALYSIS] Asset: SOL | Current funding: +0.012% per 8h (30-day high) | User holds 48 SOL at $142 entry | Current price: $138.50 | User is a traditional futures trader who understands overnight financing costs. Explain what this funding rate means using TradFi analogs, provide historical context, and assess impact on their position.',
          }, 'SOL')}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer hover:scale-[1.02]"
          style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}
        >
          Test: SOL Funding
        </button>
        <button
          onClick={() => openWithPrompt('daily-brief', 'Give me today\'s market brief with portfolio context')}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer hover:scale-[1.02]"
          style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}
        >
          Test: Daily Brief
        </button>
      </div>

      {/* Actual page content */}
      <EmptyState
        icon={Wallet}
        title="Connect Your Exchange"
        description="Link your Kraken, Coinbase, or other exchange account to see your portfolio here."
        actionLabel="Connect Exchange"
        onAction={() => {}}
      />
    </div>
  )
}
