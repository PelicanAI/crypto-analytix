'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import type { OnboardingResponses } from '@/types/education'

interface UseOnboardingReturn {
  step: number
  responses: OnboardingResponses
  isSubmitting: boolean
  error: string | null
  setTradingBackground: (backgrounds: string[]) => void
  setCryptoFamiliarity: (level: string) => void
  setInterests: (interests: string[]) => void
  nextStep: () => void
  prevStep: () => void
  submit: () => Promise<void>
  skip: () => Promise<void>
}

const TOTAL_STEPS = 3

export function useOnboarding(): UseOnboardingReturn {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [responses, setResponses] = useState<OnboardingResponses>({
    experience_level: '',
    trading_background: [],
    crypto_familiarity: '',
    interests: [],
  })

  const setTradingBackground = useCallback((backgrounds: string[]) => {
    setResponses((prev) => ({ ...prev, trading_background: backgrounds }))
  }, [])

  const setCryptoFamiliarity = useCallback((level: string) => {
    setResponses((prev) => ({ ...prev, crypto_familiarity: level }))
  }, [])

  const setInterests = useCallback((interests: string[]) => {
    setResponses((prev) => ({ ...prev, interests }))
  }, [])

  const isStepValid = useCallback((): boolean => {
    switch (step) {
      case 0:
        return responses.trading_background.length > 0
      case 1:
        return responses.crypto_familiarity !== ''
      case 2:
        return responses.interests.length > 0
      default:
        return false
    }
  }, [step, responses])

  const nextStep = useCallback(() => {
    if (!isStepValid()) return
    if (step < TOTAL_STEPS - 1) {
      setStep((prev) => prev + 1)
      setError(null)
    }
  }, [step, isStepValid])

  const prevStep = useCallback(() => {
    if (step > 0) {
      setStep((prev) => prev - 1)
      setError(null)
    }
  }, [step])

  const submit = useCallback(async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError('Not authenticated. Please sign in again.')
        setIsSubmitting(false)
        return
      }

      // Derive experience_level from trading_background
      const experienceLevel =
        responses.trading_background.length === 0 ? 'beginner' : 'experienced-tradfi'

      const finalResponses: OnboardingResponses = {
        ...responses,
        experience_level: experienceLevel,
      }

      // Save onboarding responses
      await supabase.from('onboarding_responses').upsert(
        {
          user_id: user.id,
          ...finalResponses,
          completed_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )

      // Mark onboarding complete
      await supabase
        .from('user_credits')
        .update({
          onboarding_complete: true,
          experience_level: experienceLevel,
        })
        .eq('user_id', user.id)

      router.push('/portfolio')
    } catch {
      setError('Something went wrong. Please try again.')
      setIsSubmitting(false)
    }
  }, [isSubmitting, responses, router])

  const skip = useCallback(async () => {
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        await supabase
          .from('user_credits')
          .update({ onboarding_complete: true })
          .eq('user_id', user.id)
      }

      router.push('/portfolio')
    } catch {
      // Best effort — still redirect
      router.push('/portfolio')
    }
  }, [isSubmitting, router])

  return {
    step,
    responses,
    isSubmitting,
    error,
    setTradingBackground,
    setCryptoFamiliarity,
    setInterests,
    nextStep,
    prevStep,
    submit,
    skip,
  }
}
