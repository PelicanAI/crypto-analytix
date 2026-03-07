'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  PencilSimple,
  Check,
  ArrowsClockwise,
  Warning,
  CaretRight,
  LinkBreak,
  Plus,
  Bell,
  ChartLine,
  Heartbeat,
  CurrencyDollar,
  CalendarBlank,
  Scales,
  TrendUp,
  Waves,
  Export,
  Trash,
  UserCircle,
} from '@phosphor-icons/react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useSnaptrade } from '@/hooks/use-snaptrade'
import { formatDate, formatTimeAgo } from '@/lib/formatters'
import { logger } from '@/lib/logger'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NotificationPreferences {
  daily_brief: boolean
  funding_rate: boolean
  whale_moves: boolean
  analyst_calls: boolean
  price_levels: boolean
  calendar_events: boolean
  trading_rule_violations: boolean
  correlation: boolean
}

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
// Notification toggle config
// ---------------------------------------------------------------------------

const NOTIFICATION_TOGGLES: {
  key: keyof NotificationPreferences
  label: string
  description: string
  icon: typeof Bell
}[] = [
  { key: 'daily_brief', label: 'Daily Brief', description: 'Pelican Market Pulse delivered at 6 AM ET', icon: Bell },
  { key: 'funding_rate', label: 'Funding Rate Alerts', description: 'When funding rates cross your thresholds', icon: ChartLine },
  { key: 'whale_moves', label: 'Whale Moves', description: 'Smart money wallet activity on your held assets', icon: Waves },
  { key: 'analyst_calls', label: 'Analyst Calls', description: 'New analysis from Blake, Grega, and Ryan on your holdings', icon: Heartbeat },
  { key: 'price_levels', label: 'Price Alerts', description: 'Key price level breaches for watched assets', icon: CurrencyDollar },
  { key: 'calendar_events', label: 'Calendar Events', description: 'Token unlocks, governance votes, expirations', icon: CalendarBlank },
  { key: 'trading_rule_violations', label: 'Trading Rule Violations', description: 'Alerts when trades breach your personal rules', icon: Scales },
  { key: 'correlation', label: 'Correlation Alerts', description: 'Portfolio correlation shifts beyond your thresholds', icon: TrendUp },
]

const DEFAULT_PREFERENCES: NotificationPreferences = {
  daily_brief: true,
  funding_rate: true,
  whale_moves: true,
  analyst_calls: true,
  price_levels: true,
  calendar_events: true,
  trading_rule_violations: true,
  correlation: false,
}

// ---------------------------------------------------------------------------
// Plan badge
// ---------------------------------------------------------------------------

