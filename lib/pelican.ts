/**
 * Layer 1: Pelican API Client
 *
 * Pure utility — no React, no hooks, no UI.
 * Can be called from API routes, cron jobs, or client hooks.
 */

import { logger } from '@/lib/logger'
import type { PelicanContext } from '@/types/pelican'

const PELICAN_API_URL = process.env.NEXT_PUBLIC_PELICAN_API_URL || ''

export interface PelicanStreamMessage {
  role: string
  content: string
}

export interface PelicanStreamOptions {
  messages: PelicanStreamMessage[]
  systemContext?: string
  signal?: AbortSignal
  onToken?: (token: string) => void
  onDone?: () => void
  onError?: (error: Error) => void
}

export interface PelicanGenerateOptions {
  prompt: string
  context?: string
  signal?: AbortSignal
}

/**
 * Stream a response from the Pelican API via SSE.
 * Calls onToken for each token received, onDone when complete.
 */
export async function stream(options: PelicanStreamOptions): Promise<void> {
  const { messages, systemContext, signal, onToken, onDone, onError } = options

  if (!PELICAN_API_URL) {
    logger.warn('Pelican API URL not configured — use mock streaming instead')
    onError?.(new Error('PELICAN_API_URL not configured'))
    return
  }

  try {
    const response = await fetch(PELICAN_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        system: systemContext,
      }),
      signal,
    })

    if (!response.ok) {
      throw new Error(`Pelican API error: ${response.status} ${response.statusText}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: [DONE]')) {
          onDone?.()
          return
        }
        if (line.startsWith('data: ')) {
          const token = line.slice(6)
          onToken?.(token)
        }
      }
    }

    onDone?.()
  } catch (err) {
    if (signal?.aborted) return
    const error = err instanceof Error ? err : new Error(String(err))
    logger.error('Pelican stream error', { error: error.message })
    onError?.(error)
  }
}

/**
 * Generate a complete response from Pelican (non-streaming).
 * Used for caching, inline cards, notification briefings.
 */
export async function generate(options: PelicanGenerateOptions): Promise<string> {
  const { prompt, context, signal } = options

  if (!PELICAN_API_URL) {
    logger.warn('Pelican API URL not configured')
    return 'Pelican AI is not connected. Configure NEXT_PUBLIC_PELICAN_API_URL to enable live intelligence.'
  }

  try {
    const response = await fetch(PELICAN_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        system: context,
        stream: false,
      }),
      signal,
    })

    if (!response.ok) {
      throw new Error(`Pelican API error: ${response.status}`)
    }

    const data = await response.json()
    return data.content || data.response || ''
  } catch (err) {
    if (signal?.aborted) return ''
    const error = err instanceof Error ? err : new Error(String(err))
    logger.error('Pelican generate error', { error: error.message })
    throw error
  }
}

/**
 * Build a system context string for Pelican based on user and context type.
 * Assembles portfolio data, user preferences, and relevant context.
 */
export function buildContext(
  contextType: PelicanContext,
  contextData?: Record<string, unknown>,
  userContext?: {
    experience_level?: string
    trading_background?: string[]
    crypto_familiarity?: string
    interests?: string[]
  }
): string {
  const parts: string[] = [
    '[CRYPTO ANALYTIX — PELICAN AI]',
    `Context: ${contextType || 'general'}`,
  ]

  if (contextData) {
    parts.push(`Data: ${JSON.stringify(contextData)}`)
  }

  if (userContext) {
    parts.push('User Profile:')
    if (userContext.experience_level) parts.push(`  Experience: ${userContext.experience_level}`)
    if (userContext.trading_background?.length) parts.push(`  Background: ${userContext.trading_background.join(', ')}`)
    if (userContext.crypto_familiarity) parts.push(`  Crypto familiarity: ${userContext.crypto_familiarity}`)
    if (userContext.interests?.length) parts.push(`  Interests: ${userContext.interests.join(', ')}`)
    parts.push('Calibrate your language and analogy complexity to this user profile.')
  }

  parts.push(
    'You are Pelican, the AI intelligence layer of Crypto Analytix.',
    'Speak the language of a traditional trader. Explain crypto concepts using TradFi analogs.',
    '"Funding rate" → "similar to overnight repo rates, paid 3x daily."',
    '"Liquidation cascade" → "like a short squeeze on ES futures but happening 24/7."',
    'Be concise. Lead with what matters most to this trader\'s portfolio.',
  )

  return parts.join('\n')
}

export const pelican = { stream, generate, buildContext }
