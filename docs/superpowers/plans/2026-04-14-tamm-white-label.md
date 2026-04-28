# TAMM White-Label Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add white-label / multi-brand support to `apps/web`, with TAMM (Abu Dhabi government) as the first alternate brand.

**Architecture:** Env-var driven branding (`NEXT_PUBLIC_BRAND=shory|tamm`). Two CSS files for design tokens. A centralized `lib/brand/` TypeScript module exports all brand-specific config (locations, legal refs, copy, trust badges, UAE PASS). Components read from brand config instead of hardcoding.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, Hono, TypeScript strict, shadcn/ui, Google Fonts (Source Sans 3)

**Design spec:** `docs/superpowers/specs/2026-04-14-tamm-white-label-design.md`

---

## Task 1: Brand Config Module

**Files:**
- Create: `apps/web/lib/brand/types.ts`
- Create: `apps/web/lib/brand/shory.ts`
- Create: `apps/web/lib/brand/tamm.ts`
- Create: `apps/web/lib/brand/index.ts`

- [ ] **Step 1: Create the BrandConfig type**

Create `apps/web/lib/brand/types.ts`:

```typescript
export type BrandId = 'shory' | 'tamm';

export interface LocationOption {
  label: string;
  value: string;
}

export interface TrustBadge {
  label: string;
  icon: string;
}

export interface LegalReferences {
  healthInsuranceLaw: string;
  healthAuthority: string;
  economicDept: string;
  workersCompLaw: string;
  freeZone: string;
  freeZoneRequirement: string;
  motorLaw: string;
}

export interface UaePassMockData {
  businessName: string;
  licenceNumber: string;
  activity: string;
  location: string;
  legalForm: string;
  ownerName: string;
  emiratesId: string;
  employees: string;
  revenue: string;
  businessType: string;
  businessLabel: string;
}

export interface ComplianceItem {
  category: string;
  items: { name: string; law: string }[];
}

export interface BrandConfig {
  id: BrandId;
  displayName: string;
  tagline: string;
  logoPath: string;
  logoAlt: string;

  // Geography
  locations: LocationOption[];
  locationLabel: string;
  locationMultipliers: Record<string, number>;
  defaultLocation: string;

  // Legal
  legalReferences: LegalReferences;
  compliancePanel: ComplianceItem[];

  // Trust & branding
  trustBadges: TrustBadge[];
  footerText: string;
  footerCopyright: string;

  // UAE PASS
  uaePassEnabled: boolean;
  uaePassMockData: UaePassMockData | null;

  // AI
  aiPromptVariant: BrandId;

  // Metadata
  metadata: {
    title: string;
    description: string;
  };

  // Styling hints (for things CSS alone can't handle)
  navStyle: 'light' | 'dark';
  issuingAuthorities: string[];
}
```

- [ ] **Step 2: Create Shory brand config**

Create `apps/web/lib/brand/shory.ts`:

```typescript
import type {BrandConfig} from './types';

export const shoryBrand: BrandConfig = {
  id: 'shory',
  displayName: 'Shory',
  tagline: 'Compare and Buy Insurance in the UAE',
  logoPath: '/images/shory-logo.svg',
  logoAlt: 'Shory',

  locations: [
    {label: 'Abu Dhabi', value: 'Abu Dhabi'},
    {label: 'Dubai', value: 'Dubai'},
    {label: 'Sharjah', value: 'Sharjah'},
    {label: 'Ajman', value: 'Ajman'},
    {label: 'Umm Al Quwain', value: 'Umm Al Quwain'},
    {label: 'Ras Al Khaimah', value: 'Ras Al Khaimah'},
    {label: 'Fujairah', value: 'Fujairah'},
  ],
  locationLabel: 'Emirate',
  locationMultipliers: {
    'Abu Dhabi': 1.0,
    Dubai: 1.0,
    Sharjah: 1.0,
    Ajman: 1.0,
    'Umm Al Quwain': 1.0,
    'Ras Al Khaimah': 1.0,
    Fujairah: 1.0,
  },
  defaultLocation: 'Dubai',

  legalReferences: {
    healthInsuranceLaw: 'Health Insurance Law No. 11 of 2013',
    healthAuthority: 'Dubai Health Authority (DHA)',
    economicDept: 'Dubai Department of Economy and Tourism (DET)',
    workersCompLaw: 'Fed. Decree-Law No. 33 / 2021',
    freeZone: 'DIFC',
    freeZoneRequirement: 'Professional Indemnity — Required by DFSA for regulated activities',
    motorLaw: 'UAE Traffic Law',
  },
  compliancePanel: [
    {
      category: 'Legally required — UAE',
      items: [
        {name: 'Workers Compensation', law: 'Fed. Decree-Law No. 33 / 2021'},
        {name: 'Motor Insurance', law: 'UAE Traffic Law'},
      ],
    },
    {
      category: 'Required — Dubai',
      items: [
        {name: 'Employee Health Insurance', law: 'DHA — Health Insurance Law No. 11 of 2013'},
      ],
    },
    {
      category: 'Free zone licence condition — DIFC',
      items: [
        {name: 'Professional Indemnity', law: 'Required by DFSA for regulated activities'},
      ],
    },
  ],

  trustBadges: [
    {label: 'Licensed by the Central Bank of the UAE', icon: 'central-bank'},
  ],
  footerText: 'Shory Insurance Broker LLC. Licensed and regulated by the Central Bank of the UAE.',
  footerCopyright: '© 2026 Shory. All rights reserved.',

  uaePassEnabled: false,
  uaePassMockData: null,

  aiPromptVariant: 'shory',

  metadata: {
    title: 'Shory — Compare and Buy Insurance in the UAE',
    description: 'Top insurers. Best prices. One app. Get instant insurance quotes from leading insurers.',
  },

  navStyle: 'light',
  issuingAuthorities: ['DET', 'DHA', 'DIFC', 'ADGM', 'ADDED', 'ADAFZA', 'RAKEZ', 'SAIF Zone', 'JAFZA'],
};
```

- [ ] **Step 3: Create TAMM brand config**

Create `apps/web/lib/brand/tamm.ts`:

