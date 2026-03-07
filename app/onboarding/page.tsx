'use client'

import { useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChartLineUp,
  CurrencyDollar,
  TrendUp,
  Stack,
  GraduationCap,
  Question,
  Wallet,
  ArrowsLeftRight,
  Lightning,
  Check,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { useOnboarding } from '@/hooks/use-onboarding'

// ---------------------------------------------------------------------------
// Option data
// ---------------------------------------------------------------------------

interface OptionItem {
  id: string
  label: string
  subtitle: string
  icon: Icon
}

const BACKGROUND_OPTIONS: OptionItem[] = [
  { id: 'futures-options', label: 'Futures & Options', subtitle: 'CME, ICE, options strategies', icon: ChartLineUp },
  { id: 'forex', label: 'Forex', subtitle: 'G10 pairs, emerging markets', icon: CurrencyDollar },
  { id: 'equities', label: 'Equities', subtitle: 'Stocks, ETFs, equity derivatives', icon: TrendUp },
  { id: 'multiple', label: 'Multiple Markets', subtitle: 'Trade across asset classes', icon: Stack },
  { id: 'new', label: 'New to Trading', subtitle: 'Learning the fundamentals', icon: GraduationCap },
]

const FAMILIARITY_OPTIONS: OptionItem[] = [
  { id: 'none', label: 'Never traded crypto', subtitle: 'Know it exists, haven\'t touched it', icon: Question },
  { id: 'holder', label: 'Own some BTC/ETH', subtitle: 'Hold but don\'t actively trade', icon: Wallet },
  { id: 'occasional', label: 'Trade occasionally', subtitle: 'Buy/sell a few times a month', icon: ArrowsLeftRight },
  { id: 'active', label: 'Active crypto trader', subtitle: 'Daily trading, understand DeFi', icon: Lightning },
]

interface InterestItem {
  id: string
  label: string
  subtitle: string
}

const INTEREST_OPTIONS: InterestItem[] = [
  { id: 'derivatives', label: 'Crypto Derivatives', subtitle: 'Funding rates, perps, liquidations' },
  { id: 'defi', label: 'DeFi & Yield', subtitle: 'Liquidity pools, staking, yield farming' },
  { id: 'onchain', label: 'On-Chain Analysis', subtitle: 'Whale tracking, exchange flows' },
  { id: 'macro', label: 'Macro Correlations', subtitle: 'How TradFi macro drives crypto' },
  { id: 'risk', label: 'Risk Management', subtitle: 'Position sizing, portfolio construction' },
  { id: 'token-evaluation', label: 'Token Evaluation', subtitle: 'Fundamental analysis for tokens' },
]

// Map background selection to trading_background array + experience_level
const BACKGROUND_MAP: Record<string, { background: string[]; experience: string }> = {
  'futures-options': { background: ['futures', 'options'], experience: 'experienced-tradfi' },
  forex: { background: ['forex'], experience: 'experienced-tradfi' },
  equities: { background: ['equities'], experience: 'experienced-tradfi' },
  multiple: { background: ['futures', 'forex', 'equities'], experience: 'experienced-tradfi' },
  new: { background: [], experience: 'beginner' },
}

// ---------------------------------------------------------------------------
// Framer Motion variants
// ---------------------------------------------------------------------------

const stepVariants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
}

const stepTransition = { duration: 0.25, ease: 'easeInOut' as const }

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-3 mb-10">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full transition-all duration-300"
          style={{
            backgroundColor: i === current ? 'var(--accent-primary)' : 'var(--bg-elevated)',
            border: i === current ? 'none' : '1px solid var(--border-default)',
          }}
        />
      ))}
    </div>
  )
}

