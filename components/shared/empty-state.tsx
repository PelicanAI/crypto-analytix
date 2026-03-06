'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { Icon } from '@phosphor-icons/react'

interface EmptyStateProps {
  icon: Icon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4',
        className
      )}
    >
      <Icon size={48} weight="thin" className="text-[var(--text-muted)]" />
      <h3 className="mt-4 text-base font-semibold text-[var(--text-primary)]">
        {title}
      </h3>
      <p className="mt-2 text-[13px] text-[var(--text-secondary)] text-center max-w-sm">
        {description}
      </p>
      {actionLabel && onAction && (
        <motion.button
          onClick={onAction}
          className="mt-5 px-4 py-2 rounded-lg text-sm font-medium text-white
            bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)]
            cursor-pointer transition-colors duration-150"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {actionLabel}
        </motion.button>
      )}
    </div>
  )
}
