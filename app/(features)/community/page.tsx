'use client'

import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  ArrowSquareOut,
  ShareNetwork,
  Copy,
  CheckCircle,
  CaretDown,
  CaretUp,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { useCommunity } from '@/hooks/use-community'
import { usePelicanPanelContext } from '@/providers/pelican-panel-provider'
import { PelicanIcon } from '@/components/shared/pelican-icon'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { formatTimeAgo } from '@/lib/formatters'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const FOREXANALYTIX_CHAT_URL = 'https://www.forexanalytix.com/community'

export default function CommunityPage() {
  const { sharedInsights, isLoading, shareLimit } = useCommunity()
  const { openWithPrompt } = usePelicanPanelContext()
  const prefersReducedMotion = useReducedMotion()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const handleCopyAgain = async (insight: { question: string; answer: string; username: string; id: string }) => {
    const text = [
      `--- Pelican Insight shared by @${insight.username} ---`,
      '',
      `Q: ${insight.question}`,
      '',
      `A: ${insight.answer}`,
      '',
      '--- Shared via Crypto Analytix Pelican Portal ---',
    ].join('\n')

    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }

    setCopiedId(insight.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handlePelicanClick = (insight: { question: string; answer: string }) => {
    openWithPrompt('education', {
      visibleMessage: `Tell me more about: ${insight.question}`,
      fullPrompt: `[CRYPTO ANALYTIX - SHARED INSIGHT FOLLOW-UP]
USER QUESTION: ${insight.question}
PELICAN PREVIOUS ANSWER: ${insight.answer}
Provide deeper analysis and additional context on this topic. Explain any crypto concepts using TradFi analogs.`,
    })
  }

  const sharesToday = shareLimit?.shares_today ?? 0
  const shareMax = shareLimit?.limit ?? 3
  const progressPercent = Math.min((sharesToday / shareMax) * 100, 100)
  const limitReached = sharesToday >= shareMax

  const pageMotion = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 8 } as const,
        animate: { opacity: 1, y: 0 } as const,
        transition: { duration: 0.3 } as const,
      }

  return (
    <motion.div
      className="px-[var(--space-page-x)] py-[var(--space-page-y)]"
      {...pageMotion}
    >
      <div className="max-w-[720px] mx-auto space-y-8">
        {/* Section 1: Community Hub */}
        <section>
          <h1
            className="text-xl font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            Community
          </h1>
          <p
            className="mt-2 text-[14px] leading-relaxed max-w-lg"
            style={{ color: 'var(--text-secondary)' }}
          >
            Join the ForexAnalytix trading community. Connect with veteran
            TradFi traders navigating crypto, participate in analyst Q&A
            sessions with Blake, Grega, and Ryan, and share Pelican insights
            with fellow members.
          </p>

          <motion.a
            href={FOREXANALYTIX_CHAT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium',
              'text-white cursor-pointer transition-all duration-200'
            )}
            style={{
              background: 'var(--accent-gradient)',
              boxShadow: '0 2px 8px rgba(29,161,196,0.3)',
            }}
            whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(29,161,196,0.4)'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(29,161,196,0.3)'
            }}
          >
            Open ForexAnalytix Chat
            <ArrowSquareOut size={16} weight="bold" />
          </motion.a>

          <p className="mt-3 text-[12px]" style={{ color: 'var(--text-muted)' }}>
            Opens in a new tab. The community is moderated by ForexAnalytix analysts.
          </p>
        </section>

        {/* Divider */}
        <div className="h-px w-full" style={{ backgroundColor: 'var(--border-subtle)' }} />

        {/* Section 2: Share Pelican Insights */}
        <section>
          <h2
            className="text-[11px] uppercase font-medium mb-4"
            style={{ color: 'var(--text-muted)', letterSpacing: '1.5px' }}
          >
            Share Pelican Insights
          </h2>
          <p
            className="text-[13px] leading-relaxed max-w-lg"
            style={{ color: 'var(--text-secondary)' }}
          >
            Share your best Pelican Portal conversations with the community.
            Insights are copied to your clipboard for pasting into the
            ForexAnalytix chat. Portfolio-specific data is automatically stripped
            for privacy.
          </p>

          {/* Share limit indicator */}
          <div className="mt-4 flex items-center gap-3">
            <span
              className="text-[13px] font-mono"
              style={{
                color: limitReached ? 'var(--data-negative)' : 'var(--accent-primary)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {sharesToday}/{shareMax}
            </span>
            <div
              className="flex-1 max-w-[200px] h-1 rounded-full overflow-hidden"
              style={{ backgroundColor: 'var(--bg-elevated)' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  backgroundColor: limitReached
                    ? 'var(--data-negative)'
                    : 'var(--accent-primary)',
                }}
                initial={prefersReducedMotion ? { width: `${progressPercent}%` } : { width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              shares today
            </span>
          </div>

          {limitReached && (
            <p className="mt-2 text-[12px]" style={{ color: 'var(--data-negative)' }}>
              Daily limit reached. Resets at midnight UTC.
            </p>
          )}
        </section>

        {/* Divider */}
        <div className="h-px w-full" style={{ backgroundColor: 'var(--border-subtle)' }} />

        {/* Section 3: Your Shared Insights */}
        <section>
          <div className="flex items-center gap-2.5">
            <h2
              className="text-[11px] uppercase font-medium"
              style={{ color: 'var(--text-muted)', letterSpacing: '1.5px' }}
            >
              Your Shared Insights
            </h2>
            {!isLoading && sharedInsights.length > 0 && (
              <span
                className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5
                  rounded-full text-[11px] font-mono font-medium"
                style={{
                  backgroundColor: 'var(--accent-muted)',
                  color: 'var(--accent-primary)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {sharedInsights.length}
              </span>
            )}
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="mt-4">
              <LoadingSkeleton variant="card" count={3} />
            </div>
          )}

          {/* Empty state */}
          {!isLoading && sharedInsights.length === 0 && (
            <div className="mt-6 flex flex-col items-center justify-center py-12">
              <ShareNetwork
                size={48}
                weight="thin"
                style={{ color: 'var(--text-muted)' }}
              />
              <h3
                className="mt-4 text-base font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                No shared insights yet
              </h3>
              <p
                className="mt-2 text-[13px] text-center max-w-[400px]"
                style={{ color: 'var(--text-secondary)' }}
              >
                Ask Pelican a question in the Portal, then share the insight
                with the community.
              </p>
              <Link href="/pelican-portal">
                <motion.span
                  className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm
                    font-medium text-white cursor-pointer transition-colors duration-150"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                  whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                >
                  Open Pelican Portal
                  <ArrowSquareOut size={14} weight="bold" />
                </motion.span>
              </Link>
            </div>
          )}

          {/* Insight cards */}
          {!isLoading && sharedInsights.length > 0 && (
            <div className="mt-4 space-y-3 themed-scroll">
              <AnimatePresence mode="popLayout">
                {sharedInsights.map((insight) => {
                  const isExpanded = expandedIds.has(insight.id)
                  const isCopied = copiedId === insight.id
                  const answerIsLong = insight.answer.length > 200

                  return (
                    <motion.div
                      key={insight.id}
                      layout={!prefersReducedMotion}
                      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="relative rounded-xl p-4 border transition-all duration-200"
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        borderColor: 'var(--border-subtle)',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.15)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-hover)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-subtle)'
                      }}
                    >
                      {/* Pelican icon - top right */}
                      <div className="absolute top-2 right-2">
                        <PelicanIcon
                          onClick={() => handlePelicanClick(insight)}
                          size={14}
                        />
                      </div>

                      {/* Question */}
                      <p
                        className="text-[14px] font-semibold pr-12 leading-snug"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        <span style={{ color: 'var(--accent-primary)' }}>Q: </span>
                        {insight.question}
                      </p>

                      {/* Answer */}
                      <div className="mt-2.5 relative">
                        <motion.div
                          animate={{ height: isExpanded || !answerIsLong ? 'auto' : '5rem' }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <p
                            className="text-[13px] leading-relaxed whitespace-pre-wrap"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {insight.answer}
                          </p>
                        </motion.div>

                        {/* Gradient fade when collapsed */}
                        {answerIsLong && !isExpanded && (
                          <div
                            className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
                            style={{
                              background:
                                'linear-gradient(to top, var(--bg-surface), transparent)',
                            }}
                          />
                        )}
                      </div>

                      {/* Show more/less toggle */}
                      {answerIsLong && (
                        <button
                          onClick={() => toggleExpanded(insight.id)}
                          className="mt-1 flex items-center gap-1 text-[12px] font-medium
                            cursor-pointer transition-colors duration-150"
                          style={{ color: 'var(--accent-primary)' }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-hover)')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
                        >
                          {isExpanded ? (
                            <>
                              Show less <CaretUp size={12} weight="bold" />
                            </>
                          ) : (
                            <>
                              Show more <CaretDown size={12} weight="bold" />
                            </>
                          )}
                        </button>
                      )}

                      {/* Footer */}
                      <div
                        className="mt-3 pt-3 flex items-center justify-between border-t"
                        style={{ borderColor: 'var(--border-subtle)' }}
                      >
                        <span
                          className="text-[12px] font-mono"
                          style={{ color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}
                        >
                          {formatTimeAgo(insight.created_at)}
                        </span>

                        <motion.button
                          onClick={() => handleCopyAgain(insight)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px]
                            font-medium cursor-pointer transition-colors duration-150"
                          style={{
                            color: isCopied
                              ? 'var(--data-positive)'
                              : 'var(--text-secondary)',
                            backgroundColor: isCopied
                              ? 'rgba(34, 197, 94, 0.1)'
                              : 'var(--bg-elevated)',
                          }}
                          whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
                          whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
                        >
                          {isCopied ? (
                            <>
                              <CheckCircle size={14} weight="fill" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy size={14} weight="regular" />
                              Copy again
                            </>
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </section>
      </div>
    </motion.div>
  )
}
