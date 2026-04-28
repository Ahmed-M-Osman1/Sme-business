# TAMM URL Routing & Quote Results Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Switch brand detection from env var to URL path prefix (`/tamm/...`) and redesign the TAMM quote results page with a sidebar stepper, TAMM-styled quote cards, and filter bar.

**Architecture:** URL prefix `/tamm/` routes live under `apps/web/app/tamm/` with a layout that sets brand context via React context. TAMM pages are thin wrappers importing shared components. New TAMM-specific UI components (stepper, quote card, filter bar) render only in TAMM context. Shory is unchanged.

**Tech Stack:** Next.js 16 (app router), React 19, Tailwind CSS v4, TypeScript strict

**Design spec:** `docs/superpowers/specs/2026-04-14-tamm-quote-results-redesign.md`

---

## Task 1: Brand Context Provider

**Files:**
- Create: `apps/web/lib/brand/context.tsx`
- Modify: `apps/web/lib/brand/types.ts`
- Modify: `apps/web/lib/brand/shory.ts`
- Modify: `apps/web/lib/brand/tamm.ts`
- Modify: `apps/web/lib/brand/index.ts`

- [ ] **Step 1: Add `basePath` to BrandConfig**

In `apps/web/lib/brand/types.ts`, add after `issuingAuthorities: string[];` (line 81):

```typescript
  basePath: string;
```

- [ ] **Step 2: Add `basePath` to brand configs**

In `apps/web/lib/brand/shory.ts`, add after `issuingAuthorities` line:
```typescript
  basePath: '',
```

In `apps/web/lib/brand/tamm.ts`, add after `issuingAuthorities` line:
```typescript
  basePath: '/tamm',
```

- [ ] **Step 3: Create BrandProvider context**

Create `apps/web/lib/brand/context.tsx`:

```tsx
'use client';

import {createContext, useContext} from 'react';
import type {BrandConfig} from './types';
import {shoryBrand} from './shory';

const BrandContext = createContext<BrandConfig>(shoryBrand);

export function BrandProvider({
  brand,
  children,
}: {
  brand: BrandConfig;
  children: React.ReactNode;
}) {
  return <BrandContext.Provider value={brand}>{children}</BrandContext.Provider>;
}

export function useBrand(): BrandConfig {
  return useContext(BrandContext);
}
```

- [ ] **Step 4: Update `index.ts` — keep `getBrand()` for server components, export context**

Replace `apps/web/lib/brand/index.ts`:

```typescript
import type {BrandConfig, BrandId} from './types';
import {shoryBrand} from './shory';
import {tammBrand} from './tamm';

export const BRANDS: Record<BrandId, BrandConfig> = {
  shory: shoryBrand,
  tamm: tammBrand,
};

/** Server-side brand resolution — reads from a passed brand ID */
export function getBrandById(id: BrandId): BrandConfig {
  return BRANDS[id] ?? shoryBrand;
}

/** Legacy: resolves brand from env var. Prefer useBrand() in client components. */
export function getBrand(): BrandConfig {
  const env = process.env.NEXT_PUBLIC_BRAND;
  if (env === 'tamm') return tammBrand;
  return shoryBrand;
}

export function isTamm(): boolean {
  return process.env.NEXT_PUBLIC_BRAND === 'tamm';
}

export {BrandProvider, useBrand} from './context';
export type {
  BrandConfig,
  BrandId,
  LocationOption,
  TrustBadge,
  LegalReferences,
  UaePassMockData,
  ComplianceItem,
} from './types';
```

Note: We keep `getBrand()` working (via env var fallback) so existing server components don't break during migration. Client components will migrate to `useBrand()`.

- [ ] **Step 5: Verify TypeScript compiles**

Run: `cd apps/web && pnpm exec tsc --noEmit`

- [ ] **Step 6: Commit**

```bash
git add apps/web/lib/brand/
git commit -m "feat: add BrandProvider context and basePath to brand config"
```

---

## Task 2: Root Layout — Wire Up BrandProvider

**Files:**
- Modify: `apps/web/app/layout.tsx`

- [ ] **Step 1: Update root layout to wrap with BrandProvider**

