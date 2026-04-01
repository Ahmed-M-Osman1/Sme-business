@AGENTS.md

# Shory SME Insurance Platform

## What is this?
SME insurance platform with a customer-facing quote journey and an internal admin portal. API-first monorepo with two Next.js 16 apps, a Hono REST API, and shared packages.

## Architecture
See `.claude/commands/architecture.md` for full rules. Key points:

- **Monorepo**: pnpm workspaces + Turborepo
- **Apps**: `apps/web` (customer), `apps/admin` (internal)
- **API**: `packages/api` (Hono REST API — the only layer that talks to DB, Claude, Blob)
- **Packages**: `@shory/db` (Drizzle + Neon Postgres), `@shory/ui` (shadcn), `@shory/shared` (Zod + types)
- **Tooling**: shared ESLint, TypeScript, Tailwind configs in `tooling/`
- **Deploy**: 3 Vercel projects (web, admin, api) — see system architecture spec

## Critical Rules

### Read before writing
- Read `node_modules/next/dist/docs/` before writing Next.js code — v16 has breaking changes
- Read `.claude/commands/architecture.md` before creating any file — placement matters

### Code cleanliness
- TypeScript strict — no `any`
- Named exports only (except pages/layouts)
- One component per file, under 200 lines
- No dead code, no unused imports
- Files: `kebab-case`, Components: `PascalCase`, DB: `snake_case`

### Styling
- Tailwind CSS v4 — `@theme inline` in CSS, NO `tailwind.config.js`
- shadcn/ui from `@shory/ui` — never build what shadcn provides
- Shory design system: `#1D68FF` primary, rounded corners, subtle shadows, smooth transitions
- **Responsive design is a must** — every page and component must work on mobile, tablet, and desktop. Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`) and test all breakpoints

### Data & API
- **API-first**: All data access goes through the Hono API in `packages/api/`
- Next.js apps call the API via typed fetch wrappers in `lib/api-client.ts`
- Drizzle ORM + Neon PostgreSQL — schema in `packages/db/src/schema/`
- Zod validation in `@shory/shared` — reused in API + frontend forms
- `"use client"` only when needed for interactivity
- NEVER access the database directly from Next.js apps

### Auth
- Auth.js for admin app only
- Web app quote journey is anonymous (no auth)

## Skills to Use
Always invoke relevant skills before writing code:

- `/ui` — Build UI following Shory's design language
- `/tailwind` — Tailwind CSS v4 with Shory design tokens
- `/shadcn` — shadcn/ui component usage in Shory style
- `/add-component` — Adding new UI components
- `/architecture` — Architecture rules and file placement
- `/api` — API endpoint reference and conventions

## Design Specs
- Platform design: `docs/superpowers/specs/2026-04-01-shory-sme-platform-design.md`
- System architecture: `docs/superpowers/specs/2026-04-01-shory-sme-system-architecture.md`
