import {pgTable, text, integer, numeric, boolean, timestamp, uuid} from 'drizzle-orm/pg-core';

export const funnelEvents = pgTable('funnel_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  step: text('step').notNull(),
  sessions: integer('sessions').notNull(),
  dropPct: numeric('drop_pct', {precision: 5, scale: 1}).default('0').notNull(),
  trend: numeric('trend', {precision: 5, scale: 1}).default('0').notNull(),
  isAnomaly: boolean('is_anomaly').default(false).notNull(),
  recordedAt: timestamp('recorded_at').notNull(),
});

export type FunnelEvent = typeof funnelEvents.$inferSelect;
export type NewFunnelEvent = typeof funnelEvents.$inferInsert;
