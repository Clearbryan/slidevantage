import type { Metadata } from 'next'
import { ResetPasswordForm } from './ResetPasswordForm'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Set new password — SlideVantage' }

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>
}) {
  const { token, email } = await searchParams

  return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 40 }}>
          <div style={{ width: 28, height: 28, background: 'var(--gold)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#030329"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em' }}>SlideVantage</span>
        </div>

        {!token || !email ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--red)', marginBottom: 8 }}>Invalid reset link</div>
            <div style={{ fontSize: 13, color: 'var(--ink-4)', marginBottom: 20 }}>This link is invalid or has expired.</div>
            <Link href="/forgot-password" style={{ color: 'var(--brand)', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>Request a new reset link</Link>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.03em', marginBottom: 6 }}>Set new password</h1>
              <p style={{ fontSize: 13.5, color: 'var(--ink-4)' }}>Choose a strong password for your account.</p>
            </div>
            <ResetPasswordForm token={token} email={email} />
          </>
        )}

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <Link href="/login" style={{ color: 'var(--brand)', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>← Back to sign in</Link>
        </div>
      </div>
    </div>
  )
}
