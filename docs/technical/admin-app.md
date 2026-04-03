# Admin App (`apps/admin`)

Internal operations dashboard for Shory's team.

## Sections

| Section | Route | Purpose |
|---------|-------|---------|
| Dashboard | `/` | KPIs, alerts, customers needing attention, service status |
| Customers | `/customers` | 3-panel layout: list → profile → AI panel. Tabs: Overview, Policies, Comms, Claims, History |
| Renewals | `/renewals` | Pipeline sorted by urgency (churn score + premium). AI playbooks per customer |
| Claims | `/claims` | Real claims from DB with status badges, handler, reserve, AI churn insight |
| Signals | `/signals` | 4 tabs: External Signals, Midterm Triggers, Peer Benchmarks, Scheduled Comms |
| Platform | `/platform` | 5 tabs: Overview, API Health, User Behaviour, AI Correlations, Incidents |
| Quotes | `/quotes` | Quote list table with status management |
| Reports | `/reports` | 6 report types with generate + success/failure feedback |

## Authentication

- Auth.js with credentials provider
- Login against `admin_users` table (SHA-256 hashed passwords)
- Bearer token = admin email (MVP)
- All API calls include `Authorization: Bearer {email}` header

**Default credentials:**
- `admin@shory.ae` / `admin123`
- `osman@shory.com` / `osman@shory.com`

## Key Components

### Customer 3-Panel Layout
- **Left:** Customer list with search, playbook badges, renewal indicators
- **Center:** Customer profile with 5 tabs (Overview, Policies, Comms, Claims, History)
- **Right:** AI panel with playbook card, proactive signals, platform health, risk signals

### AI Playbooks (`apps/backend/src/rules/playbooks.ts`)
4 playbook types generated from customer data:
1. **Renewal High Confidence** — low churn, high NPS, near renewal
2. **Churn High Risk** — high churn score, near renewal, open claims
3. **Upsell Opportunity** — active, has missing products
4. **Compliance Critical** — lapsed policy, legal exposure

### Platform Health
- 12 API services monitored (core, AI, infra, insurer)
- Funnel events (8 stages from Landing to Policy Issued)
- AI correlation engine detecting platform-behavior links
- Incident management with resolve action

## Data Flow

All data fetched from backend API via `lib/api-client.ts`:
```
adminApi.stats(token)           → Dashboard KPIs
adminApi.customers.list(token)  → Customer list
adminApi.customers.get(token, id) → Customer detail
adminApi.customers.getPlaybook(token, id) → AI playbook
adminApi.claims.list(token)     → Claims with customer info
adminApi.platform.services(token) → API health grid
```
