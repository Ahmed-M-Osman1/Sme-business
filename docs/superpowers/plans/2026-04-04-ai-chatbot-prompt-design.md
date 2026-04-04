# AI Chatbot Prompt Design Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the AI Chatbot Prompt Design developer note — proper system prompt, fallback handling, confidence signalling, domain boundary enforcement, and unknown query logging — to both the backend AI advisor and the frontend AI chat.

**Architecture:** The backend `advisor.ts` gets a proper system message with all four prompt areas (answer quality, fallback, domain boundary, hard rules). A new `ai-fallback-log` DB table captures unknown/low-confidence queries. The AI route post-processes responses for hedging phrases and logs fallbacks. The frontend AI advisor chat gets improved handling for out-of-scope and unclear free-text inputs with structured fallback messages.

**Tech Stack:** Hono (backend), Anthropic SDK, Drizzle ORM + Neon PostgreSQL, Next.js 16 (frontend), Zod, i18n (en/ar)

---

### Task 1: Backend System Prompt — Proper `system` Message

**Files:**
- Modify: `apps/backend/src/ai/advisor.ts`

The current code puts all instructions in the `user` message. The PDF requires the system prompt as a separate `system` role message, covering: answer quality, fallback, domain boundary, and hard rules.

- [ ] **Step 1: Refactor `advisor.ts` to use a proper system message**

Replace the entire content of `apps/backend/src/ai/advisor.ts` with:

```typescript
// eslint-disable-next-line @typescript-eslint/no-require-imports
import Anthropic from '@anthropic-ai/sdk';
import type {Recommendation} from '@shory/shared';

// Vercel resolves this module differently than local — use any to bypass
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const client = new (Anthropic as any)();

const SYSTEM_PROMPT = `You are a professional AI insurance advisor for SME businesses in the UAE, working for Shory — a digital insurance platform.

## Guidelines

### Answer Quality
- Provide concise, accurate, and relevant insurance recommendations.
- Prioritise UAE-specific regulatory requirements and market practices.
- Avoid speculation — only recommend coverage types you are confident apply to the business profile.
- Format responses as structured JSON as instructed. Keep reasoning short (1-2 sentences).

### Domain Boundary
You ONLY answer questions related to UAE SME business insurance.
If asked about anything outside this scope, respond with:
{ "error": "out_of_scope", "message": "This falls outside UAE SME business insurance. For other topics, please contact Shory support." }

### Hard Rules
- Never fabricate facts or invent coverage types.
- Never recommend coverage that does not exist in the UAE insurance market.
- Never provide legal, tax, or financial advice beyond insurance recommendations.
- If you cannot confidently recommend coverage for a given business profile, return an empty array [] rather than guessing.

### Confidence
- If your recommendation is based on incomplete information, include a note in the reasoning field: "Based on limited information — please verify with your insurer."
- Only recommend coverage you are confident applies to the described business.`;

interface AdvisorContext {
  industry: string;
  businessType: string | null;
  employeesCount: number;
  emirate: string;
  coverageType: string;
}

export interface AdvisorResult {
  recommendations: Recommendation[];
  modelUsed: string;
  confidence: 'high' | 'medium' | 'low';
}

const HEDGING_PHRASES = [
  'i think',
  'i believe',
  "i'm not sure",
  'possibly',
  'might be',
  'perhaps',
  'it could be',
  'not certain',
];

function detectConfidence(text: string): 'high' | 'medium' | 'low' {
  const lower = text.toLowerCase();
  const hedgeCount = HEDGING_PHRASES.filter((phrase) => lower.includes(phrase)).length;
  if (hedgeCount >= 3) return 'low';
  if (hedgeCount >= 1) return 'medium';
  return 'high';
}

export async function getRecommendations(context: AdvisorContext): Promise<AdvisorResult> {
  const modelUsed = 'claude-sonnet-4-6';

  const response = await client.messages.create({
    model: modelUsed,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Analyze this SME business and recommend insurance coverage.

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
  const confidence = detectConfidence(text);
  const recommendations: Recommendation[] = JSON.parse(text);

  return {recommendations, modelUsed, confidence};
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /Users/ahmedosman/Developer/the-one-and-only/shory-sme && pnpm turbo build --filter=@shory/backend`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/ai/advisor.ts
git commit -m "feat: add proper system prompt with domain boundary and confidence detection"
```

---

### Task 2: AI Fallback Log — Database Schema

**Files:**
- Create: `packages/db/src/schema/ai-fallback-log.ts`
- Modify: `packages/db/src/index.ts`

Add a table to log all queries that trigger a fallback response, per PDF section 4.3.

- [ ] **Step 1: Create the `ai_fallback_log` schema**

Create `packages/db/src/schema/ai-fallback-log.ts`:

```typescript
import {pgEnum, pgTable, text, uuid, timestamp} from 'drizzle-orm/pg-core';

