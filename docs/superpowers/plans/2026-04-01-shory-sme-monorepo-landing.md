# Shory SME Monorepo + Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the Shory SME monorepo (web + admin apps, shared packages) and implement the landing page with "Start Quote" CTA journey entry point.

**Architecture:** pnpm workspaces + Turborepo monorepo with two Next.js 16 apps (`web`, `admin`) sharing `@shory/db` (Drizzle + Postgres), `@shory/ui` (shadcn components), and `@shory/shared` (Zod schemas + types). Shared tooling configs for ESLint, TypeScript, and Tailwind.

**Tech Stack:** Next.js 16, TypeScript (strict), Tailwind CSS v4, shadcn/ui, Drizzle ORM, PostgreSQL, Auth.js, Zod, Turborepo, pnpm 9

---

## File Structure

```
shory-sme/
├── apps/
│   ├── web/
│   │   ├── app/
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                    # Landing page
│   │   │   └── quote/
│   │   │       └── start/
│   │   │           └── page.tsx            # Step 1 placeholder
│   │   ├── components/
│   │   │   ├── landing/
│   │   │   │   ├── hero.tsx
│   │   │   │   ├── product-cards.tsx
│   │   │   │   ├── trust-badges.tsx
│   │   │   │   └── stats-section.tsx
│   │   │   ├── layout/
│   │   │   │   ├── navbar.tsx
│   │   │   │   └── footer.tsx
│   │   │   └── quote/
│   │   │       └── progress-indicator.tsx
│   │   ├── next.config.ts
│   │   ├── postcss.config.mjs
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── admin/
│       ├── app/
│       │   ├── globals.css
│       │   ├── layout.tsx
│       │   └── page.tsx
│       ├── next.config.ts
│       ├── postcss.config.mjs
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   ├── db/
│   │   ├── src/
│   │   │   ├── schema/
│   │   │   │   ├── quotes.ts
│   │   │   │   └── admin-users.ts
│   │   │   ├── client.ts
│   │   │   └── index.ts
│   │   ├── drizzle.config.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── ui/
│   │   ├── src/
│   │   │   ├── components/              # shadcn components installed here
│   │   │   ├── lib/
│   │   │   │   └── utils.ts
│   │   │   └── index.ts
│   │   ├── components.json
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── shared/
│       ├── src/
│       │   ├── types/
│       │   │   └── quote.ts
│       │   ├── schemas/
│       │   │   └── quote.ts
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
├── tooling/
│   ├── eslint/
│   │   ├── base.js
│   │   └── package.json
│   ├── typescript/
│   │   ├── base.json
│   │   ├── nextjs.json
│   │   └── package.json
│   └── tailwind/
│       ├── globals.css
│       └── package.json
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── .gitignore
├── .env.example
├── CLAUDE.md
└── AGENTS.md
```

---

### Task 1: Convert to pnpm Monorepo Root

**Files:**
- Modify: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `turbo.json`
- Modify: `.gitignore`

- [ ] **Step 1: Create `pnpm-workspace.yaml`**

```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "tooling/*"
```

- [ ] **Step 2: Update root `package.json` to monorepo root**

Replace entire `package.json` with:

```json
{
  "name": "shory-sme",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "db:generate": "turbo db:generate",
    "db:migrate": "turbo db:migrate",
    "db:push": "turbo db:push",
    "db:studio": "pnpm --filter @shory/db db:studio"
  },
  "devDependencies": {
    "turbo": "^2"
  },
  "packageManager": "pnpm@9.14.1"
}
```

- [ ] **Step 3: Create `turbo.json`**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "db:generate": {
      "cache": false
    },
    "db:migrate": {
      "cache": false
    },
    "db:push": {
      "cache": false
    }
  }
}
```

- [ ] **Step 4: Update `.gitignore` for monorepo**

Add these lines to the existing `.gitignore`:

```
# turbo
.turbo

# monorepo
apps/**/node_modules
packages/**/node_modules
tooling/**/node_modules
apps/**/.next
```

- [ ] **Step 5: Create `.env.example`**

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/shory_sme

# Auth.js (admin app)
AUTH_SECRET=generate-with-openssl-rand-base64-32
AUTH_URL=http://localhost:3001
```

- [ ] **Step 6: Remove old app files and lock file**

Delete the old single-app files that will be replaced by the monorepo structure:

```bash
rm -rf app/ public/ next.config.ts postcss.config.mjs eslint.config.mjs tsconfig.json next-env.d.ts pnpm-lock.yaml node_modules .next README.md
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: convert to pnpm monorepo with turborepo"
```

