'use client'

import { Gear } from '@phosphor-icons/react'
import { EmptyState } from '@/components/shared/empty-state'

export default function SettingsPage() {
  return (
    <div className="p-[var(--space-page-x)]">
      <EmptyState
        icon={Gear}
        title="Settings"
        description="Account preferences, exchange connections, notification settings, and subscription management."
      />
    </div>
  )
}
