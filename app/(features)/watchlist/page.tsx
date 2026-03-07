'use client'

import { Suspense, useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Binoculars,
  Plus,
  Trash,
  CaretUp,
  CaretDown,
  CaretRight,
  Bell,
  BellSlash,
  X,
} from '@phosphor-icons/react'
import { useWatchlist } from '@/hooks/use-watchlist'
import { usePelicanPanelContext } from '@/providers/pelican-panel-provider'
import { EmptyState } from '@/components/shared/empty-state'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { PelicanIcon } from '@/components/shared/pelican-icon'
import { ASSET_COLORS } from '@/lib/constants'
import type { WatchlistItem, WatchlistAlert, AlertType } from '@/types/watchlist'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ASSET_NAMES: Record<string, string> = {
  BTC: 'Bitcoin', ETH: 'Ethereum', SOL: 'Solana', AVAX: 'Avalanche',
  LINK: 'Chainlink', DOT: 'Polkadot', MATIC: 'Polygon', ADA: 'Cardano',
  DOGE: 'Dogecoin', XRP: 'Ripple', BNB: 'BNB Chain', ATOM: 'Cosmos',
  UNI: 'Uniswap', AAVE: 'Aave', ARB: 'Arbitrum', OP: 'Optimism',
}

const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  'price-above': 'Price Above',
  'price-below': 'Price Below',
  'funding-above': 'Funding Above',
  'funding-below': 'Funding Below',
  'whale-activity': 'Whale Activity',
  'analyst-call': 'Analyst Call',
}

