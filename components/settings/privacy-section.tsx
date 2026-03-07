'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Warning,
  Export,
  Trash,
} from '@phosphor-icons/react'
import { SectionHeading } from './account-section'

// ---------------------------------------------------------------------------
// Delete Account Modal
// ---------------------------------------------------------------------------

function DeleteAccountModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isDeleting: boolean
}) {
  const [confirmText, setConfirmText] = useState('')

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ backgroundColor: 'var(--bg-overlay)' }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-full max-w-md rounded-2xl p-6"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(239,68,68,0.12)' }}
                >
                  <Warning size={20} weight="fill" style={{ color: 'var(--data-negative)' }} />
                </div>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Delete Account
                </h3>
              </div>

              <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                This action is permanent and cannot be undone. All your data, including portfolio history, saved insights, and Pelican conversation history will be permanently deleted.
              </p>

              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                Type <span className="font-mono font-semibold" style={{ color: 'var(--data-negative)' }}>DELETE</span> to confirm.
              </p>

              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE"
                className="w-full px-3 py-2.5 rounded-lg text-sm font-mono outline-none transition-colors duration-150 mb-4"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--data-negative)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-default)')}
                autoComplete="off"
              />

              <div className="flex gap-3 justify-end">
                <button
                  onClick={onClose}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors duration-150"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-elevated)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={confirmText !== 'DELETE' || isDeleting}
                  className="px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: confirmText === 'DELETE' ? 'var(--data-negative)' : 'rgba(239,68,68,0.2)',
                    color: '#fff',
                  }}
                >
                  {isDeleting ? 'Deleting...' : 'Delete My Account'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ---------------------------------------------------------------------------
// Privacy Section
// ---------------------------------------------------------------------------

interface PrivacySectionProps {
  onDeleteAccount: () => Promise<void>
  isDeleting: boolean
}

export function PrivacySection({ onDeleteAccount, isDeleting }: PrivacySectionProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  return (
    <section>
      <SectionHeading>Data & Privacy</SectionHeading>

      {/* Export Data */}
      <div className="flex items-center justify-between py-3">
        <div>
          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>Export My Data</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Download all your portfolio and insight data
          </p>
        </div>
        <button
          disabled
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg opacity-50 cursor-not-allowed"
          style={{
            color: 'var(--text-muted)',
            border: '1px solid var(--border-subtle)',
          }}
          title="Coming soon"
        >
          <Export size={14} />
          Export
        </button>
      </div>

      {/* Delete Account */}
      <div className="flex items-center justify-between py-3">
        <div>
          <p className="text-sm" style={{ color: 'var(--data-negative)' }}>Delete Account</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Permanently delete your account and all data
          </p>
        </div>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer transition-colors duration-150"
          style={{
            color: 'var(--data-negative)',
            border: '1px solid rgba(239,68,68,0.2)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <Trash size={14} />
          Delete
        </button>
      </div>

      {/* Privacy note */}
      <p
        className="text-xs italic mt-2"
        style={{ color: 'var(--text-muted)' }}
      >
        Your data is encrypted at rest and never shared with third parties. Exchange connections are read-only via SnapTrade — we never access your trading keys.
      </p>

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          await onDeleteAccount()
          setShowDeleteModal(false)
        }}
        isDeleting={isDeleting}
      />
    </section>
  )
}
