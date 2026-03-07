'use client'

import { MOCK_SMART_MONEY_FEED } from '@/lib/crypto-mock-data'
import { Bird } from '@phosphor-icons/react'

export default function SmartMoneyPage() {
  return (
    <div className="max-w-[900px] mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Smart Money Tracker</h1>
        <span className="flex items-center gap-1.5 text-[11px] text-[var(--data-positive)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--data-positive)] animate-pulse" />
          Live
        </span>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-6">
        {['All', 'Accumulation', 'Distribution', 'Transfer'].map(filter => (
          <button key={filter} className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
            filter === 'All'
              ? 'bg-[rgba(29,161,196,0.1)] text-[var(--accent-primary)] border border-[rgba(29,161,196,0.2)]'
              : 'text-[var(--text-muted)] border border-[var(--border-subtle)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]'
          }`}>
            {filter}
          </button>
        ))}
      </div>

      {/* Activity cards */}
      <div className="space-y-3">
        {MOCK_SMART_MONEY_FEED.map(entry => (
          <div key={entry.id} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 hover:border-[var(--border-hover)] transition-colors cursor-pointer"
            style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.15)' }}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] text-[var(--text-muted)]" style={{ fontVariantNumeric: 'tabular-nums' }}>{entry.time}</span>
                <span className="text-[13px] font-medium text-[var(--text-primary)]">{entry.wallet_label}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[rgba(29,161,196,0.1)] text-[var(--accent-primary)]">
                  {entry.archetype}
                </span>
              </div>
              <Bird size={16} className="text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors cursor-pointer" />
            </div>
            <p className="text-[14px] text-[var(--text-primary)] mb-1.5">
              <span className="text-[var(--text-secondary)]">{entry.action}</span>{' '}
              <span className="font-semibold" style={{ color: 'var(--accent-primary)' }}>{entry.amount}</span>
            </p>
            <p className="text-[12px] italic text-[var(--text-muted)] leading-relaxed">
              &ldquo;{entry.pelican_commentary}&rdquo;
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
