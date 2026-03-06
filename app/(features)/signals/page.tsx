'use client'

import { Lightning } from '@phosphor-icons/react'
import { EmptyState } from '@/components/shared/empty-state'

export default function SignalsPage() {
  return (
    <div className="p-[var(--space-page-x)]">
      <EmptyState
        icon={Lightning}
        title="Signals Coming Soon"
        description="Analyst calls, CT translations, and smart money alerts will appear here."
      />
    </div>
  )
}
