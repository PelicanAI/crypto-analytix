'use client'

import { Suspense, useCallback, useEffect, useRef, useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Lightning, ArrowClockwise, Funnel, CircleNotch } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { useSignals } from '@/hooks/use-signals'
import { usePortfolio } from '@/hooks/use-portfolio'
import { usePelicanPanelContext } from '@/providers/pelican-panel-provider'
import { AnalystCard } from '@/components/signals/analyst-card'
import { CTSignalCard } from '@/components/signals/ct-signal-card'
import { WalletSignalCard } from '@/components/signals/wallet-signal-card'
import { MacroTranslationCard } from '@/components/signals/macro-translation-card'
import { EmptyState } from '@/components/shared/empty-state'
import { LiveDot } from '@/components/shared/live-dot'
import { formatCurrency, formatPercentWithSign } from '@/lib/formatters'
import type { SignalFilter, SignalFeedItem, AnalystPost, CTSignal, WalletSignal, MacroTranslation } from '@/types/signals'
import type { EnrichedPosition } from '@/hooks/use-portfolio'

export const dynamic = 'force-dynamic'

const FILTER_TABS: { key: SignalFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'analyst', label: 'Analyst' },
  { key: 'ct', label: 'CT' },
  { key: 'onchain', label: 'On-Chain' },
  { key: 'macro', label: 'Macro' },
]

const ASSET_FILTER_OPTIONS = ['BTC', 'ETH', 'SOL', 'LINK', 'AVAX']

/* ─── Loading skeleton ─── */
function SignalCardSkeleton() {
  return (
    <div
      className="shimmer rounded-xl h-[140px] w-full"
      style={{
        borderLeft: '3px solid var(--border-subtle)',
      }}
    />
  )
}

