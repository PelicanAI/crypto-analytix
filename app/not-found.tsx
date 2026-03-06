import Link from 'next/link'

export default function NotFoundPage() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4"
      style={{ backgroundColor: 'var(--bg-base)' }}
    >
      <p
        className="mb-2 font-mono text-6xl font-bold tabular-nums"
        style={{ color: 'var(--text-muted)' }}
      >
        404
      </p>
      <h1
        className="mb-2 text-xl font-semibold"
        style={{ color: 'var(--text-primary)' }}
      >
        Page not found
      </h1>
      <p
        className="mb-6 text-sm"
        style={{ color: 'var(--text-secondary)' }}
      >
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link href="/" className="btn btn-primary">
        Go home
      </Link>
    </div>
  )
}
