'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export function LoginForm() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await signIn('credentials', { email, password, redirect: false })
      if (res?.error) {
        setError('Invalid email or password')
      } else {
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

      <div style={{ marginBottom: 10 }}>
        <label className="label">Email</label>
        <input
          type="email" autoComplete="email" required
          value={email} onChange={e => setEmail(e.target.value)}
          className="input" placeholder="you@example.com"
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label className="label">Password</label>
        <div style={{ position: 'relative' }}>
          <input
            type={showPw ? 'text' : 'password'} autoComplete="current-password" required
            value={password} onChange={e => setPassword(e.target.value)}
            className="input" placeholder="••••••••"
            style={{ paddingRight: 38 }}
          />
          <button
            type="button" onClick={() => setShowPw(v => !v)}
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#a1a1aa', display: 'flex', padding: 2 }}
          >
            {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>

      <div style={{ textAlign: 'right', marginBottom: 14 }}>
        <Link href='/forgot-password' style={{ fontSize: 12, color: 'var(--brand)', textDecoration: 'none', fontWeight: 500 }}>Forgot password?</Link>
      </div>

      <button
        type="submit" disabled={loading} className="btn btn-primary"
        style={{ width: '100%', height: 33, marginBottom: 24, justifyContent: 'center' }}
      >
        {loading ? <><Loader2 size={13} className="animate-spin" /> Signing in…</> : 'Sign in'}
      </button>

      <div style={{ textAlign: 'center', fontSize: 12, color: '#a1a1aa' }}>
        No account?{' '}
        <Link href="/register" style={{ color: 'var(--ink)', fontWeight: 500, textDecoration: 'none' }}>
          Sign up free
        </Link>
      </div>
    </form>
  )
}
