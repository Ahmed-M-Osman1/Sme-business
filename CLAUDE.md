@AGENTS.md

# Shory SME Insurance Platform

## What is this?
SME insurance platform with a customer-facing quote journey and an internal admin portal. Monorepo with two Next.js 16 apps sharing a common database and UI library.

## Architecture
See `.claude/commands/architecture.md` for full rules. Key points:

- **Monorepo**: pnpm workspaces + Turborepo
- **Apps**: `apps/web` (customer), `apps/admin` (internal)
- **Packages**: `@shory/db` (Drizzle + Postgres), `@shory/ui` (shadcn), `@shory/shared` (Zod + types)
- **Tooling**: shared ESLint, TypeScript, Tailwind configs in `tooling/`

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

### Data
- Drizzle ORM + PostgreSQL — schema in `packages/db/src/schema/`
- Zod validation in `@shory/shared` — reused client + server
- Server actions for mutations, server components for fetching
- `"use client"` only when needed for interactivity

### Auth
- Auth.js for admin app only
- Web app quote journey is anonymous (no auth)

## Design Spec
Full spec: `docs/superpowers/specs/2026-04-01-shory-sme-platform-design.md`
