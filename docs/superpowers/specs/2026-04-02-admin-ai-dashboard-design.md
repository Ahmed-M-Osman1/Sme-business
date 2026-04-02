# Shory AI Admin Dashboard — Design Spec

**Date:** 2026-04-02
**Status:** Approved
**Approach:** Domain-Layered Build (DB → API → Rules → UI, vertical slices)

## Overview

Full implementation of the Shory AI Admin Dashboard — a comprehensive admin portal for managing customers, monitoring platform health, proactive intelligence, incident management, renewals, claims, and reporting. The dashboard includes an AI co-pilot panel powered by a deterministic rule engine, a unified alert system, an action dispatch framework with customer-facing notifications, and full AR/EN internationalization.

### Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Scope | Full implementation — all features | Complete admin experience |
| Telemetry | Own tracking tables in Postgres | Self-contained, no external observability dependency |
| Actions | Action log pattern with notifications | Auditable, queue-ready for future integrations |
| AI logic | Rule-based engine (no LLM calls) | Same pattern as web AI advisor — deterministic, fast, cheap |
| i18n | AR/EN via JSON files + custom hook | Same pattern as web app — zero inline strings |
| Deployment | No changes — API bundled in web, admin calls API URL | Existing architecture supports this |

---

## 1. Database Schema

### 1.1 Core Domain Tables

#### `customers`

The central entity for the admin dashboard.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, auto-generated |
| name | text | NOT NULL |
| company | text | NOT NULL |
| email | text | UNIQUE, NOT NULL |
| emirate | text | NOT NULL, enum (existing EMIRATES) |
| category | text | NOT NULL, e.g. "Food & Beverage" |
| employees | integer | NOT NULL |
| nps | integer | nullable, 0-10 |
| stage | enum | `active`, `renewal_negotiation`, `lapsed` |
| churn_score | integer | 0-100, rule-engine computed |
| health_score | integer | 0-100, rule-engine computed |
| ltv | numeric(12,2) | lifetime value AED |
| policy_ref | text | e.g. "SHR-2024-00142" |
| last_contact | timestamp | |
| payment_status | enum | `on_time`, `overdue`, `pending` |
| claims_open | integer | default 0 |
| products | jsonb | array of held product IDs |
| missing_products | jsonb | array of gap product IDs |
| renewal_days | integer | negative = lapsed |
| insurer_id | text | FK → insurers |
| premium | numeric(10,2) | AED |
| ai_signal | text | key into playbook rules |
| revenue_opp | numeric(10,2) | |
| tags | jsonb | array of strings |
| auto_comms_status | text | human-readable status |
| created_at | timestamp | default now() |
| updated_at | timestamp | default now() |

#### `incidents`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| service_name | text | NOT NULL |
| severity | enum | `low`, `medium`, `high`, `critical` |
| status | enum | `active`, `resolved` |
| started_at | timestamp | NOT NULL |
| resolved_at | timestamp | nullable |
| description | text | NOT NULL |
| impact | text | NOT NULL |
| created_at | timestamp | default now() |

#### `portfolio_alerts`

Unified alert feed — customer, platform, and proactive signals in one stream.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| severity | enum | `low`, `medium`, `high`, `critical` |
| icon | text | emoji |
| title | text | NOT NULL |
| body | text | NOT NULL |
| time_label | text | "Now", "1h ago", etc. |
| customer_id | uuid | nullable FK → customers |
| is_platform | boolean | default false |
| is_proactive | boolean | default false |
| signal_id | text | nullable, links to external_signals or midterm_triggers |
| is_read | boolean | default false |
| created_at | timestamp | default now() |

#### `actions`

Every admin action logged for audit and notification dispatch.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| type | text | NOT NULL, e.g. "send_email", "apply_discount", "suppress_card" |
| status | enum | `queued`, `processing`, `completed`, `failed` |
| payload | jsonb | action-specific data |
| customer_id | uuid | nullable FK → customers |
| admin_user_id | uuid | FK → admin_users |
| created_at | timestamp | default now() |
| completed_at | timestamp | nullable |

#### `notifications`

Customer-facing notifications consumed by the web app.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| action_id | uuid | FK → actions |
| customer_id | uuid | FK → customers |
| quote_id | uuid | nullable FK → quotes |
| title | text | NOT NULL |
| body | text | NOT NULL |
| is_read | boolean | default false |
| created_at | timestamp | default now() |

