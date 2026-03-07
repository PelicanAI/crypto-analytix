'use client'

import { useState, useCallback } from 'react'
import useSWR from 'swr'
import { createBrowserClient } from '@supabase/ssr'
import { usePortfolio } from '@/hooks/use-portfolio'
import type { SnapTradeConnection } from '@/types/portfolio'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseSnapTradeReturn {
  connections: SnapTradeConnection[]
  isLoading: boolean
  isConnecting: boolean
  isSyncing: boolean
  connect: (broker?: string) => Promise<void>
  sync: () => Promise<void>
  disconnect: (connectionId: string) => Promise<void>
}

// ---------------------------------------------------------------------------
// Fetcher — reads snaptrade_connections via Supabase client
// ---------------------------------------------------------------------------

async function connectionsFetcher(): Promise<SnapTradeConnection[]> {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('snaptrade_connections')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return []
  return (data as SnapTradeConnection[]) ?? []
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useSnaptrade(): UseSnapTradeReturn {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const { refresh: refreshPortfolio } = usePortfolio()

  const {
    data: connections,
    isLoading,
    mutate: mutateConnections,
  } = useSWR<SnapTradeConnection[]>(
    'snaptrade-connections',
    connectionsFetcher,
    { revalidateOnFocus: true }
  )

  const connect = useCallback(
    async (broker?: string) => {
      setIsConnecting(true)
      try {
        const body: Record<string, string> = {}
        if (broker) body.broker = broker

        const res = await fetch('/api/snaptrade/connect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })

        if (!res.ok) return

        const { redirectUrl } = await res.json()
        if (redirectUrl) {
          window.open(redirectUrl, '_blank', 'width=800,height=700')
        }
      } finally {
        setIsConnecting(false)
      }
    },
    []
  )

  const sync = useCallback(async () => {
    setIsSyncing(true)
    try {
      await fetch('/api/snaptrade/sync', { method: 'POST' })
      await mutateConnections()
      refreshPortfolio()
    } finally {
      setIsSyncing(false)
    }
  }, [mutateConnections, refreshPortfolio])

  const disconnect = useCallback(
    async (connectionId: string) => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      await supabase
        .from('snaptrade_connections')
        .delete()
        .eq('id', connectionId)

      await mutateConnections()
    },
    [mutateConnections]
  )

  return {
    connections: connections ?? [],
    isLoading,
    isConnecting,
    isSyncing,
    connect,
    sync,
    disconnect,
  }
}
