# TAMM White-Label SME Insurance Platform — Design Spec

**Date:** 2026-04-14
**Status:** Approved
**Scope:** White-label theming support for `apps/web`, TAMM (Abu Dhabi) brand variant

---

## 1. Overview

Add white-label / multi-brand support to the Shory SME customer-facing app (`apps/web`). The first alternate brand is **TAMM** — an Abu Dhabi government portal for SME insurance. The TAMM variant replaces all Shory branding, restricts geography to Abu Dhabi localities, adds a mock UAE PASS pre-fill flow, and provides Abu Dhabi-specific legal references.

### Key decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Brand architecture | Single codebase, env-var driven (`NEXT_PUBLIC_BRAND`) | Avoids code duplication, single deployment per brand via Vercel |
| CSS theming | Two separate CSS files, layout imports based on env var | Clean separation, no runtime overhead, Tailwind v4 `@theme inline` compatible |
| Brand config | TypeScript module (`lib/brand/`) with typed exports | Type-safe, supports functions (UAE PASS logic), follows project patterns |
| UAE PASS | Mock — hardcoded test data, session storage | Production UAE PASS API is out of scope |
| TAMM entry page | Dedicated `/tamm-entry` route + TAMM-branded homepage | Demos the Business Space context without changing Shory homepage |
| AI prompts | Brand-aware — backend selects prompt variant by brand param | Keeps Shory multi-emirate prompts intact |

### Out of scope

- Production UAE PASS API integration
- Real ADDED trade licence verification API
- Arabic content review by native speaker
- TAMM platform deployment or ADGOV infrastructure
- Legal review of insurance product names
- Production Checkout.com or Finwall onboarding

---

## 2. White-Label Theming Infrastructure

### 2.1 CSS files

**`apps/web/app/globals.css`** — Shory tokens (unchanged):

```css
@theme inline {
  --color-primary: #1D68FF;
  --color-primary-hover: #1555D4;
  --color-primary-light: #E8F0FF;
  --color-background: #FFFFFF;
  --color-surface: #F7F8FA;
  --color-border: #E5E7EB;
  --color-text: #1A1A2E;
  --color-text-muted: #6B7280;
  --color-success: #22C55E;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
}
```

**`apps/web/app/globals-tamm.css`** — TAMM tokens (new file):

```css
@theme inline {
  --color-primary: #005C9E;
  --color-primary-hover: #004B82;
  --color-primary-light: #E8F1F8;
  --color-primary-mid: #B3CFDF;
  --color-background: #F4F6F8;
  --color-surface: #FFFFFF;
  --color-border: #DEE2E6;
  --color-text: #1A1A1A;
  --color-text-muted: #64748B;
  --color-success: #1D7A4E;
  --color-success-light: #E8F7F0;
  --color-warning: #C2790E;
  --color-error: #C0272D;
  --color-nav-bg: #005C9E;
}
```

Additional TAMM-specific CSS overrides in the same file:

```css
/* TAMM: flatter, less rounded */
:root {
  --radius-card: 8px;    /* Shory: 16px */
  --radius-button: 6px;  /* Shory: 12px */
  --radius-chip: 4px;    /* Shory: 999px */
  --shadow-card: 0 2px 6px rgba(0,0,0,0.08);
}
```

**Layout selection** (`apps/web/app/layout.tsx`):

The layout conditionally imports the correct CSS file based on `NEXT_PUBLIC_BRAND`. Since CSS imports must be static in Next.js, this is handled by importing both and applying a conditional class or using a build-time approach.

### 2.2 Font loading

- **Shory:** Bliss Pro (local, `--font-bliss-pro`) + Ping ARLT (local, `--font-ping-arlt`) — unchanged
- **TAMM:** Source Sans 3 (Google Fonts via `next/font/google`, fallback for the licensed Dubai font) — loaded when `NEXT_PUBLIC_BRAND=tamm`

The layout conditionally loads the appropriate font set and applies the correct CSS variable.

### 2.3 Brand config module

```
apps/web/lib/brand/
  index.ts      — reads NEXT_PUBLIC_BRAND, exports getBrand(): BrandConfig
  types.ts      — BrandConfig interface
  shory.ts      — Shory-specific config
  tamm.ts       — TAMM-specific config
```

**`BrandConfig` interface:**

