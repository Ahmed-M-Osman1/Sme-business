# Admin AI Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full AI-powered admin dashboard with customer management, platform health monitoring, proactive intelligence, incident management, and web app notifications — all backed by real DB tables and API endpoints.

**Architecture:** Domain-layered vertical slices. DB schemas → Shared types → API routes → Rule engine → Admin UI → Web notifications. Each task group is independent and parallelizable. All UI text lives in i18n JSON files (AR/EN).

**Tech Stack:** Drizzle ORM + Neon Postgres, Hono REST API, Next.js 16 (App Router), Tailwind CSS v4, shadcn/ui from @shory/ui, custom i18n (React Context + JSON).

**Spec:** `docs/superpowers/specs/2026-04-02-admin-ai-dashboard-design.md`

**Prototype Reference:** The JSX prototype file provided by the user contains all data structures, UI layouts, and copy.

---

## Parallel Task Groups

Tasks are organized into groups that can run in parallel. Dependencies are noted.

```
Group A: DB Schemas (no deps)
Group B: Shared Types & Zod Schemas (no deps)
Group C: Admin i18n Setup (no deps)
Group D: API Routes (depends on A + B)
Group E: Rule Engine (depends on A + B)
Group F: Seed Data (depends on A)
Group G: Shared UI Components (depends on C)
Group H: Admin Pages — Customers (depends on D + E + G)
Group I: Admin Pages — Platform (depends on D + G)
Group J: Admin Pages — Signals (depends on D + G)
Group K: Admin Pages — Renewals, Claims, Reports (depends on D + G)
Group L: Layout Updates — Sidebar, Header, Alert Tray (depends on D + G)
Group M: Web App Notifications (depends on D)
```

**Phase 1 (parallel):** A, B, C
**Phase 2 (parallel):** D, E, F, G
**Phase 3 (parallel):** H, I, J, K, L, M

---

## Group A: Database Schemas

### Task A1: Core Domain Tables — customers, incidents, portfolio_alerts

**Files:**
- Create: `packages/db/src/schema/customers.ts`
- Create: `packages/db/src/schema/incidents.ts`
- Create: `packages/db/src/schema/portfolio-alerts.ts`
- Modify: `packages/db/src/client.ts`
- Modify: `packages/db/src/index.ts`

- [ ] **Step 1: Create customers schema**

Create `packages/db/src/schema/customers.ts`:

```typescript
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
```

- [ ] **Step 2: Create incidents schema**

Create `packages/db/src/schema/incidents.ts`:

```typescript
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
```

- [ ] **Step 3: Create portfolio_alerts schema**

Create `packages/db/src/schema/portfolio-alerts.ts`:

```typescript
import {pgEnum, pgTable, text, boolean, timestamp, uuid} from 'drizzle-orm/pg-core';
import {customers} from './customers';

export const alertSeverityEnum = pgEnum('alert_severity', [
  'low', 'medium', 'high', 'critical',
]);

export const portfolioAlerts = pgTable('portfolio_alerts', {
  id: uuid('id').defaultRandom().primaryKey(),
  severity: alertSeverityEnum('severity').notNull(),
  icon: text('icon').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  timeLabel: text('time_label').notNull(),
  customerId: uuid('customer_id').references(() => customers.id),
  isPlatform: boolean('is_platform').default(false).notNull(),
  isProactive: boolean('is_proactive').default(false).notNull(),
  signalId: text('signal_id'),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type PortfolioAlert = typeof portfolioAlerts.$inferSelect;
export type NewPortfolioAlert = typeof portfolioAlerts.$inferInsert;
```

- [ ] **Step 4: Register schemas in client.ts and index.ts**

Add to `packages/db/src/client.ts` — add new imports alongside existing ones:

```typescript
import * as customersSchema from './schema/customers';
import * as incidentsSchema from './schema/incidents';
import * as alertsSchema from './schema/portfolio-alerts';
```

And spread them into the drizzle config:

```typescript
export const db = drizzle(client, {
  schema: {...schema, ...adminSchema, ...customersSchema, ...incidentsSchema, ...alertsSchema},
});
```

Add to `packages/db/src/index.ts`:

```typescript
export {customerStageEnum, paymentStatusEnum, customers} from './schema/customers';
export type {Customer, NewCustomer} from './schema/customers';

export {incidentSeverityEnum, incidentStatusEnum, incidents} from './schema/incidents';
export type {Incident, NewIncident} from './schema/incidents';

export {alertSeverityEnum, portfolioAlerts} from './schema/portfolio-alerts';
export type {PortfolioAlert, NewPortfolioAlert} from './schema/portfolio-alerts';
```

- [ ] **Step 5: Generate and run migration**

Run:
```bash
cd packages/db && npx drizzle-kit generate && npx drizzle-kit push
```

- [ ] **Step 6: Commit**

```bash
git add packages/db/src/schema/customers.ts packages/db/src/schema/incidents.ts packages/db/src/schema/portfolio-alerts.ts packages/db/src/client.ts packages/db/src/index.ts packages/db/drizzle/
git commit -m "feat(db): add customers, incidents, portfolio_alerts schemas"
```

---

### Task A2: Action & Notification Tables — actions, notifications, comms_sequences

**Files:**
- Create: `packages/db/src/schema/actions.ts`
- Create: `packages/db/src/schema/notifications.ts`
- Create: `packages/db/src/schema/comms-sequences.ts`
- Modify: `packages/db/src/client.ts`
- Modify: `packages/db/src/index.ts`

- [ ] **Step 1: Create actions schema**

Create `packages/db/src/schema/actions.ts`:

```typescript
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
```

- [ ] **Step 2: Create notifications schema**

Create `packages/db/src/schema/notifications.ts`:

