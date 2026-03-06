'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'

type PlanType = 'free' | 'lite' | 'pro' | 'bundle'

interface CreditsContextValue {
  creditsBalance: number
  planType: PlanType
  freeQuestionsRemaining: number
  loading: boolean
  canUseFeature: (feature: string) => boolean
  refresh: () => Promise<void>
}

const CreditsContext = createContext<CreditsContextValue>({
  creditsBalance: 0,
  planType: 'free',
  freeQuestionsRemaining: 10,
  loading: true,
  canUseFeature: () => false,
  refresh: async () => {},
})

// Features available per plan
const PLAN_FEATURES: Record<PlanType, string[]> = {
  free: ['portfolio', 'daily-brief', 'education', 'community'],
  lite: ['portfolio', 'daily-brief', 'education', 'community', 'signals', 'watchlist', 'calendar'],
  pro: ['portfolio', 'daily-brief', 'education', 'community', 'signals', 'watchlist', 'calendar', 'pelican-unlimited', 'smart-notifications', 'performance-metrics'],
  bundle: ['portfolio', 'daily-brief', 'education', 'community', 'signals', 'watchlist', 'calendar', 'pelican-unlimited', 'smart-notifications', 'performance-metrics', 'api-access'],
}

export function CreditsProvider({ children }: { children: React.ReactNode }) {
  const [creditsBalance, setCreditsBalance] = useState(0)
  const [planType, setPlanType] = useState<PlanType>('free')
  const [freeQuestionsRemaining, setFreeQuestionsRemaining] = useState(10)
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient()

  const refresh = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data: credits } = await supabase
        .from('user_credits')
        .select('credits_balance, plan_type, free_questions_remaining')
        .eq('user_id', user.id)
        .single()

      if (credits) {
        setCreditsBalance(credits.credits_balance ?? 0)
        setPlanType((credits.plan_type as PlanType) ?? 'free')
        setFreeQuestionsRemaining(credits.free_questions_remaining ?? 10)
      }
    } catch {
      // Fail silently — defaults to free tier
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    refresh()
  }, [refresh])

  const canUseFeature = useCallback(
    (feature: string) => {
      const features = PLAN_FEATURES[planType] ?? PLAN_FEATURES.free
      return features.includes(feature)
    },
    [planType]
  )

  return (
    <CreditsContext.Provider
      value={{
        creditsBalance,
        planType,
        freeQuestionsRemaining,
        loading,
        canUseFeature,
        refresh,
      }}
    >
      {children}
    </CreditsContext.Provider>
  )
}

export const useCredits = () => useContext(CreditsContext)
