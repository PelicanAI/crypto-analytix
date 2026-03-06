/**
 * Layer 2: React hook that wraps the Pelican API client for client-side streaming.
 *
 * Manages streaming state (streamingText, isStreaming, error, abort).
 * Can be used by ANY component that needs to stream Pelican responses —
 * the panel, a chat widget, an inline card with a "regenerate" button.
 *
 * READ-ONLY after Session 5. Do not modify.
 */

'use client'

import { useState, useRef, useCallback } from 'react'
import { pelican } from '@/lib/pelican'
import { logger } from '@/lib/logger'

interface StreamMessage {
  role: string
  content: string
}

interface UseStreamingChatOptions {
  endpoint?: string
  onError?: (error: Error) => void
}

interface UseStreamingChatReturn {
  streamResponse: (messages: StreamMessage[], systemContext?: string) => Promise<void>
  streamingText: string
  isStreaming: boolean
  error: Error | null
  abort: () => void
}

// ─── Mock responses by context ────────────────────────────────────

const MOCK_RESPONSES: Record<string, string> = {
  position: `**Position Analysis**

This is a mock Pelican analysis of your position. In production, Pelican would analyze your entry price, current price, funding rate, on-chain data, and analyst calls to provide a comprehensive contextual review personalized to your portfolio.

**What Pelican would include:**

• Your P&L and how it compares to your historical performance
• Current funding rate and what it means in TradFi terms (think overnight repo rates, paid every 8 hours)
• Recent analyst calls on this asset from Blake, Grega, and Ryan
• On-chain signals — whale movements, exchange flows, accumulation patterns
• Risk assessment relative to your portfolio allocation and concentration rules

Connect the Pelican API to enable live intelligence.`,

  brief: `**Daily Market Brief — Mock**

Good morning. Here's what happened while you were away.

**Overnight Summary:**
Markets were mixed overnight. BTC held above key support while altcoins showed divergent behavior.

**Your Portfolio Impact:**
• Your portfolio would show specific changes here
• Positions that moved significantly would be highlighted
• Pelican would flag any trading rule violations

**Key Levels Today:**
• Support and resistance levels from analyst calls
• Funding rate snapshot across your held assets

**One Thing to Learn:**
In TradFi terms, crypto "funding rates" work like overnight repo rates — except they settle every 8 hours instead of daily. When funding is positive, longs pay shorts (similar to paying carry on a leveraged position).

Connect the Pelican API for personalized daily intelligence.`,

  funding: `**Funding Rate Analysis — Mock**

Funding rates in crypto are similar to overnight financing costs you'd see in futures — think of them like the repo rate, but settled every 8 hours instead of daily.

**What this means in TradFi terms:**

• **Positive funding** = longs are paying shorts. Similar to when the futures basis is in contango — there's a cost to holding the long position. Like paying carry on a leveraged ES future.
• **Negative funding** = shorts are paying longs. Similar to backwardation — shorts are paying a premium to maintain their position.
• **Magnitude matters:** 0.01% per 8h ≈ 0.03% per day ≈ ~11% annualized. That's significant carry.

**Historical Context:**
When funding rates reach extremes (>0.03% or <-0.03%), it often signals crowded positioning. In TradFi terms, it's like when the short interest ratio hits extremes — a reversal becomes more likely.

Connect the Pelican API for live funding rate intelligence on your positions.`,

  default: `**Pelican AI — Mock Mode**

Pelican is not connected yet. Add \`NEXT_PUBLIC_PELICAN_API_URL\` to your environment variables to enable live AI analysis.

This mock response demonstrates the streaming UI and panel interaction. In production, every response would be personalized to your portfolio, trading history, and the specific data point you clicked.

**What Pelican does:**

• Analyzes your specific positions with real-time market data
• Translates crypto concepts into TradFi language you already know
• Flags risks relative to YOUR portfolio, not generic market data
• Surfaces analyst calls from Blake, Grega, and Ryan relevant to your holdings
• Tracks your behavioral patterns to improve your trading over time

The Pelican icon appears next to every data point on the platform. Click any of them to get contextual intelligence.`,
}

