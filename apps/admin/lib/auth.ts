import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import {getAdminApiBaseUrl} from './api-base-url';

const API_URL = getAdminApiBaseUrl();

export const {handlers, signIn, signOut, auth} = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {label: 'Email', type: 'email'},
        password: {label: 'Password', type: 'password'},
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const response = await fetch(`${API_URL}/api/admin/auth/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            return null;
          }

          const user = await response.json();
          return {id: user.id, email: user.email, name: user.name, role: user.role};
        } catch {
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({session, token}) {
      if (token.sub) session.user.id = token.sub;
      if (typeof token.email === 'string') {
        session.user.email = token.email;
        (session.user as unknown as Record<string, unknown>).apiToken = token.email;
      }
      if (token.role) (session.user as unknown as Record<string, unknown>).role = token.role;
      return session;
    },
    async jwt({token, user}) {
      if (user) {
        token.email = user.email;
        token.role = (user as Record<string, unknown>).role;
      }
      return token;
    },
  },
});
