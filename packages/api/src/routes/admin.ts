import {Hono} from 'hono';
import {db, quotes} from '@shory/db';
import {eq, desc, count, gte} from 'drizzle-orm';
import {adminAuth} from '../middleware/auth';
import {errorResponse} from '../middleware/error-handler';

export const adminRouter = new Hono();

adminRouter.use('*', adminAuth);

// GET /admin/quotes
adminRouter.get('/quotes', async (c) => {
  const page = Number(c.req.query('page') ?? '1');
  const pageSize = Number(c.req.query('pageSize') ?? '20');
  const status = c.req.query('status');
  const offset = (page - 1) * pageSize;

  const conditions = status ? eq(quotes.status, status as 'draft') : undefined;

  const [data, [{total}]] = await Promise.all([
    db
      .select()
      .from(quotes)
      .where(conditions)
      .orderBy(desc(quotes.createdAt))
      .limit(pageSize)
      .offset(offset),
    db
      .select({total: count()})
      .from(quotes)
      .where(conditions),
  ]);

  return c.json({data, total, page, pageSize});
});

// PATCH /admin/quotes/:id
adminRouter.patch('/quotes/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const {status} = body as {status: string};

  const validStatuses = ['draft', 'submitted', 'quoted', 'accepted', 'expired', 'rejected'];
  if (!validStatuses.includes(status)) {
    return errorResponse(c, 'VALIDATION_ERROR', `Invalid status: ${status}`, 400);
  }

  const [quote] = await db
    .update(quotes)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .set({status: status as 'draft', updatedAt: new Date()} as any)
    .where(eq(quotes.id, id))
    .returning();

  if (!quote) return errorResponse(c, 'QUOTE_NOT_FOUND', `Quote ${id} not found`, 404);
  return c.json(quote);
});

// GET /admin/stats
adminRouter.get('/stats', async (c) => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const [[{totalQuotes}], [{quotesThisWeek}], [{acceptedQuotes}], [{pendingQuotes}]] =
    await Promise.all([
      db.select({totalQuotes: count()}).from(quotes),
      db.select({quotesThisWeek: count()}).from(quotes).where(gte(quotes.createdAt, oneWeekAgo)),
      db.select({acceptedQuotes: count()}).from(quotes).where(eq(quotes.status, 'accepted')),
      db.select({pendingQuotes: count()}).from(quotes).where(eq(quotes.status, 'quoted')),
    ]);

  return c.json({totalQuotes, quotesThisWeek, acceptedQuotes, pendingQuotes});
});
