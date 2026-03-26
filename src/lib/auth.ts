import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db'
import { Admin, User } from '@/models'

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        await connectDB()
        const email    = (credentials.email as string).toLowerCase().trim()
        const password = credentials.password as string

        const admin = await Admin.findOne({ email }).lean()
        if (admin) {
          const valid = await bcrypt.compare(password, (admin as any).passwordHash)
          if (!valid) return null
          await Admin.findByIdAndUpdate((admin as any)._id, { lastLogin: new Date() })
          return {
            id:          (admin as any)._id.toString(),
            email:       (admin as any).email,
            name:        (admin as any).name,
            role:        (admin as any).role,
            accountType: 'admin',
          }
        }

        const user = await User.findOne({ email, isActive: true }).lean()
        if (user && (user as any).passwordHash) {
          const valid = await bcrypt.compare(password, (user as any).passwordHash)
          if (!valid) return null
          return {
            id:          (user as any)._id.toString(),
            email:       (user as any).email,
            name:        (user as any).name + ' ' + (user as any).surname,
            role:        (user as any).role,
            accountType: 'user',
          }
        }

        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session: sessionData }) {
      // On initial login
      if (user) {
        token.id          = user.id
        token.role        = (user as any).role
        token.accountType = (user as any).accountType
        token.name        = user.name
        token.email       = user.email
      }
      // On explicit update() call from client
      if (trigger === 'update' && sessionData) {
        if (sessionData.name)  token.name  = sessionData.name
        if (sessionData.email) token.email = sessionData.email
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id          = token.id
        ;(session.user as any).role        = token.role
        ;(session.user as any).accountType = token.accountType
        if (token.name)  session.user.name  = token.name as string
        if (token.email) session.user.email = token.email as string
      }
      return session
    },
  },
  pages:   { signIn: '/login' },
  session: { strategy: 'jwt' },
})
