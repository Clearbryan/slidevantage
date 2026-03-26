'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Eye, EyeOff, Check } from 'lucide-react'

export function ResetPasswordForm({ token, email }: { token: string; email: string }) {
  const router = useRouter()
  const [password, setPassword]     = useState('')
  const [confirm, setConfirm]       = useState('')
  const [showPw, setShowPw]         = useState(false)
  const [loading, setLoading]       = useState(false)
  const [done, setDone]             = useState(false)
  const [error, setError]           = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (password !== confirm)  { setError('Passwords do not match'); return }

    setLoading(true)
    try {
      const res  = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Reset failed')
      setDone(true)
      setTimeout(() => router.push('/login'), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div style={{ padding: '24px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, textAlign: 'center' }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
          <Check size={20} color="#16a34a" />
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#15803d', marginBottom: 6 }}>Password updated</div>
        <div style={{ fontSize: 13, color: '#166534' }}>Redirecting you to sign in…</div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <label className="label">New password</label>
        <div style={{ position: 'relative' }}>
          <input
            type={showPw ? 'text' : 'password'}
            className={`input${error ? ' input-error' : ''}`}
            style={{ paddingRight: 38 }}
            placeholder="Min. 8 characters"
            value={password}
            onChange={e => { setPassword(e.target.value); setError('') }}
            autoFocus
          />
          <button type="button" onClick={() => setShowPw(v => !v)}
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-4)', display: 'flex' }}>
            {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
          </button>
        </div>
      </div>

      <div>
        <label className="label">Confirm new password</label>
        <input
          type={showPw ? 'text' : 'password'}
          className={`input${error && confirm ? ' input-error' : ''}`}
          placeholder="Repeat password"
          value={confirm}
          onChange={e => { setConfirm(e.target.value); setError('') }}
        />
        {error && <div className="field-error">{error}</div>}
      </div>

      <button type="submit" disabled={loading}
        style={{ height: 42, background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: 5, fontSize: 14, fontWeight: 600, cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
        {loading ? <><Loader2 size={15} className="animate-spin"/> Updating…</> : 'Set new password'}
      </button>
    </form>
  )
}