```typescript
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
```

- [ ] **Step 3: Create comms_sequences schema**

Create `packages/db/src/schema/comms-sequences.ts`:

```typescript
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
```

- [ ] **Step 4: Register in client.ts and index.ts**

Add to `packages/db/src/client.ts`:

```typescript
import * as actionsSchema from './schema/actions';
import * as notificationsSchema from './schema/notifications';
import * as commsSchema from './schema/comms-sequences';
```

Spread into drizzle config alongside existing entries.

Add to `packages/db/src/index.ts`:

```typescript
export {actionStatusEnum, actions} from './schema/actions';
export type {Action, NewAction} from './schema/actions';

export {notifications} from './schema/notifications';
export type {Notification, NewNotification} from './schema/notifications';

export {commsTypeEnum, commsChannelEnum, commsSequences} from './schema/comms-sequences';
export type {CommsSequence, NewCommsSequence} from './schema/comms-sequences';
```

- [ ] **Step 5: Generate and run migration**

```bash
cd packages/db && npx drizzle-kit generate && npx drizzle-kit push
```

- [ ] **Step 6: Commit**

```bash
git add packages/db/src/schema/actions.ts packages/db/src/schema/notifications.ts packages/db/src/schema/comms-sequences.ts packages/db/src/client.ts packages/db/src/index.ts packages/db/drizzle/
git commit -m "feat(db): add actions, notifications, comms_sequences schemas"
```

---

### Task A3: Telemetry Tables — api_services, service_health_logs, funnel_events, behaviour_metrics

**Files:**
- Create: `packages/db/src/schema/api-services.ts`
- Create: `packages/db/src/schema/service-health-logs.ts`
- Create: `packages/db/src/schema/funnel-events.ts`
- Create: `packages/db/src/schema/behaviour-metrics.ts`
- Modify: `packages/db/src/client.ts`
- Modify: `packages/db/src/index.ts`

- [ ] **Step 1: Create api_services schema**

Create `packages/db/src/schema/api-services.ts`:

```typescript
import {pgEnum, pgTable, text, integer, numeric, timestamp} from 'drizzle-orm/pg-core';

export const serviceCategoryEnum = pgEnum('service_category', [
  'core', 'ai', 'infra', 'insurer',
]);

export const serviceStatusEnum = pgEnum('service_status', [
  'operational', 'degraded', 'down',
]);

export const apiServices = pgTable('api_services', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: serviceCategoryEnum('category').notNull(),
  status: serviceStatusEnum('status').default('operational').notNull(),
  uptime: numeric('uptime', {precision: 5, scale: 2}).default('100').notNull(),
  latency: integer('latency').default(0).notNull(),
  p99: integer('p99').default(0).notNull(),
  errorRate: numeric('error_rate', {precision: 5, scale: 2}).default('0').notNull(),
  requests24h: integer('requests_24h').default(0).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type ApiService = typeof apiServices.$inferSelect;
export type NewApiService = typeof apiServices.$inferInsert;
```

- [ ] **Step 2: Create service_health_logs schema**

Create `packages/db/src/schema/service-health-logs.ts`:

```typescript
import {pgTable, text, integer, numeric, timestamp, uuid} from 'drizzle-orm/pg-core';
import {apiServices} from './api-services';

export const serviceHealthLogs = pgTable('service_health_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  serviceId: text('service_id').references(() => apiServices.id).notNull(),
  latency: integer('latency').notNull(),
  errorRate: numeric('error_rate', {precision: 5, scale: 2}).notNull(),
  requests: integer('requests').notNull(),
  recordedAt: timestamp('recorded_at').notNull(),
});

export type ServiceHealthLog = typeof serviceHealthLogs.$inferSelect;
export type NewServiceHealthLog = typeof serviceHealthLogs.$inferInsert;
```

- [ ] **Step 3: Create funnel_events schema**

Create `packages/db/src/schema/funnel-events.ts`:

```typescript
import {pgTable, text, integer, numeric, boolean, timestamp, uuid} from 'drizzle-orm/pg-core';

export const funnelEvents = pgTable('funnel_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  step: text('step').notNull(),
  sessions: integer('sessions').notNull(),
  dropPct: numeric('drop_pct', {precision: 5, scale: 1}).default('0').notNull(),
  trend: numeric('trend', {precision: 5, scale: 1}).default('0').notNull(),
  isAnomaly: boolean('is_anomaly').default(false).notNull(),
  recordedAt: timestamp('recorded_at').notNull(),
});

export type FunnelEvent = typeof funnelEvents.$inferSelect;
export type NewFunnelEvent = typeof funnelEvents.$inferInsert;
```

- [ ] **Step 4: Create behaviour_metrics schema**

Create `packages/db/src/schema/behaviour-metrics.ts`:

```typescript
import {pgTable, text, numeric, boolean, timestamp, uuid} from 'drizzle-orm/pg-core';

export const behaviourMetrics = pgTable('behaviour_metrics', {
  id: uuid('id').defaultRandom().primaryKey(),
  label: text('label').notNull(),
  value: text('value').notNull(),
  trend: numeric('trend', {precision: 6, scale: 1}).default('0').notNull(),
  isGood: boolean('is_good').default(true).notNull(),
  icon: text('icon').notNull(),
  subLabel: text('sub_label').notNull(),
  recordedAt: timestamp('recorded_at').notNull(),
});

export type BehaviourMetric = typeof behaviourMetrics.$inferSelect;
export type NewBehaviourMetric = typeof behaviourMetrics.$inferInsert;
```

- [ ] **Step 5: Register in client.ts and index.ts**

Same pattern — import schemas in client.ts, spread into drizzle config, export from index.ts.

- [ ] **Step 6: Generate and run migration, commit**

