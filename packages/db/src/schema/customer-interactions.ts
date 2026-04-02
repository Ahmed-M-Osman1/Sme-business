import {pgEnum, pgTable, text, timestamp, uuid} from 'drizzle-orm/pg-core';
import {customers} from './customers';

export const interactionTypeEnum = pgEnum('interaction_type', [
  'inbound_whatsapp', 'inbound_chat', 'inbound_call', 'outbound_email',
  'outbound_whatsapp', 'auto_email', 'auto_whatsapp', 'note',
]);

export const customerInteractions = pgTable('customer_interactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id').references(() => customers.id).notNull(),
  type: interactionTypeEnum('type').notNull(),
  note: text('note').notNull(),
  agentName: text('agent_name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type CustomerInteraction = typeof customerInteractions.$inferSelect;
export type NewCustomerInteraction = typeof customerInteractions.$inferInsert;
