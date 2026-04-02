import {pgEnum, pgTable, text, timestamp, uuid} from 'drizzle-orm/pg-core';

export const incidentSeverityEnum = pgEnum('incident_severity', [
  'low', 'medium', 'high', 'critical',
]);

export const incidentStatusEnum = pgEnum('incident_status', [
  'active', 'resolved',
]);

export const incidents = pgTable('incidents', {
  id: uuid('id').defaultRandom().primaryKey(),
  serviceName: text('service_name').notNull(),
  severity: incidentSeverityEnum('severity').notNull(),
  status: incidentStatusEnum('status').default('active').notNull(),
  startedAt: timestamp('started_at').notNull(),
  resolvedAt: timestamp('resolved_at'),
  description: text('description').notNull(),
  impact: text('impact').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Incident = typeof incidents.$inferSelect;
export type NewIncident = typeof incidents.$inferInsert;
