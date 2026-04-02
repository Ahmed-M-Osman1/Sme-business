import {pgTable, text, numeric, boolean, timestamp, uuid} from 'drizzle-orm/pg-core';

export const behaviourMetrics = pgTable('behaviour_metrics', {
  id: uuid('id').defaultRandom().primaryKey(),
  label: text('label').notNull(),
  value: text('value').notNull(),
  trend: numeric('trend', {precision: 6, scale: 1}).default('0').notNull(),
  isGood: boolean('is_good').default(true).notNull(),
  icon: text('icon').notNull(),
  subLabel: text('sub_label').notNull(),
  recordedAt: timestamp('recorded_at').notNull(),
});

export type BehaviourMetric = typeof behaviourMetrics.$inferSelect;
export type NewBehaviourMetric = typeof behaviourMetrics.$inferInsert;