```typescript
import type {BrandConfig} from './types';

export const tammBrand: BrandConfig = {
  id: 'tamm',
  displayName: 'TAMM Business Insurance',
  tagline: 'Abu Dhabi SME Insurance',
  logoPath: '/images/tamm-logo.svg',
  logoAlt: 'TAMM — Abu Dhabi Government',

  locations: [
    {label: 'Abu Dhabi City', value: 'Abu Dhabi City'},
    {label: 'Al Ain', value: 'Al Ain'},
    {label: 'Al Dhafra', value: 'Al Dhafra'},
    {label: 'ADGM', value: 'ADGM'},
    {label: 'Musaffah', value: 'Musaffah'},
    {label: 'Abu Dhabi Airport Free Zone', value: 'Abu Dhabi Airport Free Zone'},
  ],
  locationLabel: 'Location',
  locationMultipliers: {
    'Abu Dhabi City': 1.0,
    'Al Ain': 0.97,
    'Al Dhafra': 0.95,
    ADGM: 1.12,
    Musaffah: 0.98,
    'Abu Dhabi Airport Free Zone': 1.05,
  },
  defaultLocation: 'Abu Dhabi City',

  legalReferences: {
    healthInsuranceLaw: 'Health Finance Law No. 23 of 2005',
    healthAuthority: 'Department of Health — Abu Dhabi (DOH)',
    economicDept: 'Abu Dhabi Department of Economic Development (ADDED)',
    workersCompLaw: 'Fed. Decree-Law No. 33 / 2021',
    freeZone: 'ADGM',
    freeZoneRequirement: 'Professional Indemnity — Required by FSRA for regulated activities',
    motorLaw: 'UAE Traffic Law',
  },
  compliancePanel: [
    {
      category: 'Legally required — Abu Dhabi',
      items: [
        {name: 'Workers Compensation', law: 'Fed. Decree-Law No. 33 / 2021'},
        {name: 'Motor Insurance', law: 'UAE Traffic Law'},
      ],
    },
    {
      category: 'Required — Abu Dhabi',
      items: [
        {name: 'Employee Health Insurance', law: 'DOH — Health Finance Law No. 23 of 2005'},
      ],
    },
    {
      category: 'Free zone licence condition — ADGM',
      items: [
        {name: 'Professional Indemnity', law: 'Required by FSRA for regulated activities'},
      ],
    },
  ],

  trustBadges: [
    {label: 'Abu Dhabi Department of Economic Development', icon: 'added'},
    {label: 'UAE Insurance Authority', icon: 'uae-ia'},
  ],
  footerText: 'Powered by TAMM — Abu Dhabi Government',
  footerCopyright: '© 2026 TAMM. Abu Dhabi Government. All rights reserved.',

  uaePassEnabled: true,
  uaePassMockData: {
    businessName: 'Al Mansoori Legal Consultancy',
    licenceNumber: 'CN-1234567',
    activity: 'Legal consultancy',
    location: 'ADGM',
    legalForm: 'Free Zone Establishment',
    ownerName: 'Fatima Al Mansoori',
    emiratesId: '784-1990-1234567-1',
    employees: '6-20',
    revenue: '1m-5m',
    businessType: 'law-firm',
    businessLabel: 'Law Firm / Legal',
  },

  aiPromptVariant: 'tamm',

  metadata: {
    title: 'TAMM — Abu Dhabi SME Business Insurance',
    description: 'Get your Abu Dhabi SME covered in minutes. Workers Compensation, Liability, Property and more.',
  },

  navStyle: 'dark',
  issuingAuthorities: ['ADDED', 'ADGM', 'ADAFZA', 'ADAFZ'],
};
```

- [ ] **Step 4: Create the brand loader**

Create `apps/web/lib/brand/index.ts`:

```typescript
import type {BrandConfig, BrandId} from './types';
import {shoryBrand} from './shory';
import {tammBrand} from './tamm';

const BRANDS: Record<BrandId, BrandConfig> = {
  shory: shoryBrand,
  tamm: tammBrand,
};

function resolveBrandId(): BrandId {
  const env = process.env.NEXT_PUBLIC_BRAND;
  if (env === 'tamm') return 'tamm';
  return 'shory';
}

let cached: BrandConfig | null = null;

export function getBrand(): BrandConfig {
  if (!cached) {
    cached = BRANDS[resolveBrandId()];
  }
  return cached;
}

export function isTamm(): boolean {
  return resolveBrandId() === 'tamm';
}

export type {BrandConfig, BrandId, LocationOption, TrustBadge, LegalReferences, UaePassMockData, ComplianceItem} from './types';
```

- [ ] **Step 5: Verify TypeScript compiles**

Run: `cd /Users/ahmedosman/Developer/the-one-and-only/shory-sme && pnpm turbo run typecheck --filter=web`

Expected: No type errors in brand module.

- [ ] **Step 6: Commit**

```bash
git add apps/web/lib/brand/
git commit -m "feat: add brand config module for white-label support (shory + tamm)"
```

---

## Task 2: TAMM CSS Tokens

**Files:**
- Create: `apps/web/app/globals-tamm.css`
- Modify: `apps/web/app/layout.tsx`

- [ ] **Step 1: Create TAMM CSS file**

Create `apps/web/app/globals-tamm.css`:

```css
@import "tailwindcss";

@theme inline {
  /* Primary — Abu Dhabi Gov blue */
  --color-primary: #005C9E;
  --color-primary-hover: #004B82;
  --color-primary-light: #E8F1F8;
  --color-primary-mid: #B3CFDF;

  /* Neutral */
  --color-background: #F4F6F8;
  --color-surface: #FFFFFF;
  --color-border: #DEE2E6;
  --color-text: #1A1A1A;
  --color-text-muted: #64748B;

  /* Accent */
  --color-success: #1D7A4E;
  --color-success-light: #E8F7F0;
  --color-warning: #C2790E;
  --color-error: #C0272D;

  /* Nav */
  --color-nav-bg: #005C9E;
  --color-nav-text: #FFFFFF;

  /* Fonts */
  --font-sans: var(--font-source-sans);
  --font-mono: var(--font-geist-mono);
}

body {
  background: var(--color-background);
  color: var(--color-text);
}

*:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

- [ ] **Step 2: Update layout.tsx for conditional CSS and fonts**

Modify `apps/web/app/layout.tsx`. The layout needs to:
1. Conditionally import the right CSS file
2. Load Source Sans 3 for TAMM, Bliss Pro for Shory
3. Set metadata from brand config

Since Next.js requires static CSS imports, use a wrapper approach: import both CSS files, but the TAMM one only when env matches. The simplest approach is to create a `globals-brand.css` that imports the correct one. However, since CSS is evaluated at build time and `@import` doesn't support runtime conditions, the cleanest way is:

Replace the current `import './globals.css'` with a conditional:

```typescript
import type {Metadata} from 'next';
import localFont from 'next/font/local';
import {Source_Sans_3} from 'next/font/google';
import {Navbar} from '@/components/layout/navbar';
import {Footer} from '@/components/layout/footer';
import {ErrorBoundary} from '@/components/error-boundary';
import {I18nProvider} from '@/lib/i18n';
import {SessionProviderWrapper} from '@/components/layout/session-provider-wrapper';
import {getBrand} from '@/lib/brand';

