import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import {getWebApiBaseUrl} from './api-base-url';

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const {handlers, signIn, signOut, auth} = (NextAuth as any)({
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

          const apiBaseUrl = getWebApiBaseUrl();

          // Call the API to login (API-first pattern)
          const response = await fetch(`${apiBaseUrl}/api/user/auth/login`, {
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
          return {id: user.id, email: user.email, name: user.name, apiToken: user.apiToken || user.email};
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
    async session({session, token}: any) {
      if (token.sub) session.user.id = token.sub;
      if (typeof token.email === 'string') {
        session.user.email = token.email;
        session.user.apiToken = token.email;
      }
      return session;
    },
    async jwt({token, user}: any) {
      if (user) {
        token.email = user.email;
      }
      return token;
    },
  },
});
