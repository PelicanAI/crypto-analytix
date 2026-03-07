'use client'

import { useState } from 'react'
import { ArrowRight, Bird } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { buildChatUrl, marketPulsePrompt } from '@/lib/pelican-prompts'

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

const TABS = ['On-Chain', 'Macro', 'DeFi'] as const
type TabKey = (typeof TABS)[number]

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function PelicanMarketPulse() {
  const [activeTab, setActiveTab] = useState<TabKey>('On-Chain')
  const router = useRouter()

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.3)',
      }}
    >
      <div style={{ padding: '16px 20px' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bird size={18} weight="fill" style={{ color: 'var(--accent-primary)' }} />
            <h3
              className="text-[11px] uppercase font-medium"
              style={{ color: 'var(--text-muted)', letterSpacing: '1.5px' }}
            >
              Pelican AI Market Pulse
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              Confidence score:
            </span>
            <span
              className="font-mono text-[13px] font-semibold"
              style={{ color: 'var(--accent-primary)', fontVariantNumeric: 'tabular-nums' }}
            >
              94%
            </span>
          </div>
        </div>

        {/* Body text */}
        <div className="space-y-3">
          <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Bitcoin dominance shows signs of exhaustion at 58.4%. We observe significant
            rotation of smart money into Layer 2 infrastructure and AI-agent protocols.
            Volatility expected around Thursday&apos;s FOMC minutes.
          </p>
          <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Dormant whale movements of 14,200 BTC detected, suggesting potential sell pressure
            or OTC deals. Further monitoring required.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mt-4 mb-3">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors duration-150 cursor-pointer"
              style={{
                backgroundColor:
                  activeTab === tab ? 'var(--bg-elevated)' : 'transparent',
                color:
                  activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab) {
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab) {
                  e.currentTarget.style.color = 'var(--text-muted)'
                }
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => router.push(buildChatUrl(marketPulsePrompt()))}
          className="flex items-center gap-1.5 text-[13px] font-medium transition-colors duration-150 cursor-pointer group"
          style={{ color: 'var(--accent-primary)', background: 'none', border: 'none', padding: 0 }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--accent-hover)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--accent-primary)'
          }}
        >
          Read Full Analysis
          <ArrowRight size={14} weight="bold" className="transition-transform duration-150 group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  )
}
