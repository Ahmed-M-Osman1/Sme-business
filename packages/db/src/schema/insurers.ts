import {boolean, pgTable, text, real, integer, timestamp} from 'drizzle-orm/pg-core';

export const insurers = pgTable('insurers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  logo: text('logo').notNull(),
  rating: real('rating').notNull(),
  reviewCount: integer('review_count').notNull(),
  shariahCompliant: boolean('shariah_compliant').default(false).notNull(),
  priceMultiplier: real('price_multiplier').default(1.0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Insurer = typeof insurers.$inferSelect;
export type NewInsurer = typeof insurers.$inferInsert;
