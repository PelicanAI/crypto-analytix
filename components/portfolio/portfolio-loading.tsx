export function PortfolioLoading() {
  return (
    <div className="max-w-[960px] mx-auto" style={{ padding: 'var(--space-page-x)' }}>
      {/* Stat card skeletons */}
      <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: 'var(--space-card-gap)' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border overflow-hidden"
            style={{
              background: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
              padding: '16px 20px',
            }}
          >
            {/* Title shimmer */}
            <div
              className="shimmer rounded"
              style={{ width: '40%', height: 10, marginBottom: 12 }}
            />
            {/* Value shimmer */}
            <div
              className="shimmer rounded"
              style={{ width: '60%', height: 24, marginBottom: 8 }}
            />
            {/* Subtitle shimmer */}
            <div
              className="shimmer rounded"
              style={{ width: '50%', height: 14 }}
            />
          </div>
        ))}
      </div>

      {/* Table row skeletons */}
      <div
        className="mt-6 rounded-xl border overflow-hidden"
        style={{
          background: 'var(--bg-surface)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4"
            style={{
              padding: '14px 16px',
              borderBottom: i < 4 ? '1px solid var(--border-subtle)' : 'none',
            }}
          >
            {/* Circle */}
            <div
              className="shimmer rounded-full flex-shrink-0"
              style={{ width: 30, height: 30 }}
            />
            {/* Ticker + name */}
            <div className="flex flex-col gap-1.5 flex-shrink-0" style={{ width: 80 }}>
              <div className="shimmer rounded" style={{ width: '70%', height: 12 }} />
              <div className="shimmer rounded" style={{ width: '50%', height: 10 }} />
            </div>
            {/* Right-aligned value columns */}
            <div className="flex-1 flex items-center justify-end gap-6">
              <div className="shimmer rounded hidden md:block" style={{ width: 64, height: 12 }} />
              <div className="shimmer rounded hidden md:block" style={{ width: 48, height: 12 }} />
              <div className="shimmer rounded" style={{ width: 56, height: 12 }} />
              <div className="shimmer rounded hidden md:block" style={{ width: 56, height: 12 }} />
              <div className="shimmer rounded hidden md:block" style={{ width: 44, height: 12 }} />
              <div className="shimmer rounded" style={{ width: 28, height: 28, borderRadius: 6 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
