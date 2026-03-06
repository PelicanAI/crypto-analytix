'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface PelicanIconProps {
  onClick: () => void
  size?: number
  glow?: boolean
  active?: boolean
  className?: string
}

export function PelicanIcon({
  onClick,
  size = 16,
  glow = false,
  active = false,
  className,
}: PelicanIconProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'relative inline-flex items-center justify-center cursor-pointer',
        'min-w-[44px] min-h-[44px] rounded-md',
        'transition-colors duration-150',
        active
          ? 'text-[var(--accent-primary)] bg-[var(--accent-muted)]'
          : 'text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:bg-[var(--accent-dim)]',
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Ask Pelican"
    >
      {/* Glow pulse ring */}
      {glow && (
        <motion.span
          className="absolute inset-0 rounded-md border border-[var(--accent-primary)]"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0, 0.4, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Pelican SVG */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={active ? 0 : 1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Pelican silhouette — distinctive head with throat pouch */}
        <path d="M12 3c-2 0-3.5 1-4 2.5L7 8c-.5 1.5-1 2-2.5 2.5C3 11 2 12 2 13.5S3 16 4.5 16H6l1 2c.5 1 1.5 2 3 2.5" />
        <path d="M12 3c2 0 3.5 1 4 2.5L17 8c.5 1.5 1 2 2.5 2.5C21 11 22 12 22 13.5S21 16 19.5 16H18" />
        {/* Body */}
        <path d="M10 20.5c1 .3 2 .5 3 .3 2-.3 3.5-1.5 4-3l1-3" />
        {/* Pouch */}
        <path d="M7 8c0 2 1 3.5 3 4 1 .3 2 .3 3 0 2-.5 3-2 3-4" />
        {/* Eye */}
        <circle cx="10" cy="5.5" r="0.8" fill="currentColor" stroke="none" />
      </svg>

      {/* Tooltip */}
      <AnimatePresence>
        {hovered && !active && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15, delay: 0.15 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap
              px-2 py-0.5 rounded text-[10px] font-medium text-white
              bg-[var(--accent-primary)] pointer-events-none z-50"
          >
            Ask Pelican
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