const QUICK_ADD_TICKERS = ['DOGE', 'UNI', 'AAVE', 'ARB', 'OP', 'MATIC']

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number): string {
  if (value >= 1000) {
    return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  if (value >= 1) {
    return '$' + value.toFixed(2)
  }
  // Small values (sub-$1) — show more decimals
  return '$' + value.toFixed(4)
}

function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

function formatFundingRate(rate: number): string {
  const sign = rate >= 0 ? '+' : '\u2212'
  return sign + (Math.abs(rate) * 100).toFixed(3) + '%'
}

// ---------------------------------------------------------------------------
// MiniSparkline — same pattern as portfolio page
// ---------------------------------------------------------------------------

function MiniSparkline({
  data,
  width = 60,
  height = 20,
  color,
}: {
  data: number[]
  width?: number
  height?: number
  color: string
}) {
  if (!data || data.length < 2) return null

  const step = Math.max(1, Math.floor(data.length / 30))
  const sampled = data.filter((_, i) => i % step === 0)

  const min = Math.min(...sampled)
  const max = Math.max(...sampled)
  const range = max - min || 1

  const points = sampled
    .map((val, i) => {
      const x = (i / (sampled.length - 1)) * width
      const y = height - ((val - min) / range) * height
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="inline-block ml-2 opacity-60"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Add Asset Modal
// ---------------------------------------------------------------------------

function AddAssetModal({
  isOpen,
  onClose,
  onAdd,
  existingAssets,
  isAdding,
}: {
  isOpen: boolean
  onClose: () => void
  onAdd: (asset: string, notes?: string) => Promise<void>
  existingAssets: string[]
  isAdding: boolean
}) {
  const [ticker, setTicker] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus on open
  useEffect(() => {
    if (isOpen) {
      setTicker('')
      setNotes('')
      setError(null)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const availableAssets = useMemo(() =>
    Object.keys(ASSET_COLORS).filter((a) => !existingAssets.includes(a)),
    [existingAssets]
  )

  const handleSubmit = async () => {
    const cleaned = ticker.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (!cleaned) {
      setError('Enter a ticker symbol')
      return
    }
    if (!ASSET_COLORS[cleaned]) {
      setError(`Unknown asset: ${cleaned}`)
      return
    }
    if (existingAssets.includes(cleaned)) {
      setError(`${cleaned} is already on your watchlist`)
      return
    }
    setError(null)
    try {
      await onAdd(cleaned, notes || undefined)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            style={{ background: 'var(--bg-overlay)' }}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md mx-4 rounded-xl overflow-hidden"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}
            >
              <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                Add to Watchlist
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md cursor-pointer transition-colors duration-150"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-4 flex flex-col gap-4">
              {/* Ticker input */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold mb-1.5"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Ticker
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
                  placeholder="e.g. SOL"
                  maxLength={10}
                  className="w-full px-3 py-2 rounded-lg text-sm font-mono outline-none transition-colors duration-150"
                  style={{
                    background: 'var(--bg-base)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                />
              </div>

              {/* Suggestion pills */}
              {availableAssets.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {availableAssets.slice(0, 8).map((asset) => (
                    <button
                      key={asset}
                      onClick={() => setTicker(asset)}
                      className="px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all duration-150"
                      style={{
                        color: ticker === asset ? '#fff' : 'var(--text-secondary)',
                        background: ticker === asset
                          ? (ASSET_COLORS[asset] ?? 'var(--accent-primary)')
                          : 'var(--bg-elevated)',
                        border: '1px solid',
                        borderColor: ticker === asset
                          ? 'transparent'
                          : 'var(--border-subtle)',
                      }}
                    >
                      {asset}
                    </button>
                  ))}
                </div>
              )}

              {/* Notes textarea */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold mb-1.5"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Notes <span style={{ color: 'var(--text-muted)' }}>(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Why are you watching this asset?"
                  rows={2}
                  maxLength={500}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none transition-colors duration-150"
                  style={{
                    background: 'var(--bg-base)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              {/* Error */}
              {error && (
                <p className="text-xs font-medium" style={{ color: 'var(--data-negative)' }}>
                  {error}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-5 py-4"
              style={{ borderTop: '1px solid var(--border-subtle)' }}
            >
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors duration-150"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                Cancel
              </button>
              <motion.button
                onClick={handleSubmit}
                disabled={isAdding || !ticker}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white cursor-pointer transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'var(--accent-primary)' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled)
                    e.currentTarget.style.background = 'var(--accent-hover)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--accent-primary)'
                }}
              >
                {isAdding ? 'Adding...' : 'Add to Watchlist'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ---------------------------------------------------------------------------
// Alert Row — single alert with toggle + delete
// ---------------------------------------------------------------------------

function AlertRow({
  alert,
  onToggle,
  onRemove,
}: {
  alert: WatchlistAlert
  onToggle: (id: string, enabled: boolean) => void
  onRemove: (id: string) => void
}) {
  const conditionLabel = useMemo(() => {
    if (alert.alert_type === 'price-above' || alert.alert_type === 'price-below') {
      const price = (alert.condition as { price?: number })?.price
      return price !== undefined ? formatCurrency(price) : ''
    }
    if (alert.alert_type === 'funding-above' || alert.alert_type === 'funding-below') {
      const rate = (alert.condition as { rate?: number })?.rate
      return rate !== undefined ? formatFundingRate(rate) : ''
    }
    return ''
  }, [alert])

  return (
    <div
      className="flex items-center justify-between px-3 py-2 rounded-lg transition-colors duration-150"
      style={{ background: 'var(--bg-base)' }}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium" style={{ color: alert.enabled ? 'var(--text-primary)' : 'var(--text-muted)' }}>
          {ALERT_TYPE_LABELS[alert.alert_type]}
        </span>
        {conditionLabel && (
          <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
            {conditionLabel}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onToggle(alert.id, !alert.enabled)}
          className="p-1.5 rounded-md cursor-pointer transition-colors duration-150"
          style={{ color: alert.enabled ? 'var(--accent-primary)' : 'var(--text-muted)' }}
          title={alert.enabled ? 'Disable alert' : 'Enable alert'}
        >
          {alert.enabled ? <Bell size={14} weight="fill" /> : <BellSlash size={14} />}
        </button>
        <button
          onClick={() => onRemove(alert.id)}
          className="p-1.5 rounded-md cursor-pointer transition-colors duration-150"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--data-negative)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          title="Remove alert"
        >
          <Trash size={14} />
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Add Alert Form (inline)
// ---------------------------------------------------------------------------

function AddAlertForm({
  watchlistId,
  onAdd,
  onCancel,
}: {
  watchlistId: string
  onAdd: (watchlistId: string, type: AlertType, condition: Record<string, unknown>) => Promise<void>
  onCancel: () => void
}) {
  const [alertType, setAlertType] = useState<AlertType>('price-above')
  const [conditionValue, setConditionValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const needsValue = ['price-above', 'price-below', 'funding-above', 'funding-below'].includes(alertType)
  const isPrice = alertType === 'price-above' || alertType === 'price-below'

  const handleSave = async () => {
    setError(null)

    let condition: Record<string, unknown> = {}
    if (needsValue) {
      const num = parseFloat(conditionValue)
      if (isNaN(num) || num <= 0) {
        setError('Enter a valid threshold')
        return
      }
      condition = isPrice ? { price: num } : { rate: num }
    }

    setSaving(true)
    try {
      await onAdd(watchlistId, alertType, condition)
      onCancel()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="flex flex-col gap-2 px-3 py-3 rounded-lg mt-2"
      style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)' }}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={alertType}
          onChange={(e) => {
            setAlertType(e.target.value as AlertType)
            setConditionValue('')
            setError(null)
          }}
          className="px-2 py-1.5 rounded-md text-xs font-medium outline-none cursor-pointer"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-primary)',
          }}
        >
          {Object.entries(ALERT_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        {needsValue && (
          <input
            type="number"
            value={conditionValue}
            onChange={(e) => setConditionValue(e.target.value)}
            placeholder={isPrice ? 'Price ($)' : 'Rate (e.g. 0.0005)'}
            step={isPrice ? '0.01' : '0.0001'}
            className="px-2 py-1.5 rounded-md text-xs font-mono outline-none w-32"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
              fontVariantNumeric: 'tabular-nums',
            }}
          />
        )}

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={onCancel}
            className="px-2.5 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors duration-150"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            Cancel
          </button>
          <motion.button
            onClick={handleSave}
            disabled={saving || (needsValue && !conditionValue)}
            className="px-2.5 py-1.5 rounded-md text-xs font-medium text-white cursor-pointer transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'var(--accent-primary)' }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {saving ? 'Saving...' : 'Save'}
          </motion.button>
        </div>
      </div>
      {error && (
        <p className="text-[11px] font-medium" style={{ color: 'var(--data-negative)' }}>{error}</p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Watchlist Row — expandable with alerts
// ---------------------------------------------------------------------------

function WatchlistRow({
  item,
  alerts,
  isExpanded,
  onToggleExpand,
  onPelicanClick,
  onRemove,
  onToggleAlert,
  onRemoveAlert,
  onAddAlert,
}: {
  item: WatchlistItem
  alerts: WatchlistAlert[]
  isExpanded: boolean
  onToggleExpand: () => void
  onPelicanClick: () => void
  onRemove: () => void
  onToggleAlert: (id: string, enabled: boolean) => void
  onRemoveAlert: (id: string) => void
  onAddAlert: (watchlistId: string, type: AlertType, condition: Record<string, unknown>) => Promise<void>
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [showAddAlert, setShowAddAlert] = useState(false)
  const deleteTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const brandColor = ASSET_COLORS[item.asset] ?? 'var(--text-muted)'
  const name = ASSET_NAMES[item.asset] ?? item.asset
  const activeAlerts = alerts.filter((a) => a.enabled).length

  const change24hColor =
    item.price_change_24h !== undefined
      ? item.price_change_24h >= 0
        ? 'var(--data-positive)'
        : 'var(--data-negative)'
      : 'var(--text-muted)'

  let fundingColor = 'var(--text-muted)'
  if (item.funding_rate !== undefined) {
    const absRate = Math.abs(item.funding_rate)
    if (item.funding_rate < 0) {
      fundingColor = 'var(--data-positive)'
    } else if (absRate > 0.0005) {
      fundingColor = 'var(--data-warning)'
    } else if (absRate > 0.0002) {
      fundingColor = 'var(--data-negative)'
    }
  }

  const sparklineColor =
    item.sparkline && item.sparkline.length >= 2
      ? item.sparkline[item.sparkline.length - 1] >= item.sparkline[0]
        ? 'var(--data-positive)'
        : 'var(--data-negative)'
      : 'var(--text-muted)'

  const handleDeleteClick = () => {
    if (confirmingDelete) {
      if (deleteTimeout.current) clearTimeout(deleteTimeout.current)
      onRemove()
      setConfirmingDelete(false)
    } else {
      setConfirmingDelete(true)
      deleteTimeout.current = setTimeout(() => setConfirmingDelete(false), 3000)
    }
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (deleteTimeout.current) clearTimeout(deleteTimeout.current)
    }
  }, [])

  return (
    <>
      {/* Main row */}
      <tr
        className="group cursor-pointer"
        onClick={onToggleExpand}
      >
        {/* Expand arrow */}
        <td className="!py-3 !pl-3 !pr-0 w-8">
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.15 }}
          >
            <CaretRight size={12} style={{ color: 'var(--text-muted)' }} />
          </motion.div>
        </td>

        {/* Asset */}
        <td className="!py-3">
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ backgroundColor: brandColor }}
            >
              {item.asset[0]}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {item.asset}
                </span>
                <span className="hidden sm:inline-block">
                  {item.sparkline && (
                    <MiniSparkline data={item.sparkline} color={sparklineColor} />
                  )}
                </span>
              </div>
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {name}
              </span>
            </div>
          </div>
        </td>

        {/* Price */}
        <td>
          <span className="font-mono text-sm" style={{ color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
            {item.current_price !== undefined ? formatCurrency(item.current_price) : '--'}
          </span>
        </td>

        {/* 24h % */}
        <td className="hidden md:table-cell">
          {item.price_change_24h !== undefined ? (
            <span className="font-mono text-sm inline-flex items-center gap-0.5" style={{ color: change24hColor, fontVariantNumeric: 'tabular-nums' }}>
              {item.price_change_24h >= 0 ? <CaretUp size={12} weight="fill" /> : <CaretDown size={12} weight="fill" />}
              {formatPercent(item.price_change_24h)}
            </span>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>--</span>
          )}
        </td>

        {/* Funding */}
        <td className="hidden md:table-cell">
          {item.funding_rate !== undefined ? (
            <span className="font-mono text-sm" style={{ color: fundingColor, fontVariantNumeric: 'tabular-nums' }}>
              {formatFundingRate(item.funding_rate)}
            </span>
          ) : (
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>--</span>
          )}
        </td>

        {/* Alerts badge */}
        <td className="hidden sm:table-cell">
          {activeAlerts > 0 ? (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
              style={{
                color: 'var(--accent-primary)',
                background: 'var(--accent-dim)',
              }}
            >
              <Bell size={10} weight="fill" />
              <span className="font-mono" style={{ fontVariantNumeric: 'tabular-nums' }}>{activeAlerts}</span>
            </span>
          ) : (
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>\u2014</span>
          )}
        </td>

        {/* Actions */}
        <td className="!py-3" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-0.5">
            <PelicanIcon onClick={onPelicanClick} size={16} />
            <button
              onClick={handleDeleteClick}
              className="p-2 rounded-md cursor-pointer transition-colors duration-150 text-[11px] font-medium"
              style={{
                color: confirmingDelete ? 'var(--data-negative)' : 'var(--text-muted)',
              }}
              onMouseEnter={(e) => {
                if (!confirmingDelete) e.currentTarget.style.color = 'var(--data-negative)'
              }}
              onMouseLeave={(e) => {
                if (!confirmingDelete) e.currentTarget.style.color = 'var(--text-muted)'
              }}
              title={confirmingDelete ? 'Click again to confirm' : 'Remove from watchlist'}
            >
              {confirmingDelete ? (
                <span className="whitespace-nowrap">Remove?</span>
              ) : (
                <Trash size={14} />
              )}
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded section — alerts */}
      <AnimatePresence>
        {isExpanded && (
          <tr>
            <td colSpan={7} className="!p-0">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div
                  className="px-4 py-3 mx-3 mb-3 rounded-lg"
                  style={{
                    background: 'var(--bg-base)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  {/* Notes */}
                  {item.notes && (
                    <p className="text-xs mb-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {item.notes}
                    </p>
                  )}

                  {/* Alerts header */}
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>
                      Alerts
                    </h4>
                    <button
                      onClick={() => setShowAddAlert(!showAddAlert)}
                      className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md cursor-pointer transition-colors duration-150"
                      style={{ color: 'var(--accent-primary)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
                    >
                      <Plus size={12} />
                      Add Alert
                    </button>
                  </div>

                  {/* Alert list */}
                  {alerts.length > 0 ? (
                    <div className="flex flex-col gap-1.5">
                      {alerts.map((alert) => (
                        <AlertRow
                          key={alert.id}
                          alert={alert}
                          onToggle={onToggleAlert}
                          onRemove={onRemoveAlert}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs py-2" style={{ color: 'var(--text-muted)' }}>
                      No alerts configured. Add one to get notified.
                    </p>
                  )}

                  {/* Add alert form */}
                  <AnimatePresence>
                    {showAddAlert && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden"
                      >
                        <AddAlertForm
                          watchlistId={item.id}
                          onAdd={onAddAlert}
                          onCancel={() => setShowAddAlert(false)}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  )
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function WatchlistLoadingState() {
  return (
    <div className="max-w-[880px] mx-auto" style={{ padding: 'var(--space-page-x)' }}>
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 w-28 rounded" style={{ background: 'var(--bg-elevated)' }} />
        <div className="h-9 w-28 rounded-lg" style={{ background: 'var(--bg-elevated)' }} />
      </div>
      <LoadingSkeleton variant="row" count={5} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page content
// ---------------------------------------------------------------------------

function WatchlistPageContent() {
  const {
    items,
    alerts,
    isLoading,
    addAsset,
    removeAsset,
    addAlert,
    removeAlert,
    toggleAlert,
    isAdding,
  } = useWatchlist()

  const { openWithPrompt } = usePelicanPanelContext()
  const [modalOpen, setModalOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const existingAssets = useMemo(() => items.map((i) => i.asset), [items])

  // Pelican prompt for a watchlist asset
  const openWatchlistPelican = useCallback((item: WatchlistItem) => {
    const fundingStr = item.funding_rate !== undefined
      ? formatFundingRate(item.funding_rate) + ' per 8h'
      : 'N/A'
    const changeStr = item.price_change_24h !== undefined
      ? formatPercent(item.price_change_24h)
      : 'N/A'

    openWithPrompt('position', {
      visibleMessage: `Tell me about ${item.asset}`,
      fullPrompt: `[CRYPTO ANALYTIX - WATCHLIST ANALYSIS]
ASSET: ${item.asset} (${ASSET_NAMES[item.asset] ?? item.asset})
CURRENT PRICE: ${item.current_price !== undefined ? formatCurrency(item.current_price) : 'N/A'}
24H CHANGE: ${changeStr}
FUNDING RATE: ${fundingStr}
USER NOTES: ${item.notes || 'None'}
This asset is on the user's watchlist (NOT in their portfolio). Provide analysis on: current market conditions, whether this might be a good entry, key support/resistance levels, and any relevant on-chain or derivatives data. Explain funding rates in TradFi terms (like overnight repo rates).`,
    }, item.asset)
  }, [openWithPrompt])

  // Quick add for empty state
  const handleQuickAdd = useCallback(async (asset: string) => {
    try {
      await addAsset(asset)
    } catch {
      // Error is shown via hook
    }
  }, [addAsset])

  // --- Loading ---
  if (isLoading && items.length === 0) {
    return <WatchlistLoadingState />
  }

  // --- Empty state ---
  if (items.length === 0) {
    return (
      <div className="max-w-[880px] mx-auto" style={{ padding: 'var(--space-page-x)' }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <EmptyState
            icon={Binoculars}
            title="Your watchlist is empty"
            description="Track assets you're interested in with intelligent alerts for price levels, funding rates, whale activity, and analyst calls."
          />
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {QUICK_ADD_TICKERS.map((ticker) => (
              <motion.button
                key={ticker}
                onClick={() => handleQuickAdd(ticker)}
                className="px-3.5 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-150"
                style={{
                  color: 'var(--text-secondary)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                }}
                whileHover={{
                  scale: 1.03,
                  borderColor: ASSET_COLORS[ticker],
                }}
                whileTap={{ scale: 0.97 }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = ASSET_COLORS[ticker] ?? 'var(--border-hover)'
                  e.currentTarget.style.color = 'var(--text-primary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-default)'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: ASSET_COLORS[ticker] }}
                  >
                    {ticker[0]}
                  </span>
                  {ticker}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  // --- Watchlist with items ---
  return (
    <div className="max-w-[880px] mx-auto" style={{ padding: 'var(--space-page-x)' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key="watchlist-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Watchlist
            </h1>
            <motion.button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors duration-150"
              style={{
                color: 'var(--accent-primary)',
                border: '1px solid var(--accent-primary)',
                background: 'transparent',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--accent-dim)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <Plus size={16} weight="bold" />
              Add Asset
            </motion.button>
          </div>

          {/* Watchlist Table */}
          <div className="card !p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="w-8" />
                    <th>Asset</th>
                    <th>Price</th>
                    <th className="hidden md:table-cell">24h</th>
                    <th className="hidden md:table-cell">Funding</th>
                    <th className="hidden sm:table-cell">Alerts</th>
                    <th className="w-24" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const itemAlerts = alerts.filter((a) => a.watchlist_id === item.id)
                    return (
                      <WatchlistRow
                        key={item.id}
                        item={item}
                        alerts={itemAlerts}
                        isExpanded={expandedId === item.id}
                        onToggleExpand={() => setExpandedId(expandedId === item.id ? null : item.id)}
                        onPelicanClick={() => openWatchlistPelican(item)}
                        onRemove={() => removeAsset(item.id)}
                        onToggleAlert={toggleAlert}
                        onRemoveAlert={removeAlert}
                        onAddAlert={addAlert}
                      />
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Add Asset Modal */}
      <AddAssetModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={addAsset}
        existingAssets={existingAssets}
        isAdding={isAdding}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Export with Suspense boundary
// ---------------------------------------------------------------------------

export default function WatchlistPage() {
  return (
    <Suspense fallback={<WatchlistLoadingState />}>
      <WatchlistPageContent />
    </Suspense>
  )
}
