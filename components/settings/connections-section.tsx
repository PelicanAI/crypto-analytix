'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowsClockwise,
  LinkBreak,
  Plus,
  UserCircle,
} from '@phosphor-icons/react'
import { formatTimeAgo } from '@/lib/formatters'
import { SectionHeading } from './account-section'

// ---------------------------------------------------------------------------
// Connection Card
// ---------------------------------------------------------------------------

function ConnectionCard({
  connection,
  onSync,
  onDisconnect,
  isSyncing,
}: {
  connection: { id: string; broker_name: string; status: string; account_ids: string[]; last_sync: string | null }
  onSync: () => void
  onDisconnect: (id: string) => void
  isSyncing: boolean
}) {
  const [showConfirm, setShowConfirm] = useState(false)
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleDisconnectClick = () => {
    setShowConfirm(true)
    if (confirmTimer.current) clearTimeout(confirmTimer.current)
    confirmTimer.current = setTimeout(() => setShowConfirm(false), 5000)
  }

  const handleConfirm = () => {
    if (confirmTimer.current) clearTimeout(confirmTimer.current)
    onDisconnect(connection.id)
    setShowConfirm(false)
  }

  const statusDot = {
    active: 'var(--data-positive)',
    error: 'var(--data-negative)',
    revoked: 'var(--data-negative)',
    syncing: 'var(--data-warning)',
  }[connection.status] ?? 'var(--text-muted)'

  const statusLabel = {
    active: 'Connected',
    error: 'Error',
    revoked: 'Revoked',
    syncing: 'Syncing',
  }[connection.status] ?? connection.status

  return (
    <div
      className="rounded-xl p-4 transition-all duration-200"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.15)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-hover)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-subtle)'
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span
            className="text-sm font-semibold capitalize"
            style={{ color: 'var(--text-primary)' }}
          >
            {connection.broker_name}
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: statusDot }}
            />
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {statusLabel}
            </span>
          </div>
        </div>
      </div>

      {connection.account_ids.length > 0 && (
        <p className="text-[11px] font-mono mb-1" style={{ color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
          {connection.account_ids.length} account{connection.account_ids.length !== 1 ? 's' : ''}
        </p>
      )}

      {connection.last_sync && (
        <p className="text-[11px] mb-3" style={{ color: 'var(--text-muted)' }}>
          Last synced {formatTimeAgo(connection.last_sync)}
        </p>
      )}

      <AnimatePresence mode="wait">
        {showConfirm ? (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-2"
          >
            <span className="text-xs" style={{ color: 'var(--data-negative)' }}>
              Disconnect this exchange?
            </span>
            <button
              onClick={handleConfirm}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-colors duration-150"
              style={{ color: '#fff', backgroundColor: 'var(--data-negative)' }}
            >
              Confirm
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-colors duration-150"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              Cancel
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="actions"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-2"
          >
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                color: 'var(--accent-primary)',
                backgroundColor: 'var(--accent-dim)',
              }}
              onMouseEnter={(e) => {
                if (!isSyncing) e.currentTarget.style.backgroundColor = 'var(--accent-muted)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent-dim)'
              }}
            >
              <ArrowsClockwise
                size={14}
                className={isSyncing ? 'animate-spin' : ''}
              />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>

            <button
              onClick={handleDisconnectClick}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer transition-colors duration-150"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--data-negative)'
                e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)'
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <LinkBreak size={14} />
              Disconnect
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Connections Section
// ---------------------------------------------------------------------------

interface ConnectionsSectionProps {
  connections: { id: string; broker_name: string; status: string; account_ids: string[]; last_sync: string | null }[]
  connectionsLoading: boolean
  onConnect: () => void
  onSync: () => void
  onDisconnect: (id: string) => void
  isSyncing: boolean
}

export function ConnectionsSection({
  connections,
  connectionsLoading,
  onConnect,
  onSync,
  onDisconnect,
  isSyncing,
}: ConnectionsSectionProps) {
  return (
    <section>
      <SectionHeading>Exchange Connections</SectionHeading>

      {connectionsLoading ? (
        <div
          className="h-20 rounded-xl shimmer"
        />
      ) : connections.length === 0 ? (
        <div
          className="rounded-xl p-6 text-center"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <UserCircle size={32} weight="thin" style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
          <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
            No exchanges connected
          </p>
          <button
            onClick={onConnect}
            className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg cursor-pointer transition-colors duration-150"
            style={{
              color: 'var(--accent-primary)',
              backgroundColor: 'var(--accent-dim)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-muted)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-dim)')}
          >
            <Plus size={14} weight="bold" />
            Connect Exchange
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {connections.map((conn) => (
            <ConnectionCard
              key={conn.id}
              connection={conn}
              onSync={onSync}
              onDisconnect={onDisconnect}
              isSyncing={isSyncing}
            />
          ))}
          <button
            onClick={onConnect}
            className="flex items-center justify-center gap-1.5 text-xs font-medium py-2.5 rounded-lg cursor-pointer transition-colors duration-150"
            style={{ color: 'var(--text-muted)', border: '1px dashed var(--border-default)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--accent-primary)'
              e.currentTarget.style.borderColor = 'var(--accent-primary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)'
              e.currentTarget.style.borderColor = 'var(--border-default)'
            }}
          >
            <Plus size={12} weight="bold" />
            Add Another Exchange
          </button>
        </div>
      )}
    </section>
  )
}
