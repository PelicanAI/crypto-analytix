'use client'

import { GraduationCap } from '@phosphor-icons/react'
import { EmptyState } from '@/components/shared/empty-state'

export default function LearnPage() {
  return (
    <div className="p-[var(--space-page-x)]">
      <EmptyState
        icon={GraduationCap}
        title="Education Modules"
        description="Learn crypto concepts explained through TradFi analogs you already understand."
      />
    </div>
  )
}
