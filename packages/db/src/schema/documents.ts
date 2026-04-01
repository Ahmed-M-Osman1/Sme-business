import {pgTable, text, uuid, timestamp} from 'drizzle-orm/pg-core';
import {quotes} from './quotes';

export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  quoteId: uuid('quote_id')
    .notNull()
    .references(() => quotes.id),
  fileName: text('file_name').notNull(),
  fileType: text('file_type').notNull(),
  blobUrl: text('blob_url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
