import {pgTable, text, jsonb, timestamp} from 'drizzle-orm/pg-core';

export const peerBenchmarks = pgTable('peer_benchmarks', {
  id: text('id').primaryKey(),
  category: text('category').notNull(),
  employeeBand: text('employee_band').notNull(),
  headline: text('headline').notNull(),
  data: jsonb('data').$type<Array<{product: string; pct: number; mandatory: boolean}>>().default([]).notNull(),
  trendingProduct: text('trending_product'),
  trendDetail: text('trend_detail'),
  relevantCustomers: jsonb('relevant_customers').$type<string[]>().default([]).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type PeerBenchmark = typeof peerBenchmarks.$inferSelect;
export type NewPeerBenchmark = typeof peerBenchmarks.$inferInsert;
