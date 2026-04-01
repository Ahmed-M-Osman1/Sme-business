# Shory SME — System Architecture Design

## Overview

Full system architecture for the Shory SME insurance platform. MVP-scale, API-first approach with two Next.js frontends and a standalone Hono API service, all in a pnpm monorepo deployed to Vercel.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Architecture | API-first (separate API service) | Enables future mobile/partner integrations |
| API framework | Hono on Vercel Functions | Lightweight, TypeScript-native, OpenAPI support |
| Pricing | Hybrid (rules engine + adapter for real APIs later) | MVP pricing via rules, swap in real insurers later |
| AI advisor | Real Claude API integration | Analyze business context, recommend coverage |
| Payments | Mock (no real payments at MVP) | Checkout UI exists but just marks quote as accepted |
| File storage | Vercel Blob | Simple, Vercel-native, sufficient for MVP |
| Database | PostgreSQL via Neon | Serverless Postgres, Vercel-native |
| Admin scope | Quote management (view + status changes) | View all quotes, approve/reject/expire |
| Auth | Auth.js (admin only) | Web app quote journey is anonymous |

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Vercel                           │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  apps/web    │  │  apps/admin  │  │  packages/api │  │
│  │  (Next.js)   │  │  (Next.js)   │  │  (Hono)      │  │
│  │  Port 3000   │  │  Port 3001   │  │  Port 3002   │  │
│  │              │  │              │  │              │  │
│  │  Quote UI    │  │  Dashboard   │  │  REST API    │  │
│  │  Landing     │  │  Quote Mgmt  │  │  Pricing Eng │  │
│  │  Checkout    │  │  Auth        │  │  AI Advisor  │  │
│  └──────┬───────┘  └──────┬───────┘  │  File Upload │  │
│         │                 │          └──────┬───────┘  │
│         └────────┬────────┘                 │          │
│                  │         ┌────────────────┘          │
│                  ▼         ▼                           │
│         ┌─────────────────────┐                        │
│         │   @shory/shared     │                        │
│         │   (Zod schemas,     │                        │
│         │    types, constants)│                        │
│         └─────────────────────┘                        │
└─────────────────────────────────────────────────────────┘
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │PostgreSQL│ │  Claude  │ │  Vercel  │
        │ (Neon)   │ │   API    │ │   Blob   │
        └──────────┘ └──────────┘ └──────────┘
```

**Data flow:**
- Both Next.js apps call the Hono API via typed fetch wrappers
- The API is the only layer that touches the database, Claude API, and Vercel Blob
- `@shory/shared` provides Zod schemas and TypeScript types used by all three services
- `@shory/db` provides Drizzle schema and client, consumed only by `packages/api`

## API Design (packages/api)

### Endpoints

#### Quote Journey (no auth required)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/quotes` | Create a new quote (draft) |
| `GET` | `/api/quotes/:id` | Get quote by ID |
| `PATCH` | `/api/quotes/:id` | Update quote details |
| `POST` | `/api/quotes/:id/submit` | Submit quote for pricing |
| `GET` | `/api/quotes/:id/results` | Get pricing results |
| `POST` | `/api/quotes/:id/accept` | Accept a quote (mock checkout) |
| `GET` | `/api/quotes/:id/policy` | Get generated policy |

#### AI Advisor (no auth required)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/ai/recommend` | Analyze business context, recommend coverage. Body includes `quote_id` to link recommendations to the quote |

#### File Uploads (no auth required)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/uploads` | Upload document to Vercel Blob |
| `GET` | `/api/uploads/:id` | Get upload metadata/URL |

#### Admin (requires auth token)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/quotes` | List all quotes (filterable, paginated) |
| `PATCH` | `/api/admin/quotes/:id` | Update quote status (approve/reject/expire) |
| `GET` | `/api/admin/stats` | Basic dashboard stats |

### Request/Response Flow (Quote Journey)