The root layout currently calls `getBrand()` at module scope. Update it to wrap children with `BrandProvider` defaulting to Shory:

```typescript
import {BrandProvider} from '@/lib/brand';
import {shoryBrand} from '@/lib/brand/shory';
```

In the `RootLayout` function, wrap the body content:

```tsx
<BrandProvider brand={shoryBrand}>
  <I18nProvider>
    <Navbar />
    {children}
    <Footer />
  </I18nProvider>
</BrandProvider>
```

Keep the existing `getBrand()` call at module scope for metadata — that's server-side and fine.

- [ ] **Step 2: Verify build**

Run: `cd apps/web && pnpm exec tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/layout.tsx
git commit -m "feat: wrap root layout with BrandProvider (default Shory)"
```

---

## Task 3: TAMM Route Group with Layout

**Files:**
- Create: `apps/web/app/tamm/layout.tsx`
- Move: `apps/web/app/tamm-entry/page.tsx` → `apps/web/app/tamm/page.tsx`

- [ ] **Step 1: Create TAMM layout**

Create `apps/web/app/tamm/layout.tsx`:

```tsx
import {tammBrand} from '@/lib/brand/tamm';
import {BrandProvider} from '@/lib/brand';
import {Navbar} from '@/components/layout/navbar';
import {Footer} from '@/components/layout/footer';

export const metadata = {
  title: tammBrand.metadata.title,
  description: tammBrand.metadata.description,
};

export default function TammLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BrandProvider brand={tammBrand}>
      {children}
    </BrandProvider>
  );
}
```

Note: The TAMM layout overrides the BrandProvider set by root layout. Since it nests inside root layout, the inner provider wins. Navbar/Footer are already rendered by root layout and will read from context — however they currently use `getBrand()` not `useBrand()`. We'll migrate them in Task 4.

- [ ] **Step 2: Move TAMM entry page**

```bash
mv apps/web/app/tamm-entry/page.tsx apps/web/app/tamm/page.tsx
```

Update any self-referencing links in the file from `/tamm-entry` to `/tamm`.

- [ ] **Step 3: Verify build**

Run: `cd apps/web && pnpm exec tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/tamm/ apps/web/app/tamm-entry/
git commit -m "feat: add TAMM route group layout, move entry page to /tamm"
```

---

## Task 4: Migrate Client Components from getBrand() to useBrand()

**Files:**
- Modify: 18 files that import `getBrand` from `@/lib/brand`

All client components (`'use client'`) that call `getBrand()` must switch to `useBrand()`. Server components can keep `getBrand()`.

- [ ] **Step 1: Migrate navbar.tsx**

In `apps/web/components/layout/navbar.tsx`:
- Replace `import {getBrand} from '@/lib/brand'` with `import {useBrand} from '@/lib/brand'`
- Replace `const brand = getBrand();` with `const brand = useBrand();`

- [ ] **Step 2: Migrate footer.tsx**

Same pattern in `apps/web/components/layout/footer.tsx`.

- [ ] **Step 3: Migrate all other client components**

Apply the same `getBrand()` → `useBrand()` replacement in all `'use client'` files:
- `apps/web/components/landing/hero.tsx`
- `apps/web/components/landing/trust-badges.tsx`
- `apps/web/app/quote/start/page.tsx`
- `apps/web/app/quote/ai-advisor/page.tsx`
- `apps/web/app/quote/upload/page.tsx`
- `apps/web/app/quote/manual/page.tsx` (if it uses getBrand)
- `apps/web/components/quote/quote-results.tsx`
- `apps/web/components/quote/company-details.tsx`
- `apps/web/components/quote/company-details-fields.tsx`
- `apps/web/components/quote/checkout.tsx`
- `apps/web/components/quote/confirmation.tsx`
- `apps/web/components/quote/business-type-detail.tsx`
- `apps/web/components/quote/manual-step2.tsx`
- `apps/web/lib/api-client.ts`
- `apps/web/lib/mock-ocr.ts`
- `apps/web/app/tamm/page.tsx`

For files that are NOT client components (no `'use client'`), keep `getBrand()`.

