'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  CaretUp,
  CaretDown,
  Clock,
} from '@phosphor-icons/react'
import { PelicanIcon } from '@/components/shared/pelican-icon'
import { usePelicanPanelContext } from '@/providers/pelican-panel-provider'
import type { WhatIMissedData } from '@/hooks/use-brief'

interface WhatIMissedProps {
  data: WhatIMissedData | null
  onDismiss: () => void
}

export default function WhatIMissed({ data, onDismiss }: WhatIMissedProps) {
  const router = useRouter()
  const { openWithPrompt } = usePelicanPanelContext()
  const reducedMotion = useReducedMotion()

  // Auto-dismiss after 30 seconds
  useEffect(() => {
    if (!data) return
    const timer = setTimeout(onDismiss, 30_000)
    return () => clearTimeout(timer)
  }, [data, onDismiss])

  const openPelican = () => {
    if (!data) return
    openWithPrompt('what-i-missed', {
      visibleMessage: 'Tell me more about what I missed',
      fullPrompt: `[CRYPTO ANALYTIX - WHAT I MISSED]
USER AWAY: ${data.hours_away ?? 0} hours
HEADLINE: ${data.headline ?? ''}
PORTFOLIO IMPACT: ${data.portfolio_impact ?? ''}
CHANGES: ${data.changes?.map(c => `${c.asset}: ${c.change}`).join(', ') ?? 'N/A'}
ACTION ITEMS: ${data.action_items?.join('; ') ?? 'None'}
Provide a detailed catch-up analysis. Explain what happened, why it matters to this user's portfolio, and what they should watch today. Use TradFi analogies for crypto concepts.`,
    })
    onDismiss()
  }

  const overlayVariants = reducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }

  const cardVariants = reducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 20, scale: 0.97 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 20, scale: 0.97 },
      }

  return (
    <AnimatePresence>
      {data && (
        <motion.div
          {...overlayVariants}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          style={{ backgroundColor: 'var(--bg-overlay)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onDismiss()
          }}
        >
          <motion.div
            {...cardVariants}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-lg rounded-xl overflow-hidden"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.4)',
            }}
          >
            {/* Accent top bar */}
            <div
              className="h-[3px]"
              style={{ background: 'var(--accent-gradient)' }}
            />

            <div className="p-6">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'var(--accent-muted)' }}
                >
                  <Clock size={20} weight="fill" style={{ color: 'var(--accent-primary)' }} />
                </div>
                <div>
                  <h2
                    className="text-base font-semibold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    While you were away...
                  </h2>
                  <p
                    className="text-[12px] font-mono tabular-nums"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {data.hours_away}h since your last visit
                  </p>
                </div>
              </div>

              {/* Headline */}
              {data.headline && (
                <p
                  className="text-[14px] font-medium leading-relaxed mb-4"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {data.headline}
                </p>
              )}

              {/* Portfolio impact */}
              {data.portfolio_impact && (
                <p
                  className="text-[13px] leading-relaxed mb-4 px-3 py-2.5 rounded-lg"
                  style={{
                    color: 'var(--text-secondary)',
                    background: 'linear-gradient(135deg, rgba(29,161,196,0.06) 0%, var(--bg-elevated) 80%)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  {data.portfolio_impact}
                </p>
              )}

              {/* Asset changes */}
              {data.changes && data.changes.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {data.changes.map((c) => (
                    <div
                      key={c.asset}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors duration-150"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.04)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <span
                        className="text-[12px] font-semibold"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {c.asset}
                      </span>
                      <span
                        className="font-mono text-[12px] tabular-nums flex items-center gap-0.5"
                        style={{
                          color: c.direction === 'up' ? 'var(--data-positive)' : 'var(--data-negative)',
                        }}
                      >
                        {c.direction === 'up' ? (
                          <CaretUp size={10} weight="fill" />
                        ) : (
                          <CaretDown size={10} weight="fill" />
                        )}
                        {c.change}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action items */}
              {data.action_items && data.action_items.length > 0 && (
                <div className="mb-5">
                  <p
                    className="text-[10px] uppercase tracking-[1.5px] font-semibold mb-2.5"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Things to watch
                  </p>
                  <ul className="space-y-2">
                    {data.action_items.map((item, i) => (
                      <li
                        key={i}
                        className="text-[13px] leading-relaxed flex items-start gap-2"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <span
                          className="mt-[7px] w-1 h-1 rounded-full flex-shrink-0"
                          style={{ backgroundColor: 'var(--accent-primary)' }}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onDismiss}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-150"
                  style={{
                    color: 'var(--text-secondary)',
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-hover)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)'
                  }}
                >
                  Got it
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDismiss()
                    router.push('/brief')
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white cursor-pointer transition-colors duration-150"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--accent-hover)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--accent-primary)'
                  }}
                >
                  Open Brief
                  <ArrowRight size={14} weight="bold" />
                </button>
                <PelicanIcon onClick={openPelican} size={16} glow />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
