# TAMM Quote Results Redesign — Design Spec

**Date:** 2026-04-14
**Status:** Approved
**Scope:** URL-based brand routing + TAMM-only visual redesign of quote results (sidebar stepper, quote cards, filter bar)

---

## 1. Overview

Two changes in one spec:

1. **Brand routing via URL prefix** — replace the env-var approach (`NEXT_PUBLIC_BRAND`) with URL path prefix (`/tamm/...`). Same deployment serves both brands.
2. **TAMM quote results redesign** — sidebar stepper, TAMM-styled quote cards, filter bar.

All existing business logic is preserved.

---

## 2. URL-Based Brand Routing

### 2.1 Routing scheme

| URL | Brand |
|-----|-------|
| `/quote/start` | Shory |
| `/tamm/quote/start` | TAMM |
| `/tamm/quote/results?uaepass=true&...` | TAMM |
| `/tamm` | TAMM entry page (Business Space) |
| `/` | Shory homepage |

### 2.2 Next.js route structure

Use Next.js route groups to share page components between brands. The TAMM routes live under `apps/web/app/tamm/` which has its own layout that sets the TAMM brand context.

```
apps/web/app/
  layout.tsx              ← root layout (reads brand from URL, sets data-brand)
  page.tsx                ← Shory homepage
  tamm/
    layout.tsx            ← TAMM layout (sets brand context, TAMM navbar/footer)
    page.tsx              ← TAMM entry page (was /tamm-entry)
    quote/
      start/page.tsx      ← TAMM quote start
      ai-advisor/page.tsx ← TAMM AI advisor
      results/page.tsx    ← TAMM results (with new stepper/cards)
      company-details/page.tsx
      checkout/page.tsx
      confirmation/page.tsx
      manual/page.tsx
      upload/page.tsx
      business-type/page.tsx
  quote/                  ← Shory quote pages (unchanged)
    start/page.tsx
    ...
```

### 2.3 Brand resolution

Replace env-var-based `getBrand()` with pathname-based resolution:

```typescript
// lib/brand/index.ts
export function getBrand(): BrandConfig {
  // Server-side: read from headers/pathname
  // Client-side: read from window.location.pathname
  const isTammPath = typeof window !== 'undefined'
    ? window.location.pathname.startsWith('/tamm')
    : false; // server-side needs headers() or a context provider
  return isTammPath ? tammBrand : shoryBrand;
}
```

Better approach — use a **React context** set by the layout:

- Root layout defaults to Shory
- `apps/web/app/tamm/layout.tsx` wraps children in `<BrandProvider brand="tamm">`
- `getBrand()` reads from context (client) or from a passed prop (server)
- The `useBrand()` hook replaces direct `getBrand()` calls in client components
- For server components, `getBrand()` checks if the current route segment is under `/tamm`

### 2.4 Changes to existing brand module

- Remove `NEXT_PUBLIC_BRAND` env var dependency
- Add `BrandProvider` context + `useBrand()` hook
- Keep `getBrand()` for server components (reads route segment)
- Update all components that call `getBrand()` to use `useBrand()` in client components

### 2.5 TAMM page components

The TAMM pages under `apps/web/app/tamm/quote/` can either:
- **Re-export** the Shory page components (since the brand context handles the visual differences), OR
- **Import and wrap** the shared components with TAMM-specific layout (stepper)

Recommended: TAMM pages are thin wrappers that import shared components and wrap them in `TammPageLayout`. This keeps the business logic in one place.

```tsx
// apps/web/app/tamm/quote/results/page.tsx
import {QuoteResults} from '@/components/quote/quote-results';
import {TammPageLayout} from '@/components/quote/tamm-page-layout';

export default function TammQuoteResultsPage() {
  return (
    <TammPageLayout currentStep={3}>
      <QuoteResults />
    </TammPageLayout>
  );
}
```

### 2.6 Link updates

