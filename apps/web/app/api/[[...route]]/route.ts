import {Hono} from 'hono';
import {handle} from 'hono/vercel';
import {cors} from 'hono/cors';
import {db, quotes, quoteResults, policies, documents, aiRecommendations, businessTypes, products, insurers, quoteOptions, adminUsers} from '@shory/db';
import {createQuoteSchema, updateQuoteSchema, acceptQuoteSchema, aiRecommendRequestSchema, ALLOWED_FILE_TYPES, MAX_FILE_SIZE} from '@shory/shared';
import {eq, desc, count, gte} from 'drizzle-orm';
import {ZodError} from 'zod';
import {put} from '@vercel/blob';

export const runtime = 'nodejs';

const app = new Hono().basePath('/api');

// CORS
app.use('*', cors({origin: '*', allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'], allowHeaders: ['Content-Type', 'Authorization']}));

// Helpers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function errorResponse(c: any, code: string, message: string, status: number) {
  return c.json({error: {code, message, status}}, status);
}

// Health
app.get('/health', (c) => c.json({status: 'ok'}));

// ---- CATALOG ----
app.get('/catalog/business-types', async (c) => {
  const rows = await db.select().from(businessTypes);
  return c.json(rows);
});

app.get('/catalog/business-types/:id', async (c) => {
  const id = c.req.param('id');
  const [row] = await db.select().from(businessTypes).where(eq(businessTypes.id, id));
  if (!row) return errorResponse(c, 'NOT_FOUND', `Business type ${id} not found`, 404);
  return c.json(row);
});

app.get('/catalog/products', async (c) => {
  const rows = await db.select().from(products);
  return c.json(rows);
});

app.get('/catalog/insurers', async (c) => {
  const rows = await db.select().from(insurers);
  return c.json(rows);
});

app.get('/catalog/quote-options', async (c) => {
  const rows = await db.select().from(quoteOptions);
  const result: Record<string, unknown> = {};
  for (const row of rows) {
    result[row.id] = row.items;
  }
  return c.json(result);
});

app.get('/catalog/quote-options/:id', async (c) => {
  const id = c.req.param('id');
  const [row] = await db.select().from(quoteOptions).where(eq(quoteOptions.id, id));
  if (!row) return errorResponse(c, 'NOT_FOUND', `Option ${id} not found`, 404);
  return c.json(row.items);
});

// ---- QUOTES ----
app.post('/quotes', async (c) => {
  try {
    const body = await c.req.json();
    const data = createQuoteSchema.parse(body);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [quote] = await db.insert(quotes).values(data as any).returning();
    return c.json(quote, 201);
  } catch (e) {
    if (e instanceof ZodError) return errorResponse(c, 'VALIDATION_ERROR', e.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', '), 400);
    throw e;
  }
});

app.get('/quotes/:id', async (c) => {
  const id = c.req.param('id');
  const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
  if (!quote) return errorResponse(c, 'QUOTE_NOT_FOUND', `Quote ${id} not found`, 404);
  return c.json(quote);
});

app.patch('/quotes/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const data = updateQuoteSchema.parse(body);
    const [quote] = await db.update(quotes)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .set({...data, updatedAt: new Date()} as any)
      .where(eq(quotes.id, id)).returning();
    if (!quote) return errorResponse(c, 'QUOTE_NOT_FOUND', `Quote ${id} not found`, 404);
    return c.json(quote);
  } catch (e) {
    if (e instanceof ZodError) return errorResponse(c, 'VALIDATION_ERROR', e.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', '), 400);
    throw e;
  }
});

app.post('/quotes/:id/submit', async (c) => {
  const id = c.req.param('id');
  const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
  if (!quote) return errorResponse(c, 'QUOTE_NOT_FOUND', `Quote ${id} not found`, 404);
  if (quote.status !== 'draft') return errorResponse(c, 'QUOTE_INVALID_STATE', 'Quote must be in draft status', 409);

  // Simple pricing (mock)
  const providers = [
    {id: 'salama', name: 'Salama Insurance', mult: 1.0, ded: 0.05, cov: 10},
    {id: 'watania', name: 'Watania Takaful', mult: 1.023, ded: 0.04, cov: 11},
    {id: 'orient', name: 'Orient Insurance', mult: 1.218, ded: 0.03, cov: 14},
  ];
  const base = 6000;
  const results = providers.map((p) => {
    const annual = Math.round(base * p.mult);
    return {
      quoteId: id, providerId: p.id, providerName: p.name,
      annualPremium: annual.toString(), monthlyPremium: Math.round(annual / 12).toString(),
      coverageAmount: (annual * p.cov).toString(), deductible: Math.round(annual * p.ded).toString(),
      benefits: {medicalCoverage: true, legalExpenses: annual > 8000},
    };
  });

  const insertedResults = await db.insert(quoteResults).values(results).returning();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await db.update(quotes).set({status: 'quoted', updatedAt: new Date()} as any).where(eq(quotes.id, id));
  return c.json({status: 'quoted', results: insertedResults});
});

app.get('/quotes/:id/results', async (c) => {
  const id = c.req.param('id');
  const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
  if (!quote) return errorResponse(c, 'QUOTE_NOT_FOUND', `Quote ${id} not found`, 404);
  const results = await db.select().from(quoteResults).where(eq(quoteResults.quoteId, id));
  return c.json({quote, results});
});

