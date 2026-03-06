'use client'

import { Wallet } from '@phosphor-icons/react'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { EmptyState } from '@/components/shared/empty-state'

export default function PortfolioPage() {
  return (
    <div className="p-[var(--space-page-x)]">
      {/* Loading skeleton demo */}
      <div className="mb-8">
        <LoadingSkeleton variant="card" count={3} />
      </div>

      {/* Empty state */}
      <EmptyState
        icon={Wallet}
        title="Connect Your Exchange"
        description="Link your Kraken, Coinbase, or other exchange account to see your portfolio here."
        actionLabel="Connect Exchange"
        onAction={() => {}}
      />
    </div>
  )
}
