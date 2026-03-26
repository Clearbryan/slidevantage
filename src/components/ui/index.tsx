import { Loader2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

type BadgeVariant = 'green'|'yellow'|'red'|'blue'|'purple'|'gray'|'orange'

export function Badge({ variant='gray', dot=true, children }: { variant?: BadgeVariant; dot?: boolean; children: React.ReactNode }) {
  return (
    <span className={`badge badge-${variant}`}>
      {dot && <span className="badge-dot" />}
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, BadgeVariant> = {
    active:'green', published:'green', succeeded:'green',
    suspended:'yellow', trialing:'yellow', pending:'yellow', draft:'yellow',
    inactive:'gray', free:'gray', archived:'gray',
    cancelled:'red', expired:'red', failed:'red',
    premium:'yellow', subscriber:'yellow', pro:'yellow',
    refunded:'orange',
  }
  return <Badge variant={map[status]??'gray'}>{status}</Badge>
}

export function PlanBadge({ name }: { name: string }) {
  const lower = name.toLowerCase()
  const v: BadgeVariant = lower === 'free' || lower.includes('free') ? 'gray' : 'yellow'
  return <Badge variant={v} dot={false}>{name}</Badge>
}

export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={cn('skeleton', className)} style={style} />
}

export function Spinner({ size=14, color='#a1a1aa' }: { size?: number; color?: string }) {
  return <Loader2 size={size} className="animate-spin" color={color} />
}

export function Empty({ message='No results found', icon }: { message?: string; icon?: React.ReactNode }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'48px 20px', color:'#a1a1aa' }}>
      {icon && <div style={{ marginBottom:12, opacity:.35 }}>{icon}</div>}
      <div style={{ fontSize:12.5 }}>{message}</div>
    </div>
  )
}

export function FormField({ label, error, hint, required, children }: { label?: string; error?: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
      {label && <label className="label">{label}{required && <span style={{ color:'#dc2626', marginLeft:2 }}>*</span>}</label>}
      {children}
      {hint && !error && <span style={{ fontSize:11.5, color:'#a1a1aa' }}>{hint}</span>}
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel='Delete', loading, variant='danger' }: {
  open: boolean; onClose: ()=>void; onConfirm: ()=>void
  title: string; message: string; confirmLabel?: string; loading?: boolean; variant?: 'danger'|'primary'
}) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-sm" onClick={e=>e.stopPropagation()} style={{ maxWidth:380 }}>
        <div style={{ padding:'22px 22px 18px' }}>
          <div style={{ width:36, height:36, borderRadius:4, background:variant==='danger'?'#fef2f2':'#f4f4f5', border:`1px solid ${variant==='danger'?'#fecaca':'#e4e4e7'}`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
            <AlertTriangle size={16} color={variant==='danger'?'#dc2626':'#52525b'} />
          </div>
          <div style={{ fontSize:14, fontWeight:600, color:'var(--ink)', marginBottom:6 }}>{title}</div>
          <div style={{ fontSize:12.5, color:'#71717a', lineHeight:1.6 }}>{message}</div>
          <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:20 }}>
            <button onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button onClick={onConfirm} disabled={loading} className={`btn ${variant==='danger' ? 'btn-danger' : 'btn-primary'}`} style={variant==='danger' ? { background:'#dc2626', color:'#fff', borderColor:'#dc2626' } : {}}>
              {loading ? <><Spinner size={13} color="#fff" />{confirmLabel}…</> : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
