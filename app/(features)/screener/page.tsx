'use client'

import { MagnifyingGlass } from '@phosphor-icons/react'

export default function ScreenerPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <MagnifyingGlass size={48} weight="thin" className="text-[var(--accent-primary)] mb-4" />
      <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Token Screener</h1>
      <p className="text-[14px] text-[var(--text-secondary)] max-w-md">
        Screen and filter crypto tokens by derivatives data, funding rates, volume, and Pelican signals. Coming soon.
      </p>
    </div>
  )
}