```typescript
interface BrandConfig {
  id: 'shory' | 'tamm';
  displayName: string;           // "Shory" | "TAMM Business Insurance"
  tagline: string;               // Hero tagline
  logoPath: string;              // Path to logo SVG/PNG in /public
  logoAlt: string;               // Alt text for logo

  // Geography
  locations: LocationOption[];   // Emirates (Shory) or Abu Dhabi localities (TAMM)
  locationLabel: string;         // "Emirate" | "Location"
  locationMultipliers: Record<string, number>;
  defaultLocation: string;       // "Dubai" | "Abu Dhabi City"

  // Legal
  legalReferences: {
    healthInsuranceLaw: string;
    healthAuthority: string;
    economicDept: string;
    workersCompLaw: string;
    freeZone: string;
    freeZoneRequirement: string;
    motorLaw: string;
  };

  // Trust & branding
  trustBadges: TrustBadge[];
  footerText: string;

  // UAE PASS
  uaePassEnabled: boolean;
  uaePassMockData: UaePassMockData | null;

  // AI
  aiPromptVariant: 'shory' | 'tamm';

  // Metadata
  metadata: {
    title: string;
    description: string;
  };
}
```

---

## 3. Component & Page Changes

### 3.1 Navbar

- Reads `brand.displayName` and `brand.logoPath` instead of hardcoded "Shory"
- **TAMM:** `bg-[--color-nav-bg]` (TAMM blue `#005C9E`), white text, TAMM logo placeholder, "TAMM Business Services" wordmark
- **Shory:** Unchanged (white bg, dark text, Shory wordmark)

### 3.2 Homepage

- **TAMM:** "Abu Dhabi SME Insurance" headline, TAMM blue CTA, Abu Dhabi-focused copy, TAMM trust badges (ADDED + UAE Insurance Authority)
- **Shory:** Unchanged

### 3.3 Footer

- **TAMM:** "Powered by TAMM — Abu Dhabi Government", TAMM blue accent
- **Shory:** Unchanged

### 3.4 Quote journey — location selection

Wherever the emirate selector appears (AI advisor chips, manual form, company details):

- **Shory:** 7 UAE emirates from `brand.locations`
- **TAMM:** 6 Abu Dhabi localities from `brand.locations`

Components read `brand.locations` and `brand.locationLabel` instead of directly accessing `quote-options.json` emirates.

### 3.5 Quote results page

- When `?uaepass=true` is present (TAMM only): green "Pre-filled from UAE PASS" banner at top
- Pricing uses `brand.locationMultipliers` via the pricing module

### 3.6 Company details page

- Legal/compliance panel text reads from `brand.legalReferences`
- Issuing authority options are brand-specific (ADDED, ADGM, ADAFZA for TAMM vs all UAE authorities for Shory)

### 3.7 Checkout & confirmation

- Trust badges from `brand.trustBadges`
- Branding (logo, name) from brand config
- Legal copy from `brand.legalReferences`

### 3.8 Progress indicator

- Accent color automatic via CSS tokens — no code change needed

---

## 4. UAE PASS Mock & TAMM Entry Page

### 4.1 Mock UAE PASS flow

A "Sign in with UAE PASS" button on `/quote/start` when `brand.uaePassEnabled` is `true` (TAMM only).

**Click behavior:**
1. Write hardcoded test data to session storage (key: `uaepass-data`)
2. Auto-classify business type to `law-firm` based on test data
3. Redirect to `/quote/results?uaepass=true&businessType=law-firm&employees=6-20&revenue=1m-5m&location=ADGM`

**Test data (Persona 1 — Fatima Al Mansoori):**

| Field | Value |
|-------|-------|
| Business name | Al Mansoori Legal Consultancy |
| Trade licence number | CN-1234567 |
| Activity | Legal consultancy |
| Location | ADGM |
| Legal form | Free Zone Establishment |
| Owner name | Fatima Al Mansoori |
| Emirates ID | 784-1990-1234567-1 |

**Results page behavior when `uaepass=true`:**
- Shows green banner: "Pre-filled from UAE PASS ✓"
- Business info populated from session storage
- User proceeds normally from here

**Company details page:**
- Auto-populates fields from session storage UAE PASS data

**Checkout page:**
- Auto-populates name and Emirates ID from session storage

### 4.2 TAMM entry page (`/tamm-entry`)

Only accessible when `NEXT_PUBLIC_BRAND=tamm` (redirects to `/` otherwise).

**Layout:**
- TAMM-styled header with bilingual title (English / Arabic)
- Grid of service tiles matching TAMM Business Space card style:
  - White background, `1px solid #DEE2E6` border, `8px` radius, `24px` padding
  - Title: 18px, 700 weight, `#1A1A1A`
  - Description: 14px, 400 weight, `#64748B`
  - Flat blue CTA button, `6px` radius
- **"Business Insurance" tile** — active, with "Get a quote →" CTA → `/quote/start`
- **"Get a quote with UAE PASS" button** on the insurance tile → `/quote/results?uaepass=true`
- **Other tiles** — static placeholders (Trade Licence Renewal, Visa Services, Business Registration, etc.) for demo context
- "Popular" amber badge on the insurance tile

### 4.3 Direct link entry (non-authenticated)

