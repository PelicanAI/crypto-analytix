'use client'

import useSWR from 'swr'
import { useSearchParams } from 'next/navigation'
import { REFRESH_INTERVALS } from '@/lib/constants'
import type { CryptoPosition } from '@/types/portfolio'
import type { FundingRateData } from '@/lib/coinalyze'

// ---------------------------------------------------------------------------
// Types — exported for use by UI components
// ---------------------------------------------------------------------------

export interface EnrichedPosition extends CryptoPosition {
  funding_rate?: FundingRateData
  sparkline?: number[]
  price_change_24h?: number
}

export interface EnrichedPortfolioResponse {
  total_value: number
  total_pnl: number
  total_pnl_pct: number
  btc_correlation: number | null
  positions: EnrichedPosition[]
  last_updated: string
  is_stale: boolean
  top_performer: { asset: string; change_24h: number } | null
}

export interface UsePortfolioReturn {
  portfolio: EnrichedPortfolioResponse | null
  isLoading: boolean
  error: Error | null
  isStale: boolean
  isDemoMode: boolean
  refresh: () => void
  lastUpdated: string | null
}

// ---------------------------------------------------------------------------
// Fetcher
// ---------------------------------------------------------------------------

async function portfolioFetcher(url: string): Promise<EnrichedPortfolioResponse> {
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Portfolio fetch failed: ${res.status}`)
  }
  return res.json()
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function usePortfolio(): UsePortfolioReturn {
  const searchParams = useSearchParams()
  const isDemoMode = searchParams.get('mock') === 'true'

  const url = isDemoMode ? '/api/portfolio?mock=true' : '/api/portfolio'

  const { data, error, isLoading, mutate } = useSWR<EnrichedPortfolioResponse>(
    url,
    portfolioFetcher,
    {
      refreshInterval: REFRESH_INTERVALS.portfolio,
      revalidateOnFocus: true,
      // Keep stale data on error — show cached with isStale flag
      keepPreviousData: true,
    }
  )

  return {
    portfolio: data ?? null,
    isLoading,
    error: error ?? null,
    // Stale if the API says so, OR if SWR errored but we have cached data
    isStale: data?.is_stale === true || (!!error && !!data),
    isDemoMode,
    refresh: () => mutate(),
    lastUpdated: data?.last_updated ?? null,
  }
}
