# Shory SME Insurance Platform

SME insurance platform with a customer-facing quote journey and an internal admin portal.

## Tech Stack

- **Monorepo**: pnpm workspaces + Turborepo
- **Apps**: Next.js 16 (web + admin)
- **API**: Hono REST API
- **Database**: Drizzle ORM + Neon PostgreSQL
- **UI**: shadcn/ui + Tailwind CSS v4
- **Language**: TypeScript (strict)

## Project Structure

```
apps/
  web/          → Customer-facing quote journey (port 3000)
  admin/        → Internal admin dashboard (port 3001)
packages/
  api/          → Hono REST API (port 3002)
  db/           → Drizzle ORM schemas + migrations
  shared/       → Zod schemas + shared types
  ui/           → shadcn/ui component library
tooling/
  eslint/       → Shared ESLint config
  typescript/   → Shared TypeScript config
  tailwind/     → Shared Tailwind config
```

## Prerequisites

- **Node.js** >= 20
- **pnpm** >= 9 (`npm install -g pnpm`)
- A [Neon](https://neon.tech) PostgreSQL database (free tier works)

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd shory-sme
pnpm install
```

### 2. Set up environment variables

Copy the example and fill in your values:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string | `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require` |
| `AUTH_SECRET` | Auth.js secret (generate with `npx auth secret`) | `qJAJp...` |
| `AUTH_URL` | Admin app URL | `http://localhost:3001` |
| `NEXT_PUBLIC_ADMIN_URL` | Admin app URL (public) | `http://localhost:3001` |
| `NEXT_PUBLIC_API_URL` | API URL | `http://localhost:3002` |
| `ANTHROPIC_API_KEY` | Claude API key (for AI advisor) | `sk-ant-...` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token (for file uploads) | `vercel_blob_...` |

### 3. Set up the database

Push the schema to your Neon database:

```bash
DATABASE_URL="your-neon-connection-string" pnpm --filter @shory/db run db:push
```

Or run migrations (for fresh databases):

```bash
DATABASE_URL="your-neon-connection-string" pnpm --filter @shory/db run db:migrate
```

### 4. Seed the database

This creates the default admin user and all catalog data (business types, products, insurers, quote options):

```bash
DATABASE_URL="your-neon-connection-string" pnpm --filter @shory/db run db:seed
```

**Default admin credentials:**
- Email: `admin@shory.ae`
- Password: `admin123`

### 5. Run the dev servers

Start all three apps at once:

```bash
pnpm dev
```

Or start them individually:

```bash
pnpm web      # Customer app → http://localhost:3000
pnpm admin    # Admin portal → http://localhost:3001
pnpm api      # Hono API    → http://localhost:3002
```

## Database Commands

All database commands require `DATABASE_URL` to be set (either in `.env` or inline):

| Command | Description |
|---|---|
| `pnpm --filter @shory/db run db:push` | Push schema changes directly (no migration files) |
| `pnpm --filter @shory/db run db:generate` | Generate SQL migration files |
| `pnpm --filter @shory/db run db:migrate` | Run pending migrations |
| `pnpm --filter @shory/db run db:seed` | Seed reference data + admin user |
| `pnpm --filter @shory/db run db:studio` | Open Drizzle Studio (visual DB browser) |

## Viewing the Database

**Drizzle Studio** (recommended for quick checks):
```bash
DATABASE_URL="your-neon-connection-string" pnpm --filter @shory/db run db:studio
```

**DBeaver:**
1. New Connection -> PostgreSQL
2. Host: `<endpoint>.neon.tech`, Port: `5432`
3. Database: `neondb`, Username/Password from your connection string
4. SSL tab -> check "Use SSL", mode = `require`

**Neon Console:** [console.neon.tech](https://console.neon.tech) -> Tables tab

## Build

```bash
pnpm build
```

## API Endpoints

The API runs at `http://localhost:3002/api`. Key routes:

| Route | Description |
|---|---|
| `GET /api/health` | Health check |
| `GET /api/catalog/business-types` | List business types |
| `GET /api/catalog/products` | List insurance products |
| `GET /api/catalog/insurers` | List insurers |
| `GET /api/catalog/quote-options` | Get all quote form options |
| `POST /api/quotes` | Create a draft quote |
| `POST /api/quotes/:id/submit` | Submit quote for pricing |
| `GET /api/quotes/:id/results` | Get pricing results |
| `POST /api/quotes/:id/accept` | Accept a quote -> create policy |
| `POST /api/uploads` | Upload trade license document |
| `POST /api/ai/recommend` | Get AI coverage recommendations |

## Deployment

Three separate Vercel projects:

- **web** -> `apps/web`
- **admin** -> `apps/admin`
- **api** -> `packages/api`

Set `DATABASE_URL` and other env vars in each Vercel project's Settings -> Environment Variables.
