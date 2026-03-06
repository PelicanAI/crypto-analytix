'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence, type PanInfo } from 'framer-motion'
import { X, ArrowUp } from '@phosphor-icons/react'
import { usePelicanPanelContext } from '@/providers/pelican-panel-provider'
import { useMobile } from '@/hooks/use-mobile'
import { LiveDot } from '@/components/shared/live-dot'
import { PELICAN_CONTEXTS } from '@/types/pelican'

// ─── Context title mapping ───────────────────────────────────────

function getContextTitle(context: string | null, ticker: string | null): string {
  if (!context) return 'Pelican AI'
  const titles: Record<string, string> = {
    [PELICAN_CONTEXTS.POSITION]: ticker ? `${ticker} Position Review` : 'Position Review',
    [PELICAN_CONTEXTS.PORTFOLIO]: 'Portfolio Analysis',
    [PELICAN_CONTEXTS.ANALYST_CONTENT]: 'Analyst Review',
    [PELICAN_CONTEXTS.CT_SIGNAL]: 'CT Signal Analysis',
    [PELICAN_CONTEXTS.WALLET_TRACKING]: 'Wallet Activity',
    [PELICAN_CONTEXTS.FUNDING_RATE]: ticker ? `${ticker} Funding Rate` : 'Funding Rate Analysis',
    [PELICAN_CONTEXTS.NEWS]: 'News Analysis',
    [PELICAN_CONTEXTS.METRIC]: 'Metric Analysis',
    [PELICAN_CONTEXTS.EDUCATION]: 'Learning',
    [PELICAN_CONTEXTS.WHAT_I_MISSED]: 'What You Missed',
    [PELICAN_CONTEXTS.DAILY_BRIEF]: 'Daily Brief',
    [PELICAN_CONTEXTS.INTELLIGENCE_ALERT]: 'Intelligence Alert',
    [PELICAN_CONTEXTS.COMMUNITY_MENTION]: 'Community Response',
  }
  return titles[context] || 'Pelican AI'
}

// ─── Markdown-lite renderer ──────────────────────────────────────

function renderInlineBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*)/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <span key={i} className="font-semibold" style={{ color: 'var(--text-primary)' }}>
          {part.slice(2, -2)}
        </span>
      )
    }
    return part
  })
}

function renderMarkdown(text: string) {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let key = 0

  for (const line of lines) {
    key++

    if (line.trim() === '') {
      elements.push(<div key={key} className="h-2.5" />)
      continue
    }

    // Bold headings: **text**
    if (line.startsWith('**') && line.endsWith('**')) {
      elements.push(
        <div
          key={key}
          className="font-semibold mt-4 mb-1 first:mt-0"
          style={{ color: 'var(--text-primary)' }}
        >
          {line.slice(2, -2)}
        </div>
      )
      continue
    }

    // Bullet points
    if (line.startsWith('• ') || line.startsWith('- ')) {
      elements.push(
        <div key={key} className="pl-4 mb-1" style={{ color: 'var(--text-secondary)', lineHeight: '1.75' }}>
          <span style={{ color: 'var(--accent-primary)', marginRight: 6 }}>•</span>
          {renderInlineBold(line.slice(2))}
        </div>
      )
      continue
    }

    // Regular text
    elements.push(
      <div key={key} className="mb-1" style={{ color: 'var(--text-secondary)', lineHeight: '1.75' }}>
        {renderInlineBold(line)}
      </div>
    )
  }

  return elements
}

// ─── Streaming cursor ────────────────────────────────────────────

function StreamingCursor() {
  return (
    <span
      className="inline-block align-text-bottom rounded-sm"
      style={{
        width: 2,
        height: 16,
        backgroundColor: 'var(--accent-primary)',
        animation: 'pelican-cursor-blink 0.8s step-end infinite',
      }}
    />
  )
}

// ─── Pelican avatar ──────────────────────────────────────────────

