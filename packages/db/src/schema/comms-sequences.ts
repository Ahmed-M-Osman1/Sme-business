import {pgEnum, pgTable, text, integer, boolean, timestamp, uuid} from 'drizzle-orm/pg-core';
import {customers} from './customers';

export const commsTypeEnum = pgEnum('comms_type', ['renewal', 'lapse']);
export const commsChannelEnum = pgEnum('comms_channel', ['email', 'whatsapp']);

export const commsSequences = pgTable('comms_sequences', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id').references(() => customers.id).notNull(),
  type: commsTypeEnum('type').notNull(),
  dayOffset: integer('day_offset').notNull(),
  channel: commsChannelEnum('channel').notNull(),
  label: text('label').notNull(),
  isSent: boolean('is_sent').default(false).notNull(),
  sentAt: timestamp('sent_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type CommsSequence = typeof commsSequences.$inferSelect;
export type NewCommsSequence = typeof commsSequences.$inferInsert;
