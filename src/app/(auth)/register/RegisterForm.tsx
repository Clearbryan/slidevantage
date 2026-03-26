'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export function RegisterForm() {
  const router = useRouter()
  const [form, setForm]      = useState({ name: '', surname: '', email: '', password: '' })
  const [showPw, setShowPw]  = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]    = useState('')

  function update(k: string, v: string) { setForm(p => ({ ...p, [k]: v })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Registration failed'); return }
      toast.success('Account created!')
      const signInRes = await signIn('credentials', { email: form.email, password: form.password, redirect: false })
      if (!signInRes?.error) {
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {error && (
        <div style={{ padding: '9px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 4, fontSize: 12.5, color: '#b91c1c', marginBottom: 14 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
        <div>
          <label className="label">First name</label>
          <input className="input" placeholder="John" required value={form.name} onChange={e => update('name', e.target.value)} />
        </div>
        <div>
          <label className="label">Last name</label>
          <input className="input" placeholder="Smith" required value={form.surname} onChange={e => update('surname', e.target.value)} />
        </div>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label className="label">Email</label>
        <input type="email" className="input" placeholder="you@example.com" required value={form.email} onChange={e => update('email', e.target.value)} />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label className="label">Password</label>
        <div style={{ position: 'relative' }}>
          <input
            type={showPw ? 'text' : 'password'} className="input"
            placeholder="Min. 8 characters" required
            value={form.password} onChange={e => update('password', e.target.value)}
            style={{ paddingRight: 38 }}
          />
          <button type="button" onClick={() => setShowPw(v => !v)}
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#a1a1aa', display: 'flex', padding: 2 }}>
            {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn btn-primary"
        style={{ width: '100%', height: 33, justifyContent: 'center', marginBottom: 24 }}>
        {loading ? <><Loader2 size={13} className="animate-spin" /> Creating account…</> : 'Create account'}
      </button>

      <div style={{ textAlign: 'center', fontSize: 12, color: '#a1a1aa' }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: 'var(--ink)', fontWeight: 500, textDecoration: 'none' }}>Sign in</Link>
      </div>
    </form>
  )
}