```bash
cd packages/db && npx drizzle-kit generate && npx drizzle-kit push
git add packages/db/
git commit -m "feat(db): add telemetry schemas — api_services, health_logs, funnel, behaviour"
```

---

### Task A4: Intelligence Tables — external_signals, midterm_triggers, peer_benchmarks, platform_correlations

**Files:**
- Create: `packages/db/src/schema/external-signals.ts`
- Create: `packages/db/src/schema/midterm-triggers.ts`
- Create: `packages/db/src/schema/peer-benchmarks.ts`
- Create: `packages/db/src/schema/platform-correlations.ts`
- Modify: `packages/db/src/client.ts`
- Modify: `packages/db/src/index.ts`

- [ ] **Step 1: Create external_signals schema**

Create `packages/db/src/schema/external-signals.ts`:

```typescript
import {pgEnum, pgTable, text, numeric, jsonb, timestamp} from 'drizzle-orm/pg-core';

export const signalCategoryEnum = pgEnum('signal_category', [
  'weather', 'cyber', 'regulatory', 'market',
]);

export const signalSeverityEnum = pgEnum('signal_severity', [
  'low', 'medium', 'high',
]);

export const externalSignals = pgTable('external_signals', {
  id: text('id').primaryKey(),
  category: signalCategoryEnum('category').notNull(),
  severity: signalSeverityEnum('severity').notNull(),
  icon: text('icon').notNull(),
  title: text('title').notNull(),
  source: text('source').notNull(),
  detail: text('detail').notNull(),
  affectedCategories: jsonb('affected_categories').$type<string[]>().default([]).notNull(),
  recommendedProduct: text('recommended_product'),
  recommendedEnhancement: text('recommended_enhancement'),
  customerCommsAngle: text('customer_comms_angle'),
  affectedCustomers: jsonb('affected_customers').$type<string[]>().default([]).notNull(),
  commsReadiness: text('comms_readiness'),
  revenueImpact: numeric('revenue_impact', {precision: 10, scale: 2}).default('0').notNull(),
  urgency: signalSeverityEnum('urgency').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type ExternalSignal = typeof externalSignals.$inferSelect;
export type NewExternalSignal = typeof externalSignals.$inferInsert;
```

- [ ] **Step 2: Create midterm_triggers schema**

Create `packages/db/src/schema/midterm-triggers.ts`:

```typescript
import {pgEnum, pgTable, text, numeric, timestamp, uuid} from 'drizzle-orm/pg-core';
import {customers} from './customers';

export const triggerTypeEnum = pgEnum('trigger_type', [
  'business_growth', 'digital_engagement', 'claims_event', 'industry_event',
]);

export const triggerStatusEnum = pgEnum('trigger_status', [
  'pending_send', 'awaiting', 'scheduled', 'sent',
]);

export const midtermTriggers = pgTable('midterm_triggers', {
  id: text('id').primaryKey(),
  customerId: uuid('customer_id').references(() => customers.id).notNull(),
  type: triggerTypeEnum('type').notNull(),
  icon: text('icon').notNull(),
  title: text('title').notNull(),
  triggerDescription: text('trigger_description').notNull(),
  detail: text('detail').notNull(),
  recommendedAction: text('recommended_action'),
  customerComms: text('customer_comms'),
  revenueImpact: numeric('revenue_impact', {precision: 10, scale: 2}).default('0').notNull(),
  timing: text('timing'),
  status: triggerStatusEnum('status').default('pending_send').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type MidtermTrigger = typeof midtermTriggers.$inferSelect;
export type NewMidtermTrigger = typeof midtermTriggers.$inferInsert;
```

- [ ] **Step 3: Create peer_benchmarks schema**

Create `packages/db/src/schema/peer-benchmarks.ts`:

```typescript
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
```

- [ ] **Step 4: Create platform_correlations schema**

Create `packages/db/src/schema/platform-correlations.ts`:

```typescript
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
```

- [ ] **Step 5: Register in client.ts and index.ts**

Same pattern — import all 4 schemas in client.ts, spread into drizzle config, export from index.ts.

- [ ] **Step 6: Generate and run migration, commit**

```bash
cd packages/db && npx drizzle-kit generate && npx drizzle-kit push
git add packages/db/
git commit -m "feat(db): add intelligence schemas — signals, triggers, benchmarks, correlations"
```

---

## Group B: Shared Types & Zod Schemas

### Task B1: New Zod Schemas and Type Exports

**Files:**
- Create: `packages/shared/src/schemas/customer.ts`
- Create: `packages/shared/src/schemas/incident.ts`
- Create: `packages/shared/src/schemas/action.ts`
- Create: `packages/shared/src/schemas/platform.ts`
- Create: `packages/shared/src/schemas/intelligence.ts`
- Create: `packages/shared/src/types/admin-dashboard.ts`
- Modify: `packages/shared/src/index.ts`

- [ ] **Step 1: Create customer schema**

Create `packages/shared/src/schemas/customer.ts`:

```typescript
import {z} from 'zod';

export const CUSTOMER_STAGES = ['active', 'renewal_negotiation', 'lapsed'] as const;
export const PAYMENT_STATUSES = ['on_time', 'overdue', 'pending'] as const;

export const createCustomerSchema = z.object({
  name: z.string().min(1),
  company: z.string().min(1),
  email: z.string().email(),
  emirate: z.string().min(1),
  category: z.string().min(1),
  employees: z.number().int().min(1),
  nps: z.number().int().min(0).max(10).nullable().optional(),
  stage: z.enum(CUSTOMER_STAGES).optional(),
  products: z.array(z.string()).optional(),
  missingProducts: z.array(z.string()).optional(),
  renewalDays: z.number().int().optional(),
  insurerId: z.string().optional(),
  premium: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
```