#### `comms_sequences`

Automated comms timeline per customer (renewal and lapse sequences).

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| customer_id | uuid | FK → customers |
| type | enum | `renewal`, `lapse` |
| day_offset | integer | e.g. -14, -7, 0, 1, 3 |
| channel | enum | `email`, `whatsapp` |
| label | text | NOT NULL |
| is_sent | boolean | default false |
| sent_at | timestamp | nullable |
| created_at | timestamp | default now() |

### 1.2 Telemetry Tables

#### `api_services`

Service registry with current health status.

| Column | Type | Notes |
|--------|------|-------|
| id | text | PK, e.g. "quote", "payment" |
| name | text | NOT NULL |
| category | enum | `core`, `ai`, `infra`, `insurer` |
| status | enum | `operational`, `degraded`, `down` |
| uptime | numeric(5,2) | percentage |
| latency | integer | ms |
| p99 | integer | ms |
| error_rate | numeric(5,2) | percentage |
| requests_24h | integer | |
| updated_at | timestamp | default now() |

#### `service_health_logs`

Time-series health data for sparklines and trend analysis.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| service_id | text | FK → api_services |
| latency | integer | ms |
| error_rate | numeric(5,2) | |
| requests | integer | |
| recorded_at | timestamp | NOT NULL |

#### `funnel_events`

Quote-to-bind funnel tracking — periodic snapshots.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| step | text | NOT NULL, e.g. "Landing / Home", "Start Quote" |
| sessions | integer | NOT NULL |
| drop_pct | numeric(5,1) | |
| trend | numeric(5,1) | vs yesterday |
| is_anomaly | boolean | default false |
| recorded_at | timestamp | NOT NULL |

#### `behaviour_metrics`

Aggregated behaviour KPIs — periodic snapshots.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| label | text | NOT NULL |
| value | text | NOT NULL, e.g. "47", "41.8%" |
| trend | numeric(6,1) | percentage change |
| is_good | boolean | |
| icon | text | emoji |
| sub_label | text | e.g. "right now", "vs yesterday" |
| recorded_at | timestamp | NOT NULL |

### 1.3 Intelligence Tables

#### `external_signals`

Weather, cyber, regulatory, market signals that affect customer segments.

| Column | Type | Notes |
|--------|------|-------|
| id | text | PK |
| category | enum | `weather`, `cyber`, `regulatory`, `market` |
| severity | enum | `low`, `medium`, `high` |
| icon | text | emoji |
| title | text | NOT NULL |
| source | text | NOT NULL |
| detail | text | NOT NULL |
| affected_categories | jsonb | array of strings |
| recommended_product | text | |
| recommended_enhancement | text | |
| customer_comms_angle | text | draft message |
| affected_customers | jsonb | array of customer IDs |
| comms_readiness | text | |
| revenue_impact | numeric(10,2) | |
| urgency | enum | `low`, `medium`, `high` |
| created_at | timestamp | default now() |

#### `midterm_triggers`

Mid-policy behaviour triggers that fire independently of the renewal cycle.

| Column | Type | Notes |
|--------|------|-------|
| id | text | PK |
| customer_id | uuid | FK → customers |
| type | enum | `business_growth`, `digital_engagement`, `claims_event`, `industry_event` |
| icon | text | emoji |
| title | text | NOT NULL |
| trigger_description | text | NOT NULL |
| detail | text | NOT NULL |
| recommended_action | text | |
| customer_comms | text | draft message |
| revenue_impact | numeric(10,2) | |
| timing | text | |
| status | enum | `pending_send`, `awaiting`, `scheduled`, `sent` |
| created_at | timestamp | default now() |

#### `peer_benchmarks`

Segment comparison data for social-proof proactive comms.

| Column | Type | Notes |
|--------|------|-------|
| id | text | PK |
| category | text | NOT NULL |
| employee_band | text | NOT NULL |
| headline | text | NOT NULL |
| data | jsonb | array of {product, pct, mandatory} |
| trending_product | text | |
| trend_detail | text | |
| relevant_customers | jsonb | array of customer IDs |
| created_at | timestamp | default now() |

#### `platform_correlations`

Rule-engine generated correlations between API issues and user behaviour.