---

### Task 2: Shared Tooling Configs

**Files:**
- Create: `tooling/typescript/base.json`
- Create: `tooling/typescript/nextjs.json`
- Create: `tooling/typescript/package.json`
- Create: `tooling/eslint/base.js`
- Create: `tooling/eslint/package.json`
- Create: `tooling/tailwind/globals.css`
- Create: `tooling/tailwind/package.json`

- [ ] **Step 1: Create `tooling/typescript/package.json`**

```json
{
  "name": "@shory/typescript-config",
  "private": true,
  "version": "0.0.0"
}
```

- [ ] **Step 2: Create `tooling/typescript/base.json`**

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true
  },
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create `tooling/typescript/nextjs.json`**

```json
{
  "extends": "./base.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }]
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ]
}
```

- [ ] **Step 4: Create `tooling/eslint/package.json`**

```json
{
  "name": "@shory/eslint-config",
  "private": true,
  "version": "0.0.0",
  "devDependencies": {
    "eslint": "^9",
    "eslint-config-next": "16.2.2"
  }
}
```

- [ ] **Step 5: Create `tooling/eslint/base.js`**

```js
import {defineConfig, globalIgnores} from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'dist/**']),
]);

export default eslintConfig;
```

- [ ] **Step 6: Create `tooling/tailwind/package.json`**

```json
{
  "name": "@shory/tailwind-config",
  "private": true,
  "version": "0.0.0",
  "devDependencies": {
    "tailwindcss": "^4",
    "@tailwindcss/postcss": "^4"
  }
}
```

- [ ] **Step 7: Create `tooling/tailwind/globals.css` — Shory design tokens**

```css
@import "tailwindcss";

@theme inline {
  /* Primary */
  --color-primary: #1D68FF;
  --color-primary-hover: #1555D4;
  --color-primary-light: #E8F0FF;

  /* Neutral */
  --color-background: #FFFFFF;
  --color-surface: #F7F8FA;
  --color-border: #E5E7EB;
  --color-text: #1A1A2E;
  --color-text-muted: #6B7280;

  /* Accent */
  --color-success: #22C55E;
  --color-warning: #F59E0B;
  --color-error: #EF4444;

  /* Fonts */
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  background: var(--color-background);
  color: var(--color-text);
}
```

- [ ] **Step 8: Commit**

```bash
git add tooling/
git commit -m "chore: add shared tooling configs (typescript, eslint, tailwind)"
```

---

### Task 3: Create `@shory/shared` Package

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/index.ts`
- Create: `packages/shared/src/types/quote.ts`
- Create: `packages/shared/src/schemas/quote.ts`

- [ ] **Step 1: Create `packages/shared/package.json`**

```json
{
  "name": "@shory/shared",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "default": "./src/index.ts"
    }
  },
  "dependencies": {
    "zod": "^3"
  },
  "devDependencies": {
    "@shory/typescript-config": "workspace:*",
    "typescript": "^5"
  }
}
```

- [ ] **Step 2: Create `packages/shared/tsconfig.json`**

```json
{
  "extends": "@shory/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "./dist"
  },
  "include": ["src/**/*.ts"]
}
```

- [ ] **Step 3: Create `packages/shared/src/types/quote.ts`**

```ts
export const QUOTE_STATUSES = [
  'draft',
  'submitted',
  'quoted',
  'accepted',
  'expired',
] as const;

export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

export const EMIRATES = [
  'Abu Dhabi',
  'Dubai',
  'Sharjah',
  'Ajman',
  'Umm Al Quwain',
  'Ras Al Khaimah',
  'Fujairah',
] as const;

export type Emirate = (typeof EMIRATES)[number];

export const INDUSTRIES = [
  'Technology',
  'Trading',
  'Manufacturing',
  'Construction',
  'Healthcare',
  'Hospitality',
  'Retail',
  'Professional Services',
  'Transport & Logistics',
  'Other',
] as const;

export type Industry = (typeof INDUSTRIES)[number];

export const COVERAGE_TYPES = [
  'property',
  'liability',
  'workers-compensation',
  'fleet',
  'comprehensive',
] as const;

export type CoverageType = (typeof COVERAGE_TYPES)[number];
```

- [ ] **Step 4: Create `packages/shared/src/schemas/quote.ts`**

```ts
import {z} from 'zod';
import {COVERAGE_TYPES, EMIRATES, INDUSTRIES} from '../types/quote';

