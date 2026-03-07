'use client'

import { motion } from 'framer-motion'
import {
  ChartLineUp,
  CurrencyBtc,
  Bank,
  Compass,
  type Icon,
} from '@phosphor-icons/react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SuggestedPromptsProps {
  onSelectPrompt: (prompt: string) => void
  /** Optional user name for personalization */
  userName?: string
  /** Optional context — affects which prompts are shown */
  context?: 'default' | 'portfolio' | 'signals'
}

// ---------------------------------------------------------------------------
// Default prompts (shown when no personalization data)
// ---------------------------------------------------------------------------

export const DEFAULT_PROMPTS: { icon: Icon; text: string }[] = [
  {
    icon: Compass,
    text: 'Crypto market pulse — BTC dominance and major moves',
  },
  {
    icon: ChartLineUp,
    text: 'Explain funding rates like I trade ES futures',
  },
  {
    icon: CurrencyBtc,
    text: "What's the current derivatives setup on BTC?",
  },
  {
    icon: Bank,
    text: 'Help me understand DeFi yields vs fixed income',
  },
]

// ---------------------------------------------------------------------------
// Market-specific defaults (keyed by market context)
// ---------------------------------------------------------------------------

export const MARKET_DEFAULT_PROMPTS: Record<string, string[]> = {
  crypto: [
    'Crypto market pulse — BTC dominance, sentiment, and biggest moves',
    'Scan altcoins for momentum — which tokens are showing strength?',
    "What's driving crypto sentiment right now?",
  ],
  derivatives: [
    'Show me the funding rate landscape across major tokens',
    'Where is open interest building? Any liquidation risk?',
    'Compare crypto perpetual swaps to CME futures positioning',
  ],
  defi: [
    'Best risk-adjusted DeFi yields right now — explain like TradFi fixed income',
    'Which protocols have the strongest TVL growth this week?',
    'How do stablecoin flows signal market direction?',
  ],
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SuggestedPrompts({
  onSelectPrompt,
}: SuggestedPromptsProps) {
  const prompts = DEFAULT_PROMPTS

  return (
    <div
      className="grid grid-cols-2 w-full"
      style={{ gap: 10, maxWidth: 480 }}
    >
      {prompts.map((prompt, index) => {
        const Icon = prompt.icon
        return (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: index * 0.08,
              ease: 'easeOut',
            }}
            onClick={() => onSelectPrompt(prompt.text)}
            className="text-left cursor-pointer group/card"
            style={{
              padding: 16,
              borderRadius: 12,
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-surface)',
              transition: 'all 200ms ease',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget
              el.style.borderColor = 'var(--accent-muted)'
              el.style.backgroundColor = 'var(--bg-elevated)'
              el.style.transform = 'translateY(-1px)'
              el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget
              el.style.borderColor = 'var(--border-subtle)'
              el.style.backgroundColor = 'var(--bg-surface)'
              el.style.transform = 'translateY(0)'
              el.style.boxShadow = 'none'
            }}
          >
            <Icon
              size={20}
              weight="duotone"
              className="transition-colors duration-200 group-hover/card:text-[var(--accent-primary)]"
              style={{ color: 'var(--text-muted)', marginBottom: 8 }}
            />
            <div
              style={{
                fontSize: 13,
                lineHeight: '1.5',
                color: 'var(--text-secondary)',
              }}
            >
              {prompt.text}
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}
