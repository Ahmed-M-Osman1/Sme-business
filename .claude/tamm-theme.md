# TAMM Theme Reference

Source: Figma "❇️ Graphics Library" — file `1m6pEkPeGBcPMh483kC5vC`
Node referenced: `43-98` (Cover page)

---

## Color Tokens

Source: Figma "🚙 Motor Insurance — New Flow" (yiXL4hVsu8JgLz7AXGankX)
- Light mode + stepper: node `40000422:130666`
- Quote list: node `40000142:31325`
- Teal value confirmed from `tamm-logo.svg` fill: `#169F9F`

### Core palette

| Token | Hex | Usage |
|---|---|---|
| `--color-text` | `#12121B` | All body text, headings |
| `--color-tamm-teal` | `#169F9F` | Primary teal — buttons, stepper active/complete, badges, links |
| `--color-teal-light` | `#E8F7F7` | Teal-tinted badge backgrounds |
| `--color-background` | `#FAFBFC` | Page background (light mode) |
| `--color-surface` | `#FFFFFF` | Cards, panels, nav |
| `--color-border` | `#E2E8F0` | Borders, dividers |
| `--color-text-muted` | `#94A3B8` | Secondary / inactive text |
| `--color-text-secondary` | `#475569` | Body copy, benefit labels |
| `--color-footer-bg` | `#12121B` | Dark footer background |

### Navy (dark backgrounds — Graphics Library reference)

| Token | Hex | Usage |
|---|---|---|
| `--color-navy-deep` | `#020D22` | Dark gradient start |
| `--color-navy-mid` | `#031D4B` | Dark gradient end |

---

## Typography

**Font**: Circular Std (Figma) → web fallback `var(--font-source-sans)` (Source Sans 3)

Heading scale:
- Page title: `text-2xl sm:text-3xl font-bold text-[#12121B]`
- Section: `text-lg font-semibold`
- Card title: `text-sm font-bold`

---

## Key Visual Patterns

### Nav / Header (QUOTE PAGES — light mode)
- Background: **white** `#FFFFFF`
- Border bottom: `1px solid #E8ECF0`
- Logo: `tamm-logo.svg` (light version — teal bird + black TAMM text)
- Nav links: `#4A5568`, hover → `#12121B`
- Controls: Search, AA, العربية

### Breadcrumb
- Color: `#169F9F` for all crumb links
- Separator: `>` chevron in `#94A3B8`
- Path: Home → Services → Business Insurance

### Stepper (sidebar, right column)
- **Active step**: `#12121B` filled circle, white number
- **Completed step**: `#169F9F` filled circle, white checkmark SVG
- **Inactive step**: white circle, `1.5px #CBD5E0` border, `#94A3B8` number
- Connector line completed: `#169F9F`
- Connector line pending: `#E2E8F0`
- Step labels: active = `#12121B` bold, completed = `#169F9F`, inactive = `#94A3B8`
- "Need support?" — teal triangle warning icon + teal text

### Step names (matching Figma Motor Insurance flow)
1. Request Type
2. Request Details
3. Select Quote
4. Additional Information
5. Application Summary
6. Application Status

### Quote Cards
- White card, `rounded-xl`
- Default border: `1px solid #E2E8F0`
- Highlighted border: `1.5px solid #169F9F` + teal glow shadow
- **BEST** badge: `#169F9F` fill, white text, pill shape, top-right corner
- Price: large bold `#12121B`, currency prefix `#64748B`
- Coverage dots: `#169F9F` filled circles (1.5×1.5)
- "View All Benefits" link: `#169F9F`
- CTA button: `#169F9F` background, white text, `rounded-lg`

### Filter Bar
- Coverage tabs (underline style): Third Party / Shory Plus / Comprehensive
  - Active tab: `#12121B` text, `2px solid #169F9F` bottom border
  - Inactive tab: `#94A3B8` text, transparent border
  - Count badge: active = teal bg + teal text, inactive = grey
- "All Filters" pill: white, border `#E2E8F0`, grey text
- Sort dropdown: white pill, border, grey text + chevron
- "Compare Quotes" button: `#169F9F` fill, white text, `rounded-full`

### Footer (dark — all quote pages)
- Background: `#12121B`
- Navigation row: Back (text) | Exit Service (text) | Next (teal pill button `#169F9F`)
- Logo: `tamm-logo-dark.svg` with `brightness-0 invert` filter
- Copyright text: `white/40`

---

## Logo Usage

| Context | File | Notes |
|---|---|---|
| Light nav (quote pages) | `tamm-logo.svg` | Teal bird + black TAMM text |
| Dark footer | `tamm-logo-dark.svg` | Apply `brightness-0 invert` CSS filter |
| Landing page dark nav | `tamm-logo.svg` with filter | Already handled in tamm/page.tsx |

---

## Component Locations

| Component | Path |
|---|---|
| Page layout | `apps/web/components/quote/tamm-page-layout.tsx` |
| Stepper | `apps/web/components/quote/tamm-stepper.tsx` |
| Quote card | `apps/web/components/quote/tamm-quote-card.tsx` |
| Filter bar | `apps/web/components/quote/tamm-filter-bar.tsx` |
| CSS overrides | `apps/web/app/globals-tamm.css` |
| Brand config | `apps/web/lib/brand/tamm.ts` |
| Landing page | `apps/web/app/tamm/page.tsx` ← **do not modify** |

---

## Do's and Don'ts

**Do:**
- Use `#169F9F` as the single primary teal — buttons, stepper, links, badges
- Keep header **white** on all quote pages (dark header is landing-page-only)
- Use `#12121B` for active stepper circle fill (not teal)
- Use `rounded-xl` for cards, `rounded-full` for pills/badges
- Use the dark footer with Back / Exit Service / Next pattern on all quote pages

**Don't:**
- Use Shory blue `#1D68FF` anywhere in TAMM routes
- Use the old `#0EECDA` bright cyan — the correct teal is `#169F9F`
- Use `#005C9E` Abu Dhabi blue as the main CTA (that's for the landing page banner only)
- Make the quote page nav dark — it must be white per Figma
