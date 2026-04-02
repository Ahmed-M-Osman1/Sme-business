import {pgEnum, pgTable, text, integer, numeric, timestamp} from 'drizzle-orm/pg-core';

export const serviceCategoryEnum = pgEnum('service_category', [
  'core', 'ai', 'infra', 'insurer',
]);

export const serviceStatusEnum = pgEnum('service_status', [
  'operational', 'degraded', 'down',
]);

export const apiServices = pgTable('api_services', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: serviceCategoryEnum('category').notNull(),
  status: serviceStatusEnum('status').default('operational').notNull(),
  uptime: numeric('uptime', {precision: 5, scale: 2}).default('100').notNull(),
  latency: integer('latency').default(0).notNull(),
  p99: integer('p99').default(0).notNull(),
  errorRate: numeric('error_rate', {precision: 5, scale: 2}).default('0').notNull(),
  requests24h: integer('requests_24h').default(0).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type ApiService = typeof apiServices.$inferSelect;
export type NewApiService = typeof apiServices.$inferInsert;