export const fallbackReasonEnum = pgEnum('fallback_reason', [
  'unknown_topic',
  'low_confidence',
  'out_of_scope',
  'harmful',
  'ai_unavailable',
]);

export const aiFallbackLog = pgTable('ai_fallback_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  query: text('query').notNull(),
  fallbackReason: fallbackReasonEnum('fallback_reason').notNull(),
  sessionId: text('session_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type AiFallbackLog = typeof aiFallbackLog.$inferSelect;
export type NewAiFallbackLog = typeof aiFallbackLog.$inferInsert;
```

- [ ] **Step 2: Export from the DB package index**

Add to `packages/db/src/index.ts`, alongside the other schema exports:

```typescript
export {aiFallbackLog, fallbackReasonEnum} from './schema/ai-fallback-log';
export type {AiFallbackLog, NewAiFallbackLog} from './schema/ai-fallback-log';
```

- [ ] **Step 3: Generate the migration**

Run: `cd /Users/ahmedosman/Developer/the-one-and-only/shory-sme/packages/db && pnpm drizzle-kit generate`
Expected: A new migration SQL file is created in the migrations folder.

- [ ] **Step 4: Commit**

```bash
git add packages/db/src/schema/ai-fallback-log.ts packages/db/src/index.ts packages/db/migrations/
git commit -m "feat: add ai_fallback_log table for unknown query logging"
```

---

### Task 3: AI Route — Confidence Check, Fallback Logging, Structured Response

**Files:**
- Modify: `apps/backend/src/routes/ai.ts`

Update the AI route to: log fallbacks, return confidence level, and return structured fallback responses when confidence is low.

- [ ] **Step 1: Update the AI route**

Replace the entire content of `apps/backend/src/routes/ai.ts` with:

```typescript
import {Hono} from 'hono';
import {db, quotes, aiRecommendations, aiFallbackLog} from '@shory/db';
import {aiRecommendRequestSchema} from '@shory/shared';
import {eq} from 'drizzle-orm';
import {errorResponse, handleZodError} from '../middleware/error-handler.js';
import {getRecommendations} from '../ai/advisor.js';
import {ZodError} from 'zod';

export const aiRouter = new Hono();

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

    const {recommendations, modelUsed, confidence} = await getRecommendations(inputContext);

    // Log low-confidence responses (PDF §4.2 fallback trigger threshold)
    if (confidence === 'low') {
      await db.insert(aiFallbackLog).values({
        query: JSON.stringify(inputContext),
        fallbackReason: 'low_confidence',
        sessionId: c.req.header('x-session-id') ?? null,
      });
    }

    const [record] = await db
      .insert(aiRecommendations)
      .values({
        quoteId,
        inputContext,
        recommendations,
        modelUsed,
      })
      .returning();

    return c.json({id: record.id, recommendations, confidence});
  } catch (e) {
    if (e instanceof ZodError) return handleZodError(c, e);
    if (e instanceof Error && (e.message.includes('anthropic') || e.message.includes('Anthropic'))) {
      // Log AI unavailability (PDF §4.3)
      const body = await c.req.raw.clone().json().catch(() => ({}));
      await db.insert(aiFallbackLog).values({
        query: JSON.stringify(body),
        fallbackReason: 'ai_unavailable',
        sessionId: c.req.header('x-session-id') ?? null,
      }).catch(() => {});

      return errorResponse(c, 'AI_UNAVAILABLE', 'AI service temporarily unavailable', 503);
    }
    throw e;
  }
});
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/ahmedosman/Developer/the-one-and-only/shory-sme && pnpm turbo build --filter=@shory/backend`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/routes/ai.ts
git commit -m "feat: add confidence level to AI response and log fallbacks"
```

