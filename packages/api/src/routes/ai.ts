import {Hono} from 'hono';
import {db, quotes, aiRecommendations} from '@shory/db';
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

    const {recommendations, modelUsed} = await getRecommendations(inputContext);

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
    if (e instanceof Error && (e.message.includes('anthropic') || e.message.includes('Anthropic'))) {
      return errorResponse(c, 'AI_UNAVAILABLE', 'AI service temporarily unavailable', 503);
    }
    throw e;
  }
});