function OptionCard({
  icon: IconComponent,
  label,
  subtitle,
  selected,
  onClick,
}: {
  icon?: Icon
  label: string
  subtitle: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="flex items-center gap-4 w-full px-5 py-4 rounded-xl cursor-pointer transition-all duration-200 text-left"
      style={{
        backgroundColor: selected ? 'var(--accent-dim)' : 'var(--bg-surface)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: selected ? 'var(--accent-primary)' : 'var(--border-default)',
      }}
      whileTap={{ scale: 0.98 }}
      animate={{ scale: selected ? 1.02 : 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onMouseEnter={(e) => {
        if (!selected) {
          const el = e.currentTarget
          el.style.borderColor = 'var(--accent-muted)'
          el.style.backgroundColor = 'var(--bg-elevated)'
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          const el = e.currentTarget
          el.style.borderColor = 'var(--border-default)'
          el.style.backgroundColor = 'var(--bg-surface)'
        }
      }}
    >
      {IconComponent && (
        <IconComponent
          size={24}
          weight="thin"
          style={{
            color: selected ? 'var(--accent-primary)' : 'var(--text-muted)',
            flexShrink: 0,
          }}
        />
      )}
      <div className="flex-1 min-w-0">
        <div
          className="font-medium leading-tight"
          style={{ fontSize: '15px', color: 'var(--text-primary)' }}
        >
          {label}
        </div>
        <div
          className="mt-0.5 leading-tight"
          style={{ fontSize: '12px', color: 'var(--text-muted)' }}
        >
          {subtitle}
        </div>
      </div>
      {selected && (
        <Check
          size={18}
          weight="bold"
          style={{ color: 'var(--accent-primary)', flexShrink: 0 }}
        />
      )}
    </motion.button>
  )
}

// ---------------------------------------------------------------------------
// Step components
// ---------------------------------------------------------------------------

function StepBackground({
  selectedId,
  onSelect,
}: {
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div>
      <h2
        className="text-xl font-semibold text-center mb-2"
        style={{ color: 'var(--text-primary)' }}
      >
        What&apos;s your trading background?
      </h2>
      <p
        className="text-sm text-center mb-8"
        style={{ color: 'var(--text-muted)' }}
      >
        This helps us speak your language from day one
      </p>
      <div className="grid grid-cols-1 gap-3">
        {BACKGROUND_OPTIONS.map((opt) => (
          <OptionCard
            key={opt.id}
            icon={opt.icon}
            label={opt.label}
            subtitle={opt.subtitle}
            selected={selectedId === opt.id}
            onClick={() => onSelect(opt.id)}
          />
        ))}
      </div>
    </div>
  )
}

function StepFamiliarity({
  selectedId,
  onSelect,
}: {
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div>
      <h2
        className="text-xl font-semibold text-center mb-2"
        style={{ color: 'var(--text-primary)' }}
      >
        How familiar are you with crypto?
      </h2>
      <p
        className="text-sm text-center mb-8"
        style={{ color: 'var(--text-muted)' }}
      >
        We&apos;ll calibrate explanations to your level
      </p>
      <div className="grid grid-cols-1 gap-3">
        {FAMILIARITY_OPTIONS.map((opt) => (
          <OptionCard
            key={opt.id}
            icon={opt.icon}
            label={opt.label}
            subtitle={opt.subtitle}
            selected={selectedId === opt.id}
            onClick={() => onSelect(opt.id)}
          />
        ))}
      </div>
    </div>
  )
}

function StepInterests({
  selected,
  onToggle,
}: {
  selected: string[]
  onToggle: (id: string) => void
}) {
  return (
    <div>
      <h2
        className="text-xl font-semibold text-center mb-2"
        style={{ color: 'var(--text-primary)' }}
      >
        What interests you most?
      </h2>
      <p
        className="text-sm text-center mb-8"
        style={{ color: 'var(--text-muted)' }}
      >
        Select up to 3
      </p>
      <div className="grid grid-cols-1 gap-3">
        {INTEREST_OPTIONS.map((opt) => (
          <OptionCard
            key={opt.id}
            label={opt.label}
            subtitle={opt.subtitle}
            selected={selected.includes(opt.id)}
            onClick={() => onToggle(opt.id)}
          />
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function OnboardingPage() {
  const {
    step,
    responses,
    isSubmitting,
    error,
    setTradingBackground,
    setCryptoFamiliarity,
    setInterests,
    nextStep,
    submit,
    skip,
  } = useOnboarding()

  // Derive which single background option is selected
  const selectedBackgroundId = (() => {
    for (const [id, mapping] of Object.entries(BACKGROUND_MAP)) {
      if (
        mapping.background.length === responses.trading_background.length &&
        mapping.background.every((b) => responses.trading_background.includes(b))
      ) {
        return id
      }
    }
    return null
  })()

  const handleBackgroundSelect = useCallback(
    (id: string) => {
      const mapping = BACKGROUND_MAP[id]
      if (mapping) {
        setTradingBackground(mapping.background)
      }
    },
    [setTradingBackground]
  )

  const handleFamiliaritySelect = useCallback(
    (id: string) => {
      setCryptoFamiliarity(id)
    },
    [setCryptoFamiliarity]
  )

  const handleInterestToggle = useCallback(
    (id: string) => {
      const current = responses.interests
      if (current.includes(id)) {
        // Deselect
        setInterests(current.filter((i) => i !== id))
      } else if (current.length < 3) {
        // Add
        setInterests([...current, id])
      }
      // If already at 3 and trying to add, do nothing (cap reached)
    },
    [responses.interests, setInterests]
  )

  // Determine if current step is valid for Continue/Get Started
  const canProceed = (() => {
    switch (step) {
      case 0:
        return selectedBackgroundId !== null
      case 1:
        return responses.crypto_familiarity !== ''
      case 2:
        return responses.interests.length > 0
      default:
        return false
    }
  })()

  const handleContinue = useCallback(() => {
    if (step === 2) {
      submit()
    } else {
      nextStep()
    }
  }, [step, nextStep, submit])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ backgroundColor: 'var(--bg-base)' }}
    >
      <div className="w-full max-w-[560px] flex flex-col items-center">
        {/* Logo / Brand */}
        <p
          className="text-xs font-semibold tracking-[0.2em] uppercase mb-6"
          style={{ color: 'var(--text-muted)' }}
        >
          Crypto Analytix
        </p>

        {/* Progress Dots */}
        <ProgressDots current={step} total={3} />

        {/* Step Content with AnimatePresence */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step-0"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={stepTransition}
              >
                <StepBackground
                  selectedId={selectedBackgroundId}
                  onSelect={handleBackgroundSelect}
                />
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step-1"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={stepTransition}
              >
                <StepFamiliarity
                  selectedId={responses.crypto_familiarity || null}
                  onSelect={handleFamiliaritySelect}
                />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={stepTransition}
              >
                <StepInterests
                  selected={responses.interests}
                  onToggle={handleInterestToggle}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Continue / Get Started Button */}
        <button
          type="button"
          onClick={handleContinue}
          disabled={!canProceed || isSubmitting}
          className="mt-8 w-full max-w-sm py-3 rounded-xl font-medium transition-all duration-200"
          style={{
            background: canProceed && !isSubmitting ? 'var(--accent-gradient)' : 'var(--bg-elevated)',
            color: canProceed && !isSubmitting ? 'var(--text-primary)' : 'var(--text-muted)',
            cursor: canProceed && !isSubmitting ? 'pointer' : 'not-allowed',
            opacity: isSubmitting ? 0.7 : 1,
            border: 'none',
          }}
        >
          {isSubmitting
            ? 'Setting up...'
            : step === 2
              ? 'Get Started'
              : 'Continue'}
        </button>

        {/* Skip Link */}
        <button
          type="button"
          onClick={skip}
          disabled={isSubmitting}
          className="mt-4 text-sm cursor-pointer transition-colors duration-200 bg-transparent border-none"
          style={{
            color: 'var(--text-muted)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-secondary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)'
          }}
        >
          Skip for now
        </button>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 px-4 py-2 rounded-lg text-sm text-center"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--data-negative)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}
          >
            {error}
          </motion.div>
        )}
      </div>
    </div>
  )
}