---

### Task 4: Frontend — Structured Fallback & Out-of-Scope Handling

**Files:**
- Modify: `apps/web/lib/i18n/en.json`
- Modify: `apps/web/lib/i18n/ar.json`
- Modify: `apps/web/app/quote/ai-advisor/page.tsx`

Add structured fallback messages and better handling for out-of-scope/unclear/harmful inputs in the AI advisor chat.

- [ ] **Step 1: Add new i18n keys to `en.json`**

Add these keys inside the `"ai"` object in `apps/web/lib/i18n/en.json`, after the `"defaultCover"` line:

```json
    "outOfScope": "That's outside what I can help with here. I specialise in UAE business insurance. Try describing your business activity instead.",
    "harmful": "I'm not able to help with that request. Let's focus on finding the right insurance for your business.",
    "fallbackSuggestion": "Here's what you can do:\n• Describe your business activity (e.g. \"I run a café in Dubai\")\n• Tap a business type below\n• Or choose Manual Entry for a step-by-step form",
    "lowConfidence": "I'm not fully certain about that classification. You can adjust it later if needed."
```

- [ ] **Step 2: Add matching Arabic i18n keys to `ar.json`**

Add these keys inside the `"ai"` object in `apps/web/lib/i18n/ar.json`, after the `"defaultCover"` line:

```json
    "outOfScope": "هذا خارج نطاق خدماتي. أنا متخصص في تأمين الشركات في الإمارات. حاول وصف نشاطك التجاري.",
    "harmful": "ما أقدر أساعدك في هالطلب. خلنا نركز على إيجاد التأمين المناسب لشركتك.",
    "fallbackSuggestion": "هذا اللي تقدر تسويه:\n• وصّف نشاطك التجاري (مثلاً \"عندي مقهى في دبي\")\n• اختر نوع نشاط من الأسفل\n• أو اختر الإدخال اليدوي",
    "lowConfidence": "ما أنا متأكد تماماً من هالتصنيف. تقدر تعدّله لاحقاً إذا احتجت."
```

- [ ] **Step 3: Add out-of-scope and harmful input detection to the AI advisor page**

In `apps/web/app/quote/ai-advisor/page.tsx`, add these two functions right before the `analyzeInput` function (around line 565):

```typescript
const OUT_OF_SCOPE_KEYWORDS = [
  'weather', 'stock', 'crypto', 'bitcoin', 'recipe', 'joke',
  'movie', 'game', 'sports', 'politics', 'news', 'translate',
  'write me', 'code', 'program', 'hack', 'password',
];

const HARMFUL_KEYWORDS = [
  'fraud', 'scam', 'fake claim', 'forge', 'launder',
  'illegal', 'bypass', 'exploit',
];

function isOutOfScope(text: string): boolean {
  const lower = text.toLowerCase();
  return OUT_OF_SCOPE_KEYWORDS.some((kw) => lower.includes(kw));
}

function isHarmful(text: string): boolean {
  const lower = text.toLowerCase();
  return HARMFUL_KEYWORDS.some((kw) => lower.includes(kw));
}
```

- [ ] **Step 4: Wire the detection into the `handleSubmit` business step**

In the `handleSubmit` function, inside the `if (convo.step === 'business')` block, right after `addChatMessages({role: 'user', content: userChatMessage});` and before `setIsProcessing(true);`, add the out-of-scope and harmful checks:

Replace this block (lines 218-245):
```typescript
      addChatMessages({role: 'user', content: userChatMessage});
      setIsProcessing(true);

      setTimeout(() => {
        const analysis = analyzeInput(userChatMessage, t.ai.needMore);
```

