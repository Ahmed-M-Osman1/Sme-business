# Shory SME Insurance Platform — Design Spec

## Overview

An SME insurance platform inspired by shory.com's UI. Customers get insurance quotes through a streamlined multi-step journey. An admin portal manages quotes and policies internally.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Monorepo | pnpm workspaces + Turborepo |
| Framework | Next.js 16 (app router, both apps) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui (Shory design system) |
| Database | PostgreSQL + Drizzle ORM |
| Auth | Auth.js (admin only, credentials provider) |
| Validation | Zod (shared between client + server) |
| Deploy | Vercel (separate project per app) |

## Monorepo Structure

```
shory-sme/
├── apps/
│   ├── web/                # Customer-facing quote journey
│   │   ├── app/
│   │   ├── components/
│   │   ├── next.config.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── admin/              # Internal admin portal
│       ├── app/
│       ├── components/
│       ├── next.config.ts
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   ├── db/                 # Drizzle schema, migrations, DB client
│   │   ├── src/
│   │   │   ├── schema/
│   │   │   ├── client.ts
│   │   │   └── index.ts
│   │   ├── drizzle.config.ts
│   │   └── package.json
│   ├── ui/                 # Shared shadcn components + Shory design tokens
│   │   ├── src/
│   │   │   ├── components/
│   │   │   └── lib/utils.ts
│   │   └── package.json
│   └── shared/             # Zod schemas, types, constants
│       ├── src/
│       └── package.json
├── tooling/
│   ├── eslint/             # Shared ESLint config
│   ├── typescript/         # Shared tsconfig base
│   └── tailwind/           # Shared CSS/Tailwind config
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── .env.example
```

### Package naming

All internal packages use the `@shory/` scope:

- `@shory/db` — database schema, client, migrations
- `@shory/ui` — shared UI components
- `@shory/shared` — types, validation schemas, constants

## Database Schema (Initial)

### quotes

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key, auto-generated |
| business_name | text | Required |
| trade_license | text | Nullable |
| emirate | text | Required |
| industry | text | Required |
| employees_count | integer | Required |
| coverage_type | text | Required |
| status | enum | draft, submitted, quoted, accepted, expired |
| created_at | timestamp | Auto-set |
| updated_at | timestamp | Auto-updated |

### admin_users

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key, auto-generated |
| email | text | Unique |
| name | text | Required |
| role | enum | admin, viewer |
| created_at | timestamp | Auto-set |
| updated_at | timestamp | Auto-updated |

Additional tables (policies, customers, documents) will be added as features require them.

## Web App — Customer Quote Journey

### Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing page — hero section, value proposition, "Start Quote" CTA |
| `/quote/start` | Input method selection (Step 1) |
| `/quote/details` | Business details form (Step 2) |
| `/quote/coverage` | Coverage selection (Step 3) |
| `/quote/review` | Review & submit (Step 4) |
| `/quote/result` | Quote result with pricing |

### Behavior

- Progress indicator visible across all `/quote/*` steps
- Each step saves to DB as `draft` status so users can resume
- Zod validation on both client (form) and server (action)
- Mobile-first, responsive design following Shory design language

### Landing Page (Feature: TC-001 through TC-004)

- Headline: "Get SME Insurance in Minutes"
- Subheadline with value proposition
- "Start Quote" CTA button above the fold
- Page loads within 2 seconds
- Fully responsive — no horizontal scroll on mobile
- CTA navigates to `/quote/start` with progress indicator showing Step 1

## Admin App

### Routes

| Route | Purpose |
|-------|---------|
| `/` | Dashboard — quote stats, recent activity |
| `/quotes` | All quotes — table with filters and search |
| `/quotes/[id]` | Quote detail — view/manage individual quote |
| `/settings` | Admin settings |

### Auth

- Auth.js with credentials provider (email/password)
- Middleware-protected — all routes require authentication
- Role-based: `admin` (full access) and `viewer` (read-only)
- Can add Google/SSO providers later without architecture changes

## Design Language

Follows shory.com's visual style:

- **Primary color**: `#1D68FF` (electric blue)
- **Background**: White with `#F7F8FA` surface color
- **Corners**: `rounded-xl` (buttons/inputs), `rounded-2xl` (cards)
- **Shadows**: `shadow-sm` default, `shadow-md` on hover
- **Transitions**: `transition-all duration-200 ease-in-out` on all interactive elements
- **Typography**: Clean sans-serif, hierarchical scale
- **Layout**: `max-w-7xl` container, generous whitespace
- **Mobile**: Bottom sheets, stacked layouts, thumb-friendly targets

## Deployment

- Vercel with separate projects for `web` and `admin`
- Turborepo handles build caching and task orchestration
- Shared packages are built as internal dependencies (no publishing)
- Environment variables managed per-app in Vercel dashboard
