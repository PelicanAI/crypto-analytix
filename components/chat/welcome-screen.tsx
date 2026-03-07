'use client'

import { ArrowSquareOut } from '@phosphor-icons/react'
import { PelicanAvatar } from '@/components/pelican-portal/portal-message'
import { SuggestedPrompts } from './SuggestedPrompts'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WelcomeScreenProps {
  onSelectPrompt: (prompt: string) => void
  /** User's display name for personalized greeting */
  userName?: string
}

// ---------------------------------------------------------------------------
// Time-of-day greeting
// ---------------------------------------------------------------------------

function getGreeting(name?: string): string {
  const hour = new Date().getHours()
  let timeGreeting: string
  if (hour < 12) {
    timeGreeting = 'Good morning'
  } else if (hour < 17) {
    timeGreeting = 'Good afternoon'
  } else {
    timeGreeting = 'Good evening'
  }
  return name ? `${timeGreeting}, ${name}` : timeGreeting
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WelcomeScreen({ onSelectPrompt, userName }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6">
      {/* Avatar with radial glow */}
      <div
        className="relative flex items-center justify-center"
        style={{ boxShadow: '0 0 60px 20px rgba(29,161,196,0.08)' }}
      >
        <PelicanAvatar size={64} />
      </div>

      {/* Greeting */}
      <h2
        className="font-semibold text-center"
        style={{
          fontSize: 22,
          letterSpacing: '-0.02em',
          color: 'var(--text-primary)',
          marginTop: 20,
        }}
      >
        {getGreeting(userName)}
      </h2>

      {/* Subtitle */}
      <p
        className="text-center"
        style={{
          fontSize: 14,
          lineHeight: '1.7',
          color: 'var(--text-secondary)',
          maxWidth: 420,
          marginTop: 8,
        }}
      >
        Ask anything about crypto — Pelican translates it into the language you already know.
      </p>

      {/* Suggested prompts */}
      <div style={{ marginTop: 32, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <SuggestedPrompts onSelectPrompt={onSelectPrompt} />
      </div>

      {/* Guide link */}
      <a
        href="https://www.cryptoanalytix.com/guide"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 mt-6 transition-colors duration-150"
        style={{ fontSize: 12, color: 'var(--text-muted)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--accent-primary)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-muted)'
        }}
      >
        Crypto Analytix Guide
        <ArrowSquareOut size={12} />
      </a>
    </div>
  )
}