// CSS: import both, Tailwind tree-shakes unused tokens at build
// The brand-specific file overrides the base when NEXT_PUBLIC_BRAND=tamm
if (process.env.NEXT_PUBLIC_BRAND === 'tamm') {
  require('./globals-tamm.css');
} else {
  require('./globals.css');
}

const blissPro = localFont({
  src: [
    { path: '../public/fonts/BlissProLight.otf', weight: '300', style: 'normal' },
    { path: '../public/fonts/BlissProRegular.otf', weight: '400', style: 'normal' },
    { path: '../public/fonts/BlissProMedium.otf', weight: '500', style: 'normal' },
    { path: '../public/fonts/BlissProExtraBold.otf', weight: '800', style: 'normal' },
  ],
  variable: '--font-bliss-pro',
  display: 'swap',
});

const pingArLt = localFont({
  src: [
    { path: '../public/fonts/PingARLTRegular.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/PingARLTMedium.woff2', weight: '500', style: 'normal' },
    { path: '../public/fonts/PingARLTBold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-ping-arlt',
  display: 'swap',
});

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  variable: '--font-source-sans',
  display: 'swap',
});

const brand = getBrand();

export const metadata: Metadata = {
  title: brand.metadata.title,
  description: brand.metadata.description,
};

const isTamm = brand.id === 'tamm';

