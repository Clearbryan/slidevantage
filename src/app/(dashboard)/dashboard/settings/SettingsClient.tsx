'use client'

import { useState } from 'react'
import { Loader2, Check, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props { name: string; email: string; role: string }

export function SettingsClient({ role }: Props) {
  const [site, setSite]         = useState({ siteName: 'SlideVantage', contactEmail: 'support@slidevantage.com', allowRegistrations: true, maintenanceMode: false })
  const [saving, setSaving]     = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    setSaving(false)
    toast.success('Settings saved')
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Settings</div>
          <div className="page-subtitle">Platform configuration</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Site config */}
        <form onSubmit={handleSave} className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 16 }}>Site configuration</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="label">Site name</label>
              <input className="input" value={site.siteName} onChange={e => setSite(p => ({ ...p, siteName: e.target.value }))} />
            </div>
            <div>
              <label className="label">Support email</label>
              <input type="email" className="input" value={site.contactEmail} onChange={e => setSite(p => ({ ...p, contactEmail: e.target.value }))} />
            </div>
          </div>
          <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid #f4f4f5' }}>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : <><Check size={13} /> Save settings</>}
            </button>
          </div>
        </form>

        {/* Toggles */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 16 }}>Access controls</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { key: 'allowRegistrations', label: 'Allow new registrations', sub: 'New users can sign up for accounts' },
              { key: 'maintenanceMode',    label: 'Maintenance mode',         sub: 'Public site shows a maintenance page' },
            ].map(({ key, label, sub }) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f4f4f5' }}>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--ink)' }}>{label}</div>
                  <div style={{ fontSize: 11.5, color: '#a1a1aa', marginTop: 2 }}>{sub}</div>
                </div>
                <label style={{ position: 'relative', display: 'inline-flex', cursor: 'pointer', flexShrink: 0 }}>
                  <input type="checkbox" checked={site[key as keyof typeof site] as boolean}
                    onChange={e => setSite(p => ({ ...p, [key]: e.target.checked }))}
                    style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} />
                  <div style={{ width: 36, height: 20, borderRadius: 10, background: site[key as keyof typeof site] ? 'var(--brand)' : 'var(--line-2)', transition: 'background .15s', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 2, left: site[key as keyof typeof site] ? 18 : 2, width: 16, height: 16, borderRadius: 8, background: '#fff', transition: 'left .15s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Danger zone - super admin only */}
        {role === 'super_admin' && (
          <div className="card" style={{ padding: 20, borderColor: '#fecaca' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 16 }}>
              <AlertTriangle size={14} color="#dc2626" />
              <div style={{ fontSize: 13, fontWeight: 600, color: '#dc2626' }}>Danger zone</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 4 }}>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--ink)' }}>Clear all cache</div>
                <div style={{ fontSize: 11.5, color: '#a1a1aa', marginTop: 1 }}>Force revalidation of all cached pages</div>
              </div>
              <button onClick={() => toast.success('Cache cleared')} className="btn btn-danger btn-sm">Clear cache</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
