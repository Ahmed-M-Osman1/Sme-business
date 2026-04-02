import {pgEnum, pgTable, text, boolean, timestamp, uuid} from 'drizzle-orm/pg-core';
import {customers} from './customers';

export const alertSeverityEnum = pgEnum('alert_severity', [
  'low', 'medium', 'high', 'critical',
]);

export const portfolioAlerts = pgTable('portfolio_alerts', {
  id: uuid('id').defaultRandom().primaryKey(),
  severity: alertSeverityEnum('severity').notNull(),
  icon: text('icon').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  timeLabel: text('time_label').notNull(),
  customerId: uuid('customer_id').references(() => customers.id),
  isPlatform: boolean('is_platform').default(false).notNull(),
  isProactive: boolean('is_proactive').default(false).notNull(),
  signalId: text('signal_id'),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type PortfolioAlert = typeof portfolioAlerts.$inferSelect;
export type NewPortfolioAlert = typeof portfolioAlerts.$inferInsert;
