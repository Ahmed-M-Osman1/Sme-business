import type {Context, Next} from 'hono';
import {db, adminUsers, webUsers} from '@shory/db';
import {eq} from 'drizzle-orm';
import {errorResponse} from './error-handler';

export async function adminAuth(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return errorResponse(c, 'UNAUTHORIZED', 'Missing or invalid authorization header', 401);
  }

  const token = authHeader.slice(7);

  // MVP: token is the admin user's email. Production: validate Auth.js session token.
  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, token));

  if (!user) {
    return errorResponse(c, 'UNAUTHORIZED', 'Invalid admin credentials', 401);
  }

  c.set('adminUser', user);
  await next();
}

export async function webUserAuth(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return errorResponse(c, 'UNAUTHORIZED', 'Missing or invalid authorization header', 401);
  }

  const token = authHeader.slice(7);

  // MVP: token is the web user's email. Production: validate Auth.js session token.
  const [user] = await db.select().from(webUsers).where(eq(webUsers.email, token));

  if (!user) {
    return errorResponse(c, 'UNAUTHORIZED', 'Invalid credentials', 401);
  }

  c.set('webUser', user);
  await next();
}
