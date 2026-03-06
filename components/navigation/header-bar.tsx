'use client'

import { Bell } from '@phosphor-icons/react'
import { LiveDot } from '@/components/shared/live-dot'
import { Sparkline } from '@/components/portfolio/sparkline'

export default function HeaderBar() {
  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between px-5 md:px-7 py-3
        border-b border-[var(--border-subtle)]"
      style={{
        backgroundColor: 'rgba(from var(--bg-base) r g b / 0.8)',
        backdropFilter: 'blur(20px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.2)',
      }}
    >
      {/* Left group */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-[1.5px] font-medium text-[var(--text-muted)]">
            Portfolio
          </span>
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-[22px] font-semibold tabular-nums text-[var(--text-primary)]">
              $0.00
            </span>
            <span className="font-mono text-xs tabular-nums text-[var(--data-neutral)]">
              +$0.00 (+0.00%)
            </span>
          </div>
        </div>
        <div className="hidden md:block">
          <Sparkline data={[0, 0, 0, 0, 0]} color="var(--data-neutral)" width={60} height={24} />
        </div>
      </div>

      {/* Right group */}
      <div className="flex items-center gap-3">
        {/* BTC beta badge -- hidden on mobile */}
        <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md border border-[var(--border-subtle)]">
          <span className="text-[11px] text-[var(--text-muted)]">BTC B</span>
          <span className="font-mono text-[11px] text-[var(--text-secondary)] tabular-nums">--</span>
        </div>

        {/* Live indicator -- hidden on mobile */}
        <div className="hidden md:flex items-center gap-1.5">
          <LiveDot size={6} />
          <span className="text-[11px] text-[var(--text-muted)]">Live</span>
        </div>

        {/* Notification bell */}
        <button
          type="button"
          className="flex items-center justify-center w-8 h-8 rounded-lg
            border border-[var(--border-subtle)] cursor-pointer
            transition-all duration-150
            hover:border-[var(--border-hover)] hover:bg-[rgba(255,255,255,0.03)]"
        >
          <Bell size={16} weight="regular" className="text-[var(--text-secondary)]" />
        </button>
      </div>
    </header>
  )
}
