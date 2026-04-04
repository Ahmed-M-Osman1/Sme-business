import {Hono} from 'hono';
import {db, quotes, aiRecommendations, aiFallbackLog} from '@shory/db';
import {aiRecommendRequestSchema} from '@shory/shared';
import {eq} from 'drizzle-orm';
import {errorResponse, handleZodError} from '../middleware/error-handler.js';
import {getRecommendations, classifyBusiness} from '../ai/advisor.js';
import {ZodError} from 'zod';
import {z} from 'zod';

export const aiRouter = new Hono();

const classifySchema = z.object({
  text: z.string().min(1, 'Text is required'),
});

aiRouter.post('/classify', async (c) => {
  try {
    const body = await c.req.json();
    const {text} = classifySchema.parse(body);

    const result = await classifyBusiness(text);

    // Log fallbacks to ai_fallback_log
    if (result.fallback) {
      await db.insert(aiFallbackLog).values({
        query: text,
        fallbackReason: result.fallback === 'harmful' ? 'harmful'
          : result.fallback === 'out_of_scope' ? 'out_of_scope'
          : 'unknown_topic',
        sessionId: c.req.header('x-session-id') ?? null,
      }).catch(() => {});
    }

    return c.json(result);
  } catch (e) {
    if (e instanceof ZodError) return handleZodError(c, e);
    if (e instanceof Error && (e.message.includes('gemini') || e.message.includes('GoogleGenAI') || e.message.includes('google'))) {
      await db.insert(aiFallbackLog).values({
        query: 'classify',
        fallbackReason: 'ai_unavailable',
        sessionId: c.req.header('x-session-id') ?? null,
      }).catch(() => {});
      return errorResponse(c, 'AI_UNAVAILABLE', 'AI service temporarily unavailable', 503);
    }
    throw e;
  }
});

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
    if (
      e instanceof Error &&
      (e.message.includes('gemini') || e.message.includes('GoogleGenAI') || e.message.includes('google'))
    ) {
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