- [ ] **Step 2: Create incident schema**

Create `packages/shared/src/schemas/incident.ts`:

```typescript
import {z} from 'zod';

export const INCIDENT_SEVERITIES = ['low', 'medium', 'high', 'critical'] as const;
export const INCIDENT_STATUSES = ['active', 'resolved'] as const;

export const createIncidentSchema = z.object({
  serviceName: z.string().min(1),
  severity: z.enum(INCIDENT_SEVERITIES),
  description: z.string().min(1),
  impact: z.string().min(1),
});

export const updateIncidentSchema = z.object({
  status: z.enum(INCIDENT_STATUSES).optional(),
  resolvedAt: z.string().datetime().optional(),
  description: z.string().optional(),
  impact: z.string().optional(),
});

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
export type UpdateIncidentInput = z.infer<typeof updateIncidentSchema>;
```

- [ ] **Step 3: Create action schema**

Create `packages/shared/src/schemas/action.ts`:

```typescript
import {z} from 'zod';

export const ACTION_TYPES = [
  'send_email', 'send_whatsapp', 'apply_discount', 'send_retention_email',
  'suppress_card', 'escalate', 'add_upgrade_offer', 'enable_auto_renew',
  'pause_sequence', 'send_compliance_notice', 'send_reinstatement_link',
  'add_product_card', 'send_peer_insight', 'send_midterm_advisory',
  'approve_signal_comms', 'generate_report',
] as const;

export const dispatchActionSchema = z.object({
  type: z.enum(ACTION_TYPES),
  customerId: z.string().uuid().optional(),
  payload: z.record(z.unknown()).optional(),
});

export type DispatchActionInput = z.infer<typeof dispatchActionSchema>;
```

- [ ] **Step 4: Create platform schema**

Create `packages/shared/src/schemas/platform.ts`:

```typescript
import {z} from 'zod';

export const SERVICE_CATEGORIES = ['core', 'ai', 'infra', 'insurer'] as const;
export const SERVICE_STATUSES = ['operational', 'degraded', 'down'] as const;

export const updateServiceSchema = z.object({
  status: z.enum(SERVICE_STATUSES).optional(),
  latency: z.number().int().min(0).optional(),
  p99: z.number().int().min(0).optional(),
  errorRate: z.number().min(0).max(100).optional(),
  uptime: z.number().min(0).max(100).optional(),
  requests24h: z.number().int().min(0).optional(),
});

export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
```

- [ ] **Step 5: Create intelligence schema**

Create `packages/shared/src/schemas/intelligence.ts`:

```typescript
import {z} from 'zod';

export const SIGNAL_CATEGORIES = ['weather', 'cyber', 'regulatory', 'market'] as const;
export const SIGNAL_SEVERITIES = ['low', 'medium', 'high'] as const;
export const TRIGGER_STATUSES = ['pending_send', 'awaiting', 'scheduled', 'sent'] as const;

export const createSignalSchema = z.object({
  id: z.string().min(1),
  category: z.enum(SIGNAL_CATEGORIES),
  severity: z.enum(SIGNAL_SEVERITIES),
  icon: z.string(),
  title: z.string().min(1),
  source: z.string().min(1),
  detail: z.string().min(1),
  affectedCategories: z.array(z.string()),
  recommendedProduct: z.string().optional(),
  recommendedEnhancement: z.string().optional(),
  customerCommsAngle: z.string().optional(),
  affectedCustomers: z.array(z.string()),
  commsReadiness: z.string().optional(),
  revenueImpact: z.number().min(0),
  urgency: z.enum(SIGNAL_SEVERITIES),
});

export const updateSignalSchema = z.object({
  commsReadiness: z.string().optional(),
  affectedCustomers: z.array(z.string()).optional(),
});

export const updateTriggerSchema = z.object({
  status: z.enum(TRIGGER_STATUSES),
});

export type CreateSignalInput = z.infer<typeof createSignalSchema>;
export type UpdateSignalInput = z.infer<typeof updateSignalSchema>;
export type UpdateTriggerInput = z.infer<typeof updateTriggerSchema>;
```

- [ ] **Step 6: Create admin dashboard response types**

Create `packages/shared/src/types/admin-dashboard.ts`:

```typescript
export interface DashboardStatsResponse {
  totalQuotes: number;
  quotesThisWeek: number;
  acceptedQuotes: number;
  pendingQuotes: number;
  totalCustomers: number;
  activeIncidents: number;
  degradedServices: number;
  unreadAlerts: number;
}

export interface CustomerPlatformContext {
  flag: boolean;
  issue: string | null;
  detail: string | null;
  severity: 'low' | 'medium' | 'high' | null;
}

export interface PlaybookResult {
  type: string;
  urgency: string;
  badge: string;
  headline: string;
  body: string;
  actions: string[];
  inboundGuide: {
    title: string;
    points: string[];
    contextNote: string;
  };
}
```

- [ ] **Step 7: Update shared index.ts**

Add all new exports to `packages/shared/src/index.ts`:

```typescript
// Customer
export {createCustomerSchema, updateCustomerSchema, CUSTOMER_STAGES, PAYMENT_STATUSES} from './schemas/customer';
export type {CreateCustomerInput, UpdateCustomerInput} from './schemas/customer';

// Incident
export {createIncidentSchema, updateIncidentSchema, INCIDENT_SEVERITIES, INCIDENT_STATUSES} from './schemas/incident';
export type {CreateIncidentInput, UpdateIncidentInput} from './schemas/incident';

// Action
export {dispatchActionSchema, ACTION_TYPES} from './schemas/action';
export type {DispatchActionInput} from './schemas/action';

// Platform
export {updateServiceSchema, SERVICE_CATEGORIES, SERVICE_STATUSES} from './schemas/platform';
export type {UpdateServiceInput} from './schemas/platform';

// Intelligence
export {createSignalSchema, updateSignalSchema, updateTriggerSchema, SIGNAL_CATEGORIES, SIGNAL_SEVERITIES, TRIGGER_STATUSES} from './schemas/intelligence';
export type {CreateSignalInput, UpdateSignalInput, UpdateTriggerInput} from './schemas/intelligence';

// Admin Dashboard Types
export type {DashboardStatsResponse, CustomerPlatformContext, PlaybookResult} from './types/admin-dashboard';
```

- [ ] **Step 8: Commit**

```bash
git add packages/shared/
git commit -m "feat(shared): add Zod schemas and types for admin dashboard"
```

---

## Group C: Admin i18n Setup

### Task C1: Admin i18n Provider and Translation Files

**Files:**
- Create: `apps/admin/lib/i18n/index.tsx`
- Create: `apps/admin/lib/i18n/en.json`
- Create: `apps/admin/lib/i18n/ar.json`
- Modify: `apps/admin/app/layout.tsx`

- [ ] **Step 1: Create i18n provider**

Create `apps/admin/lib/i18n/index.tsx` — identical pattern to `apps/web/lib/i18n/index.tsx` but with `shory-admin-locale` as the localStorage key.

- [ ] **Step 2: Create en.json**

Create `apps/admin/lib/i18n/en.json` with all translation keys organized by feature section: nav, header, customers, aiPanel, playbooks, platform, signals, actions, renewals, claims, reports, common. Every piece of UI text in the admin dashboard must have a key here. Reference the prototype JSX for all copy.

- [ ] **Step 3: Create ar.json**

Create `apps/admin/lib/i18n/ar.json` — same structure as en.json with Arabic translations for every key.

- [ ] **Step 4: Wrap layout with I18nProvider**

Modify `apps/admin/app/layout.tsx` — import `I18nProvider` from `@/lib/i18n` and wrap the body content:

```typescript
import {I18nProvider} from '@/lib/i18n';

// In the return:
<body className="min-h-full flex font-sans">
  <I18nProvider>
    <AdminSidebar />
    <div className="flex-1 flex flex-col">
      <AdminHeader />
      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  </I18nProvider>
</body>
```

Note: Since AdminHeader is a server component that calls `auth()`, it needs to stay as a server component. The i18n provider wraps it, but the header itself won't use translations directly — instead create a client `HeaderContent` wrapper inside it that uses `useI18n()`.

- [ ] **Step 5: Commit**

```bash
git add apps/admin/lib/i18n/
git commit -m "feat(admin): add i18n provider with AR/EN translations"
```

---

## Group D: API Routes

**Depends on:** Group A (DB schemas) + Group B (Zod schemas)

### Task D1: Customer API Routes

**Files:**
- Create: `packages/api/src/routes/admin-customers.ts`
- Modify: `packages/api/src/routes/admin.ts` (mount new router)

- [ ] **Step 1: Create customer routes**

Create `packages/api/src/routes/admin-customers.ts` with all customer endpoints: GET `/` (list with pagination, filters for stage/category/emirate/search), GET `/:id`, POST `/`, PATCH `/:id`, GET `/:id/comms`, GET `/:id/signals`, GET `/:id/platform-context`. Use the existing Hono router + drizzle query patterns from `admin.ts`.

- [ ] **Step 2: Mount in admin router**

In `packages/api/src/routes/admin.ts`, import and mount: `adminRouter.route('/customers', adminCustomersRouter);`

- [ ] **Step 3: Commit**

```bash
git add packages/api/src/routes/admin-customers.ts packages/api/src/routes/admin.ts
git commit -m "feat(api): add admin customer CRUD routes"
```

### Task D2: Incident & Alert API Routes

**Files:**
- Create: `packages/api/src/routes/admin-incidents.ts`
- Create: `packages/api/src/routes/admin-alerts.ts`
- Modify: `packages/api/src/routes/admin.ts`

- [ ] **Step 1: Create incident routes**

GET `/`, POST `/`, PATCH `/:id`. Filter by status, severity. Use `incidents` table.

- [ ] **Step 2: Create alert routes**

GET `/` (sorted by severity desc, created_at desc), POST `/`, PATCH `/:id/read`.

- [ ] **Step 3: Mount and commit**

### Task D3: Action & Notification API Routes

**Files:**
- Create: `packages/api/src/routes/admin-actions.ts`
- Create: `packages/api/src/routes/notifications.ts`
- Modify: `packages/api/src/routes/admin.ts`
- Modify: `packages/api/src/app.ts` (mount notifications at root level — no auth)

- [ ] **Step 1: Create action routes**

POST `/` — validate with `dispatchActionSchema`, insert action, call notification rule, mark completed. GET `/` — list recent actions.

- [ ] **Step 2: Create notification routes (public)**

GET `/?quoteId=x` — list notifications for a quote. PATCH `/:id/read` — mark as read. No auth middleware.

- [ ] **Step 3: Mount notifications in app.ts (not under admin)**

In `packages/api/src/app.ts`: `app.route('/notifications', notificationsRouter);`

- [ ] **Step 4: Commit**

### Task D4: Platform Health API Routes

**Files:**
- Create: `packages/api/src/routes/admin-platform.ts`
- Modify: `packages/api/src/routes/admin.ts`

- [ ] **Step 1: Create platform routes**

GET `/services`, PATCH `/services/:id`, GET `/services/:id/history`, GET `/funnel`, GET `/behaviour`, GET `/correlations`.

- [ ] **Step 2: Mount and commit**

