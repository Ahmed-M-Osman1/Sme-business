import {pgEnum, pgTable, text, timestamp, uuid, jsonb} from 'drizzle-orm/pg-core';
import {customers} from './customers';
import {adminUsers} from './admin-users';

export const actionStatusEnum = pgEnum('action_status', [
  'queued', 'processing', 'completed', 'failed',
]);

export const actions = pgTable('actions', {
  id: uuid('id').defaultRandom().primaryKey(),
  type: text('type').notNull(),
  status: actionStatusEnum('status').default('queued').notNull(),
  payload: jsonb('payload').$type<Record<string, unknown>>(),
  customerId: uuid('customer_id').references(() => customers.id),
  adminUserId: uuid('admin_user_id').references(() => adminUsers.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

export type Action = typeof actions.$inferSelect;
export type NewAction = typeof actions.$inferInsert;
