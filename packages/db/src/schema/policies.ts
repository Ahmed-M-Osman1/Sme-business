import {pgTable, text, uuid, timestamp, date, pgEnum, jsonb} from 'drizzle-orm/pg-core';
import {quotes} from './quotes';
import {quoteResults} from './quote-results';
import {webUsers} from './web-users';

export const policyStatusEnum = pgEnum('policy_status', ['active', 'cancelled', 'expired']);

export const policies = pgTable('policies', {
  id: uuid('id').primaryKey().defaultRandom(),
  quoteId: uuid('quote_id')
    .notNull()
    .references(() => quotes.id),
  resultId: uuid('result_id')
    .notNull()
    .references(() => quoteResults.id),
  userId: uuid('user_id').references(() => webUsers.id),
  policyNumber: text('policy_number').notNull().unique(),
  status: policyStatusEnum('status').default('active').notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  products: jsonb('products').$type<string[]>().default([]).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Policy = typeof policies.$inferSelect;
export type NewPolicy = typeof policies.$inferInsert;
