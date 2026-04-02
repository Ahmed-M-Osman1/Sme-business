import {pgTable, text, integer, timestamp} from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  shortName: text('short_name').notNull(),
  icon: text('icon').notNull(),
  basePrice: integer('base_price').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
