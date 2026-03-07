'use client'

import useSWR from 'swr'
import { useCallback, useState } from 'react'
import { REFRESH_INTERVALS } from '@/lib/constants'
import type { SignalFeedItem, SignalFilter, SignalFeedResponse } from '@/types/signals'

const fetcher = async (url: string): Promise<SignalFeedResponse> => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Signals fetch failed: ${res.status}`)
  return res.json()
}

export interface UseSignalsReturn {
  signals: SignalFeedItem[]
  isLoading: boolean
  error: Error | null
  filter: SignalFilter
  setFilter: (filter: SignalFilter) => void
  assetFilter: string | null
  setAssetFilter: (asset: string | null) => void
  loadMore: () => void
  hasMore: boolean
  isLoadingMore: boolean
  refresh: () => void
}

export function useSignals(): UseSignalsReturn {
  const [filter, setFilter] = useState<SignalFilter>('all')
  const [assetFilter, setAssetFilter] = useState<string | null>(null)
  const [allSignals, setAllSignals] = useState<SignalFeedItem[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const buildUrl = useCallback(
    (before?: string | null) => {
      const params = new URLSearchParams({ type: filter, mock: 'true' })
      if (assetFilter) params.set('asset', assetFilter)
      if (before) params.set('before', before)
      return `/api/signals?${params.toString()}`
    },
    [filter, assetFilter]
  )

  const { isLoading, error, mutate } = useSWR<SignalFeedResponse>(
    buildUrl(),
    fetcher,
    {
      refreshInterval: REFRESH_INTERVALS.signals,
      revalidateOnFocus: false,
      onSuccess: (data) => {
        setAllSignals(data.signals)
        setHasMore(data.has_more)
        setCursor(data.next_cursor)
      },
    }
  )

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || !cursor) return
    setIsLoadingMore(true)
    try {
      const res = await fetch(buildUrl(cursor))
      if (!res.ok) throw new Error('Failed to load more')
      const data: SignalFeedResponse = await res.json()
      setAllSignals((prev) => [...prev, ...data.signals])
      setHasMore(data.has_more)
      setCursor(data.next_cursor)
    } finally {
      setIsLoadingMore(false)
    }
  }, [hasMore, isLoadingMore, cursor, buildUrl])

  const handleSetFilter = useCallback((newFilter: SignalFilter) => {
    setFilter(newFilter)
    setAllSignals([])
    setCursor(null)
    setHasMore(true)
  }, [])

  const handleSetAssetFilter = useCallback((asset: string | null) => {
    setAssetFilter(asset)
    setAllSignals([])
    setCursor(null)
    setHasMore(true)
  }, [])

  return {
    signals: allSignals,
    isLoading,
    error: error ?? null,
    filter,
    setFilter: handleSetFilter,
    assetFilter,
    setAssetFilter: handleSetAssetFilter,
    loadMore,
    hasMore,
    isLoadingMore,
    refresh: () => mutate(),
  }
}
