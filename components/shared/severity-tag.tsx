import { cn } from '@/lib/utils'
import { SEVERITY_CONFIG, type SeverityType } from '@/lib/constants'

interface SeverityTagProps {
  type: SeverityType
  className?: string
}

export function SeverityTag({ type, className }: SeverityTagProps) {
  const config = SEVERITY_CONFIG[type]

  return (
    <span
      className={cn(
        'inline-flex items-center px-[7px] py-[2px] rounded text-[9px] font-semibold uppercase tracking-wider',
        className
      )}
      style={{
        color: config.color,
        backgroundColor: `color-mix(in srgb, ${config.color} 12%, transparent)`,
        border: `1px solid color-mix(in srgb, ${config.color} 20%, transparent)`,
      }}
    >
      {config.label}
    </span>
  )
}
