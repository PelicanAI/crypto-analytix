'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ---------------------------------------------------------------------------
// Category keyword detection
// ---------------------------------------------------------------------------

const CATEGORY_KEYWORDS: Record<string, RegExp> = {
  defi: /\b(defi|yield|liquidity|tvl|pool|protocol|staking|lend|borrow|apy|apr|vault|amm|swap|uniswap|aave|compound)\b/i,
  onchain: /\b(whale|wallet|on-?chain|funding|exchange\s+flow|inflow|outflow|accumulation|distribution|smart\s+money|dormant|transfer|mint|burn)\b/i,
  crypto_technical: /\b(btc|eth|sol|avax|link|dot|ada|xrp|bnb|support|resistance|rsi|macd|ema|sma|fibonacci|elliott|harmonic|breakout|breakdown|trendline|volume|divergence|momentum|overbought|oversold)\b/i,
  macro: /\b(fed|fomc|cpi|ppi|gdp|rates?|inflation|treasury|yield\s+curve|dxy|dollar|tariff|macro|employment|nfp|jackson\s+hole|boj|ecb|pboc)\b/i,
  portfolio: /\b(portfolio|allocation|position|holdings?|exposure|correlation|diversif|risk|drawdown|sharpe|pnl|p&l|performance|rebalance)\b/i,
  education: /\b(explain|what\s+is|how\s+does|learn|understand|beginner|basics?|tutorial|guide|difference\s+between|mean|definition)\b/i,
}

// ---------------------------------------------------------------------------
// Thinking messages by category
// ---------------------------------------------------------------------------

const THINKING_MESSAGES: Record<string, string[]> = {
  defi: [
    'Checking protocol data',
    'Analyzing yield curves',
    'Comparing to TradFi rates',
    'Evaluating risk-adjusted returns',
  ],
  onchain: [
    'Scanning on-chain data',
    'Analyzing wallet flows',
    'Identifying smart money patterns',
    'Cross-referencing exchange movements',
  ],
  crypto_technical: [
    'Reading the chart structure',
    'Checking key levels',
    'Analyzing derivatives positioning',
    'Correlating with volume profile',
  ],
  macro: [
    'Processing macro signals',
    'Mapping to crypto correlations',
    'Reviewing cross-asset flows',
    'Translating to portfolio impact',
  ],
  portfolio: [
    'Analyzing your positions',
    'Calculating risk metrics',
    'Checking concentration levels',
    'Comparing to benchmarks',
  ],
  education: [
    'Finding the right TradFi analog',
    'Building a clear explanation',
    'Preparing real-world examples',
  ],
  default: [
    'Thinking',
    'Analyzing the data',
    'Preparing your briefing',
    'Synthesizing insights',
  ],
}

// ---------------------------------------------------------------------------
// Detect the category from user input
// ---------------------------------------------------------------------------

function detectCategory(input: string): string {
  for (const [category, pattern] of Object.entries(CATEGORY_KEYWORDS)) {
    if (pattern.test(input)) return category
  }
  return 'default'
}

// ---------------------------------------------------------------------------
// Animated dots
// ---------------------------------------------------------------------------

function Dots() {
  return (
    <span className="inline-flex items-center gap-[3px] ml-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-[4px] h-[4px] rounded-full"
          style={{ backgroundColor: 'var(--accent-primary)' }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface EnhancedTypingDotsProps {
  /** The user's last message — used to detect context category */
  userMessage?: string
  /** Whether streaming is active */
  isActive?: boolean
}

export function EnhancedTypingDots({
  userMessage = '',
  isActive = true,
}: EnhancedTypingDotsProps) {
  const category = detectCategory(userMessage)
  const messages = THINKING_MESSAGES[category] || THINKING_MESSAGES.default
  const [messageIndex, setMessageIndex] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Cycle through messages
  useEffect(() => {
    if (!isActive) return
    setMessageIndex(0)

    intervalRef.current = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length)
    }, 2800)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isActive, messages.length])

  if (!isActive) return null

  return (
    <div
      className="flex items-center gap-1.5"
      style={{ fontSize: 12, color: 'var(--text-muted)' }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={messageIndex}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          {messages[messageIndex]}
        </motion.span>
      </AnimatePresence>
      <Dots />
    </div>
  )
}
