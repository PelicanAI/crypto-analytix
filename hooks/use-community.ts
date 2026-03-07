'use client'

import useSWR from 'swr'
import { useCallback, useState } from 'react'
import { MOCK_SHARED_INSIGHTS } from '@/lib/mock-data'
import type { SharedInsight, ShareLimitStatus } from '@/types/community'

interface CommunityResponse {
  insights: SharedInsight[]
  limit: ShareLimitStatus
}

const fetcher = async (url: string): Promise<CommunityResponse> => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Community fetch failed: ${res.status}`)
  return res.json()
}

export interface UseCommunityReturn {
  sharedInsights: SharedInsight[]
  isLoading: boolean
  shareLimit: ShareLimitStatus | null
  shareInsight: (question: string, answer: string, conversationId?: string) => Promise<string | null>
  isSharing: boolean
}

export function useCommunity(): UseCommunityReturn {
  const [isSharing, setIsSharing] = useState(false)

  const { data, isLoading, mutate } = useSWR<CommunityResponse>(
    '/api/community/insights',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10_000,
    }
  )

  const sharedInsights: SharedInsight[] =
    data?.insights && data.insights.length > 0
      ? data.insights
      : MOCK_SHARED_INSIGHTS

  const shareLimit: ShareLimitStatus | null = data?.limit ?? null

  const shareInsight = useCallback(
    async (question: string, answer: string, conversationId?: string): Promise<string | null> => {
      setIsSharing(true)
      try {
        const res = await fetch('/api/community/insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question,
            answer,
            portal_conversation_id: conversationId,
          }),
        })

        if (res.status === 429) {
          return null
        }

        if (!res.ok) {
          return null
        }

        const result = await res.json()
        const clipboardText: string = result.clipboard_text

        // Copy to clipboard
        try {
          await navigator.clipboard.writeText(clipboardText)
        } catch {
          // Fallback for older browsers
          const textarea = document.createElement('textarea')
          textarea.value = clipboardText
          textarea.style.position = 'fixed'
          textarea.style.opacity = '0'
          document.body.appendChild(textarea)
          textarea.select()
          document.execCommand('copy')
          document.body.removeChild(textarea)
        }

        // Revalidate to update the list and limit
        await mutate()

        return clipboardText
      } catch {
        return null
      } finally {
        setIsSharing(false)
      }
    },
    [mutate]
  )

  return {
    sharedInsights,
    isLoading,
    shareLimit,
    shareInsight,
    isSharing,
  }
}