`/quote/start` in TAMM mode shows a banner above the 4 entry methods:
> "Sign in with UAE PASS to auto-fill your details"

If ignored, the user proceeds with the normal manual flow using Abu Dhabi localities only.

---

## 5. Brand-Aware AI Prompts

### 5.1 Backend changes (`apps/backend/src/ai/advisor.ts`)

- `classifyBusiness(text, brand)` and `getRecommendations(context)` accept a `brand` parameter
- The API endpoints (`POST /api/ai/classify`, `POST /api/ai/recommend`) accept `brand` in the request body
- Frontend passes `NEXT_PUBLIC_BRAND` in API calls

### 5.2 TAMM system prompt

Replaces Shory system prompt when `brand=tamm`:

```
You are a professional AI insurance advisor for SME businesses in Abu Dhabi,
working for TAMM Business Insurance — an Abu Dhabi government digital platform.

## Guidelines

### Domain Boundary
You ONLY answer questions related to Abu Dhabi SME business insurance.
This platform serves Abu Dhabi SMEs exclusively.

### UAE Legal Knowledge (Abu Dhabi)
- Workers Compensation: mandatory for all private sector employers — Federal law applies.
- Health Insurance: mandatory for all employees in Abu Dhabi under DOH Health Finance Law No. 23 of 2005.
- Professional Indemnity: required for FSRA-regulated activities in ADGM.
- Fleet Insurance: compulsory under UAE Traffic Law.
- ADGM: requires Employer Liability as a free zone licence condition.
- All references to location are Abu Dhabi only.
```

### 5.3 TAMM classify prompt

Same as Shory classify prompt but:
- "Shory" → "TAMM Business Insurance"
- "UAE SME insurance platform" → "Abu Dhabi SME insurance platform"

### 5.4 Shory prompts

Unchanged — current multi-emirate behavior preserved.

---

## 6. Pricing Changes

### 6.1 Location multiplier

New function in `apps/web/lib/pricing.ts`:

```typescript
export function getLocationMultiplier(location: string, brand: BrandConfig): number {
  return brand.locationMultipliers[location] ?? 1.0;
}
```

**TAMM multipliers** (from dev note):

| Location | Multiplier |
|----------|-----------|
| Abu Dhabi City | 1.0 |
| Al Ain | 0.97 |
| Al Dhafra | 0.95 |
| ADGM | 1.12 |
| Musaffah | 0.98 |
| Abu Dhabi Airport Free Zone | 1.05 |

**Shory multipliers:** All 7 emirates return `1.0` (current behavior — no emirate pricing differentiation).

### 6.2 Integration

The results page multiplies `getLocationMultiplier()` into the existing pricing formula when calculating quotes. This is applied as an additional factor alongside the existing `riskFactor`, `sizeFactor`, `coverageMultiplier`, and `insurerMultiplier`.

---

## 7. Text Replacements & Legal References

### 7.1 Approach

No grep-and-replace across the codebase. All brand-specific strings are centralized in `lib/brand/tamm.ts` and `lib/brand/shory.ts`. Components read from the brand config.

### 7.2 TAMM legal references

| Key | Value |
|-----|-------|
| `healthInsuranceLaw` | "DOH — Health Finance Law No. 23 of 2005" |
| `healthAuthority` | "Department of Health — Abu Dhabi" |
| `economicDept` | "Abu Dhabi Department of Economic Development (ADDED)" |
| `workersCompLaw` | "Fed. Decree-Law No. 33 / 2021" |
| `freeZone` | "ADGM" |
| `freeZoneRequirement` | "Professional Indemnity — Required by FSRA for regulated activities" |
| `motorLaw` | "UAE Traffic Law" |

### 7.3 TAMM trust badges

```typescript
trustBadges: [
  { label: "Abu Dhabi Department of Economic Development", icon: "added" },
  { label: "UAE Insurance Authority", icon: "uae-ia" },
]
```

### 7.4 Compliance panel (TAMM)

```
Legally required — Abu Dhabi
  Workers Compensation    Fed. Decree-Law No. 33 / 2021
  Motor Insurance         UAE Traffic Law

Required — Abu Dhabi
  Employee Health Insurance    DOH — Health Finance Law No. 23 of 2005

Free zone licence condition — ADGM
  Professional Indemnity    Required by FSRA for regulated activities
```

---

## 8. Process Flow Companion Document

A markdown file at `docs/tamm-process-flow.md` containing:

### 8.1 Journey entry points

