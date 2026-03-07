'use client'

import { Bell } from '@phosphor-icons/react'

export default function AlertsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <Bell size={48} weight="thin" className="text-[var(--accent-primary)] mb-4" />
      <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-2">AI Alerts</h1>
      <p className="text-[14px] text-[var(--text-secondary)] max-w-md">
        Pelican-powered intelligence alerts for portfolio events, whale movements, funding rate shifts, and analyst calls. Coming soon.
      </p>
    </div>
  )
}
