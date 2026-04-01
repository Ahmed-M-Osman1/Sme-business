# Architecture Rules — Shory SME

These rules are non-negotiable. Follow them in every file you create or modify.

## Monorepo Structure

This is a **pnpm workspaces + Turborepo** monorepo. NEVER flatten it or move apps to root.

```
apps/web/        → Customer-facing Next.js 16 app
apps/admin/      → Internal admin Next.js 16 app
packages/db/     → @shory/db — Drizzle schema, migrations, client
packages/ui/     → @shory/ui — Shared shadcn components + design tokens
packages/shared/ → @shory/shared — Zod schemas, types, constants
tooling/         → Shared ESLint, TypeScript, Tailwind configs
```

## Rules

### File placement
- Customer-facing pages → `apps/web/app/`
- Admin pages → `apps/admin/app/`
- Database schema/migrations → `packages/db/src/schema/`
- Shared UI components → `packages/ui/src/components/`
- Shared types/validation → `packages/shared/src/`
- App-specific components → `apps/<app>/components/`

### Imports
- Use `@shory/db`, `@shory/ui`, `@shory/shared` for cross-package imports
- Use `@/` alias for within-app imports
- NEVER use relative paths across package boundaries

### Database
- **Drizzle ORM + PostgreSQL** only
- All schema in `packages/db/src/schema/` — one file per table
- Migrations via `drizzle-kit`
- DB client exported from `@shory/db`
- NEVER put schema definitions in app directories

### Styling
- **Tailwind CSS v4** — config in CSS (`@theme inline`), NOT in `tailwind.config.js`
- **shadcn/ui** components in `packages/ui/`
- Use `cn()` from `@shory/ui` for class merging
- Follow Shory design system (see `/tailwind` and `/shadcn` commands)
- NEVER use CSS modules, styled-components, or inline styles

### Validation
- **Zod** schemas in `@shory/shared`
- Reuse same schema for form validation (client) and server actions (server)
- NEVER duplicate validation logic between client and server

### Auth
- **Auth.js** for admin app only
- Middleware-based route protection
- Web app (customer) has no auth (quote journey is anonymous)

### API / Data
- Use **Next.js server actions** for mutations
- Use **server components** for data fetching
- Add `"use client"` ONLY when the component needs interactivity
- NEVER create standalone API route files unless needed for webhooks or external integrations

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
- Zod schemas: `camelCase` with `Schema` suffix (e.g., `quoteFormSchema`)
- Types: `PascalCase` (e.g., `Quote`, `AdminUser`)
