'use client'

import { useEffect } from 'react'
import { cn } from '@/lib/utils'

interface LoadingSkeletonProps {
  variant: 'card' | 'row' | 'text' | 'metric' | 'paragraph'
  count?: number
  className?: string
}

const variantStyles: Record<Exclude<LoadingSkeletonProps['variant'], 'paragraph'>, string> = {
  card: 'rounded-xl h-[120px] w-full',
  row: 'rounded-lg h-[60px] w-full',
  text: 'rounded h-4 w-[60%]',
  metric: 'rounded-lg h-8 w-[100px]',
}

/* Inject the shimmer keyframe once globally */
const SHIMMER_KEYFRAME_ID = 'ca-skeleton-shimmer'

function useShimmerKeyframe() {
  useEffect(() => {
    if (typeof document === 'undefined') return
    if (document.getElementById(SHIMMER_KEYFRAME_ID)) return

    const style = document.createElement('style')
    style.id = SHIMMER_KEYFRAME_ID
    style.textContent = `
      @keyframes skeleton-shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `
    document.head.appendChild(style)
  }, [])
}

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div
      className={cn('rounded', className)}
      style={{
        background: `linear-gradient(90deg, var(--bg-surface) 25%, var(--bg-elevated) 50%, var(--bg-surface) 75%)`,
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.5s infinite ease-in-out',
      }}
    />
  )
}

export function LoadingSkeleton({ variant, count = 1, className }: LoadingSkeletonProps) {
  useShimmerKeyframe()

  if (variant === 'paragraph') {
    return (
      <div className={cn('flex flex-col gap-3', className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <SkeletonPulse className="rounded h-4 w-full" />
            <SkeletonPulse className="rounded h-4 w-[85%]" />
            <SkeletonPulse className="rounded h-4 w-[60%]" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonPulse key={i} className={variantStyles[variant]} />
      ))}
    </div>
  )
}
