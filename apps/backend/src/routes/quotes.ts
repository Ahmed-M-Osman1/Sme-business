import {Hono} from 'hono';
import {db, quotes, quoteResults, policies} from '@shory/db';
import {createQuoteSchema, updateQuoteSchema, acceptQuoteSchema} from '@shory/shared';
import {eq} from 'drizzle-orm';
import {errorResponse, handleZodError} from '../middleware/error-handler';
import {ZodError} from 'zod';
import {calculateQuotes} from '../pricing/engine';

export const quotesRouter = new Hono();

// POST /quotes — create draft
quotesRouter.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const data = createQuoteSchema.parse(body);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [quote] = await db.insert(quotes).values(data as any).returning();
    return c.json(quote, 201);
  } catch (e) {
    if (e instanceof ZodError) return handleZodError(c, e);
    throw e;
  }
});

// GET /quotes/:id
quotesRouter.get('/:id', async (c) => {
  const id = c.req.param('id');
  const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
  if (!quote) return errorResponse(c, 'QUOTE_NOT_FOUND', `Quote ${id} not found`, 404);
  return c.json(quote);
});

// PATCH /quotes/:id — update
quotesRouter.patch('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const data = updateQuoteSchema.parse(body);
    const [quote] = await db
      .update(quotes)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .set({...data, updatedAt: new Date()} as any)
      .where(eq(quotes.id, id))
      .returning();
    if (!quote) return errorResponse(c, 'QUOTE_NOT_FOUND', `Quote ${id} not found`, 404);
    return c.json(quote);
  } catch (e) {
    if (e instanceof ZodError) return handleZodError(c, e);
    throw e;
  }
});

// POST /quotes/:id/submit — run pricing engine
quotesRouter.post('/:id/submit', async (c) => {
  const id = c.req.param('id');
  const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
  if (!quote) return errorResponse(c, 'QUOTE_NOT_FOUND', `Quote ${id} not found`, 404);
  if (quote.status !== 'draft') {
    return errorResponse(c, 'QUOTE_INVALID_STATE', 'Quote must be in draft status to submit', 409);
  }

  const results = await calculateQuotes({
    industry: quote.industry,
    businessType: quote.businessType,
    employeesCount: quote.employeesCount,
    emirate: quote.emirate,
    coverageType: quote.coverageType,
  });

  const insertedResults = await db
    .insert(quoteResults)
    .values(
      results.map((r) => ({
        quoteId: id,
        providerId: r.providerId,
        providerName: r.providerName,
        annualPremium: r.annualPremium.toString(),
        monthlyPremium: r.monthlyPremium.toString(),
        coverageAmount: r.coverageAmount.toString(),
        deductible: r.deductible.toString(),
        benefits: r.benefits,
      })),
    )
    .returning();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await db.update(quotes).set({status: 'quoted', updatedAt: new Date()} as any).where(eq(quotes.id, id));

  return c.json({status: 'quoted', results: insertedResults});
});

// GET /quotes/:id/results
quotesRouter.get('/:id/results', async (c) => {
  const id = c.req.param('id');
  const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
  if (!quote) return errorResponse(c, 'QUOTE_NOT_FOUND', `Quote ${id} not found`, 404);

  const results = await db.select().from(quoteResults).where(eq(quoteResults.quoteId, id));
  return c.json({quote, results});
});

// POST /quotes/:id/accept — create policy
quotesRouter.post('/:id/accept', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const {resultId} = acceptQuoteSchema.parse(body);

    const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
    if (!quote) return errorResponse(c, 'QUOTE_NOT_FOUND', `Quote ${id} not found`, 404);
    if (quote.status !== 'quoted') {
      return errorResponse(c, 'QUOTE_INVALID_STATE', 'Quote must be in quoted status to accept', 409);
    }

    const [result] = await db.select().from(quoteResults).where(eq(quoteResults.id, resultId));
    if (!result || result.quoteId !== id) {
      return errorResponse(c, 'QUOTE_NOT_FOUND', `Result ${resultId} not found for quote ${id}`, 404);
    }

    const now = new Date();
    const endDate = new Date(now);
    endDate.setFullYear(endDate.getFullYear() + 1);
    const policyNumber = `SHR-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const [policy] = await db
      .insert(policies)
      .values({
        quoteId: id,
        resultId,
        policyNumber,
        startDate: now.toISOString().split('T')[0]!,
        endDate: endDate.toISOString().split('T')[0]!,
      })
      .returning();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.update(quotes).set({status: 'accepted', updatedAt: new Date()} as any).where(eq(quotes.id, id));

    return c.json(policy, 201);
  } catch (e) {
    if (e instanceof ZodError) return handleZodError(c, e);
    throw e;
  }
});

// GET /quotes/:id/policy
quotesRouter.get('/:id/policy', async (c) => {
  const id = c.req.param('id');
  const [policy] = await db.select().from(policies).where(eq(policies.quoteId, id));
  if (!policy) return errorResponse(c, 'QUOTE_NOT_FOUND', `No policy found for quote ${id}`, 404);

  const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
  const [result] = await db.select().from(quoteResults).where(eq(quoteResults.id, policy.resultId));

  return c.json({policy, quote, result});
});