All internal links in TAMM context must prefix with `/tamm`. The brand config gets a `basePath` property:
- Shory: `basePath: ''`
- TAMM: `basePath: '/tamm'`

Components use `brand.basePath + '/quote/results'` for navigation.

### 2.7 Cleanup

- Remove `NEXT_PUBLIC_BRAND` from `.env`
- Remove conditional CSS `require()` approach (now handled by `data-brand` attribute from context)
- Delete `apps/web/app/tamm-entry/page.tsx` (moves to `apps/web/app/tamm/page.tsx`)

---

## 3. Sidebar Stepper

### 3.1 Component

New file: `apps/web/components/quote/tamm-stepper.tsx`

A vertical stepper shown in a sticky sidebar on the right side of TAMM quote pages.

### 3.2 Steps

| # | Label | Route |
|---|-------|-------|
| 1 | Choose Method | `/tamm/quote/start` |
| 2 | Business Details | `/tamm/quote/ai-advisor` (or manual, etc.) |
| 3 | Quote Results | `/tamm/quote/results` |
| 4 | Company Details | `/tamm/quote/company-details` |
| 5 | Payment | `/tamm/quote/checkout` |
| 6 | Confirmation | `/tamm/quote/confirmation` |

### 3.3 Step states

- **Completed:** Green checkmark icon, green text/line
- **Active:** Green filled circle with white dot, bold text
- **Upcoming:** Gray circle outline, muted text

The active step is passed as a `currentStep` prop (1-6).

### 3.4 Visual specs (from TAMM screenshots)

- Vertical line connecting steps (green for completed, gray for upcoming)
- Step circle: 24px, border 2px
- Completed checkmark: white checkmark on green circle (`#1D7A4E`)
- Active: solid green circle
- Upcoming: gray border circle (`#DEE2E6`)
- Label: 14px, regular weight (upcoming), medium weight (active), muted (completed)
- "Need Support?" link at bottom with question mark icon

### 3.5 Responsive behavior

- **Desktop (lg+):** Sticky sidebar on the right, `position: sticky; top: 80px`
- **Mobile/Tablet:** Compact horizontal stepper at top — step dots + current step label

---

## 4. Two-Column Layout

### 4.1 Component

New file: `apps/web/components/quote/tamm-page-layout.tsx`

```
Desktop:
┌─────────────────────────────────┬──────────────┐
│ Main content (~70%)             │ Stepper (30%)│
│                                 │ (sticky)     │
│ [children]                      │ ① ② ③● ④ ⑤ ⑥│
│                                 │              │
│                                 │ Need Support?│
└─────────────────────────────────┴──────────────┘

Mobile:
┌────────────────────────────────────────────────┐
│ ①──②──③●──④──⑤──⑥  (compact horizontal)       │
├────────────────────────────────────────────────┤
│ [children]                                     │
└────────────────────────────────────────────────┘
```

Props: `currentStep` (1-6), `children` (main content)

---

## 5. Quote Cards (TAMM)

### 5.1 Component

New file: `apps/web/components/quote/tamm-quote-card.tsx`

### 5.2 Visual specs

```
┌────────────────────────────────────────────┐
│ [Logo]  Insurer Name                       │
│         Third Party Liability              │
│                                            │
│ ┌──────────────────────────────┐           │
│ │ Reg. Policy Listing Time: X  │           │
│ └──────────────────────────────┘           │
│                                            │
│ AED 924.00                                 │
│                                            │
│ ✓ Free Ambulance Service Cost              │
│ ✓ Free Roadside Assistance                 │
│ ✓ Free Personal Accident Benefit...        │
│                                            │
│ View all benefits                          │
│                                            │
│ ┌──────────────────────────────────────┐   │
│ │         Select a Quote               │   │
│ └──────────────────────────────────────┘   │
└────────────────────────────────────────────┘
```

### 5.3 Styling

