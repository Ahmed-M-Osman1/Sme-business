import {pgTable, text, integer, numeric, timestamp, uuid} from 'drizzle-orm/pg-core';
import {apiServices} from './api-services';

export const serviceHealthLogs = pgTable('service_health_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  serviceId: text('service_id').references(() => apiServices.id).notNull(),
  latency: integer('latency').notNull(),
  errorRate: numeric('error_rate', {precision: 5, scale: 2}).notNull(),
  requests: integer('requests').notNull(),
  recordedAt: timestamp('recorded_at').notNull(),
});

export type ServiceHealthLog = typeof serviceHealthLogs.$inferSelect;
export type NewServiceHealthLog = typeof serviceHealthLogs.$inferInsert;
