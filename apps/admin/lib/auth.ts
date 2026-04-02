import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import {db, adminUsers} from '@shory/db';
import {eq} from 'drizzle-orm';

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

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

          const [user] = await db
            .select()
            .from(adminUsers)
            .where(eq(adminUsers.email, credentials.email as string));

          if (!user) {
            return null;
          }

          const hashedInput = await hashPassword(credentials.password as string);
          if (user.passwordHash !== hashedInput) {
            return null;
          }

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
      if (token.role) (session.user as unknown as Record<string, unknown>).role = token.role;
      if (token.email)
        (session.user as unknown as Record<string, unknown>).apiToken = token.email;
      return session;
    },
    async jwt({token, user}) {
      if (user) {
        token.role = (user as Record<string, unknown>).role;
      }
      return token;
    },
  },
});
