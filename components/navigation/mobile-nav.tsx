'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { House, Lightning, CalendarBlank, GraduationCap, ChatCircle, type Icon } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from '@/lib/constants'

const iconMap: Record<string, Icon> = {
  House,
  Lightning,
  CalendarBlank,
  GraduationCap,
  ChatCircle,
}

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden items-center justify-around
        border-t border-[var(--border-subtle)]"
      style={{
        backgroundColor: 'rgba(from var(--bg-base) r g b / 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
        paddingTop: '8px',
      }}
    >
      {NAV_ITEMS.map((item) => {
        const Icon = iconMap[item.iconName]
        const isActive = pathname === item.path || pathname.startsWith(item.path + '/')

        return (
          <Link
            key={item.id}
            href={item.path}
            className={cn(
              'flex flex-col items-center justify-center gap-1 min-w-[44px] min-h-[44px]',
              'transition-colors duration-150',
              isActive
                ? 'text-[var(--accent-primary)]'
                : 'text-[var(--text-muted)]'
            )}
          >
            {Icon && <Icon size={20} weight={isActive ? 'fill' : 'regular'} />}
            <span className="text-[9px] uppercase leading-none">
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
