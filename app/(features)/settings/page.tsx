'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import { useSnaptrade } from '@/hooks/use-snaptrade'
import { logger } from '@/lib/logger'
import { AccountSection, Divider } from '@/components/settings/account-section'
import { ConnectionsSection } from '@/components/settings/connections-section'
import {
  NotificationsSection,
  DEFAULT_PREFERENCES,
  type NotificationPreferences,
} from '@/components/settings/notifications-section'
import { PelicanSection } from '@/components/settings/pelican-section'
import { PrivacySection } from '@/components/settings/privacy-section'
import { QuickLinksSection } from '@/components/settings/quick-links'

export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ResponseLength = 'concise' | 'detailed'

interface UserProfile {
  email: string
  displayName: string
  memberSince: string
  plan: 'FREE' | 'LITE' | 'PORTAL' | 'PRO'
  experienceLevel: string | null
  responseLength: ResponseLength
}

// ---------------------------------------------------------------------------
// Main Settings Page Content
// ---------------------------------------------------------------------------

function SettingsPageContent() {
  const router = useRouter()
  const prefersReducedMotion = useReducedMotion()
  const supabaseRef = useRef<ReturnType<typeof createBrowserClient> | null>(null)
  function getSupabase() {
    if (!supabaseRef.current) {
      supabaseRef.current = createBrowserClient()
    }
    return supabaseRef.current
  }

  // ---- User profile state ----
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  // ---- Notification preferences ----
  const [notifPrefs, setNotifPrefs] = useState<NotificationPreferences>(DEFAULT_PREFERENCES)
  const [isLoadingNotifs, setIsLoadingNotifs] = useState(true)
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  // ---- Response length ----
  const [responseLength, setResponseLength] = useState<ResponseLength>('detailed')

  // ---- Delete account ----
  const [isDeleting, setIsDeleting] = useState(false)

  // ---- SnapTrade connections ----
  const { connections, isLoading: connectionsLoading, connect, sync, disconnect, isSyncing } = useSnaptrade()

  // ---- Load user profile ----
  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await getSupabase().auth.getUser()
        if (!user) return

        const { data: credits } = await getSupabase()
          .from('user_credits')
          .select('plan_type')
          .eq('user_id', user.id)
          .single()

        const meta = user.user_metadata ?? {}
        const plan = (credits?.plan_type as UserProfile['plan']) ?? 'FREE'
        const rl = (meta.response_length as ResponseLength) ?? 'detailed'

        setProfile({
          email: user.email ?? '',
          displayName: meta.display_name ?? meta.full_name ?? '',
          memberSince: user.created_at,
          plan,
          experienceLevel: meta.experience_level ?? null,
          responseLength: rl,
        })
        setResponseLength(rl)
      } catch (err) {
        logger.error('Failed to load user profile', {
          error: err instanceof Error ? err.message : 'Unknown',
        })
      } finally {
        setIsLoadingProfile(false)
      }
    }
    loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- Load notification preferences ----
  useEffect(() => {
    async function loadNotifs() {
      try {
        const { data: { user } } = await getSupabase().auth.getUser()
        if (!user) return

        const { data } = await getSupabase()
          .from('notification_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (data) {
          setNotifPrefs({
            daily_brief: data.daily_brief ?? true,
            funding_rate: data.funding_rate ?? true,
            whale_moves: data.whale_moves ?? true,
            analyst_calls: data.analyst_calls ?? true,
            price_levels: data.price_levels ?? true,
            calendar_events: data.calendar_events ?? true,
            trading_rule_violations: data.trading_rule_violations ?? true,
            correlation: data.correlation ?? false,
          })
        }
      } catch (err) {
        logger.error('Failed to load notification preferences', {
          error: err instanceof Error ? err.message : 'Unknown',
        })
      } finally {
        setIsLoadingNotifs(false)
      }
    }
    loadNotifs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- Save display name ----
  const saveDisplayName = useCallback(async (name: string) => {
    try {
      const { error } = await getSupabase().auth.updateUser({
        data: { display_name: name },
      })
      if (error) throw error
      setProfile((prev) => prev ? { ...prev, displayName: name } : prev)
    } catch (err) {
      logger.error('Failed to update display name', {
        error: err instanceof Error ? err.message : 'Unknown',
      })
    }
  }, [])

  // ---- Toggle notification pref ----
  const toggleNotifPref = useCallback(
    (key: keyof NotificationPreferences) => {
      const newVal = !notifPrefs[key]
      setNotifPrefs((prev) => ({ ...prev, [key]: newVal }))

      if (debounceTimers.current[key]) {
        clearTimeout(debounceTimers.current[key])
      }

      debounceTimers.current[key] = setTimeout(async () => {
        try {
          const { data: { user } } = await getSupabase().auth.getUser()
          if (!user) return

          const { error } = await getSupabase()
            .from('notification_preferences')
            .upsert(
              { user_id: user.id, [key]: newVal },
              { onConflict: 'user_id' }
            )

          if (error) {
            setNotifPrefs((prev) => ({ ...prev, [key]: !newVal }))
            logger.error('Failed to save notification preference', {
              key,
              error: error.message,
            })
          }
        } catch (err) {
          setNotifPrefs((prev) => ({ ...prev, [key]: !newVal }))
          logger.error('Failed to save notification preference', {
            key,
            error: err instanceof Error ? err.message : 'Unknown',
          })
        }
      }, 500)
    },
    [notifPrefs]
  )

  // ---- Save response length ----
  const saveResponseLength = useCallback(
    async (length: ResponseLength) => {
      setResponseLength(length)
      try {
        const { error } = await getSupabase().auth.updateUser({
          data: { response_length: length },
        })
        if (error) throw error
        setProfile((prev) => prev ? { ...prev, responseLength: length } : prev)
      } catch (err) {
        logger.error('Failed to save response length preference', {
          error: err instanceof Error ? err.message : 'Unknown',
        })
        setResponseLength(profile?.responseLength ?? 'detailed')
      }
    },
    [profile?.responseLength]
  )

  // ---- Delete account ----
  const handleDeleteAccount = useCallback(async () => {
    setIsDeleting(true)
    try {
      const res = await fetch('/api/account/delete', { method: 'POST' })
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error ?? 'Failed to delete account')
      }
      await getSupabase().auth.signOut()
      router.push('/')
    } catch (err) {
      logger.error('Account deletion failed', {
        error: err instanceof Error ? err.message : 'Unknown',
      })
      setIsDeleting(false)
    }
  }, [router])

  // ---- Loading shimmer ----
  if (isLoadingProfile) {
    return (
      <div className="max-w-[640px] mx-auto" style={{ padding: 'var(--space-page-x)' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="mb-6">
            <div className="h-3 w-24 rounded mb-3 shimmer" />
            <div className="h-10 rounded-lg shimmer" />
          </div>
        ))}
      </div>
    )
  }

  const motionProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 8 } as const,
        animate: { opacity: 1, y: 0 } as const,
        transition: { duration: 0.3 } as const,
      }

  return (
    <div className="max-w-[640px] mx-auto px-[var(--space-page-x)] py-[var(--space-page-y)]">
      <motion.div {...motionProps}>
        <AccountSection
          profile={profile}
          onSaveDisplayName={saveDisplayName}
        />

        <Divider />

        <ConnectionsSection
          connections={connections}
          connectionsLoading={connectionsLoading}
          onConnect={connect}
          onSync={sync}
          onDisconnect={disconnect}
          isSyncing={isSyncing}
        />

        <Divider />

        <NotificationsSection
          notifPrefs={notifPrefs}
          isLoadingNotifs={isLoadingNotifs}
          onToggle={toggleNotifPref}
        />

        <Divider />

        <PelicanSection
          experienceLevel={profile?.experienceLevel ?? null}
          responseLength={responseLength}
          onSaveResponseLength={saveResponseLength}
        />

        <Divider />

        <PrivacySection
          onDeleteAccount={handleDeleteAccount}
          isDeleting={isDeleting}
        />

        <Divider />

        <QuickLinksSection />
      </motion.div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Export with Suspense boundary
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[640px] mx-auto" style={{ padding: 'var(--space-page-x)' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="mb-6">
              <div className="h-3 w-24 rounded mb-3 shimmer" />
              <div className="h-10 rounded-lg shimmer" />
            </div>
          ))}
        </div>
      }
    >
      <SettingsPageContent />
    </Suspense>
  )
}
