'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ArrowUp } from '@phosphor-icons/react'

// ─── Types ──────────────────────────────────────────────────────

interface PortalInputProps {
  onSend: (text: string) => void
  disabled?: boolean
  isMobile?: boolean
}

// ─── Constants ──────────────────────────────────────────────────

const MAX_LENGTH = 3000
const WARN_THRESHOLD = 1500
const CAUTION_THRESHOLD = 2500
const DANGER_THRESHOLD = 2800
const MAX_TEXTAREA_HEIGHT = 160

// ─── Portal Input ───────────────────────────────────────────────

export function PortalInput({
  onSend,
  disabled = false,
  isMobile = false,
}: PortalInputProps) {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const [pressed, setPressed] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Auto-resize textarea on value change
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, MAX_TEXTAREA_HEIGHT) + 'px'
  }, [value])

  // Auto-focus on mount (desktop only)
  useEffect(() => {
    if (!isMobile && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isMobile])

  // Re-focus when streaming finishes (disabled goes from true -> false)
  useEffect(() => {
    if (!disabled && !isMobile && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [disabled, isMobile])

  const handleSend = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    // Reset textarea height after clearing
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [value, disabled, onSend])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend],
  )

  // Focus/blur on the wrapper (handles relatedTarget to avoid flicker)
  const handleWrapperFocus = useCallback(() => {
    setFocused(true)
  }, [])

  const handleWrapperBlur = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
        setFocused(false)
      }
    },
    [],
  )

  const canSend = value.trim().length > 0 && !disabled
  const showCounter = value.length > WARN_THRESHOLD

  // Character counter color
  let counterColor = 'var(--text-muted)'
  if (value.length >= DANGER_THRESHOLD) {
    counterColor = 'var(--data-negative)'
  } else if (value.length >= CAUTION_THRESHOLD) {
    counterColor = 'var(--data-warning)'
  }

  return (
    <div className="shrink-0 relative">
      {/* Gradient fade — sits above this component, fading messages into input */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: '100%',
          height: 80,
          pointerEvents: 'none',
          background:
            'linear-gradient(to top, var(--bg-base) 0%, transparent 100%)',
          zIndex: 10,
        }}
      />

      {/* Input area */}
      <div
        style={{
          padding: '16px 20px',
          paddingBottom: isMobile
            ? 'calc(16px + env(safe-area-inset-bottom, 0px))'
            : 16,
        }}
      >
        {/* Input wrapper with focus ring */}
        <div
          ref={wrapperRef}
          onFocus={handleWrapperFocus}
          onBlur={handleWrapperBlur}
          className="flex items-end gap-2"
          style={{
            backgroundColor: 'rgba(255,255,255,0.02)',
            border: `1px solid ${focused ? 'var(--accent-muted)' : 'var(--border-subtle)'}`,
            borderRadius: 14,
            padding: '12px 16px',
            boxShadow: focused
              ? '0 0 0 3px var(--accent-dim), 0 2px 8px rgba(0,0,0,0.15)'
              : 'none',
            transition: 'border-color 200ms, box-shadow 200ms',
          }}
        >
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              if (e.target.value.length <= MAX_LENGTH) {
                setValue(e.target.value)
              }
            }}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Ask Pelican anything about crypto..."
            rows={1}
            className="flex-1 bg-transparent border-none outline-none resize-none"
            style={{
              fontSize: 14,
              lineHeight: '1.5',
              color: 'var(--text-primary)',
              fontFamily: 'inherit',
              maxHeight: MAX_TEXTAREA_HEIGHT,
            }}
          />

          {/* Send button */}
          <button
            onClick={handleSend}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            disabled={!canSend}
            className="flex items-center justify-center shrink-0 cursor-pointer disabled:cursor-not-allowed"
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: 'var(--accent-gradient)',
              opacity: canSend ? 1 : 0.25,
              color: 'white',
              transform: pressed && canSend
                ? 'scale(0.95)'
                : 'scale(1)',
              filter: 'brightness(1)',
              transition: 'transform 100ms ease, filter 150ms ease, opacity 200ms ease',
            }}
            onMouseEnter={(e) => {
              if (canSend) {
                e.currentTarget.style.filter = 'brightness(1.1)'
                if (!pressed) {
                  e.currentTarget.style.transform = 'scale(1.05)'
                }
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = 'brightness(1)'
              e.currentTarget.style.transform = 'scale(1)'
              setPressed(false)
            }}
            aria-label="Send message"
          >
            <ArrowUp size={16} weight="bold" />
          </button>
        </div>

        {/* Character counter (only visible above threshold) */}
        {showCounter && (
          <div
            className="text-right mt-1.5 font-mono tabular-nums"
            style={{
              fontSize: 10,
              color: counterColor,
              transition: 'color 200ms ease',
            }}
          >
            {value.length} / {MAX_LENGTH}
          </div>
        )}
      </div>
    </div>
  )
}
