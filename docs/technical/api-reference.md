# API Reference

Base URL: `http://localhost:3002/api` (dev) | `https://sme-business-backend.vercel.app/api` (prod)

## Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | None | Returns `{status: "ok"}` |
| GET | `/readyz` | None | Checks DATABASE_URL, OPENAI_API_KEY, BLOB_READ_WRITE_TOKEN |

## Catalog (Public)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/catalog/business-types` | List all business types with risk levels and products |
| GET | `/catalog/business-types/:id` | Single business type |
| GET | `/catalog/products` | List insurance products |
| GET | `/catalog/insurers` | List insurers with ratings and multipliers |
| GET | `/catalog/quote-options` | All form options (employee bands, revenue, emirates, assets) |
| GET | `/catalog/quote-options/:id` | Single option category |

## Quotes (Public)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/quotes` | Create draft quote |
| GET | `/quotes/:id` | Get quote |
| PATCH | `/quotes/:id` | Update quote |
| POST | `/quotes/:id/submit` | Submit for pricing (runs pricing engine) |
| GET | `/quotes/:id/results` | Get pricing results |
| POST | `/quotes/:id/accept` | Accept quote → create policy |
| GET | `/quotes/:id/policy` | Get policy for accepted quote |

## User Auth (Public)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/user/auth/register` | Register new customer (creates entry in customers table) |
| POST | `/user/auth/login` | Login → returns `{id, email, name, apiToken}` |

## User Routes (Auth: Bearer token = customer email)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/user/policies` | List user's policies |
| GET | `/user/policies/:id` | Single policy detail |
| POST | `/user/policies` | Create policy after payment |
| GET | `/user/profile` | Get profile |
| PATCH | `/user/profile` | Update name/phone |
| GET | `/user/stats` | Dashboard stats (activePolicies, annualSpend, daysToRenewal) |

## Admin Auth (Public)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/admin/auth/login` | Admin login → returns `{id, email, name, role, apiToken}` |

## Admin Routes (Auth: Bearer token = admin email)

### Dashboard
| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/stats` | KPI stats (totalQuotes, customers, incidents, claims, etc.) |
| GET | `/admin/quotes` | Paginated quote list (filter by status) |
| PATCH | `/admin/quotes/:id` | Update quote status |
| GET | `/admin/claims` | All claims with customer info |

### Customers
| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/customers` | Paginated list (filter by stage, category, emirate, search) |
| GET | `/admin/customers/:id` | Single customer |
| POST | `/admin/customers` | Create customer |
| PATCH | `/admin/customers/:id` | Update customer |
| GET | `/admin/customers/:id/comms` | Communication sequences |
| GET | `/admin/customers/:id/signals` | External signals + midterm triggers |
| GET | `/admin/customers/:id/interactions` | Interaction history |
| GET | `/admin/customers/:id/claims` | Customer's claims |
| GET | `/admin/customers/:id/playbook` | AI playbook recommendation |
| GET | `/admin/customers/:id/platform-context` | Degraded services affecting customer |

### Incidents & Alerts
| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/incidents` | List incidents (filter by status, severity) |
| POST | `/admin/incidents` | Create incident |
| PATCH | `/admin/incidents/:id` | Update incident |
| GET | `/admin/alerts` | Portfolio alerts (sorted by severity) |
| POST | `/admin/alerts` | Create alert |
| PATCH | `/admin/alerts/:id/read` | Mark alert as read |

### Platform
| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/platform/services` | API service health |
| PATCH | `/admin/platform/services/:id` | Update service status |
| GET | `/admin/platform/services/:id/history` | Health log history |
| GET | `/admin/platform/funnel` | Conversion funnel events |
| GET | `/admin/platform/behaviour` | User behavior metrics |
| GET | `/admin/platform/correlations` | AI-detected correlations |

### Intelligence
| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/intelligence/signals` | External signals |
| POST | `/admin/intelligence/signals` | Create signal |
| PATCH | `/admin/intelligence/signals/:id` | Update signal |
| GET | `/admin/intelligence/midterm` | Midterm triggers |
| PATCH | `/admin/intelligence/midterm/:id` | Update trigger |
| GET | `/admin/intelligence/benchmarks` | Peer benchmarks |
| GET | `/admin/intelligence/scheduled-comms` | Unsent comms sequences |

### Actions
| Method | Path | Description |
|--------|------|-------------|
| POST | `/admin/actions` | Dispatch action (send_email, apply_discount, escalate, etc.) |
| GET | `/admin/actions` | List recent actions |

## Other

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/uploads` | None | Upload document (PDF/JPG/PNG, max 10MB) → Vercel Blob |
| GET | `/uploads/:id` | None | Get document metadata |
| POST | `/ai/recommend` | None | AI coverage recommendations (Claude Sonnet) |
| GET/PATCH | `/notifications` | None | List/mark-read notifications |