For `api-client.ts` and `mock-ocr.ts` — these are utility modules, not React components, so they can't use hooks. Keep `getBrand()` for now (env var fallback still works). Alternatively, have callers pass brand in.

- [ ] **Step 4: Verify TypeScript compiles**

Run: `cd apps/web && pnpm exec tsc --noEmit`

- [ ] **Step 5: Commit**

```bash
git add apps/web/
git commit -m "refactor: migrate client components from getBrand() to useBrand() hook"
```

---

## Task 5: TAMM Quote Page Wrappers

**Files:**
- Create: `apps/web/app/tamm/quote/start/page.tsx`
- Create: `apps/web/app/tamm/quote/ai-advisor/page.tsx`
- Create: `apps/web/app/tamm/quote/results/page.tsx`
- Create: `apps/web/app/tamm/quote/company-details/page.tsx`
- Create: `apps/web/app/tamm/quote/checkout/page.tsx`
- Create: `apps/web/app/tamm/quote/confirmation/page.tsx`
- Create: `apps/web/app/tamm/quote/manual/page.tsx`
- Create: `apps/web/app/tamm/quote/upload/page.tsx`
- Create: `apps/web/app/tamm/quote/business-type/page.tsx`

These are thin wrappers that re-export the Shory page component. The BrandProvider from `apps/web/app/tamm/layout.tsx` handles the brand context.

- [ ] **Step 1: Create all TAMM quote page wrappers**

Each follows this pattern (example for results):

```tsx
// apps/web/app/tamm/quote/results/page.tsx
export {default} from '@/app/quote/results/page';
```

Create this one-liner for all 9 pages listed above. The re-export means the same component renders, but the TAMM layout's BrandProvider gives it TAMM context.

- [ ] **Step 2: Update internal links in shared components**

Components that navigate between quote pages need to use `brand.basePath`. Find all `router.push('/quote/...')` and `href="/quote/..."` calls in shared components and prefix with brand basePath:

In `apps/web/components/quote/quote-results.tsx`, find navigation calls like:
```typescript
router.push('/quote/company-details?...')
```
Replace with:
```typescript
router.push(`${brand.basePath}/quote/company-details?...`)
```

Apply the same pattern in:
- `apps/web/components/quote/company-details.tsx` (navigates to checkout)
- `apps/web/components/quote/checkout.tsx` (navigates to confirmation)
- `apps/web/app/quote/start/page.tsx` (links to ai-advisor, business-type, upload, manual)
- `apps/web/app/quote/ai-advisor/page.tsx` (navigates to results)
- Any other component with hardcoded `/quote/...` paths

Search for: `'/quote/` across all tsx files in `apps/web/` and add `brand.basePath` prefix where appropriate.

- [ ] **Step 3: Verify navigation works**

Run: `cd apps/web && pnpm exec tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/tamm/quote/
git commit -m "feat: add TAMM quote page wrappers with basePath navigation"
```

---

## Task 6: TAMM Stepper Component

**Files:**
- Create: `apps/web/components/quote/tamm-stepper.tsx`

- [ ] **Step 1: Create the stepper component**

Create `apps/web/components/quote/tamm-stepper.tsx`:

