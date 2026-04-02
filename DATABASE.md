# Database Setup

## Cloud (Neon — used for both local dev and production)

This project uses [Neon](https://neon.tech) PostgreSQL.

**Connection string format:**
```
postgresql://<user>:<password>@<host>.neon.tech/<database>?sslmode=require
```

### Environment Variables

Set `DATABASE_URL` in:
- **Root `.env`** — used by Next.js apps and API
- **Vercel** — Settings → Environment Variables (for each project: web, admin, api)

### Drizzle Commands

All commands run from `packages/db/`:

```bash
# Push schema changes to database (no migration files)
DATABASE_URL="your-neon-url" pnpm --filter @shory/db run db:push

# Open Drizzle Studio (visual DB browser)
DATABASE_URL="your-neon-url" pnpm --filter @shory/db run db:studio

# Generate migration files
DATABASE_URL="your-neon-url" pnpm --filter @shory/db run db:generate

# Run migrations
DATABASE_URL="your-neon-url" pnpm --filter @shory/db run db:migrate
```

### Seed Data

```bash
DATABASE_URL="your-neon-url" pnpm --filter @shory/db run db:seed
```

Seeds: admin user, business types, products, insurers, quote options.

### Viewing the Database

**DBeaver:**
1. New Connection → PostgreSQL
2. Host: `<endpoint>.neon.tech`, Port: `5432`
3. Database: `neondb`, Username/Password from connection string
4. SSL tab → check "Use SSL", mode = `require`

**Drizzle Studio:** `pnpm --filter @shory/db run db:studio`

**Neon Console:** [console.neon.tech](https://console.neon.tech) → Tables tab
