'use client'

import { useState, useEffect, useCallback } from 'react'
import useSWR from 'swr'
import { useSearchParams } from 'next/navigation'
import { REFRESH_INTERVALS } from '@/lib/constants'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface KeyLevel {
  asset: string
  level: string
  type: 'support' | 'resistance'
  note: string
}

export interface BriefData {
  overnight_summary: string
  portfolio_impact: string
  key_levels: KeyLevel[]
  one_thing_to_learn: {
    topic: string
    content: string
  }
  market_snapshot: {
    btc_price: number
    btc_change_24h: number
    eth_price: number
    eth_change_24h: number
    portfolio_value: number
    portfolio_change_24h: number
  }
  generated_at: string
}

export interface WhatIMissedData {
  show: boolean
  hours_away?: number
  headline?: string
  portfolio_impact?: string
  changes?: { asset: string; change: string; direction: 'up' | 'down' }[]
  action_items?: string[]
}

export interface UseBriefReturn {
  brief: BriefData | null
  whatIMissed: WhatIMissedData | null
  isLoading: boolean
  error: Error | null
  refreshBrief: () => void
  dismissWhatIMissed: () => void
}

// ---------------------------------------------------------------------------
// Fetcher
// ---------------------------------------------------------------------------

async function briefFetcher(url: string): Promise<BriefData> {
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Brief fetch failed: ${res.status}`)
  }
  return res.json()
}

async function whatIMissedFetcher(url: string): Promise<WhatIMissedData> {
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `What I Missed fetch failed: ${res.status}`)
  }
  return res.json()
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useBrief(): UseBriefReturn {
  const searchParams = useSearchParams()
  const isDemoMode = searchParams.get('mock') === 'true'

  const briefUrl = isDemoMode ? '/api/brief?mock=true' : '/api/brief'
  const wimUrl = isDemoMode
    ? '/api/brief/what-i-missed?mock=true'
    : '/api/brief/what-i-missed'

  const [dismissed, setDismissed] = useState(false)

  // Brief data — refresh every 5 min
  const {
    data: brief,
    error: briefError,
    isLoading: briefLoading,
    mutate: mutateBrief,
  } = useSWR<BriefData>(briefUrl, briefFetcher, {
    refreshInterval: REFRESH_INTERVALS.brief,
    revalidateOnFocus: false,
    keepPreviousData: true,
  })

  // What I Missed — fetch once on mount, no auto-refresh
  const {
    data: whatIMissed,
    error: wimError,
  } = useSWR<WhatIMissedData>(wimUrl, whatIMissedFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 0,
  })

  // Touch last_active on mount
  useEffect(() => {
    fetch('/api/brief/activity', { method: 'POST' }).catch(() => {
      // Best-effort — don't block on failure
    })
  }, [])

  const dismissWhatIMissed = useCallback(() => {
    setDismissed(true)
    // Update last_active so it won't show again immediately
    fetch('/api/brief/activity', { method: 'POST' }).catch(() => {})
  }, [])

  // Build effective WIM data — hide if dismissed
  const effectiveWIM: WhatIMissedData | null =
    dismissed || !whatIMissed?.show ? null : whatIMissed

  return {
    brief: brief ?? null,
    whatIMissed: effectiveWIM,
    isLoading: briefLoading,
    error: briefError ?? wimError ?? null,
    refreshBrief: () => mutateBrief(),
    dismissWhatIMissed,
  }
}
