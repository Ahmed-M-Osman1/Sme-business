# Architecture Rules — Shory SME

These rules are non-negotiable. Follow them in every file you create or modify.

## Monorepo Structure

This is a **pnpm workspaces + Turborepo** monorepo. NEVER flatten it or move apps to root.

```
apps/web/        → Customer-facing Next.js 16 app (Vercel: shory-web)
apps/admin/      → Internal admin Next.js 16 app (Vercel: shory-admin)
packages/api/    → @shory/api — Hono REST API service (Vercel: shory-api)
packages/db/     → @shory/db — Drizzle schema, migrations, client
packages/ui/     → @shory/ui — Shared shadcn components + design tokens
packages/shared/ → @shory/shared — Zod schemas, types, constants
tooling/         → Shared ESLint, TypeScript, Tailwind configs
```

## Architecture — API-First

This project uses an **API-first architecture**. Both Next.js apps communicate with a standalone Hono API service. The API is the only layer that touches the database, Claude API, and Vercel Blob.

```
apps/web  ──┐
             ├──→ packages/api (Hono) ──→ PostgreSQL (Neon)
apps/admin ─┘                         ──→ Claude API
                                       ──→ Vercel Blob
```

- Full system design: `docs/superpowers/specs/2026-04-01-shory-sme-system-architecture.md`

## Rules

### File placement
- Customer-facing pages → `apps/web/app/`
- Admin pages → `apps/admin/app/`
- API routes/handlers → `packages/api/src/routes/`
- Pricing engine → `packages/api/src/pricing/`
- AI advisor → `packages/api/src/ai/`
- API middleware → `packages/api/src/middleware/`
- Database schema/migrations → `packages/db/src/schema/`
- Shared UI components → `packages/ui/src/components/`
- Shared types/validation/schemas → `packages/shared/src/`
- App-specific components → `apps/<app>/components/`
- Typed API client wrappers → `apps/<app>/lib/api-client.ts`

### Imports
- Use `@shory/db`, `@shory/ui`, `@shory/shared` for cross-package imports
- Use `@/` alias for within-app imports
- NEVER use relative paths across package boundaries
- `@shory/db` is consumed ONLY by `packages/api` — frontends never import it directly

### Database
- **Drizzle ORM + PostgreSQL (Neon)** only
- All schema in `packages/db/src/schema/` — one file per table
- Migrations via `drizzle-kit`
- DB client exported from `@shory/db`
- NEVER put schema definitions in app directories
- NEVER access the database from Next.js apps — always go through the API

### API
- **Hono** REST API in `packages/api/`
- All data mutations and queries go through the API
- Next.js apps call the API via typed fetch wrappers in `lib/api-client.ts`
- Request bodies validated by Zod schemas from `@shory/shared`
- Admin endpoints (`/api/admin/*`) require Auth.js token in `Authorization` header
- Quote endpoints are anonymous — identified by UUID, no auth
- See `/api` command for endpoint reference

### Pricing Engine
- Adapter pattern: `PricingProvider` interface in `packages/api/src/pricing/types.ts`
- MVP uses mock providers — swap in real insurer APIs later
- Engine runs all providers in parallel, aggregates results

### AI Advisor
- Claude API integration in `packages/api/src/ai/advisor.ts`
- Model: Claude Sonnet 4.6
- Recommendations stored in `ai_recommendations` table for audit

### Styling
- **Tailwind CSS v4** — config in CSS (`@theme inline`), NOT in `tailwind.config.js`
- **shadcn/ui** components in `packages/ui/`
- Use `cn()` from `@shory/ui` for class merging
- Follow Shory design system (see `/tailwind` and `/shadcn` commands)
- NEVER use CSS modules, styled-components, or inline styles

### Validation
- **Zod** schemas in `@shory/shared`
- Reuse same schema for API validation and form validation
- NEVER duplicate validation logic between client and server

### Auth
- **Auth.js** for admin app only
- Admin API requests pass session token as `Authorization: Bearer <token>`
- API middleware on `/api/admin/*` validates the token
- Web app (customer) has no auth (quote journey is anonymous)

### Code Quality
- TypeScript strict mode — no `any` types
- Named exports only — no default exports (except Next.js pages/layouts)
- One component per file
- Keep files under 200 lines — extract if larger
- No unused imports, variables, or dead code

### Naming Conventions
- Files: `kebab-case.ts` / `kebab-case.tsx`
- Components: `PascalCase` function names
- DB tables: `snake_case`
- API routes: `kebab-case` (e.g., `/api/quotes/:id/results`)
- Zod schemas: `camelCase` with `Schema` suffix (e.g., `quoteFormSchema`)
- Types: `PascalCase` (e.g., `Quote`, `AdminUser`, `PricingProvider`)
