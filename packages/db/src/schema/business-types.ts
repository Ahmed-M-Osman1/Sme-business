import {pgEnum, pgTable, text, real, timestamp, jsonb} from 'drizzle-orm/pg-core';

export const riskLevelEnum = pgEnum('risk_level', ['low', 'medium', 'high']);

export const businessTypes = pgTable('business_types', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  icon: text('icon').notNull(),
  riskLevel: riskLevelEnum('risk_level').notNull(),
  riskFactor: real('risk_factor').notNull(),
  products: jsonb('products').$type<string[]>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type BusinessType = typeof businessTypes.$inferSelect;
export type NewBusinessType = typeof businessTypes.$inferInsert;
