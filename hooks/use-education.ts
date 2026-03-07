'use client'

import useSWR from 'swr'
import { useState, useCallback } from 'react'
import type {
  EducationModule,
  EducationProgress,
  EducationOverview,
} from '@/types/education'

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error('Failed to fetch education data')
    return r.json()
  })

export interface UseEducationReturn {
  overview: EducationOverview | null
  isLoading: boolean
  error: Error | null
  activeModule: EducationModule | null
  activeProgress: EducationProgress | null
  isLoadingModule: boolean
  loadModule: (slug: string) => Promise<void>
  clearActiveModule: () => void
  startModule: (slug: string) => Promise<void>
  completeModule: (slug: string, quizScore?: number) => Promise<void>
  recommendedNext: string | null
}

export function useEducation(): UseEducationReturn {
  const [activeModule, setActiveModule] = useState<EducationModule | null>(null)
  const [activeProgress, setActiveProgress] = useState<EducationProgress | null>(null)
  const [isLoadingModule, setIsLoadingModule] = useState(false)

  const {
    data: overview,
    isLoading,
    error,
    mutate,
  } = useSWR<EducationOverview>('/api/education?mock=true', fetcher, {
    revalidateOnFocus: false,
  })

  const loadModule = useCallback(
    async (slug: string) => {
      setIsLoadingModule(true)
      try {
        const res = await fetch(`/api/education/${slug}?mock=true`)
        if (!res.ok) throw new Error('Failed to load module')
        const data = await res.json()
        setActiveModule(data.module)
        setActiveProgress(data.progress ?? null)
      } finally {
        setIsLoadingModule(false)
      }
    },
    []
  )

  const clearActiveModule = useCallback(() => {
    setActiveModule(null)
    setActiveProgress(null)
  }, [])

  const startModule = useCallback(
    async (slug: string) => {
      try {
        await fetch(`/api/education/${slug}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'start' }),
        })
        await mutate()
      } catch {
        // Silently fail — mock mode may not support POST
      }
    },
    [mutate]
  )

  const completeModule = useCallback(
    async (slug: string, quizScore?: number) => {
      try {
        await fetch(`/api/education/${slug}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'complete', quiz_score: quizScore }),
        })
        await mutate()
      } catch {
        // Silently fail — mock mode may not support POST
      }
    },
    [mutate]
  )

  const recommendedNext = overview?.recommendedNext ?? null

  return {
    overview: overview ?? null,
    isLoading,
    error: error ?? null,
    activeModule,
    activeProgress,
    isLoadingModule,
    loadModule,
    clearActiveModule,
    startModule,
    completeModule,
    recommendedNext,
  }
}
