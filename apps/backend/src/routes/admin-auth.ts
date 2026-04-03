import {Hono} from 'hono';
import {db, adminUsers} from '@shory/db';
import {eq} from 'drizzle-orm';
import {z, ZodError} from 'zod';
import {errorResponse, handleZodError} from '../middleware/error-handler';

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

export const adminAuthRouter = new Hono();

adminAuthRouter.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const data = loginSchema.parse(body);

    const [user] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, data.email));

    if (!user) {
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
      role: user.role,
      apiToken: user.email,
    });
  } catch (e) {
    if (e instanceof ZodError) return handleZodError(c, e);
    throw e;
  }
});