function getMockResponse(lastMessage: string): string {
  const lower = lastMessage.toLowerCase()
  if (lower.includes('sition') || /\b(btc|eth|sol|avax|link|dot|ada|xrp|bnb)\b/i.test(lower)) {
    return MOCK_RESPONSES.position
  }
  if (lower.includes('brief') || lower.includes('missed') || lower.includes('morning')) {
    return MOCK_RESPONSES.brief
  }
  if (lower.includes('funding') || lower.includes('rate') || lower.includes('financing')) {
    return MOCK_RESPONSES.funding
  }
  return MOCK_RESPONSES.default
}

async function streamMock(
  text: string,
  onToken: (char: string) => void,
  signal?: AbortSignal
): Promise<void> {
  for (let i = 0; i < text.length; i++) {
    if (signal?.aborted) return
    onToken(text[i])
    // 8-15ms random delay between characters
    await new Promise(resolve => setTimeout(resolve, 8 + Math.random() * 7))
  }
}

// ─── Hook ─────────────────────────────────────────────────────────

export function useStreamingChat(options?: UseStreamingChatOptions): UseStreamingChatReturn {
  const { endpoint, onError } = options || {}
  const [streamingText, setStreamingText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const abort = useCallback(() => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    setIsStreaming(false)
    // Do NOT clear streamingText — user should still see partial response
  }, [])

  const streamResponse = useCallback(async (
    messages: StreamMessage[],
    systemContext?: string
  ): Promise<void> => {
    // Abort any in-flight stream
    abortControllerRef.current?.abort()

    const controller = new AbortController()
    abortControllerRef.current = controller

    setStreamingText('')
    setIsStreaming(true)
    setError(null)

    const apiUrl = endpoint || process.env.NEXT_PUBLIC_PELICAN_API_URL || ''
    const isMock = !apiUrl

    try {
      if (isMock) {
        // Mock streaming mode
        const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || ''
        const mockText = getMockResponse(lastUserMessage)

        await streamMock(
          mockText,
          (char) => {
            if (!controller.signal.aborted) {
              setStreamingText(prev => prev + char)
            }
          },
          controller.signal
        )
      } else {
        // Real Pelican API streaming
        let retryCount = 0
        const maxRetries = 1

        const attemptStream = async (): Promise<void> => {
          return new Promise<void>((resolve, reject) => {
            const timeoutId = setTimeout(() => {
              controller.abort()
              reject(new Error('Stream timeout after 30s'))
            }, 30_000)

            pelican.stream({
              messages,
              systemContext,
              signal: controller.signal,
              onToken: (token) => {
                setStreamingText(prev => prev + token)
              },
              onDone: () => {
                clearTimeout(timeoutId)
                resolve()
              },
              onError: (err) => {
                clearTimeout(timeoutId)
                reject(err)
              },
            })
          })
        }

        try {
          await attemptStream()
        } catch (err) {
          if (controller.signal.aborted) return
          if (retryCount < maxRetries) {
            retryCount++
            logger.warn('Pelican stream failed, retrying...', { attempt: retryCount })
            await new Promise(r => setTimeout(r, 1000))
            if (controller.signal.aborted) return
            await attemptStream()
          } else {
            throw err
          }
        }
      }
    } catch (err) {
      if (controller.signal.aborted) return
      const streamError = err instanceof Error ? err : new Error(String(err))
      setError(streamError)
      logger.error('Streaming error', { error: streamError.message })
      onError?.(streamError)
    } finally {
      if (!controller.signal.aborted) {
        setIsStreaming(false)
      }
    }
  }, [endpoint, onError])

  return { streamResponse, streamingText, isStreaming, error, abort }
}
