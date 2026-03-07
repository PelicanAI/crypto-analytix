'use client'

import { motion } from 'framer-motion'
import { Bird, ChartLineUp, Bell } from '@phosphor-icons/react'

interface PortfolioEmptyProps {
  onConnect: () => void
  onDemoMode: () => void
}

const featureCards = [
  { icon: ChartLineUp, label: 'Live prices & P&L' },
  { icon: Bell, label: 'Funding rate alerts' },
  { icon: Bird, label: 'AI analysis on every position' },
] as const

export function PortfolioEmpty({ onConnect, onDemoMode }: PortfolioEmptyProps) {
  return (
    <div className="max-w-[960px] mx-auto" style={{ padding: 'var(--space-page-x)' }}>
      <motion.div
        className="flex flex-col items-center pt-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Pelican avatar with radial glow */}
        <div className="relative mb-6">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
              width: 80,
              height: 80,
              top: -16,
              left: -16,
            }}
          />
          <div
            className="relative flex items-center justify-center rounded-full"
            style={{
              width: 48,
              height: 48,
              background: 'var(--accent-gradient)',
            }}
          >
            <Bird size={26} weight="fill" className="text-white" />
          </div>
        </div>

        {/* Heading */}
        <h2
          className="text-xl font-semibold text-center"
          style={{ color: 'var(--text-primary)' }}
        >
          Connect Your Exchange
        </h2>

        {/* Description */}
        <p
          className="text-sm text-center max-w-[420px] leading-relaxed mt-3"
          style={{ color: 'var(--text-secondary)' }}
        >
          Link your Kraken, Coinbase, or other exchange account. Pelican will
          analyze every position, track your funding costs, and surface
          intelligence you&apos;d miss.
        </p>

        {/* CTA button */}
        <motion.button
          onClick={onConnect}
          className="mt-6 px-6 py-3 rounded-lg text-sm font-medium text-white cursor-pointer"
          style={{
            background: 'var(--accent-gradient)',
            boxShadow: '0 2px 8px rgba(29,161,196,0.2)',
          }}
          whileHover={{ scale: 1.03, filter: 'brightness(1.1)' }}
          whileTap={{ scale: 0.97 }}
        >
          Connect Exchange
        </motion.button>

        {/* Demo mode link */}
        <button
          onClick={onDemoMode}
          className="mt-4 text-[13px] cursor-pointer transition-colors duration-150"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-hover)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          Or try demo mode
        </button>

        {/* Feature preview cards */}
        <div className="flex items-center gap-3 mt-10 flex-wrap justify-center">
          {featureCards.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 text-center rounded-xl border"
              style={{
                background: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
                padding: '12px',
                width: 140,
              }}
            >
              <Icon size={20} weight="duotone" style={{ color: 'var(--accent-primary)' }} />
              <span
                className="text-[11px] font-medium"
                style={{ color: 'var(--text-secondary)' }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
