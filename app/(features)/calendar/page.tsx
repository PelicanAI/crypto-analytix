'use client'

import { CalendarBlank } from '@phosphor-icons/react'
import { EmptyState } from '@/components/shared/empty-state'

export default function CalendarPage() {
  return (
    <div className="p-[var(--space-page-x)]">
      <EmptyState
        icon={CalendarBlank}
        title="Crypto Calendar"
        description="Token unlocks, governance votes, Fed meetings, and major expirations -- all in one view."
      />
    </div>
  )
}