```tsx
'use client';

import {useBrand} from '@/lib/brand';

interface TammStepperProps {
  currentStep: number; // 1-6
}

const STEPS = [
  {label: 'Choose Method', step: 1},
  {label: 'Business Details', step: 2},
  {label: 'Quote Results', step: 3},
  {label: 'Company Details', step: 4},
  {label: 'Payment', step: 5},
  {label: 'Confirmation', step: 6},
];

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function QuestionIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 12.5a5.5 5.5 0 110-11 5.5 5.5 0 010 11zM8 4.5a2 2 0 00-2 2h1.25a.75.75 0 011.5 0c0 .41-.34.75-.75.75a.625.625 0 00-.625.625V9h1.25v-.41A2 2 0 008 4.5zM7.375 10.25h1.25v1.25h-1.25v-1.25z" />
    </svg>
  );
}

export function TammStepper({currentStep}: TammStepperProps) {
  return (
    <div className="flex flex-col gap-0">
      {STEPS.map((step, i) => {
        const isCompleted = step.step < currentStep;
        const isActive = step.step === currentStep;
        const isLast = i === STEPS.length - 1;

        return (
          <div key={step.step} className="flex items-start gap-3">
            {/* Circle + line */}
            <div className="flex flex-col items-center">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  isCompleted
                    ? 'bg-[#1D7A4E]'
                    : isActive
                      ? 'bg-[#1D7A4E]'
                      : 'border-2 border-[#DEE2E6] bg-white'
                }`}
              >
                {isCompleted ? (
                  <CheckIcon />
                ) : isActive ? (
                  <div className="w-2 h-2 rounded-full bg-white" />
                ) : null}
              </div>
              {!isLast && (
                <div
                  className={`w-0.5 h-8 ${
                    isCompleted ? 'bg-[#1D7A4E]' : 'bg-[#DEE2E6]'
                  }`}
                />
              )}
            </div>

            {/* Label */}
            <span
              className={`text-sm pt-0.5 ${
                isActive
                  ? 'font-semibold text-[#12121B]'
                  : isCompleted
                    ? 'text-text-muted'
                    : 'text-text-muted/60'
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}

      {/* Need Support */}
      <div className="mt-6 flex items-center gap-2 text-sm text-text-muted hover:text-primary cursor-pointer">
        <QuestionIcon />
        Need Support?
      </div>
    </div>
  );
}

/** Compact horizontal stepper for mobile */
export function TammStepperCompact({currentStep}: TammStepperProps) {
  const activeLabel = STEPS.find((s) => s.step === currentStep)?.label ?? '';

  return (
    <div className="flex flex-col gap-2 px-4 py-3">
      <div className="flex items-center gap-1.5">
        {STEPS.map((step) => {
          const isCompleted = step.step < currentStep;
          const isActive = step.step === currentStep;
          return (
            <div
              key={step.step}
              className={`flex-1 h-1.5 rounded-full ${
                isCompleted || isActive ? 'bg-[#1D7A4E]' : 'bg-[#DEE2E6]'
              }`}
            />
          );
        })}
      </div>
      <span className="text-xs text-text-muted">
        Step {currentStep} of {STEPS.length} · {activeLabel}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd apps/web && pnpm exec tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/quote/tamm-stepper.tsx
git commit -m "feat: add TAMM sidebar stepper component"
```

---

## Task 7: TAMM Page Layout (Two-Column)

**Files:**
- Create: `apps/web/components/quote/tamm-page-layout.tsx`

- [ ] **Step 1: Create the layout component**

Create `apps/web/components/quote/tamm-page-layout.tsx`:

```tsx
'use client';

import {TammStepper, TammStepperCompact} from './tamm-stepper';

interface TammPageLayoutProps {
  currentStep: number; // 1-6
  children: React.ReactNode;
}

export function TammPageLayout({currentStep, children}: TammPageLayoutProps) {
  return (
    <div>
      {/* Mobile: compact horizontal stepper */}
      <div className="lg:hidden">
        <TammStepperCompact currentStep={currentStep} />
      </div>

      {/* Desktop: two-column layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-8">
          {/* Main content */}
          <div className="flex-1 min-w-0">{children}</div>

          {/* Sidebar stepper — desktop only */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-20">
              <TammStepper currentStep={currentStep} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd apps/web && pnpm exec tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/quote/tamm-page-layout.tsx
git commit -m "feat: add TAMM two-column page layout with sidebar stepper"
```

---

## Task 8: TAMM Quote Card

**Files:**
- Create: `apps/web/components/quote/tamm-quote-card.tsx`

- [ ] **Step 1: Create the TAMM quote card**

Create `apps/web/components/quote/tamm-quote-card.tsx`:

```tsx
'use client';

import {useState} from 'react';
import {Button} from '@shory/ui';
import {formatPriceWithCurrency} from '@/lib/pricing';
import {useI18n} from '@/lib/i18n';

interface TammQuoteCardProps {
  insurer: {
    id: string;
    name: string;
    logo: string;
    rating: number;
    shariahCompliant: boolean;
    total: number;
  };
  coverageType: string;
  benefits: {name: string; included: boolean}[];
  productLines?: {
    name: string;
    icon: string;
    limit: string;
    price: number;
    mandatory?: boolean;
  }[];
  isBestPrice: boolean;
  isRecommended?: boolean;
  monthly?: boolean;
  onSelect: () => void;
}

function GreenCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5">
      <circle cx="8" cy="8" r="8" fill="#1D7A4E" />
      <path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TammQuoteCard({
  insurer,
  coverageType,
  benefits,
  productLines,
  isBestPrice,
  isRecommended,
  monthly,
  onSelect,
}: TammQuoteCardProps) {
  const {t, locale} = useI18n();
  const [expanded, setExpanded] = useState(false);
  const includedBenefits = benefits.filter((b) => b.included);
  const visibleBenefits = expanded ? includedBenefits : includedBenefits.slice(0, 4);

  const priceDisplay = monthly
    ? Math.round(insurer.total * 1.08 / 12)
    : insurer.total;

  return (
    <div className="bg-white border border-[#DEE2E6] rounded-lg p-5 flex flex-col gap-4">
      {/* Header: logo + name */}
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={insurer.logo}
          alt={insurer.name}
          className="w-10 h-10 rounded-lg object-contain bg-gray-50 p-1"
        />
        <div>
          <h3 className="text-base font-bold text-[#12121B]">{insurer.name}</h3>
          <p className="text-sm text-text-muted">{coverageType}</p>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        {isBestPrice && (
          <span className="bg-[#E8F7F0] text-[#1D7A4E] rounded px-2 py-0.5 text-xs font-medium">
            Best Price
          </span>
        )}
        {isRecommended && (
          <span className="bg-[#E8F1F8] text-[#005C9E] rounded px-2 py-0.5 text-xs font-medium">
            Recommended
          </span>
        )}
        {insurer.shariahCompliant && (
          <span className="bg-[#E8F7F0] text-[#1D7A4E] rounded px-2 py-0.5 text-xs font-medium">
            Shariah Compliant
          </span>
        )}
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-1">
        <span className="text-sm text-text-muted">AED</span>
        <span className="text-2xl font-bold text-[#12121B]">
          {formatPriceWithCurrency(priceDisplay, '', locale).trim()}
        </span>
        {monthly && <span className="text-xs text-text-muted">/mo</span>}
      </div>

      {/* Product lines */}
      {productLines && productLines.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {productLines.map((line) => (
            <div key={line.name} className="flex items-center gap-2 text-sm">
              <GreenCheck />
              <span className="text-[#12121B]">{line.name}</span>
              <span className="text-text-muted ms-auto text-xs">{line.limit}</span>
            </div>
          ))}
        </div>
      )}

      {/* Benefits */}
      {visibleBenefits.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {visibleBenefits.map((benefit) => (
            <div key={benefit.name} className="flex items-start gap-2 text-sm">
              <GreenCheck />
              <span className="text-[#12121B]">{benefit.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* View all benefits toggle */}
      {includedBenefits.length > 4 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm font-medium text-primary hover:underline self-start"
        >
          {expanded ? 'Show less' : `View all benefits (${includedBenefits.length})`}
        </button>
      )}

      {/* CTA */}
      <Button
        onClick={onSelect}
        className="w-full rounded-md py-2.5 text-sm font-medium bg-primary text-white hover:bg-primary-hover mt-auto"
      >
        Select a Quote
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd apps/web && pnpm exec tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/quote/tamm-quote-card.tsx
git commit -m "feat: add TAMM-styled quote card component"
```

---

## Task 9: TAMM Filter Bar

**Files:**
- Create: `apps/web/components/quote/tamm-filter-bar.tsx`

- [ ] **Step 1: Create the filter bar component**

Create `apps/web/components/quote/tamm-filter-bar.tsx`:

```tsx
'use client';

import {Button} from '@shory/ui';

interface TammFilterBarProps {
  sortOrder: 'low-high' | 'high-low';
  onSortChange: (order: 'low-high' | 'high-low') => void;
}

function ChevronDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4.5l3 3 3-3" />
    </svg>
  );
}

export function TammFilterBar({sortOrder, onSortChange}: TammFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: filter pills */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#12121B]">Filter:</span>
          {['Coverage', 'Industry', 'All Filters'].map((label) => (
            <button
              key={label}
              className="inline-flex items-center gap-1.5 border border-[#DEE2E6] rounded-full px-4 py-1.5 text-sm text-[#12121B] bg-white hover:bg-gray-50 transition-colors"
            >
              {label}
              <ChevronDown />
            </button>
          ))}
        </div>

        {/* Right: sort */}
        <button
          onClick={() => onSortChange(sortOrder === 'low-high' ? 'high-low' : 'low-high')}
          className="inline-flex items-center gap-1.5 border border-[#DEE2E6] rounded-full px-4 py-1.5 text-sm text-[#12121B] bg-white hover:bg-gray-50 transition-colors"
        >
          Sort by price ({sortOrder === 'low-high' ? 'low→high' : 'high→low'})
          <ChevronDown />
        </button>
      </div>

      {/* Compare button */}
      <div>
        <Button className="rounded-full px-6 py-2 text-sm font-medium bg-primary text-white hover:bg-primary-hover">
          Compare Quotes
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd apps/web && pnpm exec tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/quote/tamm-filter-bar.tsx
git commit -m "feat: add TAMM filter bar component"
```

---

## Task 10: Integrate TAMM Components into Quote Results

**Files:**
- Modify: `apps/web/components/quote/quote-results.tsx`
- Modify: `apps/web/app/tamm/quote/results/page.tsx`

- [ ] **Step 1: Update TAMM results page wrapper to use TammPageLayout**

Replace `apps/web/app/tamm/quote/results/page.tsx`:

```tsx
'use client';

import {Suspense} from 'react';
import {TammPageLayout} from '@/components/quote/tamm-page-layout';
import {QuoteResults} from '@/components/quote/quote-results';

export default function TammQuoteResultsPage() {
  return (
    <TammPageLayout currentStep={3}>
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <QuoteResults />
      </Suspense>
    </TammPageLayout>
  );
}
```

- [ ] **Step 2: Branch on brand in quote-results.tsx**

In `apps/web/components/quote/quote-results.tsx`:

1. Import the TAMM components:
```typescript
import {useBrand} from '@/lib/brand';
import {TammQuoteCard} from '@/components/quote/tamm-quote-card';
import {TammFilterBar} from '@/components/quote/tamm-filter-bar';
```

2. Inside the component, get the brand:
```typescript
const brand = useBrand();
const isTamm = brand.id === 'tamm';
```

3. In the render section, before the quote cards grid, add the TAMM filter bar:
```tsx
{isTamm && (
  <TammFilterBar
    sortOrder={sortOrder}
    onSortChange={setSortOrder}
  />
)}
```

4. Where the existing `<QuoteCard>` is rendered (in the map over `allQuotes`), branch:
```tsx
{isTamm ? (
  <TammQuoteCard
    key={quote.insurer.id}
    insurer={quote.insurer}
    coverageType={quote.coverageType}
    benefits={quote.benefits}
    productLines={quote.productLines}
    isBestPrice={quote.isBestPrice}
    isRecommended={quote.isRecommended}
    monthly={isMonthly}
    onSelect={() => handleSelect(quote)}
  />
) : (
  <QuoteCard
    key={quote.insurer.id}
    {/* existing props */}
  />
)}
```

5. For TAMM, hide the existing `<ProgressIndicator>` — the stepper is in the page layout:
```tsx
{!isTamm && (
  <ProgressIndicator currentStep={4} totalSteps={6} label={...} />
)}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd apps/web && pnpm exec tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/quote/quote-results.tsx apps/web/app/tamm/quote/results/page.tsx
git commit -m "feat: integrate TAMM stepper, quote cards, and filter bar into results page"
```

---

## Task 11: Wire Up Remaining TAMM Quote Pages with Stepper

**Files:**
- Modify: `apps/web/app/tamm/quote/start/page.tsx`
- Modify: `apps/web/app/tamm/quote/ai-advisor/page.tsx`
- Modify: `apps/web/app/tamm/quote/company-details/page.tsx`
- Modify: `apps/web/app/tamm/quote/checkout/page.tsx`
- Modify: `apps/web/app/tamm/quote/confirmation/page.tsx`
- Modify: `apps/web/app/tamm/quote/manual/page.tsx`
- Modify: `apps/web/app/tamm/quote/upload/page.tsx`
- Modify: `apps/web/app/tamm/quote/business-type/page.tsx`

- [ ] **Step 1: Update each TAMM page to use TammPageLayout**

Replace the simple re-exports from Task 5 with proper wrappers. Each page follows this pattern:

```tsx
// apps/web/app/tamm/quote/start/page.tsx
import QuoteStartPage from '@/app/quote/start/page';
import {TammPageLayout} from '@/components/quote/tamm-page-layout';

export default function TammQuoteStartPage() {
  return (
    <TammPageLayout currentStep={1}>
      <QuoteStartPage />
    </TammPageLayout>
  );
}
```

Step mapping:
- `start` → currentStep={1}
- `ai-advisor`, `business-type`, `manual`, `upload` → currentStep={2}
- `results` → currentStep={3} (already done in Task 10)
- `company-details` → currentStep={4}
- `checkout` → currentStep={5}
- `confirmation` → currentStep={6}

Note: The inner page components (e.g. `QuoteStartPage`) still render their own `<ProgressIndicator>`. For TAMM pages, the shared components should hide it. In quote-results.tsx we already handle this with `!isTamm`. Apply the same `!isTamm` guard to `<ProgressIndicator>` in each shared component that renders it.

- [ ] **Step 2: Hide ProgressIndicator in shared components for TAMM**

In each component that renders `<ProgressIndicator>`:
- `apps/web/app/quote/start/page.tsx`
- `apps/web/app/quote/ai-advisor/page.tsx`
- `apps/web/components/quote/company-details.tsx`
- `apps/web/components/quote/checkout.tsx`
- `apps/web/components/quote/confirmation.tsx`

Wrap the `<ProgressIndicator>` in:
```tsx
{brand.id !== 'tamm' && <ProgressIndicator ... />}
```

Where `brand` comes from `useBrand()`.

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd apps/web && pnpm exec tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/tamm/quote/ apps/web/app/quote/ apps/web/components/quote/
git commit -m "feat: wire up TAMM stepper layout on all quote pages"
```

---

## Task 12: Final Verification & Cleanup

**Files:** None new — verification only.

- [ ] **Step 1: TypeScript check**

Run: `cd apps/web && pnpm exec tsc --noEmit`

- [ ] **Step 2: Backend TypeScript check**

Run: `cd apps/backend && pnpm exec tsc --noEmit`

- [ ] **Step 3: Test Shory flow**

Start dev: `pnpm dev`
Navigate through the full Shory quote journey at `localhost:3000/quote/start`:
- Progress indicator shows at top (no sidebar stepper)
- Quote cards use existing Shory style
- All navigation works

- [ ] **Step 4: Test TAMM flow**

Navigate to `localhost:3000/tamm`:
- TAMM entry page loads
- Click "Get a quote" → goes to `/tamm/quote/start`
- Sidebar stepper visible on desktop (step 1 active)
- No top progress indicator
- Navigate through to `/tamm/quote/results`
- TAMM-styled quote cards with green badges
- Filter bar with pill buttons
- Stepper shows step 3 active

- [ ] **Step 5: Test TAMM UAE PASS flow**

Navigate to `localhost:3000/tamm` → "Get a quote with UAE PASS":
- Redirects to `/tamm/quote/results?uaepass=true&...`
- Green "Pre-filled from UAE PASS" banner
- TAMM quote cards and stepper visible

- [ ] **Step 6: Grep for any remaining NEXT_PUBLIC_BRAND references**

Run: `grep -rn "NEXT_PUBLIC_BRAND" apps/web/ --include="*.tsx" --include="*.ts" | grep -v node_modules`

Any remaining references should only be in `lib/brand/index.ts` (fallback). Remove from `.env` if still there.

- [ ] **Step 7: Commit if cleanup needed**

```bash
git add -A
git commit -m "chore: final cleanup for TAMM URL routing and results redesign"
```