app.post('/quotes/:id/accept', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const {resultId} = acceptQuoteSchema.parse(body);
    const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
    if (!quote) return errorResponse(c, 'QUOTE_NOT_FOUND', `Quote ${id} not found`, 404);
    if (quote.status !== 'quoted') return errorResponse(c, 'QUOTE_INVALID_STATE', 'Quote must be quoted', 409);
    const [result] = await db.select().from(quoteResults).where(eq(quoteResults.id, resultId));
    if (!result || result.quoteId !== id) return errorResponse(c, 'QUOTE_NOT_FOUND', `Result not found`, 404);

    const now = new Date();
    const endDate = new Date(now);
    endDate.setFullYear(endDate.getFullYear() + 1);
    const policyNumber = `SHR-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const [policy] = await db.insert(policies).values({
      quoteId: id, resultId, policyNumber,
      startDate: now.toISOString().split('T')[0]!,
      endDate: endDate.toISOString().split('T')[0]!,
    }).returning();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.update(quotes).set({status: 'accepted', updatedAt: new Date()} as any).where(eq(quotes.id, id));
    return c.json(policy, 201);
  } catch (e) {
    if (e instanceof ZodError) return errorResponse(c, 'VALIDATION_ERROR', e.errors.map(err => err.message).join(', '), 400);
    throw e;
  }
});

app.get('/quotes/:id/policy', async (c) => {
  const id = c.req.param('id');
  const [policy] = await db.select().from(policies).where(eq(policies.quoteId, id));
  if (!policy) return errorResponse(c, 'QUOTE_NOT_FOUND', `No policy found`, 404);
  const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
  const [result] = await db.select().from(quoteResults).where(eq(quoteResults.id, policy.resultId));
  return c.json({policy, quote, result});
});

// ---- UPLOADS ----
app.post('/uploads', async (c) => {
  const formData = await c.req.formData();
  const file = formData.get('file') as File | null;
  const quoteId = formData.get('quoteId') as string | null;
  if (!file) return errorResponse(c, 'VALIDATION_ERROR', 'File is required', 400);
  if (!quoteId) return errorResponse(c, 'VALIDATION_ERROR', 'quoteId is required', 400);
  if (!ALLOWED_FILE_TYPES.includes(file.type as (typeof ALLOWED_FILE_TYPES)[number])) return errorResponse(c, 'VALIDATION_ERROR', `File type not allowed`, 400);
  if (file.size > MAX_FILE_SIZE) return errorResponse(c, 'UPLOAD_TOO_LARGE', 'File exceeds 10MB', 413);
  const [q] = await db.select().from(quotes).where(eq(quotes.id, quoteId));
  if (!q) return errorResponse(c, 'QUOTE_NOT_FOUND', 'Quote not found', 404);
  const blob = await put(`documents/${quoteId}/${file.name}`, file, {access: 'public'});
  const [doc] = await db.insert(documents).values({quoteId, fileName: file.name, fileType: file.type, blobUrl: blob.url}).returning();
  return c.json(doc, 201);
});

app.get('/uploads/:id', async (c) => {
  const id = c.req.param('id');
  const [doc] = await db.select().from(documents).where(eq(documents.id, id));
  if (!doc) return errorResponse(c, 'NOT_FOUND', 'Document not found', 404);
  return c.json(doc);
});

// ---- AI ----
app.post('/ai/recommend', async (c) => {
  try {
    const body = await c.req.json();
    const {quoteId} = aiRecommendRequestSchema.parse(body);
    const [quote] = await db.select().from(quotes).where(eq(quotes.id, quoteId));
    if (!quote) return errorResponse(c, 'QUOTE_NOT_FOUND', 'Quote not found', 404);
    // Simplified — return mock recommendations if no API key
    const recommendations = [
      {coverageType: 'liability', recommendedAmount: 5000, reasoning: 'Essential for SME protection', priority: 'high' as const},
      {coverageType: 'property', recommendedAmount: 8000, reasoning: 'Covers business assets', priority: 'medium' as const},
    ];
    const [record] = await db.insert(aiRecommendations).values({
      quoteId, inputContext: {industry: quote.industry, emirate: quote.emirate},
      recommendations, modelUsed: 'mock',
    }).returning();
    return c.json({id: record.id, recommendations});
  } catch (e) {
    if (e instanceof ZodError) return errorResponse(c, 'VALIDATION_ERROR', e.errors.map(err => err.message).join(', '), 400);
    throw e;
  }
});

// ---- ADMIN ----
app.get('/admin/quotes', async (c) => {
  const page = Number(c.req.query('page') ?? '1');
  const pageSize = Number(c.req.query('pageSize') ?? '20');
  const status = c.req.query('status');
  const offset = (page - 1) * pageSize;
  const conditions = status ? eq(quotes.status, status as 'draft') : undefined;
  const [data, [{total}]] = await Promise.all([
    db.select().from(quotes).where(conditions).orderBy(desc(quotes.createdAt)).limit(pageSize).offset(offset),
    db.select({total: count()}).from(quotes).where(conditions),
  ]);
  return c.json({data, total, page, pageSize});
});

app.patch('/admin/quotes/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const {status} = body as {status: string};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [quote] = await db.update(quotes).set({status: status as 'draft', updatedAt: new Date()} as any).where(eq(quotes.id, id)).returning();
  if (!quote) return errorResponse(c, 'QUOTE_NOT_FOUND', 'Quote not found', 404);
  return c.json(quote);
});

app.get('/admin/stats', async (c) => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const [[{totalQuotes}], [{quotesThisWeek}], [{acceptedQuotes}], [{pendingQuotes}]] = await Promise.all([
    db.select({totalQuotes: count()}).from(quotes),
    db.select({quotesThisWeek: count()}).from(quotes).where(gte(quotes.createdAt, oneWeekAgo)),
    db.select({acceptedQuotes: count()}).from(quotes).where(eq(quotes.status, 'accepted')),
    db.select({pendingQuotes: count()}).from(quotes).where(eq(quotes.status, 'quoted')),
  ]);
  return c.json({totalQuotes, quotesThisWeek, acceptedQuotes, pendingQuotes});
});

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);
