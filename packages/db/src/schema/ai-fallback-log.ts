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
