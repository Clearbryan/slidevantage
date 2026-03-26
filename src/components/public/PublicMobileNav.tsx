'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export function PublicMobileNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="public-nav-mobile" style={{ display: 'none' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ width: 36, height: 36, borderRadius: 6, background: 'none', border: '1px solid var(--line-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)' }}
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {open && (
        <div style={{ position: 'fixed', inset: 0, top: 56, zIndex: 49, background: '#fff', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[
            { href: '/templates', label: 'Templates' },
            { href: '/pricing',   label: 'Pricing'   },
            { href: '/about',     label: 'About'      },
          ].map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              style={{ display: 'block', padding: '13px 16px', fontSize: 15, fontWeight: 500, color: 'var(--ink)', textDecoration: 'none', borderRadius: 6, background: 'none' }}>
              {label}
            </Link>
          ))}
          <div style={{ borderTop: '1px solid var(--line)', marginTop: 12, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {isLoggedIn ? (
              <Link href="/dashboard" onClick={() => setOpen(false)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 44, background: 'var(--brand)', color: '#fff', borderRadius: 6, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                Go to dashboard →
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 44, border: '1px solid var(--line-2)', borderRadius: 6, fontSize: 14, color: 'var(--ink)', textDecoration: 'none', fontWeight: 500 }}>
                  Sign in
                </Link>
                <Link href="/register" onClick={() => setOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 44, background: 'var(--gold)', color: '#030329', borderRadius: 6, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                  Get started free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