| Column | Type | Notes |
|--------|------|-------|
| id | text | PK |
| severity | enum | `low`, `medium`, `high` |
| headline | text | NOT NULL |
| detail | text | NOT NULL |
| action | text | recommended action |
| action_label | text | button text |
| services | jsonb | array of service IDs |
| metrics | jsonb | array of metric names |
| is_active | boolean | default true |
| created_at | timestamp | default now() |

---

## 2. API Layer

All new routes live under `/api/admin/` (Bearer token auth) except notifications which are public.

### 2.1 Customer Routes — `/api/admin/customers`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | List customers (paginated, filterable by stage, category, emirate, search) |
| GET | `/:id` | Full customer detail with related data |
| POST | `/` | Create customer |
| PATCH | `/:id` | Update customer fields |
| GET | `/:id/comms` | Get comms sequence for customer |
| GET | `/:id/history` | Get interaction history |
| GET | `/:id/signals` | Get external signals + midterm triggers affecting this customer |
| GET | `/:id/platform-context` | Get platform issues affecting this customer |

### 2.2 Incident Routes — `/api/admin/incidents`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | List incidents (filterable by status, severity) |
| POST | `/` | Create incident |
| PATCH | `/:id` | Update incident (status, resolved_at, description) |

### 2.3 Alert Routes — `/api/admin/alerts`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | List alerts (sorted by severity, filterable) |
| POST | `/` | Create alert |
| PATCH | `/:id/read` | Mark alert as read |

### 2.4 Action Routes — `/api/admin/actions`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/` | Dispatch action (creates action + notification) |
| GET | `/` | List recent actions |

Action dispatch flow:
1. Insert into `actions` table with `status: 'queued'`
2. Rule engine processes — creates a `notification` for the customer
3. Mark action as `completed`

### 2.5 Platform Health Routes — `/api/admin/platform`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/services` | List all API services with current health |
| PATCH | `/services/:id` | Update service metrics/status |
| GET | `/services/:id/history` | Health logs time-series for sparklines |
| GET | `/funnel` | Current funnel data |
| GET | `/behaviour` | Current behaviour metrics |
| GET | `/correlations` | Active AI correlations |

### 2.6 Intelligence Routes — `/api/admin/intelligence`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/signals` | External signals list |
| POST | `/signals` | Create signal |
| PATCH | `/signals/:id` | Update signal (approve, send) |
| GET | `/midterm` | Mid-term triggers list |
| PATCH | `/midterm/:id` | Update trigger status |
| GET | `/benchmarks` | Peer benchmarks |
| GET | `/scheduled-comms` | Queued proactive comms |

### 2.7 Admin Stats — `/api/admin/stats` (extended)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | Extended dashboard stats (existing quote stats + new KPIs) |

### 2.8 Notification Routes — `/api/notifications` (public, no auth)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/?quoteId=x` | Get notifications for a quote |
| PATCH | `/:id/read` | Mark notification as read |

---

## 3. Rule Engine

Located in `packages/api/src/rules/`. Pure deterministic functions — no AI/LLM calls. Same pattern as the web app's keyword-matching AI advisor.

### 3.1 AI Playbook Rules — `playbooks.ts`

Determines which playbook applies to a customer based on their data:

```
IF renewalDays > 0 AND renewalDays <= 60 AND churnScore < 30 AND nps >= 8
  -> renewal_high_confidence

IF renewalDays <= 7 AND churnScore >= 50
  -> churn_high_risk

IF stage === 'active' AND missingProducts.length > 0 AND renewalDays > 60
  -> upsell_opportunity

IF stage === 'lapsed' AND renewalDays < -30
  -> compliance_critical
```

Each playbook returns: `badge`, `headline(customer)`, `body(customer)`, `actions[]`, `inboundGuide`. All templated strings with customer data interpolation.

### 3.2 Platform Correlation Rules — `correlations.ts`

Runs on platform health updates. Scans for co-occurring degradation:

```
IF service.error_rate > threshold AND funnel_step.anomaly === true
  AND service affects that funnel step (mapping)
  -> Create/update platform_correlation record
```

Correlation mappings (hardcoded):

| Service | Affects Funnel Step |
|---------|-------------------|
| payment | Checkout, Payment |
| orient, gig, rsa, sukoon, noor | Insurer Comparison |
| ocr | Business Details |
| quote | Start Quote, Product Selection |
| auth | All steps |