### Task D5: Intelligence API Routes

**Files:**
- Create: `packages/api/src/routes/admin-intelligence.ts`
- Modify: `packages/api/src/routes/admin.ts`

- [ ] **Step 1: Create intelligence routes**

GET `/signals`, POST `/signals`, PATCH `/signals/:id`, GET `/midterm`, PATCH `/midterm/:id`, GET `/benchmarks`, GET `/scheduled-comms`.

- [ ] **Step 2: Mount and commit**

### Task D6: Extended Admin Stats

**Files:**
- Modify: `packages/api/src/routes/admin.ts`

- [ ] **Step 1: Extend GET /admin/stats**

Add totalCustomers, activeIncidents, degradedServices, unreadAlerts to the existing stats endpoint. Query the new tables alongside existing quote stats.

- [ ] **Step 2: Commit**

---

## Group E: Rule Engine

**Depends on:** Group A + Group B

### Task E1: Scoring Rules — Churn & Health

**Files:**
- Create: `packages/api/src/rules/scoring.ts`

- [ ] **Step 1: Implement scoring functions**

```typescript
import type {Customer} from '@shory/db';

export function calculateChurnScore(customer: Customer): number {
  let score = 0;
  if (customer.renewalDays <= 7) score += 30;
  if (customer.claimsOpen > 0) score += 20;
  if (customer.paymentStatus === 'overdue') score += 15;
  if (customer.nps !== null && customer.nps <= 6) score += 15;
  if (customer.lastContact) {
    const daysSinceContact = Math.floor((Date.now() - customer.lastContact.getTime()) / 86400000);
    if (daysSinceContact > 30) score += 10;
  }
  if (customer.stage === 'lapsed') score += 10;
  return Math.min(score, 100);
}

export function calculateHealthScore(customer: Customer): number {
  let score = 100;
  const churn = calculateChurnScore(customer);
  if (churn >= 70) score -= 25;
  if (customer.claimsOpen > 0) score -= 15;
  if (customer.paymentStatus === 'overdue') score -= 15;
  if (customer.nps !== null && customer.nps <= 6) score -= 10;
  if (customer.renewalDays < 0) score -= 10;
  if (customer.lastContact) {
    const daysSinceContact = Math.floor((Date.now() - customer.lastContact.getTime()) / 86400000);
    if (daysSinceContact > 30) score -= 10;
  }
  return Math.max(score, 0);
}
```

- [ ] **Step 2: Commit**

### Task E2: Playbook Rules

**Files:**
- Create: `packages/api/src/rules/playbooks.ts`

- [ ] **Step 1: Implement playbook resolver**

Function that takes a Customer and returns a PlaybookResult with badge, headline, body, actions, inboundGuide. Uses the 4 rule conditions from the spec (renewal_high_confidence, churn_high_risk, upsell_opportunity, compliance_critical). All strings are template literals with customer data interpolation.

- [ ] **Step 2: Commit**

### Task E3: Correlation, Context, Alert, and Notification Rules

**Files:**
- Create: `packages/api/src/rules/correlations.ts`
- Create: `packages/api/src/rules/customer-platform.ts`
- Create: `packages/api/src/rules/alerts.ts`
- Create: `packages/api/src/rules/notifications.ts`

- [ ] **Step 1: Implement correlation rules**

Takes api_services + funnel_events, returns correlations based on service-to-funnel mapping and threshold logic from spec.

- [ ] **Step 2: Implement customer-platform context**

Takes a customer + degraded services, returns `CustomerPlatformContext`.

- [ ] **Step 3: Implement alert generation**

Takes current state (incidents, customers, signals, services), returns new alerts to insert.

- [ ] **Step 4: Implement action-to-notification mapping**

Takes an action, returns notification title + body based on action type.

- [ ] **Step 5: Commit**

---

## Group F: Seed Data

**Depends on:** Group A

### Task F1: Seed All Dashboard Data

**Files:**
- Modify: `packages/db/src/seed.ts`

- [ ] **Step 1: Add customer seed data**

5 customers from prototype: Mohammed Al-Rashidi, Dr. Ahmed Khalil, Sarah Al-Mansouri, Yusuf Al-Mansoori, Layla Hassan. All fields populated from the CUSTOMERS array in the JSX.

- [ ] **Step 2: Add API services seed data**

12 services from API_SERVICES array in JSX.

- [ ] **Step 3: Add incidents, alerts, funnel, behaviour metrics seed data**

From INCIDENTS, PORTFOLIO_ALERTS, FUNNEL_STEPS, BEHAVIOR_METRICS arrays in JSX.

- [ ] **Step 4: Add intelligence seed data**

From EXTERNAL_SIGNALS, MIDTERM_TRIGGERS, PEER_BENCHMARKS, PLATFORM_CORRELATIONS arrays in JSX.

- [ ] **Step 5: Add comms sequences seed data**

From RENEWAL_SEQ and LAPSE_SEQ arrays, linked to appropriate customers.

- [ ] **Step 6: Run seed and commit**

```bash
cd packages/db && npx tsx src/seed.ts
git add packages/db/src/seed.ts
git commit -m "feat(db): seed all admin dashboard data"
```

---

## Group G: Shared UI Components

**Depends on:** Group C (i18n)

### Task G1: Shared Admin Components

**Files:**
- Create: `apps/admin/components/shared/status-dot.tsx`
- Create: `apps/admin/components/shared/risk-bar.tsx`
- Create: `apps/admin/components/shared/ai-badge.tsx`
- Create: `apps/admin/components/shared/tag.tsx`
- Create: `apps/admin/components/shared/sparkline.tsx`
- Create: `apps/admin/components/shared/kpi-card.tsx`

- [ ] **Step 1: Create StatusDot**

