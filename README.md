# 🛡️ Shory SME Insurance Platform

Full-stack SME insurance platform with a customer-facing quote journey, internal admin portal, and REST API. Built as a monorepo with Next.js 16, Hono, and PostgreSQL.

> **Get insured in under 3 minutes.** Compare 12 UAE insurers, customize coverage, and purchase — all online.

---

## 📚 Documentation

### 🔧 Technical
- [System Architecture](docs/technical/architecture.md) — Apps, packages, data flow, deployment
- [Database Schema](docs/technical/database.md) — 27 tables across 6 domains
- [API Reference](docs/technical/api-reference.md) — 60+ REST endpoints with auth requirements
- [Web App Guide](docs/technical/web-app.md) — Quote journey, pricing engine, security
- [Admin App Guide](docs/technical/admin-app.md) — Operations dashboard, AI playbooks, platform health
- [Testing Guide](docs/technical/testing.md) — 65 Playwright E2E tests, type checking

### 📊 Business
- [Executive Summary](docs/business/Shory_Executive_Summary.md)
- [User Stories](docs/business/Shory_User_Stories_v2_Complete.md) — 54 stories across 20 epics
- [Demo Walkthrough](docs/business/Shory_Demo_Walkthrough_Guide.md)

---

## ⚡ Tech Stack

| Layer | Technology |
|-------|-----------|
| 🖥️ Frontend | **Next.js 16** · **React 19** · **Tailwind CSS v4** · **shadcn/ui** |
| 🔌 API | **Hono** (Vercel Serverless) |
| 🗄️ Database | **PostgreSQL** (Neon) · **Drizzle ORM** |
| ✅ Validation | **Zod** (shared frontend + backend) |
| 🔐 Auth | **Auth.js** (NextAuth v5) |
| 🤖 AI | **Claude API** (Anthropic) |
| 📄 PDF | **jsPDF** + **html2canvas** |
| 📦 Storage | **Vercel Blob** |
| 🧪 Testing | **Playwright** (65 E2E tests) |
| 🏗️ Tooling | **TypeScript** (strict) · **pnpm** · **Turborepo** |

---

## 📁 Project Structure

```
📦 shory-sme
├── 🌐 apps/web          Customer quote journey         (port 3000)
├── 🔒 apps/admin        Operations dashboard           (port 3001)
├── ⚙️ apps/backend      Hono REST API                  (port 3002)
├── 🗄️ packages/db       Drizzle schemas + migrations   (27 tables)
├── 🎨 packages/ui       shadcn/ui component library
├── 📐 packages/shared   Zod schemas + shared types
└── 🔧 tooling/          ESLint, TypeScript, Tailwind configs
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 20
- **pnpm** >= 9 — `npm install -g pnpm`
- **PostgreSQL** — [Neon](https://neon.tech) free tier works

### 1️⃣ Install

```bash
git clone <repo-url>
cd shory-sme
pnpm install
```

### 2️⃣ Configure

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|:--------:|-------------|
| `DATABASE_URL` | ✅ | Neon PostgreSQL connection string |
| `AUTH_SECRET` | ✅ | Auth.js secret (`npx auth secret`) |
| `AUTH_URL` | ✅ | Admin app URL (`http://localhost:3001`) |
| `NEXT_PUBLIC_API_URL` | ✅ | Backend URL (`http://localhost:3002`) |
| `ANTHROPIC_API_KEY` | ➖ | Claude API key (AI advisor) |
| `BLOB_READ_WRITE_TOKEN` | ➖ | Vercel Blob token (file uploads) |

### 3️⃣ Database

```bash
source .env && export DATABASE_URL
pnpm --filter @shory/db db:push    # Push schema
pnpm --filter @shory/db db:seed    # Seed demo data
```

### 4️⃣ Run

```bash
pnpm dev
```

| App | URL | Credentials |
|-----|-----|-------------|
| 🌐 Web | http://localhost:3000 | — (anonymous quote journey) |
| 🔒 Admin | http://localhost:3001 | `osman@shory.com` / `osman@shory.com` |
| ⚙️ API | http://localhost:3002 | — |

---

## 🗄️ Database Commands

| Command | Description |
|---------|-------------|
| `pnpm --filter @shory/db db:push` | 📤 Push schema changes |
| `pnpm --filter @shory/db db:generate` | 📝 Generate migration files |
| `pnpm --filter @shory/db db:migrate` | ▶️ Run migrations |
| `pnpm --filter @shory/db db:seed` | 🌱 Seed reference + demo data |
| `pnpm --filter @shory/db db:studio` | 🔍 Open Drizzle Studio |

---

## 🧪 Testing

```bash
# 🎭 E2E tests (65 tests across 11 scenarios)
cd apps/web/e2e && npx playwright test

# ✅ Type checking
cd apps/web && npx tsc --noEmit
cd apps/admin && npx tsc --noEmit
cd apps/backend && npx tsc --noEmit
```

---

## 🌍 Deployment

Three Vercel projects deploying from the monorepo:

| Project | Root Directory | Production |
|---------|---------------|------------|
| 🌐 Web | `apps/web` | `sme-business-web.vercel.app` |
| 🔒 Admin | `apps/admin` | `sme-business-admin.vercel.app` |
| ⚙️ Backend | `apps/backend` | `sme-business-backend.vercel.app` |

> Set `DATABASE_URL` and other env vars in each Vercel project's **Settings → Environment Variables**.

---

## 🔌 Key API Routes

| Route | Description |
|-------|-------------|
| `GET /api/health` | ❤️ Health check |
| `GET /api/catalog/*` | 📋 Business types, products, insurers |
| `POST /api/quotes` | 📝 Create quote |
| `POST /api/quotes/:id/submit` | 💰 Get pricing |
| `POST /api/admin/auth/login` | 🔐 Admin login |
| `GET /api/admin/customers` | 👥 Customer list |
| `GET /api/admin/stats` | 📊 Dashboard KPIs |

👉 Full reference: **[docs/technical/api-reference.md](docs/technical/api-reference.md)**

---

## 🏛️ License

Proprietary — Shory Insurance Technology © 2026
