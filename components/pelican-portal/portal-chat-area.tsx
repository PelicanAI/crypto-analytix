'use client'

import { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { PortalMessage, PelicanAvatar } from './portal-message'
import { MarkdownRenderer } from './markdown-renderer'
import type { PortalMessageData } from './portal-message'

export interface PortalChatAreaHandle {
  scrollToBottom: () => void
}

interface PortalChatAreaProps {
  messages: PortalMessageData[]
  streamingText: string
  isStreaming: boolean
  isLoadingMessages: boolean
}

function StreamingCursor({ fading }: { fading: boolean }) {
  return (
    <span
      className="inline-block align-text-bottom rounded-sm transition-opacity duration-300"
      style={{
        width: 2, height: 18,
        backgroundColor: 'var(--accent-primary)',
        boxShadow: '0 0 6px rgba(29,161,196,0.4)',
        animation: fading ? 'none' : 'portal-cursor-blink 0.8s step-end infinite',
        opacity: fading ? 0 : undefined,
      }}
    />
  )
}

function EqualizerIndicator() {
  const [label, setLabel] = useState('Pelican is analyzing...')
  useEffect(() => {
    const t = setTimeout(() => setLabel('Generating response...'), 3000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="flex gap-3 items-start">
      <PelicanAvatar size={28} />
      <div>
        <div className="flex items-end gap-[3px] py-2" style={{ height: 28 }}>
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="rounded-sm"
              style={{
                width: 3,
                backgroundColor: 'var(--accent-primary)',
                animation: 'portal-equalizer 0.6s ease-in-out infinite alternate',
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
        <div className="italic" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {label}
        </div>
      </div>
    </div>
  )
}

function LoadingSpinner() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 200)
    return () => clearTimeout(t)
  }, [])
  if (!show) return null
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div
        className="rounded-full animate-spin"
        style={{ width: 20, height: 20, border: '2px solid var(--border-subtle)', borderTopColor: 'var(--accent-primary)' }}
      />
      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Loading conversation...</span>
    </div>
  )
}

export const PortalChatArea = forwardRef<PortalChatAreaHandle, PortalChatAreaProps>(
  function PortalChatArea({ messages, streamingText, isStreaming, isLoadingMessages }, ref) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const bottomRef = useRef<HTMLDivElement>(null)
    const isNearBottomRef = useRef(true)
    const [cursorFading, setCursorFading] = useState(false)
    const prevStreamingRef = useRef(isStreaming)

    useImperativeHandle(ref, () => ({
      scrollToBottom: () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }),
    }))

    useEffect(() => {
      if (isNearBottomRef.current && bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: 'smooth' })
      }
    }, [streamingText, messages])

    const handleScroll = useCallback(() => {
      const el = scrollRef.current
      if (!el) return
      isNearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
    }, [])

    useEffect(() => {
      if (prevStreamingRef.current && !isStreaming) {
        setCursorFading(true)
        const t = setTimeout(() => setCursorFading(false), 300)
        return () => clearTimeout(t)
      }
      prevStreamingRef.current = isStreaming
    }, [isStreaming])

    const shouldShowAvatar = (i: number): boolean => {
      if (messages[i].role === 'user' || i === 0) return true
      return messages[i - 1].role !== 'assistant'
    }

    const messageGap = (i: number): number => {
      if (i === 0) return 0
      const prev = messages[i - 1].role, curr = messages[i].role
      if (prev === curr && curr === 'assistant') return 8
      if (prev === curr) return 12
      return 20
    }

    return (
      <>
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto portal-scroll"
          style={{ padding: '24px 20px' }}
        >
          {isLoadingMessages ? (
            <LoadingSpinner />
          ) : (
            <AnimatePresence mode="popLayout">
              {messages.map((msg, i) => (
                <div key={msg.id} style={{ marginTop: messageGap(i) }}>
                  <PortalMessage message={msg} showAvatar={shouldShowAvatar(i)} isNew={false} />
                </div>
              ))}
            </AnimatePresence>
          )}

          {isStreaming && !streamingText && (
            <div style={{ marginTop: messages.length > 0 ? 20 : 0 }}>
              <EqualizerIndicator />
            </div>
          )}

          {isStreaming && streamingText && (
            <div className="flex gap-3 max-w-[88%]" style={{ marginTop: messages.length > 0 ? 20 : 0 }}>
              <PelicanAvatar size={28} />
              <div className="flex-1 min-w-0">
                <MarkdownRenderer content={streamingText} />
                <StreamingCursor fading={false} />
              </div>
            </div>
          )}

          {!isStreaming && cursorFading && <StreamingCursor fading />}
          <div ref={bottomRef} />
        </div>
      </>
    )
  }
)
