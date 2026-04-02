import {pgTable, text, uuid, timestamp} from 'drizzle-orm/pg-core';

export const webUsers = pgTable('web_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  phone: text('phone'),
  company: text('company'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type WebUser = typeof webUsers.$inferSelect;
export type NewWebUser = typeof webUsers.$inferInsert;
