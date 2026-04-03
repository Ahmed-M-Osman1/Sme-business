# Shory SME Insurance Platform

Full-stack SME insurance platform with a customer-facing quote journey, internal admin portal, and REST API. Built as a monorepo with Next.js 16, Hono, and PostgreSQL.

## Documentation

### Technical
- [System Architecture](docs/technical/architecture.md) — Apps, packages, data flow, deployment
- [Database Schema](docs/technical/database.md) — 27 tables across 6 domains
- [API Reference](docs/technical/api-reference.md) — All REST endpoints with auth requirements
- [Web App](docs/technical/web-app.md) — Quote journey, pricing engine, security
- [Admin App](docs/technical/admin-app.md) — Operations dashboard, AI playbooks, platform health
- [Testing](docs/technical/testing.md) — 65 Playwright E2E tests, type checking

### Business
- [Executive Summary](docs/business/Shory_Executive_Summary.md)
- [User Stories](docs/business/Shory_User_Stories_v2_Complete.md) — 54 stories across 20 epics
- [Demo Walkthrough](docs/business/Shory_Demo_Walkthrough_Guide.md)

## Tech Stack

- **Next.js 16** — Frontend (Customer + Admin)
- **React 19** — UI Framework
- **Hono** — REST API
- **PostgreSQL (Neon)** — Database
- **Drizzle ORM** — Database ORM
- **Zod** — Validation
- **TypeScript** — Language (strict mode)
- **Tailwind CSS v4** — Styling
- **shadcn/ui** — UI Components
- **Auth.js (NextAuth v5)** — Authentication
- **Claude API (Anthropic)** — AI
- **jsPDF** — PDF Generation
- **Vercel Blob** — File Storage
- **Vercel** — Deployment (3 projects)
- **Playwright** — E2E Testing
- **pnpm + Turborepo** — Monorepo Tooling

## Project Structure

```
apps/
  web/          → Customer-facing quote journey (port 3000)
  admin/        → Internal admin dashboard (port 3001)
  backend/      → Hono REST API (port 3002)
packages/
  db/           → Drizzle ORM schemas + migrations (27 tables)
  shared/       → Zod schemas + shared types
  ui/           → shadcn/ui component library
tooling/
  eslint/       → Shared ESLint config
  typescript/   → Shared TypeScript config
  tailwind/     → Shared Tailwind config
```

## Quick Start

### Prerequisites

- Node.js >= 20
- pnpm >= 9 (`npm install -g pnpm`)
- [Neon](https://neon.tech) PostgreSQL database (free tier works)

### Setup

```bash
# 1. Clone and install
git clone <repo-url>
cd shory-sme
pnpm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL, AUTH_SECRET, etc.

# 3. Push schema + seed data
source .env && export DATABASE_URL
pnpm --filter @shory/db db:push
pnpm --filter @shory/db db:seed

# 4. Run all apps
pnpm dev
```

Apps will be available at:
- **Web:** http://localhost:3000
- **Admin:** http://localhost:3001 (login: `osman@shory.com` / `osman@shory.com`)
- **API:** http://localhost:3002

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `AUTH_SECRET` | Yes | Auth.js secret (`npx auth secret`) |
| `AUTH_URL` | Yes | Admin app URL (`http://localhost:3001`) |
| `NEXT_PUBLIC_API_URL` | Yes | Backend URL (`http://localhost:3002`) |
| `ANTHROPIC_API_KEY` | No | Claude API key (for AI advisor) |
| `BLOB_READ_WRITE_TOKEN` | No | Vercel Blob token (for uploads) |

## Database Commands

```bash
pnpm --filter @shory/db db:push      # Push schema changes
pnpm --filter @shory/db db:generate  # Generate migration files
pnpm --filter @shory/db db:migrate   # Run migrations
pnpm --filter @shory/db db:seed      # Seed reference + demo data
pnpm --filter @shory/db db:studio    # Open Drizzle Studio
```

## Testing

```bash
# E2E tests (65 tests, Playwright)
cd apps/web/e2e && npx playwright test

# Type checking
cd apps/web && npx tsc --noEmit
cd apps/admin && npx tsc --noEmit
cd apps/backend && npx tsc --noEmit
```

## Deployment

Three Vercel projects deploying from the monorepo:

| Project | Root Directory | Production URL |
|---------|---------------|----------------|
| Web | `apps/web` | `sme-business-web.vercel.app` |
| Admin | `apps/admin` | `sme-business-admin.vercel.app` |
| Backend | `apps/backend` | `sme-business-backend.vercel.app` |

Set `DATABASE_URL` and other env vars in each Vercel project's Settings.

## Key API Routes

| Route | Description |
|-------|-------------|
| `GET /api/health` | Health check |
| `GET /api/catalog/*` | Business types, products, insurers |
| `POST /api/quotes` | Create quote |
| `POST /api/quotes/:id/submit` | Get pricing |
| `POST /api/admin/auth/login` | Admin login |
| `GET /api/admin/customers` | Customer list |
| `GET /api/admin/stats` | Dashboard KPIs |

Full API reference: [docs/technical/api-reference.md](docs/technical/api-reference.md)
