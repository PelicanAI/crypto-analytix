'use client'

import { motion } from 'framer-motion'
import {
  ChartLineUp,
  CurrencyBtc,
  Bank,
  TrendUp,
} from '@phosphor-icons/react'
import { PelicanAvatar } from './portal-message'

// ─── Types ──────────────────────────────────────────────────────

interface PortalEmptyStateProps {
  onSelectPrompt: (prompt: string) => void
}

// ─── Starter prompts ────────────────────────────────────────────

const STARTER_PROMPTS = [
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
  {
    icon: TrendUp,
    text: 'Analyze the macro-to-crypto correlation right now',
  },
]

// ─── Empty State ────────────────────────────────────────────────

export function PortalEmptyState({ onSelectPrompt }: PortalEmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6">
      {/* Avatar with radial glow */}
      <div
        className="relative flex items-center justify-center"
        style={{ boxShadow: '0 0 60px 20px rgba(29,161,196,0.08)' }}
      >
        <PelicanAvatar size={64} />
      </div>

      {/* Title */}
      <h2
        className="font-semibold text-center"
        style={{
          fontSize: 22,
          letterSpacing: '-0.02em',
          color: 'var(--text-primary)',
          marginTop: 20,
        }}
      >
        Welcome to Pelican Portal
      </h2>

      {/* Subtitle */}
      <p
        className="text-center"
        style={{
          fontSize: 14,
          lineHeight: '1.7',
          color: 'var(--text-secondary)',
          maxWidth: 420,
          marginTop: 8,
        }}
      >
        Ask anything about crypto — Pelican translates it into the language you already know.
      </p>

      {/* Starter prompt grid */}
      <div
        className="grid grid-cols-2 w-full"
        style={{ gap: 10, maxWidth: 480, marginTop: 32 }}
      >
        {STARTER_PROMPTS.map((prompt, index) => {
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
    </div>
  )
}
