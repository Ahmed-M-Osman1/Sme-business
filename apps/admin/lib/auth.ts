import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import {db, adminUsers} from '@shory/db';
import {eq} from 'drizzle-orm';

export const {handlers, signIn, signOut, auth} = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {label: 'Email', type: 'email'},
        password: {label: 'Password', type: 'password'},
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        const [user] = await db
          .select()
          .from(adminUsers)
          .where(eq(adminUsers.email, credentials.email as string));

        if (!user) return null;
        if (user.passwordHash !== credentials.password) return null;

        return {id: user.id, email: user.email, name: user.name, role: user.role};
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