Severity calculation:
- `high`: error_rate > 3% AND funnel trend > +20%
- `medium`: error_rate > 1% AND funnel trend > +10%
- `low`: error_rate > 0.5% AND funnel trend > +5%

### 3.3 Churn & Health Scoring — `scoring.ts`

Recalculated on customer update or periodic sweep.

**Churn Score (0-100):**
```
base = 0
+ 30 if renewalDays <= 7
+ 20 if claimsOpen > 0
+ 15 if paymentStatus === 'overdue'
+ 15 if nps !== null AND nps <= 6
+ 10 if lastContact > 30 days ago
+ 10 if stage === 'lapsed'
cap at 100
```

**Health Score (0-100):**
```
base = 100
- 25 if churnScore >= 70
- 15 if claimsOpen > 0
- 15 if paymentStatus === 'overdue'
- 10 if nps !== null AND nps <= 6
- 10 if renewalDays < 0
- 10 if lastContact > 30 days ago
floor at 0
```

### 3.4 Customer-Platform Context — `customer-platform.ts`

Cross-references degraded services with customer data:

```
FOR each customer:
  IF customer.insurer matches a degraded insurer API
    -> flag: true, severity based on error_rate
  IF 'payment' service degraded AND customer has pending payment
    -> flag: true, severity: high
  ELSE
    -> flag: false
```

### 3.5 Alert Generation — `alerts.ts`

Auto-generates portfolio alerts from current state:

```
FOR each active incident with severity >= high -> create alert
FOR each customer with churnScore >= 60 AND renewalDays <= 7 -> create alert
FOR each customer with stage === 'lapsed' AND comms exhausted -> create alert
FOR each external_signal with urgency >= medium -> create alert
FOR each degraded service -> create alert
FOR each midterm_trigger with status === 'pending_send' -> create alert
```

### 3.6 Action -> Notification — `notifications.ts`

When an action is dispatched, generates the customer-facing notification:

```
action.type === 'send_email'
  -> notification title/body from i18n key with interpolation

action.type === 'send_whatsapp'
  -> notification title/body from i18n key

action.type === 'apply_discount'
  -> notification title/body with discount percentage

action.type === 'send_retention_email'
  -> notification title/body for renewal offer
```

---

## 4. Admin UI

### 4.1 Navigation

Extend existing sidebar with new items:

| Nav Item | Route | Icon |
|----------|-------|------|
| Dashboard | `/` | LayoutDashboard (existing) |
| Customers | `/customers` | Users |
| Renewals | `/renewals` | CalendarClock |
| Claims | `/claims` | FileWarning |
| Signals | `/signals` | Radio |
| Platform | `/platform` | Activity |
| Quotes | `/quotes` | FileText (existing) |
| Reports | `/reports` | BarChart3 |

Extend existing header with:
- Platform health pill (green/amber, links to `/platform`)
- AI Active badge (indigo pill)
- Inbound badge (green pill)
- Alert bell with count badge, opens AlertTray dropdown

### 4.2 Pages

#### `/customers` — Customer Management (3-column layout)

- **Left (260px):** `CustomerList` — search bar, customer cards with playbook badge, platform status dot, renewal countdown
- **Center (flex):** `CustomerProfile` — tabbed (overview, policies, comms, claims, history)
  - Overview: active coverage, gaps, snapshot, AI risk analysis, revenue opportunity
  - Policies: policy cards with view/endorse actions
  - Comms: automated sequence timeline with sent/pending status
  - Claims: claim cards with AI churn impact insight
  - History: interaction timeline (inbound, auto emails, agent notes)
- **Right (300px):** `AIPanel` — AI co-pilot with:
  - Playbook recommendation card (NBA with action buttons)
  - Proactive signals mini (collapsible)
  - Platform health mini (collapsible)
  - Inbound handler guide (collapsible)
  - Customer risk signals (churn bar, health bar, NPS, payment, claims, last contact)
  - Revenue opportunity card

Customer selection via URL search params (`/customers?id=xxx`).

#### `/renewals` — Renewal Pipeline

Customers with renewalDays between -30 and 60, sorted by urgency (churnScore + premium weight). Each card: company, insurer, premium, auto comms status, days to expiry, playbook recommendation, churn risk bar, action buttons.