export const quoteFormSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  tradeLicense: z.string().optional(),
  emirate: z.enum(EMIRATES, {message: 'Please select an emirate'}),
  industry: z.enum(INDUSTRIES, {message: 'Please select an industry'}),
  employeesCount: z.number().int().min(1, 'Must have at least 1 employee'),
  coverageType: z.enum(COVERAGE_TYPES, {message: 'Please select a coverage type'}),
});

export type QuoteFormData = z.infer<typeof quoteFormSchema>;
```

- [ ] **Step 5: Create `packages/shared/src/index.ts`**

```ts
export * from './types/quote';
export * from './schemas/quote';
```

- [ ] **Step 6: Commit**

```bash
git add packages/shared/
git commit -m "feat: add @shory/shared package with quote types and zod schemas"
```

---

### Task 4: Create `@shory/db` Package

**Files:**
- Create: `packages/db/package.json`
- Create: `packages/db/tsconfig.json`
- Create: `packages/db/drizzle.config.ts`
- Create: `packages/db/src/client.ts`
- Create: `packages/db/src/schema/quotes.ts`
- Create: `packages/db/src/schema/admin-users.ts`
- Create: `packages/db/src/index.ts`

- [ ] **Step 1: Create `packages/db/package.json`**

```json
{
  "name": "@shory/db",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "default": "./src/index.ts"
    }
  },
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "drizzle-orm": "^0.39",
    "postgres": "^3"
  },
  "devDependencies": {
    "@shory/typescript-config": "workspace:*",
    "drizzle-kit": "^0.30",
    "typescript": "^5"
  }
}
```

- [ ] **Step 2: Create `packages/db/tsconfig.json`**

```json
{
  "extends": "@shory/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "./dist"
  },
  "include": ["src/**/*.ts", "drizzle.config.ts"]
}
```

- [ ] **Step 3: Create `packages/db/drizzle.config.ts`**

```ts
import {defineConfig} from 'drizzle-kit';

