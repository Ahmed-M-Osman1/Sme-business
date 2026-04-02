# Backend Seed & Catalog API — Move Static Data to Backend

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add DB setup docs to root, create a seed file for admin users and catalog data, add new DB tables for business types/products/insurers/quote options, expose them via API endpoints, and update the web app to fetch from the API instead of static JSON files.

**Architecture:** New catalog tables in `@shory/db` → new `/catalog` routes in `packages/api` → web app fetches via `api-client.ts`. Seed script in `packages/db/src/seed.ts` populates all reference data + default admin user.

**Tech Stack:** Drizzle ORM, Hono, Neon PostgreSQL, pnpm

---

### Task 1: Add DATABASE.md to project root

**Files:**
- Create: `DATABASE.md`

- [ ] **Step 1: Create DATABASE.md**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add DATABASE.md
git commit -m "docs: add DATABASE.md with Neon setup and Drizzle commands"
```

---

### Task 2: Add catalog DB schema tables

**Files:**
- Create: `packages/db/src/schema/business-types.ts`
- Create: `packages/db/src/schema/products.ts`
- Create: `packages/db/src/schema/insurers.ts`
- Create: `packages/db/src/schema/quote-options.ts`
- Modify: `packages/db/src/index.ts`

- [ ] **Step 1: Create business-types schema**

Create `packages/db/src/schema/business-types.ts`:

```typescript
import {pgEnum, pgTable, text, uuid, real, timestamp, jsonb} from 'drizzle-orm/pg-core';

export const riskLevelEnum = pgEnum('risk_level', ['low', 'medium', 'high']);

