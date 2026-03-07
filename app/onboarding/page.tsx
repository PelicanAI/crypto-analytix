'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function OnboardingPage() {
  const router = useRouter()
  const [isSkipping, setIsSkipping] = useState(false)

  async function handleSkip() {
    setIsSkipping(true)
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('user_credits')
          .update({ onboarding_complete: true })
          .eq('user_id', user.id)
      }
      router.push('/portfolio')
    } catch {
      router.push('/portfolio')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8" style={{ backgroundColor: 'var(--bg-base)' }}>
      <h1 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
        Welcome to Crypto Analytix
      </h1>
      <p className="mb-8 text-center max-w-md" style={{ color: 'var(--text-secondary)' }}>
        Onboarding flow coming soon. Skip for now to explore the portfolio view.
      </p>
      <button
        onClick={handleSkip}
        disabled={isSkipping}
        className="px-6 py-3 rounded-lg font-medium transition-colors"
        style={{
          backgroundColor: isSkipping ? 'var(--bg-elevated)' : 'var(--accent-primary)',
          color: 'var(--text-primary)',
          opacity: isSkipping ? 0.6 : 1,
          cursor: isSkipping ? 'not-allowed' : 'pointer',
        }}
      >
        {isSkipping ? 'Redirecting...' : 'Skip for now'}
      </button>
    </div>
  )
}