#### `/claims` — Claims View

Customers with claimsOpen > 0. Claim cards with reference, type, status badge, reserve amount, AI churn impact insight.

#### `/signals` — Proactive Intelligence (4 sub-tabs)

- **External Signals:** Signal cards with severity, category, draft message, affected customers, approve/send flow
- **Mid-Term Intelligence:** Trigger cards with customer link, revenue opportunity, send advisory flow
- **Peer Benchmarks:** Adoption bar charts per segment, trending product highlight, send peer insight
- **Scheduled Comms:** Queue table with status badges and revenue projections

KPI row: active signals, pending triggers, revenue pipeline, comms awaiting approval.

#### `/platform` — Platform Health (5 sub-tabs)

- **Overview:** Active incident banner, 4 KPI cards, AI correlations summary
- **API Health:** Service grid by category (Core, AI, Infra, Insurer) with latency, p99, error rate, uptime, sparklines
- **User Behaviour:** 8 metric cards, funnel visualization with anomaly detection, session volume bar chart
- **AI Correlations:** Correlation cards with affected services/metrics, recommended action, action buttons
- **Incidents:** KPI row (active, resolved 7d, avg resolution), incident cards with update/notify/resolve actions

#### `/reports` — Reports Grid

6 report cards (Renewal Retention, Sequence Performance, Upsell Conversion, Signal Conversion, Benchmark Engagement, Mid-Term Revenue) each with AI Generate button.

### 4.3 Component Tree

```
apps/admin/components/
├── layout/
│   ├── admin-sidebar.tsx           (extend existing)
│   ├── admin-header.tsx            (extend existing)
│   └── alert-tray.tsx              (new)
├── customers/
│   ├── customer-list.tsx
│   ├── customer-profile.tsx
│   └── ai-panel/
│       ├── index.tsx
│       ├── ai-playbook-card.tsx
│       ├── proactive-signals-mini.tsx
│       ├── platform-health-mini.tsx
│       ├── inbound-guide.tsx
│       └── risk-signals.tsx
├── platform/
│   ├── platform-overview.tsx
│   ├── api-health-grid.tsx
│   ├── user-behaviour.tsx
│   ├── funnel-chart.tsx
│   ├── session-volume.tsx
│   ├── correlation-cards.tsx
│   └── incident-cards.tsx
├── signals/
│   ├── external-signals.tsx
│   ├── midterm-triggers.tsx
│   ├── peer-benchmarks.tsx
│   └── scheduled-comms.tsx
├── renewals/
│   └── renewal-pipeline.tsx
├── claims/
│   └── claims-list.tsx
├── shared/
│   ├── status-dot.tsx
│   ├── risk-bar.tsx
│   ├── ai-badge.tsx
│   ├── tag.tsx
│   ├── sparkline.tsx
│   └── kpi-card.tsx
└── reports/
    └── report-grid.tsx
```

### 4.4 Client vs Server Components

**Server Components** (default): All `page.tsx` files — fetch data from API.

**Client Components** (`'use client'`):
- `customer-list.tsx` — search state, selection
- `ai-panel/` — loading state, collapsibles, action triggers
- `alert-tray.tsx` — open/close, click handlers
- All platform sub-tab components — tab state, live tick for simulated latency
- All signals sub-tab components — approve/send state
- `sparkline.tsx` — SVG rendering
- `funnel-chart.tsx`, `session-volume.tsx` — interactive charts

### 4.5 Data Flow

```
Page (server) -> fetch from API via api-client.ts
  -> Pass data as props to client components
  -> Client components manage UI state (tabs, selections, collapsibles)
  -> Actions trigger POST to /api/admin/actions via api-client.ts
  -> Toast confirmation shown
  -> Optimistic UI update or revalidation
```

---

## 5. Internationalization (i18n)

### 5.1 Admin App i18n

Same pattern as web app — custom React Context + useI18n hook.

**Files:**
```
apps/admin/lib/i18n/
├── index.tsx      (I18nProvider + useI18n hook)
├── en.json        (all admin UI strings)
└── ar.json        (Arabic translations)
```