function SignalsLoadingState() {
  return (
    <div className="px-[var(--space-page-x)] py-[var(--space-page-y)]">
      <div className="max-w-[760px] mx-auto">
        <div className="flex flex-col gap-[var(--space-card-gap)]">
          {Array.from({ length: 5 }).map((_, i) => (
            <SignalCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function SignalsPage() {
  return (
    <Suspense fallback={<SignalsLoadingState />}>
      <SignalsPageContent />
    </Suspense>
  )
}

function SignalsPageContent() {
  const reducedMotion = useReducedMotion()
  const {
    signals,
    isLoading,
    filter,
    setFilter,
    assetFilter,
    setAssetFilter,
    loadMore,
    hasMore,
    isLoadingMore,
    refresh,
  } = useSignals()

  const { portfolio } = usePortfolio()
  const { openWithPrompt } = usePelicanPanelContext()

  // Portfolio asset set for highlighting
  const portfolioAssets = useMemo(() => {
    if (!portfolio?.positions) return new Set<string>()
    return new Set(portfolio.positions.map((p: EnrichedPosition) => p.asset))
  }, [portfolio])

  // Find position data for Pelican prompts
  const getPosition = useCallback(
    (asset: string): EnrichedPosition | undefined => {
      return portfolio?.positions?.find((p: EnrichedPosition) => p.asset === asset)
    },
    [portfolio]
  )

  // Infinite scroll
  const sentinelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, isLoadingMore, loadMore])

  // Pelican prompt builders
  const buildAnalystPrompt = useCallback(
    (post: AnalystPost) => {
      const position = getPosition(post.asset)
      const holdingContext = position
        ? `USER HOLDS ${post.asset}: ${position.quantity} units | Entry: ${formatCurrency(position.avg_entry_price)} | Current: ${formatCurrency(position.current_price)} | P&L: ${formatPercentWithSign(position.unrealized_pnl_pct)}`
        : `USER DOES NOT HOLD ${post.asset}`

      return {
        visibleMessage: `Analyze ${post.analyst_name}'s ${post.asset} call`,
        fullPrompt: `[CRYPTO ANALYTIX - ANALYST CALL ANALYSIS]
ANALYST: ${post.analyst_name} | METHODOLOGY: ${post.methodology}
ASSET: ${post.asset} | DIRECTION: ${post.direction} | CONFIDENCE: ${post.confidence}%
CALL: ${post.title}
DETAILS: ${post.body}
KEY LEVELS: ${JSON.stringify(post.key_levels)}
${holdingContext}
Analyze this analyst call. How does it relate to my portfolio? Is the methodology sound? What's the historical accuracy of this pattern? Explain the methodology in TradFi terms.`,
      }
    },
    [getPosition]
  )

  const buildCTPrompt = useCallback(
    (signal: CTSignal) => {
      const heldAssets = signal.assets.filter((a) => portfolioAssets.has(a))
      const holdingContext = heldAssets.length > 0
        ? `USER HOLDS: ${heldAssets.join(', ')}`
        : `USER DOES NOT HOLD any of: ${signal.assets.join(', ')}`

      return {
        visibleMessage: `Analyze this CT signal about ${signal.assets.join(', ')}`,
        fullPrompt: `[CRYPTO ANALYTIX - CT SIGNAL TRANSLATION]
SOURCE: ${signal.source_handle}
ORIGINAL: ${signal.original_text}
TRANSLATION: ${signal.translated_text}
ASSETS: ${signal.assets.join(', ')}
${holdingContext}
Expand on this CT signal. Is the thesis sound? What data supports or contradicts it? How does it affect my portfolio specifically?`,
      }
    },
    [portfolioAssets]
  )

  const buildWalletPrompt = useCallback(
    (signal: WalletSignal) => {
      const position = getPosition(signal.asset)
      const holdingContext = position
        ? `USER HOLDS ${signal.asset}: ${position.quantity} units | P&L: ${formatPercentWithSign(position.unrealized_pnl_pct)}`
        : `USER DOES NOT HOLD ${signal.asset}`

      return {
        visibleMessage: `Analyze this on-chain ${signal.action} of ${signal.asset}`,
        fullPrompt: `[CRYPTO ANALYTIX - ON-CHAIN SIGNAL]
WALLET: ${signal.wallet_label || signal.wallet_address} | ARCHETYPE: ${signal.archetype || 'Unknown'}
ACTION: ${signal.action} $${signal.amount_usd.toLocaleString()} of ${signal.asset}
${holdingContext}
Analyze this on-chain activity. What's this wallet's track record? What happened the last times they made a similar move? How should I think about this relative to my ${signal.asset} position?`,
      }
    },
    [getPosition]
  )

  const buildMacroPrompt = useCallback(
    (translation: MacroTranslation) => {
      const heldAssets = translation.affected_assets.filter((a) => portfolioAssets.has(a))
      const holdingContext = heldAssets.length > 0
        ? `USER HOLDS: ${heldAssets.join(', ')}`
        : `USER DOES NOT HOLD any affected assets`

      return {
        visibleMessage: `Analyze the crypto impact of: ${translation.source_title}`,
        fullPrompt: `[CRYPTO ANALYTIX - CROSS-ASSET TRANSLATION]
MACRO EVENT: ${translation.source_title}
ORIGINAL ANALYSIS: ${translation.source_summary}
CRYPTO TRANSLATION: ${translation.crypto_translation}
AFFECTED ASSETS: ${translation.affected_assets.join(', ')}
${holdingContext}
Expand on this cross-asset relationship. How reliable is this correlation historically? What should I watch for in the coming days? How are derivatives positioned relative to this macro shift?`,
      }
    },
    [portfolioAssets]
  )

  const handlePelicanClick = useCallback(
    (item: SignalFeedItem) => {
      switch (item.type) {
        case 'analyst':
          openWithPrompt('analyst-content', buildAnalystPrompt(item.data), item.data.asset)
          break
        case 'ct':
          openWithPrompt('ct-signal', buildCTPrompt(item.data), item.data.assets[0] || null)
          break
        case 'onchain':
          openWithPrompt('wallet-tracking', buildWalletPrompt(item.data), item.data.asset)
          break
        case 'macro':
          openWithPrompt('news', buildMacroPrompt(item.data), item.data.affected_assets[0] || null)
          break
      }
    },
    [openWithPrompt, buildAnalystPrompt, buildCTPrompt, buildWalletPrompt, buildMacroPrompt]
  )

  const isPortfolioRelevant = useCallback(
    (item: SignalFeedItem): boolean => {
      switch (item.type) {
        case 'analyst':
          return portfolioAssets.has(item.data.asset)
        case 'ct':
          return item.data.assets.some((a) => portfolioAssets.has(a))
        case 'onchain':
          return portfolioAssets.has(item.data.asset)
        case 'macro':
          return item.data.affected_assets.some((a) => portfolioAssets.has(a))
      }
    },
    [portfolioAssets]
  )

  const pageAnimation = reducedMotion
    ? { initial: {}, animate: {} }
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
      }

  return (
    <motion.div
      className="px-[var(--space-page-x)] py-[var(--space-page-y)]"
      initial={pageAnimation.initial}
      animate={pageAnimation.animate}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-[760px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Signals</h1>
            <div className="flex items-center gap-1.5">
              <LiveDot size={6} />
              <span className="text-[11px] text-[var(--text-muted)]">Live</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => refresh()}
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-lg border cursor-pointer',
              'transition-all duration-150',
              'hover:bg-[rgba(255,255,255,0.03)]',
            )}
            style={{
              borderColor: 'var(--border-subtle)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-hover)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)' }}
            title="Refresh signals"
          >
            <ArrowClockwise size={16} weight="regular" className="text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* Filter tabs — pill container */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className="flex items-center gap-1 rounded-xl p-1"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={cn(
                  'px-4 py-[7px] rounded-lg text-[13px] font-medium cursor-pointer',
                  'transition-all duration-150',
                  filter === tab.key
                    ? 'text-[var(--text-primary)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
                )}
                style={filter === tab.key ? {
                  backgroundColor: 'var(--bg-elevated)',
                } : undefined}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Asset filter dropdown */}
          <div className="flex items-center gap-1.5 ml-auto">
            <Funnel size={14} weight="regular" className="text-[var(--text-muted)]" />
            <select
              value={assetFilter || ''}
              onChange={(e) => setAssetFilter(e.target.value || null)}
              className={cn(
                'text-[12px] rounded-lg px-2.5 py-1.5 cursor-pointer',
                'transition-all duration-150',
                'focus:outline-none',
              )}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)' }}
            >
              <option value="">All assets</option>
              {ASSET_FILTER_OPTIONS.map((asset) => (
                <option key={asset} value={asset}>{asset}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading state — 5 shimmer cards */}
        {isLoading && signals.length === 0 && (
          <div className="flex flex-col gap-[var(--space-card-gap)]">
            {Array.from({ length: 5 }).map((_, i) => (
              <SignalCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && signals.length === 0 && (
          <EmptyState
            icon={Lightning}
            title={`No ${filter === 'all' ? '' : filter + ' '}signals yet`}
            description={
              assetFilter
                ? `No signals found for ${assetFilter}. Try removing the asset filter.`
                : 'Analyst calls, CT translations, and smart money alerts will appear here.'
            }
          />
        )}

        {/* Signal feed */}
        {signals.length > 0 && (
          <div className="flex flex-col gap-[var(--space-card-gap)]">
            {signals.map((item, index) => {
              const cardAnimation = reducedMotion
                ? { initial: {}, animate: {} }
                : {
                    initial: { opacity: 0, y: 12 },
                    animate: { opacity: 1, y: 0 },
                  }

              return (
                <motion.div
                  key={item.data.id}
                  initial={cardAnimation.initial}
                  animate={cardAnimation.animate}
                  transition={reducedMotion ? { duration: 0 } : { duration: 0.25, delay: Math.min(index * 0.04, 0.3) }}
                >
                  {item.type === 'analyst' && (
                    <AnalystCard
                      post={item.data}
                      onPelicanClick={() => handlePelicanClick(item)}
                      isPortfolioAsset={isPortfolioRelevant(item)}
                    />
                  )}
                  {item.type === 'ct' && (
                    <CTSignalCard
                      signal={item.data}
                      onPelicanClick={() => handlePelicanClick(item)}
                      isPortfolioAsset={isPortfolioRelevant(item)}
                    />
                  )}
                  {item.type === 'onchain' && (
                    <WalletSignalCard
                      signal={item.data}
                      onPelicanClick={() => handlePelicanClick(item)}
                      isPortfolioAsset={isPortfolioRelevant(item)}
                    />
                  )}
                  {item.type === 'macro' && (
                    <MacroTranslationCard
                      translation={item.data}
                      onPelicanClick={() => handlePelicanClick(item)}
                      isPortfolioAsset={isPortfolioRelevant(item)}
                    />
                  )}
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Load more sentinel */}
        <div ref={sentinelRef} className="h-4" />

        {/* Loading more spinner */}
        {isLoadingMore && (
          <div className="flex justify-center py-4">
            <CircleNotch
              size={20}
              weight="bold"
              className="text-[var(--accent-primary)] animate-spin"
            />
          </div>
        )}

        {/* All caught up */}
        {!isLoadingMore && !hasMore && signals.length > 0 && (
          <div className="flex justify-center py-4">
            <span className="text-[12px] text-[var(--text-muted)]">
              You&apos;re all caught up
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
