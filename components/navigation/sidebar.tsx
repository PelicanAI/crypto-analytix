'use client'

import { Fragment, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { House, Lightning, CalendarBlank, GraduationCap, ChatCircle, Bird, ArrowSquareOut, GearSix, SquaresFour, Wallet, TrendUp, MagnifyingGlass, Bell, type Icon } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from '@/lib/constants'

const iconMap: Record<string, Icon> = {
  SquaresFour,
  House,
  Wallet,
  Lightning,
  CalendarBlank,
  GraduationCap,
  ChatCircle,
  Bird,
  TrendUp,
  MagnifyingGlass,
  Bell,
}

export default function Sidebar() {
  const pathname = usePathname()
  const [logoHovered, setLogoHovered] = useState(false)
  const [gearHovered, setGearHovered] = useState(false)

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-30 w-[60px] hidden md:flex flex-col items-center
      border-r border-[var(--border-subtle)]"
      style={{ backgroundColor: 'rgba(from var(--bg-base) r g b / 0.95)', backdropFilter: 'blur(20px) saturate(1.2)' }}
    >
      {/* Faint brand edge gradient */}
      <div className="absolute right-0 top-0 bottom-0 w-px pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(29,161,196,0.06) 50%, transparent 100%)' }}
      />

      {/* Logo */}
      <Link
        href="/dashboard"
        className="mt-4 mb-5"
        onMouseEnter={() => setLogoHovered(true)}
        onMouseLeave={() => setLogoHovered(false)}
      >
        <div
          className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-white text-xs font-bold cursor-pointer"
          style={{
            background: 'var(--accent-gradient)',
            boxShadow: logoHovered
              ? '0 2px 16px rgba(29,161,196,0.25)'
              : '0 2px 8px rgba(29,161,196,0.15)',
            transform: logoHovered ? 'scale(1.04)' : 'scale(1)',
            transition: 'all 200ms ease',
          }}
        >
          CA
        </div>
      </Link>

      {/* Nav items */}
      <nav className="flex flex-col items-center gap-0.5 flex-1">
        {NAV_ITEMS.map((item, index) => {
          const prevItem = index > 0 ? NAV_ITEMS[index - 1] : null
          const showSeparator = prevItem && prevItem.group !== item.group

          const NavIcon = iconMap[item.iconName]
          const isActive = !item.external && (pathname === item.path || pathname.startsWith(item.path + '/'))
          const isPelicanItem = item.id === 'pelican-portal'

          if (item.external) {
            return (
              <Fragment key={item.id}>
                {showSeparator && (
                  <div className="w-6 h-px my-1" style={{ backgroundColor: 'var(--border-subtle)' }} />
                )}
                <a
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'relative w-[44px] h-[44px] flex flex-col items-center justify-center gap-0.5',
                    'rounded-md cursor-pointer transition-colors duration-150',
                    'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.03)]'
                  )}
                >
                  <span className="relative">
                    {NavIcon && <NavIcon size={18} weight="regular" />}
                    <ArrowSquareOut
                      size={8}
                      className="absolute -top-1 -right-1.5 text-[var(--text-muted)]"
                    />
                  </span>
                  <span className="text-[9px] font-medium uppercase tracking-[0.4px] leading-none">
                    {item.label}
                  </span>
                </a>
              </Fragment>
            )
          }

          return (
            <Fragment key={item.id}>
              {showSeparator && (
                <div className="w-6 h-px my-1" style={{ backgroundColor: 'var(--border-subtle)' }} />
              )}
              <Link
                href={item.path}
                className={cn(
                  'relative w-[44px] h-[44px] flex flex-col items-center justify-center gap-0.5',
                  'rounded-md cursor-pointer transition-colors duration-150',
                  isActive
                    ? 'text-[var(--accent-primary)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.03)]'
                )}
                style={
                  isActive
                    ? { background: 'linear-gradient(90deg, rgba(29,161,196,0.08) 0%, transparent 80%)' }
                    : isPelicanItem
                      ? { background: 'rgba(29,161,196,0.04)' }
                      : undefined
                }
              >
                {/* Active bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r bg-[var(--accent-primary)]" />
                )}
                {NavIcon && <NavIcon size={18} weight={isActive ? 'fill' : 'regular'} />}
                <span className="text-[9px] font-medium uppercase tracking-[0.4px] leading-none">
                  {item.label}
                </span>
              </Link>
            </Fragment>
          )
        })}
      </nav>

      {/* Settings */}
      <Link
        href="/settings"
        className={cn(
          'mb-4 flex items-center justify-center w-[34px] h-[34px] rounded-md',
          'text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
          'cursor-pointer'
        )}
        onMouseEnter={() => setGearHovered(true)}
        onMouseLeave={() => setGearHovered(false)}
        style={{
          transition: 'all 300ms ease',
        }}
      >
        <GearSix
          size={18}
          weight="regular"
          style={{
            transform: gearHovered ? 'rotate(30deg)' : 'rotate(0deg)',
            transition: 'transform 300ms ease',
          }}
        />
      </Link>
    </aside>
  )
}