| Entry point | User state | Journey start | Auth method |
|-------------|-----------|--------------|-------------|
| TAMM Business Space tile | UAE PASS authenticated | `/quote/results` (pre-filled) | UAE PASS session |
| TAMM Business Space tile | Not authenticated | `/quote/start` with UAE PASS prompt | Manual or UAE PASS |
| Direct URL / QR code | Not authenticated | `/quote/start` | Manual or UAE PASS |
| WhatsApp chatbot | Not authenticated | Chatbot → handoff to web | Phone number |
| ADGM portal | ADGM authenticated | `/quote/results` | ADGM ID |

### 8.2 Data fields

6 categories covering all steps of the journey: business profile, coverage confirmation, company details, policyholder identity, review & pay, payment. Each field documented with required status, source (UAE PASS / manual / OCR), and notes.

### 8.3 Customer documents

Trade licence, Emirates ID, financial statements, previous policy schedule, claims history, valuation certificate, vehicle registration cards — each with trigger condition, format, and notes.

### 8.4 Personas

4 personas from the dev note: Fatima (compliance-first, ADGM legal), Khalid (growth-stage, Masdar City tech), Ahmed (established trader, Musaffah retail), Sara (free zone professional, ADGM marketing).

### 8.5 Payment capabilities

Apple Pay, Google Pay, Card, Bank Transfer, Finwall monthly instalments, UAE PASS Wallet (roadmap), TAMM Pay (roadmap).

---

## 9. File inventory

### New files

| File | Purpose |
|------|---------|
| `apps/web/app/globals-tamm.css` | TAMM design tokens (Tailwind v4) |
| `apps/web/lib/brand/index.ts` | Brand config loader |
| `apps/web/lib/brand/types.ts` | BrandConfig interface |
| `apps/web/lib/brand/shory.ts` | Shory brand config |
| `apps/web/lib/brand/tamm.ts` | TAMM brand config |
| `apps/web/app/tamm-entry/page.tsx` | TAMM Business Space mock entry page |
| `docs/tamm-process-flow.md` | Process flow companion document |

### Modified files

| File | Change |
|------|--------|
| `apps/web/app/layout.tsx` | Conditional CSS import, conditional font loading |
| `apps/web/components/layout/navbar.tsx` | Read brand config for logo, name, nav bg color |
| `apps/web/components/layout/footer.tsx` | Read brand config for footer text |
| `apps/web/app/page.tsx` | Brand-specific hero, copy, trust badges |
| `apps/web/app/quote/start/page.tsx` | UAE PASS button (TAMM), UAE PASS banner |
| `apps/web/app/quote/ai-advisor/page.tsx` | Location chips from brand config |
| `apps/web/app/quote/manual/page.tsx` | Location selector from brand config |
| `apps/web/app/quote/results/page.tsx` | UAE PASS banner, location multiplier pricing |
| `apps/web/app/quote/company-details/page.tsx` | Legal refs from brand, UAE PASS auto-fill |
| `apps/web/app/quote/checkout/page.tsx` | UAE PASS auto-fill, brand trust badges |
| `apps/web/app/quote/confirmation/page.tsx` | Brand logo, name |
| `apps/web/lib/pricing.ts` | New `getLocationMultiplier()` function |
| `apps/backend/src/ai/advisor.ts` | Brand-aware system prompts |
| `apps/backend/src/routes/ai.ts` | Accept `brand` param in AI endpoints |
| `apps/web/lib/api-client.ts` | Pass brand to AI API calls |

---

## 10. Acceptance criteria

All 16 acceptance criteria from the dev note (Section 7) apply. Mapped to this design:

| # | Criterion | Design section |
|---|-----------|---------------|
| 1 | Clean brand separation, no shared mutable state | §2 (brand config module) |
| 2 | All Shory tokens replaced with TAMM equivalents | §2.1 (globals-tamm.css) |
| 3 | No "Dubai", "DHA", "DET", "DIFC" in TAMM user-visible strings | §7 (legal references in brand config) |
| 4 | Emirate selector replaced with Abu Dhabi locality selector | §3.4 (brand.locations) |
| 5 | Default location is Abu Dhabi throughout | §2.3 (brand.defaultLocation) |
| 6 | TAMM logo and Abu Dhabi gov branding | §3.1, §3.2 (navbar, homepage) |
| 7 | UAE PASS pre-fill skips to results | §4.1 (mock UAE PASS flow) |
| 8 | "Pre-filled from UAE PASS ✓" banner | §4.1, §3.5 |
| 9 | TAMM Business Space mock entry card | §4.2 (/tamm-entry page) |
| 10 | AI chatbot no Dubai references | §5.2 (TAMM system prompt) |
| 11 | DOH health insurance law reference | §7.2 (legalReferences) |
| 12 | ADGM free zone compliance panel | §7.4 (compliance panel) |
| 13 | Process flow — 5 entry points | §8.1 |
| 14 | All 6 data field categories documented | §8.2 |
| 15 | All 4 personas documented | §8.4 |
| 16 | Payment capability table | §8.5 |
