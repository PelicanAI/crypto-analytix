'use client'

import type { Icon as PhosphorIcon } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { PelicanIcon } from '@/components/shared/pelican-icon'

interface BriefCardProps {
  icon: PhosphorIcon
  label: string
  children: React.ReactNode
  onPelicanClick: () => void
  pelicanGlow?: boolean
  /** Apply accent gradient tint background for personalized content */
  gradientTint?: boolean
  /** Show a left accent border (featured section) */
  accentBorder?: boolean
  className?: string
}

export default function BriefCard({
  icon: Icon,
  label,
  children,
  onPelicanClick,
  pelicanGlow = false,
  gradientTint = false,
  accentBorder = false,
  className,
}: BriefCardProps) {
  const bgStyle = gradientTint
    ? 'linear-gradient(135deg, rgba(29,161,196,0.04) 0%, var(--bg-surface) 60%)'
    : undefined

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl transition-all duration-200',
        !gradientTint && !accentBorder && 'card',
        className
      )}
      style={{
        ...(gradientTint || accentBorder
          ? {
              background: bgStyle ?? 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.15)',
            }
          : {}),
        ...(accentBorder
          ? {
              borderLeft: '3px solid var(--accent-primary)',
              background:
                'linear-gradient(135deg, rgba(29,161,196,0.06) 0%, var(--bg-surface) 70%)',
            }
          : {}),
        padding: '20px',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Section label */}
          <div className="flex items-center gap-2 mb-3">
            <Icon
              size={14}
              weight="bold"
              style={{ color: 'var(--accent-primary)' }}
            />
            <span
              className="text-[10px] uppercase font-semibold"
              style={{
                color: 'var(--accent-primary)',
                letterSpacing: '1.5px',
              }}
            >
              {label}
            </span>
          </div>

          {/* Content */}
          {children}
        </div>

        {/* Pelican icon */}
        <PelicanIcon
          onClick={onPelicanClick}
          size={16}
          glow={pelicanGlow}
        />
      </div>
    </div>
  )
}
