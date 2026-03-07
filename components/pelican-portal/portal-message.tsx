'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShareNetwork } from '@phosphor-icons/react'
import { MarkdownRenderer } from './markdown-renderer'
import { formatTimeAgo } from '@/lib/formatters'

// ─── Types ──────────────────────────────────────────────────────

export interface PortalMessageData {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

interface PortalMessageProps {
  message: PortalMessageData
  showAvatar?: boolean
  isNew?: boolean
}

// ─── Pelican Avatar (reusable) ──────────────────────────────────

export function PelicanAvatar({ size = 28 }: { size?: number }) {
  const iconSize = Math.round(size * 0.57)
  return (
    <div
      className="flex items-center justify-center shrink-0"
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.32),
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

// ─── User Message ───────────────────────────────────────────────

function UserMessage({ message }: { message: PortalMessageData }) {
  const [showTime, setShowTime] = useState(false)

  return (
    <motion.div
      className="flex justify-end"
      initial={{ opacity: 0, y: 8, x: 12 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <div
        className="relative max-w-[75%]"
        onMouseEnter={() => setShowTime(true)}
        onMouseLeave={() => setShowTime(false)}
      >
        <div
          className="text-[14px]"
          style={{
            background: 'linear-gradient(135deg, var(--accent-dim) 0%, rgba(29,161,196,0.06) 100%)',
            border: '1px solid rgba(29,161,196,0.075)',
            borderRadius: '18px 18px 4px 18px',
            padding: '12px 16px',
            color: 'var(--text-primary)',
            lineHeight: '1.6',
          }}
        >
          {message.content}
        </div>
        <div
          className="mt-1 text-right font-mono tabular-nums transition-opacity duration-150"
          style={{
            fontSize: 10,
            color: 'var(--text-muted)',
            opacity: showTime ? 1 : 0,
            height: showTime ? 'auto' : 0,
            overflow: 'hidden',
          }}
        >
          {formatTimeAgo(message.created_at)}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Assistant Message ──────────────────────────────────────────

function AssistantMessage({ message, showAvatar }: {
  message: PortalMessageData
  showAvatar: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleShare = () => {
    const text = `Shared from Pelican Portal\n\nPelican AI: ${message.content}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <motion.div
      className="flex gap-3 max-w-[88%] group/assistant"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Avatar or spacer */}
      {showAvatar ? (
        <PelicanAvatar size={28} />
      ) : (
        <div className="shrink-0" style={{ width: 28 }} />
      )}

      <div className="flex-1 min-w-0 relative">
        <MarkdownRenderer content={message.content} />

        {/* Share button — appears on hover */}
        <motion.button
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 4 }}
          transition={{ duration: 0.15 }}
          onClick={handleShare}
          className="flex items-center gap-1 mt-2 cursor-pointer transition-colors duration-150"
          style={{
            fontSize: 11,
            color: copied ? 'var(--accent-primary)' : 'var(--text-muted)',
            pointerEvents: hovered ? 'auto' : 'none',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-primary)' }}
          onMouseLeave={(e) => {
            if (!copied) e.currentTarget.style.color = 'var(--text-muted)'
          }}
        >
          <ShareNetwork size={12} />
          <span>{copied ? 'Copied' : 'Share'}</span>
        </motion.button>
      </div>
    </motion.div>
  )
}

// ─── Portal Message (entry point) ───────────────────────────────

export function PortalMessage({
  message,
  showAvatar = true,
}: PortalMessageProps) {
  if (message.role === 'user') {
    return <UserMessage message={message} />
  }

  return <AssistantMessage message={message} showAvatar={showAvatar} />
}
