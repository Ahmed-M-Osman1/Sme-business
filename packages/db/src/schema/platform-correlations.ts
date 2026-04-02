import {pgTable, text, boolean, jsonb, timestamp} from 'drizzle-orm/pg-core';
import {signalSeverityEnum} from './external-signals';

export const platformCorrelations = pgTable('platform_correlations', {
  id: text('id').primaryKey(),
  severity: signalSeverityEnum('severity').notNull(),
  headline: text('headline').notNull(),
  detail: text('detail').notNull(),
  action: text('action'),
  actionLabel: text('action_label'),
  services: jsonb('services').$type<string[]>().default([]).notNull(),
  metrics: jsonb('metrics').$type<string[]>().default([]).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type PlatformCorrelation = typeof platformCorrelations.$inferSelect;
export type NewPlatformCorrelation = typeof platformCorrelations.$inferInsert;
