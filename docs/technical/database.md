# Database Schema

## Overview

PostgreSQL (Neon serverless) with Drizzle ORM. 27 tables organized into 6 domains.

## Schema Location

All schema files: `packages/db/src/schema/*.ts`

## Domains

### 1. Quote & Policy Lifecycle

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `quotes` | Insurance quote requests | businessName, emirate, industry, employeesCount, coverageType, status (draft→submitted→quoted→accepted→expired→rejected) |
| `quote_results` | Insurer pricing per quote | quoteId, providerName, annualPremium, monthlyPremium, coverageAmount, deductible |
| `policies` | Issued policies | quoteId, resultId, userId→customers, policyNumber, status (active/cancelled/expired), startDate, endDate, products |
| `documents` | Uploaded files (trade licenses) | quoteId, fileName, fileType, blobUrl |
| `ai_recommendations` | AI coverage suggestions | quoteId, inputContext, recommendations, modelUsed |

### 2. Customers & CRM

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `customers` | Unified customer table (web users + admin CRM) | name, email, passwordHash, company, emirate, category, employees, churnScore, healthScore, ltv, products, missingProducts, renewalDays, premium, aiSignal |
| `claims` | Insurance claims | claimRef, customerId, type, status (open/under_review/settled/denied), reserve, description, handlerName |
| `customer_interactions` | Communication log | customerId, type (inbound_whatsapp/call/email, outbound, auto, note), note, agentName |
| `comms_sequences` | Automated communication sequences | customerId, type (renewal/lapse), dayOffset, channel (email/whatsapp), isSent |

### 3. Admin & Auth

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `admin_users` | Admin portal users | email, name, passwordHash, role (admin/viewer) |
| `actions` | Admin action log | type, status, payload, customerId, adminUserId |
| `notifications` | Customer notifications | actionId, customerId, title, body, isRead |

### 4. Platform Monitoring

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `api_services` | API health tracking | name, category (core/ai/infra/insurer), status (operational/degraded/down), uptime, latency, errorRate |
| `service_health_logs` | Historical health metrics | serviceId, latency, errorRate, requests, recordedAt |
| `incidents` | Platform incidents | serviceName, severity, status, description, impact |
| `portfolio_alerts` | Dashboard alerts | severity, title, body, customerId, isPlatform, isProactive |

### 5. Intelligence

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `external_signals` | Market/weather/regulatory signals | category (weather/cyber/regulatory/market), severity, affectedCustomers, revenueImpact |
| `midterm_triggers` | Customer engagement triggers | customerId, type (business_growth/digital_engagement/claims_event/industry_event), revenueImpact |
| `peer_benchmarks` | Industry benchmarking | category, employeeBand, data (product adoption %s) |
| `platform_correlations` | AI-detected metric correlations | severity, headline, services, metrics |
| `funnel_events` | Conversion funnel data | step, sessions, dropPct, trend |
| `behaviour_metrics` | User behavior analytics | label, value, trend, isGood |

### 6. Catalog (Reference Data)

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `business_types` | Business categories | title, riskLevel, riskFactor, products |
| `products` | Insurance products | name, shortName, icon, basePrice |
| `insurers` | Insurance providers | name, logo, rating, shariahCompliant, priceMultiplier |
| `quote_options` | Form configuration | category, items (employee bands, revenue bands, emirates, assets) |

## Key Relationships

```
customers ──┬── claims
             ├── policies (via userId)
             ├── customer_interactions
             ├── comms_sequences
             ├── midterm_triggers
             └── notifications

quotes ──┬── quote_results
          ├── policies
          ├── documents
          └── ai_recommendations

admin_users ── actions ── notifications
```

## Commands

```bash
# Push schema changes
source .env && export DATABASE_URL && pnpm --filter @shory/db db:push

# Generate migration
source .env && export DATABASE_URL && pnpm --filter @shory/db db:generate

# Run migrations
source .env && export DATABASE_URL && pnpm --filter @shory/db db:migrate

# Seed data
source .env && export DATABASE_URL && pnpm --filter @shory/db db:seed

# Open Drizzle Studio
source .env && export DATABASE_URL && pnpm --filter @shory/db db:studio
```
