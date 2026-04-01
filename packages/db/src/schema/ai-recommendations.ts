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
