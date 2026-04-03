import {Hono} from 'hono';
import {db, customers} from '@shory/db';
import {eq, sql} from 'drizzle-orm';
import {errorResponse, handleZodError} from '../middleware/error-handler.js';
import {ZodError} from 'zod';
import {z} from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  company: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const userAuthRouter = new Hono();

// POST /user/auth/register
userAuthRouter.post('/register', async (c) => {
  try {
    const body = await c.req.json();
    const data = registerSchema.parse(body);

    // Check if email already exists
    const existing = await db
      .select()
      .from(customers)
      .where(eq(customers.email, data.email));

    if (existing.length > 0) {
      // Update password via raw SQL to guarantee it writes
      const newHash = await hashPassword(data.password);
      await db.execute(sql`UPDATE customers SET password_hash = ${newHash}, updated_at = NOW() WHERE email = ${data.email}`);
      return c.json({id: existing[0].id, email: existing[0].email, name: existing[0].name}, 200);
    }

    const pwHash = await hashPassword(data.password);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [user] = await db
      .insert(customers)
      .values({
        email: data.email,
        name: data.name,
        phone: data.phone,
        company: data.company ?? '',
      } as any)
      .returning();

    // Set password via raw SQL to guarantee the column is written
    await db.execute(sql`UPDATE customers SET password_hash = ${pwHash} WHERE id = ${user.id}::uuid`);

    return c.json(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      201
    );
  } catch (e) {
    if (e instanceof ZodError) return handleZodError(c, e);
    throw e;
  }
});

// POST /user/auth/login
userAuthRouter.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const data = loginSchema.parse(body);

    const [user] = await db
      .select()
      .from(customers)
      .where(eq(customers.email, data.email));

    if (!user || !user.passwordHash) {
      return errorResponse(c, 'INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }

    const hashedInput = await hashPassword(data.password);
    if (user.passwordHash !== hashedInput) {
      return errorResponse(c, 'INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }

    return c.json({
      id: user.id,
      email: user.email,
      name: user.name,
      apiToken: user.email,
    });
  } catch (e) {
    if (e instanceof ZodError) return handleZodError(c, e);
    throw e;
  }
});
