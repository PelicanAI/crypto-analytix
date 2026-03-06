'use client'

import { Eye } from '@phosphor-icons/react'
import { EmptyState } from '@/components/shared/empty-state'

export default function WatchlistPage() {
  return (
    <div className="p-[var(--space-page-x)]">
      <EmptyState
        icon={Eye}
        title="Watchlist"
        description="Track assets with intelligent alerts for funding rates, whale activity, and analyst calls."
      />
    </div>
  )
}
