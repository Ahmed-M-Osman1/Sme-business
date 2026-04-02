import {pgEnum, pgTable, text, numeric, timestamp, uuid} from 'drizzle-orm/pg-core';
import {customers} from './customers';

export const triggerTypeEnum = pgEnum('trigger_type', [
  'business_growth', 'digital_engagement', 'claims_event', 'industry_event',
]);

export const triggerStatusEnum = pgEnum('trigger_status', [
  'pending_send', 'awaiting', 'scheduled', 'sent',
]);

export const midtermTriggers = pgTable('midterm_triggers', {
  id: text('id').primaryKey(),
  customerId: uuid('customer_id').references(() => customers.id).notNull(),
  type: triggerTypeEnum('type').notNull(),
  icon: text('icon').notNull(),
  title: text('title').notNull(),
  triggerDescription: text('trigger_description').notNull(),
  detail: text('detail').notNull(),
  recommendedAction: text('recommended_action'),
  customerComms: text('customer_comms'),
  revenueImpact: numeric('revenue_impact', {precision: 10, scale: 2}).default('0').notNull(),
  timing: text('timing'),
  status: triggerStatusEnum('status').default('pending_send').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type MidtermTrigger = typeof midtermTriggers.$inferSelect;
export type NewMidtermTrigger = typeof midtermTriggers.$inferInsert;