With:
```typescript
      addChatMessages({role: 'user', content: userChatMessage});

      // PDF §1.3 — Handle irrelevant or harmful questions before processing
      if (isHarmful(userChatMessage)) {
        addChatMessages({role: 'ai', content: t.ai.harmful});
        inputRef.current?.focus();
        return;
      }
      if (isOutOfScope(userChatMessage)) {
        addChatMessages({role: 'ai', content: `${t.ai.outOfScope}\n\n${t.ai.fallbackSuggestion}`});
        inputRef.current?.focus();
        return;
      }

      setIsProcessing(true);

      setTimeout(() => {
        const analysis = analyzeInput(userChatMessage, t.ai.needMore);
```

- [ ] **Step 5: Add structured fallback to the `needsMore` path**

In the same `handleSubmit` function, find the block where `analysis.needsMore` is handled (around line 225-244). Replace:

```typescript
          addChatMessages({role: 'ai', content: analysis.response});
          setIsProcessing(false);
          inputRef.current?.focus();
          return;
```

With:

```typescript
          addChatMessages({role: 'ai', content: `${analysis.response}\n\n${t.ai.fallbackSuggestion}`});
          setIsProcessing(false);
          inputRef.current?.focus();
          return;
```

- [ ] **Step 6: Verify build**

Run: `cd /Users/ahmedosman/Developer/the-one-and-only/shory-sme && pnpm turbo build --filter=web`
Expected: Build succeeds

- [ ] **Step 7: Commit**

```bash
git add apps/web/lib/i18n/en.json apps/web/lib/i18n/ar.json apps/web/app/quote/ai-advisor/page.tsx
git commit -m "feat: add out-of-scope, harmful input detection and structured fallback messages"
```

---

### Task 5: Frontend — Confidence Signalling for Classification

**Files:**
- Modify: `apps/web/app/quote/ai-advisor/page.tsx`

When the `analyzeInput` function falls back to "general-trading" (the default catch-all on line 591), signal low confidence to the user per PDF §3.1.

- [ ] **Step 1: Update the default fallback in `analyzeInput`**

In `apps/web/app/quote/ai-advisor/page.tsx`, find the return statement at line 591:

```typescript
  return {businessType: 'general-trading', label: 'General Trading', response: ''};
```

Replace with:

```typescript
  return {businessType: 'general-trading', label: 'General Trading', response: '', lowConfidence: true};
```

And update the return type of `analyzeInput` (line 565) from:

```typescript
function analyzeInput(text: string, needMoreText: string): {response: string; businessType: string; label: string; needsMore?: boolean} {
```

To:

```typescript
function analyzeInput(text: string, needMoreText: string): {response: string; businessType: string; label: string; needsMore?: boolean; lowConfidence?: boolean} {
```

- [ ] **Step 2: Show confidence caveat when classification is low-confidence**

In `handleSubmit`, find the block after the `analyzeInput` call where the successful classification message is added (around lines 248-252):

```typescript
        addChatMessages({
          role: 'ai',
          content: `${t.ai.classifiedAs} **${translatedLabel}**. ${t.ai.quickQuestions}`,
        });
```

Replace with:

```typescript
        const confidenceNote = analysis.lowConfidence ? `\n\n${t.ai.lowConfidence}` : '';
        addChatMessages({
          role: 'ai',
          content: `${t.ai.classifiedAs} **${translatedLabel}**. ${t.ai.quickQuestions}${confidenceNote}`,
        });
```

- [ ] **Step 3: Verify build**

Run: `cd /Users/ahmedosman/Developer/the-one-and-only/shory-sme && pnpm turbo build --filter=web`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/quote/ai-advisor/page.tsx
git commit -m "feat: add confidence signalling for low-confidence business classification"
```

---

### Task 6: Verify Full Build

**Files:** None (verification only)

- [ ] **Step 1: Run full monorepo build**

Run: `cd /Users/ahmedosman/Developer/the-one-and-only/shory-sme && pnpm turbo build`
Expected: All packages and apps build successfully

- [ ] **Step 2: Run lint**

Run: `cd /Users/ahmedosman/Developer/the-one-and-only/shory-sme && pnpm turbo lint`
Expected: No new lint errors