```
1. User starts          → POST /api/quotes                → { id: "uuid" }
2. Business type        → PATCH /api/quotes/:id            → { ...updated quote }
3. Company details      → PATCH /api/quotes/:id            → { ...updated quote }
4. Upload docs          → POST /api/uploads                → { id, blob_url }
5. AI advisor           → POST /api/ai/recommend           → { recommendations[] }
6. Submit for pricing   → POST /api/quotes/:id/submit      → { status: "quoted" }
7. View results         → GET /api/quotes/:id/results      → { results[] }
8. Accept quote         → POST /api/quotes/:id/accept      → { policy }
9. Confirmation         → GET /api/quotes/:id/policy       → { policy details }
```

### Authentication Strategy

- **Web app requests:** No auth. Quotes are identified by UUID. No user accounts needed for the anonymous quote journey.
- **Admin app requests:** Auth.js session token passed as `Authorization: Bearer <token>`. Hono middleware on `/api/admin/*` routes validates the token against the Auth.js session store.

### Pricing Engine (Adapter Pattern)

```typescript
// packages/api/src/pricing/types.ts
interface PricingProvider {
  id: string;
  name: string;
  getQuote(input: QuoteInput): Promise<PricingResult>;
}

// packages/api/src/pricing/providers/mock.ts
// MVP: calculates prices based on rules (industry risk, employee count, coverage type)
class MockInsurerProvider implements PricingProvider { ... }

// packages/api/src/pricing/engine.ts
// Runs all registered providers in parallel, aggregates results
async function calculateQuotes(input: QuoteInput, providers: PricingProvider[]): Promise<PricingResult[]>
```

**MVP mock pricing factors:**
- Base premium by coverage type
- Industry risk multiplier (e.g., construction 1.5x, tech 0.8x)
- Employee count scaling
- Emirate adjustment factor
- 3 mock insurers with different pricing profiles

**Future:** Swap `MockInsurerProvider` for real insurer API providers (e.g., `AmanProvider`, `OrientProvider`) without changing the quote flow.

### AI Advisor (Claude Integration)

```typescript
// packages/api/src/ai/advisor.ts
async function getRecommendations(context: {
  industry: string;
  business_type: string;
  employees_count: number;
  emirate: string;
  coverage_type?: string;
}): Promise<Recommendation[]>
```

- Calls Claude API with structured business context
- Returns recommended coverage types, amounts, and reasoning
- Stores recommendation in `ai_recommendations` table for audit trail
- Model: Claude Sonnet 4.6 (fast, cost-effective for structured recommendations)

## Database Schema

### Entity Relationship

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│     quotes      │────▶│  quote_results    │────▶│    policies     │
│                 │     │                   │     │                 │
│ id (PK, uuid)   │     │ id (PK, uuid)     │     │ id (PK, uuid)   │
│ business_name   │     │ quote_id (FK)     │     │ quote_id (FK)   │
│ trade_license   │     │ provider_id       │     │ result_id (FK)  │
│ emirate         │     │ provider_name     │     │ policy_number   │
│ industry        │     │ monthly_premium   │     │ status          │
│ business_type   │     │ annual_premium    │     │ start_date      │
│ employees_count │     │ coverage_amount   │     │ end_date        │
│ coverage_type   │     │ deductible        │     │ created_at      │
│ status          │     │ benefits (jsonb)  │     │ updated_at      │
│ created_at      │     │ created_at        │     └─────────────────┘
│ updated_at      │     └──────────────────┘
└────────┬────────┘
         │
         │     ┌──────────────────┐     ┌─────────────────┐
         ├────▶│    documents     │     │   admin_users    │
         │     │                  │     │                  │
         │     │ id (PK, uuid)    │     │ id (PK, uuid)    │
         │     │ quote_id (FK)    │     │ email (unique)   │
         │     │ file_name        │     │ name             │
         │     │ file_type        │     │ role (enum)      │
         │     │ blob_url         │     │ password_hash    │
         │     │ created_at       │     │ created_at       │
         │     └──────────────────┘     │ updated_at       │
         │                              └─────────────────┘
         │     ┌───────────────────────┐
         └────▶│  ai_recommendations   │
               │                       │
               │ id (PK, uuid)          │
               │ quote_id (FK)          │
               │ input_context (jsonb)  │
               │ recommendations (jsonb)│
               │ model_used             │
               │ created_at             │
               └───────────────────────┘