export default function RootLayout({
  children,
}: Readonly<{children: React.ReactNode}>) {
  const fontVars = isTamm
    ? `${sourceSans.variable} ${pingArLt.variable}`
    : `${blissPro.variable} ${pingArLt.variable}`;

  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      className={`h-full antialiased ${fontVars}`}
      data-brand={brand.id}
    >
      <body className="min-h-full flex flex-col">
        <ErrorBoundary>
          <SessionProviderWrapper>
            <I18nProvider>
              <Navbar />
              {children}
              <Footer />
            </I18nProvider>
          </SessionProviderWrapper>
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

**Note:** The `require()` approach for conditional CSS may need testing with Next.js 16. If it doesn't work, an alternative is two separate layout files selected via `next.config.ts` or a CSS import that uses `@layer` to scope. Test and adapt.

- [ ] **Step 3: Add placeholder logo SVGs**

Create `apps/web/public/images/tamm-logo.svg` as a simple placeholder:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40" fill="none">
  <rect width="120" height="40" rx="4" fill="#005C9E"/>
  <text x="60" y="25" text-anchor="middle" fill="white" font-family="sans-serif" font-size="16" font-weight="bold">TAMM</text>
</svg>
```

Also check if `shory-logo.svg` exists at `apps/web/public/images/`. If not, create a similar placeholder.

- [ ] **Step 4: Verify the app builds**

Run: `cd /Users/ahmedosman/Developer/the-one-and-only/shory-sme && NEXT_PUBLIC_BRAND=tamm pnpm turbo run build --filter=web`

Expected: Build succeeds. If `require()` for CSS fails, switch to a different import strategy and retry.

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/globals-tamm.css apps/web/app/layout.tsx apps/web/public/images/
git commit -m "feat: add TAMM CSS tokens and conditional layout theming"
```

---

## Task 3: Navbar Brand Support

**Files:**
- Modify: `apps/web/components/layout/navbar.tsx`

- [ ] **Step 1: Update navbar to read brand config**

Replace the current `navbar.tsx` content. Key changes:
- Import `getBrand` from `@/lib/brand`
- Use `brand.displayName` instead of `t.common.appName`
- Use `brand.logoPath` for the logo image
- Apply `brand.navStyle` for dark/light backgrounds

```typescript
'use client';

import Link from 'next/link';
import Image from 'next/image';
import {Button} from '@shory/ui';
import {useI18n} from '@/lib/i18n';
import {NotificationBell} from '@/components/notifications/notification-bell';
import {getBrand} from '@/lib/brand';

const ADMIN_URL =
  process.env.NEXT_PUBLIC_ADMIN_URL ?? 'http://localhost:3001';

export function Navbar() {
  const {t, toggleLocale} = useI18n();
  const brand = getBrand();
  const isDark = brand.navStyle === 'dark';

  const NAV_LINKS = [{label: t.nav.business, href: '/quote/start'}];

  return (
    <nav className={`sticky top-0 z-50 border-b ${isDark ? 'bg-[var(--color-nav-bg)] border-[var(--color-nav-bg)]' : 'bg-white border-border'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src={brand.logoPath}
              alt={brand.logoAlt}
              width={100}
              height={32}
              className="h-8 w-auto"
            />
            {brand.id === 'shory' && (
              <span className="text-2xl font-black italic text-text">
                {brand.displayName}
              </span>
            )}
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-200 ${isDark ? 'text-white/90 hover:text-white' : 'text-text hover:text-text-muted'}`}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell />
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLocale}
            className={`rounded-full px-4 gap-2 text-sm font-medium transition-colors ${isDark ? 'border-white/30 text-white hover:bg-white/10' : 'border-border hover:bg-gray-50'}`}>
            <svg
              width="20"
              height="15"
              viewBox="0 0 12 9"
              className="rounded-sm overflow-hidden shrink-0">
              <rect width="12" height="3" fill="#00732F" />
              <rect width="12" height="3" y="3" fill="#FFFFFF" />
              <rect width="12" height="3" y="6" fill="#000000" />
              <rect width="3" height="9" fill="#EF3340" />
            </svg>
            {t.nav.switchLang}
          </Button>
          <Link href="/dashboard">
            <Button
              variant="outline"
              size="sm"
              className={`rounded-full px-6 text-sm font-medium ${isDark ? 'border-white/30 text-white hover:bg-white/10' : 'border-border'}`}>
              {t.nav.dashboard}
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Verify navbar renders correctly**

Run: `cd /Users/ahmedosman/Developer/the-one-and-only/shory-sme && pnpm turbo run typecheck --filter=web`

Start dev server and check visually: `NEXT_PUBLIC_BRAND=tamm pnpm --filter web dev`
- Shory: white bg, dark text, "Shory" wordmark
- TAMM: blue bg `#005C9E`, white text, TAMM logo placeholder

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/layout/navbar.tsx
git commit -m "feat: make navbar brand-aware (logo, colors, display name)"
```

---

## Task 4: Footer Brand Support

**Files:**
- Modify: `apps/web/components/layout/footer.tsx`

- [ ] **Step 1: Update footer to read brand config**

Key changes to `apps/web/components/layout/footer.tsx`:
- Import `getBrand` from `@/lib/brand`
- Replace hardcoded "Shory." wordmark (line 101) with `brand.displayName`
- Replace `t.footer.licensedBy` text (line 110) with `brand.footerText`
- Replace copyright (line 111) with `brand.footerCopyright`
- For TAMM: hide the "Download App" section and Shory-specific links

At line 101, replace `<span className="text-xl font-black italic text-text">Shory.</span>` with:

```typescript
const brand = getBrand();
// ... in render:
<span className="text-xl font-black italic text-text">{brand.displayName}</span>
```

At lines 109-112, replace the licensed-by/copyright block with:

```typescript
<div className="text-[10px] text-text-muted leading-relaxed max-w-2xl">
  <p>{brand.footerText}</p>
  <p>{brand.footerCopyright}</p>
</div>
```

For TAMM, conditionally hide the "Download App" column (the 4th grid column) since TAMM doesn't have a mobile app:

```typescript
{brand.id === 'shory' && (
  <div>
    <h4 className="text-sm font-semibold text-text mb-4">{t.footer.downloadApp}</h4>
    {/* ... existing download content ... */}
  </div>
)}
```

- [ ] **Step 2: Verify footer renders**

Run dev server with both brands and check footer output.

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/layout/footer.tsx
git commit -m "feat: make footer brand-aware (branding, legal text, conditional sections)"
```

---

## Task 5: Homepage Brand Support

**Files:**
- Modify: `apps/web/components/landing/hero.tsx`
- Modify: `apps/web/components/landing/trust-badges.tsx`

- [ ] **Step 1: Update hero for TAMM branding**

Modify `apps/web/components/landing/hero.tsx`:
- Import `getBrand` from `@/lib/brand`
- For TAMM: show only the business tab (no personal insurance tab toggle), use TAMM tagline
- The hero title and subtitle should come from brand-aware i18n or direct brand config

Key change — wrap the tab toggle in a brand check. For TAMM, skip the toggle and show business products only:

```typescript
const brand = getBrand();
const showTabs = brand.id === 'shory';

// If TAMM, force business tab
const [activeTab, setActiveTab] = useState<'personal' | 'business'>('business');
const products = activeTab === 'personal' ? personalProducts : businessProducts;
```

In render, wrap the tab toggle:

```typescript
{showTabs && (
  <div className="relative mt-8 inline-flex rounded-full border border-gray-200 bg-gray-50 p-1" key={locale}>
    {/* existing tab toggle JSX */}
  </div>
)}
```

For the TAMM hero title, add a brand-aware override. If `brand.id === 'tamm'`, show "Abu Dhabi SME Insurance" as the title and "Get your business covered in minutes" as subtitle. Use the brand config:

```typescript
<h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl whitespace-pre-line">
  {brand.id === 'tamm' ? brand.tagline : t.landing.heroTitle}
</h1>
```

- [ ] **Step 2: Update trust badges for TAMM**

Modify `apps/web/components/landing/trust-badges.tsx`:
- Import `getBrand` from `@/lib/brand`
- Read `brand.trustBadges` instead of hardcoding "Central Bank" badge
- For TAMM: show ADDED + UAE Insurance Authority badges

Replace the hardcoded Central Bank badge section with:

```typescript
const brand = getBrand();

// In render:
{brand.trustBadges.map((badge) => (
  <div key={badge.label} className="flex items-center gap-3">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100">
      <svg className="h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18" />
        <path d="M5 21V7l7-4 7 4v14" />
        <path d="M9 21v-4h6v4" />
        <path d="M3 7h18" />
      </svg>
    </div>
    <p className="text-xs leading-tight text-gray-500">{badge.label}</p>
  </div>
))}
```

Keep the Google rating badge as-is (brand-agnostic).

- [ ] **Step 3: Verify homepage renders for both brands**

Start dev server with each brand and check visually.

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/landing/hero.tsx apps/web/components/landing/trust-badges.tsx
git commit -m "feat: make homepage brand-aware (hero, trust badges)"
```

---

## Task 6: Location Selector — AI Advisor

**Files:**
- Modify: `apps/web/app/quote/ai-advisor/page.tsx`

- [ ] **Step 1: Replace emirate chips with brand locations**

In `apps/web/app/quote/ai-advisor/page.tsx`, the emirate chips are built from `quoteOptions.emirates` at line 67-69:

```typescript
const emirateChips = quoteOptions.emirates.map((emirate) => ({
  label: (t.options.emirates as Record<string, string>)[emirate] ?? emirate,
  value: emirate,
}));
```

Replace with:

```typescript
import {getBrand} from '@/lib/brand';

// Inside the component:
const brand = getBrand();
const locationChips = brand.locations.map((loc) => ({
  label: (t.options.emirates as Record<string, string>)[loc.value] ?? loc.label,
  value: loc.value,
}));
```

Then replace all references to `emirateChips` with `locationChips` throughout the file. Key locations:
- Line 130: `emirateChips.find(...)` → `locationChips.find(...)`
- Line 167: `chips: emirateChips` → `chips: locationChips`

Also update `buildResultsUrl()` at line 133-142 to use `brand.locationLabel` param name. The current code uses `emirate` as the URL param — keep it as `emirate` for URL compatibility but populate from brand locations.

- [ ] **Step 2: Verify AI advisor shows correct locations**

Run dev server with `NEXT_PUBLIC_BRAND=tamm` and go through the AI advisor flow. At the emirate/location step, should show 6 Abu Dhabi localities instead of 7 emirates.

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/quote/ai-advisor/page.tsx
git commit -m "feat: AI advisor uses brand locations instead of hardcoded emirates"
```

---

## Task 7: Location Selector — Company Details

**Files:**
- Modify: `apps/web/components/quote/company-details.tsx`

- [ ] **Step 1: Replace EMIRATES constant with brand locations**

In `apps/web/components/quote/company-details.tsx` at line 14:

```typescript
const EMIRATES = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'RAK', 'Fujairah', 'UAQ', 'DIFC', 'ADGM'];
```

Replace with:

```typescript
import {getBrand} from '@/lib/brand';

// Inside the component (not at module level, since getBrand reads env):
const brand = getBrand();
const LOCATIONS = brand.locations.map((loc) => loc.value);
```

Then replace all references to `EMIRATES` with `LOCATIONS` or `brand.issuingAuthorities` (for the issuing authority dropdown, which is separate from location). Search the file for `EMIRATES` and update each usage.

Also update any "emirate" label text to use `brand.locationLabel`.

- [ ] **Step 2: Verify company details form shows correct locations**

Run dev server with TAMM brand and navigate to company details. The emirate/location dropdown should show Abu Dhabi localities.

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/quote/company-details.tsx
git commit -m "feat: company details uses brand locations and issuing authorities"
```

---

## Task 8: Location Selector — Manual Entry & Other Pages

**Files:**
- Modify: `apps/web/app/quote/manual/page.tsx`
- Modify: `apps/web/components/quote/manual-step1.tsx` (if it has emirate selection)
- Modify: `apps/web/components/quote/manual-step2.tsx` (if it has emirate selection)

- [ ] **Step 1: Find and update all remaining emirate selectors**

Search the codebase for any remaining hardcoded emirate references:

Run: `cd /Users/ahmedosman/Developer/the-one-and-only/shory-sme && grep -rn "emirates\|EMIRATES\|emirate" apps/web/components/quote/manual-step*.tsx apps/web/app/quote/manual/page.tsx 2>/dev/null`

For each file found, replace the emirate list with `getBrand().locations` following the same pattern as Tasks 6 and 7.

- [ ] **Step 2: Verify manual entry flow uses brand locations**

Test manual entry flow with TAMM brand.

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/quote/manual-step1.tsx apps/web/components/quote/manual-step2.tsx apps/web/app/quote/manual/page.tsx
git commit -m "feat: manual entry uses brand locations"
```

---

## Task 9: Pricing — Location Multipliers

**Files:**
- Modify: `apps/web/lib/pricing.ts`
- Modify: `apps/web/components/quote/quote-results.tsx`

- [ ] **Step 1: Add location multiplier function to pricing.ts**

Add to `apps/web/lib/pricing.ts` after the existing `getSizeFactor` function (after line 65):

```typescript
import type {BrandConfig} from '@/lib/brand';

export function getLocationMultiplier(location: string, brand: BrandConfig): number {
  return brand.locationMultipliers[location] ?? 1.0;
}
```

- [ ] **Step 2: Apply location multiplier in quote results**

In `apps/web/components/quote/quote-results.tsx`, find where the total premium is calculated. The emirate value is read at line 302:

```typescript
const emirate = searchParams.get('emirate') ?? 'Dubai';
```

Replace the default with brand default:

```typescript
import {getBrand} from '@/lib/brand';
import {getLocationMultiplier} from '@/lib/pricing';

const brand = getBrand();
const emirate = searchParams.get('emirate') ?? brand.defaultLocation;
const locationMultiplier = getLocationMultiplier(emirate, brand);
```

Then find where `calculateTotalPremium` is called and multiply the result by `locationMultiplier`. Search for `calculateTotalPremium` in the file and apply the multiplier:

```typescript
const total = Math.round(calculateTotalPremium(input, productsMap) * locationMultiplier);
```

- [ ] **Step 3: Verify pricing changes with TAMM brand**

Run dev with TAMM brand, select ADGM location → prices should be 12% higher than Abu Dhabi City. Select Al Dhafra → 5% lower.

- [ ] **Step 4: Commit**

```bash
git add apps/web/lib/pricing.ts apps/web/components/quote/quote-results.tsx
git commit -m "feat: apply brand location multipliers to pricing"
```

---

## Task 10: UAE PASS Mock Flow

**Files:**
- Modify: `apps/web/app/quote/start/page.tsx`
- Modify: `apps/web/components/quote/quote-results.tsx`
- Modify: `apps/web/components/quote/company-details.tsx`
- Modify: `apps/web/components/quote/checkout.tsx`

- [ ] **Step 1: Add UAE PASS button to quote start page**

Modify `apps/web/app/quote/start/page.tsx`. Add a UAE PASS banner above the featured card when brand has UAE PASS enabled:

```typescript
import {getBrand} from '@/lib/brand';
import {useRouter} from 'next/navigation';

// Inside component:
const brand = getBrand();
const router = useRouter();

function handleUaePassLogin() {
  if (!brand.uaePassMockData) return;
  // Store mock data in session storage
  sessionStorage.setItem('uaepass-data', JSON.stringify(brand.uaePassMockData));
  // Redirect to results with pre-filled params
  const d = brand.uaePassMockData;
  router.push(
    `/quote/results?uaepass=true&businessType=${d.businessType}&employees=${d.employees}&revenue=${d.revenue}&emirate=${encodeURIComponent(d.location)}`
  );
}
```

Add the banner JSX before the featured card (before line 73):

```tsx
{brand.uaePassEnabled && (
  <button
    onClick={handleUaePassLogin}
    className="w-full rounded-xl border-2 border-success/30 bg-success-light p-4 flex items-center justify-between hover:border-success/50 transition-all duration-200 cursor-pointer"
  >
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
        <svg className="w-5 h-5 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 12l2 2 4-4" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      </div>
      <div className="text-start">
        <p className="font-semibold text-text text-sm">Sign in with UAE PASS</p>
        <p className="text-xs text-text-muted">Auto-fill your business details instantly</p>
      </div>
    </div>
    <svg className="w-5 h-5 text-success" viewBox="0 0 20 20" fill="none">
      <path d="M7.5 4.167L13.333 10L7.5 15.833" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </button>
)}
```

- [ ] **Step 2: Add UAE PASS banner to quote results**

In `apps/web/components/quote/quote-results.tsx`, add a green banner when `uaepass=true` is in the URL. Find where the component renders its main content and add at the top:

```typescript
const isUaePass = searchParams.get('uaepass') === 'true';

// In render, before the main content:
{isUaePass && (
  <div className="bg-success-light border border-success/20 rounded-xl p-4 flex items-center gap-3">
    <svg className="w-5 h-5 text-success shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 12l2 2 4-4" />
      <circle cx="12" cy="12" r="10" />
    </svg>
    <p className="text-sm font-medium text-success">Pre-filled from UAE PASS ✓</p>
  </div>
)}
```

- [ ] **Step 3: Auto-fill company details from UAE PASS**

In `apps/web/components/quote/company-details.tsx`, check for UAE PASS data in session storage on mount. If present, pre-populate the form and set mode to `confirmed`:

```typescript
useEffect(() => {
  const raw = sessionStorage.getItem('uaepass-data');
  if (raw) {
    try {
      const uaePass = JSON.parse(raw);
      setOcrResult({
        companyName: uaePass.businessName,
        licenseNumber: uaePass.licenceNumber,
        activity: uaePass.activity,
        emirate: uaePass.location,
        expiryDate: '15/12/2027', // Mock future date
        issuingAuthority: uaePass.location === 'ADGM' ? 'ADGM' : 'ADDED',
      });
      setMode('confirmed');
      setIsVerified(true);
    } catch {
      // ignore invalid data
    }
  }
}, []);
```

- [ ] **Step 4: Auto-fill checkout from UAE PASS**

In `apps/web/components/quote/checkout.tsx`, check for UAE PASS data and pre-fill contact fields:

```typescript
useEffect(() => {
  const raw = sessionStorage.getItem('uaepass-data');
  if (raw) {
    try {
      const uaePass = JSON.parse(raw);
      setContact((prev) => ({
        ...prev,
        fullName: uaePass.ownerName || prev.fullName,
        emiratesId: uaePass.emiratesId || prev.emiratesId,
      }));
    } catch {
      // ignore
    }
  }
}, []);
```

- [ ] **Step 5: Verify UAE PASS flow end-to-end**

With TAMM brand:
1. Go to `/quote/start`
2. Click "Sign in with UAE PASS"
3. Should redirect to `/quote/results?uaepass=true&...`
4. Green banner shows
5. Navigate to company details → fields pre-filled
6. Navigate to checkout → name and EID pre-filled

- [ ] **Step 6: Commit**

```bash
git add apps/web/app/quote/start/page.tsx apps/web/components/quote/quote-results.tsx apps/web/components/quote/company-details.tsx apps/web/components/quote/checkout.tsx
git commit -m "feat: mock UAE PASS pre-fill flow for TAMM brand"
```

---

## Task 11: TAMM Business Space Entry Page

**Files:**
- Create: `apps/web/app/tamm-entry/page.tsx`

- [ ] **Step 1: Create the TAMM entry page**

Create `apps/web/app/tamm-entry/page.tsx`:

```typescript
'use client';

import {useRouter} from 'next/navigation';
import {useEffect} from 'react';
import {Button, Card, CardContent, Badge} from '@shory/ui';
import {getBrand} from '@/lib/brand';
import Link from 'next/link';

const MOCK_SERVICES = [
  {
    icon: '📋',
    title: 'Trade Licence Renewal',
    titleAr: 'تجديد الرخصة التجارية',
    description: 'Renew your Abu Dhabi trade licence online',
    active: false,
  },
  {
    icon: '🏢',
    title: 'Business Registration',
    titleAr: 'تسجيل الأعمال',
    description: 'Register a new business in Abu Dhabi',
    active: false,
  },
  {
    icon: '🛡️',
    title: 'Business Insurance',
    titleAr: 'تأمين الأعمال',
    description: 'Get your SME covered in minutes — Workers Compensation, Liability, Property and more.',
    active: true,
    badge: 'Popular',
  },
  {
    icon: '✈️',
    title: 'Visa Services',
    titleAr: 'خدمات التأشيرات',
    description: 'Apply for employee and investor visas',
    active: false,
  },
  {
    icon: '📊',
    title: 'Tax Registration',
    titleAr: 'التسجيل الضريبي',
    description: 'Register for VAT and corporate tax',
    active: false,
  },
  {
    icon: '👷',
    title: 'Labour Permits',
    titleAr: 'تصاريح العمل',
    description: 'Apply for work permits and labour cards',
    active: false,
  },
];

export default function TammEntryPage() {
  const brand = getBrand();
  const router = useRouter();

  // Redirect non-TAMM brands
  useEffect(() => {
    if (brand.id !== 'tamm') {
      router.replace('/');
    }
  }, [brand.id, router]);

  if (brand.id !== 'tamm') return null;

  function handleUaePassQuote() {
    if (!brand.uaePassMockData) return;
    sessionStorage.setItem('uaepass-data', JSON.stringify(brand.uaePassMockData));
    const d = brand.uaePassMockData;
    router.push(
      `/quote/results?uaepass=true&businessType=${d.businessType}&employees=${d.employees}&revenue=${d.revenue}&emirate=${encodeURIComponent(d.location)}`
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* TAMM Business Space Header */}
      <div className="bg-[var(--color-nav-bg)] text-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Business Space</h1>
              <p className="text-white/70 mt-1 text-sm">مساحة الأعمال</p>
            </div>
            <div className="text-end">
              <p className="text-sm text-white/70">tamm.abudhabi</p>
              <p className="text-xs text-white/50">Abu Dhabi Government</p>
            </div>
          </div>
        </div>
      </div>

      {/* Service Tiles Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-lg font-semibold text-text mb-6">Services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_SERVICES.map((service) => (
            <Card
              key={service.title}
              className={`rounded-lg border bg-white shadow-sm ${
                service.active
                  ? 'border-primary/30 ring-1 ring-primary/10'
                  : 'border-border opacity-60'
              }`}
            >
              <CardContent className="p-6 flex flex-col gap-3 relative">
                {service.badge && (
                  <Badge className="absolute top-4 end-4 bg-warning/10 text-warning text-[10px] px-2 py-0.5 rounded">
                    {service.badge}
                  </Badge>
                )}
                <div className="w-12 h-12 rounded-lg bg-primary/5 flex items-center justify-center text-2xl">
                  {service.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text">{service.title}</h3>
                  <p className="text-xs text-text-muted mt-0.5">{service.titleAr}</p>
                </div>
                <p className="text-sm text-text-muted leading-relaxed">{service.description}</p>

                {service.active ? (
                  <div className="flex flex-col gap-2 mt-2">
                    <Link href="/quote/start">
                      <Button className="w-full rounded-md bg-primary text-white text-sm font-medium hover:bg-primary-hover">
                        Get a quote →
                      </Button>
                    </Link>
                    <button
                      onClick={handleUaePassQuote}
                      className="w-full rounded-md border border-success/30 bg-success-light text-success text-sm font-medium py-2 px-4 hover:border-success/50 transition-colors"
                    >
                      Get a quote with UAE PASS ✓
                    </button>
                  </div>
                ) : (
                  <Button
                    disabled
                    className="w-full rounded-md bg-gray-100 text-gray-400 text-sm font-medium mt-2 cursor-not-allowed"
                  >
                    Coming soon
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TAMM entry page**

Run dev with TAMM brand, navigate to `/tamm-entry`:
- Should show mock Business Space layout
- Insurance tile is active with two CTAs
- Other tiles are disabled
- "Get a quote" → `/quote/start`
- "Get a quote with UAE PASS" → `/quote/results?uaepass=true&...`
- With Shory brand, `/tamm-entry` should redirect to `/`

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/tamm-entry/page.tsx
git commit -m "feat: add TAMM Business Space mock entry page"
```

---

## Task 12: Brand-Aware AI Prompts

**Files:**
- Modify: `apps/backend/src/ai/advisor.ts`
- Modify: `apps/backend/src/routes/ai.ts`
- Modify: `apps/web/lib/api-client.ts`

- [ ] **Step 1: Add TAMM system prompts to advisor.ts**

In `apps/backend/src/ai/advisor.ts`, add TAMM-specific prompts alongside the existing ones. After the existing `SYSTEM_PROMPT` (line 8-31), add:

```typescript
const SYSTEM_PROMPT_TAMM = `You are a professional AI insurance advisor for SME businesses in Abu Dhabi, working for TAMM Business Insurance — an Abu Dhabi government digital platform.

## Guidelines

### Answer Quality
- Provide concise, accurate, and relevant insurance recommendations.
- Prioritise Abu Dhabi-specific regulatory requirements and market practices.
- Avoid speculation — only recommend coverage types you are confident apply to the business profile.
- Format responses as structured JSON as instructed. Keep reasoning short (1-2 sentences).

### Domain Boundary
You ONLY answer questions related to Abu Dhabi SME business insurance.
This platform serves Abu Dhabi SMEs exclusively.
If asked about anything outside this scope, respond with:
{ "error": "out_of_scope", "message": "This falls outside Abu Dhabi SME business insurance. For other topics, please contact TAMM support." }

### UAE Legal Knowledge — Abu Dhabi
- Workers Compensation: mandatory for all private sector employers — Federal law applies in Abu Dhabi.
- Health Insurance: mandatory for all employees in Abu Dhabi under DOH Health Finance Law No. 23 of 2005.
- Professional Indemnity: required for FSRA-regulated activities in ADGM.
- Fleet Insurance: compulsory under UAE Traffic Law.
- ADGM: requires Employer Liability as a free zone licence condition.
- All references to location are Abu Dhabi only.

### Hard Rules
- Never fabricate facts or invent coverage types.
- Never recommend coverage that does not exist in the UAE insurance market.
- Never provide legal, tax, or financial advice beyond insurance recommendations.
- If you cannot confidently recommend coverage for a given business profile, return an empty array [] rather than guessing.

### Confidence
- If your recommendation is based on incomplete information, include a note in the reasoning field: "Based on limited information — please verify with your insurer."
- Only recommend coverage you are confident applies to the described business.`;
```

Add TAMM classify prompt after the existing `CLASSIFY_PROMPT` (line 74-106):

```typescript
const CLASSIFY_PROMPT_TAMM = `You are a business classifier for TAMM Business Insurance, an Abu Dhabi SME insurance platform.

Given a user's free-text description, classify their business into ONE of these types:
- cafe-restaurant (Café / Restaurant)
- law-firm (Law Firm / Legal)
- retail-trading (Retail / Trading)
- it-technology (IT / Technology)
- construction (Construction / Contracting)
- healthcare (Healthcare / Clinic)
- consulting (Consulting / Advisory)
- general-trading (General Trading)
- logistics (Logistics / Transport)
- real-estate (Real Estate)
- travel-tourism (Travel / Tourism)

## Rules
- If the input is about a real business, classify it and return the result.
- If the input is NOT about a business at all (e.g. jokes, weather, recipes, code, sports, politics), return fallback "out_of_scope".
- If the input involves fraud, scams, illegal activity, or attempts to game the system, return fallback "harmful".
- If the input is too vague to classify (e.g. just one word like "hi"), return fallback "unknown_topic".

## Response format (JSON only, no other text)
For a valid business:
{ "businessType": "cafe-restaurant", "label": "Café / Restaurant", "confidence": "high" }

For out-of-scope:
{ "fallback": "out_of_scope", "message": "This doesn't appear to be about a business." }

For harmful:
{ "fallback": "harmful", "message": "I can't help with that request." }

For unknown/vague:
{ "fallback": "unknown_topic", "message": "Could you tell me more about your business?" }`;
```

- [ ] **Step 2: Make classifyBusiness and getRecommendations brand-aware**

Update the function signatures to accept `brand`:

```typescript
export async function classifyBusiness(text: string, brand: string = 'shory'): Promise<ClassifyResult> {
  const prompt = brand === 'tamm' ? CLASSIFY_PROMPT_TAMM : CLASSIFY_PROMPT;

  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    config: {
      maxOutputTokens: 256,
      systemInstruction: prompt,
    },
    contents: text,
  });
  // ... rest unchanged
}

export async function getRecommendations(context: AdvisorContext & { brand?: string }): Promise<AdvisorResult> {
  const systemPrompt = context.brand === 'tamm' ? SYSTEM_PROMPT_TAMM : SYSTEM_PROMPT;
  // ... use systemPrompt in generateContent call
}
```

- [ ] **Step 3: Update AI routes to accept brand param**

In `apps/backend/src/routes/ai.ts`, update the classify schema and handler:

```typescript
const classifySchema = z.object({
  text: z.string().min(1, 'Text is required'),
  brand: z.enum(['shory', 'tamm']).optional().default('shory'),
});

aiRouter.post('/classify', async (c) => {
  try {
    const body = await c.req.json();
    const {text, brand} = classifySchema.parse(body);
    const result = await classifyBusiness(text, brand);
    // ... rest unchanged
  }
});
```

Similarly update the `/recommend` endpoint to pass brand through to `getRecommendations`.

- [ ] **Step 4: Update API client to send brand**

In `apps/web/lib/api-client.ts`, update the `ai.classify` method:

```typescript
import {getBrand} from '@/lib/brand';

// In the ai object:
classify: (text: string) => {
  const brand = getBrand();
  return fetchApi<{...}>('/ai/classify', {
    method: 'POST',
    body: JSON.stringify({text, brand: brand.id}),
  });
},
```

Do the same for `ai.recommend`.

- [ ] **Step 5: Verify AI classification uses correct prompts**

Run backend and test classify endpoint:
```bash
curl -X POST http://localhost:3002/api/ai/classify -H 'Content-Type: application/json' -d '{"text": "legal consultancy", "brand": "tamm"}'
```

Expected: classification result with no errors.

- [ ] **Step 6: Commit**

```bash
git add apps/backend/src/ai/advisor.ts apps/backend/src/routes/ai.ts apps/web/lib/api-client.ts
git commit -m "feat: brand-aware AI prompts (TAMM uses Abu Dhabi-specific system prompts)"
```

---

## Task 13: Confirmation Page Brand Support

**Files:**
- Modify: `apps/web/components/quote/confirmation.tsx`

- [ ] **Step 1: Update confirmation for brand**

In `apps/web/components/quote/confirmation.tsx`:
- Import `getBrand` from `@/lib/brand`
- Replace the policy number prefix from `SHR-` to brand-specific:

```typescript
const brand = getBrand();
const policyPrefix = brand.id === 'tamm' ? 'TAMM-' : 'SHR-';
const policyNumber = `${policyPrefix}${Date.now().toString(36).toUpperCase()}`;
```

- Update any brand name references in the PDF invoice template to use `brand.displayName`
- Update trust/legal text in the confirmation screen to read from `brand.trustBadges` and `brand.footerText`

- [ ] **Step 2: Verify confirmation with TAMM brand**

Run through the full flow with TAMM brand to confirmation page. Check policy number prefix and branding.

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/quote/confirmation.tsx
git commit -m "feat: confirmation page uses brand config for policy prefix and branding"
```

---

## Task 14: Quote Results — Legal/Compliance Panel

**Files:**
- Modify: `apps/web/components/quote/quote-results.tsx`

- [ ] **Step 1: Update compliance/legal references in results**

In `apps/web/components/quote/quote-results.tsx`, search for any hardcoded legal references (DHA, DET, DIFC, Dubai). Replace with brand config values:

```typescript
const brand = getBrand();
```

Find the section that shows health insurance requirements (around the line referencing "Required by DHA/food safety regulators" at line 57). Replace with:

```typescript
`Required by ${brand.legalReferences.healthAuthority}`
```

Find any emirate-specific conditional logic (line 609: `if (emirate === 'Dubai' || emirate === 'Abu Dhabi')`) and update to be brand-aware — for TAMM, all locations are Abu Dhabi so the condition should always match.

Update the location display labels that reference `t.options.emirates` to also fall back to the raw location string for TAMM localities that may not have translations yet.

- [ ] **Step 2: Verify results page with TAMM brand**

Check that no "Dubai", "DHA", "DET", or "DIFC" text appears when using TAMM brand.

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/quote/quote-results.tsx
git commit -m "feat: quote results uses brand legal references and compliance text"
```

---

## Task 15: Process Flow Companion Document

**Files:**
- Create: `docs/tamm-process-flow.md`

- [ ] **Step 1: Create the process flow document**

Create `docs/tamm-process-flow.md` with content from the dev note sections 6.1–6.5. This is a documentation-only task — copy and adapt the content from the dev note into a clean markdown document covering:

1. Journey entry points (5 entries with auth method)
2. Data fields (6 categories: business profile, coverage confirmation, company details, policyholder identity, review & pay, payment)
3. Customer documents (trade licence, Emirates ID, financial statements, etc.)
4. Personas (Fatima, Khalid, Ahmed, Sara)
5. Payment capabilities (Apple Pay, Google Pay, Card, Bank Transfer, Finwall, roadmap items)

Use the exact content from the dev note — this is a companion document, not a code change.

- [ ] **Step 2: Commit**

```bash
git add docs/tamm-process-flow.md
git commit -m "docs: add TAMM process flow companion document"
```

---

## Task 16: Final Verification & Cleanup

**Files:** None new — verification only.

- [ ] **Step 1: Run TypeScript check**

Run: `cd /Users/ahmedosman/Developer/the-one-and-only/shory-sme && pnpm turbo run typecheck`

Expected: No type errors.

- [ ] **Step 2: Run ESLint**

Run: `cd /Users/ahmedosman/Developer/the-one-and-only/shory-sme && pnpm turbo run lint`

Expected: No lint errors.

- [ ] **Step 3: Build both brand variants**

Run:
```bash
NEXT_PUBLIC_BRAND=shory pnpm turbo run build --filter=web
NEXT_PUBLIC_BRAND=tamm pnpm turbo run build --filter=web
```

Expected: Both builds succeed.

- [ ] **Step 4: Grep for leaked Dubai references in TAMM mode**

Run: `grep -rn "Dubai\|DHA\|DET\|DIFC" apps/web/ --include="*.tsx" --include="*.ts" | grep -v node_modules | grep -v '.json'`

Review each match: if it's in brand-conditional code (only shown for Shory), it's fine. If it would appear in TAMM mode, fix it.

- [ ] **Step 5: Run E2E tests if they exist**

Run: `cd /Users/ahmedosman/Developer/the-one-and-only/shory-sme && pnpm turbo run test:e2e --filter=web 2>/dev/null || echo "No e2e script"`

- [ ] **Step 6: Final commit if any cleanup was needed**

```bash
git add -A
git commit -m "chore: final cleanup for TAMM white-label implementation"
```

---

## Acceptance Criteria Checklist

| # | Criterion | Task |
|---|-----------|------|
| 1 | Clean brand separation | Task 1 |
| 2 | All Shory tokens replaced with TAMM equivalents | Task 2 |
| 3 | No "Dubai", "DHA", "DET", "DIFC" in TAMM strings | Tasks 7, 12, 14, 16 |
| 4 | Emirate selector → Abu Dhabi locality selector | Tasks 6, 7, 8 |
| 5 | Default location is Abu Dhabi | Task 1 (brand config) |
| 6 | TAMM logo and Abu Dhabi gov branding | Tasks 2, 3, 4, 5 |
| 7 | UAE PASS pre-fill skips to results | Task 10 |
| 8 | "Pre-filled from UAE PASS ✓" banner | Task 10 |
| 9 | TAMM Business Space mock entry card | Task 11 |
| 10 | AI chatbot no Dubai references | Task 12 |
| 11 | DOH health insurance law reference | Tasks 1, 14 |
| 12 | ADGM free zone compliance panel | Tasks 1, 14 |
| 13 | Process flow — 5 entry points | Task 15 |
| 14 | All 6 data field categories documented | Task 15 |
| 15 | All 4 personas documented | Task 15 |
| 16 | Payment capability table | Task 15 |