export const businessTypes = pgTable('business_types', {
  id: text('id').primaryKey(), // e.g. 'cafe-restaurant'
  title: text('title').notNull(),
  description: text('description').notNull(),
  icon: text('icon').notNull(),
  riskLevel: riskLevelEnum('risk_level').notNull(),
  riskFactor: real('risk_factor').notNull(),
  products: jsonb('products').$type<string[]>().notNull(), // product IDs
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type BusinessType = typeof businessTypes.$inferSelect;
export type NewBusinessType = typeof businessTypes.$inferInsert;
```

- [ ] **Step 2: Create products schema**

Create `packages/db/src/schema/products.ts`:

```typescript
import {pgTable, text, integer, timestamp} from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id: text('id').primaryKey(), // e.g. 'workers-comp'
  name: text('name').notNull(),
  shortName: text('short_name').notNull(),
  icon: text('icon').notNull(),
  basePrice: integer('base_price').notNull(), // AED
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
```

- [ ] **Step 3: Create insurers schema**

Create `packages/db/src/schema/insurers.ts`:

```typescript
import {boolean, pgTable, text, real, integer, timestamp} from 'drizzle-orm/pg-core';

export const insurers = pgTable('insurers', {
  id: text('id').primaryKey(), // e.g. 'salama'
  name: text('name').notNull(),
  logo: text('logo').notNull(),
  rating: real('rating').notNull(),
  reviewCount: integer('review_count').notNull(),
  shariahCompliant: boolean('shariah_compliant').default(false).notNull(),
  priceMultiplier: real('price_multiplier').default(1.0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Insurer = typeof insurers.$inferSelect;
export type NewInsurer = typeof insurers.$inferInsert;
```

- [ ] **Step 4: Create quote-options schema**

Create `packages/db/src/schema/quote-options.ts`:

```typescript
import {pgTable, text, integer, jsonb, timestamp} from 'drizzle-orm/pg-core';

export const quoteOptions = pgTable('quote_options', {
  id: text('id').primaryKey(), // e.g. 'employee-bands', 'revenue-bands', 'emirates'
  category: text('category').notNull(), // grouping key
  items: jsonb('items').notNull(), // flexible JSON array
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type QuoteOption = typeof quoteOptions.$inferSelect;
export type NewQuoteOption = typeof quoteOptions.$inferInsert;
```

- [ ] **Step 5: Update packages/db/src/index.ts to export new schemas**

Add to existing exports in `packages/db/src/index.ts`:

```typescript
export {riskLevelEnum, businessTypes} from './schema/business-types';
export type {BusinessType, NewBusinessType} from './schema/business-types';

export {products} from './schema/products';
export type {Product, NewProduct} from './schema/products';

export {insurers} from './schema/insurers';
export type {Insurer, NewInsurer} from './schema/insurers';

export {quoteOptions} from './schema/quote-options';
export type {QuoteOption, NewQuoteOption} from './schema/quote-options';
```

- [ ] **Step 6: Push schema to database**

```bash
DATABASE_URL="postgresql://neondb_owner:npg_PCuYfFqz21ZB@ep-steep-flower-al0igj2f.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require" pnpm --filter @shory/db run db:push
```

Expected: `Changes applied` with 4 new tables created.

- [ ] **Step 7: Commit**

```bash
git add packages/db/src/schema/business-types.ts packages/db/src/schema/products.ts packages/db/src/schema/insurers.ts packages/db/src/schema/quote-options.ts packages/db/src/index.ts
git commit -m "feat(db): add catalog tables for business types, products, insurers, quote options"
```

---

### Task 3: Create seed script

**Files:**
- Create: `packages/db/src/seed.ts`
- Modify: `packages/db/package.json` (add `db:seed` script)

- [ ] **Step 1: Create seed script**

Create `packages/db/src/seed.ts`:

```typescript
import {db} from './client';
import {adminUsers} from './schema/admin-users';
import {businessTypes} from './schema/business-types';
import {products} from './schema/products';
import {insurers} from './schema/insurers';
import {quoteOptions} from './schema/quote-options';
import {createHash} from 'node:crypto';

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

async function seed() {
  console.log('🌱 Seeding database...');

  // --- Admin user ---
  await db
    .insert(adminUsers)
    .values({
      email: 'admin@shory.ae',
      name: 'Shory Admin',
      passwordHash: hashPassword('admin123'),
      role: 'admin',
    })
    .onConflictDoNothing();
  console.log('✓ Admin user');

  // --- Business Types ---
  await db
    .insert(businessTypes)
    .values([
      {id: 'cafe-restaurant', title: 'Café / Restaurant', description: 'Coffee shops, restaurants, takeaways, catering', icon: '☕', riskLevel: 'medium', riskFactor: 1.4, products: ['workers-comp', 'public-liability', 'property']},
      {id: 'law-firm', title: 'Law Firm / Legal', description: 'Legal advice, litigation, contract review', icon: '⚖️', riskLevel: 'medium', riskFactor: 1.4, products: ['workers-comp', 'public-liability', 'professional-indemnity']},
      {id: 'retail-trading', title: 'Retail / Trading', description: 'Shops, trading companies, wholesale, e-commerce', icon: '🛒', riskLevel: 'medium', riskFactor: 1.4, products: ['workers-comp', 'public-liability', 'property']},
      {id: 'it-technology', title: 'IT / Technology', description: 'Software, SaaS, IT consulting, digital agencies', icon: '💻', riskLevel: 'low', riskFactor: 1.0, products: ['workers-comp', 'professional-indemnity']},
      {id: 'construction', title: 'Construction / Contracting', description: 'Building, fit-out, MEP, civil works, maintenance', icon: '🏗️', riskLevel: 'high', riskFactor: 1.8, products: ['workers-comp', 'public-liability', 'property', 'professional-indemnity']},
      {id: 'healthcare', title: 'Healthcare / Clinic', description: 'Medical clinics, pharmacies, wellness centres', icon: '🏥', riskLevel: 'high', riskFactor: 1.8, products: ['workers-comp', 'public-liability', 'professional-indemnity', 'property']},
      {id: 'consulting', title: 'Consulting / Advisory', description: 'Management consulting, financial advisory', icon: '💼', riskLevel: 'medium', riskFactor: 1.4, products: ['workers-comp', 'public-liability', 'professional-indemnity']},
      {id: 'general-trading', title: 'General Trading', description: 'Import/export, general merchandise', icon: '📦', riskLevel: 'medium', riskFactor: 1.4, products: ['workers-comp', 'public-liability', 'property']},
      {id: 'logistics', title: 'Logistics / Transport', description: 'Freight, last-mile delivery, warehousing, couriers', icon: '🚛', riskLevel: 'high', riskFactor: 1.8, products: ['workers-comp', 'property', 'fleet']},
      {id: 'real-estate', title: 'Real Estate', description: 'Property brokerage, development, property management', icon: '🏢', riskLevel: 'medium', riskFactor: 1.4, products: ['workers-comp', 'public-liability', 'professional-indemnity']},
    ])
    .onConflictDoNothing();
  console.log('✓ Business types');

  // --- Products ---
  await db
    .insert(products)
    .values([
      {id: 'workers-comp', name: 'Workers Compensation', shortName: 'Workers', icon: '👷', basePrice: 400},
      {id: 'public-liability', name: 'Public Liability', shortName: 'Public', icon: '🤝', basePrice: 500},
      {id: 'professional-indemnity', name: 'Professional Indemnity', shortName: 'Professional', icon: '📋', basePrice: 600},
      {id: 'property', name: 'Property Insurance', shortName: 'Property', icon: '🏢', basePrice: 700},
      {id: 'fleet', name: 'Fleet Insurance', shortName: 'Fleet', icon: '🚛', basePrice: 800},
    ])
    .onConflictDoNothing();
  console.log('✓ Products');

  // --- Insurers ---
  await db
    .insert(insurers)
    .values([
      {id: 'salama', name: 'Salama Insurance', logo: '/insurers/Salama.png', rating: 4.3, reviewCount: 512, shariahCompliant: true, priceMultiplier: 1.0},
      {id: 'watania', name: 'Watania Takaful', logo: '/insurers/Watania.png', rating: 4.4, reviewCount: 634, shariahCompliant: true, priceMultiplier: 1.023},
      {id: 'yas-takaful', name: 'YAS Takaful', logo: '/insurers/YASTakaful.png', rating: 4.1, reviewCount: 530, shariahCompliant: true, priceMultiplier: 1.045},
      {id: 'sukoon', name: 'Sukoon Insurance', logo: '/insurers/SukoonInsurance.png', rating: 4.5, reviewCount: 781, shariahCompliant: false, priceMultiplier: 1.057},
      {id: 'afnic', name: 'AFNIC', logo: '/insurers/AFNIC.png', rating: 3.8, reviewCount: 440, shariahCompliant: false, priceMultiplier: 1.09},
      {id: 'dubai-insurance', name: 'Dubai Insurance', logo: '/insurers/DubaiInsurance.png', rating: 4.0, reviewCount: 750, shariahCompliant: false, priceMultiplier: 1.12},
      {id: 'qic', name: 'QIC', logo: '/insurers/QIC.png', rating: 4.1, reviewCount: 920, shariahCompliant: false, priceMultiplier: 1.15},
      {id: 'adnic', name: 'ADNIC', logo: '/insurers/ADNIC.png', rating: 4.4, reviewCount: 1870, shariahCompliant: false, priceMultiplier: 1.18},
      {id: 'orient', name: 'Orient Insurance', logo: '/insurers/ORIENT.png', rating: 4.7, reviewCount: 1105, shariahCompliant: false, priceMultiplier: 1.218},
      {id: 'orient-takaful', name: 'Orient Takaful', logo: '/insurers/OrientTakaful.png', rating: 4.2, reviewCount: 780, shariahCompliant: true, priceMultiplier: 1.25},
      {id: 'al-ain-ahlia', name: 'Al Ain Ahlia', logo: '/insurers/AlAinAhlia.png', rating: 4.0, reviewCount: 680, shariahCompliant: false, priceMultiplier: 1.28},
      {id: 'insurance-house', name: 'Insurance House', logo: '/insurers/InsuranceHouse.png', rating: 3.9, reviewCount: 620, shariahCompliant: false, priceMultiplier: 1.32},
    ])
    .onConflictDoNothing();
  console.log('✓ Insurers');

  // --- Quote Options ---
  await db
    .insert(quoteOptions)
    .values([
      {
        id: 'employee-bands',
        category: 'quote-form',
        items: [
          {label: 'Just me', value: '1'},
          {label: '2–5', value: '2-5'},
          {label: '6–20', value: '6-20'},
          {label: '21–50', value: '21-50'},
          {label: '51–100', value: '51-100'},
          {label: '100+', value: '100+'},
        ],
      },
      {
        id: 'revenue-bands',
        category: 'quote-form',
        items: [
          {label: 'Under AED 500,000', value: 'under-500k'},
          {label: 'AED 500K – 1 million', value: '500k-1m'},
          {label: 'AED 1M – 5 million', value: '1m-5m'},
          {label: 'AED 5M – 10 million', value: '5m-10m'},
          {label: 'Over AED 10 million', value: 'over-10m'},
        ],
      },
      {
        id: 'emirates',
        category: 'location',
        items: ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'],
      },
      {
        id: 'coverage-areas',
        category: 'quote-form',
        items: [
          {label: 'UAE only', value: 'uae'},
          {label: 'GCC', value: 'gcc'},
          {label: 'Worldwide', value: 'worldwide'},
        ],
      },
      {
        id: 'high-value-assets',
        category: 'quote-form',
        items: [
          {id: 'stock', label: 'Stock / inventory', icon: '📦', description: 'Current retail stock at cost price'},
          {id: 'fixtures', label: 'Fixtures & fit-out', icon: '🪟', description: 'Display shelving, counters, lighting'},
          {id: 'pos', label: 'POS & payment systems', icon: '💳', description: 'Terminals, tablets, cash registers'},
          {id: 'security', label: 'Security / CCTV systems', icon: '📷', description: 'Cameras, access control, alarms'},
          {id: 'safe', label: 'Safe / cash handling', icon: '🔒', description: 'Safes, cash counters'},
        ],
      },
      {
        id: 'coverage-limits',
        category: 'pricing',
        items: [
          {label: 'AED 1M', value: '1M', multiplier: 1.0},
          {label: 'AED 2M', value: '2M', multiplier: 1.4},
          {label: 'AED 5M', value: '5M', multiplier: 2.0},
        ],
      },
      {
        id: 'size-factors',
        category: 'pricing',
        items: [
          {band: '1', factor: 1.0},
          {band: '2-5', factor: 1.1},
          {band: '6-20', factor: 1.2},
          {band: '21-50', factor: 1.3},
          {band: '51-100', factor: 1.5},
          {band: '100+', factor: 1.6},
        ],
      },
      {
        id: 'activities',
        category: 'company-details',
        items: [
          'Technology', 'Trading', 'Manufacturing', 'Construction', 'Healthcare',
          'Hospitality', 'Retail', 'Professional Services', 'Transport & Logistics',
          'Food & Beverage', 'Beauty Services', 'Education', 'Real Estate',
          'Financial Services', 'Media & Advertising', 'Other',
        ],
      },
    ])
    .onConflictDoNothing();
  console.log('✓ Quote options');

  console.log('\n✅ Seed complete!');
  process.exit(0);
}

seed().catch((e) => {
  console.error('❌ Seed failed:', e);
  process.exit(1);
});
```

- [ ] **Step 2: Add db:seed script to package.json**

In `packages/db/package.json`, add to `scripts`:

```json
"db:seed": "tsx src/seed.ts"
```

Also add `tsx` to devDependencies if not present:

```json
"tsx": "^4"
```

- [ ] **Step 3: Install tsx and run seed**

```bash
pnpm --filter @shory/db install
DATABASE_URL="postgresql://neondb_owner:npg_PCuYfFqz21ZB@ep-steep-flower-al0igj2f.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require" pnpm --filter @shory/db run db:seed
```

Expected output:
```
🌱 Seeding database...
✓ Admin user
✓ Business types
✓ Products
✓ Insurers
✓ Quote options

✅ Seed complete!
```

- [ ] **Step 4: Commit**

```bash
git add packages/db/src/seed.ts packages/db/package.json pnpm-lock.yaml
git commit -m "feat(db): add seed script with admin user and catalog data"
```

---

### Task 4: Add catalog API routes

**Files:**
- Create: `packages/api/src/routes/catalog.ts`
- Modify: `packages/api/src/index.ts`

- [ ] **Step 1: Create catalog router**

Create `packages/api/src/routes/catalog.ts`:

```typescript
import {Hono} from 'hono';
import {db, businessTypes, products, insurers, quoteOptions} from '@shory/db';
import {eq} from 'drizzle-orm';

export const catalogRouter = new Hono();

// GET /catalog/business-types
catalogRouter.get('/business-types', async (c) => {
  const rows = await db.select().from(businessTypes);
  return c.json(rows);
});

// GET /catalog/business-types/:id
catalogRouter.get('/business-types/:id', async (c) => {
  const id = c.req.param('id');
  const [row] = await db.select().from(businessTypes).where(eq(businessTypes.id, id));
  if (!row) return c.json({error: {code: 'NOT_FOUND', message: `Business type ${id} not found`}}, 404);
  return c.json(row);
});

// GET /catalog/products
catalogRouter.get('/products', async (c) => {
  const rows = await db.select().from(products);
  return c.json(rows);
});

// GET /catalog/insurers
catalogRouter.get('/insurers', async (c) => {
  const rows = await db.select().from(insurers);
  return c.json(rows);
});

// GET /catalog/quote-options
catalogRouter.get('/quote-options', async (c) => {
  const rows = await db.select().from(quoteOptions);
  // Return as a keyed object for convenience
  const result: Record<string, unknown> = {};
  for (const row of rows) {
    result[row.id] = row.items;
  }
  return c.json(result);
});

// GET /catalog/quote-options/:id
catalogRouter.get('/quote-options/:id', async (c) => {
  const id = c.req.param('id');
  const [row] = await db.select().from(quoteOptions).where(eq(quoteOptions.id, id));
  if (!row) return c.json({error: {code: 'NOT_FOUND', message: `Option ${id} not found`}}, 404);
  return c.json(row.items);
});
```

- [ ] **Step 2: Register catalog router in API index**

In `packages/api/src/index.ts`, add:

```typescript
import {catalogRouter} from './routes/catalog';
```

And register the route:

```typescript
app.route('/catalog', catalogRouter);
```

(Add it after the existing `app.route('/admin', adminRouter);` line.)

- [ ] **Step 3: Commit**

```bash
git add packages/api/src/routes/catalog.ts packages/api/src/index.ts
git commit -m "feat(api): add /catalog endpoints for business types, products, insurers, quote options"
```

---

### Task 5: Update web app api-client to use catalog endpoints

**Files:**
- Modify: `apps/web/lib/api-client.ts`

- [ ] **Step 1: Add catalog methods to api-client**

Add a `catalog` section to the `api` object in `apps/web/lib/api-client.ts`:

```typescript
catalog: {
  businessTypes: () => fetchApi<Array<{
    id: string; title: string; description: string; icon: string;
    riskLevel: string; riskFactor: number; products: string[];
  }>>('/catalog/business-types'),

  businessType: (id: string) => fetchApi<{
    id: string; title: string; description: string; icon: string;
    riskLevel: string; riskFactor: number; products: string[];
  }>(`/catalog/business-types/${id}`),

  products: () => fetchApi<Array<{
    id: string; name: string; shortName: string; icon: string; basePrice: number;
  }>>('/catalog/products'),

  insurers: () => fetchApi<Array<{
    id: string; name: string; logo: string; rating: number;
    reviewCount: number; shariahCompliant: boolean; priceMultiplier: number;
  }>>('/catalog/insurers'),

  quoteOptions: () => fetchApi<Record<string, unknown>>('/catalog/quote-options'),

  quoteOption: (id: string) => fetchApi<unknown>(`/catalog/quote-options/${id}`),
},
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/lib/api-client.ts
git commit -m "feat(web): add catalog API client methods"
```

---

### Task 6: Update web app pages to fetch from API

**Files:**
- Modify: `apps/web/app/quote/business-type/page.tsx` — fetch business types from API
- Modify: `apps/web/components/quote/business-type-detail.tsx` — fetch options from API
- Modify: `apps/web/components/quote/quote-results.tsx` — fetch insurers from API
- Modify: `apps/web/components/quote/company-details-fields.tsx` — fetch emirates/activities from API
- Modify: `apps/web/lib/pricing.ts` — fetch products and pricing factors from API

This task is **component-by-component**. For each component:
1. Replace the static JSON import with a `useEffect` + `useState` that calls `api.catalog.*`
2. Add a loading state
3. Remove the static JSON import

**Key pattern** (use in each component):

```typescript
const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  api.catalog.businessTypes()
    .then(setBusinessTypes)
    .catch(console.error)
    .finally(() => setLoading(false));
}, []);
```

- [ ] **Step 1: Update business-type page** — Replace `import businessTypes from '@/config/business-types.json'` with API fetch
- [ ] **Step 2: Update business-type-detail** — Replace hardcoded EMPLOYEE_OPTIONS, REVENUE_OPTIONS, EMIRATES, COVERAGE_AREAS, ASSET_TYPES with API fetch from quote-options
- [ ] **Step 3: Update quote-results** — Replace `import insurers from '@/config/insurers.json'` with API fetch
- [ ] **Step 4: Update company-details-fields** — Replace hardcoded EMIRATES and ACTIVITIES arrays with API fetch
- [ ] **Step 5: Update pricing.ts** — Replace `import products from '@/config/products.json'` and hardcoded multipliers with functions that accept data as parameters (data fetched by caller)
- [ ] **Step 6: Remove static config files** — Delete `apps/web/config/business-types.json`, `apps/web/config/products.json`, `apps/web/config/insurers.json`, `apps/web/config/quote-options.json`
- [ ] **Step 7: Verify build passes**

```bash
npx turbo run build --filter=@shory/web
```

- [ ] **Step 8: Commit**

```bash
git add apps/web/
git commit -m "feat(web): replace static config with catalog API calls"
```

---

### Task 7: Verify full build

- [ ] **Step 1: Run full turbo build**

```bash
npx turbo run build
```

Expected: All 3 builds pass (web, admin, api).

- [ ] **Step 2: Final commit if any fixes needed**
