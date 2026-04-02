import {pgTable, text, jsonb, timestamp} from 'drizzle-orm/pg-core';

export const quoteOptions = pgTable('quote_options', {
  id: text('id').primaryKey(),
  category: text('category').notNull(),
  items: jsonb('items').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type QuoteOption = typeof quoteOptions.$inferSelect;
export type NewQuoteOption = typeof quoteOptions.$inferInsert;
