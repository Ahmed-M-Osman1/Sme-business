import {pgEnum, pgTable, text, integer, timestamp, uuid} from 'drizzle-orm/pg-core';

export const quoteStatusEnum = pgEnum('quote_status', [
  'draft',
  'submitted',
  'quoted',
  'accepted',
  'expired',
  'rejected',
]);

export const quotes = pgTable('quotes', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessName: text('business_name').notNull(),
  tradeLicense: text('trade_license'),
  emirate: text('emirate').notNull(),
  industry: text('industry').notNull(),
  businessType: text('business_type'),
  employeesCount: integer('employees_count').notNull(),
  coverageType: text('coverage_type').notNull(),
  status: quoteStatusEnum('status').default('draft').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Quote = typeof quotes.$inferSelect;
export type NewQuote = typeof quotes.$inferInsert;
