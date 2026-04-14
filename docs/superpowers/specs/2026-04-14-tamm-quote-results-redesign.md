# TAMM Quote Results Redesign — Design Spec

**Date:** 2026-04-14
**Status:** Approved
**Scope:** TAMM-only visual redesign of the quote results page — sidebar stepper, quote cards, filter bar

---

## 1. Overview

Redesign the quote results page for the TAMM brand to match the TAMM government portal design system. Shory brand is unaffected. All existing business logic (pricing, bundles, recommendations, peer data, AI insights) is preserved — this is a visual/layout change only.

### Key changes

| Element | Shory (unchanged) | TAMM (new) |
|---------|-------------------|------------|
| Progress indicator | Top horizontal bar | Right sidebar stepper (desktop) / compact horizontal (mobile) |
| Quote cards | Current card style | TAMM-styled cards with green badges, benefit checklists, full-width CTA |
| Filter bar | Current inline filters | TAMM pill-button filters with sort dropdown |
| Layout | Single column | Two-column: content (left ~70%) + sticky stepper sidebar (right ~30%) |

---

## 2. Sidebar Stepper

### 2.1 Component

New file: `apps/web/components/quote/tamm-stepper.tsx`

A vertical stepper shown in a sticky sidebar on the right side of TAMM quote pages.

### 2.2 Steps

| # | Label | Route |
|---|-------|-------|
| 1 | Choose Method | `/quote/start` |
| 2 | Business Details | `/quote/ai-advisor` or `/quote/manual` etc. |
| 3 | Quote Results | `/quote/results` |
| 4 | Company Details | `/quote/company-details` |
| 5 | Payment | `/quote/checkout` |
| 6 | Confirmation | `/quote/confirmation` |

### 2.3 Step states

- **Completed:** Green checkmark icon, green text/line
- **Active:** Green filled circle with white number/dot, bold text
- **Upcoming:** Gray circle outline, muted text

The active step is determined by the current route path, passed as a `currentStep` prop.

### 2.4 Visual specs (from TAMM screenshots)

- Vertical line connecting steps (green for completed, gray for upcoming)
- Step circle: 24px, border 2px
- Completed checkmark: white checkmark on green circle (#1D7A4E or TAMM primary)
- Active: solid green circle
- Upcoming: gray border circle (#DEE2E6)
- Label: 14px, regular weight (upcoming), medium weight (active), muted (completed)
- "Need Support?" link at bottom with question mark icon

### 2.5 Responsive behavior

- **Desktop (lg+):** Sticky sidebar on the right, `position: sticky; top: 80px`
- **Tablet (md):** Sidebar collapses, stepper becomes a compact horizontal bar at top showing step dots + current step label
- **Mobile (sm):** Same as tablet — horizontal compact stepper

---

## 3. Two-Column Layout

### 3.1 TAMM page wrapper

When `brand.id === 'tamm'`, the quote pages render in a two-column layout:

```
┌─────────────────────────────────┬──────────────┐
│ Main content (~70%)             │ Stepper (30%)│
│                                 │ (sticky)     │
│ Title                           │ ① Choose     │
│ Subtitle                        │ ② Business   │
│ [Filter bar]                    │ ③ Results ●  │
│ [Bundle cards]                  │ ④ Company    │
│ [Quote cards]                   │ ⑤ Payment    │
│ [AI insights]                   │ ⑥ Confirm    │
│                                 │              │
│                                 │ Need Support?│
└─────────────────────────────────┴──────────────┘
```

### 3.2 Implementation

New file: `apps/web/components/quote/tamm-page-layout.tsx`

A layout wrapper that:
- Accepts `currentStep` (1-6) and `children` (main content)
- Renders the two-column layout on desktop with the stepper sidebar
- On mobile, renders the compact horizontal stepper above children
- Replaces `<ProgressIndicator>` usage on TAMM pages

Usage in quote pages:
```tsx
const brand = getBrand();
if (brand.id === 'tamm') {
  return <TammPageLayout currentStep={3}>{mainContent}</TammPageLayout>;
} else {
  return <><ProgressIndicator .../>{mainContent}</>;
}
```

---

## 4. Quote Cards

### 4.1 Component

New file: `apps/web/components/quote/tamm-quote-card.tsx`

Replaces the current `<QuoteCard>` when brand is TAMM.

### 4.2 Visual specs (from TAMM screenshots)

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

### 4.3 Styling

- Card: white bg, `border border-[#DEE2E6]`, `rounded-lg`, `p-5`
- Insurer logo: 40x40px rounded
- Insurer name: 16px bold, text-text
- Type label: 14px, text-muted
- Green badge: `bg-[#E8F7F0] text-[#1D7A4E] rounded px-2 py-0.5 text-xs`
- Price: `text-2xl font-bold text-text` with "AED" prefix in regular weight
- Benefits: green checkmark icon + 14px text, 3-4 items shown
- "View all benefits": text link in primary color
- CTA button: full-width, `bg-primary text-white rounded-md py-2.5 font-medium`

### 4.4 Props

Same data interface as current `QuoteCard` — accepts insurer, products, price, etc. This is purely a visual wrapper.

---

## 5. Filter Bar

### 5.1 Component

New file: `apps/web/components/quote/tamm-filter-bar.tsx`

### 5.2 Visual specs

```
┌──────────────────────────────────────────────────────────────┐
│ Filter: [Coverage ▼] [Industry ▼] [All Filters ▼]           │
│                                    Sort by price (low→high) ▼│
│                                                              │
│ [Compare Quotes]                                             │
└──────────────────────────────────────────────────────────────┘
```

- Filter pills: `border border-[#DEE2E6] rounded-full px-4 py-1.5 text-sm`
- Sort dropdown: right-aligned, same pill style
- "Compare Quotes" button: TAMM primary color, `rounded-full px-6 py-2`
- These filters are visual-only for the prototype (no backend filtering logic needed)

---

## 6. What Stays the Same

- All pricing logic in `lib/pricing.ts`
- Bundle deals section and cards
- AI recommendation engine and insights
- Peer data and statistics
- URL parameter handling
- Navigation flow between pages
- Shory brand — zero changes to any Shory-visible component

---

## 7. Files

### New files

| File | Purpose |
|------|---------|
| `apps/web/components/quote/tamm-stepper.tsx` | Vertical sidebar stepper + mobile horizontal variant |
| `apps/web/components/quote/tamm-page-layout.tsx` | Two-column layout wrapper with stepper |
| `apps/web/components/quote/tamm-quote-card.tsx` | TAMM-styled insurer quote card |
| `apps/web/components/quote/tamm-filter-bar.tsx` | TAMM-styled filter pills and sort |

### Modified files

| File | Change |
|------|--------|
| `apps/web/components/quote/quote-results.tsx` | Branch on brand: render TAMM components when `brand.id === 'tamm'` |
| `apps/web/app/quote/results/page.tsx` | Wrap in `TammPageLayout` for TAMM brand |
| Other quote pages (start, company-details, checkout, confirmation) | Wrap in `TammPageLayout` for TAMM brand (stepper on all pages) |
