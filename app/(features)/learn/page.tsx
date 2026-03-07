'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
// Category → SeverityTag mapping
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
        <div className="h-1 rounded-full mb-6" style={{ background: 'var(--bg-elevated)' }} />
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
        'border border-[var(--border-default)]',
        'hover:border-[var(--border-hover)] hover:bg-[var(--bg-elevated)]'
      )}
      style={{ background: 'var(--bg-surface)' }}
    >
      {/* Category */}
      <SeverityTag type={categoryToSeverity(module.category)} />

      {/* Title */}
      <h3
        className="text-base font-semibold mt-3"
        style={{ color: 'var(--text-primary)' }}
      >
        {module.title}
      </h3>

      {/* Description */}
      <p
        className="text-sm mt-1 line-clamp-2"
        style={{ color: 'var(--text-secondary)' }}
      >
        {module.description}
      </p>

      {/* TradFi analog */}
      <p
        className="text-xs italic mt-2"
        style={{ color: 'var(--text-muted)' }}
      >
        <span className="not-italic font-medium">TradFi:</span>{' '}
        {module.tradfi_analog}
      </p>

      {/* Bottom row */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-1.5">
          <Clock size={14} weight="regular" className="text-[var(--text-muted)]" />
          <span
            className="text-xs font-mono"
            style={{ color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}
          >
            {module.estimated_minutes}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            min
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isStarted && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-xs" style={{ color: 'rgb(251 191 36)' }}>
                In Progress
              </span>
            </div>
          )}
          {isCompleted && (
            <div className="flex items-center gap-1.5">
              <CheckCircle size={14} weight="fill" className="text-green-400" />
              <span className="text-xs text-green-400">
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

      {/* Pelican icon */}
      <div
        className="absolute bottom-3 right-3"
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
            <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
              {section.heading}
            </h3>
            <PelicanIcon onClick={() => onPelicanClick(section)} size={14} />
          </div>
          <p
            className="text-[15px] leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            {section.body}
          </p>
        </div>
      )

    case 'concept':
      return (
        <div
          className="pl-5"
          style={{ borderLeft: '3px solid var(--accent-primary)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
              {section.heading}
            </h3>
            <PelicanIcon onClick={() => onPelicanClick(section)} size={14} />
          </div>
          <p
            className="text-[15px] leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            {section.body}
          </p>
        </div>
      )

    case 'tradfi_bridge':
      return (
        <div
          className="p-5 rounded-r-xl"
          style={{
            background: 'rgba(29,161,196,0.06)',
            borderLeft: '4px solid var(--accent-primary)',
          }}
        >
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--accent-primary)' }}
          >
            TradFi Bridge
          </span>
          <div className="flex items-center gap-2 mt-3 mb-3">
            <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
              {section.heading}
            </h3>
            <PelicanIcon onClick={() => onPelicanClick(section)} size={14} />
          </div>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--text-primary)' }}
          >
            {section.body}
          </p>
        </div>
      )

    case 'example':
      return (
        <div
          className="p-5 rounded-xl"
          style={{ background: 'var(--bg-elevated)' }}
        >
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--text-muted)' }}
          >
            Real Example
          </span>
          <div className="flex items-center gap-2 mt-3 mb-3">
            <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
              {section.heading}
            </h3>
            <PelicanIcon onClick={() => onPelicanClick(section)} size={14} />
          </div>
          <p
            className="text-sm leading-relaxed font-mono"
            style={{ color: 'var(--text-secondary)' }}
          >
            {section.body}
          </p>
        </div>
      )

    case 'key_takeaway':
      return (
        <div
          className="pb-4"
          style={{ borderBottom: '2px solid rgba(29,161,196,0.3)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
              {section.heading}
            </h3>
            <PelicanIcon onClick={() => onPelicanClick(section)} size={14} />
          </div>
          <p
            className="text-base font-medium leading-relaxed"
            style={{ color: 'var(--text-primary)' }}
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

  const handleSelect = useCallback(
    (qIndex: number, optIndex: number) => {
      if (submitted[qIndex]) return

      const newAnswers = { ...answers, [qIndex]: optIndex }
      const newSubmitted = { ...submitted, [qIndex]: true }
      setAnswers(newAnswers)
      setSubmitted(newSubmitted)

      // Check if all questions are answered
      if (Object.keys(newSubmitted).length === questions.length) {
        const correct = questions.reduce((count, q, i) => {
          return count + (newAnswers[i] === q.correct ? 1 : 0)
        }, 0)
        const score = Math.round((correct / questions.length) * 100)
        // Small delay to let the user see the last answer
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
                className="text-[15px] font-medium mb-4"
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
                        'relative flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200',
                        'border',
                        !isAnswered && 'cursor-pointer hover:border-[var(--border-hover)] hover:bg-[var(--bg-elevated)]',
                        isAnswered && 'cursor-default',
                        // Default state
                        !isAnswered && !isSelected && 'border-[var(--border-default)]',
                        // Selected but not submitted
                        !isAnswered && isSelected && 'border-[var(--accent-primary)]',
                        // Correct
                        showAsCorrect && 'border-green-500',
                        // Incorrect
                        showAsIncorrect && 'border-red-500',
                      )}
                      style={{
                        background: showAsCorrect
                          ? 'rgba(34, 197, 94, 0.1)'
                          : showAsIncorrect
                            ? 'rgba(239, 68, 68, 0.1)'
                            : !isAnswered && isSelected
                              ? 'var(--accent-dim)'
                              : 'var(--bg-surface)',
                      }}
                    >
                      <span
                        className="text-sm flex-1"
                        style={{
                          color: showAsCorrect
                            ? 'rgb(74 222 128)'
                            : showAsIncorrect
                              ? 'rgb(248 113 113)'
                              : 'var(--text-secondary)',
                        }}
                      >
                        {opt}
                      </span>
                      {showAsCorrect && (
                        <Check size={16} weight="bold" className="text-green-400 flex-shrink-0" />
                      )}
                      {showAsIncorrect && (
                        <XIcon size={16} weight="bold" className="text-red-400 flex-shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Explanation */}
              <AnimatePresence>
                {isAnswered && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm italic mt-3"
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
  const scoreColor =
    score === 100
      ? 'var(--accent-primary)'
      : score >= 50
        ? 'rgb(74 222 128)'
        : 'rgb(251 191 36)'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex flex-col items-center py-12"
    >
      <CheckCircle size={48} weight="fill" className="text-green-400" />

      <h3
        className="text-lg font-semibold mt-4"
        style={{ color: 'var(--text-primary)' }}
      >
        Module Complete!
      </h3>

      <p
        className="text-3xl font-mono font-bold mt-3"
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

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
    >
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
        <span className="text-sm font-medium">All Modules</span>
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
          <Clock size={14} weight="regular" className="text-[var(--text-muted)]" />
          <span
            className="text-sm font-mono"
            style={{ color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}
          >
            {module.estimated_minutes} min
          </span>
        </div>
        {progress?.completed && (
          <div className="flex items-center gap-1.5">
            <CheckCircle size={14} weight="fill" className="text-green-400" />
            <span className="text-xs text-green-400">Completed</span>
          </div>
        )}
        {progress?.started_at && !progress.completed && (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-xs" style={{ color: 'rgb(251 191 36)' }}>
              In Progress
            </span>
          </div>
        )}
      </div>

      {/* Content area */}
      <div className="max-w-[680px] mx-auto mt-10 space-y-8">
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
        <div
          className="h-1 rounded-full overflow-hidden"
          style={{ background: 'var(--bg-elevated)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'var(--accent-primary)' }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
        <p
          className="text-sm mt-2"
          style={{ color: 'var(--text-muted)' }}
        >
          <span className="font-mono" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {overview.completedCount}
          </span>
          {' '}of{' '}
          <span className="font-mono" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {overview.totalCount}
          </span>
          {' '}completed
        </p>
      </div>

      {/* Recommended next */}
      {recommendedModule && (
        <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
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
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: Math.min(index * 0.05, 0.3) }}
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

  const handleSelectModule = useCallback(
    async (slug: string) => {
      await loadModule(slug)
      await startModule(slug)
    },
    [loadModule, startModule]
  )

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
    <div className="px-[var(--space-page-x)] py-[var(--space-page-y)]">
      <div className="max-w-[760px] mx-auto">
        <AnimatePresence mode="wait">
          {/* Loading module detail */}
          {isLoadingModule && (
            <motion.div
              key="loading-module"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
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
    </div>
  )
}
