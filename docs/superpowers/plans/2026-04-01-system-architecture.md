# System Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the API-first backend (Hono REST API, expanded DB schema, pricing engine, AI advisor, file uploads) and wire both Next.js frontends to it.

**Architecture:** Standalone Hono API service in `packages/api/` — the only layer that touches PostgreSQL (Neon), Claude API, and Vercel Blob. Both `apps/web` and `apps/admin` call it via typed fetch wrappers. Admin routes require Auth.js token.

**Tech Stack:** Hono, Drizzle ORM, Neon PostgreSQL, Zod, Vercel Blob, Anthropic SDK, Auth.js 5

---

## Phase 1: Foundation

### Task 1: Expand Database Schema

**Files:**
- Modify: `packages/db/src/schema/quotes.ts`
- Create: `packages/db/src/schema/quote-results.ts`
- Create: `packages/db/src/schema/policies.ts`
- Create: `packages/db/src/schema/documents.ts`
- Create: `packages/db/src/schema/ai-recommendations.ts`
- Modify: `packages/db/src/schema/admin-users.ts`
- Modify: `packages/db/src/index.ts`

- [ ] **Step 1: Add `business_type` and `rejected` status to quotes table**

In `packages/db/src/schema/quotes.ts`, add `businessType` column and expand the status enum to include `rejected`:

```typescript
import {pgTable, text, integer, timestamp, uuid, pgEnum} from 'drizzle-orm/pg-core';

export const quoteStatusEnum = pgEnum('quote_status', [
  'draft',
  'submitted',
  'quoted',
  'accepted',
  'expired',
  'rejected',
]);

export const quotes = pgTable('quotes', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessName: text('business_name').notNull(),
  tradeLicense: text('trade_license'),
  emirate: text('emirate').notNull(),
  industry: text('industry').notNull(),
  businessType: text('business_type'),
  employeesCount: integer('employees_count').notNull(),
  coverageType: text('coverage_type').notNull(),
  status: quoteStatusEnum('status').default('draft').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Quote = typeof quotes.$inferSelect;
export type NewQuote = typeof quotes.$inferInsert;
```

- [ ] **Step 2: Create `quote_results` table**

Create `packages/db/src/schema/quote-results.ts`:

```typescript
import {pgTable, text, integer, numeric, uuid, timestamp, jsonb} from 'drizzle-orm/pg-core';
import {quotes} from './quotes';

export const quoteResults = pgTable('quote_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  quoteId: uuid('quote_id')
    .notNull()
    .references(() => quotes.id),
  providerId: text('provider_id').notNull(),
  providerName: text('provider_name').notNull(),
  monthlyPremium: numeric('monthly_premium', {precision: 10, scale: 2}).notNull(),
  annualPremium: numeric('annual_premium', {precision: 10, scale: 2}).notNull(),
  coverageAmount: numeric('coverage_amount', {precision: 12, scale: 2}).notNull(),
  deductible: numeric('deductible', {precision: 10, scale: 2}).notNull(),
  benefits: jsonb('benefits').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type QuoteResult = typeof quoteResults.$inferSelect;
export type NewQuoteResult = typeof quoteResults.$inferInsert;
```

- [ ] **Step 3: Create `policies` table**

Create `packages/db/src/schema/policies.ts`:

```typescript
import {pgTable, text, uuid, timestamp, date, pgEnum} from 'drizzle-orm/pg-core';
import {quotes} from './quotes';
import {quoteResults} from './quote-results';

export const policyStatusEnum = pgEnum('policy_status', ['active', 'cancelled', 'expired']);

export const policies = pgTable('policies', {
  id: uuid('id').primaryKey().defaultRandom(),
  quoteId: uuid('quote_id')
    .notNull()
    .references(() => quotes.id),
  resultId: uuid('result_id')
    .notNull()
    .references(() => quoteResults.id),
  policyNumber: text('policy_number').notNull().unique(),
  status: policyStatusEnum('status').default('active').notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Policy = typeof policies.$inferSelect;
export type NewPolicy = typeof policies.$inferInsert;
```

- [ ] **Step 4: Create `documents` table**

Create `packages/db/src/schema/documents.ts`:

```typescript
import {pgTable, text, uuid, timestamp} from 'drizzle-orm/pg-core';
import {quotes} from './quotes';

export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  quoteId: uuid('quote_id')
    .notNull()
    .references(() => quotes.id),
  fileName: text('file_name').notNull(),
  fileType: text('file_type').notNull(),
  blobUrl: text('blob_url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
```

- [ ] **Step 5: Create `ai_recommendations` table**

Create `packages/db/src/schema/ai-recommendations.ts`:

```typescript
import {pgTable, text, uuid, timestamp, jsonb} from 'drizzle-orm/pg-core';
import {quotes} from './quotes';

export const aiRecommendations = pgTable('ai_recommendations', {
  id: uuid('id').primaryKey().defaultRandom(),
  quoteId: uuid('quote_id')
    .notNull()
    .references(() => quotes.id),
  inputContext: jsonb('input_context').$type<Record<string, unknown>>().notNull(),
  recommendations: jsonb('recommendations').$type<Record<string, unknown>[]>().notNull(),
  modelUsed: text('model_used').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type AiRecommendation = typeof aiRecommendations.$inferSelect;
export type NewAiRecommendation = typeof aiRecommendations.$inferInsert;
```

- [ ] **Step 6: Add `password_hash` to admin_users**

In `packages/db/src/schema/admin-users.ts`, add the `passwordHash` column:

```typescript
import {pgTable, text, uuid, timestamp, pgEnum} from 'drizzle-orm/pg-core';

export const adminRoleEnum = pgEnum('admin_role', ['admin', 'viewer']);

export const adminUsers = pgTable('admin_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  role: adminRoleEnum('role').default('viewer').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;
```

- [ ] **Step 7: Update db index exports**

Replace `packages/db/src/index.ts` with all new exports:

```typescript
export {db} from './client';

export {quoteStatusEnum, quotes} from './schema/quotes';
export type {Quote, NewQuote} from './schema/quotes';

export {quoteResults} from './schema/quote-results';
export type {QuoteResult, NewQuoteResult} from './schema/quote-results';

export {policyStatusEnum, policies} from './schema/policies';
export type {Policy, NewPolicy} from './schema/policies';

export {documents} from './schema/documents';
export type {Document, NewDocument} from './schema/documents';

export {aiRecommendations} from './schema/ai-recommendations';
export type {AiRecommendation, NewAiRecommendation} from './schema/ai-recommendations';

export {adminRoleEnum, adminUsers} from './schema/admin-users';
export type {AdminUser, NewAdminUser} from './schema/admin-users';
```