**Translation key structure** (organized by feature):
```json
{
  "nav": { "customers", "renewals", "claims", "signals", "platform", "reports" },
  "header": { "allSystemsOk", "apisDegraded", "aiActive", "inbound" },
  "customers": { "search", "overview", "policies", "comms", "claims", "history", ... },
  "aiPanel": { "coPilot", "inboundReady", "inboundGuide", "churnProbability", ... },
  "playbooks": { "renewalOpportunity", "churnRiskHigh", "revenueOpportunity", ... },
  "platform": { "overview", "apiHealth", "userBehaviour", "aiCorrelations", ... },
  "signals": { "externalSignals", "midTermIntelligence", "peerBenchmarks", ... },
  "actions": { "sendEmail", "sendWhatsApp", "editMessage", "escalate", ... },
  "common": { "active", "resolved", "pending", "high", "medium", "low", "currency" }
}
```

**Rules:**
- Zero inline strings in components — all text via `t.section.key`
- RTL support using `ms-`/`me-` utilities and `rtl:` Tailwind prefix
- Locale stored in localStorage (`shory-admin-locale`)
- Toggle button in header
- Dynamic `dir` attribute on `<html>` element

### 5.2 Web App Notification Center

New components in `apps/web/`:

- `components/notifications/notification-bell.tsx` — bell icon in navbar, unread count badge, opens dropdown
- `components/notifications/notification-panel.tsx` — notification list with title, body, timestamp, mark-as-read

Polls `GET /api/notifications?quoteId=x` every 30 seconds. Gets quoteId from sessionStorage.

New translation keys added to `apps/web/lib/i18n/en.json` and `ar.json`:
```json
{
  "notifications": {
    "title": "Notifications",
    "empty": "No notifications",
    "markRead": "Mark as read",
    "emailSent": "An email has been sent to {email}",
    "whatsappSent": "A message has been sent to your WhatsApp",
    "discountApplied": "A {discount}% loyalty discount has been applied",
    "renewalOffer": "Your personalised renewal offer is ready"
  }
}
```

### 5.3 Notification Data Flow

```
Admin clicks action -> POST /api/admin/actions
  -> Insert action (status: queued)
  -> Rule engine creates notification (title, body, customerId, quoteId)
  -> Insert notification
  -> Mark action completed
  -> Admin sees toast

Web app polls GET /api/notifications?quoteId=abc
  -> Bell shows unread count
  -> Customer opens notification
  -> PATCH /api/notifications/:id/read
```

---

## 6. Seed Data

All tables seeded with data from the prototype JSX file:

- 5 customers (Mohammed Al-Rashidi, Dr. Ahmed Khalil, Sarah Al-Mansouri, Yusuf Al-Mansoori, Layla Hassan)
- 12 API services (Quote Engine, Policy Issuance, Auth, Payment Gateway, OCR, Claude, DB, Orient, GIG, RSA, Sukoon, Noor Takaful)
- 2 incidents (Payment Gateway active, Orient API resolved)
- 8 portfolio alerts
- 5 external signals (weather, cyber, regulatory, market, heatwave)
- 4 midterm triggers
- 4 peer benchmarks
- 3 platform correlations
- 8 behaviour metrics
- 8 funnel steps
- Comms sequences for each customer (renewal and lapse)

---

## 7. Shared Types (Zod Schemas)

New schemas added to `packages/shared/`:

- `customerSchema` — create/update validation
- `incidentSchema` — create/update validation
- `alertSchema` — create validation
- `actionSchema` — dispatch validation (type, payload, customerId)
- `serviceHealthSchema` — service update validation
- `signalSchema` — external signal validation
- `midtermTriggerSchema` — trigger validation
- `notificationSchema` — notification response type

New enums:
- `customerStageEnum` — active, renewal_negotiation, lapsed
- `paymentStatusEnum` — on_time, overdue, pending
- `incidentSeverityEnum` — low, medium, high, critical
- `incidentStatusEnum` — active, resolved
- `actionStatusEnum` — queued, processing, completed, failed
- `serviceCategoryEnum` — core, ai, infra, insurer
- `serviceStatusEnum` — operational, degraded, down
- `signalCategoryEnum` — weather, cyber, regulatory, market
- `triggerTypeEnum` — business_growth, digital_engagement, claims_event, industry_event
- `triggerStatusEnum` — pending_send, awaiting, scheduled, sent
- `commsTypeEnum` — renewal, lapse
- `commsChannelEnum` — email, whatsapp
