'use client'

import { Newspaper } from '@phosphor-icons/react'
import { EmptyState } from '@/components/shared/empty-state'

export default function BriefPage() {
  return (
    <div className="p-[var(--space-page-x)]">
      <EmptyState
        icon={Newspaper}
        title="Daily Brief"
        description="Your personalized morning market briefing will appear here at 6 AM ET."
      />
    </div>
  )
}
