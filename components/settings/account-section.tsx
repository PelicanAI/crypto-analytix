'use client'

import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  PencilSimple,
  Check,
} from '@phosphor-icons/react'
import { formatDate } from '@/lib/formatters'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PlanType = 'FREE' | 'LITE' | 'PORTAL' | 'PRO'

interface UserProfile {
  email: string
  displayName: string
  memberSince: string
  plan: PlanType
  experienceLevel: string | null
  responseLength: 'concise' | 'detailed'
}

// ---------------------------------------------------------------------------
// Plan Badge (SeverityTag style)
// ---------------------------------------------------------------------------

function PlanBadge({ plan }: { plan: PlanType }) {
  const styles: Record<string, { bg: string; color: string; border: string }> = {
    FREE: {
      bg: 'rgba(107,114,128,0.12)',
      color: 'var(--text-muted)',
      border: '1px solid rgba(107,114,128,0.20)',
    },
    LITE: {
      bg: 'rgba(59,130,246,0.12)',
      color: '#60a5fa',
      border: '1px solid rgba(59,130,246,0.20)',
    },
    PORTAL: {
      bg: 'var(--accent-muted)',
      color: 'var(--accent-primary)',
      border: `1px solid color-mix(in srgb, var(--accent-primary) 20%, transparent)`,
    },
    PRO: {
      bg: 'var(--accent-primary)',
      color: '#fff',
      border: 'none',
    },
  }
  const s = styles[plan] ?? styles.FREE

  return (
    <span
      className="inline-flex items-center px-[7px] py-[2px] rounded text-[9px] font-semibold uppercase tracking-wider"
      style={{
        backgroundColor: s.bg,
        color: s.color,
        border: s.border,
        ...(plan === 'PRO' ? { background: 'var(--accent-gradient)' } : {}),
      }}
    >
      {plan}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Section Heading (shared)
// ---------------------------------------------------------------------------

export function SectionHeading({ children }: { children: React.ReactNode }) {
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
// Divider (shared)
// ---------------------------------------------------------------------------

export function Divider() {
  return (
    <hr
      className="my-8 border-0 h-px"
      style={{ backgroundColor: 'var(--border-subtle)' }}
    />
  )
}

// ---------------------------------------------------------------------------
// Account Section
// ---------------------------------------------------------------------------

interface AccountSectionProps {
  profile: UserProfile | null
  onSaveDisplayName: (name: string) => Promise<void>
}

export function AccountSection({ profile, onSaveDisplayName }: AccountSectionProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [editNameValue, setEditNameValue] = useState(profile?.displayName ?? '')
  const [nameSaveSuccess, setNameSaveSuccess] = useState(false)
  const nameInputRef = useRef<HTMLInputElement>(null)

  const saveDisplayName = useCallback(async () => {
    const trimmed = editNameValue.trim()
    if (!trimmed || trimmed === profile?.displayName) {
      setIsEditingName(false)
      return
    }

    await onSaveDisplayName(trimmed)
    setIsEditingName(false)
    setNameSaveSuccess(true)
    setTimeout(() => setNameSaveSuccess(false), 2000)
  }, [editNameValue, profile?.displayName, onSaveDisplayName])

  return (
    <section>
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
              className="text-sm px-2 py-1 rounded-md outline-none text-right w-40 transition-colors duration-150"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--accent-muted)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-primary)')}
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
    </section>
  )
}
