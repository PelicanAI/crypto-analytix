'use client'

import { Suspense, useMemo, useCallback, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  CaretLeft,
  CaretRight,
  CalendarBlank,
  ArrowSquareOut,
  CaretDown,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { useCalendar, type CalendarEventEnriched } from '@/hooks/use-calendar'
import { usePelicanPanelContext } from '@/providers/pelican-panel-provider'
import { PelicanIcon } from '@/components/shared/pelican-icon'
import { EmptyState } from '@/components/shared/empty-state'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { ASSET_COLORS } from '@/lib/constants'
import type { CalendarEventType, EventImpact } from '@/types/calendar'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const EVENT_TYPE_COLORS: Record<CalendarEventType, string> = {
  'token-unlock': '#9945FF',
  governance: '#2A5ADA',
  'fed-meeting': '#F59E0B',
  earnings: '#22c55e',
  expiration: '#EF4444',
  halving: '#F7931A',
  upgrade: '#1DA1C4',
  other: '#5a5a6e',
}

const EVENT_TYPE_LABELS: Record<CalendarEventType, string> = {
  'token-unlock': 'TOKEN UNLOCK',
  governance: 'GOVERNANCE',
  'fed-meeting': 'FED MEETING',
  earnings: 'EARNINGS',
  expiration: 'EXPIRATION',
  halving: 'HALVING',
  upgrade: 'UPGRADE',
  other: 'EVENT',
}

const IMPACT_CONFIG: Record<EventImpact, { label: string; color: string; bg: string }> = {
  low: {
    label: 'LOW',
    color: 'var(--text-muted)',
    bg: 'rgba(107,114,128,0.15)',
  },
  medium: {
    label: 'MEDIUM',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.15)',
  },
  high: {
    label: 'HIGH',
    color: '#F97316',
    bg: 'rgba(249,115,22,0.15)',
  },
  critical: {
    label: 'CRITICAL',
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.15)',
  },
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseMonth(monthStr: string): { year: number; month: number } {
  const [y, m] = monthStr.split('-').map(Number)
  return { year: y, month: m }
}

function prevMonth(monthStr: string): string {
  const { year, month } = parseMonth(monthStr)
  if (month === 1) return `${year - 1}-12`
  return `${year}-${String(month - 1).padStart(2, '0')}`
}

function nextMonth(monthStr: string): string {
  const { year, month } = parseMonth(monthStr)
  if (month === 12) return `${year + 1}-01`
  return `${year}-${String(month + 1).padStart(2, '0')}`
}

function formatMonthLabel(monthStr: string): string {
  const { year, month } = parseMonth(monthStr)
  return `${MONTH_NAMES[month - 1]} ${year}`
}

function formatFullDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatEventDate(isoStr: string): string {
  const d = new Date(isoStr)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatEventTime(isoStr: string): string {
  const d = new Date(isoStr)
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function getToday(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

interface CalendarDay {
  date: string
  day: number
  isCurrentMonth: boolean
  isToday: boolean
}

function buildCalendarGrid(monthStr: string): CalendarDay[] {
  const { year, month } = parseMonth(monthStr)
  const today = getToday()

  const firstDate = new Date(year, month - 1, 1)
  const firstDayOfWeek = firstDate.getDay()
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

  const daysInMonth = new Date(year, month, 0).getDate()
  const days: CalendarDay[] = []

  // Previous month fill
  const prevMonthDays = new Date(year, month - 1, 0).getDate()
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = prevMonthDays - i
    const pm = month === 1 ? 12 : month - 1
    const py = month === 1 ? year - 1 : year
    const dateStr = `${py}-${String(pm).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    days.push({ date: dateStr, day: d, isCurrentMonth: false, isToday: dateStr === today })
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    days.push({ date: dateStr, day: d, isCurrentMonth: true, isToday: dateStr === today })
  }

  // Fill to complete grid (always 42 cells = 6 rows)
  const remaining = 42 - days.length
  for (let d = 1; d <= remaining; d++) {
    const nm = month === 12 ? 1 : month + 1
    const ny = month === 12 ? year + 1 : year
    const dateStr = `${ny}-${String(nm).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    days.push({ date: dateStr, day: d, isCurrentMonth: false, isToday: dateStr === today })
  }

  return days
}

// ---------------------------------------------------------------------------
// Loading state
// ---------------------------------------------------------------------------

function CalendarLoadingState() {
  return (
    <div style={{ padding: 'var(--space-page-x)' }}>
      <div className="max-w-[1100px] mx-auto">
        {/* Header shimmer */}
        <div className="mb-6">
          <div className="shimmer rounded h-6 w-[120px] mb-2" />
          <div className="shimmer rounded h-4 w-[300px]" />
        </div>
        <div className="flex flex-col lg:flex-row gap-5">
          <div className="flex-[55] min-w-0">
            <div className="shimmer rounded-xl h-[420px] w-full" />
          </div>
          <div className="flex-[45] min-w-0">
            <LoadingSkeleton variant="card" count={3} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Event card component
// ---------------------------------------------------------------------------

interface EventCardProps {
  event: CalendarEventEnriched
  onPelicanClick: () => void
}

function EventCard({ event, onPelicanClick }: EventCardProps) {
  const [expanded, setExpanded] = useState(false)
  const typeColor = EVENT_TYPE_COLORS[event.event_type]
  const typeLabel = EVENT_TYPE_LABELS[event.event_type]
  const impactCfg = IMPACT_CONFIG[event.impact]
  const isCritical = event.impact === 'critical'
  const isHighImpact = event.impact === 'high' || isCritical
  const assetColor = event.asset ? (ASSET_COLORS[event.asset] ?? typeColor) : typeColor

  const descriptionLong = event.description && event.description.length > 120

  return (
    <div
      className="relative rounded-xl transition-all duration-200"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.15)',
        padding: '14px 16px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-hover)'
        e.currentTarget.style.boxShadow =
          '0 2px 4px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.2)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-subtle)'
        e.currentTarget.style.boxShadow =
          '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.15)'
      }}
    >
      {/* Pelican icon top-right */}
      <div className="absolute top-2.5 right-2.5">
        <PelicanIcon onClick={onPelicanClick} size={16} glow={isHighImpact} />
      </div>

      {/* Event type pill + impact badge */}
      <div className="flex items-center gap-2 mb-2 pr-14">
        <span
          className="inline-block px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider"
          style={{
            backgroundColor: `color-mix(in srgb, ${typeColor} 15%, transparent)`,
            color: typeColor,
            border: `1px solid color-mix(in srgb, ${typeColor} 25%, transparent)`,
          }}
        >
          {typeLabel}
        </span>
        <span
          className={cn(
            'inline-block px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider',
            isCritical && 'animate-pulse'
          )}
          style={{
            backgroundColor: impactCfg.bg,
            color: impactCfg.color,
          }}
        >
          {impactCfg.label}
        </span>
      </div>

      {/* Title */}
      <h3
        className="text-[14px] font-semibold leading-tight mb-1.5 pr-12"
        style={{ color: 'var(--text-primary)' }}
      >
        {event.title}
      </h3>

      {/* Date */}
      <p
        className="text-[11px] font-mono tabular-nums mb-2.5"
        style={{ color: 'var(--text-muted)' }}
      >
        {formatEventDate(event.event_date)} at {formatEventTime(event.event_date)}
      </p>

      {/* Asset pill + portfolio badge */}
      {event.asset && (
        <div className="flex items-center gap-2 mb-2.5">
          <span
            className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono text-white"
            style={{ backgroundColor: assetColor }}
          >
            {event.asset}
          </span>
          {event.user_holds && (
            <span
              className="inline-flex items-center px-2 py-[2px] rounded-full text-[10px] font-medium"
              style={{
                color: 'var(--accent-primary)',
                backgroundColor: 'var(--accent-dim)',
              }}
            >
              In your portfolio
            </span>
          )}
        </div>
      )}

      {/* Description — max 3 lines with expand */}
      {event.description && (
        <div className="mb-2">
          <p
            className={cn(
              'text-[12px] leading-[1.6]',
              !expanded && descriptionLong && 'line-clamp-3'
            )}
            style={{ color: 'var(--text-secondary)' }}
          >
            {event.description}
          </p>
          {descriptionLong && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-0.5 mt-1 text-[11px] font-medium cursor-pointer transition-colors duration-150"
              style={{ color: 'var(--accent-primary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--accent-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--accent-primary)'
              }}
            >
              {expanded ? 'Show less' : 'Read more'}
              <CaretDown
                size={10}
                weight="bold"
                style={{
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 150ms ease',
                }}
              />
            </button>
          )}
        </div>
      )}

      {/* Source link */}
      {event.source_url && event.source && (
        <a
          href={event.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] transition-colors duration-150"
          style={{ color: 'var(--accent-primary)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--accent-hover)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--accent-primary)'
          }}
        >
          {event.source}
          <ArrowSquareOut size={11} weight="regular" />
        </a>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function CalendarPage() {
  return (
    <Suspense fallback={<CalendarLoadingState />}>
      <CalendarPageContent />
    </Suspense>
  )
}

function CalendarPageContent() {
  const {
    events,
    isLoading,
    currentMonth,
    setMonth,
    selectedDate,
    setSelectedDate,
    eventsForDate,
    upcomingEvents,
  } = useCalendar()

  const { openWithPrompt } = usePelicanPanelContext()
  const reducedMotion = useReducedMotion()

  // Build event map for dots on calendar
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEventEnriched[]> = {}
    for (const event of events) {
      const dateKey = event.event_date.slice(0, 10)
      if (!map[dateKey]) map[dateKey] = []
      map[dateKey].push(event)
    }
    return map
  }, [events])

  // Grid days for current month
  const calendarDays = useMemo(() => buildCalendarGrid(currentMonth), [currentMonth])

  // Events to display in the right panel
  const displayEvents = useMemo(() => {
    if (selectedDate) {
      return eventsForDate(selectedDate)
    }
    return upcomingEvents
  }, [selectedDate, eventsForDate, upcomingEvents])

  // Pelican prompt builder for calendar events
  const handlePelicanClick = useCallback(
    (event: CalendarEventEnriched) => {
      const prompt = {
        visibleMessage: `Tell me about: ${event.title}`,
        fullPrompt: `[CRYPTO ANALYTIX - CALENDAR EVENT ANALYSIS]
EVENT: ${event.title}
TYPE: ${event.event_type}
DATE: ${formatEventDate(event.event_date)}
ASSET: ${event.asset || 'Market-wide'}
IMPACT: ${event.impact}
DESCRIPTION: ${event.description || 'No description available'}
USER HOLDS ASSET: ${event.user_holds ? 'Yes' : 'No'}
${event.pelican_context || 'Analyze this event. What historically happens around events like this? How should the user prepare? What derivatives positioning should they watch? Use TradFi analogies for crypto concepts.'}`,
      }
      openWithPrompt(
        event.asset ? 'position' : 'news',
        prompt,
        event.asset || null
      )
    },
    [openWithPrompt]
  )

  // Animation variants
  const fadeUp = reducedMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } }

  return (
    <motion.div
      style={{ padding: 'var(--space-page-x)' }}
      initial={fadeUp.initial}
      animate={fadeUp.animate}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-[1100px] mx-auto">
        {/* Page header */}
        <div className="mb-6">
          <h1
            className="text-xl font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            Calendar
          </h1>
          <p
            className="text-[13px] mt-0.5"
            style={{ color: 'var(--text-secondary)' }}
          >
            Token unlocks, governance, Fed meetings, expirations
          </p>
        </div>

        {/* Loading */}
        {isLoading && events.length === 0 && (
          <div className="flex flex-col lg:flex-row gap-5">
            <div className="flex-[55] min-w-0">
              <div className="shimmer rounded-xl h-[420px] w-full" />
            </div>
            <div className="flex-[45] min-w-0">
              <LoadingSkeleton variant="card" count={3} />
            </div>
          </div>
        )}

        {/* Two-panel layout */}
        {!(isLoading && events.length === 0) && (
          <div className="flex flex-col lg:flex-row" style={{ gap: '20px' }}>
            {/* ---- Left panel: Calendar grid (55%) ---- */}
            <div className="flex-[55] min-w-0">
              <div
                className="rounded-xl overflow-hidden"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                {/* Month navigation header */}
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{ borderBottom: '1px solid var(--border-subtle)' }}
                >
                  <motion.button
                    type="button"
                    onClick={() => setMonth(prevMonth(currentMonth))}
                    className="flex items-center justify-center w-8 h-8 rounded-lg
                      cursor-pointer transition-colors duration-150
                      text-[var(--text-muted)] hover:text-[var(--accent-primary)]
                      hover:bg-[var(--accent-dim)]"
                    whileHover={reducedMotion ? undefined : { scale: 1.05 }}
                    whileTap={reducedMotion ? undefined : { scale: 0.95 }}
                    aria-label="Previous month"
                  >
                    <CaretLeft size={18} weight="bold" />
                  </motion.button>

                  <span
                    className="text-[16px] font-semibold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {formatMonthLabel(currentMonth)}
                  </span>

                  <motion.button
                    type="button"
                    onClick={() => setMonth(nextMonth(currentMonth))}
                    className="flex items-center justify-center w-8 h-8 rounded-lg
                      cursor-pointer transition-colors duration-150
                      text-[var(--text-muted)] hover:text-[var(--accent-primary)]
                      hover:bg-[var(--accent-dim)]"
                    whileHover={reducedMotion ? undefined : { scale: 1.05 }}
                    whileTap={reducedMotion ? undefined : { scale: 0.95 }}
                    aria-label="Next month"
                  >
                    <CaretRight size={18} weight="bold" />
                  </motion.button>
                </div>

                {/* Day-of-week labels */}
                <div className="grid grid-cols-7 px-2 pt-2">
                  {DAY_LABELS.map((label) => (
                    <div
                      key={label}
                      className="text-center text-[10px] uppercase font-medium py-1.5"
                      style={{
                        color: 'var(--text-muted)',
                        letterSpacing: '1px',
                      }}
                    >
                      {label}
                    </div>
                  ))}
                </div>

                {/* Day grid */}
                <div className="grid grid-cols-7 px-2 pb-2 gap-[1px]">
                  {calendarDays.map((day) => {
                    const dayEvents = eventsByDate[day.date] || []
                    const isSelected = selectedDate === day.date
                    const hasEvents = dayEvents.length > 0

                    return (
                      <button
                        key={day.date}
                        type="button"
                        onClick={() =>
                          setSelectedDate(isSelected ? null : day.date)
                        }
                        className={cn(
                          'relative min-h-[52px] rounded-lg p-[6px_8px] cursor-pointer',
                          'transition-all duration-150 text-left',
                          !day.isCurrentMonth && 'opacity-30',
                          day.isToday && !isSelected
                            ? 'border-2'
                            : isSelected
                              ? 'border'
                              : 'border',
                        )}
                        style={{
                          borderColor: day.isToday && !isSelected
                            ? 'var(--accent-primary)'
                            : isSelected
                              ? 'var(--accent-primary)'
                              : 'var(--border-subtle)',
                          backgroundColor: isSelected
                            ? 'var(--accent-dim)'
                            : 'transparent',
                          borderWidth: day.isToday && !isSelected ? '2px' : '1px',
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected && !day.isToday) {
                            e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'
                            e.currentTarget.style.borderColor = 'var(--border-hover)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected && !day.isToday) {
                            e.currentTarget.style.backgroundColor = 'transparent'
                            e.currentTarget.style.borderColor = 'var(--border-subtle)'
                          }
                        }}
                      >
                        {/* Day number */}
                        <span
                          className={cn(
                            'block text-[12px] font-mono tabular-nums font-medium',
                          )}
                          style={{
                            color: day.isToday
                              ? 'var(--accent-primary)'
                              : day.isCurrentMonth
                                ? 'var(--text-secondary)'
                                : 'var(--text-muted)',
                            fontWeight: day.isToday ? 600 : 500,
                          }}
                        >
                          {day.day}
                        </span>

                        {/* Event dots */}
                        {hasEvents && (
                          <div className="flex gap-[3px] mt-1 flex-wrap">
                            {dayEvents.slice(0, 3).map((evt) => (
                              <span
                                key={evt.id}
                                className="block w-[5px] h-[5px] rounded-full flex-shrink-0"
                                style={{
                                  backgroundColor: EVENT_TYPE_COLORS[evt.event_type],
                                }}
                                title={evt.title}
                              />
                            ))}
                            {dayEvents.length > 3 && (
                              <span
                                className="text-[8px] font-mono leading-[5px] ml-0.5"
                                style={{ color: 'var(--text-muted)' }}
                              >
                                +{dayEvents.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 px-1">
                {(Object.entries(EVENT_TYPE_COLORS) as [CalendarEventType, string][]).map(
                  ([type, color]) => (
                    <div key={type} className="flex items-center gap-1.5">
                      <span
                        className="block w-[5px] h-[5px] rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span
                        className="text-[10px]"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {EVENT_TYPE_LABELS[type]}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* ---- Right panel: Event list (45%) ---- */}
            <div className="flex-[45] min-w-0">
              {/* Panel header */}
              <div className="mb-4">
                <h2
                  className="text-[15px] font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {selectedDate ? formatFullDate(selectedDate) : 'Upcoming Events'}
                </h2>
                {selectedDate && (
                  <button
                    type="button"
                    onClick={() => setSelectedDate(null)}
                    className="text-[12px] cursor-pointer transition-colors duration-150 mt-1"
                    style={{ color: 'var(--accent-primary)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--accent-hover)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--accent-primary)'
                    }}
                  >
                    Show all upcoming
                  </button>
                )}
              </div>

              {/* Event cards */}
              <AnimatePresence mode="popLayout">
                {displayEvents.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <EmptyState
                      icon={CalendarBlank}
                      title={
                        selectedDate
                          ? 'No events on this date'
                          : 'No upcoming events this month'
                      }
                      description={
                        selectedDate
                          ? 'Select another date or view all upcoming events.'
                          : 'Token unlocks, governance votes, and macro events will appear here as they are scheduled.'
                      }
                    />
                  </motion.div>
                ) : (
                  <div
                    className="flex flex-col themed-scroll"
                    style={{
                      gap: 'var(--space-card-gap)',
                      maxHeight: 'calc(100vh - 240px)',
                      overflowY: 'auto',
                      paddingRight: '4px',
                    }}
                  >
                    {displayEvents.map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={
                          reducedMotion
                            ? { opacity: 1 }
                            : { opacity: 0, y: 12 }
                        }
                        animate={{ opacity: 1, y: 0 }}
                        exit={
                          reducedMotion
                            ? { opacity: 0 }
                            : { opacity: 0, y: -8 }
                        }
                        transition={{
                          duration: 0.25,
                          delay: Math.min(index * 0.05, 0.3),
                        }}
                        layout={!reducedMotion}
                      >
                        <EventCard
                          event={event}
                          onPelicanClick={() => handlePelicanClick(event)}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
