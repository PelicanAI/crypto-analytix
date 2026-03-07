'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash, X } from '@phosphor-icons/react'
import { formatTimeAgo } from '@/lib/formatters'

export const SIDEBAR_WIDTH = 260

export interface SidebarConversation {
  id: string
  title: string | null
  last_message_preview: string | null
  message_count: number
  created_at: string
  updated_at: string
}

interface PortalSidebarProps {
  conversations: SidebarConversation[]
  activeConversationId: string | null
  isLoading: boolean
  onNewChat: () => void
  onSelectConversation: (id: string) => void
  onDeleteConversation: (id: string) => void
  isMobile?: boolean
  isOpen?: boolean
  onClose?: () => void
}

function SidebarPelicanAvatar() {
  return (
    <div className="flex items-center justify-center shrink-0" style={{ width: 18, height: 18, borderRadius: 6, background: 'var(--accent-gradient)' }}>
      <svg width={10} height={10} viewBox="0 0 24 24" fill="none">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="white" />
      </svg>
    </div>
  )
}

function DeleteButton({ onConfirm }: { onConfirm: () => void }) {
  const [confirming, setConfirming] = useState(false)
  if (confirming) {
    return (
      <button onClick={(e) => { e.stopPropagation(); onConfirm(); setConfirming(false) }}
        className="text-[10px] font-medium shrink-0 cursor-pointer transition-colors duration-150"
        style={{ color: 'var(--data-negative)' }}>Delete?</button>
    )
  }
  return (
    <button onClick={(e) => { e.stopPropagation(); setConfirming(true) }}
      className="opacity-0 group-hover:opacity-100 shrink-0 cursor-pointer transition-all duration-150"
      style={{ color: 'var(--text-muted)' }}
      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--data-negative)' }}
      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)' }}
      aria-label="Delete conversation"><Trash size={14} /></button>
  )
}

function SidebarSkeletons() {
  return (
    <>{Array.from({ length: 5 }).map((_, i) => (
      <div key={i} style={{ padding: '12px 12px', marginBottom: 2 }}>
        <div className="animate-pulse rounded" style={{ width: '60%', height: 12, backgroundColor: 'var(--bg-elevated)' }} />
        <div className="animate-pulse rounded mt-2" style={{ width: '80%', height: 10, backgroundColor: 'var(--bg-elevated)' }} />
      </div>
    ))}</>
  )
}

type ContentProps = Omit<PortalSidebarProps, 'isMobile' | 'isOpen' | 'onClose'>

function SidebarContent({ conversations, activeConversationId, isLoading, onNewChat, onSelectConversation, onDeleteConversation }: ContentProps) {
  return (
    <div className="flex flex-col h-full relative overflow-hidden"
      style={{ width: SIDEBAR_WIDTH, backgroundColor: 'var(--bg-surface)', borderRight: '1px solid var(--border-subtle)' }}>
      {/* Top gradient tint */}
      <div className="absolute inset-x-0 top-0 pointer-events-none"
        style={{ height: 120, background: 'linear-gradient(180deg, rgba(29,161,196,0.03) 0%, transparent 100%)' }} />

      {/* New Chat */}
      <div className="relative" style={{ padding: '16px 12px 8px' }}>
        <button onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 text-[13px] font-medium cursor-pointer"
          style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--accent-gradient)', color: 'white',
            boxShadow: '0 2px 8px rgba(29,161,196,0.15)', transition: 'box-shadow 200ms ease, transform 200ms ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(29,161,196,0.2)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(29,161,196,0.15)'; e.currentTarget.style.transform = 'translateY(0)' }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(29,161,196,0.1)' }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(29,161,196,0.2)' }}>
          <Plus size={16} weight="bold" />New Chat
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto relative" style={{ padding: '4px 8px' }}>
        {isLoading ? <SidebarSkeletons /> : conversations.length === 0 ? (
          <div className="text-center py-8 text-[12px]" style={{ color: 'var(--text-muted)' }}>No conversations yet</div>
        ) : conversations.map((conv, idx) => {
          const active = activeConversationId === conv.id
          const last = idx === conversations.length - 1
          return (
            <div key={conv.id}>
              <button onClick={() => onSelectConversation(conv.id)}
                className="group w-full text-left cursor-pointer flex items-start gap-2 relative"
                style={{ padding: '12px 12px', borderRadius: 8, marginBottom: 2,
                  borderLeft: active ? '2px solid var(--accent-primary)' : '2px solid transparent',
                  background: active ? 'linear-gradient(90deg, rgba(29,161,196,0.04) 0%, var(--bg-elevated) 40%)' : 'transparent',
                  transition: 'background 150ms ease' }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}>
                <div className="flex-1 min-w-0 pr-6">
                  <div className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {conv.title || 'New conversation'}
                  </div>
                  {conv.last_message_preview && (
                    <div className="text-[11px] truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>{conv.last_message_preview}</div>
                  )}
                </div>
                <span className="absolute font-mono tabular-nums" style={{ top: 12, right: 12, fontSize: 10, color: 'var(--text-muted)' }}>
                  {formatTimeAgo(conv.updated_at)}
                </span>
                <div className="absolute" style={{ bottom: 10, right: 10 }}>
                  <DeleteButton onConfirm={() => onDeleteConversation(conv.id)} />
                </div>
              </button>
              {!last && !active && (
                <div style={{ borderBottom: '1px solid var(--border-subtle)', opacity: 0.5, marginLeft: 12, marginRight: 12 }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="shrink-0" style={{ padding: '12px 16px', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-2">
          <SidebarPelicanAvatar />
          <span className="text-[11px] font-semibold" style={{ color: 'var(--accent-primary)' }}>Pelican Portal</span>
        </div>
        <div className="mt-1" style={{ fontSize: 10, color: 'var(--text-muted)' }}>Powered by Pelican AI</div>
      </div>
    </div>
  )
}

export function PortalSidebar(props: PortalSidebarProps) {
  const { isMobile = false, isOpen = false, onClose, ...contentProps } = props
  const handleClose = useCallback(() => { onClose?.() }, [onClose])

  if (!isMobile) return <SidebarContent {...contentProps} />

  return (
    <AnimatePresence>
      {isOpen && (<>
        <motion.div key="sidebar-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }} className="fixed inset-0 z-40"
          style={{ backgroundColor: 'var(--bg-overlay)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
          onClick={handleClose} />
        <motion.div key="sidebar-panel" initial={{ x: -SIDEBAR_WIDTH }} animate={{ x: 0 }} exit={{ x: -SIDEBAR_WIDTH }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }} className="fixed top-0 left-0 bottom-0 z-40">
          <div className="relative h-full">
            <SidebarContent {...contentProps} />
            <button onClick={handleClose}
              className="absolute flex items-center justify-center cursor-pointer transition-colors duration-150"
              style={{ top: 12, right: 12, width: 28, height: 28, borderRadius: '50%', color: 'var(--text-muted)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
              aria-label="Close sidebar"><X size={16} /></button>
          </div>
        </motion.div>
      </>)}
    </AnimatePresence>
  )
}