Client component. Props: `status: 'operational' | 'degraded' | 'down'`, `pulse?: boolean`. Renders colored dot with optional ping animation. Green/amber/red mapping.

- [ ] **Step 2: Create RiskBar**

Client component. Props: `score: number`, `size?: 'sm' | 'md'`. Progress bar with color coding: green < 40, amber 40-69, red >= 70. Label shows HIGH/MED/LOW + score.

- [ ] **Step 3: Create AIBadge**

Client component. Props: `label: string`. Indigo pill with sparkle icon + text.

- [ ] **Step 4: Create Tag**

Client component. Props: `label: string`, `color: string`. Colored tag pill.

- [ ] **Step 5: Create Sparkline**

Client component. Props: `vals: number[]`, `color: string`, `h?: number`, `w?: number`. SVG polyline mini chart.

- [ ] **Step 6: Create KpiCard**

Client component. Props: `label: string`, `value: string | number`, `sub?: string`, `color: string`, `icon: string`. Reusable stat card with label, large value, sub text, icon.

- [ ] **Step 7: Commit**

```bash
git add apps/admin/components/shared/
git commit -m "feat(admin): add shared UI components — StatusDot, RiskBar, AIBadge, Tag, Sparkline, KpiCard"
```

---

## Group H: Admin Pages — Customers

**Depends on:** Groups D, E, G

### Task H1: Admin API Client Extensions

**Files:**
- Modify: `apps/admin/lib/api-client.ts`

- [ ] **Step 1: Add all new API client methods**

Add `customers`, `incidents`, `alerts`, `actions`, `platform`, `intelligence` namespaces to `adminApi`, following the existing pattern. Each method calls `fetchAdmin<T>()` with the correct path.

- [ ] **Step 2: Commit**

### Task H2: Customer List Component

**Files:**
- Create: `apps/admin/components/customers/customer-list.tsx`

- [ ] **Step 1: Implement CustomerList**

Client component. Search bar + scrollable list of customer cards. Each card shows name, company, playbook badge, platform status dot, renewal countdown. onClick sets selected customer via URL searchParams. All text via `useI18n()`.

- [ ] **Step 2: Commit**

### Task H3: Customer Profile Component

**Files:**
- Create: `apps/admin/components/customers/customer-profile.tsx`

- [ ] **Step 1: Implement CustomerProfile**

Client component with 5 tabs (overview, policies, comms, claims, history). Overview tab: active coverage grid, missing products, snapshot table, AI risk analysis, revenue opportunity card. All other tabs render their respective content. All text via `useI18n()`.

- [ ] **Step 2: Commit**

### Task H4: AI Panel Component

**Files:**
- Create: `apps/admin/components/customers/ai-panel/index.tsx`
- Create: `apps/admin/components/customers/ai-panel/ai-playbook-card.tsx`
- Create: `apps/admin/components/customers/ai-panel/proactive-signals-mini.tsx`
- Create: `apps/admin/components/customers/ai-panel/platform-health-mini.tsx`
- Create: `apps/admin/components/customers/ai-panel/inbound-guide.tsx`
- Create: `apps/admin/components/customers/ai-panel/risk-signals.tsx`

- [ ] **Step 1: Implement AI Panel index**

Client component. 300px sidebar. Shows loading skeleton, then playbook card, proactive signals mini, platform health mini, inbound guide, risk signals, revenue opp card. Fetches playbook from API. All text via `useI18n()`.

- [ ] **Step 2: Implement sub-components**

Each sub-component is a collapsible card matching the prototype's layout. `ai-playbook-card.tsx` shows NBA with action buttons that dispatch actions via API. `proactive-signals-mini.tsx` shows external signals + midterm triggers for this customer. `platform-health-mini.tsx` shows degraded services + behaviour anomalies. `inbound-guide.tsx` shows handler guide points. `risk-signals.tsx` shows churn bar, health bar, NPS, payment, claims, last contact.

- [ ] **Step 3: Commit**

### Task H5: Customers Page

**Files:**
- Create: `apps/admin/app/customers/page.tsx`

- [ ] **Step 1: Implement customers page**

Server component. Fetches customer list + selected customer detail from API. 3-column layout: CustomerList | CustomerProfile | AIPanel. Uses searchParams `?id=xxx` for selection. Default selects first customer.

- [ ] **Step 2: Commit**

---

## Group I: Admin Pages — Platform

**Depends on:** Groups D, G

### Task I1: Platform Sub-Components

**Files:**
- Create: `apps/admin/components/platform/platform-overview.tsx`
- Create: `apps/admin/components/platform/api-health-grid.tsx`
- Create: `apps/admin/components/platform/user-behaviour.tsx`
- Create: `apps/admin/components/platform/funnel-chart.tsx`
- Create: `apps/admin/components/platform/session-volume.tsx`
- Create: `apps/admin/components/platform/correlation-cards.tsx`
- Create: `apps/admin/components/platform/incident-cards.tsx`

- [ ] **Step 1: Implement all platform sub-components**

Each is a client component. `platform-overview.tsx`: active incident banner + 4 KPIs + correlations summary. `api-health-grid.tsx`: service grid by category with Sparkline. `user-behaviour.tsx`: wrapper for metric cards + funnel + session chart. `funnel-chart.tsx`: bar chart with anomaly detection. `session-volume.tsx`: 12-hour bar chart. `correlation-cards.tsx`: detailed cards with action buttons. `incident-cards.tsx`: KPI row + incident cards with update/resolve actions. All text via `useI18n()`.

- [ ] **Step 2: Commit**

### Task I2: Platform Page

**Files:**
- Create: `apps/admin/app/platform/page.tsx`

- [ ] **Step 1: Implement platform page**

