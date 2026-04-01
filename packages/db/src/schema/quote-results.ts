import {pgTable, text, numeric, uuid, timestamp, jsonb} from 'drizzle-orm/pg-core';
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
