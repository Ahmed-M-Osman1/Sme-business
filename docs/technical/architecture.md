# System Architecture

## Overview

Shory SME is a monorepo containing three deployable applications and three shared packages, orchestrated by pnpm workspaces and Turborepo.

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTS                               │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Web App    │  │  Admin App   │  │  Mobile (future)  │  │
│  │  Next.js 16  │  │  Next.js 16  │  │                   │  │
│  │  Port 3000   │  │  Port 3001   │  │                   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────────────┘  │
│         │                  │                                 │
│         └────────┬─────────┘                                 │
│                  │ REST API                                   │
│         ┌────────▼─────────┐                                 │
│         │   Hono Backend   │                                 │
│         │    Port 3002     │                                 │
│         │  Vercel Serverless│                                │
│         └────────┬─────────┘                                 │
│                  │                                           │
│         ┌────────▼─────────┐                                 │
│         │  Neon PostgreSQL │                                 │
│         │  (Serverless)    │                                 │
│         └──────────────────┘                                 │
└─────────────────────────────────────────────────────────────┘
```

## Applications

### Web App (`apps/web`)
Customer-facing insurance quote journey. Anonymous users (no auth required) flow through 4 entry paths to get insurance quotes, compare insurers, and purchase policies.

- **Framework:** Next.js 16 with App Router
- **Auth:** NextAuth v5 (optional — required only for dashboard/policy management)
- **Key flows:** AI Advisor, Pre-configured business type, Trade license OCR upload, Manual entry
- **Deploy:** Vercel (`sme-business-web.vercel.app`)

### Admin App (`apps/admin`)
Internal operations dashboard for Shory's team. Protected by Auth.js credentials login.

- **Framework:** Next.js 16 with App Router
- **Auth:** Auth.js with credentials provider
- **Key sections:** Dashboard, Customers, Renewals, Claims, Signals, Platform Health, Quotes, Reports
- **Deploy:** Vercel (`sme-business-admin.vercel.app`)

### Backend API (`apps/backend`)
REST API built with Hono, deployed as Vercel Serverless Functions.

- **Framework:** Hono v4
- **ORM:** Drizzle (via `@shory/db`)
- **AI:** Claude API (Anthropic) for recommendations and business classification
- **Storage:** Vercel Blob for document uploads
- **Deploy:** Vercel (`sme-business-backend.vercel.app`)

## Shared Packages

### `@shory/db`
Database schema definitions (Drizzle ORM), client initialization, migrations, and seed data.

- **27 tables** covering quotes, policies, customers, claims, insurers, products, admin operations, platform monitoring, and intelligence
- **Schema-driven types** — `Customer`, `Quote`, `Policy`, etc. exported as TypeScript types
- **Seed script** — populates all reference data + demo customers/quotes/claims

### `@shory/shared`
Zod validation schemas and TypeScript type definitions shared between API and frontends.

- API request/response types
- Form validation schemas (reused in both frontend forms and API handlers)
- Business logic types (playbook results, platform context, etc.)

### `@shory/ui`
shadcn/ui component library configured for the Shory design system.

- Base components: Button, Card, Badge, Input, etc.
- Shory theme: `#1D68FF` primary, rounded corners, subtle shadows

## Data Flow

### Quote Journey (Web → Backend → DB)
```
User fills form → Client-side pricing engine calculates premium
  → User selects insurer → Navigate to checkout
  → Server-side price verification (recalculates from params)
  → Payment processing → Policy created in DB
  → Confirmation + PDF generation (client-side)
```

### Admin Operations (Admin → Backend → DB)
```
Admin logs in → Auth.js validates credentials against admin_users table
  → Dashboard fetches stats via /api/admin/stats
  → Customer data via /api/admin/customers (with playbooks, signals, claims)
  → All mutations go through authenticated API endpoints
```

## Authentication

| App | Method | Details |
|-----|--------|---------|
| Web | NextAuth v5 (optional) | Credentials provider, customer email as token. Quote journey is anonymous. Auth required only for dashboard. |
| Admin | Auth.js (mandatory) | Credentials provider against `admin_users` table. Bearer token = admin email (MVP). |
| API | Bearer token | Admin routes: token = admin email. User routes: token = customer email. |

## Deployment

Three independent Vercel projects, each deploying from the monorepo root with different root directories:

| Project | Root Directory | Domain |
|---------|---------------|--------|
| Web | `apps/web` | `sme-business-web.vercel.app` |
| Admin | `apps/admin` | `sme-business-admin.vercel.app` |
| Backend | `apps/backend` | `sme-business-backend.vercel.app` |

All share the same `DATABASE_URL` pointing to a single Neon PostgreSQL instance.
