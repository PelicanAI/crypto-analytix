'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChartLineUp,
  Wallet,
  CurrencyBtc,
  Fish,
  CalendarBlank,
  type Icon,
} from '@phosphor-icons/react'
import { SLASH_PROMPTS } from '@/lib/pelican-prompts'

// ---------------------------------------------------------------------------
// Slash command definitions
// ---------------------------------------------------------------------------

interface SlashCommand {
  command: string
  label: string
  description: string
  icon: Icon
}

const COMMANDS: SlashCommand[] = [
  {
    command: '/market',
    label: 'Market Overview',
    description: 'Quick crypto market overview',
    icon: ChartLineUp,
  },
  {
    command: '/portfolio',
    label: 'Portfolio Analysis',
    description: 'Analyze my portfolio',
    icon: Wallet,
  },
  {
    command: '/funding',
    label: 'Funding Rates',
    description: 'Current funding rates across major tokens',
    icon: CurrencyBtc,
  },
  {
    command: '/whale',
    label: 'Whale Movements',
    description: 'Recent significant whale movements',
    icon: Fish,
  },
  {
    command: '/calendar',
    label: 'Crypto Calendar',
    description: 'Upcoming crypto events this week',
    icon: CalendarBlank,
  },
]

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SlashCommandMenuProps {
  /** Current input value */
  inputValue: string
  /** Called when a command is selected — sends the resolved prompt */
  onSelectCommand: (prompt: string) => void
  /** Called to clear the input after command selection */
  onClearInput: () => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SlashCommandMenu({
  inputValue,
  onSelectCommand,
  onClearInput,
}: SlashCommandMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [filteredCommands, setFilteredCommands] = useState<SlashCommand[]>([])
  const menuRef = useRef<HTMLDivElement>(null)

  // Determine if we should show the menu
  useEffect(() => {
    const trimmed = inputValue.trim()

    if (!trimmed.startsWith('/')) {
      setIsOpen(false)
      return
    }

    // Filter commands by what the user has typed
    const query = trimmed.toLowerCase()
    const matches = COMMANDS.filter(
      (cmd) =>
        cmd.command.startsWith(query) ||
        cmd.label.toLowerCase().includes(query.slice(1)) ||
        cmd.description.toLowerCase().includes(query.slice(1)),
    )

    setFilteredCommands(matches)
    setIsOpen(matches.length > 0)
    setSelectedIndex(0)
  }, [inputValue])

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : 0,
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCommands.length - 1,
        )
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        const selected = filteredCommands[selectedIndex]
        if (selected) {
          const prompt = SLASH_PROMPTS[selected.command] || selected.description
          onClearInput()
          onSelectCommand(prompt)
          setIsOpen(false)
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false)
      }
    },
    [isOpen, filteredCommands, selectedIndex, onSelectCommand, onClearInput],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Select a command by click
  const handleSelect = useCallback(
    (cmd: SlashCommand) => {
      const prompt = SLASH_PROMPTS[cmd.command] || cmd.description
      onClearInput()
      onSelectCommand(prompt)
      setIsOpen(false)
    },
    [onSelectCommand, onClearInput],
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, y: 8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.97 }}
          transition={{ duration: 0.15 }}
          className="absolute bottom-full left-0 right-0 mb-2 rounded-xl border overflow-hidden"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-default)',
            boxShadow:
              '0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3)',
            zIndex: 50,
          }}
        >
          {/* Header */}
          <div
            className="px-3 py-2"
            style={{
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <span
              className="text-[10px] uppercase font-medium"
              style={{
                color: 'var(--text-muted)',
                letterSpacing: '1.2px',
              }}
            >
              Commands
            </span>
          </div>

          {/* Command list */}
          <div className="py-1">
            {filteredCommands.map((cmd, index) => {
              const CmdIcon = cmd.icon
              const isSelected = index === selectedIndex
              return (
                <button
                  key={cmd.command}
                  onClick={() => handleSelect(cmd)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left cursor-pointer transition-colors duration-100"
                  style={{
                    backgroundColor: isSelected
                      ? 'rgba(255,255,255,0.04)'
                      : 'transparent',
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <CmdIcon
                    size={16}
                    weight="duotone"
                    style={{
                      color: isSelected
                        ? 'var(--accent-primary)'
                        : 'var(--text-muted)',
                      flexShrink: 0,
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="font-mono text-[13px] font-medium"
                        style={{
                          color: isSelected
                            ? 'var(--text-primary)'
                            : 'var(--text-secondary)',
                        }}
                      >
                        {cmd.command}
                      </span>
                      <span
                        className="text-[12px]"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {cmd.description}
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
