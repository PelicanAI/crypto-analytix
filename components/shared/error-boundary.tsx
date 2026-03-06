'use client'

import React from 'react'
import { Warning } from '@phosphor-icons/react'
import { logger } from '@/lib/logger'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('ErrorBoundary caught error', {
      error: error.message,
      componentStack: errorInfo.componentStack || 'unknown',
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div
          className="flex flex-col items-center justify-center p-8 rounded-xl"
          style={{ backgroundColor: 'var(--bg-surface)' }}
        >
          <Warning
            size={40}
            weight="regular"
            className="text-[var(--data-warning)]"
          />
          <h3 className="mt-3 text-base font-semibold text-[var(--text-primary)]">
            Something went wrong
          </h3>
          <p className="mt-1 text-[13px] text-[var(--text-secondary)] text-center max-w-sm">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-4 py-2 rounded-lg text-sm font-medium text-white
              bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)]
              cursor-pointer transition-colors duration-150"
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