- Card: white bg, `border border-[#DEE2E6]`, `rounded-lg`, `p-5`
- Insurer logo: 40x40px rounded
- Insurer name: 16px bold
- Green badge: `bg-[#E8F7F0] text-[#1D7A4E] rounded px-2 py-0.5 text-xs`
- Price: `text-2xl font-bold` with "AED" prefix in regular weight
- Benefits: green checkmark + 14px text, 3-4 items shown
- "View all benefits": text link in primary color
- CTA: full-width, `bg-primary text-white rounded-md py-2.5 font-medium`

### 5.4 Props

Same data interface as current `QuoteCard`.

---

## 6. Filter Bar (TAMM)

### 6.1 Component

New file: `apps/web/components/quote/tamm-filter-bar.tsx`

### 6.2 Visual specs

- Filter pills: `border border-[#DEE2E6] rounded-full px-4 py-1.5 text-sm`
- Sort dropdown: right-aligned
- "Compare Quotes" button: primary color, `rounded-full px-6 py-2`
- Filters are visual-only for the prototype (no backend filtering)

---

## 7. What Stays the Same

- All pricing logic in `lib/pricing.ts`
- Bundle deals section and cards
- AI recommendation engine and insights
- Peer data and statistics
- URL parameter handling (query params unchanged, only path prefix changes)
- Shory pages — zero changes to any Shory-visible route or component

---

## 8. Files

### New files

| File | Purpose |
|------|---------|
| `apps/web/components/quote/tamm-stepper.tsx` | Vertical sidebar stepper + mobile horizontal variant |
| `apps/web/components/quote/tamm-page-layout.tsx` | Two-column layout wrapper with stepper |
| `apps/web/components/quote/tamm-quote-card.tsx` | TAMM-styled insurer quote card |
| `apps/web/components/quote/tamm-filter-bar.tsx` | TAMM-styled filter pills and sort |
| `apps/web/lib/brand/context.tsx` | BrandProvider + useBrand() hook |
| `apps/web/app/tamm/layout.tsx` | TAMM route group layout |
| `apps/web/app/tamm/page.tsx` | TAMM entry page (moved from tamm-entry) |
| `apps/web/app/tamm/quote/start/page.tsx` | TAMM quote start wrapper |
| `apps/web/app/tamm/quote/ai-advisor/page.tsx` | TAMM AI advisor wrapper |
| `apps/web/app/tamm/quote/results/page.tsx` | TAMM results wrapper |
| `apps/web/app/tamm/quote/company-details/page.tsx` | TAMM company details wrapper |
| `apps/web/app/tamm/quote/checkout/page.tsx` | TAMM checkout wrapper |
| `apps/web/app/tamm/quote/confirmation/page.tsx` | TAMM confirmation wrapper |
| `apps/web/app/tamm/quote/manual/page.tsx` | TAMM manual entry wrapper |
| `apps/web/app/tamm/quote/upload/page.tsx` | TAMM upload wrapper |
| `apps/web/app/tamm/quote/business-type/page.tsx` | TAMM business type wrapper |

### Modified files

| File | Change |
|------|--------|
| `apps/web/lib/brand/index.ts` | Replace env-var with context/pathname-based resolution, add `basePath` |
| `apps/web/lib/brand/types.ts` | Add `basePath: string` to BrandConfig |
| `apps/web/lib/brand/shory.ts` | Add `basePath: ''` |
| `apps/web/lib/brand/tamm.ts` | Add `basePath: '/tamm'` |
| `apps/web/app/layout.tsx` | Remove `NEXT_PUBLIC_BRAND` logic, wrap in default BrandProvider |
| `apps/web/components/quote/quote-results.tsx` | Branch on brand for TAMM components |
| All components using `getBrand()` in client context | Switch to `useBrand()` hook |

### Deleted files

| File | Reason |
|------|--------|
| `apps/web/app/tamm-entry/page.tsx` | Moves to `apps/web/app/tamm/page.tsx` |
