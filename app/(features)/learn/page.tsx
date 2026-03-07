'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  GraduationCap,
  X as XIcon,
  Check,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { useEducation } from '@/hooks/use-education'
import { usePelicanPanelContext } from '@/providers/pelican-panel-provider'
import { PelicanIcon } from '@/components/shared/pelican-icon'
import { SeverityTag } from '@/components/shared/severity-tag'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import type { SeverityType } from '@/lib/constants'
import type { EducationModule, EducationSection } from '@/types/education'

export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// Category -> SeverityTag mapping
// ---------------------------------------------------------------------------

function categoryToSeverity(category: string): SeverityType {
  const map: Record<string, SeverityType> = {
    derivatives: 'signal',
    fundamentals: 'onchain',
    risk: 'macro',
    strategy: 'analyst',
  }
  return map[category.toLowerCase()] ?? 'neutral'
}

// ---------------------------------------------------------------------------
// Loading state
// ---------------------------------------------------------------------------

function LearnLoadingState() {
  return (
    <div className="px-[var(--space-page-x)] py-[var(--space-page-y)]">
      <div className="max-w-[760px] mx-auto">
        <LoadingSkeleton variant="text" className="mb-4" />
        <div className="h-1 rounded-full mb-6 shimmer" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <LoadingSkeleton key={i} variant="card" />
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Module Card
// ---------------------------------------------------------------------------

function ModuleCard({
  module,
  progress,
  onSelect,
  onPelicanClick,
}: {
  module: EducationModule
  progress?: { started_at: string | null; completed: boolean; quiz_score: number | null }
  onSelect: () => void
  onPelicanClick: () => void
}) {
  const isStarted = !!progress?.started_at && !progress.completed
  const isCompleted = !!progress?.completed

  return (
    <div
      onClick={onSelect}
      className={cn(
        'relative rounded-xl p-5 cursor-pointer transition-all duration-200',
        'border border-[var(--border-subtle)]',
        'hover:border-[var(--border-hover)] hover:-translate-y-[1px]'
      )}
      style={{
        background: 'var(--bg-surface)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.15)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.2)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.15)'
      }}
    >
      {/* Top row: Category + Pelican */}
      <div className="flex items-start justify-between">
        <SeverityTag type={categoryToSeverity(module.category)} />
        <div
          onClick={(e) => {
            e.stopPropagation()
            onPelicanClick()
          }}
        >
          <PelicanIcon
            onClick={onPelicanClick}
            size={14}
          />
        </div>
      </div>

      {/* Title */}
      <h3
        className="text-[15px] font-semibold mt-3 leading-snug"
        style={{ color: 'var(--text-primary)' }}
      >
        {module.title}
      </h3>

      {/* Description */}
      <p
        className="text-[13px] mt-1.5 line-clamp-2"
        style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}
      >
        {module.description}
      </p>

      {/* TradFi analog */}
      <div className="mt-2.5 flex items-baseline gap-1.5">
        <span
          className="text-[10px] uppercase font-semibold tracking-wider"
          style={{ color: 'var(--accent-primary)' }}
        >
          TradFi:
        </span>
        <span
          className="text-xs italic"
          style={{ color: 'var(--text-muted)' }}
        >
          {module.tradfi_analog}
        </span>
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-1.5">
          <Clock size={12} weight="regular" style={{ color: 'var(--text-muted)' }} />
          <span
            className="text-[11px] font-mono"
            style={{ color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}
          >
            {module.estimated_minutes} min
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isStarted && (
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: 'var(--data-warning)' }}
              />
              <span className="text-xs" style={{ color: 'var(--data-warning)' }}>
                In Progress
              </span>
            </div>
          )}
          {isCompleted && (
            <div className="flex items-center gap-1.5">
              <CheckCircle size={14} weight="fill" style={{ color: 'var(--data-positive)' }} />
              <span className="text-xs" style={{ color: 'var(--data-positive)' }}>
                Completed
                {progress?.quiz_score != null && (
                  <span className="font-mono ml-1" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {progress.quiz_score}%
                  </span>
                )}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Section renderer for module detail
// ---------------------------------------------------------------------------

function SectionBlock({
  section,
  onPelicanClick,
}: {
  section: EducationSection
  onPelicanClick: (section: EducationSection) => void
}) {
  switch (section.type) {
    case 'intro':
      return (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              {section.heading}
            </h3>
            <PelicanIcon onClick={() => onPelicanClick(section)} size={14} />
          </div>
          <p
            className="text-[15px]"
            style={{ color: 'var(--text-primary)', lineHeight: '1.8', fontWeight: 400 }}
          >
            {section.body}
          </p>
        </div>
      )

    case 'concept':
      return (
        <div
          className="pl-4"
          style={{ borderLeft: '2px solid var(--border-default)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              {section.heading}
            </h3>
            <PelicanIcon onClick={() => onPelicanClick(section)} size={14} />
          </div>
          <p
            className="text-[14px]"
            style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}
          >
            {section.body}
          </p>
        </div>
      )

    case 'tradfi_bridge':
      return (
        <div
          className="rounded-xl px-5 py-4"
          style={{
            background: 'linear-gradient(135deg, rgba(29,161,196,0.06) 0%, rgba(29,161,196,0.02) 100%)',
            borderLeft: '3px solid var(--accent-primary)',
          }}
        >
          <span
            className="inline-flex items-center px-[7px] py-[2px] rounded text-[9px] font-semibold uppercase tracking-wider"
            style={{
              color: 'var(--accent-primary)',
              backgroundColor: 'var(--accent-muted)',
              border: `1px solid color-mix(in srgb, var(--accent-primary) 20%, transparent)`,
            }}
          >
            TradFi Bridge
          </span>
          <div className="flex items-center gap-2 mt-3 mb-3">
            <h3 className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              {section.heading}
            </h3>
            <PelicanIcon onClick={() => onPelicanClick(section)} size={14} />
          </div>
          <p
            className="text-sm"
            style={{ color: 'var(--text-primary)', lineHeight: '1.8' }}
          >
            {section.body}
          </p>
        </div>
      )

    case 'example':
      return (
        <div
          className="rounded-xl px-5 py-4"
          style={{ background: 'var(--bg-elevated)' }}
        >
          <span
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: 'var(--text-muted)' }}
          >
            Real Example
          </span>
          <div className="flex items-center gap-2 mt-3 mb-3">
            <h3 className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              {section.heading}
            </h3>
            <PelicanIcon onClick={() => onPelicanClick(section)} size={14} />
          </div>
          <p
            className="text-sm font-mono leading-relaxed"
            style={{ color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}
          >
            {section.body}
          </p>
        </div>
      )

    case 'key_takeaway':
      return (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              {section.heading}
            </h3>
            <PelicanIcon onClick={() => onPelicanClick(section)} size={14} />
          </div>
          {/* Subtle accent underline below heading */}
          <div
            className="mb-4"
            style={{
              width: 40,
              height: 2,
              background: 'var(--accent-primary)',
              borderRadius: 1,
              opacity: 0.6,
            }}
          />
          <p
            className="text-[15px] font-medium"
            style={{ color: 'var(--text-primary)', lineHeight: '1.8' }}
          >
            {section.body}
          </p>
        </div>
      )

    default:
      return null
  }
}

// ---------------------------------------------------------------------------
// Quiz component
// ---------------------------------------------------------------------------

function QuizSection({
  questions,
  onAllAnswered,
}: {
  questions: { question: string; options: string[]; correct: number; explanation: string }[]
  onAllAnswered: (score: number) => void
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({})
  const prefersReducedMotion = useReducedMotion()

  const handleSelect = useCallback(
    (qIndex: number, optIndex: number) => {
      if (submitted[qIndex]) return

      const newAnswers = { ...answers, [qIndex]: optIndex }
      const newSubmitted = { ...submitted, [qIndex]: true }
      setAnswers(newAnswers)
      setSubmitted(newSubmitted)

      if (Object.keys(newSubmitted).length === questions.length) {
        const correct = questions.reduce((count, q, i) => {
          return count + (newAnswers[i] === q.correct ? 1 : 0)
        }, 0)
        const score = Math.round((correct / questions.length) * 100)
        setTimeout(() => onAllAnswered(score), 800)
      }
    },
    [answers, submitted, questions, onAllAnswered]
  )

  return (
    <div className="mt-8">
      <div
        className="h-px mb-8"
        style={{ background: 'var(--border-default)' }}
      />
      <h3
        className="text-lg font-semibold mb-6"
        style={{ color: 'var(--text-primary)' }}
      >
        Quick Check
      </h3>

      <div className="space-y-8">
        {questions.map((q, qIndex) => {
          const isAnswered = submitted[qIndex]
          const selectedOpt = answers[qIndex]
          const isCorrect = selectedOpt === q.correct

          return (
            <div key={qIndex}>
              <p
                className="text-[15px] font-semibold mb-3"
                style={{ color: 'var(--text-primary)' }}
              >
                {q.question}
              </p>

              <div className="flex flex-col gap-2">
                {q.options.map((opt, optIndex) => {
                  const isSelected = selectedOpt === optIndex
                  const isCorrectAnswer = optIndex === q.correct
                  const showAsCorrect = isAnswered && isCorrectAnswer
                  const showAsIncorrect = isAnswered && isSelected && !isCorrect

                  return (
                    <button
                      key={optIndex}
                      type="button"
                      onClick={() => handleSelect(qIndex, optIndex)}
                      disabled={isAnswered}
                      className={cn(
                        'relative flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200',
                        'border',
                        !isAnswered && 'cursor-pointer hover:border-[var(--border-hover)] hover:-translate-y-[0.5px]',
                        isAnswered && 'cursor-default',
                        !isAnswered && !isSelected && 'border-[var(--border-default)]',
                        !isAnswered && isSelected && 'border-[var(--accent-primary)]',
                      )}
                      style={{
                        background: showAsCorrect
                          ? 'rgba(34, 197, 94, 0.06)'
                          : showAsIncorrect
                            ? 'rgba(239, 68, 68, 0.06)'
                            : !isAnswered && isSelected
                              ? 'var(--accent-dim)'
                              : 'var(--bg-surface)',
                        borderColor: showAsCorrect
                          ? 'var(--data-positive)'
                          : showAsIncorrect
                            ? 'var(--data-negative)'
                            : undefined,
                      }}
                    >
                      <span
                        className="text-sm flex-1"
                        style={{
                          color: showAsCorrect
                            ? 'var(--data-positive)'
                            : showAsIncorrect
                              ? 'var(--data-negative)'
                              : 'var(--text-secondary)',
                        }}
                      >
                        {opt}
                      </span>
                      {showAsCorrect && (
                        <Check size={16} weight="bold" style={{ color: 'var(--data-positive)', flexShrink: 0 }} />
                      )}
                      {showAsIncorrect && (
                        <XIcon size={16} weight="bold" style={{ color: 'var(--data-negative)', flexShrink: 0 }} />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Explanation */}
              <AnimatePresence>
                {isAnswered && (
                  <motion.p
                    initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-[13px] italic mt-3"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {q.explanation}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Completion Card
// ---------------------------------------------------------------------------

function CompletionCard({
  score,
  recommendedNextTitle,
  onNextModule,
  onBack,
  onPelicanClick,
}: {
  score: number
  recommendedNextTitle: string | null
  onNextModule: (() => void) | null
  onBack: () => void
  onPelicanClick: () => void
}) {
  const prefersReducedMotion = useReducedMotion()
  const scoreColor =
    score === 100
      ? 'var(--accent-primary)'
      : score >= 50
        ? 'var(--data-positive)'
        : 'var(--data-warning)'

  const motionProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, scale: 0.9 } as const,
        animate: { opacity: 1, scale: 1 } as const,
        transition: { duration: 0.35, ease: 'easeOut' as const },
      }

  return (
    <motion.div
      {...motionProps}
      className="flex flex-col items-center py-12"
    >
      {/* Card with accent gradient tint */}
      <div
        className="w-full max-w-sm rounded-xl p-8 flex flex-col items-center"
        style={{
          background: 'linear-gradient(135deg, rgba(29,161,196,0.04) 0%, var(--bg-surface) 60%)',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.3)',
        }}
      >
        <CheckCircle size={48} weight="fill" style={{ color: 'var(--data-positive)' }} />

        <h3
          className="text-lg font-semibold mt-4"
          style={{ color: 'var(--text-primary)' }}
        >
          Module Complete
        </h3>

        <p
          className="text-[28px] font-mono font-bold mt-3"
          style={{ color: scoreColor, fontVariantNumeric: 'tabular-nums' }}
        >
          {score}%
        </p>

        <div className="flex items-center gap-2 mt-3">
          <PelicanIcon onClick={onPelicanClick} size={14} />
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Ask Pelican to explain what you got wrong
          </span>
        </div>

        {recommendedNextTitle && onNextModule && (
          <button
            type="button"
            onClick={onNextModule}
            className="mt-6 px-6 py-3 rounded-xl text-sm font-medium text-white cursor-pointer transition-all duration-200 hover:opacity-90"
            style={{ background: 'var(--accent-gradient)' }}
          >
            Next: {recommendedNextTitle}
          </button>
        )}

        <button
          type="button"
          onClick={onBack}
          className="mt-3 text-sm cursor-pointer transition-colors duration-150"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          Back to All Modules
        </button>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Module Detail View
// ---------------------------------------------------------------------------

function ModuleDetail({
  module,
  progress,
  recommendedNext,
  overview,
  onBack,
  onLoadModule,
  onComplete,
}: {
  module: EducationModule
  progress: { started_at: string | null; completed: boolean; quiz_score: number | null } | null
  recommendedNext: string | null
  overview: { modules: EducationModule[] } | null
  onBack: () => void
  onLoadModule: (slug: string) => Promise<void>
  onComplete: (slug: string, quizScore?: number) => Promise<void>
}) {
  const { openWithPrompt } = usePelicanPanelContext()
  const prefersReducedMotion = useReducedMotion()
  const [completionScore, setCompletionScore] = useState<number | null>(null)

  const isCompleted = progress?.completed || completionScore !== null

  const handlePelicanSection = useCallback(
    (section: EducationSection) => {
      openWithPrompt('education', {
        visibleMessage: `Explain "${section.heading}" in more detail`,
        fullPrompt: `[EDUCATION - ${module.title}]
SECTION: ${section.heading}
CONTENT: ${section.body}
Explain this concept in more detail. Use TradFi analogs. Give a concrete example with real numbers.`,
      })
    },
    [openWithPrompt, module.title]
  )

  const handleQuizComplete = useCallback(
    (score: number) => {
      setCompletionScore(score)
      onComplete(module.slug, score)
    },
    [onComplete, module.slug]
  )

  const handlePelicanCompletion = useCallback(() => {
    openWithPrompt('education', {
      visibleMessage: `Explain what I got wrong on the ${module.title} quiz`,
      fullPrompt: `[EDUCATION - ${module.title} - QUIZ REVIEW]
MODULE: ${module.title}
QUIZ SCORE: ${completionScore ?? progress?.quiz_score ?? 'Unknown'}%
QUESTIONS: ${JSON.stringify(module.content.quiz.map((q) => q.question))}
The user just completed this quiz. Help them understand the concepts they may have gotten wrong. Use TradFi analogs to explain.`,
    })
  }, [openWithPrompt, module, completionScore, progress])

  const recommendedNextModule = useMemo(() => {
    if (!recommendedNext || !overview?.modules) return null
    return overview.modules.find((m) => m.slug === recommendedNext) ?? null
  }, [recommendedNext, overview])

  const handleNextModule = useCallback(() => {
    if (recommendedNext) {
      onLoadModule(recommendedNext)
      setCompletionScore(null)
    }
  }, [recommendedNext, onLoadModule])

  const detailMotion = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, x: 20 } as const,
        animate: { opacity: 1, x: 0 } as const,
        exit: { opacity: 0, x: -20 } as const,
        transition: { duration: 0.25 } as const,
      }

  return (
    <motion.div {...detailMotion}>
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 cursor-pointer transition-colors duration-150 mb-4"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
      >
        <ArrowLeft size={16} weight="bold" />
        <span className="text-[13px] font-medium">Back to modules</span>
      </button>

      {/* Title */}
      <h1
        className="text-2xl font-semibold mt-2"
        style={{ color: 'var(--text-primary)' }}
      >
        {module.title}
      </h1>

      {/* Meta row */}
      <div className="flex items-center gap-3 mt-3">
        <SeverityTag type={categoryToSeverity(module.category)} />
        <div className="flex items-center gap-1.5">
          <Clock size={14} weight="regular" style={{ color: 'var(--text-muted)' }} />
          <span
            className="text-sm font-mono"
            style={{ color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}
          >
            {module.estimated_minutes} min
          </span>
        </div>
        {progress?.completed && (
          <div className="flex items-center gap-1.5">
            <CheckCircle size={14} weight="fill" style={{ color: 'var(--data-positive)' }} />
            <span className="text-xs" style={{ color: 'var(--data-positive)' }}>Completed</span>
          </div>
        )}
        {progress?.started_at && !progress.completed && (
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: 'var(--data-warning)' }}
            />
            <span className="text-xs" style={{ color: 'var(--data-warning)' }}>
              In Progress
            </span>
          </div>
        )}
      </div>

      {/* Content area — comfortable reading width */}
      <div className="max-w-[640px] mx-auto mt-10 space-y-8">
        {module.content.sections.map((section, i) => (
          <SectionBlock
            key={i}
            section={section}
            onPelicanClick={handlePelicanSection}
          />
        ))}

        {/* Quiz or Completion */}
        {isCompleted ? (
          <CompletionCard
            score={completionScore ?? progress?.quiz_score ?? 0}
            recommendedNextTitle={recommendedNextModule?.title ?? null}
            onNextModule={recommendedNextModule ? handleNextModule : null}
            onBack={onBack}
            onPelicanClick={handlePelicanCompletion}
          />
        ) : (
          <QuizSection
            questions={module.content.quiz}
            onAllAnswered={handleQuizComplete}
          />
        )}
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Module List View
// ---------------------------------------------------------------------------

function ModuleList({
  overview,
  onSelectModule,
}: {
  overview: {
    modules: EducationModule[]
    progress: Record<string, { started_at: string | null; completed: boolean; quiz_score: number | null }>
    completedCount: number
    totalCount: number
    recommendedNext: string | null
  }
  onSelectModule: (slug: string) => void
}) {
  const { openWithPrompt } = usePelicanPanelContext()
  const prefersReducedMotion = useReducedMotion()

  const progressPct = overview.totalCount > 0
    ? (overview.completedCount / overview.totalCount) * 100
    : 0

  const recommendedModule = useMemo(() => {
    if (!overview.recommendedNext) return null
    return overview.modules.find((m) => m.slug === overview.recommendedNext) ?? null
  }, [overview])

  const handleModulePelican = useCallback(
    (mod: EducationModule) => {
      openWithPrompt('education', {
        visibleMessage: `Give me a preview of "${mod.title}"`,
        fullPrompt: `[EDUCATION - MODULE PREVIEW]
MODULE: ${mod.title}
DESCRIPTION: ${mod.description}
TRADFI ANALOG: ${mod.tradfi_analog}
CATEGORY: ${mod.category}
Give the user a quick preview of what they'll learn in this module. Use TradFi analogs to make it relatable. Keep it concise and engaging.`,
      })
    },
    [openWithPrompt]
  )

  return (
    <>
      {/* Header */}
      <h1
        className="text-xl font-semibold"
        style={{ color: 'var(--text-primary)' }}
      >
        Learn
      </h1>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <p
            className="text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            Your progress
          </p>
          <span
            className="text-[12px] font-mono"
            style={{ color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}
          >
            {overview.completedCount} of {overview.totalCount} completed
          </span>
        </div>
        <div
          className="h-1 rounded-full overflow-hidden"
          style={{ background: 'var(--bg-elevated)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'var(--accent-primary)' }}
            initial={prefersReducedMotion ? { width: `${progressPct}%` } : { width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Recommended next */}
      {recommendedModule && (
        <p className="text-sm mt-3" style={{ color: 'var(--text-muted)' }}>
          Pelican recommends:{' '}
          <button
            type="button"
            onClick={() => onSelectModule(recommendedModule.slug)}
            className="cursor-pointer transition-colors duration-150 font-medium"
            style={{ color: 'var(--accent-primary)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
          >
            {recommendedModule.title}
          </button>
        </p>
      )}

      {/* Module grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {overview.modules.map((mod, index) => (
          <motion.div
            key={mod.slug}
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: prefersReducedMotion ? 0 : Math.min(index * 0.05, 0.3) }}
          >
            <ModuleCard
              module={mod}
              progress={overview.progress[mod.slug]}
              onSelect={() => onSelectModule(mod.slug)}
              onPelicanClick={() => handleModulePelican(mod)}
            />
          </motion.div>
        ))}
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function LearnPage() {
  const {
    overview,
    isLoading,
    error,
    activeModule,
    activeProgress,
    isLoadingModule,
    loadModule,
    clearActiveModule,
    startModule,
    completeModule,
    recommendedNext,
  } = useEducation()
  const prefersReducedMotion = useReducedMotion()

  const handleSelectModule = useCallback(
    async (slug: string) => {
      await loadModule(slug)
      await startModule(slug)
    },
    [loadModule, startModule]
  )

  const pageMotion = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 8 } as const,
        animate: { opacity: 1, y: 0 } as const,
        transition: { duration: 0.3 } as const,
      }

  // Loading
  if (isLoading && !overview) {
    return <LearnLoadingState />
  }

  // Error
  if (error && !overview) {
    return (
      <div className="px-[var(--space-page-x)] py-[var(--space-page-y)]">
        <div className="max-w-[760px] mx-auto">
          <EmptyState
            icon={GraduationCap}
            title="Failed to Load Modules"
            description="We couldn't load the education content. Check your connection and try again."
          />
        </div>
      </div>
    )
  }

  // Empty
  if (!overview || overview.modules.length === 0) {
    return (
      <div className="px-[var(--space-page-x)] py-[var(--space-page-y)]">
        <div className="max-w-[760px] mx-auto">
          <EmptyState
            icon={GraduationCap}
            title="Education Modules"
            description="Learn crypto concepts explained through TradFi analogs you already understand."
          />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="px-[var(--space-page-x)] py-[var(--space-page-y)]"
      {...pageMotion}
    >
      <div className="max-w-[760px] mx-auto">
        <AnimatePresence mode="wait">
          {/* Loading module detail */}
          {isLoadingModule && (
            <motion.div
              key="loading-module"
              initial={prefersReducedMotion ? undefined : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            >
              <LearnLoadingState />
            </motion.div>
          )}

          {/* Module detail view */}
          {!isLoadingModule && activeModule && (
            <ModuleDetail
              key={`detail-${activeModule.slug}`}
              module={activeModule}
              progress={activeProgress}
              recommendedNext={recommendedNext}
              overview={overview}
              onBack={clearActiveModule}
              onLoadModule={handleSelectModule}
              onComplete={completeModule}
            />
          )}

          {/* Module list view */}
          {!isLoadingModule && !activeModule && (
            <motion.div
              key="list"
              initial={prefersReducedMotion ? undefined : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ModuleList
                overview={overview}
                onSelectModule={handleSelectModule}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
