import type { NextAuthConfig } from 'next-auth'

// Lightweight config for Edge middleware — no DB calls, no bcrypt
export const authConfig: NextAuthConfig = {
  pages: { signIn: '/login' },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn  = !!auth?.user
      const { pathname } = nextUrl

      // Always allow auth routes and API routes
      if (pathname.startsWith('/api/auth'))    return true
      if (pathname === '/login')               return true
      if (pathname === '/register')            return true

      // Everything else requires auth
      if (!isLoggedIn) return false

      return true
    },
  },
  providers: [], // Providers are configured in auth.ts with bcrypt
}
