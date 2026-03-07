'use client'

interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  subtitleColor?: string
  accentTint?: string
}

export function StatCard({
  title,
  value,
  subtitle,
  subtitleColor,
  accentTint,
}: StatCardProps) {
  const tint = accentTint || 'rgba(29,161,196,0.04)'

  return (
    <div
      className="relative overflow-hidden rounded-xl border transition-all duration-200
        hover:shadow-[0_4px_12px_rgba(0,0,0,0.3),0_2px_4px_rgba(0,0,0,0.4)]"
      style={{
        background: `linear-gradient(135deg, ${tint} 0%, var(--bg-surface) 60%)`,
        borderColor: 'var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.3)',
        padding: '16px 20px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-hover)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-subtle)'
      }}
    >
      <p
        className="text-[11px] uppercase font-semibold mb-2"
        style={{
          color: 'var(--text-muted)',
          letterSpacing: '1px',
        }}
      >
        {title}
      </p>
      <p
        className="text-2xl font-semibold font-mono leading-none"
        style={{
          color: 'var(--text-primary)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </p>
      {subtitle && (
        <p
          className="text-xs font-mono mt-1.5"
          style={{
            color: subtitleColor ?? 'var(--text-secondary)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
