'use client'

import { useEffect, useRef } from 'react'
import { X, AlertTriangle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  children: React.ReactNode
  footer?: React.ReactNode
  footerSplit?: { left: React.ReactNode; right: React.ReactNode }
}

export function Modal({ open, onClose, title, subtitle, size = 'md', children, footer, footerSplit }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const sizeClass = { sm: 'modal-sm', md: 'modal-md', lg: 'modal-lg', xl: 'modal-xl' }[size]

  return (
    <div
      ref={overlayRef}
      className="modal-overlay"
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className={cn('modal', sizeClass)}>
        <div className="modal-header">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="modal-title">{title}</div>
            {subtitle && <div className="modal-subtitle">{subtitle}</div>}
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-icon-sm"
            style={{ marginTop: -2, flexShrink: 0 }}
          >
            <X size={14} />
          </button>
        </div>

        <div className="modal-body">{children}</div>

        {footer && (
          <div className="modal-footer">{footer}</div>
        )}

        {footerSplit && (
          <div className="modal-footer-split">
            <div>{footerSplit.left}</div>
            <div style={{ display: 'flex', gap: 8 }}>{footerSplit.right}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// Confirm delete modal
export function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = 'Delete', loading }: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  loading?: boolean
}) {
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
        <div style={{ padding: '24px 24px 20px' }}>
          <div style={{ width: 36, height: 36, borderRadius: 4, background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <AlertTriangle size={16} color="#dc2626" />
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>{title}</div>
          <div style={{ fontSize: 12.5, color: '#71717a', lineHeight: 1.6 }}>{message}</div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
            <button onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button onClick={onConfirm} disabled={loading} className="btn btn-danger" style={{ background: '#dc2626', color: '#fff', borderColor: '#dc2626' }}>
              {loading ? <><Loader2 size={13} className="animate-spin" /> Deleting…</> : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Modal with tabs
export function TabbedModal({ open, onClose, title, subtitle, size = 'lg', tabs, activeTab, onTabChange, children, footer, footerSplit }: {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  tabs: { id: string; label: string }[]
  activeTab: string
  onTabChange: (id: string) => void
  children: React.ReactNode
  footer?: React.ReactNode
  footerSplit?: { left: React.ReactNode; right: React.ReactNode }
}) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const sizeClass = { sm: 'modal-sm', md: 'modal-md', lg: 'modal-lg', xl: 'modal-xl' }[size]

  return (
    <div className="modal-overlay" onClick={e => { if (e.currentTarget === e.target) onClose() }}>
      <div className={cn('modal', sizeClass)}>
        <div className="modal-header">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="modal-title">{title}</div>
            {subtitle && <div className="modal-subtitle">{subtitle}</div>}
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon-sm" style={{ marginTop: -2, flexShrink: 0 }}>
            <X size={14} />
          </button>
        </div>

        <div className="tabs" style={{ flexShrink: 0 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => onTabChange(t.id)} className={cn('tab', activeTab === t.id && 'active')}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="modal-body">{children}</div>

        {footer && <div className="modal-footer">{footer}</div>}
        {footerSplit && (
          <div className="modal-footer-split">
            <div>{footerSplit.left}</div>
            <div style={{ display: 'flex', gap: 8 }}>{footerSplit.right}</div>
          </div>
        )}
      </div>
    </div>
  )
}
