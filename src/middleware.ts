import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

// Only routes that are completely off-limits to regular users
const ADMIN_ONLY = [
  '/dashboard/categories',
  '/dashboard/users',
  '/dashboard/user-admin',
  '/dashboard/subscriptions',
  '/dashboard/payments',
  '/dashboard/promo-codes',
  '/dashboard/banners',
  '/dashboard/reports',
  '/dashboard/settings',
  // NOTE: /dashboard/templates is intentionally NOT here
  // — the page itself shows admin UI to admins and browse UI to users
]

const SUPER_ADMIN_ONLY = ['/dashboard/user-admin']

export default auth((req) => {
  const { pathname } = req.nextUrl
  const user         = req.auth?.user as any
  const isLoggedIn   = !!req.auth

  if (pathname.startsWith('/api/auth'))           return NextResponse.next()
  if (pathname.startsWith('/api/stripe/webhook'))  return NextResponse.next()
  if (pathname.startsWith('/api/upload') && isLoggedIn) return NextResponse.next()

  // Public pages
  if (pathname === '/' || pathname.startsWith('/templates') ||
      pathname === '/forgot-password' || pathname === '/reset-password' ||
      pathname.startsWith('/pricing') || pathname.startsWith('/about'))
    return NextResponse.next()

  // Auth pages
  if (pathname === '/login' || pathname === '/register') {
    if (isLoggedIn) return NextResponse.redirect(new URL('/dashboard', req.url))
    return NextResponse.next()
  }

  // Dashboard
  if (pathname.startsWith('/dashboard')) {
    if (!isLoggedIn) return NextResponse.redirect(new URL('/login', req.url))

    if (SUPER_ADMIN_ONLY.some(r => pathname.startsWith(r)) && user?.role !== 'super_admin')
      return NextResponse.redirect(new URL('/dashboard', req.url))

    if (ADMIN_ONLY.some(r => pathname.startsWith(r)) && !['admin','super_admin'].includes(user?.role))
      return NextResponse.redirect(new URL('/dashboard', req.url))

    return NextResponse.next()
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|uploads|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)'],
}
