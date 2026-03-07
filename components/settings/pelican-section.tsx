'use client'

import { useRouter } from 'next/navigation'
import { SectionHeading } from './account-section'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ResponseLength = 'concise' | 'detailed'

// ---------------------------------------------------------------------------
// Pelican Preferences Section
// ---------------------------------------------------------------------------

interface PelicanSectionProps {
  experienceLevel: string | null
  responseLength: ResponseLength
  onSaveResponseLength: (length: ResponseLength) => void
}

export function PelicanSection({
  experienceLevel,
  responseLength,
  onSaveResponseLength,
}: PelicanSectionProps) {
  const router = useRouter()

  const experienceLabel = experienceLevel
    ? {
        new: 'New to Trading',
        tradfi: 'Stocks, Forex, or Futures Trader',
        crypto: 'Crypto Trader',
      }[experienceLevel] ?? experienceLevel
    : 'Not set'

  return (
    <section>
      <SectionHeading>Pelican Preferences</SectionHeading>

      {/* Experience Level */}
      <div className="flex items-center justify-between py-3">
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Experience Level</span>
        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
          {experienceLabel}
        </span>
      </div>

      {/* Update Profile Button */}
      <div className="flex items-center justify-between py-3">
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Trading Profile</span>
        <button
          onClick={() => router.push('/onboarding')}
          className="text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer transition-colors duration-150"
          style={{
            color: 'var(--accent-primary)',
            backgroundColor: 'var(--accent-dim)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-muted)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-dim)')}
        >
          Update My Profile
        </button>
      </div>

      {/* Response Length */}
      <div className="py-3">
        <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>Response Length</p>
        <div className="flex gap-2">
          {(['concise', 'detailed'] as const).map((option) => {
            const isSelected = responseLength === option
            return (
              <button
                key={option}
                onClick={() => onSaveResponseLength(option)}
                className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium capitalize cursor-pointer transition-all duration-200"
                style={{
                  backgroundColor: isSelected ? 'var(--accent-dim)' : 'var(--bg-surface)',
                  border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                  color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'var(--border-hover)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)'
                  }
                }}
              >
                {option}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
