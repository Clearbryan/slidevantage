'use client'

import { useState, useRef, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { Menu, Bell, Settings, LogOut, ChevronDown, Search } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface TopbarProps {
  name: string
  role: string
  onMenuClick: () => void
}

const SHORTCUTS = [
  { label: 'Dashboard',     href: '/dashboard' },
  { label: 'Templates',     href: '/dashboard/templates' },
  { label: 'Users',         href: '/dashboard/users' },
  { label: 'Subscriptions', href: '/dashboard/subscriptions' },
  { label: 'Payments',      href: '/dashboard/payments' },
  { label: 'Promo codes',   href: '/dashboard/promo-codes' },
  { label: 'Reports',       href: '/dashboard/reports' },
  { label: 'Settings',      href: '/dashboard/settings' },
]

export function Topbar({ name, role, onMenuClick }: TopbarProps) {
  const router = useRouter()
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchOpen, setSearchOpen]   = useState(false)
  const [searchQ, setSearchQ]         = useState('')
  const profileRef = useRef<HTMLDivElement>(null)
  const searchRef  = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLInputElement>(null)
  const initials   = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
      if (searchRef.current  && !searchRef.current.contains(e.target as Node))  { setSearchOpen(false); setSearchQ('') }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Cmd+K opens search
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
        setTimeout(() => inputRef.current?.focus(), 50)
      }
      if (e.key === 'Escape') { setSearchOpen(false); setSearchQ('') }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const results = searchQ
    ? SHORTCUTS.filter(s => s.label.toLowerCase().includes(searchQ.toLowerCase()))
    : SHORTCUTS

  return (
    <header className="topbar">
      {/* Mobile menu */}
      <button onClick={onMenuClick} className="btn btn-ghost btn-icon menu-btn">
        <Menu size={16} />
      </button>

      {/* Search bar */}
      <div ref={searchRef} style={{ position: 'relative' }}>
        <div
          className="search-wrap"
          style={{ width: 220, cursor: 'text' }}
          onClick={() => { setSearchOpen(true); setTimeout(() => inputRef.current?.focus(), 50) }}
        >
          <Search size={13} color="#a1a1aa" style={{ flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            placeholder="Search…"
            onFocus={() => setSearchOpen(true)}
            style={{ pointerEvents: searchOpen ? 'auto' : 'none' }}
          />
          <span style={{ fontSize: 10, color: '#a1a1aa', border: '1px solid #e4e4e7', borderRadius: 3, padding: '1px 5px', marginLeft: 'auto', flexShrink: 0 }}>⌘K</span>
        </div>

        {/* Dropdown */}
        {searchOpen && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0,
            width: 280, background: '#fff',
            border: '1px solid #e4e4e7', borderRadius: 4,
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            zIndex: 50, overflow: 'hidden',
          }}>
            {results.length === 0 ? (
              <div style={{ padding: '12px 14px', fontSize: 12.5, color: '#a1a1aa' }}>No results</div>
            ) : results.map(r => (
              <button
                key={r.href}
                onClick={() => { router.push(r.href); setSearchOpen(false); setSearchQ('') }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, color: '#3f3f46', textAlign: 'left', borderBottom: '1px solid #fafafa' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fafafa' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="1.8"><path d="m9 18 6-6-6-6"/></svg>
                {r.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ flex: 1 }} />

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <button className="btn btn-ghost btn-icon" style={{ position: 'relative' }}>
          <Bell size={15} />
        </button>

        <div style={{ width: 1, height: 18, background: '#f4f4f5', margin: '0 6px' }} />

        {/* Profile */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setProfileOpen(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '4px 8px', background: profileOpen ? '#f4f4f5' : 'transparent',
              border: 'none', cursor: 'pointer', borderRadius: 4,
            }}
          >
            <div style={{ width: 24, height: 24, borderRadius: 3, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9.5, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--ink)', lineHeight: 1 }}>{name}</div>
              <div style={{ fontSize: 10.5, color: '#a1a1aa', marginTop: 1, textTransform: 'capitalize' }}>
                {role.replace(/_/g, ' ')}
              </div>
            </div>
            <ChevronDown size={12} color="#a1a1aa" />
          </button>

          {profileOpen && (
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 6px)',
              width: 190, background: '#fff',
              border: '1px solid #e4e4e7', borderRadius: 4,
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              zIndex: 50, overflow: 'hidden',
            }}>
              <div style={{ padding: '10px 12px', borderBottom: '1px solid #f4f4f5' }}>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--ink)' }}>{name}</div>
                <div style={{ fontSize: 11, color: '#a1a1aa', marginTop: 1, textTransform: 'capitalize' }}>{role.replace(/_/g, ' ')}</div>
              </div>
              <Link href="/dashboard/account" onClick={() => setProfileOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', fontSize: 12.5, color: '#3f3f46', textDecoration: 'none' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fafafa' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none' }}>
                <Settings size={13} color="#a1a1aa" /> Account settings
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 12px', background: 'none', border: 'none', borderTop: '1px solid #f4f4f5', cursor: 'pointer', fontSize: 12.5, color: '#dc2626', textAlign: 'left' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fef2f2' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none' }}>
                <LogOut size={13} color="#dc2626" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
