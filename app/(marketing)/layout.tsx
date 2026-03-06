import Link from 'next/link'
import { ForceLightTheme } from '@/providers/force-light-theme'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <ForceLightTheme>
      <div className="min-h-screen">
        {/* Marketing nav */}
        <nav className="flex items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Crypto Analytix
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="btn btn-ghost text-sm"
            >
              Log in
            </Link>
            <Link
              href="/auth/signup"
              className="btn btn-primary text-sm"
            >
              Sign up
            </Link>
          </div>
        </nav>
        {children}
      </div>
    </ForceLightTheme>
  )
}
