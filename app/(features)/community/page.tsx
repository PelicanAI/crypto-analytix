'use client'

import { ChatCircle } from '@phosphor-icons/react'
import { EmptyState } from '@/components/shared/empty-state'

export default function CommunityPage() {
  return (
    <div className="p-[var(--space-page-x)]">
      <EmptyState
        icon={ChatCircle}
        title="Community Chat"
        description="Connect with TradFi traders learning crypto. Analyst Q&A and Pelican AI support."
      />
    </div>
  )
}
