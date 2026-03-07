'use client'

import { useRouter } from 'next/navigation'
import { CaretRight } from '@phosphor-icons/react'
import { SectionHeading } from './account-section'

// ---------------------------------------------------------------------------
// Quick Link Row
// ---------------------------------------------------------------------------

function QuickLinkRow({
  label,
  href,
  external,
}: {
  label: string
  href: string
  external?: boolean
}) {
  const router = useRouter()

  return (
    <button
      onClick={() => {
        if (external) {
          window.open(href, '_blank', 'noopener,noreferrer')
        } else {
          router.push(href)
        }
      }}
      className="flex items-center justify-between w-full py-3.5 px-4 rounded-lg cursor-pointer transition-colors duration-150"
      style={{ color: 'var(--text-secondary)' }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-elevated)')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      <span className="text-sm">{label}</span>
      <CaretRight size={16} style={{ color: 'var(--text-muted)' }} />
    </button>
  )
}

// ---------------------------------------------------------------------------
// Quick Links Section
// ---------------------------------------------------------------------------

export function QuickLinksSection() {
  return (
    <section>
      <SectionHeading>Quick Links</SectionHeading>

      <div className="flex flex-col gap-0.5">
        <QuickLinkRow label="Watchlist & Alerts" href="/watchlist" />
        <QuickLinkRow label="Education Progress" href="/learn" />
        <QuickLinkRow label="Terms of Service" href="https://cryptoanalytix.com/terms" external />
      </div>

      {/* Version */}
      <p
        className="text-center text-[11px] mt-12 mb-8"
        style={{ color: 'var(--text-muted)' }}
      >
        Crypto Analytix v0.1.0
      </p>
    </section>
  )
}
