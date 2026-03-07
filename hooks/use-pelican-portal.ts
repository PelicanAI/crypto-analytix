'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import useSWR, { mutate as globalMutate } from 'swr'
import { useStreamingChat } from '@/hooks/use-streaming-chat'
import { pelican } from '@/lib/pelican'
import { logger } from '@/lib/logger'

// ─── Types ──────────────────────────────────────────────────────

export interface PortalConversation {
  id: string
  title: string | null
  last_message_preview: string | null
  message_count: number
  created_at: string
  updated_at: string
}

export interface PortalMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface UsePelicanPortalReturn {
  conversations: PortalConversation[]
  isLoadingConversations: boolean
  activeConversation: PortalConversation | null
  messages: PortalMessage[]
  isLoadingMessages: boolean
  streamingText: string
  isStreaming: boolean
  startNewConversation: () => void
  selectConversation: (id: string) => Promise<void>
  sendMessage: (content: string) => Promise<void>
  deleteConversation: (id: string) => Promise<void>
}

// ─── Fetchers ───────────────────────────────────────────────────

const CONVERSATIONS_KEY = '/api/pelican-portal/conversations'

async function fetchConversations(url: string): Promise<PortalConversation[]> {
  const res = await fetch(url)
  if (!res.ok) return []
  const json = await res.json()
  return json.conversations || []
}

async function fetchMessages(conversationId: string): Promise<PortalMessage[]> {
  const res = await fetch(`/api/pelican-portal/conversations/${conversationId}/messages`)
  if (!res.ok) return []
  const json = await res.json()
  return json.messages || []
}

// ─── Hook ───────────────────────────────────────────────────────

export function usePelicanPortal(): UsePelicanPortalReturn {
  const [activeConversation, setActiveConversation] = useState<PortalConversation | null>(null)
  const [messages, setMessages] = useState<PortalMessage[]>([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)

  const { streamResponse, streamingText, isStreaming } = useStreamingChat()

  // Track streaming completion to commit assistant message
  const streamingTextRef = useRef('')
  const wasStreamingRef = useRef(false)
  const activeConversationRef = useRef<PortalConversation | null>(null)

  useEffect(() => {
    streamingTextRef.current = streamingText
  }, [streamingText])

  useEffect(() => {
    activeConversationRef.current = activeConversation
  }, [activeConversation])

  // When streaming transitions true -> false, commit the assistant message
  useEffect(() => {
    if (wasStreamingRef.current && !isStreaming && streamingTextRef.current) {
      const finalText = streamingTextRef.current
      const convId = activeConversationRef.current?.id

      // Add assistant message to local state
      const assistantMsg: PortalMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        role: 'assistant',
        content: finalText,
        created_at: new Date().toISOString(),
      }
      setMessages(prev => [...prev, assistantMsg])

      // Persist to API (fire-and-forget)
      if (convId) {
        fetch(`/api/pelican-portal/conversations/${convId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'assistant', content: finalText }),
        }).catch(err => {
          logger.error('Failed to persist assistant message', { error: err instanceof Error ? err.message : String(err) })
        })

        // Revalidate conversations list to update preview
        globalMutate(CONVERSATIONS_KEY)
      }
    }
    wasStreamingRef.current = isStreaming
  }, [isStreaming])

  // Fetch conversations list
  const { data: conversations = [], isLoading: isLoadingConversations } = useSWR<PortalConversation[]>(
    CONVERSATIONS_KEY,
    fetchConversations,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  )

  // Start a new conversation (reset state, don't create in DB until first message)
  const startNewConversation = useCallback(() => {
    setActiveConversation(null)
    setMessages([])
  }, [])

  // Select an existing conversation and load its messages
  const selectConversation = useCallback(async (id: string) => {
    const conv = conversations.find(c => c.id === id)
    if (!conv) return

    setActiveConversation(conv)
    setIsLoadingMessages(true)

    try {
      const msgs = await fetchMessages(id)
      setMessages(msgs)
    } catch (err) {
      logger.error('Failed to load conversation messages', { error: err instanceof Error ? err.message : String(err) })
      setMessages([])
    } finally {
      setIsLoadingMessages(false)
    }
  }, [conversations])

  // Send a user message
  const sendMessage = useCallback(async (content: string) => {
    const trimmed = content.trim()
    if (!trimmed) return

    let convId = activeConversationRef.current?.id

    // If no active conversation, create one
    if (!convId) {
      try {
        const res = await fetch('/api/pelican-portal/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })
        if (!res.ok) throw new Error('Failed to create conversation')
        const json = await res.json()
        const newConv = json.conversation as PortalConversation
        setActiveConversation(newConv)
        activeConversationRef.current = newConv
        convId = newConv.id
        globalMutate(CONVERSATIONS_KEY)
      } catch (err) {
        logger.error('Failed to create portal conversation', { error: err instanceof Error ? err.message : String(err) })
        return
      }
    }

    // Optimistic add user message to local state
    const userMsg: PortalMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      role: 'user',
      content: trimmed,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])

    // Persist user message to API (fire-and-forget)
    fetch(`/api/pelican-portal/conversations/${convId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'user', content: trimmed }),
    }).catch(err => {
      logger.error('Failed to persist user message', { error: err instanceof Error ? err.message : String(err) })
    })

    // Build system context
    const systemContext = pelican.buildContext('portal')

    // Build full message history for context
    const allMessages = [
      ...messages.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: trimmed },
    ]

    // Stream response — the useEffect above will handle committing the result
    await streamResponse(allMessages, systemContext)
  }, [messages, streamResponse])

  // Delete a conversation
  const deleteConversation = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/pelican-portal/conversations/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete')

      // If we deleted the active conversation, clear it
      if (activeConversationRef.current?.id === id) {
        setActiveConversation(null)
        setMessages([])
      }

      // Revalidate list
      globalMutate(CONVERSATIONS_KEY)
    } catch (err) {
      logger.error('Failed to delete conversation', { error: err instanceof Error ? err.message : String(err) })
    }
  }, [])

  return {
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
  }
}
