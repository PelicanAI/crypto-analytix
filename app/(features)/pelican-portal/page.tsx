'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Trash,
  ArrowUp,
  List,
  X,
  ChartLineUp,
  CurrencyBtc,
  Bank,
  TrendUp,
  ShareNetwork,
} from '@phosphor-icons/react'
import { usePelicanPortal, type PortalMessage } from '@/hooks/use-pelican-portal'
import { useMobile } from '@/hooks/use-mobile'
import { formatTimeAgo } from '@/lib/formatters'
import { LiveDot } from '@/components/shared/live-dot'

// ─── Constants ──────────────────────────────────────────────────

const SIDEBAR_WIDTH = 220

const STARTER_PROMPTS = [
  {
    icon: ChartLineUp,
    text: 'Explain funding rates like I trade ES futures',
  },
  {
    icon: CurrencyBtc,
    text: "What's the current derivatives setup on BTC?",
  },
  {
    icon: Bank,
    text: 'Help me understand DeFi yields vs fixed income',
  },
  {
    icon: TrendUp,
    text: 'Analyze the macro-to-crypto correlation right now',
  },
]

// ─── Markdown-lite renderer (matches pelican-chat-panel) ────────

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

    if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <div key={key} className="pl-4 mb-1" style={{ color: 'var(--text-secondary)', lineHeight: '1.75' }}>
          <span style={{ color: 'var(--accent-primary)', marginRight: 6 }}>&#8226;</span>
          {renderInlineBold(line.slice(2))}
        </div>
      )
      continue
    }

    elements.push(
      <div key={key} className="mb-1" style={{ color: 'var(--text-secondary)', lineHeight: '1.75' }}>
        {renderInlineBold(line)}
      </div>
    )
  }

  return elements
}

// ─── Pelican Avatar ─────────────────────────────────────────────

function PelicanAvatar({ size = 30 }: { size?: number }) {
  const iconSize = Math.round(size * 0.53)
  return (
    <div
      className="flex items-center justify-center shrink-0"
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.3),
        background: 'var(--accent-gradient)',
      }}
    >
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
          fill="white"
        />
      </svg>
    </div>
  )
}

// ─── Streaming Cursor ───────────────────────────────────────────

function StreamingCursor() {
  return (
    <span
      className="inline-block align-text-bottom rounded-sm"
      style={{
        width: 2,
        height: 16,
        backgroundColor: 'var(--accent-primary)',
        animation: 'portal-cursor-blink 0.8s step-end infinite',
      }}
    />
  )
}

// ─── Bouncing Dots (waiting for first token) ────────────────────

