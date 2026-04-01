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
