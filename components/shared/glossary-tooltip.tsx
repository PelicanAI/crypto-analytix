'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useGlossary } from '@/lib/glossary/glossary-provider'

interface GlossaryTooltipProps {
  term: string
  children: React.ReactNode
}

interface TooltipPosition {
  top: number
  left: number
  placement: 'above' | 'below'
}

const TOOLTIP_MAX_WIDTH = 320
const TOOLTIP_OFFSET = 8

function calculatePosition(
  triggerRect: DOMRect
): TooltipPosition {
  const spaceAbove = triggerRect.top
  const viewportWidth = window.innerWidth

  // Default to above; fall back to below if not enough space
  const placement = spaceAbove > 200 ? 'above' : 'below'

  const top =
    placement === 'above'
      ? triggerRect.top + window.scrollY - TOOLTIP_OFFSET
      : triggerRect.bottom + window.scrollY + TOOLTIP_OFFSET

  // Center horizontally on the trigger, clamped to viewport
  let left =
    triggerRect.left +
    triggerRect.width / 2 -
    TOOLTIP_MAX_WIDTH / 2 +
    window.scrollX

  // Clamp so the tooltip stays within the viewport
  const minLeft = 8 + window.scrollX
  const maxLeft = viewportWidth - TOOLTIP_MAX_WIDTH - 8 + window.scrollX
  left = Math.max(minLeft, Math.min(maxLeft, left))

  return { top, left, placement }
}

export function GlossaryTooltip({ term, children }: GlossaryTooltipProps) {
  const { getTerm } = useGlossary()
  const glossaryTerm = getTerm(term)
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState<TooltipPosition | null>(null)
  const [mounted, setMounted] = useState(false)
  const triggerRef = useRef<HTMLSpanElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  // Only render portal after mount (SSR safety)
  useEffect(() => {
    setMounted(true)
  }, [])

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setPosition(calculatePosition(rect))
  }, [])

  const show = useCallback(() => {
    updatePosition()
    setIsVisible(true)
  }, [updatePosition])

  const hide = useCallback(() => {
    setIsVisible(false)
  }, [])

  const toggle = useCallback(() => {
    if (isVisible) {
      hide()
    } else {
      show()
    }
  }, [isVisible, show, hide])

  // Close on Escape key
  useEffect(() => {
    if (!isVisible) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        hide()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isVisible, hide])

  // Close on click outside
  useEffect(() => {
    if (!isVisible) return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(target)
      ) {
        hide()
      }
    }

    // Defer to avoid catching the click that opened the tooltip
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 0)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isVisible, hide])

  // If term not found, render children without any tooltip behavior
  if (!glossaryTerm) {
    return <>{children}</>
  }

  const motionVariants = {
    above: {
      initial: { opacity: 0, y: 4 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 4 },
    },
    below: {
      initial: { opacity: 0, y: -4 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -4 },
    },
  }

  const placement = position?.placement ?? 'above'

  return (
    <>
      <span
        ref={triggerRef}
        className="cursor-pointer border-b border-dotted border-[var(--accent-muted)] transition-colors duration-150 hover:border-[var(--accent-primary)] hover:text-[var(--accent-hover)]"
        onMouseEnter={show}
        onMouseLeave={hide}
        onClick={toggle}
        role="button"
        tabIndex={0}
        aria-describedby={`glossary-tooltip-${glossaryTerm.term.replace(/\s+/g, '-').toLowerCase()}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            toggle()
          }
        }}
      >
        {children}
      </span>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {isVisible && position && (
              <motion.div
                ref={tooltipRef}
                id={`glossary-tooltip-${glossaryTerm.term.replace(/\s+/g, '-').toLowerCase()}`}
                role="tooltip"
                initial={motionVariants[placement].initial}
                animate={motionVariants[placement].animate}
                exit={motionVariants[placement].exit}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="fixed z-[9999] pointer-events-auto"
                style={{
                  top: position.top,
                  left: position.left,
                  maxWidth: TOOLTIP_MAX_WIDTH,
                  transform:
                    placement === 'above'
                      ? 'translateY(-100%)'
                      : undefined,
                }}
              >
                <div
                  className="rounded-lg border border-[var(--border-default)] shadow-lg p-3"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                  }}
                >
                  {/* Term name */}
                  <p
                    className="font-semibold leading-tight mb-1"
                    style={{
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    {glossaryTerm.term}
                  </p>

                  {/* Definition */}
                  <p
                    className="leading-relaxed mb-2"
                    style={{
                      color: 'var(--text-secondary)',
                      fontSize: '12px',
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    {glossaryTerm.definition}
                  </p>

                  {/* TradFi analog */}
                  <p
                    className="leading-relaxed mb-2 italic"
                    style={{
                      fontSize: '12px',
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    <span
                      className="not-italic font-medium"
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      TradFi:{' '}
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {glossaryTerm.tradfi_analog}
                    </span>
                  </p>

                  {/* Related terms */}
                  {glossaryTerm.related.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {glossaryTerm.related.map((related) => (
                        <span
                          key={related}
                          className="inline-block rounded px-1.5 py-0.5 transition-colors duration-150"
                          style={{
                            fontSize: '10px',
                            fontFamily: 'var(--font-sans)',
                            color: 'var(--text-muted)',
                            backgroundColor: 'var(--accent-muted)',
                            border: '1px solid var(--border-default)',
                          }}
                        >
                          {related}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  )
}
