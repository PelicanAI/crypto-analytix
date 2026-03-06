import { cn } from '@/lib/utils'

interface SparklineProps {
  data: number[]
  color: string
  width?: number
  height?: number
  className?: string
}

export function Sparkline({
  data,
  color,
  width = 80,
  height = 28,
  className,
}: SparklineProps) {
  if (!data || data.length === 0) return null

  if (data.length === 1) {
    return (
      <svg width={width} height={height} className={className}>
        <circle cx={width / 2} cy={height / 2} r={2} fill={color} />
      </svg>
    )
  }

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const padding = 2

  const points = data
    .map((value, i) => {
      const x = padding + (i / (data.length - 1)) * (width - padding * 2)
      const y =
        padding + (1 - (value - min) / range) * (height - padding * 2)
      return `${x},${y}`
    })
    .join(' ')

  const gradientId = `sparkline-gradient-${Math.random().toString(36).slice(2, 8)}`

  const fillPoints = [
    `${padding},${height - padding}`,
    ...data.map((value, i) => {
      const x = padding + (i / (data.length - 1)) * (width - padding * 2)
      const y =
        padding + (1 - (value - min) / range) * (height - padding * 2)
      return `${x},${y}`
    }),
    `${width - padding},${height - padding}`,
  ].join(' ')

  return (
    <svg
      width={width}
      height={height}
      className={cn('overflow-visible', className)}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={fillPoints} fill={`url(#${gradientId})`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
