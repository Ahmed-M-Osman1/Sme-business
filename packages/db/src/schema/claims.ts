import {pgEnum, pgTable, text, numeric, timestamp, uuid} from 'drizzle-orm/pg-core';
import {customers} from './customers';

export const claimStatusEnum = pgEnum('claim_status', [
  'open', 'under_review', 'settled', 'denied',
]);

export const claims = pgTable('claims', {
  id: uuid('id').defaultRandom().primaryKey(),
  claimRef: text('claim_ref').notNull().unique(),
  customerId: uuid('customer_id').references(() => customers.id).notNull(),
  type: text('type').notNull(),
  status: claimStatusEnum('status').default('open').notNull(),
  reserve: numeric('reserve', {precision: 10, scale: 2}).notNull(),
  description: text('description').notNull(),
  handlerName: text('handler_name'),
  filedAt: timestamp('filed_at').notNull(),
  resolvedAt: timestamp('resolved_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Claim = typeof claims.$inferSelect;
export type NewClaim = typeof claims.$inferInsert;