```

### Status Enums

- **quote_status:** `draft` → `submitted` → `quoted` → `accepted` | `expired` | `rejected`
- **policy_status:** `active` → `cancelled` | `expired`
- **admin_role:** `admin` | `viewer`

### Relationships

- A **quote** has many **quote_results** (one per insurance provider that returns a price)
- A **quote** has one **policy** (created when user accepts a specific result)
- A **quote** has many **documents** (uploaded files linked via Vercel Blob URLs)
- A **quote** has many **ai_recommendations** (each AI advisor interaction is stored)
- **admin_users** are independent — no FK to quotes (admin actions are tracked via quote status changes)

## Monorepo Structure (Updated)

```
shory-sme/
├── apps/
│   ├── web/                    # Customer-facing (Vercel project: shory-web)
│   │   ├── app/
│   │   │   ├── page.tsx        # Landing page
│   │   │   └── quote/          # Multi-step quote journey
│   │   ├── components/
│   │   │   ├── layout/         # Navbar, Footer
│   │   │   ├── landing/        # Hero, Stats, CTA
│   │   │   └── quote/          # Step components
│   │   └── lib/
│   │       └── api-client.ts   # Typed fetch wrapper for API
│   │
│   └── admin/                  # Internal portal (Vercel project: shory-admin)
│       ├── app/
│       │   ├── page.tsx        # Dashboard overview (stats, recent quotes)
│       │   ├── quotes/
│       │   │   ├── page.tsx    # Quote list (table, filters, search)
│       │   │   └── [id]/
│       │   │       └── page.tsx # Quote detail (full info, status actions)
│       │   └── login/
│       │       └── page.tsx    # Auth.js login page
│       ├── components/
│       │   ├── layout/         # Admin sidebar, header, breadcrumbs
│       │   └── quotes/         # Quote table, filters, status badges
│       └── lib/
│           └── api-client.ts   # Typed fetch wrapper (with auth headers)
│
├── packages/
│   ├── api/                    # Hono API service (Vercel project: shory-api)
│   │   ├── src/
│   │   │   ├── index.ts        # Hono app entrypoint + Vercel adapter
│   │   │   ├── routes/
│   │   │   │   ├── quotes.ts   # /api/quotes/* handlers
│   │   │   │   ├── admin.ts    # /api/admin/* handlers
│   │   │   │   ├── uploads.ts  # /api/uploads handlers
│   │   │   │   └── ai.ts       # /api/ai/* handlers
│   │   │   ├── pricing/
│   │   │   │   ├── engine.ts   # Runs providers, aggregates results
│   │   │   │   ├── types.ts    # PricingProvider interface
│   │   │   │   └── providers/
│   │   │   │       └── mock.ts # MVP mock insurer (3 profiles)
│   │   │   ├── ai/
│   │   │   │   └── advisor.ts  # Claude API integration
│   │   │   └── middleware/
│   │   │       ├── auth.ts     # Admin auth validation
│   │   │       └── cors.ts     # CORS for cross-origin requests
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── db/                     # Drizzle ORM + migrations
│   │   └── src/schema/
│   │       ├── quotes.ts       # quotes table
│   │       ├── quote-results.ts # quote_results table
│   │       ├── policies.ts     # policies table
│   │       ├── documents.ts    # documents table
│   │       ├── ai-recommendations.ts
│   │       └── admin-users.ts  # admin_users table
│   │
│   ├── ui/                     # shadcn components (unchanged)
│   │
│   └── shared/                 # Zod schemas + types (expanded)
│       └── src/
│           ├── schemas/
│           │   ├── quote.ts    # Quote creation/update validation
│           │   ├── policy.ts   # Policy schemas
│           │   ├── upload.ts   # Upload validation
│           │   └── ai.ts       # AI recommendation schemas
│           └── types/
│               ├── api.ts      # API request/response types
│               └── pricing.ts  # PricingProvider, PricingResult types
│
├── tooling/                    # Shared configs (unchanged)
│   ├── eslint/
│   ├── tailwind/
│   └── typescript/
│
├── vercel.json                 # Web app deploy config
├── turbo.json
├── pnpm-workspace.yaml
└── .env.example
```

## Deployment Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      Vercel                              │
│                                                          │
│  Project 1: shory-web          → apps/web                │
│  Domain:    shory.ae           → Main customer app       │
│                                                          │
│  Project 2: shory-admin        → apps/admin              │
│  Domain:    admin.shory.ae     → Internal admin portal   │
│                                                          │
│  Project 3: shory-api          → packages/api            │
│  Domain:    api.shory.ae       → REST API service        │
│                                                          │
│  Shared Services:                                        │
│  - Vercel Blob (file storage for document uploads)       │
│  - Neon PostgreSQL (single shared database)              │
└──────────────────────────────────────────────────────────┘
```

