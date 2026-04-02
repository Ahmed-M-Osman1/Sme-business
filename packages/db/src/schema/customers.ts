import {pgEnum, pgTable, text, integer, numeric, timestamp, uuid, jsonb} from 'drizzle-orm/pg-core';
import {insurers} from './insurers';

export const customerStageEnum = pgEnum('customer_stage', [
  'active', 'renewal_negotiation', 'lapsed',
]);

export const paymentStatusEnum = pgEnum('payment_status', [
  'on_time', 'overdue', 'pending',
]);

export const customers = pgTable('customers', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  company: text('company').notNull(),
  email: text('email').notNull().unique(),
  emirate: text('emirate').notNull(),
  category: text('category').notNull(),
  employees: integer('employees').notNull(),
  nps: integer('nps'),
  stage: customerStageEnum('stage').default('active').notNull(),
  churnScore: integer('churn_score').default(0).notNull(),
  healthScore: integer('health_score').default(100).notNull(),
  ltv: numeric('ltv', {precision: 12, scale: 2}).default('0').notNull(),
  policyRef: text('policy_ref'),
  lastContact: timestamp('last_contact'),
  paymentStatus: paymentStatusEnum('payment_status').default('on_time').notNull(),
  claimsOpen: integer('claims_open').default(0).notNull(),
  products: jsonb('products').$type<string[]>().default([]).notNull(),
  missingProducts: jsonb('missing_products').$type<string[]>().default([]).notNull(),
  renewalDays: integer('renewal_days').default(0).notNull(),
  insurerId: text('insurer_id').references(() => insurers.id),
  premium: numeric('premium', {precision: 10, scale: 2}).default('0').notNull(),
  aiSignal: text('ai_signal'),
  revenueOpp: numeric('revenue_opp', {precision: 10, scale: 2}).default('0').notNull(),
  tags: jsonb('tags').$type<string[]>().default([]).notNull(),
  autoCommsStatus: text('auto_comms_status'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
