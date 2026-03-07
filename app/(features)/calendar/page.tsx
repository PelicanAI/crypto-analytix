'use client'

import { Suspense, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CaretLeft,
  CaretRight,
  CalendarBlank,
  ArrowSquareOut,
  Lightning,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { useCalendar, type CalendarEventEnriched } from '@/hooks/use-calendar'
import { usePelicanPanelContext } from '@/providers/pelican-panel-provider'
import { PelicanIcon } from '@/components/shared/pelican-icon'
import { EmptyState } from '@/components/shared/empty-state'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
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
  upgrade: 'var(--accent-primary)',
  other: 'var(--text-muted)',
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

const IMPACT_CONFIG: Record<EventImpact, { label: string; className: string }> = {
  low: {
    label: 'Low',
    className: 'bg-[rgba(107,114,128,0.15)] text-[var(--text-muted)]',
  },
  medium: {
    label: 'Medium',
    className: 'bg-[rgba(245,158,11,0.15)] text-[#F59E0B]',
  },
  high: {
    label: 'High',
    className: 'bg-[rgba(249,115,22,0.15)] text-[#F97316]',
  },
  critical: {
    label: 'Critical',
    className: 'bg-[rgba(239,68,68,0.15)] text-[#EF4444] animate-pulse',
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
  date: string // YYYY-MM-DD
  day: number
  isCurrentMonth: boolean
  isToday: boolean
}

function buildCalendarGrid(monthStr: string): CalendarDay[] {
  const { year, month } = parseMonth(monthStr)
  const today = getToday()

  // First day of the month (0=Sun, 1=Mon, ...)
  const firstDate = new Date(year, month - 1, 1)
  const firstDayOfWeek = firstDate.getDay()

  // Convert to Mon-start: Mon=0, Tue=1, ..., Sun=6
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

  // Days in month
  const daysInMonth = new Date(year, month, 0).getDate()

  // Build grid
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

  // Fill remaining cells to complete grid (always 6 rows = 42 cells)
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
    <div className="px-[var(--space-page-x)] py-[var(--space-page-y)]">
      <div className="max-w-[1100px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-[55] min-w-0">
            <LoadingSkeleton variant="card" count={3} />
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
${event.pelican_context || 'Analyze this event. What historically happens around events like this? How should the user prepare? What derivatives positioning should they watch?'}`,
      }
      openWithPrompt(
        event.asset ? 'position' : 'news',
        prompt,
        event.asset || null
      )
    },
    [openWithPrompt]
  )

  return (
    <div className="px-[var(--space-page-x)] py-[var(--space-page-y)]">
      <div className="max-w-[1100px] mx-auto">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-[20px] font-semibold text-[var(--text-primary)]">Calendar</h1>
          <span className="text-[12px] text-[var(--text-muted)]">
            Token unlocks, governance, Fed meetings, expirations
          </span>
        </div>

        {/* Loading */}
        {isLoading && events.length === 0 && (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-[55] min-w-0">
              <LoadingSkeleton variant="card" count={3} />
            </div>
            <div className="flex-[45] min-w-0">
              <LoadingSkeleton variant="card" count={3} />
            </div>
          </div>
        )}

        {/* Two-panel layout */}
        {!(isLoading && events.length === 0) && (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left panel: Calendar grid (55%) */}
            <div className="flex-[55] min-w-0">
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden">
                {/* Month navigation header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
                  <motion.button
                    type="button"
                    onClick={() => setMonth(prevMonth(currentMonth))}
                    className="flex items-center justify-center w-8 h-8 rounded-lg
                      cursor-pointer transition-colors duration-150
                      text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                      hover:bg-[rgba(255,255,255,0.05)]"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Previous month"
                  >
                    <CaretLeft size={18} weight="bold" />
                  </motion.button>

                  <span className="text-[15px] font-semibold text-[var(--text-primary)]">
                    {formatMonthLabel(currentMonth)}
                  </span>

                  <motion.button
                    type="button"
                    onClick={() => setMonth(nextMonth(currentMonth))}
                    className="flex items-center justify-center w-8 h-8 rounded-lg
                      cursor-pointer transition-colors duration-150
                      text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                      hover:bg-[rgba(255,255,255,0.05)]"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
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
                      className="text-center text-[11px] uppercase font-medium tracking-wider text-[var(--text-muted)] py-1.5"
                    >
                      {label}
                    </div>
                  ))}
                </div>

                {/* Day grid */}
                <div className="grid grid-cols-7 px-2 pb-2 gap-px">
                  {calendarDays.map((day) => {
                    const dayEvents = eventsByDate[day.date] || []
                    const isSelected = selectedDate === day.date
                    const hasEvents = dayEvents.length > 0

                    return (
                      <motion.button
                        key={day.date}
                        type="button"
                        onClick={() =>
                          setSelectedDate(isSelected ? null : day.date)
                        }
                        className={cn(
                          'relative min-h-[60px] sm:min-h-[68px] rounded-lg p-[6px_8px] cursor-pointer',
                          'transition-all duration-150 text-left',
                          'border',
                          !day.isCurrentMonth && 'opacity-40',
                          day.isToday && !isSelected
                            ? 'border-2 border-[var(--accent-primary)]'
                            : isSelected
                              ? 'bg-[var(--accent-dim)] border-[var(--accent-primary)]'
                              : hasEvents
                                ? 'border-[var(--border-default)] hover:border-[var(--border-hover)] hover:bg-[rgba(255,255,255,0.02)]'
                                : 'border-[var(--border-subtle)] hover:border-[var(--border-hover)] hover:bg-[rgba(255,255,255,0.02)]'
                        )}
                        whileTap={{ scale: 0.97 }}
                      >
                        {/* Day number */}
                        <span
                          className={cn(
                            'block text-[13px] font-mono tabular-nums font-medium',
                            day.isToday
                              ? 'text-[var(--accent-primary)]'
                              : day.isCurrentMonth
                                ? 'text-[var(--text-primary)]'
                                : 'text-[var(--text-muted)]'
                          )}
                        >
                          {day.day}
                        </span>

                        {/* Event dots */}
                        {dayEvents.length > 0 && (
                          <div className="flex gap-[3px] mt-1.5 flex-wrap">
                            {dayEvents.slice(0, 3).map((evt) => (
                              <span
                                key={evt.id}
                                className="block w-[6px] h-[6px] rounded-full flex-shrink-0"
                                style={{
                                  backgroundColor: EVENT_TYPE_COLORS[evt.event_type],
                                }}
                                title={evt.title}
                              />
                            ))}
                            {dayEvents.length > 3 && (
                              <span className="text-[9px] font-mono text-[var(--text-muted)] leading-[6px] ml-0.5">
                                +{dayEvents.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </motion.button>
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
                        className="block w-[6px] h-[6px] rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-[11px] text-[var(--text-muted)]">
                        {EVENT_TYPE_LABELS[type]}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Right panel: Event list (45%) */}
            <div className="flex-[45] min-w-0">
              {/* Panel header */}
              <div className="mb-4">
                <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">
                  {selectedDate ? formatFullDate(selectedDate) : 'Upcoming Events'}
                </h2>
                {selectedDate && (
                  <button
                    type="button"
                    onClick={() => setSelectedDate(null)}
                    className="text-[12px] text-[var(--accent-primary)] hover:text-[var(--accent-hover)]
                      cursor-pointer transition-colors duration-150 mt-1"
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
                  <div className="flex flex-col gap-3">
                    {displayEvents.map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{
                          duration: 0.25,
                          delay: Math.min(index * 0.05, 0.3),
                        }}
                        layout
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
  const typeColor = EVENT_TYPE_COLORS[event.event_type]
  const typeLabel = EVENT_TYPE_LABELS[event.event_type]
  const impactCfg = IMPACT_CONFIG[event.impact]

  return (
    <div
      className="relative rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]
        p-4 transition-all duration-150 hover:border-[var(--border-hover)]"
    >
      {/* Pelican icon top-right */}
      <div className="absolute top-2 right-2">
        <PelicanIcon onClick={onPelicanClick} size={16} />
      </div>

      {/* Event type pill + impact badge */}
      <div className="flex items-center gap-2 mb-2 pr-12">
        <span
          className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide"
          style={{
            backgroundColor: `${typeColor}20`,
            color: typeColor,
          }}
        >
          {typeLabel}
        </span>
        <span
          className={cn(
            'inline-block px-2 py-0.5 rounded text-[10px] font-medium',
            impactCfg.className
          )}
        >
          {impactCfg.label}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-[15px] font-semibold text-[var(--text-primary)] leading-tight mb-1.5 pr-10">
        {event.title}
      </h3>

      {/* Date */}
      <p className="text-[12px] font-mono tabular-nums text-[var(--text-muted)] mb-2">
        {formatEventDate(event.event_date)} at {formatEventTime(event.event_date)}
      </p>

      {/* Asset pill + portfolio badge */}
      {event.asset && (
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold font-mono text-[var(--text-secondary)] bg-[rgba(255,255,255,0.06)]">
            {event.asset}
          </span>
          {event.user_holds && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium text-[var(--accent-primary)] bg-[var(--accent-dim)]">
              <Lightning size={10} weight="fill" />
              In your portfolio
            </span>
          )}
        </div>
      )}

      {/* Description */}
      {event.description && (
        <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mb-2">
          {event.description}
        </p>
      )}

      {/* Source link */}
      {event.source_url && event.source && (
        <a
          href={event.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] text-[var(--accent-primary)]
            hover:text-[var(--accent-hover)] transition-colors duration-150"
        >
          {event.source}
          <ArrowSquareOut size={11} weight="regular" />
        </a>
      )}
    </div>
  )
}