### Environment Variables

| Variable | Projects | Description |
|----------|----------|-------------|
| `DATABASE_URL` | api | Neon Postgres connection string |
| `ANTHROPIC_API_KEY` | api | Claude API key for AI advisor |
| `BLOB_READ_WRITE_TOKEN` | api | Vercel Blob access token |
| `AUTH_SECRET` | admin | Auth.js secret |
| `AUTH_URL` | admin | Auth.js callback URL |
| `NEXT_PUBLIC_API_URL` | web, admin | API base URL (e.g., `https://api.shory.ae`) |
| `NEXT_PUBLIC_ADMIN_URL` | web | Admin URL (for Dashboard link in navbar) |

### CORS Configuration

The API must allow requests from:
- `https://shory.ae` (web app)
- `https://admin.shory.ae` (admin app)
- `http://localhost:3000` and `http://localhost:3001` (development)

## Error Handling

### API Error Format

```json
{
  "error": {
    "code": "QUOTE_NOT_FOUND",
    "message": "Quote with ID abc-123 not found",
    "status": 404
  }
}
```

### Error Codes

| Code | Status | When |
|------|--------|------|
| `VALIDATION_ERROR` | 400 | Zod validation fails on request body |
| `QUOTE_NOT_FOUND` | 404 | Quote ID doesn't exist |
| `QUOTE_INVALID_STATE` | 409 | Action not allowed in current quote status |
| `UPLOAD_TOO_LARGE` | 413 | File exceeds 10MB limit |
| `UNAUTHORIZED` | 401 | Missing or invalid admin auth token |
| `PRICING_FAILED` | 502 | All pricing providers failed |
| `AI_UNAVAILABLE` | 503 | Claude API call failed |

## Security Considerations

- **No auth on quote endpoints:** Quotes are identified by UUIDs (128-bit random). Enumeration is infeasible. Rate limiting on quote creation prevents abuse.
- **Admin auth:** Auth.js with credentials provider. Admin tokens validated on every `/api/admin/*` request.
- **File uploads:** Validated by file type (PDF, JPG, PNG only) and size (max 10MB). Stored in Vercel Blob with random URLs.
- **Input validation:** All request bodies validated by Zod schemas from `@shory/shared` before processing.
- **CORS:** Strict origin allowlist. No wildcard origins.
- **Rate limiting:** Applied at the Hono middleware level on sensitive endpoints (quote creation, AI advisor, file uploads).

## What's NOT in MVP

- Real payment processing (Stripe, Tabby)
- Email notifications (quote confirmations, policy documents)
- Real insurer API integrations
- Customer accounts / login
- Multi-language support (Arabic)
- Policy document PDF generation
- Audit logging for admin actions
- WebSocket / real-time updates
