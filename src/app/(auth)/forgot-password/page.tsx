import type { Metadata } from 'next'
import { ForgotPasswordForm } from './ForgotPasswordForm'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Reset password — SlideVantage' }

export default function ForgotPasswordPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 40 }}>
          <div style={{ width: 28, height: 28, background: 'var(--gold)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#030329"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em' }}>SlideVantage</span>
        </div>

        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.03em', marginBottom: 6 }}>Reset your password</h1>
          <p style={{ fontSize: 13.5, color: 'var(--ink-4)', lineHeight: 1.6 }}>
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <ForgotPasswordForm />

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: 'var(--ink-4)' }}>
          <Link href="/login" style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>← Back to sign in</Link>
        </div>
      </div>
    </div>
  )
}