- [ ] **Step 8: Generate and push migration**

Run:
```bash
pnpm db:generate
pnpm db:push
```

Expected: Drizzle generates migration for 4 new tables + 2 modified tables. Push applies to local DB.

- [ ] **Step 9: Commit**

```bash
git add packages/db/
git commit -m "feat: expand database schema with quote_results, policies, documents, ai_recommendations tables"
```

---

### Task 2: Expand Shared Schemas and Types

**Files:**
- Modify: `packages/shared/src/schemas/quote.ts`
- Create: `packages/shared/src/schemas/policy.ts`
- Create: `packages/shared/src/schemas/upload.ts`
- Create: `packages/shared/src/schemas/ai.ts`
- Create: `packages/shared/src/types/api.ts`
- Create: `packages/shared/src/types/pricing.ts`
- Modify: `packages/shared/src/index.ts`

- [ ] **Step 1: Expand quote schemas**

Replace `packages/shared/src/schemas/quote.ts`:

```typescript
import {z} from 'zod';
import {EMIRATES, INDUSTRIES, COVERAGE_TYPES, QUOTE_STATUSES} from '../types/quote';

export const createQuoteSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  tradeLicense: z.string().optional(),
  emirate: z.enum(EMIRATES as unknown as [string, ...string[]]),
  industry: z.enum(INDUSTRIES as unknown as [string, ...string[]]),
  businessType: z.string().optional(),
  employeesCount: z.number().int().min(1, 'At least 1 employee required'),
  coverageType: z.enum(COVERAGE_TYPES as unknown as [string, ...string[]]),
});

export const updateQuoteSchema = createQuoteSchema.partial();

export const quoteFormSchema = createQuoteSchema;

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
export type UpdateQuoteInput = z.infer<typeof updateQuoteSchema>;
export type QuoteFormData = z.infer<typeof quoteFormSchema>;
```

- [ ] **Step 2: Create policy schema**

Create `packages/shared/src/schemas/policy.ts`:

```typescript
import {z} from 'zod';

export const acceptQuoteSchema = z.object({
  resultId: z.string().uuid('Invalid result ID'),
});

export type AcceptQuoteInput = z.infer<typeof acceptQuoteSchema>;
```

- [ ] **Step 3: Create upload schema**

Create `packages/shared/src/schemas/upload.ts`:

```typescript
import {z} from 'zod';

export const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'] as const;
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const uploadMetadataSchema = z.object({
  quoteId: z.string().uuid('Invalid quote ID'),
  fileName: z.string().min(1),
  fileType: z.enum(ALLOWED_FILE_TYPES as unknown as [string, ...string[]]),
});

export type UploadMetadata = z.infer<typeof uploadMetadataSchema>;
```

- [ ] **Step 4: Create AI schema**

Create `packages/shared/src/schemas/ai.ts`:

```typescript
import {z} from 'zod';

export const aiRecommendRequestSchema = z.object({
  quoteId: z.string().uuid('Invalid quote ID'),
});

export const recommendationSchema = z.object({
  coverageType: z.string(),
  recommendedAmount: z.number(),
  reasoning: z.string(),
  priority: z.enum(['high', 'medium', 'low']),
});

export type AiRecommendRequest = z.infer<typeof aiRecommendRequestSchema>;
export type Recommendation = z.infer<typeof recommendationSchema>;
```

- [ ] **Step 5: Create API response types**

Create `packages/shared/src/types/api.ts`:

```typescript
export interface ApiError {
  error: {
    code: string;
    message: string;
    status: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminStatsResponse {
  totalQuotes: number;
  quotesThisWeek: number;
  acceptedQuotes: number;
  pendingQuotes: number;
}
```

- [ ] **Step 6: Create pricing types**

Create `packages/shared/src/types/pricing.ts`:

```typescript
export interface QuoteInput {
  industry: string;
  businessType: string | null;
  employeesCount: number;
  emirate: string;
  coverageType: string;
}

export interface PricingResult {
  providerId: string;
  providerName: string;
  monthlyPremium: number;
  annualPremium: number;
  coverageAmount: number;
  deductible: number;
  benefits: Record<string, unknown>;
}

export interface PricingProvider {
  id: string;
  name: string;
  getQuote(input: QuoteInput): Promise<PricingResult>;
}
```

- [ ] **Step 7: Update shared index exports**

Replace `packages/shared/src/index.ts`:

```typescript
// Types
export {QUOTE_STATUSES, EMIRATES, INDUSTRIES, COVERAGE_TYPES} from './types/quote';
export type {QuoteInput, PricingResult, PricingProvider} from './types/pricing';
export type {ApiError, PaginatedResponse, AdminStatsResponse} from './types/api';

// Schemas
export {createQuoteSchema, updateQuoteSchema, quoteFormSchema} from './schemas/quote';
export type {CreateQuoteInput, UpdateQuoteInput, QuoteFormData} from './schemas/quote';

export {acceptQuoteSchema} from './schemas/policy';
export type {AcceptQuoteInput} from './schemas/policy';

export {uploadMetadataSchema, ALLOWED_FILE_TYPES, MAX_FILE_SIZE} from './schemas/upload';
export type {UploadMetadata} from './schemas/upload';

export {aiRecommendRequestSchema, recommendationSchema} from './schemas/ai';
export type {AiRecommendRequest, Recommendation} from './schemas/ai';
```

- [ ] **Step 8: Commit**

```bash
git add packages/shared/
git commit -m "feat: expand shared schemas with API types, pricing, upload, and AI schemas"
```

---

### Task 3: Scaffold packages/api with Hono

**Files:**
- Create: `packages/api/package.json`
- Create: `packages/api/tsconfig.json`
- Create: `packages/api/src/index.ts`
- Create: `packages/api/src/middleware/cors.ts`
- Create: `packages/api/src/middleware/error-handler.ts`
- Modify: `pnpm-workspace.yaml` (already includes `packages/*`)
- Modify: `turbo.json`
- Modify: `.env.example`

- [ ] **Step 1: Create package.json for API**

