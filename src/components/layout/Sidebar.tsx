'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard, FileStack, FolderOpen, MonitorPlay,
  Users, CreditCard, DollarSign, Tag, ImageIcon,
  BarChart2, Settings, Shield, LogOut, Download, Heart,
} from 'lucide-react'

const ADMIN_NAV = [
  { section: 'Platform', items: [
    { href: '/dashboard',              label: 'Dashboard',     icon: LayoutDashboard },
  ]},
  { section: 'Content', items: [
    { href: '/dashboard/templates',    label: 'Templates',     icon: FileStack },
    { href: '/dashboard/categories',   label: 'Categories',    icon: FolderOpen },
    { href: '/dashboard/banners',      label: 'Banners',       icon: ImageIcon },
  ]},
  { section: 'Commerce', items: [
    { href: '/dashboard/users',        label: 'Users',         icon: Users },
    { href: '/dashboard/subscriptions',label: 'Subscriptions', icon: CreditCard },
    { href: '/dashboard/payments',     label: 'Payments',      icon: DollarSign },
    { href: '/dashboard/promo-codes',  label: 'Promo Codes',   icon: Tag },
  ]},
  { section: 'Analytics', items: [
    { href: '/dashboard/reports',      label: 'Reports',       icon: BarChart2 },
  ]},
  { section: 'System', items: [
    { href: '/dashboard/user-admin',   label: 'Admin Users',   icon: Shield },
    { href: '/dashboard/settings',     label: 'Settings',      icon: Settings },
  ]},
]

const USER_NAV = [
  { section: 'Browse', items: [
    { href: '/dashboard',                label: 'Overview',      icon: LayoutDashboard },
    { href: '/dashboard/templates',      label: 'Templates',     icon: FileStack },
    { href: '/dashboard/my-downloads',   label: 'My Downloads',  icon: Download },
    { href: '/dashboard/favourites',     label: 'Favourites',    icon: Heart },
  ]},
  { section: 'Account', items: [
    { href: '/dashboard/billing',        label: 'Subscription',  icon: CreditCard },
    { href: '/dashboard/account',        label: 'Account',       icon: Settings },
  ]},
]

interface SidebarProps {
  role: string
  name: string
  email: string
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ role, name, email, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const isAdmin  = ['admin', 'super_admin'].includes(role)
  const nav      = isAdmin ? ADMIN_NAV : USER_NAV

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-overlay md:hidden"
          onClick={onClose}
        />
      )}
      <aside className={`sidebar${isOpen ? ' open' : ''}`}>
        {/* Logo */}
        <div style={{
          height: 'var(--topbar-h)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 14px',
          gap: 8,
          borderBottom: '1px solid rgba(255,255,255,.06)',
          flexShrink: 0,
        }}>
          <div style={{ width: 20, height: 20, background: '#fff', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="var(--brand)">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: '#fff', letterSpacing: '-0.02em' }}>SlideVantage</span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '4px 8px' }}>
          {nav.map(({ section, items }) => (
            <div key={section}>
              <div className="nav-group-label">{section}</div>
              {items.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={`nav-item${isActive(href) ? ' active' : ''}`}
                >
                  <Icon size={14} strokeWidth={isActive(href) ? 2.2 : 1.8} />
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* User */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', padding: '8px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 4 }}>
            <div style={{ width: 24, height: 24, borderRadius: 3, background: 'var(--brand-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9.5, fontWeight: 600, color: '#a1a1aa', flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#a1a1aa', lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
              <div style={{ fontSize: 10.5, color: '#52525b', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</div>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            style={{ display: 'flex', alignItems: 'center', gap: 7, width: '100%', padding: '6px 8px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 4, fontSize: 12.5, color: '#71717a' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#ef4444'; (e.currentTarget as HTMLElement).style.background = '#1c0a0a' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#71717a'; (e.currentTarget as HTMLElement).style.background = 'none' }}
          >
            <LogOut size={13} strokeWidth={1.8} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
