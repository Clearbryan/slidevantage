// src/lib/auth.ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

// Import authorize function separately to reduce bundle impact
import { authorizeUser } from './auth-authorize';

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  trustHost: true,

  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        return authorizeUser(credentials);
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session: sessionData }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.accountType = (user as any).accountType;
        token.name = user.name;
        token.email = user.email;
      }

      if (trigger === 'update' && sessionData) {
        if (sessionData.name) token.name = sessionData.name;
        if (sessionData.email) token.email = sessionData.email;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).accountType = token.accountType;

        if (token.name) session.user.name = token.name as string;
        if (token.email) session.user.email = token.email as string;
      }
      return session;
    },
  },

  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
});
