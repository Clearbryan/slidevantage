'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

interface Props {
  isLoggedIn: boolean
}

export function PublicNavClient({ isLoggedIn }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <nav style={{ position:'sticky', top:0, zIndex:50, background:'#fff', borderBottom:'1px solid var(--line)' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 40px', height:56, maxWidth:1400, margin:'0 auto' }}>

        {/* Logo */}
        <Link href="/" style={{ display:'flex', alignItems:'center', gap:9, textDecoration:'none', flexShrink:0 }}>
          <div style={{ width:28, height:28, background:'var(--gold)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#030329"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <span style={{ fontSize:15, fontWeight:700, color:'var(--ink)', letterSpacing:'-0.02em' }}>SlideVantage</span>
        </Link>

        {/* Desktop links */}
        <div className="public-nav-desktop" style={{ display:'flex', alignItems:'center', gap:32 }}>
          {[{ href:'/templates', label:'Templates' }, { href:'/pricing', label:'Pricing' }, { href:'/about', label:'About' }].map(({ href, label }) => (
            <Link key={href} href={href} style={{ fontSize:13, color:'var(--ink-3)', textDecoration:'none' }}>{label}</Link>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="public-nav-desktop" style={{ display:'flex', alignItems:'center', gap:8 }}>
          {isLoggedIn ? (
            <Link href="/dashboard" style={{ display:'inline-flex', alignItems:'center', height:34, padding:'0 16px', background:'var(--brand)', color:'#fff', borderRadius:5, fontSize:13, fontWeight:600, textDecoration:'none' }}>
              Dashboard →
            </Link>
          ) : (
            <>
              <Link href="/login" style={{ fontSize:13, color:'var(--ink-3)', textDecoration:'none', padding:'0 4px' }}>Sign in</Link>
              <Link href="/register" style={{ display:'inline-flex', alignItems:'center', height:34, padding:'0 16px', background:'var(--brand)', color:'#fff', borderRadius:5, fontSize:13, fontWeight:600, textDecoration:'none' }}>
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="public-nav-mobile"
          onClick={() => setOpen(v => !v)}
          style={{ display:'none', background:'none', border:'none', cursor:'pointer', padding:6, color:'var(--ink)', marginLeft:'auto' }}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div style={{ position:'fixed', inset:0, zIndex:49 }}>
          {/* Backdrop */}
          <div onClick={() => setOpen(false)} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.4)' }} />
          {/* Panel */}
          <div style={{ position:'absolute', top:56, left:0, right:0, background:'#fff', borderBottom:'1px solid var(--line)', padding:'16px 24px 24px', zIndex:50 }}>
            <nav style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:16 }}>
              {[{ href:'/templates', label:'Templates' }, { href:'/pricing', label:'Pricing' }, { href:'/about', label:'About' }].map(({ href, label }) => (
                <Link key={href} href={href} onClick={() => setOpen(false)}
                  style={{ display:'block', padding:'10px 0', fontSize:15, color:'var(--ink)', textDecoration:'none', borderBottom:'1px solid var(--line)', fontWeight:500 }}>
                  {label}
                </Link>
              ))}
            </nav>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {isLoggedIn ? (
                <Link href="/dashboard" onClick={() => setOpen(false)}
                  style={{ display:'flex', alignItems:'center', justifyContent:'center', height:44, background:'var(--brand)', color:'#fff', borderRadius:6, fontSize:14, fontWeight:600, textDecoration:'none' }}>
                  Dashboard →
                </Link>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)}
                    style={{ display:'flex', alignItems:'center', justifyContent:'center', height:44, border:'1px solid var(--line-2)', borderRadius:6, fontSize:14, color:'var(--ink)', textDecoration:'none', fontWeight:500 }}>
                    Sign in
                  </Link>
                  <Link href="/register" onClick={() => setOpen(false)}
                    style={{ display:'flex', alignItems:'center', justifyContent:'center', height:44, background:'var(--brand)', color:'#fff', borderRadius:6, fontSize:14, fontWeight:700, textDecoration:'none' }}>
                    Get started free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