function BouncingDots() {
  return (
    <div className="flex items-center gap-1 py-2">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="rounded-full"
          style={{
            width: 6,
            height: 6,
            backgroundColor: 'var(--accent-primary)',
            animation: `portal-bounce 1.2s ease-in-out ${i * 0.15}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

// ─── Delete Confirmation ────────────────────────────────────────

function DeleteButton({
  onConfirm,
}: {
  onConfirm: () => void
}) {
  const [confirming, setConfirming] = useState(false)

  if (confirming) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation()
          onConfirm()
          setConfirming(false)
        }}
        className="text-[10px] font-medium shrink-0 cursor-pointer transition-colors duration-150"
        style={{ color: 'var(--data-negative)' }}
      >
        Delete?
      </button>
    )
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        setConfirming(true)
      }}
      className="opacity-0 group-hover:opacity-100 shrink-0 cursor-pointer transition-all duration-150"
      style={{ color: 'var(--text-muted)' }}
      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--data-negative)' }}
      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)' }}
      aria-label="Delete conversation"
    >
      <Trash size={14} />
    </button>
  )
}

// ─── Message Component ──────────────────────────────────────────

function MessageBubble({ message }: { message: PortalMessage }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end mb-5">
        <div
          className="text-[13px] max-w-[80%]"
          style={{
            backgroundColor: 'var(--accent-dim)',
            border: '1px solid var(--accent-muted)',
            borderRadius: '16px 16px 4px 16px',
            padding: '12px 16px',
            color: 'var(--text-primary)',
            lineHeight: '1.65',
          }}
        >
          {message.content}
          <div
            className="mt-1.5 font-mono tabular-nums"
            style={{ fontSize: 10, color: 'var(--text-muted)' }}
          >
            {formatTimeAgo(message.created_at)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3 mb-5 group/msg max-w-[90%]">
      <PelicanAvatar size={24} />
      <div className="flex-1 min-w-0">
        <div className="text-[13px]">
          {renderMarkdown(message.content)}
        </div>
        <div
          className="mt-1.5 flex items-center gap-3 font-mono tabular-nums"
          style={{ fontSize: 10, color: 'var(--text-muted)' }}
        >
          <span>{formatTimeAgo(message.created_at)}</span>
          <button
            className="opacity-0 group-hover/msg:opacity-100 cursor-pointer transition-opacity duration-150 flex items-center gap-1"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-primary)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)' }}
            onClick={() => {
              const text = `Q: ${message.content}\n\nPelican AI:`
              navigator.clipboard.writeText(text)
            }}
            aria-label="Share this response"
          >
            <ShareNetwork size={12} />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ──────────────────────────────────────────────────

export default function PelicanPortalPage() {
  const {
    conversations,
    isLoadingConversations,
    activeConversation,
    messages,
    isLoadingMessages,
    streamingText,
    isStreaming,
    startNewConversation,
    selectConversation,
    sendMessage,
    deleteConversation,
  } = usePelicanPortal()

  const isMobile = useMobile()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isNearBottomRef = useRef(true)

  // Auto-scroll when streaming or new messages arrive
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

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px'
  }, [inputValue])

  // Focus textarea on mount (desktop only)
  useEffect(() => {
    if (!isMobile) {
      setTimeout(() => textareaRef.current?.focus(), 300)
    }
  }, [isMobile, activeConversation])

  // Send handler
  const handleSend = useCallback(() => {
    const text = inputValue.trim()
    if (!text || isStreaming) return
    setInputValue('')
    sendMessage(text)
  }, [inputValue, isStreaming, sendMessage])

  // Keyboard handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  // Select conversation and close mobile sidebar
  const handleSelectConversation = useCallback((id: string) => {
    selectConversation(id)
    if (isMobile) setSidebarOpen(false)
  }, [selectConversation, isMobile])

  // New chat and close mobile sidebar
  const handleNewChat = useCallback(() => {
    startNewConversation()
    if (isMobile) setSidebarOpen(false)
  }, [startNewConversation, isMobile])

  // Share last Q&A pair
  const handleShareLast = useCallback(() => {
    if (messages.length < 2) return
    const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant')
    const lastUser = [...messages].reverse().find(m => m.role === 'user')
    if (!lastAssistant || !lastUser) return

    const text = `Q: ${lastUser.content}\n\nPelican AI: ${lastAssistant.content}`
    navigator.clipboard.writeText(text)
  }, [messages])

  const hasMessages = messages.length > 0 || isStreaming
  const isDesktop = !isMobile

  // ─── Conversation sidebar content ──────────────────────────────

  const sidebarContent = (
    <div
      className="flex flex-col h-full"
      style={{
        width: SIDEBAR_WIDTH,
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
      }}
    >
      {/* New Chat button */}
      <div style={{ padding: '16px 12px 8px' }}>
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 text-[13px] font-medium cursor-pointer transition-all duration-150"
          style={{
            padding: '10px 14px',
            borderRadius: 10,
            background: 'var(--accent-gradient)',
            color: 'white',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9' }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
        >
          <Plus size={16} weight="bold" />
          New Chat
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '4px 8px' }}>
        {isLoadingConversations ? (
          <div className="flex justify-center py-8">
            <div
              className="rounded-full animate-spin"
              style={{
                width: 20,
                height: 20,
                border: '2px solid var(--border-subtle)',
                borderTopColor: 'var(--accent-primary)',
              }}
            />
          </div>
        ) : conversations.length === 0 ? (
          <div
            className="text-center py-8 text-[12px]"
            style={{ color: 'var(--text-muted)' }}
          >
            No conversations yet
          </div>
        ) : (
          conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => handleSelectConversation(conv.id)}
              className="group w-full text-left cursor-pointer transition-all duration-150 flex items-start gap-2"
              style={{
                padding: '10px 10px',
                borderRadius: 8,
                marginBottom: 2,
                backgroundColor: activeConversation?.id === conv.id ? 'var(--bg-elevated)' : 'transparent',
                borderLeft: activeConversation?.id === conv.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (activeConversation?.id !== conv.id) {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'
                }
              }}
              onMouseLeave={(e) => {
                if (activeConversation?.id !== conv.id) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }
              }}
            >
              <div className="flex-1 min-w-0">
                <div
                  className="text-[12px] font-medium truncate"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {conv.title || 'New conversation'}
                </div>
                {conv.last_message_preview && (
                  <div
                    className="text-[11px] truncate mt-0.5"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {conv.last_message_preview}
                  </div>
                )}
                <div
                  className="text-[10px] font-mono tabular-nums mt-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {formatTimeAgo(conv.updated_at)}
                </div>
              </div>
              <DeleteButton onConfirm={() => deleteConversation(conv.id)} />
            </button>
          ))
        )}
      </div>

      {/* Sidebar footer */}
      <div
        className="shrink-0 flex items-center gap-2 px-4"
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <PelicanAvatar size={18} />
        <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
          Pelican Portal
        </span>
      </div>
    </div>
  )

  // ─── Empty state ───────────────────────────────────────────────

  const emptyState = (
    <div className="flex-1 flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <PelicanAvatar size={56} />
        <h2
          className="text-xl font-semibold mt-5 mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          Welcome to Pelican Portal
        </h2>
        <p
          className="text-[13px] mb-8"
          style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}
        >
          Ask anything about crypto — Pelican translates it into the language you already know.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {STARTER_PROMPTS.map((starter, i) => {
            const Icon = starter.icon
            return (
              <button
                key={i}
                onClick={() => {
                  setInputValue('')
                  sendMessage(starter.text)
                }}
                className="group/card text-left cursor-pointer transition-all duration-200"
                style={{
                  padding: '14px 16px',
                  borderRadius: 12,
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-muted)'
                  e.currentTarget.style.backgroundColor = 'var(--accent-dim)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)'
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'
                }}
              >
                <Icon
                  size={20}
                  weight="duotone"
                  className="mb-2 transition-colors duration-200"
                  style={{ color: 'var(--accent-primary)' }}
                />
                <div
                  className="text-[12px]"
                  style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}
                >
                  {starter.text}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )

  // ─── Chat area ─────────────────────────────────────────────────

  const chatArea = (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Chat header */}
      <div
        className="shrink-0 flex items-center justify-between"
        style={{
          height: 56,
          padding: '0 20px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div className="flex items-center gap-3">
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="cursor-pointer transition-colors duration-150 mr-1"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)' }}
              aria-label="Open conversation list"
            >
              <List size={20} />
            </button>
          )}
          <PelicanAvatar size={28} />
          <div>
            <div className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              {activeConversation?.title || 'Pelican Portal'}
            </div>
            <div className="flex items-center gap-1.5" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {isStreaming ? (
                <>
                  <LiveDot color="var(--accent-primary)" size={6} />
                  <span>Thinking...</span>
                </>
              ) : (
                <span>Ask me anything about crypto</span>
              )}
            </div>
          </div>
        </div>

        {hasMessages && (
          <button
            onClick={handleShareLast}
            className="flex items-center gap-1.5 text-[11px] cursor-pointer transition-all duration-150"
            style={{
              color: 'var(--text-muted)',
              padding: '6px 10px',
              borderRadius: 7,
              border: '1px solid var(--border-subtle)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-muted)'
              e.currentTarget.style.color = 'var(--accent-primary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)'
              e.currentTarget.style.color = 'var(--text-muted)'
            }}
          >
            <ShareNetwork size={12} />
            Share Last
          </button>
        )}
      </div>

      {/* Message area */}
      {!hasMessages && !isLoadingMessages ? (
        emptyState
      ) : (
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto"
          style={{ padding: '24px 20px' }}
        >
          {isLoadingMessages ? (
            <div className="flex justify-center py-12">
              <div
                className="rounded-full animate-spin"
                style={{
                  width: 24,
                  height: 24,
                  border: '2px solid var(--border-subtle)',
                  borderTopColor: 'var(--accent-primary)',
                }}
              />
            </div>
          ) : (
            <>
              {messages.map(msg => (
                <MessageBubble key={msg.id} message={msg} />
              ))}

              {/* Streaming in progress */}
              {isStreaming && !streamingText && (
                <div className="flex gap-3 mb-5">
                  <PelicanAvatar size={24} />
                  <BouncingDots />
                </div>
              )}
              {isStreaming && streamingText && (
                <div className="flex gap-3 mb-5 max-w-[90%]">
                  <PelicanAvatar size={24} />
                  <div className="flex-1 min-w-0 text-[13px]">
                    {renderMarkdown(streamingText)}
                    <StreamingCursor />
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input area */}
      <div
        className="shrink-0"
        style={{ padding: '14px 20px 14px', paddingBottom: isMobile ? 'calc(14px + env(safe-area-inset-bottom, 0px))' : 14 }}
      >
        <div
          className="flex items-end gap-2 transition-colors duration-150"
          style={{
            backgroundColor: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 12,
            padding: '12px 16px',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-muted)'
            e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-dim)'
          }}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              e.currentTarget.style.borderColor = 'var(--border-subtle)'
              e.currentTarget.style.boxShadow = 'none'
            }
          }}
        >
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
            placeholder="Ask Pelican anything..."
            rows={1}
            className="flex-1 bg-transparent border-none outline-none text-[13px] resize-none placeholder:text-[var(--text-muted)]"
            style={{
              color: 'var(--text-primary)',
              fontFamily: 'inherit',
              lineHeight: '1.5',
              maxHeight: 160,
            }}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isStreaming}
            className="flex items-center justify-center shrink-0 cursor-pointer transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
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
            <ArrowUp size={16} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  )

  // ─── Render ────────────────────────────────────────────────────

  return (
    <>
      {/* Keyframe animations */}
      <style jsx global>{`
        @keyframes portal-cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes portal-bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>

      <div className="flex h-[calc(100vh-56px)] md:h-screen overflow-hidden">
        {/* Desktop sidebar */}
        {isDesktop && sidebarContent}

        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {isMobile && sidebarOpen && (
            <>
              <motion.div
                key="portal-sidebar-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-40"
                style={{ backgroundColor: 'var(--bg-overlay)' }}
                onClick={() => setSidebarOpen(false)}
              />
              <motion.div
                key="portal-sidebar"
                initial={{ x: -SIDEBAR_WIDTH }}
                animate={{ x: 0 }}
                exit={{ x: -SIDEBAR_WIDTH }}
                transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                className="fixed top-0 left-0 bottom-0 z-40"
              >
                <div className="relative h-full">
                  {sidebarContent}
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="absolute top-3 right-3 cursor-pointer transition-colors duration-150"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)' }}
                    aria-label="Close sidebar"
                  >
                    <X size={16} />
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Chat area */}
        {chatArea}
      </div>
    </>
  )
}