function PelicanAvatar() {
  return (
    <div
      className="flex items-center justify-center shrink-0"
      style={{
        width: 30,
        height: 30,
        borderRadius: 9,
        background: 'var(--accent-gradient)',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
          fill="white"
        />
      </svg>
    </div>
  )
}

// ─── Constants ───────────────────────────────────────────────────

const PANEL_WIDTH = 440

const desktopVariants = {
  hidden: { x: '100%' },
  visible: { x: 0 },
  exit: { x: '100%' },
}

const mobileVariants = {
  hidden: { y: '100%' },
  visible: { y: 0 },
  exit: { y: '100%' },
}

const panelTransition = {
  duration: 0.35,
  ease: [0.25, 0.1, 0.25, 1] as const,
}

// ─── Main component ─────────────────────────────────────────────

export default function PelicanChatPanel() {
  const { state, sendMessage, close } = usePelicanPanelContext()
  const { isOpen, messages, isStreaming, streamingText, context, ticker } = state
  const isMobile = useMobile()

  const [inputValue, setInputValue] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const isNearBottomRef = useRef(true)

  // Auto-scroll when new content arrives (respects user scroll position)
  useEffect(() => {
    if (isNearBottomRef.current && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [streamingText, messages])

  // Track scroll position
  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    isNearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
  }, [])

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && !isMobile) {
      setTimeout(() => inputRef.current?.focus(), 400)
    }
  }, [isOpen, isMobile])

  // Handle send
  const handleSend = useCallback(() => {
    const text = inputValue.trim()
    if (!text || isStreaming) return
    setInputValue('')
    sendMessage(text)
  }, [inputValue, isStreaming, sendMessage])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) close()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, close])

  // Mobile drag to dismiss
  const handleDragEnd = useCallback((_: unknown, info: PanInfo) => {
    if (info.offset.y > 100 || info.velocity.y > 300) {
      close()
    }
  }, [close])

  const contextTitle = getContextTitle(context, ticker)

  const panelContent = (
    <>
      {/* Header */}
      <div
        className="flex items-center justify-between shrink-0"
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <PelicanAvatar />
          <div>
            <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Pelican
            </div>
            <div className="flex items-center gap-1.5" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {isStreaming ? (
                <>
                  <LiveDot color="var(--accent-primary)" size={6} />
                  <span>Analyzing...</span>
                </>
              ) : (
                <span>{contextTitle}</span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={close}
          className="flex items-center justify-center cursor-pointer transition-all duration-150"
          style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-muted)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-hover)'
            e.currentTarget.style.color = 'var(--text-secondary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)'
            e.currentTarget.style.color = 'var(--text-muted)'
          }}
          aria-label="Close Pelican panel"
        >
          <X size={14} weight="bold" />
        </button>
      </div>

      {/* Body — scrollable message area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
        style={{ padding: 20 }}
      >
        {messages.map((msg) => (
          <div key={msg.id} className={msg.role === 'user' ? 'flex justify-end mb-4' : 'mb-4'}>
            {msg.role === 'user' ? (
              <div
                className="text-[13px] max-w-[85%]"
                style={{
                  backgroundColor: 'var(--accent-dim)',
                  borderRadius: 12,
                  padding: '10px 14px',
                  color: 'var(--text-primary)',
                  lineHeight: '1.6',
                }}
              >
                {msg.content}
              </div>
            ) : (
              <div className="text-[13px]">
                {renderMarkdown(msg.content)}
              </div>
            )}
          </div>
        ))}

        {/* Currently streaming text with blinking cursor */}
        {isStreaming && streamingText && (
          <div className="mb-4 text-[13px]">
            {renderMarkdown(streamingText)}
            <StreamingCursor />
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Footer — follow-up input */}
      <div
        className="shrink-0"
        style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div
          className="flex items-center gap-2 transition-colors duration-150"
          style={{
            backgroundColor: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 10,
            padding: '10px 14px',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-muted)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)'
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
            placeholder="Ask a follow-up..."
            className="flex-1 bg-transparent border-none outline-none text-[13px] placeholder:text-[var(--text-muted)]"
            style={{
              color: 'var(--text-primary)',
              fontFamily: 'inherit',
            }}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isStreaming}
            className="flex items-center justify-center cursor-pointer transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              backgroundColor: 'var(--accent-primary)',
              color: 'white',
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = 'var(--accent-hover)'
                e.currentTarget.style.transform = 'scale(1.05)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent-primary)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
            aria-label="Send message"
          >
            <ArrowUp size={14} weight="bold" />
          </button>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Cursor blink keyframe */}
      <style jsx global>{`
        @keyframes pelican-cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>

      <AnimatePresence>
        {/* Desktop: slide from right */}
        {isOpen && !isMobile && (
          <motion.div
            key="pelican-desktop"
            variants={desktopVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={panelTransition}
            className="fixed top-0 right-0 flex flex-col z-30"
            style={{
              width: PANEL_WIDTH,
              height: '100vh',
              background: 'rgba(12, 12, 18, 0.95)',
              backdropFilter: 'blur(30px) saturate(1.3)',
              WebkitBackdropFilter: 'blur(30px) saturate(1.3)',
              borderLeft: '1px solid var(--accent-muted)',
              boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
            }}
          >
            {panelContent}
          </motion.div>
        )}

        {/* Mobile: bottom sheet */}
        {isOpen && isMobile && (
          <>
            <motion.div
              key="pelican-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-30"
              style={{ backgroundColor: 'var(--bg-overlay)' }}
              onClick={close}
            />
            <motion.div
              key="pelican-mobile"
              variants={mobileVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={panelTransition}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              className="fixed bottom-0 left-0 right-0 flex flex-col z-30 rounded-t-2xl"
              style={{
                maxHeight: '75vh',
                background: 'rgba(12, 12, 18, 0.98)',
                backdropFilter: 'blur(30px) saturate(1.3)',
                WebkitBackdropFilter: 'blur(30px) saturate(1.3)',
                borderTop: '1px solid var(--accent-muted)',
                boxShadow: '0 -20px 60px rgba(0,0,0,0.5)',
              }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div
                  className="rounded-full"
                  style={{
                    width: 40,
                    height: 4,
                    backgroundColor: 'var(--border-default)',
                  }}
                />
              </div>
              {panelContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
