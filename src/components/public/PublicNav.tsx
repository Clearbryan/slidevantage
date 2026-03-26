import Link from 'next/link'
import { auth } from '@/lib/auth'
import { PublicNavClient } from './PublicNavClient'

export async function PublicNav() {
  const session = await auth()
  const isLogged = !!session?.user
  return <PublicNavClient isLoggedIn={isLogged} />
}

export function PublicFooter() {
  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,.08)', padding: '40px', background: 'var(--brand)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 24, height: 24, background: 'var(--gold)', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="#030329"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--gold)', letterSpacing: '-0.02em' }}>SlideVantage</span>
            </div>
            <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,.35)', maxWidth: 240, lineHeight: 1.6 }}>
              Professional presentation templates for business teams and creatives.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.25)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Product</div>
              {[
                { href: '/templates', label: 'Templates' },
                { href: '/pricing',   label: 'Pricing'   },
                { href: '/about',     label: 'About'     },
              ].map(({ href, label }) => (
                <div key={href} style={{ marginBottom: 8 }}>
                  <Link href={href} style={{ fontSize: 12.5, color: 'rgba(255,255,255,.45)', textDecoration: 'none' }}>{label}</Link>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.25)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Account</div>
              {[
                { href: '/login',     label: 'Sign in'      },
                { href: '/register',  label: 'Sign up free' },
                { href: '/dashboard', label: 'Dashboard'    },
              ].map(({ href, label }) => (
                <div key={href} style={{ marginBottom: 8 }}>
                  <Link href={href} style={{ fontSize: 12.5, color: 'rgba(255,255,255,.45)', textDecoration: 'none' }}>{label}</Link>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,.25)' }}>© {new Date().getFullYear()} SlideVantage. All rights reserved.</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,.25)' }}>Professional presentation templates</span>
        </div>
      </div>
    </footer>
  )
}
