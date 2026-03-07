'use client'

import useSWR from 'swr'
import { useCallback, useState } from 'react'
import { MOCK_WATCHLIST_ITEMS, MOCK_WATCHLIST_ALERTS } from '@/lib/mock-data'
import type { WatchlistItem, WatchlistAlert, AlertType } from '@/types/watchlist'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WatchlistResponse {
  items: WatchlistItem[]
  alerts: WatchlistAlert[]
}

export interface UseWatchlistReturn {
  items: WatchlistItem[]
  alerts: WatchlistAlert[]
  isLoading: boolean
  error: Error | null
  addAsset: (asset: string, notes?: string) => Promise<void>
  removeAsset: (id: string) => Promise<void>
  addAlert: (watchlistId: string, type: AlertType, condition: Record<string, unknown>) => Promise<void>
  removeAlert: (id: string) => Promise<void>
  toggleAlert: (id: string, enabled: boolean) => Promise<void>
  refresh: () => void
  isAdding: boolean
}

// ---------------------------------------------------------------------------
// Fetcher
// ---------------------------------------------------------------------------

const fetcher = async (url: string): Promise<WatchlistResponse> => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Watchlist fetch failed: ${res.status}`)
  return res.json()
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useWatchlist(): UseWatchlistReturn {
  const [isAdding, setIsAdding] = useState(false)

  const { data, error, isLoading, mutate } = useSWR<WatchlistResponse>(
    '/api/watchlist?mock=true',
    fetcher,
    {
      refreshInterval: 60_000,
      revalidateOnFocus: false,
      fallbackData: {
        items: MOCK_WATCHLIST_ITEMS,
        alerts: MOCK_WATCHLIST_ALERTS,
      },
    }
  )

  const items = data?.items ?? MOCK_WATCHLIST_ITEMS
  const alerts = data?.alerts ?? MOCK_WATCHLIST_ALERTS

  // --- Add an asset to the watchlist ---
  const addAsset = useCallback(async (asset: string, notes?: string) => {
    setIsAdding(true)
    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asset, notes }),
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error || 'Failed to add asset')
      }

      await mutate()
    } finally {
      setIsAdding(false)
    }
  }, [mutate])

  // --- Remove an asset from the watchlist ---
  const removeAsset = useCallback(async (id: string) => {
    // Optimistic remove
    mutate(
      (prev) =>
        prev
          ? {
              items: prev.items.filter((i) => i.id !== id),
              alerts: prev.alerts.filter((a) => a.watchlist_id !== id),
            }
          : prev,
      false
    )

    try {
      const res = await fetch('/api/watchlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (!res.ok) {
        // Revert on failure
        await mutate()
        const body = await res.json()
        throw new Error(body.error || 'Failed to remove asset')
      }
    } catch {
      await mutate()
    }
  }, [mutate])

  // --- Add an alert ---
  const addAlert = useCallback(async (
    watchlistId: string,
    type: AlertType,
    condition: Record<string, unknown>
  ) => {
    const res = await fetch('/api/watchlist/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ watchlist_id: watchlistId, alert_type: type, condition }),
    })

    if (!res.ok) {
      const body = await res.json()
      throw new Error(body.error || 'Failed to create alert')
    }

    await mutate()
  }, [mutate])

  // --- Remove an alert ---
  const removeAlert = useCallback(async (id: string) => {
    // Optimistic remove
    mutate(
      (prev) =>
        prev
          ? { items: prev.items, alerts: prev.alerts.filter((a) => a.id !== id) }
          : prev,
      false
    )

    try {
      const res = await fetch('/api/watchlist/alerts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (!res.ok) {
        await mutate()
      }
    } catch {
      await mutate()
    }
  }, [mutate])

  // --- Toggle alert enabled/disabled ---
  const toggleAlert = useCallback(async (id: string, enabled: boolean) => {
    // Optimistic update
    mutate(
      (prev) =>
        prev
          ? {
              items: prev.items,
              alerts: prev.alerts.map((a) =>
                a.id === id ? { ...a, enabled } : a
              ),
            }
          : prev,
      false
    )

    try {
      const res = await fetch('/api/watchlist/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, enabled }),
      })

      if (!res.ok) {
        await mutate()
      }
    } catch {
      await mutate()
    }
  }, [mutate])

  return {
    items,
    alerts,
    isLoading,
    error: error ?? null,
    addAsset,
    removeAsset,
    addAlert,
    removeAlert,
    toggleAlert,
    refresh: () => mutate(),
    isAdding,
  }
}
