'use client'

import { useState, useRef, useCallback } from 'react'
import { List, ShareNetwork } from '@phosphor-icons/react'
import { usePelicanPortal } from '@/hooks/use-pelican-portal'
import { useMobile } from '@/hooks/use-mobile'
import { LiveDot } from '@/components/shared/live-dot'
import { PelicanAvatar } from '@/components/pelican-portal/portal-message'
import { PortalChatArea, type PortalChatAreaHandle } from '@/components/pelican-portal/portal-chat-area'
import { PortalEmptyState } from '@/components/pelican-portal/portal-empty-state'
import { PortalInput } from '@/components/pelican-portal/portal-input'
import { PortalSidebar } from '@/components/pelican-portal/portal-sidebar'

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
  const chatAreaRef = useRef<PortalChatAreaHandle>(null)

  const hasMessages = messages.length > 0 || isStreaming

  // Handlers
  const handleSelectConversation = useCallback((id: string) => {
    selectConversation(id)
    if (isMobile) setSidebarOpen(false)
  }, [selectConversation, isMobile])

  const handleNewChat = useCallback(() => {
    startNewConversation()
    if (isMobile) setSidebarOpen(false)
  }, [startNewConversation, isMobile])

  const handleSend = useCallback((text: string) => {
    sendMessage(text)
    setTimeout(() => chatAreaRef.current?.scrollToBottom(), 50)
  }, [sendMessage])

  const handleShareLast = useCallback(() => {
    if (messages.length < 2) return
    const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant')
    const lastUser = [...messages].reverse().find(m => m.role === 'user')
    if (!lastAssistant || !lastUser) return
    const text = `Q: ${lastUser.content}\n\nPelican AI: ${lastAssistant.content}`
    navigator.clipboard.writeText(text)
  }, [messages])

  return (
    <div className="flex h-[calc(100vh-56px)] md:h-screen overflow-hidden relative">
      {/* Portal atmosphere glow */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse 50% 30% at 50% 40%, var(--portal-atmosphere) 0%, transparent 70%)',
        }}
      />

      {/* Sidebar */}
      <PortalSidebar
        conversations={conversations}
        activeConversationId={activeConversation?.id ?? null}
        isLoading={isLoadingConversations}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={deleteConversation}
        isMobile={isMobile}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Chat column */}
      <div className="flex-1 flex flex-col min-h-0 relative z-10">
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

        {/* Messages or empty state */}
        {!hasMessages && !isLoadingMessages ? (
          <PortalEmptyState onSelectPrompt={handleSend} />
        ) : (
          <PortalChatArea
            ref={chatAreaRef}
            messages={messages}
            streamingText={streamingText}
            isStreaming={isStreaming}
            isLoadingMessages={isLoadingMessages}
          />
        )}

        {/* Input area with gradient fade */}
        <PortalInput
          onSend={handleSend}
          disabled={isStreaming}
          isMobile={isMobile}
        />
      </div>
    </div>
  )
}
