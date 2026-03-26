// src/middleware.ts
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

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
];

const SUPER_ADMIN_ONLY = ['/dashboard/user-admin'];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user as any;
  const isLoggedIn = !!req.auth;

  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/stripe/webhook')
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/upload') && isLoggedIn) {
    return NextResponse.next();
  }

  if (
    pathname === '/' ||
    pathname.startsWith('/templates') ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password' ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/about')
  ) {
    return NextResponse.next();
  }

  if (pathname === '/login' || pathname === '/register') {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/dashboard')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    if (
      SUPER_ADMIN_ONLY.some((r) => pathname.startsWith(r)) &&
      user?.role !== 'super_admin'
    ) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    if (
      ADMIN_ONLY.some((r) => pathname.startsWith(r)) &&
      !['admin', 'super_admin'].includes(user?.role || '')
    ) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
});

// This is the key fix for the Mongoose / Edge build error
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|uploads|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)',
  ],
  unstable_allowDynamic: [
    './src/lib/db.ts',
    './src/lib/auth-authorize.ts',
    './src/lib/auth.ts',
    './src/lib/auth-authorize.ts', // duplicate is harmless
    '**/node_modules/mongoose/**', // allows the browser.umd.js
  ],
};
