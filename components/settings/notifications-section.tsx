'use client'

import {
  Bell,
  ChartLine,
  Heartbeat,
  CurrencyDollar,
  CalendarBlank,
  Scales,
  TrendUp,
  Waves,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { SectionHeading } from './account-section'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NotificationPreferences {
  daily_brief: boolean
  funding_rate: boolean
  whale_moves: boolean
  analyst_calls: boolean
  price_levels: boolean
  calendar_events: boolean
  trading_rule_violations: boolean
  correlation: boolean
}

export const DEFAULT_PREFERENCES: NotificationPreferences = {
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
// Toggle config
// ---------------------------------------------------------------------------

const NOTIFICATION_TOGGLES: {
  key: keyof NotificationPreferences
  label: string
  description: string
  icon: Icon
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
        width: 40,
        height: 22,
        minWidth: 40,
        backgroundColor: checked ? 'var(--accent-primary)' : 'var(--bg-elevated)',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <span
        className="pointer-events-none inline-block rounded-full shadow-sm transition-transform duration-200 ease-in-out"
        style={{
          width: 16,
          height: 16,
          marginLeft: checked ? 21 : 3,
          backgroundColor: '#fff',
        }}
      />
    </button>
  )
}

// ---------------------------------------------------------------------------
// Notifications Section
// ---------------------------------------------------------------------------

interface NotificationsSectionProps {
  notifPrefs: NotificationPreferences
  isLoadingNotifs: boolean
  onToggle: (key: keyof NotificationPreferences) => void
}

export function NotificationsSection({
  notifPrefs,
  isLoadingNotifs,
  onToggle,
}: NotificationsSectionProps) {
  return (
    <section>
      <SectionHeading>Notification Preferences</SectionHeading>

      {isLoadingNotifs ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-12 rounded-lg shimmer"
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col">
          {NOTIFICATION_TOGGLES.map((toggle) => {
            const IconComp = toggle.icon
            return (
              <div
                key={toggle.key}
                className="flex items-center justify-between py-3.5"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
                  <IconComp
                    size={16}
                    weight="regular"
                    style={{ color: 'var(--text-muted)', flexShrink: 0 }}
                  />
                  <div className="min-w-0">
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                      {toggle.label}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {toggle.description}
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  checked={notifPrefs[toggle.key]}
                  onChange={() => onToggle(toggle.key)}
                />
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
