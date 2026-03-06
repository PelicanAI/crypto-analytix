'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useStreamingChat } from '@/hooks/use-streaming-chat'
import { pelican } from '@/lib/pelican'
import type {
  PelicanContext,
  PelicanMessage,
  PelicanPanelState,
  PelicanPrompt,
} from '@/types/pelican'

// ─── Helpers ──────────────────────────────────────────────────────

function createMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function createConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function makeMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string
): PelicanMessage {
  return {
    id: createMessageId(),
    conversation_id: conversationId,
    role,
    content,
    timestamp: new Date().toISOString(),
  }
}

// ─── Return type ──────────────────────────────────────────────────

export interface UsePelicanPanelReturn {
  state: PelicanPanelState
  openWithPrompt: (
    context: PelicanContext,
    prompt: string | PelicanPrompt,
    ticker?: string | null
  ) => Promise<void>
  sendMessage: (content: string) => Promise<void>
  close: () => void
  clearMessages: () => void
}

// ─── Hook ─────────────────────────────────────────────────────────

export function usePelicanPanel(): UsePelicanPanelReturn {
  const [isOpen, setIsOpen] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<PelicanMessage[]>([])
  const [context, setContext] = useState<PelicanContext>(null)
  const [contextData, setContextData] = useState<Record<string, unknown> | null>(null)
  const [ticker, setTicker] = useState<string | null>(null)

  const pathname = usePathname()
  const prevPathname = useRef(pathname)

  const { streamResponse, streamingText, isStreaming, error, abort } = useStreamingChat({
    onError: (err) => {
      // Add error message to conversation
      if (conversationId) {
        setMessages(prev => [
          ...prev,
          makeMessage(conversationId, 'assistant', `Error: ${err.message}`),
        ])
      }
    },
  })

  // Track streaming text and append to messages when complete
  const streamingTextRef = useRef('')
  const wasStreamingRef = useRef(false)

  useEffect(() => {
    streamingTextRef.current = streamingText
  }, [streamingText])

  useEffect(() => {
    // When streaming transitions from true → false, commit the streamed text as a message
    if (wasStreamingRef.current && !isStreaming && streamingTextRef.current && conversationId) {
      const finalText = streamingTextRef.current
      setMessages(prev => [
        ...prev,
        makeMessage(conversationId, 'assistant', finalText),
      ])
    }
    wasStreamingRef.current = isStreaming
  }, [isStreaming, conversationId])

  // Auto-close on route change
  useEffect(() => {
    if (prevPathname.current !== pathname && isOpen) {
      abort()
      setIsOpen(false)
    }
    prevPathname.current = pathname
  }, [pathname, isOpen, abort])

  const openWithPrompt = useCallback(async (
    ctx: PelicanContext,
    prompt: string | PelicanPrompt,
    newTicker?: string | null,
  ) => {
    const isString = typeof prompt === 'string'
    const visibleMessage = isString ? prompt : prompt.visibleMessage
    const fullPrompt = isString ? prompt : prompt.fullPrompt

    // If panel is already open with same context+ticker, append to existing conversation
    const reuseConversation = isOpen && context === ctx && ticker === (newTicker ?? null) && conversationId
    const convId = reuseConversation ? conversationId! : createConversationId()

    if (!reuseConversation) {
      setMessages([])
      setConversationId(convId)
      setContext(ctx)
      setContextData(null)
      setTicker(newTicker ?? null)
    }

    setIsOpen(true)

    // Add user message (visible part)
    const userMsg = makeMessage(convId, 'user', visibleMessage)
    setMessages(prev => [...prev, userMsg])

    // Build system context
    const systemContext = pelican.buildContext(ctx)

    // Stream response (sends full prompt, not visible message)
    await streamResponse(
      [{ role: 'user', content: fullPrompt }],
      systemContext,
    )
  }, [isOpen, context, ticker, conversationId, streamResponse])

  const sendMessage = useCallback(async (content: string) => {
    if (!conversationId || !content.trim()) return

    const userMsg = makeMessage(conversationId, 'user', content)
    setMessages(prev => [...prev, userMsg])

    // Build full message history for context
    const allMessages = [
      ...messages.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content },
    ]

    const systemContext = pelican.buildContext(context)
    await streamResponse(allMessages, systemContext)
  }, [conversationId, messages, context, streamResponse])

  const close = useCallback(() => {
    abort()
    setIsOpen(false)
    // Do NOT clear messages — user might reopen
  }, [abort])

  const clearMessages = useCallback(() => {
    abort()
    setMessages([])
    setConversationId(null)
    setContext(null)
    setContextData(null)
    setTicker(null)
  }, [abort])

  const state: PelicanPanelState = {
    isOpen,
    conversationId,
    messages,
    isStreaming,
    streamingText,
    context,
    contextData,
    ticker,
  }

  return { state, openWithPrompt, sendMessage, close, clearMessages }
}