function PlanBadge({ plan }: { plan: UserProfile['plan'] }) {
  const styles: Record<string, { bg: string; color: string; border?: string }> = {
    FREE: { bg: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' },
    LITE: { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa' },
    PORTAL: { bg: 'var(--accent-muted)', color: 'var(--accent-primary)' },
    PRO: { bg: 'var(--accent-primary)', color: '#fff' },
  }
  const s = styles[plan] ?? styles.FREE

  return (
    <span
      className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
      style={{
        backgroundColor: s.bg,
        color: s.color,
        ...(plan === 'PRO' ? { background: 'var(--accent-gradient)' } : {}),
      }}
    >
      {plan}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Toggle Switch
// ---------------------------------------------------------------------------

function ToggleSwitch({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean
  onChange: (val: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="relative inline-flex flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        width: 44,
        height: 24,
        backgroundColor: checked ? 'var(--accent-primary)' : 'var(--bg-elevated)',
      }}
    >
      <span
        className="pointer-events-none inline-block rounded-full shadow-sm transition-transform duration-200 ease-in-out"
        style={{
          width: 18,
          height: 18,
          marginTop: 3,
          marginLeft: checked ? 23 : 3,
          backgroundColor: '#fff',
        }}
      />
    </button>
  )
}

// ---------------------------------------------------------------------------
// Section heading
// ---------------------------------------------------------------------------

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-[11px] uppercase font-medium mb-4"
      style={{ color: 'var(--text-muted)', letterSpacing: '1.5px' }}
    >
      {children}
    </h2>
  )
}

// ---------------------------------------------------------------------------
// Divider
// ---------------------------------------------------------------------------

function Divider() {
  return (
    <hr
      className="my-8 border-0 h-px"
      style={{ backgroundColor: 'var(--border-subtle)' }}
    />
  )
}

// ---------------------------------------------------------------------------
// Delete Account Modal
// ---------------------------------------------------------------------------

function DeleteAccountModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isDeleting: boolean
}) {
  const [confirmText, setConfirmText] = useState('')

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ backgroundColor: 'var(--bg-overlay)' }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-full max-w-md rounded-2xl p-6"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(239,68,68,0.12)' }}
                >
                  <Warning size={20} weight="fill" style={{ color: 'var(--data-negative)' }} />
                </div>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Delete Account
                </h3>
              </div>

              <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                This action is permanent and cannot be undone. All your data, including portfolio history, saved insights, and Pelican conversation history will be permanently deleted.
              </p>

              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                Type <span className="font-mono font-semibold" style={{ color: 'var(--data-negative)' }}>DELETE</span> to confirm.
              </p>

              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE"
                className="w-full px-3 py-2.5 rounded-lg text-sm font-mono outline-none transition-colors duration-150 mb-4"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--border-hover)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-default)')}
                autoComplete="off"
              />

              <div className="flex gap-3 justify-end">
                <button
                  onClick={onClose}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors duration-150"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-elevated)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={confirmText !== 'DELETE' || isDeleting}
                  className="px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: confirmText === 'DELETE' ? 'var(--data-negative)' : 'rgba(239,68,68,0.2)',
                    color: '#fff',
                  }}
                >
                  {isDeleting ? 'Deleting...' : 'Delete My Account'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ---------------------------------------------------------------------------
// Connection Card
// ---------------------------------------------------------------------------

function ConnectionCard({
  connection,
  onSync,
  onDisconnect,
  isSyncing,
}: {
  connection: { id: string; broker_name: string; status: string; account_ids: string[]; last_sync: string | null }
  onSync: () => void
  onDisconnect: (id: string) => void
  isSyncing: boolean
}) {
  const [showConfirm, setShowConfirm] = useState(false)
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleDisconnectClick = () => {
    setShowConfirm(true)
    if (confirmTimer.current) clearTimeout(confirmTimer.current)
    confirmTimer.current = setTimeout(() => setShowConfirm(false), 5000)
  }

  const handleConfirm = () => {
    if (confirmTimer.current) clearTimeout(confirmTimer.current)
    onDisconnect(connection.id)
    setShowConfirm(false)
  }

  const statusDot = {
    active: 'var(--data-positive)',
    error: 'var(--data-negative)',
    revoked: 'var(--data-negative)',
    syncing: 'var(--data-warning)',
  }[connection.status] ?? 'var(--text-muted)'

  const statusLabel = {
    active: 'Connected',
    error: 'Error',
    revoked: 'Revoked',
    syncing: 'Syncing',
  }[connection.status] ?? connection.status

  return (
    <div
      className="rounded-xl p-4"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span
            className="text-sm font-semibold capitalize"
            style={{ color: 'var(--text-primary)' }}
          >
            {connection.broker_name}
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: statusDot }}
            />
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {statusLabel}
            </span>
          </div>
        </div>
      </div>

      {connection.account_ids.length > 0 && (
        <p className="text-[11px] font-mono mb-1" style={{ color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
          {connection.account_ids.length} account{connection.account_ids.length !== 1 ? 's' : ''}
        </p>
      )}

      {connection.last_sync && (
        <p className="text-[11px] mb-3" style={{ color: 'var(--text-muted)' }}>
          Last synced {formatTimeAgo(connection.last_sync)}
        </p>
      )}

      <AnimatePresence mode="wait">
        {showConfirm ? (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-2"
          >
            <span className="text-xs" style={{ color: 'var(--data-negative)' }}>
              Disconnect this exchange?
            </span>
            <button
              onClick={handleConfirm}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-colors duration-150"
              style={{ color: '#fff', backgroundColor: 'var(--data-negative)' }}
            >
              Confirm
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-colors duration-150"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              Cancel
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="actions"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-2"
          >
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                color: 'var(--accent-primary)',
                backgroundColor: 'var(--accent-dim)',
              }}
              onMouseEnter={(e) => {
                if (!isSyncing) e.currentTarget.style.backgroundColor = 'var(--accent-muted)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent-dim)'
              }}
            >
              <ArrowsClockwise
                size={14}
                className={isSyncing ? 'animate-spin' : ''}
              />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>

            <button
              onClick={handleDisconnectClick}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer transition-colors duration-150"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--data-negative)'
                e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)'
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <LinkBreak size={14} />
              Disconnect
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Quick Link Row
// ---------------------------------------------------------------------------

function QuickLinkRow({
  label,
  href,
  external,
}: {
  label: string
  href: string
  external?: boolean
}) {
  const router = useRouter()

  return (
    <button
      onClick={() => {
        if (external) {
          window.open(href, '_blank', 'noopener,noreferrer')
        } else {
          router.push(href)
        }
      }}
      className="flex items-center justify-between w-full py-3.5 px-4 rounded-lg cursor-pointer transition-colors duration-150"
      style={{ color: 'var(--text-secondary)' }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-elevated)')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      <span className="text-sm">{label}</span>
      <CaretRight size={16} style={{ color: 'var(--text-muted)' }} />
    </button>
  )
}

// ---------------------------------------------------------------------------
// Main Settings Page Content
// ---------------------------------------------------------------------------

function SettingsPageContent() {
  const router = useRouter()
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

  // ---- Display name editing ----
  const [isEditingName, setIsEditingName] = useState(false)
  const [editNameValue, setEditNameValue] = useState('')
  const [nameSaveSuccess, setNameSaveSuccess] = useState(false)
  const nameInputRef = useRef<HTMLInputElement>(null)

  // ---- Notification preferences ----
  const [notifPrefs, setNotifPrefs] = useState<NotificationPreferences>(DEFAULT_PREFERENCES)
  const [isLoadingNotifs, setIsLoadingNotifs] = useState(true)
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  // ---- Response length ----
  const [responseLength, setResponseLength] = useState<ResponseLength>('detailed')

  // ---- Delete account ----
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // ---- SnapTrade connections ----
  const { connections, isLoading: connectionsLoading, connect, sync, disconnect, isSyncing } = useSnaptrade()

  // ---- Load user profile ----
  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await getSupabase().auth.getUser()
        if (!user) return

        // Try to get plan from user_credits table
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
        setEditNameValue(meta.display_name ?? meta.full_name ?? '')
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
  const saveDisplayName = useCallback(async () => {
    const trimmed = editNameValue.trim()
    if (!trimmed || trimmed === profile?.displayName) {
      setIsEditingName(false)
      return
    }

    try {
      const { error } = await getSupabase().auth.updateUser({
        data: { display_name: trimmed },
      })
      if (error) throw error

      setProfile((prev) => prev ? { ...prev, displayName: trimmed } : prev)
      setIsEditingName(false)
      setNameSaveSuccess(true)
      setTimeout(() => setNameSaveSuccess(false), 2000)
    } catch (err) {
      logger.error('Failed to update display name', {
        error: err instanceof Error ? err.message : 'Unknown',
      })
    }
  }, [editNameValue, profile?.displayName])

  // ---- Toggle notification pref ----
  const toggleNotifPref = useCallback(
    (key: keyof NotificationPreferences) => {
      const newVal = !notifPrefs[key]

      // Instant visual update
      setNotifPrefs((prev) => ({ ...prev, [key]: newVal }))

      // Debounced save
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
            // Revert on error
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
        // Revert
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

  // ---- Experience level label ----
  const experienceLabel = profile?.experienceLevel
    ? {
        new: 'New to Trading',
        tradfi: 'Stocks, Forex, or Futures Trader',
        crypto: 'Crypto Trader',
      }[profile.experienceLevel] ?? profile.experienceLevel
    : 'Not set'

  // ---- Loading shimmer ----
  if (isLoadingProfile) {
    return (
      <div className="max-w-[640px] mx-auto" style={{ padding: 'var(--space-page-x)' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="mb-4">
            <div
              className="h-3 w-24 rounded mb-3 animate-pulse"
              style={{ backgroundColor: 'var(--bg-elevated)' }}
            />
            <div
              className="h-10 rounded-lg animate-pulse"
              style={{ backgroundColor: 'var(--bg-surface)' }}
            />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-[640px] mx-auto" style={{ padding: 'var(--space-page-x)' }}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* ================================================================ */}
        {/* Section 1: Account                                               */}
        {/* ================================================================ */}
        <SectionHeading>Account</SectionHeading>

        {/* Email */}
        <div className="flex items-center justify-between py-3">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Email</span>
          <span className="text-sm font-mono" style={{ color: 'var(--text-primary)' }}>
            {profile?.email ?? '--'}
          </span>
        </div>

        {/* Display Name */}
        <div className="flex items-center justify-between py-3">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Display Name</span>
          <div className="flex items-center gap-2">
            {isEditingName ? (
              <input
                ref={nameInputRef}
                type="text"
                value={editNameValue}
                onChange={(e) => setEditNameValue(e.target.value)}
                onBlur={saveDisplayName}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveDisplayName()
                  if (e.key === 'Escape') {
                    setEditNameValue(profile?.displayName ?? '')
                    setIsEditingName(false)
                  }
                }}
                autoFocus
                className="text-sm px-2 py-1 rounded-md outline-none text-right w-40"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-hover)',
                  color: 'var(--text-primary)',
                }}
              />
            ) : (
              <>
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                  {profile?.displayName || 'Not set'}
                </span>
                {nameSaveSuccess ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Check size={16} weight="bold" style={{ color: 'var(--data-positive)' }} />
                  </motion.div>
                ) : (
                  <button
                    onClick={() => {
                      setIsEditingName(true)
                      setTimeout(() => nameInputRef.current?.focus(), 50)
                    }}
                    className="p-1 rounded cursor-pointer transition-colors duration-150"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                    title="Edit display name"
                  >
                    <PencilSimple size={14} />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Member Since */}
        <div className="flex items-center justify-between py-3">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Member Since</span>
          <span
            className="text-sm font-mono"
            style={{ color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}
          >
            {profile?.memberSince ? formatDate(profile.memberSince) : '--'}
          </span>
        </div>

        {/* Plan */}
        <div className="flex items-center justify-between py-3">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Plan</span>
          {profile && <PlanBadge plan={profile.plan} />}
        </div>

        {/* Manage Subscription */}
        <div className="flex items-center justify-between py-3">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Subscription</span>
          <button
            disabled
            className="text-xs font-medium px-3 py-1.5 rounded-lg opacity-50 cursor-not-allowed"
            style={{
              color: 'var(--text-muted)',
              border: '1px solid var(--border-subtle)',
            }}
            title="Coming soon"
          >
            Manage Subscription
          </button>
        </div>

        <Divider />

        {/* ================================================================ */}
        {/* Section 2: Exchange Connections                                   */}
        {/* ================================================================ */}
        <SectionHeading>Exchange Connections</SectionHeading>

        {connectionsLoading ? (
          <div
            className="h-20 rounded-xl animate-pulse"
            style={{ backgroundColor: 'var(--bg-surface)' }}
          />
        ) : connections.length === 0 ? (
          <div
            className="rounded-xl p-6 text-center"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <UserCircle size={32} weight="thin" style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
            <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
              No exchanges connected
            </p>
            <button
              onClick={() => connect()}
              className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg cursor-pointer transition-colors duration-150"
              style={{
                color: 'var(--accent-primary)',
                backgroundColor: 'var(--accent-dim)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-muted)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-dim)')}
            >
              <Plus size={14} weight="bold" />
              Connect Exchange
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {connections.map((conn) => (
              <ConnectionCard
                key={conn.id}
                connection={conn}
                onSync={sync}
                onDisconnect={disconnect}
                isSyncing={isSyncing}
              />
            ))}
            <button
              onClick={() => connect()}
              className="flex items-center justify-center gap-1.5 text-xs font-medium py-2.5 rounded-lg cursor-pointer transition-colors duration-150"
              style={{ color: 'var(--text-muted)', border: '1px dashed var(--border-default)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--accent-primary)'
                e.currentTarget.style.borderColor = 'var(--accent-primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)'
                e.currentTarget.style.borderColor = 'var(--border-default)'
              }}
            >
              <Plus size={12} weight="bold" />
              Add Another Exchange
            </button>
          </div>
        )}

        <Divider />

        {/* ================================================================ */}
        {/* Section 3: Notification Preferences                              */}
        {/* ================================================================ */}
        <SectionHeading>Notification Preferences</SectionHeading>

        {isLoadingNotifs ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-12 rounded-lg animate-pulse"
                style={{ backgroundColor: 'var(--bg-surface)' }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col">
            {NOTIFICATION_TOGGLES.map((toggle) => (
              <div
                key={toggle.key}
                className="flex items-center justify-between py-3.5"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}
              >
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    {toggle.label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {toggle.description}
                  </p>
                </div>
                <ToggleSwitch
                  checked={notifPrefs[toggle.key]}
                  onChange={() => toggleNotifPref(toggle.key)}
                />
              </div>
            ))}
          </div>
        )}

        <Divider />

        {/* ================================================================ */}
        {/* Section 4: Pelican Preferences                                   */}
        {/* ================================================================ */}
        <SectionHeading>Pelican Preferences</SectionHeading>

        {/* Experience Level */}
        <div className="flex items-center justify-between py-3">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Experience Level</span>
          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
            {experienceLabel}
          </span>
        </div>

        {/* Update Profile Button */}
        <div className="flex items-center justify-between py-3">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Trading Profile</span>
          <button
            onClick={() => router.push('/onboarding')}
            className="text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer transition-colors duration-150"
            style={{
              color: 'var(--accent-primary)',
              backgroundColor: 'var(--accent-dim)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-muted)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-dim)')}
          >
            Update My Profile
          </button>
        </div>

        {/* Response Length */}
        <div className="py-3">
          <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>Response Length</p>
          <div className="flex gap-2">
            {(['concise', 'detailed'] as const).map((option) => {
              const isSelected = responseLength === option
              return (
                <button
                  key={option}
                  onClick={() => saveResponseLength(option)}
                  className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium capitalize cursor-pointer transition-all duration-200"
                  style={{
                    backgroundColor: isSelected ? 'var(--accent-dim)' : 'var(--bg-surface)',
                    border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                    color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'var(--border-hover)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)'
                    }
                  }}
                >
                  {option}
                </button>
              )
            })}
          </div>
        </div>

        <Divider />

        {/* ================================================================ */}
        {/* Section 5: Data & Privacy                                        */}
        {/* ================================================================ */}
        <SectionHeading>Data & Privacy</SectionHeading>

        {/* Export Data */}
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>Export My Data</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Download all your portfolio and insight data
            </p>
          </div>
          <button
            disabled
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg opacity-50 cursor-not-allowed"
            style={{
              color: 'var(--text-muted)',
              border: '1px solid var(--border-subtle)',
            }}
            title="Coming soon"
          >
            <Export size={14} />
            Export
          </button>
        </div>

        {/* Delete Account */}
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm" style={{ color: 'var(--data-negative)' }}>Delete Account</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Permanently delete your account and all data
            </p>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer transition-colors duration-150"
            style={{
              color: 'var(--data-negative)',
              border: '1px solid rgba(239,68,68,0.2)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <Trash size={14} />
            Delete
          </button>
        </div>

        {/* Privacy note */}
        <p
          className="text-xs italic mt-2"
          style={{ color: 'var(--text-muted)' }}
        >
          Your data is encrypted at rest and never shared with third parties. Exchange connections are read-only via SnapTrade — we never access your trading keys.
        </p>

        <Divider />

        {/* ================================================================ */}
        {/* Section 6: Quick Links                                           */}
        {/* ================================================================ */}
        <SectionHeading>Quick Links</SectionHeading>

        <div className="flex flex-col gap-0.5">
          <QuickLinkRow label="Watchlist & Alerts" href="/watchlist" />
          <QuickLinkRow label="Education Progress" href="/learn" />
          <QuickLinkRow label="Terms of Service" href="https://cryptoanalytix.com/terms" external />
        </div>

        {/* Version */}
        <p
          className="text-center text-[11px] mt-12 mb-8"
          style={{ color: 'var(--text-muted)' }}
        >
          Crypto Analytix v0.1.0
        </p>
      </motion.div>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        isDeleting={isDeleting}
      />
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
            <div key={i} className="mb-4">
              <div
                className="h-3 w-24 rounded mb-3 animate-pulse"
                style={{ backgroundColor: 'var(--bg-elevated)' }}
              />
              <div
                className="h-10 rounded-lg animate-pulse"
                style={{ backgroundColor: 'var(--bg-surface)' }}
              />
            </div>
          ))}
        </div>
      }
    >
      <SettingsPageContent />
    </Suspense>
  )
}