Create `packages/api/package.json`:

```json
{
  "name": "@shory/api",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "eslint"
  },
  "dependencies": {
    "@shory/db": "workspace:*",
    "@shory/shared": "workspace:*",
    "hono": "^4",
    "@hono/node-server": "^1",
    "@anthropic-ai/sdk": "^0.39",
    "@vercel/blob": "^0.27",
    "drizzle-orm": "^0.39",
    "zod": "^3"
  },
  "devDependencies": {
    "@shory/typescript-config": "workspace:*",
    "@types/node": "^20",
    "tsx": "^4",
    "typescript": "^5"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

Create `packages/api/tsconfig.json`:

```json
{
  "extends": "@shory/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create CORS middleware**

Create `packages/api/src/middleware/cors.ts`:

```typescript
import {cors} from 'hono/cors';

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.WEB_URL,
  process.env.ADMIN_URL,
].filter(Boolean) as string[];

export const corsMiddleware = cors({
  origin: ALLOWED_ORIGINS,
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
});
```

- [ ] **Step 4: Create error handler middleware**

Create `packages/api/src/middleware/error-handler.ts`:

```typescript
import type {Context} from 'hono';
import {ZodError} from 'zod';

export function errorResponse(c: Context, code: string, message: string, status: number) {
  return c.json({error: {code, message, status}}, status as 400);
}

export function handleZodError(c: Context, error: ZodError) {
  const message = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
  return errorResponse(c, 'VALIDATION_ERROR', message, 400);
}
```

- [ ] **Step 5: Create Hono app entrypoint**

Create `packages/api/src/index.ts`:

```typescript
import {Hono} from 'hono';
import {serve} from '@hono/node-server';
import {corsMiddleware} from './middleware/cors';

const app = new Hono().basePath('/api');

app.use('*', corsMiddleware);

app.get('/health', (c) => c.json({status: 'ok'}));

const port = Number(process.env.PORT) || 3002;

console.log(`Shory API running on http://localhost:${port}`);
serve({fetch: app.fetch, port});

export default app;
```

- [ ] **Step 6: Add API to turbo.json dev task**

In `turbo.json`, the existing `dev` task config already applies to all packages. But add the API build output. Modify the `build` task outputs to include `dist/**`:

The existing turbo.json already has `"outputs": [".next/**", "dist/**"]` in the build task — no changes needed.

- [ ] **Step 7: Update .env.example**

Add new env vars to `.env.example`:

```
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/shory_sme

# Auth.js (admin app)
AUTH_SECRET=generate-with-openssl-rand-base64-32
AUTH_URL=http://localhost:3001

# Admin dashboard URL (used in web app navbar)
NEXT_PUBLIC_ADMIN_URL=http://localhost:3001

# API
NEXT_PUBLIC_API_URL=http://localhost:3002
ANTHROPIC_API_KEY=your-anthropic-api-key
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token

# CORS origins (production)
WEB_URL=https://shory.ae
ADMIN_URL=https://admin.shory.ae
```

- [ ] **Step 8: Add API dev script to root package.json**

Add to root `package.json` scripts:

```json
"api": "pnpm --filter @shory/api dev"
```

- [ ] **Step 9: Install dependencies and verify startup**

Run:
```bash
pnpm install
pnpm api
```

Expected: Server starts on port 3002, `GET /api/health` returns `{"status":"ok"}`.

- [ ] **Step 10: Commit**

```bash
git add packages/api/ turbo.json .env.example package.json pnpm-lock.yaml
git commit -m "feat: scaffold Hono API service with CORS and health endpoint"
```

---

## Phase 2: Core API — Quote CRUD + Pricing Engine

### Task 4: Quote Routes (CRUD)

**Files:**
- Create: `packages/api/src/routes/quotes.ts`
- Modify: `packages/api/src/index.ts`

- [ ] **Step 1: Create quote routes**

Create `packages/api/src/routes/quotes.ts`:

```typescript
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
    const [quote] = await db.insert(quotes).values(data).returning();
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
      .set({...data, updatedAt: new Date()})
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
    return errorResponse(c, 'QUOTE_INVALID_STATE', `Quote must be in draft status to submit`, 409);
  }

  const results = await calculateQuotes({
    industry: quote.industry,
    businessType: quote.businessType,
    employeesCount: quote.employeesCount,
    emirate: quote.emirate,
    coverageType: quote.coverageType,
  });

  // Store results
  const insertedResults = await db
    .insert(quoteResults)
    .values(results.map((r) => ({...r, quoteId: id})))
    .returning();

  // Update status
  await db.update(quotes).set({status: 'quoted', updatedAt: new Date()}).where(eq(quotes.id, id));

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
      return errorResponse(c, 'QUOTE_INVALID_STATE', `Quote must be in quoted status to accept`, 409);
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
        startDate: now.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      })
      .returning();

    await db.update(quotes).set({status: 'accepted', updatedAt: new Date()}).where(eq(quotes.id, id));

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
```

- [ ] **Step 2: Register routes in app**

Update `packages/api/src/index.ts`:

```typescript
import {Hono} from 'hono';
import {serve} from '@hono/node-server';
import {corsMiddleware} from './middleware/cors';
import {quotesRouter} from './routes/quotes';

const app = new Hono().basePath('/api');

app.use('*', corsMiddleware);

app.get('/health', (c) => c.json({status: 'ok'}));
app.route('/quotes', quotesRouter);

const port = Number(process.env.PORT) || 3002;

console.log(`Shory API running on http://localhost:${port}`);
serve({fetch: app.fetch, port});

export default app;
```

- [ ] **Step 3: Verify quote CRUD works**

Run the API and test:
```bash
# Create
curl -X POST http://localhost:3002/api/quotes \
  -H "Content-Type: application/json" \
  -d '{"businessName":"Test Co","emirate":"Dubai","industry":"Technology","employeesCount":5,"coverageType":"comprehensive"}'

# Get (use returned id)
curl http://localhost:3002/api/quotes/<id>

# Update
curl -X PATCH http://localhost:3002/api/quotes/<id> \
  -H "Content-Type: application/json" \
  -d '{"businessType":"it-technology"}'
```

Expected: 201 with quote object, 200 with full quote, 200 with updated quote.

- [ ] **Step 4: Commit**

```bash
git add packages/api/src/
git commit -m "feat: add quote CRUD routes (create, read, update, submit, accept, policy)"
```

---

### Task 5: Pricing Engine

**Files:**
- Create: `packages/api/src/pricing/types.ts`
- Create: `packages/api/src/pricing/engine.ts`
- Create: `packages/api/src/pricing/providers/mock.ts`

- [ ] **Step 1: Create pricing types**

Create `packages/api/src/pricing/types.ts`:

```typescript
export type {QuoteInput, PricingResult, PricingProvider} from '@shory/shared';
```

- [ ] **Step 2: Create mock pricing providers**

Create `packages/api/src/pricing/providers/mock.ts`:

```typescript
import type {PricingProvider, QuoteInput, PricingResult} from '../types';

const INDUSTRY_RISK: Record<string, number> = {
  Technology: 0.8,
  Trading: 1.0,
  Manufacturing: 1.3,
  Construction: 1.5,
  Healthcare: 1.1,
  Hospitality: 1.0,
  Retail: 0.9,
  'Professional Services': 0.85,
  'Transport & Logistics': 1.4,
  Other: 1.0,
};

const COVERAGE_BASE: Record<string, number> = {
  property: 8400,
  liability: 6000,
  'workers-compensation': 4800,
  fleet: 9600,
  comprehensive: 14400,
};

const EMIRATE_FACTOR: Record<string, number> = {
  Dubai: 1.15,
  'Abu Dhabi': 1.1,
  Sharjah: 1.0,
  Ajman: 0.95,
  'Umm Al Quwain': 0.9,
  'Ras Al Khaimah': 0.92,
  Fujairah: 0.9,
};

function getSizeFactor(count: number): number {
  if (count <= 1) return 0.6;
  if (count <= 5) return 0.8;
  if (count <= 20) return 1.0;
  if (count <= 50) return 1.3;
  if (count <= 100) return 1.6;
  return 2.0;
}

function calculatePremium(input: QuoteInput, priceMultiplier: number): number {
  const base = COVERAGE_BASE[input.coverageType] ?? 6000;
  const risk = INDUSTRY_RISK[input.industry] ?? 1.0;
  const emirate = EMIRATE_FACTOR[input.emirate] ?? 1.0;
  const size = getSizeFactor(input.employeesCount);
  return Math.round(base * risk * emirate * size * priceMultiplier);
}

function createMockProvider(
  id: string,
  name: string,
  priceMultiplier: number,
  deductibleRate: number,
  coverageMultiplier: number,
): PricingProvider {
  return {
    id,
    name,
    async getQuote(input: QuoteInput): Promise<PricingResult> {
      const annualPremium = calculatePremium(input, priceMultiplier);
      return {
        providerId: id,
        providerName: name,
        annualPremium,
        monthlyPremium: Math.round(annualPremium / 12),
        coverageAmount: annualPremium * coverageMultiplier,
        deductible: Math.round(annualPremium * deductibleRate),
        benefits: {
          medicalCoverage: true,
          legalExpenses: annualPremium > 8000,
          businessInterruption: annualPremium > 10000,
          cyberLiability: input.industry === 'Technology',
        },
      };
    },
  };
}

export const mockProviders: PricingProvider[] = [
  createMockProvider('salama', 'Salama Insurance', 1.0, 0.05, 10),
  createMockProvider('watania', 'Watania Takaful', 1.023, 0.04, 11),
  createMockProvider('orient', 'Orient Insurance', 1.218, 0.03, 14),
];
```

- [ ] **Step 3: Create pricing engine**

Create `packages/api/src/pricing/engine.ts`:

```typescript
import type {QuoteInput, PricingResult, PricingProvider} from './types';
import {mockProviders} from './providers/mock';

export async function calculateQuotes(
  input: QuoteInput,
  providers: PricingProvider[] = mockProviders,
): Promise<PricingResult[]> {
  const results = await Promise.allSettled(providers.map((p) => p.getQuote(input)));

  const successful = results
    .filter((r): r is PromiseFulfilledResult<PricingResult> => r.status === 'fulfilled')
    .map((r) => r.value);

  if (successful.length === 0) {
    throw new Error('All pricing providers failed');
  }

  return successful.sort((a, b) => a.annualPremium - b.annualPremium);
}
```

- [ ] **Step 4: Test the full submit flow**

```bash
# Create a quote
curl -X POST http://localhost:3002/api/quotes \
  -H "Content-Type: application/json" \
  -d '{"businessName":"Tech Corp","emirate":"Dubai","industry":"Technology","employeesCount":10,"coverageType":"comprehensive"}'

# Submit for pricing (use returned id)
curl -X POST http://localhost:3002/api/quotes/<id>/submit

# Get results
curl http://localhost:3002/api/quotes/<id>/results
```

Expected: Submit returns 3 pricing results from mock providers sorted by annual premium.

- [ ] **Step 5: Commit**

```bash
git add packages/api/src/pricing/
git commit -m "feat: add pricing engine with mock insurer providers (adapter pattern)"
```

---

## Phase 3: File Uploads + AI Advisor

### Task 6: File Upload Routes (Vercel Blob)

**Files:**
- Create: `packages/api/src/routes/uploads.ts`
- Modify: `packages/api/src/index.ts`

- [ ] **Step 1: Create upload routes**

Create `packages/api/src/routes/uploads.ts`:

```typescript
import {Hono} from 'hono';
import {put} from '@vercel/blob';
import {db, documents, quotes} from '@shory/db';
import {ALLOWED_FILE_TYPES, MAX_FILE_SIZE} from '@shory/shared';
import {eq} from 'drizzle-orm';
import {errorResponse} from '../middleware/error-handler';

export const uploadsRouter = new Hono();

// POST /uploads
uploadsRouter.post('/', async (c) => {
  const formData = await c.req.formData();
  const file = formData.get('file') as File | null;
  const quoteId = formData.get('quoteId') as string | null;

  if (!file) return errorResponse(c, 'VALIDATION_ERROR', 'File is required', 400);
  if (!quoteId) return errorResponse(c, 'VALIDATION_ERROR', 'quoteId is required', 400);

  if (!ALLOWED_FILE_TYPES.includes(file.type as (typeof ALLOWED_FILE_TYPES)[number])) {
    return errorResponse(c, 'VALIDATION_ERROR', `File type ${file.type} not allowed. Use PDF, JPG, or PNG`, 400);
  }

  if (file.size > MAX_FILE_SIZE) {
    return errorResponse(c, 'UPLOAD_TOO_LARGE', 'File exceeds 10MB limit', 413);
  }

  // Verify quote exists
  const [quote] = await db.select().from(quotes).where(eq(quotes.id, quoteId));
  if (!quote) return errorResponse(c, 'QUOTE_NOT_FOUND', `Quote ${quoteId} not found`, 404);

  const blob = await put(`documents/${quoteId}/${file.name}`, file, {access: 'public'});

  const [doc] = await db
    .insert(documents)
    .values({
      quoteId,
      fileName: file.name,
      fileType: file.type,
      blobUrl: blob.url,
    })
    .returning();

  return c.json(doc, 201);
});

// GET /uploads/:id
uploadsRouter.get('/:id', async (c) => {
  const id = c.req.param('id');
  const [doc] = await db.select().from(documents).where(eq(documents.id, id));
  if (!doc) return errorResponse(c, 'QUOTE_NOT_FOUND', `Document ${id} not found`, 404);
  return c.json(doc);
});
```

- [ ] **Step 2: Register uploads route**

In `packages/api/src/index.ts`, add:

```typescript
import {uploadsRouter} from './routes/uploads';

// after quotesRouter
app.route('/uploads', uploadsRouter);
```

- [ ] **Step 3: Commit**

```bash
git add packages/api/src/routes/uploads.ts packages/api/src/index.ts
git commit -m "feat: add file upload routes with Vercel Blob storage"
```

---

### Task 7: AI Advisor Route (Claude Integration)

**Files:**
- Create: `packages/api/src/ai/advisor.ts`
- Create: `packages/api/src/routes/ai.ts`
- Modify: `packages/api/src/index.ts`

- [ ] **Step 1: Create AI advisor service**

Create `packages/api/src/ai/advisor.ts`:

```typescript
import Anthropic from '@anthropic-ai/sdk';
import type {Recommendation} from '@shory/shared';

const client = new Anthropic();

interface AdvisorContext {
  industry: string;
  businessType: string | null;
  employeesCount: number;
  emirate: string;
  coverageType: string;
}

export async function getRecommendations(context: AdvisorContext): Promise<{
  recommendations: Recommendation[];
  modelUsed: string;
}> {
  const modelUsed = 'claude-sonnet-4-6';

  const response = await client.messages.create({
    model: modelUsed,
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are an insurance advisor for SME businesses in the UAE. Analyze this business and recommend insurance coverage.

Business details:
- Industry: ${context.industry}
- Business type: ${context.businessType ?? 'Not specified'}
- Number of employees: ${context.employeesCount}
- Emirate: ${context.emirate}
- Current coverage interest: ${context.coverageType}

Return a JSON array of recommendations. Each recommendation must have:
- coverageType: string (one of: property, liability, workers-compensation, fleet, comprehensive)
- recommendedAmount: number (annual AED amount)
- reasoning: string (1-2 sentences explaining why)
- priority: "high" | "medium" | "low"

Return ONLY the JSON array, no other text.`,
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '[]';
  const recommendations: Recommendation[] = JSON.parse(text);

  return {recommendations, modelUsed};
}
```

- [ ] **Step 2: Create AI route**

Create `packages/api/src/routes/ai.ts`:

```typescript
import {Hono} from 'hono';
import {db, quotes, aiRecommendations} from '@shory/db';
import {aiRecommendRequestSchema} from '@shory/shared';
import {eq} from 'drizzle-orm';
import {errorResponse, handleZodError} from '../middleware/error-handler';
import {getRecommendations} from '../ai/advisor';
import {ZodError} from 'zod';

export const aiRouter = new Hono();

// POST /ai/recommend
aiRouter.post('/recommend', async (c) => {
  try {
    const body = await c.req.json();
    const {quoteId} = aiRecommendRequestSchema.parse(body);

    const [quote] = await db.select().from(quotes).where(eq(quotes.id, quoteId));
    if (!quote) return errorResponse(c, 'QUOTE_NOT_FOUND', `Quote ${quoteId} not found`, 404);

    const inputContext = {
      industry: quote.industry,
      businessType: quote.businessType,
      employeesCount: quote.employeesCount,
      emirate: quote.emirate,
      coverageType: quote.coverageType,
    };

    const {recommendations, modelUsed} = await getRecommendations(inputContext);

    // Store for audit trail
    const [record] = await db
      .insert(aiRecommendations)
      .values({
        quoteId,
        inputContext,
        recommendations,
        modelUsed,
      })
      .returning();

    return c.json({id: record.id, recommendations});
  } catch (e) {
    if (e instanceof ZodError) return handleZodError(c, e);
    if (e instanceof Error && e.message.includes('anthropic')) {
      return errorResponse(c, 'AI_UNAVAILABLE', 'AI service temporarily unavailable', 503);
    }
    throw e;
  }
});
```

- [ ] **Step 3: Register AI route**

In `packages/api/src/index.ts`, add:

```typescript
import {aiRouter} from './routes/ai';

// after uploadsRouter
app.route('/ai', aiRouter);
```

- [ ] **Step 4: Commit**

```bash
git add packages/api/src/ai/ packages/api/src/routes/ai.ts packages/api/src/index.ts
git commit -m "feat: add AI advisor route with Claude API integration"
```

---

## Phase 4: Admin API + Auth

### Task 8: Admin Auth Middleware

**Files:**
- Create: `packages/api/src/middleware/auth.ts`

- [ ] **Step 1: Create admin auth middleware**

Create `packages/api/src/middleware/auth.ts`:

```typescript
import type {Context, Next} from 'hono';
import {db, adminUsers} from '@shory/db';
import {eq} from 'drizzle-orm';
import {errorResponse} from './error-handler';

export async function adminAuth(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return errorResponse(c, 'UNAUTHORIZED', 'Missing or invalid authorization header', 401);
  }

  const token = authHeader.slice(7);

  // In MVP, the token is the admin user's email (simple).
  // In production, this would validate an Auth.js session token.
  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, token));

  if (!user) {
    return errorResponse(c, 'UNAUTHORIZED', 'Invalid admin credentials', 401);
  }

  c.set('adminUser', user);
  await next();
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/api/src/middleware/auth.ts
git commit -m "feat: add admin auth middleware for API"
```

---

### Task 9: Admin API Routes

**Files:**
- Create: `packages/api/src/routes/admin.ts`
- Modify: `packages/api/src/index.ts`

- [ ] **Step 1: Create admin routes**

Create `packages/api/src/routes/admin.ts`:

```typescript
import {Hono} from 'hono';
import {db, quotes, quoteResults, policies} from '@shory/db';
import {eq, desc, count, and, gte, sql} from 'drizzle-orm';
import {adminAuth} from '../middleware/auth';
import {errorResponse} from '../middleware/error-handler';

export const adminRouter = new Hono();

// All admin routes require auth
adminRouter.use('*', adminAuth);

// GET /admin/quotes — list all quotes (paginated)
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

// PATCH /admin/quotes/:id — update status
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
    .set({status: status as 'draft', updatedAt: new Date()})
    .where(eq(quotes.id, id))
    .returning();

  if (!quote) return errorResponse(c, 'QUOTE_NOT_FOUND', `Quote ${id} not found`, 404);
  return c.json(quote);
});

// GET /admin/stats — dashboard stats
adminRouter.get('/stats', async (c) => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const [[{totalQuotes}], [{quotesThisWeek}], [{acceptedQuotes}], [{pendingQuotes}]] =
    await Promise.all([
      db.select({totalQuotes: count()}).from(quotes),
      db
        .select({quotesThisWeek: count()})
        .from(quotes)
        .where(gte(quotes.createdAt, oneWeekAgo)),
      db
        .select({acceptedQuotes: count()})
        .from(quotes)
        .where(eq(quotes.status, 'accepted')),
      db
        .select({pendingQuotes: count()})
        .from(quotes)
        .where(eq(quotes.status, 'quoted')),
    ]);

  return c.json({totalQuotes, quotesThisWeek, acceptedQuotes, pendingQuotes});
});
```

- [ ] **Step 2: Register admin routes**

In `packages/api/src/index.ts`, add:

```typescript
import {adminRouter} from './routes/admin';

// after aiRouter
app.route('/admin', adminRouter);
```

- [ ] **Step 3: Verify final API index.ts**

`packages/api/src/index.ts` should now be:

```typescript
import {Hono} from 'hono';
import {serve} from '@hono/node-server';
import {corsMiddleware} from './middleware/cors';
import {quotesRouter} from './routes/quotes';
import {uploadsRouter} from './routes/uploads';
import {aiRouter} from './routes/ai';
import {adminRouter} from './routes/admin';

const app = new Hono().basePath('/api');

app.use('*', corsMiddleware);

app.get('/health', (c) => c.json({status: 'ok'}));
app.route('/quotes', quotesRouter);
app.route('/uploads', uploadsRouter);
app.route('/ai', aiRouter);
app.route('/admin', adminRouter);

const port = Number(process.env.PORT) || 3002;

console.log(`Shory API running on http://localhost:${port}`);
serve({fetch: app.fetch, port});

export default app;
```

- [ ] **Step 4: Commit**

```bash
git add packages/api/src/routes/admin.ts packages/api/src/index.ts
git commit -m "feat: add admin API routes (quotes list, status update, dashboard stats)"
```

---

## Phase 5: Web App API Integration

### Task 10: Typed API Client for Web App

**Files:**
- Create: `apps/web/lib/api-client.ts`

- [ ] **Step 1: Create typed API client**

Create `apps/web/lib/api-client.ts`:

```typescript
import type {
  CreateQuoteInput,
  UpdateQuoteInput,
  AcceptQuoteInput,
  AiRecommendRequest,
  Recommendation,
} from '@shory/shared';
import type {Quote, QuoteResult, Policy, Document as ShoryDocument} from '@shory/db';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({error: {message: res.statusText}}));
    throw new Error(error.error?.message ?? `API error: ${res.status}`);
  }

  return res.json();
}

export const api = {
  quotes: {
    create: (data: CreateQuoteInput) =>
      fetchApi<Quote>('/quotes', {method: 'POST', body: JSON.stringify(data)}),

    get: (id: string) => fetchApi<Quote>(`/quotes/${id}`),

    update: (id: string, data: UpdateQuoteInput) =>
      fetchApi<Quote>(`/quotes/${id}`, {method: 'PATCH', body: JSON.stringify(data)}),

    submit: (id: string) =>
      fetchApi<{status: string; results: QuoteResult[]}>(`/quotes/${id}/submit`, {method: 'POST'}),

    results: (id: string) => fetchApi<{quote: Quote; results: QuoteResult[]}>(`/quotes/${id}/results`),

    accept: (id: string, data: AcceptQuoteInput) =>
      fetchApi<Policy>(`/quotes/${id}/accept`, {method: 'POST', body: JSON.stringify(data)}),

    policy: (id: string) =>
      fetchApi<{policy: Policy; quote: Quote; result: QuoteResult}>(`/quotes/${id}/policy`),
  },

  ai: {
    recommend: (data: AiRecommendRequest) =>
      fetchApi<{id: string; recommendations: Recommendation[]}>('/ai/recommend', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  uploads: {
    upload: async (file: File, quoteId: string) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('quoteId', quoteId);

      const res = await fetch(`${API_URL}/api/uploads`, {method: 'POST', body: formData});
      if (!res.ok) {
        const error = await res.json().catch(() => ({error: {message: res.statusText}}));
        throw new Error(error.error?.message ?? `Upload error: ${res.status}`);
      }
      return res.json() as Promise<ShoryDocument>;
    },

    get: (id: string) => fetchApi<ShoryDocument>(`/uploads/${id}`),
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/lib/api-client.ts
git commit -m "feat: add typed API client for web app"
```

---

### Task 11: Typed API Client for Admin App

**Files:**
- Create: `apps/admin/lib/api-client.ts`

- [ ] **Step 1: Create admin typed API client**

Create `apps/admin/lib/api-client.ts`:

```typescript
import type {PaginatedResponse, AdminStatsResponse} from '@shory/shared';
import type {Quote} from '@shory/db';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';

async function fetchAdmin<T>(path: string, token: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({error: {message: res.statusText}}));
    throw new Error(error.error?.message ?? `API error: ${res.status}`);
  }

  return res.json();
}

export const adminApi = {
  quotes: {
    list: (token: string, params?: {page?: number; pageSize?: number; status?: string}) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.status) searchParams.set('status', params.status);
      const qs = searchParams.toString();
      return fetchAdmin<PaginatedResponse<Quote>>(`/admin/quotes${qs ? `?${qs}` : ''}`, token);
    },

    updateStatus: (token: string, id: string, status: string) =>
      fetchAdmin<Quote>(`/admin/quotes/${id}`, token, {
        method: 'PATCH',
        body: JSON.stringify({status}),
      }),
  },

  stats: (token: string) => fetchAdmin<AdminStatsResponse>('/admin/stats', token),
};
```

- [ ] **Step 2: Commit**

```bash
git add apps/admin/lib/api-client.ts
git commit -m "feat: add typed API client for admin app"
```

---

## Phase 6: Admin App — Auth + Dashboard + Quote Management

### Task 12: Admin Auth Setup (Auth.js)

**Files:**
- Create: `apps/admin/lib/auth.ts`
- Create: `apps/admin/middleware.ts`
- Create: `apps/admin/app/login/page.tsx`

- [ ] **Step 1: Configure Auth.js**

Create `apps/admin/lib/auth.ts`:

```typescript
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

        // MVP: simple password check. Production: use bcrypt.
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
      if (token.role) (session.user as Record<string, unknown>).role = token.role;
      if (token.email) (session.user as Record<string, unknown>).apiToken = token.email;
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
```

- [ ] **Step 2: Create Auth.js route handler**

Create `apps/admin/app/api/auth/[...nextauth]/route.ts`:

```typescript
import {handlers} from '@/lib/auth';

export const {GET, POST} = handlers;
```

- [ ] **Step 3: Create middleware for route protection**

Create `apps/admin/middleware.ts`:

```typescript
export {auth as middleware} from '@/lib/auth';

export const config = {
  matcher: ['/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)'],
};
```

- [ ] **Step 4: Create login page**

Create `apps/admin/app/login/page.tsx`:

```tsx
'use client';

import {useState} from 'react';
import {signIn} from 'next-auth/react';
import {Button} from '@shory/ui';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid email or password');
      setLoading(false);
    } else {
      window.location.href = '/';
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm p-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <h1 className="text-2xl font-black italic text-center mb-8">Shory.</h1>
        <h2 className="text-lg font-semibold text-center mb-6">Admin Login</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1D68FF] text-white rounded-xl py-2.5"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add apps/admin/lib/auth.ts apps/admin/app/api/auth/ apps/admin/middleware.ts apps/admin/app/login/
git commit -m "feat: add Auth.js login for admin app with credentials provider"
```

---

### Task 13: Admin Dashboard Page

**Files:**
- Create: `apps/admin/components/layout/admin-sidebar.tsx`
- Create: `apps/admin/components/layout/admin-header.tsx`
- Modify: `apps/admin/app/layout.tsx`
- Modify: `apps/admin/app/page.tsx`

- [ ] **Step 1: Create admin sidebar**

Create `apps/admin/components/layout/admin-sidebar.tsx`:

```tsx
'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';

const NAV_ITEMS = [
  {label: 'Dashboard', href: '/', icon: '□'},
  {label: 'Quotes', href: '/quotes', icon: '≡'},
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-gray-200 bg-white min-h-screen p-4">
      <Link href="/" className="text-2xl font-black italic text-gray-900 block mb-8 px-3">
        Shory.
      </Link>
      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-50 text-[#1D68FF]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 2: Create admin header**

Create `apps/admin/components/layout/admin-header.tsx`:

```tsx
import {auth} from '@/lib/auth';

export async function AdminHeader() {
  const session = await auth();

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold text-gray-900">Admin Portal</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{session?.user?.email}</span>
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Update admin layout**

Replace `apps/admin/app/layout.tsx`:

```tsx
import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import {AdminSidebar} from '@/components/layout/admin-sidebar';
import {AdminHeader} from '@/components/layout/admin-header';
import './globals.css';

const geistSans = Geist({variable: '--font-geist-sans', subsets: ['latin']});
const geistMono = Geist_Mono({variable: '--font-geist-mono', subsets: ['latin']});

export const metadata: Metadata = {
  title: 'Shory Admin — Dashboard',
  description: 'Shory SME Admin Portal',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex font-sans">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader />
          <main className="flex-1 p-6 bg-gray-50">{children}</main>
        </div>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Create dashboard page**

Replace `apps/admin/app/page.tsx`:

```tsx
import {auth} from '@/lib/auth';
import {adminApi} from '@/lib/api-client';
import {Card, CardContent, CardHeader, CardTitle} from '@shory/ui';

export default async function DashboardPage() {
  const session = await auth();
  const token = session?.user?.email ?? '';
  const stats = await adminApi.stats(token);

  const cards = [
    {title: 'Total Quotes', value: stats.totalQuotes},
    {title: 'This Week', value: stats.quotesThisWeek},
    {title: 'Accepted', value: stats.acceptedQuotes},
    {title: 'Pending Review', value: stats.pendingQuotes},
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.title} className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add apps/admin/components/ apps/admin/app/layout.tsx apps/admin/app/page.tsx
git commit -m "feat: add admin dashboard with sidebar, header, and stats cards"
```

---

### Task 14: Admin Quotes List + Detail Pages

**Files:**
- Create: `apps/admin/app/quotes/page.tsx`
- Create: `apps/admin/app/quotes/[id]/page.tsx`
- Create: `apps/admin/components/quotes/quotes-table.tsx`
- Create: `apps/admin/components/quotes/status-badge.tsx`
- Create: `apps/admin/components/quotes/status-actions.tsx`

- [ ] **Step 1: Create status badge component**

Create `apps/admin/components/quotes/status-badge.tsx`:

```tsx
import {Badge} from '@shory/ui';

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-blue-100 text-blue-700',
  quoted: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-green-100 text-green-700',
  expired: 'bg-orange-100 text-orange-700',
  rejected: 'bg-red-100 text-red-700',
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({status}: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={`${STATUS_STYLES[status] ?? ''} border-0 capitalize`}>
      {status}
    </Badge>
  );
}
```

- [ ] **Step 2: Create quotes table component**

Create `apps/admin/components/quotes/quotes-table.tsx`:

```tsx
import Link from 'next/link';
import type {Quote} from '@shory/db';
import {StatusBadge} from './status-badge';

interface QuotesTableProps {
  quotes: Quote[];
}

export function QuotesTable({quotes}: QuotesTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Business</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Industry</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Emirate</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Employees</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {quotes.map((quote) => (
            <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <Link href={`/quotes/${quote.id}`} className="text-[#1D68FF] hover:underline font-medium">
                  {quote.businessName}
                </Link>
              </td>
              <td className="px-4 py-3 text-gray-600">{quote.industry}</td>
              <td className="px-4 py-3 text-gray-600">{quote.emirate}</td>
              <td className="px-4 py-3 text-gray-600">{quote.employeesCount}</td>
              <td className="px-4 py-3">
                <StatusBadge status={quote.status} />
              </td>
              <td className="px-4 py-3 text-gray-500">
                {new Date(quote.createdAt).toLocaleDateString('en-AE')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 3: Create quotes list page**

Create `apps/admin/app/quotes/page.tsx`:

```tsx
import {auth} from '@/lib/auth';
import {adminApi} from '@/lib/api-client';
import {QuotesTable} from '@/components/quotes/quotes-table';

interface QuotesPageProps {
  searchParams: Promise<{page?: string; status?: string}>;
}

export default async function QuotesPage({searchParams}: QuotesPageProps) {
  const params = await searchParams;
  const session = await auth();
  const token = session?.user?.email ?? '';
  const page = Number(params.page ?? '1');

  const {data: quotes, total, pageSize} = await adminApi.quotes.list(token, {
    page,
    status: params.status,
  });

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Quotes</h2>
      <QuotesTable quotes={quotes} />
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2 text-sm">
          <span className="text-gray-500">
            Page {page} of {totalPages} ({total} total)
          </span>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create status actions component**

Create `apps/admin/components/quotes/status-actions.tsx`:

```tsx
'use client';

import {useState} from 'react';
import {Button} from '@shory/ui';
import {adminApi} from '@/lib/api-client';

interface StatusActionsProps {
  quoteId: string;
  currentStatus: string;
  token: string;
}

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  draft: ['expired'],
  submitted: ['quoted', 'rejected'],
  quoted: ['accepted', 'expired', 'rejected'],
};

export function StatusActions({quoteId, currentStatus, token}: StatusActionsProps) {
  const [loading, setLoading] = useState(false);
  const transitions = ALLOWED_TRANSITIONS[currentStatus] ?? [];

  if (transitions.length === 0) return null;

  async function handleStatusChange(newStatus: string) {
    setLoading(true);
    await adminApi.quotes.updateStatus(token, quoteId, newStatus);
    window.location.reload();
  }

  return (
    <div className="flex gap-2">
      {transitions.map((status) => (
        <Button
          key={status}
          variant={status === 'rejected' || status === 'expired' ? 'destructive' : 'default'}
          size="sm"
          disabled={loading}
          onClick={() => handleStatusChange(status)}
          className="rounded-xl capitalize"
        >
          {status === 'accepted' ? 'Approve' : status === 'rejected' ? 'Reject' : `Mark ${status}`}
        </Button>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Create quote detail page**

Create `apps/admin/app/quotes/[id]/page.tsx`:

```tsx
import {auth} from '@/lib/auth';
import {Card, CardContent, CardHeader, CardTitle} from '@shory/ui';
import {StatusBadge} from '@/components/quotes/status-badge';
import {StatusActions} from '@/components/quotes/status-actions';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';

interface QuoteDetailPageProps {
  params: Promise<{id: string}>;
}

export default async function QuoteDetailPage({params}: QuoteDetailPageProps) {
  const {id} = await params;
  const session = await auth();
  const token = session?.user?.email ?? '';

  const res = await fetch(`${API_URL}/api/quotes/${id}`, {
    headers: {'Content-Type': 'application/json'},
  });
  const quote = await res.json();

  const fields = [
    {label: 'Business Name', value: quote.businessName},
    {label: 'Industry', value: quote.industry},
    {label: 'Business Type', value: quote.businessType ?? '—'},
    {label: 'Emirate', value: quote.emirate},
    {label: 'Employees', value: quote.employeesCount},
    {label: 'Coverage', value: quote.coverageType},
    {label: 'Trade License', value: quote.tradeLicense ?? '—'},
    {label: 'Created', value: new Date(quote.createdAt).toLocaleString('en-AE')},
  ];

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{quote.businessName}</h2>
          <div className="mt-1">
            <StatusBadge status={quote.status} />
          </div>
        </div>
        <StatusActions quoteId={id} currentStatus={quote.status} token={token} />
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Quote Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            {fields.map((f) => (
              <div key={f.label}>
                <dt className="text-sm font-medium text-gray-500">{f.label}</dt>
                <dd className="mt-1 text-sm text-gray-900">{f.value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add apps/admin/app/quotes/ apps/admin/components/quotes/
git commit -m "feat: add admin quotes list and detail pages with status management"
```

---

## Phase 7: Verification

### Task 15: End-to-End Verification

- [ ] **Step 1: Start all services**

```bash
# Terminal 1: API
pnpm api

# Terminal 2: Web app
pnpm web

# Terminal 3: Admin app
pnpm admin
```

- [ ] **Step 2: Verify API health**

```bash
curl http://localhost:3002/api/health
```

Expected: `{"status":"ok"}`

- [ ] **Step 3: Test full quote journey via API**

```bash
# Create
QUOTE=$(curl -s -X POST http://localhost:3002/api/quotes \
  -H "Content-Type: application/json" \
  -d '{"businessName":"Test Co","emirate":"Dubai","industry":"Technology","employeesCount":10,"coverageType":"comprehensive"}')
echo $QUOTE

# Extract ID
ID=$(echo $QUOTE | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")

# Update
curl -s -X PATCH http://localhost:3002/api/quotes/$ID \
  -H "Content-Type: application/json" \
  -d '{"businessType":"it-technology"}'

# Submit for pricing
curl -s -X POST http://localhost:3002/api/quotes/$ID/submit

# Get results
curl -s http://localhost:3002/api/quotes/$ID/results
```

Expected: Quote created, updated, submitted with 3 pricing results from mock providers.

- [ ] **Step 4: Verify CORS works from web app**

Open `http://localhost:3000` and check browser console — no CORS errors when the web app calls the API.

- [ ] **Step 5: Verify admin app loads**

Open `http://localhost:3001` — should redirect to login page. After logging in, dashboard should show stats.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: complete system architecture — API, pricing engine, AI advisor, admin portal"
```
