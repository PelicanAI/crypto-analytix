import { cn } from '@/lib/utils'

interface LiveDotProps {
  color?: string
  size?: number
  className?: string
}

export function LiveDot({
  color = 'var(--accent-primary)',
  size = 8,
  className,
}: LiveDotProps) {
  return (
    <span
      className={cn('relative inline-flex', className)}
      style={{ width: size, height: size }}
    >
      {/* Ping layer */}
      <span
        className="absolute inset-0 rounded-full animate-ping"
        style={{
          backgroundColor: color,
          opacity: 0.6,
          animationDuration: '2s',
        }}
      />
      {/* Core dot */}
      <span
        className="absolute rounded-full"
        style={{
          backgroundColor: color,
          inset: '1px',
        }}
      />
    </span>
  )
}