export default defineConfig({
  schema: './src/schema',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

- [ ] **Step 4: Create `packages/db/src/client.ts`**

```ts
import {drizzle} from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/quotes';
import * as adminSchema from './schema/admin-users';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);

export const db = drizzle(client, {
  schema: {...schema, ...adminSchema},
});
```

- [ ] **Step 5: Create `packages/db/src/schema/quotes.ts`**

```ts
import {pgEnum, pgTable, text, integer, timestamp, uuid} from 'drizzle-orm/pg-core';

export const quoteStatusEnum = pgEnum('quote_status', [
  'draft',
  'submitted',
  'quoted',
  'accepted',
  'expired',
]);

export const quotes = pgTable('quotes', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessName: text('business_name').notNull(),
  tradeLicense: text('trade_license'),
  emirate: text('emirate').notNull(),
  industry: text('industry').notNull(),
  employeesCount: integer('employees_count').notNull(),
  coverageType: text('coverage_type').notNull(),
  status: quoteStatusEnum('status').default('draft').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Quote = typeof quotes.$inferSelect;
export type NewQuote = typeof quotes.$inferInsert;
```

- [ ] **Step 6: Create `packages/db/src/schema/admin-users.ts`**

```ts
import {pgEnum, pgTable, text, timestamp, uuid} from 'drizzle-orm/pg-core';

export const adminRoleEnum = pgEnum('admin_role', ['admin', 'viewer']);

export const adminUsers = pgTable('admin_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: adminRoleEnum('role').default('viewer').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;
```

- [ ] **Step 7: Create `packages/db/src/index.ts`**

```ts
export {db} from './client';
export * from './schema/quotes';
export * from './schema/admin-users';
```

- [ ] **Step 8: Commit**

```bash
git add packages/db/
git commit -m "feat: add @shory/db package with drizzle schema for quotes and admin users"
```

---

### Task 5: Create `@shory/ui` Package

**Files:**
- Create: `packages/ui/package.json`
- Create: `packages/ui/tsconfig.json`
- Create: `packages/ui/src/lib/utils.ts`
- Create: `packages/ui/src/index.ts`
- Create: `packages/ui/components.json`

- [ ] **Step 1: Create `packages/ui/package.json`**

```json
{
  "name": "@shory/ui",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "default": "./src/index.ts"
    },
    "./lib/utils": {
      "types": "./src/lib/utils.ts",
      "default": "./src/lib/utils.ts"
    },
    "./components/*": {
      "types": "./src/components/*.tsx",
      "default": "./src/components/*.tsx"
    }
  },
  "dependencies": {
    "class-variance-authority": "^0.7",
    "clsx": "^2",
    "tailwind-merge": "^3"
  },
  "devDependencies": {
    "@shory/typescript-config": "workspace:*",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "typescript": "^5"
  },
  "peerDependencies": {
    "react": "^19",
    "react-dom": "^19"
  }
}
```

- [ ] **Step 2: Create `packages/ui/tsconfig.json`**

```json
{
  "extends": "@shory/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"]
}
```

- [ ] **Step 3: Create `packages/ui/src/lib/utils.ts`**

```ts
import {type ClassValue, clsx} from 'clsx';
import {twMerge} from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 4: Create `packages/ui/src/index.ts`**

```ts
export {cn} from './lib/utils';
```

- [ ] **Step 5: Create `packages/ui/components.json`**

This configures shadcn CLI to install components into this package:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "../../tooling/tailwind/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

- [ ] **Step 6: Commit**

```bash
git add packages/ui/
git commit -m "feat: add @shory/ui package with cn utility and shadcn config"
```

---

### Task 6: Create `apps/web` — Next.js Customer App

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/next.config.ts`
- Create: `apps/web/postcss.config.mjs`
- Create: `apps/web/app/globals.css`
- Create: `apps/web/app/layout.tsx`
- Create: `apps/web/app/page.tsx` (minimal placeholder)

- [ ] **Step 1: Create `apps/web/package.json`**

```json
{
  "name": "@shory/web",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@shory/db": "workspace:*",
    "@shory/shared": "workspace:*",
    "@shory/ui": "workspace:*",
    "next": "16.2.2",
    "react": "19.2.4",
    "react-dom": "19.2.4"
  },
  "devDependencies": {
    "@shory/eslint-config": "workspace:*",
    "@shory/tailwind-config": "workspace:*",
    "@shory/typescript-config": "workspace:*",
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.2",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

- [ ] **Step 2: Create `apps/web/tsconfig.json`**

```json
{
  "extends": "@shory/typescript-config/nextjs.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create `apps/web/next.config.ts`**

```ts
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@shory/ui', '@shory/shared'],
};

export default nextConfig;
```

- [ ] **Step 4: Create `apps/web/postcss.config.mjs`**

```js
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;
```

- [ ] **Step 5: Create `apps/web/app/globals.css`**

Import the shared design tokens then add any web-app-specific overrides:

```css
@import "../../../tooling/tailwind/globals.css";
```

- [ ] **Step 6: Create `apps/web/app/layout.tsx`**

```tsx
import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Shory SME — Insurance for Your Business',
  description:
    'Compare and buy SME insurance in minutes. Top insurers, best prices.',
};

export default function RootLayout({
  children,
}: Readonly<{children: React.ReactNode}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
```

- [ ] **Step 7: Create `apps/web/app/page.tsx` — minimal placeholder**

```tsx
export default function HomePage() {
  return (
    <main className="flex flex-1 items-center justify-center">
      <h1 className="text-2xl font-semibold text-text">Shory SME — Coming Soon</h1>
    </main>
  );
}
```

- [ ] **Step 8: Commit**

```bash
git add apps/web/
git commit -m "feat: scaffold apps/web next.js customer app"
```

---

### Task 7: Create `apps/admin` — Next.js Admin App

**Files:**
- Create: `apps/admin/package.json`
- Create: `apps/admin/tsconfig.json`
- Create: `apps/admin/next.config.ts`
- Create: `apps/admin/postcss.config.mjs`
- Create: `apps/admin/app/globals.css`
- Create: `apps/admin/app/layout.tsx`
- Create: `apps/admin/app/page.tsx`

- [ ] **Step 1: Create `apps/admin/package.json`**

```json
{
  "name": "@shory/admin",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "next dev --port 3001",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@shory/db": "workspace:*",
    "@shory/shared": "workspace:*",
    "@shory/ui": "workspace:*",
    "next": "16.2.2",
    "next-auth": "^5",
    "react": "19.2.4",
    "react-dom": "19.2.4"
  },
  "devDependencies": {
    "@shory/eslint-config": "workspace:*",
    "@shory/tailwind-config": "workspace:*",
    "@shory/typescript-config": "workspace:*",
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.2",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

- [ ] **Step 2: Create `apps/admin/tsconfig.json`**

```json
{
  "extends": "@shory/typescript-config/nextjs.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create `apps/admin/next.config.ts`**

```ts
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@shory/ui', '@shory/shared'],
};

export default nextConfig;
```

- [ ] **Step 4: Create `apps/admin/postcss.config.mjs`**

```js
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;
```

- [ ] **Step 5: Create `apps/admin/app/globals.css`**

```css
@import "../../../tooling/tailwind/globals.css";
```

- [ ] **Step 6: Create `apps/admin/app/layout.tsx`**

```tsx
import type {Metadata} from 'next';
import {Geist} from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Shory SME Admin',
  description: 'Internal admin portal for Shory SME insurance',
};

export default function RootLayout({
  children,
}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
```

- [ ] **Step 7: Create `apps/admin/app/page.tsx`**

```tsx
export default function AdminDashboard() {
  return (
    <main className="flex flex-1 items-center justify-center">
      <h1 className="text-2xl font-semibold text-text">Shory SME Admin — Dashboard</h1>
    </main>
  );
}
```

- [ ] **Step 8: Commit**

```bash
git add apps/admin/
git commit -m "feat: scaffold apps/admin next.js admin app"
```

---

### Task 8: Install Dependencies and Verify Build

**Files:**
- None created — verification only

- [ ] **Step 1: Install all dependencies**

```bash
pnpm install
```

Expected: Clean install with no errors. Lock file generated.

- [ ] **Step 2: Verify web app builds**

```bash
pnpm --filter @shory/web build
```

Expected: Next.js build succeeds with no errors.

- [ ] **Step 3: Verify admin app builds**

```bash
pnpm --filter @shory/admin build
```

Expected: Next.js build succeeds with no errors.

- [ ] **Step 4: Verify turbo build runs both**

```bash
pnpm build
```

Expected: Both apps build successfully via Turborepo.

- [ ] **Step 5: Fix any issues found during build**

If TypeScript or build errors occur, fix them before proceeding. Common issues:
- Missing peer dependencies — add them to the relevant `package.json`
- Path resolution — check `tsconfig.json` paths and `next.config.ts` transpilePackages
- CSS import paths — verify `globals.css` imports resolve correctly

- [ ] **Step 6: Commit lock file and any fixes**

```bash
git add pnpm-lock.yaml
git commit -m "chore: install dependencies and verify monorepo builds"
```

---

### Task 9: Install shadcn Components into `@shory/ui`

**Files:**
- Modified by shadcn CLI: `packages/ui/src/components/button.tsx`
- Modified by shadcn CLI: `packages/ui/src/components/card.tsx`
- Modified by shadcn CLI: `packages/ui/src/components/badge.tsx`

- [ ] **Step 1: Install button component**

```bash
cd packages/ui && pnpm dlx shadcn@latest add button -y
```

If the CLI asks about overwriting, select yes. Verify file created at `packages/ui/src/components/button.tsx`.

- [ ] **Step 2: Install card component**

```bash
cd packages/ui && pnpm dlx shadcn@latest add card -y
```

Verify file created at `packages/ui/src/components/card.tsx`.

- [ ] **Step 3: Install badge component**

```bash
cd packages/ui && pnpm dlx shadcn@latest add badge -y
```

Verify file created at `packages/ui/src/components/badge.tsx`.

- [ ] **Step 4: Update `packages/ui/src/index.ts` to export components**

```ts
export {cn} from './lib/utils';
export {Button, buttonVariants} from './components/button';
export {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from './components/card';
export {Badge, badgeVariants} from './components/badge';
```

- [ ] **Step 5: Verify imports work from web app**

Create a temporary test — in `apps/web/app/page.tsx`, try importing:

```tsx
import {Button} from '@shory/ui';

export default function HomePage() {
  return (
    <main className="flex flex-1 items-center justify-center">
      <Button>Test</Button>
    </main>
  );
}
```

Run `pnpm --filter @shory/web dev` and confirm the page loads without errors. Then revert to the placeholder.

- [ ] **Step 6: Commit**

```bash
git add packages/ui/
git commit -m "feat: install shadcn button, card, badge into @shory/ui"
```

---

### Task 10: Build Landing Page — Navbar Component

**Files:**
- Create: `apps/web/components/layout/navbar.tsx`
- Modify: `apps/web/app/layout.tsx`

- [ ] **Step 1: Create `apps/web/components/layout/navbar.tsx`**

```tsx
import Link from 'next/link';
import {Button} from '@shory/ui';

const NAV_LINKS = [
  {label: 'Business Insurance', href: '#products'},
  {label: 'About', href: '#about'},
  {label: 'Help', href: '#help'},
] as const;

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-bold text-primary">
          Shory SME
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-text-muted hover:text-text transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Button
            asChild
            className="bg-primary text-white rounded-xl px-6 hover:opacity-80 transition-all duration-200"
          >
            <Link href="/quote/start">Start Quote</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Update `apps/web/app/layout.tsx` to include Navbar**

Replace the `<body>` contents:

```tsx
import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import {Navbar} from '@/components/layout/navbar';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Shory SME — Insurance for Your Business',
  description:
    'Compare and buy SME insurance in minutes. Top insurers, best prices.',
};

export default function RootLayout({
  children,
}: Readonly<{children: React.ReactNode}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Verify navbar renders**

```bash
pnpm --filter @shory/web dev
```

Open `http://localhost:3000`. Confirm:
- Logo "Shory SME" appears top-left
- Nav links visible on desktop
- "Start Quote" button visible top-right
- Sticky behavior on scroll

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/layout/navbar.tsx apps/web/app/layout.tsx
git commit -m "feat: add sticky navbar with shory design to web app"
```

---

### Task 11: Build Landing Page — Hero Section

**Files:**
- Create: `apps/web/components/landing/hero.tsx`
- Modify: `apps/web/app/page.tsx`

- [ ] **Step 1: Create `apps/web/components/landing/hero.tsx`**

```tsx
import Link from 'next/link';
import {Button} from '@shory/ui';

export function Hero() {
  return (
    <section className="py-16 sm:py-20 lg:py-28 text-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text tracking-tight">
          Get SME Insurance in Minutes
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-text-muted max-w-2xl mx-auto leading-relaxed">
          Compare quotes from top UAE insurers. Protect your business with
          property, liability, and workforce coverage — all in one place.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            size="lg"
            className="bg-primary text-white rounded-xl px-8 py-3 text-base font-medium hover:opacity-80 transition-all duration-200"
          >
            <Link href="/quote/start">Start Quote</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-xl px-8 py-3 text-base border-primary text-primary hover:bg-primary-light transition-all duration-200"
          >
            <Link href="#products">Explore Coverage</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Update `apps/web/app/page.tsx` to use Hero**

```tsx
import {Hero} from '@/components/landing/hero';

export default function HomePage() {
  return (
    <main className="flex-1">
      <Hero />
    </main>
  );
}
```

- [ ] **Step 3: Verify hero renders**

```bash
pnpm --filter @shory/web dev
```

Open `http://localhost:3000`. Confirm:
- Headline "Get SME Insurance in Minutes" visible above the fold
- Subheadline describing value proposition is displayed
- "Start Quote" CTA button is prominently visible without scrolling
- "Explore Coverage" secondary button visible
- Layout is responsive — check at mobile width (375px)

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/landing/hero.tsx apps/web/app/page.tsx
git commit -m "feat: add hero section with start quote CTA"
```

---

### Task 12: Build Landing Page — Product Cards Section

**Files:**
- Create: `apps/web/components/landing/product-cards.tsx`
- Modify: `apps/web/app/page.tsx`

- [ ] **Step 1: Create `apps/web/components/landing/product-cards.tsx`**

```tsx
import {Card, CardContent} from '@shory/ui';

const PRODUCTS = [
  {
    title: 'Property Insurance',
    description: 'Protect your office, warehouse, and business assets.',
    icon: '🏢',
  },
  {
    title: 'Liability Insurance',
    description: 'Cover third-party claims and legal costs.',
    icon: '🛡️',
  },
  {
    title: "Workers' Compensation",
    description: 'Mandatory coverage for your employees.',
    icon: '👷',
  },
  {
    title: 'Fleet Insurance',
    description: 'Insure your business vehicles under one policy.',
    icon: '🚛',
  },
  {
    title: 'Comprehensive',
    description: 'All-in-one coverage for complete protection.',
    icon: '✅',
  },
] as const;

export function ProductCards() {
  return (
    <section id="products" className="py-16 sm:py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-text text-center mb-12">
          Insurance for Every Business Need
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {PRODUCTS.map((product) => (
            <Card
              key={product.title}
              className="rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 text-center cursor-pointer group bg-white"
            >
              <CardContent className="flex flex-col items-center gap-4 p-6">
                <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-200">
                  {product.icon}
                </div>
                <h3 className="font-semibold text-text text-sm sm:text-base">
                  {product.title}
                </h3>
                <p className="text-text-muted text-xs sm:text-sm leading-relaxed">
                  {product.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add ProductCards to page**

```tsx
import {Hero} from '@/components/landing/hero';
import {ProductCards} from '@/components/landing/product-cards';

export default function HomePage() {
  return (
    <main className="flex-1">
      <Hero />
      <ProductCards />
    </main>
  );
}
```

- [ ] **Step 3: Verify product cards render**

Open `http://localhost:3000`. Confirm:
- 5 product cards in a grid
- Cards have hover shadow effect
- Icons scale up on hover
- Responsive: 2 cols on mobile, 3 on tablet, 5 on desktop

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/landing/product-cards.tsx apps/web/app/page.tsx
git commit -m "feat: add product cards section to landing page"
```

---

### Task 13: Build Landing Page — Trust Badges and Stats

**Files:**
- Create: `apps/web/components/landing/trust-badges.tsx`
- Create: `apps/web/components/landing/stats-section.tsx`
- Modify: `apps/web/app/page.tsx`

- [ ] **Step 1: Create `apps/web/components/landing/trust-badges.tsx`**

```tsx
import {Badge} from '@shory/ui';

export function TrustBadges() {
  return (
    <section className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
        <Badge
          variant="outline"
          className="rounded-full px-4 py-2 text-sm border-border text-text-muted"
        >
          Licensed by the Central Bank
        </Badge>
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 text-lg">★</span>
          <span className="text-sm font-medium text-text">4.9</span>
          <span className="text-sm text-text-muted">from 10,000+ reviews</span>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create `apps/web/components/landing/stats-section.tsx`**

```tsx
const STATS = [
  {value: '50B+', label: 'Worth of assets insured'},
  {value: '3B+', label: 'Worth of fleets insured'},
  {value: '#1', label: 'Insurance app in the UAE'},
] as const;

export function StatsSection() {
  return (
    <section className="py-12 border-y border-border bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
        {STATS.map((stat) => (
          <div key={stat.label}>
            <p className="text-3xl sm:text-4xl font-bold text-primary">
              {stat.value}
            </p>
            <p className="text-text-muted text-sm mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Add both to page**

```tsx
import {Hero} from '@/components/landing/hero';
import {ProductCards} from '@/components/landing/product-cards';
import {TrustBadges} from '@/components/landing/trust-badges';
import {StatsSection} from '@/components/landing/stats-section';

export default function HomePage() {
  return (
    <main className="flex-1">
      <Hero />
      <TrustBadges />
      <ProductCards />
      <StatsSection />
    </main>
  );
}
```

- [ ] **Step 4: Verify sections render**

Open `http://localhost:3000`. Confirm:
- Trust badges appear between hero and product cards
- Stats section shows 3 metrics in a row on desktop, stacked on mobile
- Numbers in primary blue, labels in muted text

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/landing/ apps/web/app/page.tsx
git commit -m "feat: add trust badges and stats sections to landing page"
```

---

### Task 14: Build Landing Page — Footer

**Files:**
- Create: `apps/web/components/layout/footer.tsx`
- Modify: `apps/web/app/layout.tsx`

- [ ] **Step 1: Create `apps/web/components/layout/footer.tsx`**

```tsx
import Link from 'next/link';

const FOOTER_LINKS = {
  Products: [
    {label: 'Property Insurance', href: '#'},
    {label: 'Liability Insurance', href: '#'},
    {label: "Workers' Compensation", href: '#'},
    {label: 'Fleet Insurance', href: '#'},
  ],
  Company: [
    {label: 'About Us', href: '#'},
    {label: 'Newsroom', href: '#'},
    {label: 'Careers', href: '#'},
  ],
  Support: [
    {label: 'Help Center', href: '#'},
    {label: 'Contact Us', href: '#'},
    {label: 'Legal', href: '#'},
  ],
} as const;

export function Footer() {
  return (
    <footer className="bg-text text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Shory SME</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Compare and buy SME insurance in the UAE. Top insurers, best
              prices.
            </p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold mb-4 uppercase tracking-wide">
                {category}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Shory. All rights reserved.
          </p>
          <p className="text-sm text-gray-400">
            Licensed by the Central Bank of the UAE
          </p>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Add Footer to layout**

Update `apps/web/app/layout.tsx` — add the Footer import and place it after `{children}`:

```tsx
import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import {Navbar} from '@/components/layout/navbar';
import {Footer} from '@/components/layout/footer';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Shory SME — Insurance for Your Business',
  description:
    'Compare and buy SME insurance in minutes. Top insurers, best prices.',
};

export default function RootLayout({
  children,
}: Readonly<{children: React.ReactNode}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Verify footer renders**

Open `http://localhost:3000`. Confirm:
- Dark footer at bottom of page
- 4-column grid on desktop, 2-column on mobile
- Links, copyright, and license text visible

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/layout/footer.tsx apps/web/app/layout.tsx
git commit -m "feat: add footer to web app layout"
```

---

### Task 15: Quote Journey Entry — Start Page with Progress Indicator

**Files:**
- Create: `apps/web/components/quote/progress-indicator.tsx`
- Create: `apps/web/app/quote/start/page.tsx`
- Create: `apps/web/app/quote/layout.tsx`

- [ ] **Step 1: Create `apps/web/components/quote/progress-indicator.tsx`**

```tsx
import {cn} from '@shory/ui';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const STEPS = ['Start', 'Details', 'Coverage', 'Review'] as const;

export function ProgressIndicator({
  currentStep,
  totalSteps,
}: ProgressIndicatorProps) {
  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="flex items-center justify-between">
        {STEPS.slice(0, totalSteps).map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <div key={step} className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200',
                    isCompleted && 'bg-primary text-white',
                    isActive && 'bg-primary text-white ring-4 ring-primary-light',
                    !isActive && !isCompleted && 'bg-surface text-text-muted border border-border',
                  )}
                >
                  {isCompleted ? '✓' : stepNumber}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium',
                    isActive ? 'text-primary' : 'text-text-muted',
                  )}
                >
                  {step}
                </span>
              </div>
              {index < totalSteps - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2 mb-5',
                    isCompleted ? 'bg-primary' : 'bg-border',
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `apps/web/app/quote/layout.tsx`**

```tsx
export default function QuoteLayout({
  children,
}: Readonly<{children: React.ReactNode}>) {
  return (
    <div className="flex-1 flex flex-col py-8">
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Create `apps/web/app/quote/start/page.tsx`**

```tsx
import Link from 'next/link';
import {Button} from '@shory/ui';
import {ProgressIndicator} from '@/components/quote/progress-indicator';

export default function QuoteStartPage() {
  return (
    <div className="flex flex-col items-center gap-12">
      <ProgressIndicator currentStep={1} totalSteps={4} />

      <div className="max-w-2xl mx-auto px-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-text">
          How would you like to start?
        </h1>
        <p className="mt-4 text-text-muted text-lg">
          Choose how you'd like to provide your business information.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto px-4 w-full">
        <Button
          asChild
          variant="outline"
          className="h-auto rounded-2xl p-8 flex flex-col items-center gap-4 border-2 hover:border-primary hover:bg-primary-light transition-all duration-200"
        >
          <Link href="/quote/details">
            <span className="text-3xl">📝</span>
            <span className="text-lg font-semibold text-text">Fill in Details</span>
            <span className="text-sm text-text-muted">
              Enter your business information manually
            </span>
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="h-auto rounded-2xl p-8 flex flex-col items-center gap-4 border-2 hover:border-primary hover:bg-primary-light transition-all duration-200"
        >
          <Link href="/quote/details">
            <span className="text-3xl">📄</span>
            <span className="text-lg font-semibold text-text">Upload Trade License</span>
            <span className="text-sm text-text-muted">
              We'll extract the details for you
            </span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify quote start page**

Open `http://localhost:3000/quote/start`. Confirm:
- Progress indicator shows Step 1 highlighted
- Two option cards displayed
- Clicking "Start Quote" on landing page navigates here
- Responsive on mobile — cards stack vertically

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/quote/ apps/web/app/quote/
git commit -m "feat: add quote journey entry page with progress indicator"
```

---

### Task 16: Final Verification — All Acceptance Criteria

**Files:**
- None — verification only

- [ ] **Step 1: Test TC-001 — Landing page loads with clear value proposition**

Open `http://localhost:3000`. Verify:
- Headline "Get SME Insurance in Minutes" is visible above the fold
- Subheadline describing value proposition is displayed
- "Start Quote" CTA button is prominently visible without scrolling

- [ ] **Step 2: Test TC-002 — Start Quote CTA navigates to input step**

Click the "Start Quote" button. Verify:
- User is navigated to `/quote/start`
- Progress indicator shows "Step 1"

- [ ] **Step 3: Test TC-003 — Landing page is mobile responsive**

Open Chrome DevTools, set viewport to 375x812 (iPhone). Verify:
- Layout adapts to screen size
- "Start Quote" CTA is fully visible and tappable
- No horizontal scrolling required

- [ ] **Step 4: Run production build**

```bash
pnpm build
```

Verify both apps build without errors.

- [ ] **Step 5: Commit any remaining fixes**

```bash
git add -A
git commit -m "chore: final verification and fixes for landing page"
```
