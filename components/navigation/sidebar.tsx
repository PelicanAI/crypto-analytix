'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { House, Lightning, CalendarBlank, GraduationCap, ChatCircle, Bird, ArrowSquareOut, type Icon } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from '@/lib/constants'

const iconMap: Record<string, Icon> = {
  House,
  Lightning,
  CalendarBlank,
  GraduationCap,
  ChatCircle,
  Bird,
}

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-30 w-[60px] hidden md:flex flex-col items-center
      border-r border-[var(--border-subtle)]"
      style={{ backgroundColor: 'rgba(from var(--bg-base) r g b / 0.95)', backdropFilter: 'blur(20px)' }}
    >
      {/* Logo */}
      <div className="mt-4 mb-5">
        <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-white text-xs font-bold"
          style={{ background: 'var(--accent-gradient)' }}>
          CA
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col items-center gap-0.5 flex-1">
        {NAV_ITEMS.map((item) => {
          const NavIcon = iconMap[item.iconName]
          const isActive = !item.external && (pathname === item.path || pathname.startsWith(item.path + '/'))

          if (item.external) {
            return (
              <a
                key={item.id}
                href={item.path}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'relative w-[44px] h-[44px] flex flex-col items-center justify-center gap-0.5',
                  'rounded-md cursor-pointer transition-colors duration-150',
                  'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.03)]'
                )}
              >
                {NavIcon && <NavIcon size={18} weight="regular" />}
                <span className="text-[8px] uppercase tracking-[0.5px] leading-none flex items-center gap-0.5">
                  {item.label}
                  <ArrowSquareOut size={7} className="text-[var(--text-muted)]" />
                </span>
              </a>
            )
          }

          return (
            <Link
              key={item.id}
              href={item.path}
              className={cn(
                'relative w-[44px] h-[44px] flex flex-col items-center justify-center gap-0.5',
                'rounded-md cursor-pointer transition-colors duration-150',
                isActive
                  ? 'text-[var(--accent-primary)] bg-[var(--accent-muted)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.03)]'
              )}
            >
              {/* Active bar */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-r bg-[var(--accent-primary)]" />
              )}
              {NavIcon && <NavIcon size={18} weight={isActive ? 'fill' : 'regular'} />}
              <span className="text-[8px] uppercase tracking-[0.5px] leading-none">
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
