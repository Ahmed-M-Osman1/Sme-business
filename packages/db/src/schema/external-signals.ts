import {pgEnum, pgTable, text, numeric, jsonb, timestamp} from 'drizzle-orm/pg-core';

export const signalCategoryEnum = pgEnum('signal_category', [
  'weather', 'cyber', 'regulatory', 'market',
]);

export const signalSeverityEnum = pgEnum('signal_severity', [
  'low', 'medium', 'high',
]);

export const externalSignals = pgTable('external_signals', {
  id: text('id').primaryKey(),
  category: signalCategoryEnum('category').notNull(),
  severity: signalSeverityEnum('severity').notNull(),
  icon: text('icon').notNull(),
  title: text('title').notNull(),
  source: text('source').notNull(),
  detail: text('detail').notNull(),
  affectedCategories: jsonb('affected_categories').$type<string[]>().default([]).notNull(),
  recommendedProduct: text('recommended_product'),
  recommendedEnhancement: text('recommended_enhancement'),
  customerCommsAngle: text('customer_comms_angle'),
  affectedCustomers: jsonb('affected_customers').$type<string[]>().default([]).notNull(),
  commsReadiness: text('comms_readiness'),
  revenueImpact: numeric('revenue_impact', {precision: 10, scale: 2}).default('0').notNull(),
  urgency: signalSeverityEnum('urgency').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type ExternalSignal = typeof externalSignals.$inferSelect;
export type NewExternalSignal = typeof externalSignals.$inferInsert;
