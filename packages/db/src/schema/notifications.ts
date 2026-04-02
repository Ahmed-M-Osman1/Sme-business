import {pgTable, text, boolean, timestamp, uuid} from 'drizzle-orm/pg-core';
import {customers} from './customers';
import {actions} from './actions';
import {quotes} from './quotes';

export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  actionId: uuid('action_id').references(() => actions.id).notNull(),
  customerId: uuid('customer_id').references(() => customers.id).notNull(),
  quoteId: uuid('quote_id').references(() => quotes.id),
  title: text('title').notNull(),
  body: text('body').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