Server component. Fetches services, funnel, behaviour, correlations, incidents from API. Client wrapper with 5 sub-tabs (overview, apis, behaviour, correlations, incidents). Passes data to sub-components.

- [ ] **Step 2: Commit**

---

## Group J: Admin Pages — Signals

**Depends on:** Groups D, G

### Task J1: Signal Sub-Components

**Files:**
- Create: `apps/admin/components/signals/external-signals.tsx`
- Create: `apps/admin/components/signals/midterm-triggers.tsx`
- Create: `apps/admin/components/signals/peer-benchmarks.tsx`
- Create: `apps/admin/components/signals/scheduled-comms.tsx`

- [ ] **Step 1: Implement all signal sub-components**

Each is a client component matching the prototype's ProactiveView tabs. `external-signals.tsx`: signal cards with approve/send flow, affected customers, revenue pipeline. `midterm-triggers.tsx`: trigger cards with customer link, send advisory. `peer-benchmarks.tsx`: adoption bars, trending product, send peer insight. `scheduled-comms.tsx`: queue table. All text via `useI18n()`.

- [ ] **Step 2: Commit**

### Task J2: Signals Page

**Files:**
- Create: `apps/admin/app/signals/page.tsx`

- [ ] **Step 1: Implement signals page**

Server component. Fetches signals, midterm, benchmarks, scheduled comms from API. Client wrapper with 4 sub-tabs + KPI row. Passes data to sub-components.

- [ ] **Step 2: Commit**

---

## Group K: Admin Pages — Renewals, Claims, Reports

**Depends on:** Groups D, G

### Task K1: Renewals Page

**Files:**
- Create: `apps/admin/components/renewals/renewal-pipeline.tsx`
- Create: `apps/admin/app/renewals/page.tsx`

- [ ] **Step 1: Implement renewal pipeline component and page**

Server component page fetches customers with renewalDays between -30 and 60. Client `renewal-pipeline.tsx` renders sorted cards with company, insurer, premium, auto comms status, days to expiry, playbook inline, churn risk bar, action buttons. All text via `useI18n()`.

- [ ] **Step 2: Commit**

### Task K2: Claims Page

**Files:**
- Create: `apps/admin/components/claims/claims-list.tsx`
- Create: `apps/admin/app/claims/page.tsx`

- [ ] **Step 1: Implement claims list component and page**

Server component page fetches customers with claimsOpen > 0. Client `claims-list.tsx` renders claim cards. All text via `useI18n()`.

- [ ] **Step 2: Commit**

### Task K3: Reports Page

**Files:**
- Create: `apps/admin/components/reports/report-grid.tsx`
- Create: `apps/admin/app/reports/page.tsx`

- [ ] **Step 1: Implement reports grid and page**

6 report cards with generate buttons that dispatch actions. All text via `useI18n()`.

- [ ] **Step 2: Commit**

---

## Group L: Layout Updates

**Depends on:** Groups D, G

### Task L1: Sidebar Extension

**Files:**
- Modify: `apps/admin/components/layout/admin-sidebar.tsx`

- [ ] **Step 1: Add new nav items**

Add Customers, Renewals, Claims, Signals, Platform, Reports to NAV_ITEMS array. Use lucide-react icons (Users, CalendarClock, FileWarning, Radio, Activity, BarChart3). Import and use `useI18n()` for labels. Add notification dots for platform (amber if degraded) and signals (teal).

- [ ] **Step 2: Commit**

### Task L2: Header Extension

**Files:**
- Modify: `apps/admin/components/layout/admin-header.tsx`
- Create: `apps/admin/components/layout/header-content.tsx`
- Create: `apps/admin/components/layout/alert-tray.tsx`

- [ ] **Step 1: Create HeaderContent client component**

Client component that replaces inline header content. Shows: platform health pill, AI Active badge, Inbound badge, alert bell with count, user info, locale toggle button, sign out. All text via `useI18n()`. Fetches alert count and service status from API on mount.

- [ ] **Step 2: Create AlertTray**

Client component. Dropdown positioned absolute from bell button. Lists all portfolio alerts sorted by severity. Each alert clickable — navigates to customer/platform/signals based on alert type. All text via `useI18n()`.

- [ ] **Step 3: Update AdminHeader**

Keep as server component for auth. Render `<HeaderContent session={session} />` passing session data to the client component.

- [ ] **Step 4: Commit**

---

## Group M: Web App Notifications

**Depends on:** Group D (notification API routes)

### Task M1: Notification Components

**Files:**
- Create: `apps/web/components/notifications/notification-bell.tsx`
- Create: `apps/web/components/notifications/notification-panel.tsx`
- Modify: `apps/web/lib/i18n/en.json` (add notifications section)
- Modify: `apps/web/lib/i18n/ar.json` (add notifications section)

- [ ] **Step 1: Create NotificationBell**

Client component. Bell icon with unread count badge. Polls `GET /api/notifications?quoteId=x` every 30 seconds. Gets quoteId from sessionStorage. Toggles NotificationPanel on click.

- [ ] **Step 2: Create NotificationPanel**

Client component. Dropdown list of notifications with title, body, relative time. Click marks as read via `PATCH /api/notifications/:id/read`. Empty state message. All text via `useI18n()`.

- [ ] **Step 3: Add translation keys**

Add `notifications` section to both `en.json` and `ar.json` with keys: title, empty, markRead, emailSent, whatsappSent, discountApplied, renewalOffer.

- [ ] **Step 4: Integrate bell into web navbar**

Add `<NotificationBell />` to the web app's navbar component, next to the locale toggle.

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/notifications/ apps/web/lib/i18n/
git commit -m "feat(web): add notification center with bell icon and panel"
```
