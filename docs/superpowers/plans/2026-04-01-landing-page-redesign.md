# Landing Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the web app landing page to be a pixel-perfect replica of shory.com with Personal/Business tab toggle, where the Business tab includes an SME Business Insurance card linking to the quote journey.

**Architecture:** Rewrite all existing landing components and layout components in-place. Add two new section components (promo banner, CTA section). The hero + product cards become a single client component to manage tab state. Everything else stays as server components.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, @shory/ui (Button, Card, Badge), TypeScript strict

**Design Spec:** `docs/superpowers/specs/2026-04-01-shory-landing-page-redesign.md`

---

### Task 1: Rewrite the Navbar

**Files:**
- Modify: `apps/web/components/layout/navbar.tsx`

- [ ] **Step 1: Rewrite navbar component**

Replace the entire content of `apps/web/components/layout/navbar.tsx` with:

```tsx
import Link from 'next/link';
import {Button} from '@shory/ui';

const NAV_LINKS = [
  {label: 'Personal', href: '#'},
  {label: 'Business', href: '#'},
  {label: 'Company', href: '#'},
  {label: 'Help', href: '#'},
] as const;

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-black italic text-text">
            Shory.
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-text hover:text-text-muted transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full px-4 gap-2 border-border text-sm font-medium"
          >
            <span className="inline-block w-6 h-4 rounded-sm overflow-hidden relative">
              <span className="absolute inset-0 bg-[#00732F]" />
              <span className="absolute inset-0 bg-[#EF3340]" style={{clipPath: 'polygon(0 0, 33% 0, 33% 100%, 0 100%)'}} />
              <span className="absolute top-0 left-0 w-full h-1/3 bg-[#00732F]" />
              <span className="absolute bottom-0 left-0 w-full h-1/3 bg-black" />
            </span>
            عربي
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full px-6 border-border text-sm font-medium"
          >
            Login
          </Button>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Verify the dev server renders the new navbar**

Run: `cd apps/web && pnpm dev`

Open http://localhost:3000 and verify:
- "Shory." logo in bold italic on the left
- Personal, Business, Company, Help links
- عربي button with flag placeholder and Login button on the right

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/layout/navbar.tsx
git commit -m "feat: rewrite navbar to match shory.com design"
```

---

### Task 2: Rewrite the Hero with Personal/Business Tabs

This is a client component because it manages tab state. It renders the headline, subtitle, tab toggle, and the product cards for the selected tab.

**Files:**
- Modify: `apps/web/components/landing/hero.tsx`

- [ ] **Step 1: Rewrite hero component with tab toggle and product cards**

Replace the entire content of `apps/web/components/landing/hero.tsx` with:

```tsx
'use client';

import {useState} from 'react';
import Link from 'next/link';
import {Button, Card, CardContent} from '@shory/ui';

const PERSONAL_PRODUCTS = [
  {title: 'Car\nInsurance', imageBg: 'bg-white', href: '#'},
  {title: 'Health\nInsurance', imageBg: 'bg-white', href: '#'},
  {title: 'Home\nInsurance', imageBg: 'bg-white', href: '#'},
  {title: 'Pet\nInsurance', imageBg: 'bg-white', href: '#'},
] as const;

const BUSINESS_PRODUCTS = [
  {
    title: 'Visit Visa\nfor Agencies',
    imageBg: 'bg-white',
    href: '#',
    buttons: [
      {label: 'Buy a quota', variant: 'default' as const},
      {label: 'Learn more', variant: 'outline' as const},
    ],
  },
  {
    title: 'SME Business\nInsurance',
    imageBg: 'bg-white',
    href: '/quote/start',
    buttons: [{label: 'Get a quote', variant: 'default' as const}],
  },
] as const;

export function Hero() {
  const [activeTab, setActiveTab] = useState<'personal' | 'business'>(
    'personal',
  );

  return (
    <section className="pt-12 pb-8 text-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold text-text mb-3">
          Compare and buy insurance in the UAE
        </p>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text tracking-tight">
          Top insurers. Best prices. One app.
        </h1>

        {/* Tab Toggle */}
        <div className="mt-8 inline-flex rounded-full border border-border bg-white p-1">
          <button
            onClick={() => setActiveTab('personal')}
            className={`rounded-full px-8 py-2.5 text-sm font-medium transition-all duration-200 ${
              activeTab === 'personal'
                ? 'bg-text text-white'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Personal
          </button>
          <button
            onClick={() => setActiveTab('business')}
            className={`rounded-full px-8 py-2.5 text-sm font-medium transition-all duration-200 ${
              activeTab === 'business'
                ? 'bg-text text-white'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Business
          </button>
        </div>

        {/* Product Cards */}
        <div className="mt-10 flex justify-center gap-6">
          {activeTab === 'personal' ? (
            <>
              {PERSONAL_PRODUCTS.map((product) => (
                <Card
                  key={product.title}
                  className="w-40 sm:w-44 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-200 bg-white"
                >
                  <CardContent className="flex flex-col items-center gap-3 p-5">
                    <h3 className="font-semibold text-text text-sm whitespace-pre-line text-center leading-tight">
                      {product.title}
                    </h3>
                    {/* Image placeholder */}
                    <div className="w-24 h-20 rounded-lg bg-surface flex items-center justify-center">
                      <span className="text-3xl text-text-muted">
                        {product.title.includes('Car')
                          ? '🚗'
                          : product.title.includes('Health')
                            ? '❤️'
                            : product.title.includes('Home')
                              ? '🏠'
                              : '🐾'}
                      </span>
                    </div>
                    <Button
                      asChild
                      size="sm"
                      className="w-full rounded-full bg-primary text-white text-xs font-medium hover:bg-primary-hover transition-all duration-200"
                    >
                      <Link href={product.href}>Get a quote</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              {BUSINESS_PRODUCTS.map((product) => (
                <Card
                  key={product.title}
                  className="w-52 sm:w-56 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-200 bg-white"
                >
                  <CardContent className="flex flex-col items-center gap-3 p-6">
                    <h3 className="font-semibold text-text text-sm whitespace-pre-line text-center leading-tight">
                      {product.title}
                    </h3>
                    {/* Image placeholder */}
                    <div className="w-32 h-24 rounded-lg bg-surface flex items-center justify-center">
                      <span className="text-3xl text-text-muted">
                        {product.title.includes('Visa') ? '✈️' : '🏢'}
                      </span>
                    </div>
                    <div className="flex gap-2 w-full">
                      {product.buttons.map((btn) => (
                        <Button
                          key={btn.label}
                          asChild
                          size="sm"
                          variant={btn.variant}
                          className={`flex-1 rounded-full text-xs font-medium transition-all duration-200 ${
                            btn.variant === 'default'
                              ? 'bg-primary text-white hover:bg-primary-hover'
                              : 'border-border text-text hover:bg-surface'
                          }`}
                        >
                          <Link href={product.href}>{btn.label}</Link>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify tabs toggle between Personal and Business cards**

Open http://localhost:3000 and verify:
- "Compare and buy insurance in the UAE" subtitle
- "Top insurers. Best prices. One app." headline
- Personal tab selected by default showing 4 cards
- Clicking Business shows 2 cards (Visit Visa + SME Business Insurance)
- SME Business Insurance "Get a quote" links to `/quote/start`

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/landing/hero.tsx
git commit -m "feat: add hero with Personal/Business tab toggle and product cards"
```

---

### Task 3: Rewrite Trust Badges

**Files:**
- Modify: `apps/web/components/landing/trust-badges.tsx`

- [ ] **Step 1: Rewrite trust badges with Central Bank and Google Rating**

Replace the entire content of `apps/web/components/landing/trust-badges.tsx` with:

```tsx
export function TrustBadges() {
  return (
    <section className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
        {/* Central Bank Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center">
            <span className="text-lg">🏛️</span>
          </div>
          <div className="text-left">
            <p className="text-xs text-text-muted leading-tight">
              Licensed by the
            </p>
            <p className="text-xs text-text-muted leading-tight">
              Central Bank with
            </p>
            <p className="text-xs text-text-muted leading-tight">
              License Number 287
            </p>
          </div>
        </div>

        {/* Google Rating */}
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-text-muted">G</span>
          <div className="text-left">
            <p className="text-xs font-semibold text-text">Google Rating</p>
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold text-text">4.9</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-sm">
                    ★
                  </span>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-text-muted">
              More than 10,000 reviews
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify trust badges render correctly**

Open http://localhost:3000 and check Central Bank badge and Google Rating appear centered below the product cards.

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/landing/trust-badges.tsx
git commit -m "feat: update trust badges with Central Bank license and Google rating"
```

---

### Task 4: Add Promo Banner Section

**Files:**
- Create: `apps/web/components/landing/promo-banner.tsx`

- [ ] **Step 1: Create promo banner component**

Create `apps/web/components/landing/promo-banner.tsx`:

```tsx
import {Button} from '@shory/ui';

export function PromoBanner() {
  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-surface rounded-2xl p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-text leading-tight">
              Every pet
              <br />
              has a{' '}
              <span className="bg-text text-white px-2 py-0.5 rounded">
                story
              </span>{' '}
              <span className="font-black italic">Shory.</span>
            </h2>
            <p className="mt-3 text-sm text-text-muted">
              What&apos;s your pet&apos;s story?
              <br />
              Share it for a chance to win a 2026 Mercedes.
            </p>
            <Button
              size="sm"
              className="mt-4 rounded-full bg-primary text-white px-6 text-sm font-medium hover:bg-primary-hover transition-all duration-200"
            >
              Learn more
            </Button>
          </div>
          {/* Image placeholder */}
          <div className="w-64 h-40 rounded-lg bg-white flex items-center justify-center shrink-0">
            <span className="text-5xl">🎁🐾📸</span>
          </div>
        </div>
        <div className="text-right mt-2">
          <span className="text-[10px] text-text-muted underline cursor-pointer">
            T&amp;Cs apply
          </span>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/components/landing/promo-banner.tsx
git commit -m "feat: add promo banner section"
```

---

### Task 5: Rewrite Stats Section

**Files:**
- Modify: `apps/web/components/landing/stats-section.tsx`

- [ ] **Step 1: Rewrite stats section to match shory.com**

Replace the entire content of `apps/web/components/landing/stats-section.tsx` with:

```tsx
const STATS = [
  {
    icon: '🏢',
    value: '50B+',
    label: 'worth of assets insured',
    sublabel: 'for residential, commercial\nand industrial properties',
  },
  {
    icon: '🚢',
    value: '3B+',
    label: 'worth of marine fleets',
    sublabel: 'insured, some of them being\nthe largest',
  },
  {
    icon: '📱',
    value: '#1',
    label: 'insurance app',
    sublabel: 'on the UAE App Store and\nPlay Store',
  },
] as const;

export function StatsSection() {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text">
          Trusted by over 1 million customers.
        </h2>
        <p className="mt-4 text-sm text-text-muted max-w-2xl mx-auto leading-relaxed">
          Get instant insurance quotes from leading insurers, compare great
          prices, and enjoy instant coverage, all in one seamless app.
        </p>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
          {STATS.map((stat) => (
            <div key={stat.value} className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-surface flex items-center justify-center">
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <p className="text-4xl sm:text-5xl font-bold text-text">
                {stat.value}
              </p>
              <p className="text-sm font-semibold text-text">{stat.label}</p>
              <p className="text-xs text-text-muted whitespace-pre-line leading-relaxed">
                {stat.sublabel}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/components/landing/stats-section.tsx
git commit -m "feat: update stats section with icons, heading, and sublabels"
```

---

### Task 6: Add CTA Section

**Files:**
- Create: `apps/web/components/landing/cta-section.tsx`

- [ ] **Step 1: Create CTA section component**

Create `apps/web/components/landing/cta-section.tsx`:

```tsx
import {Button} from '@shory/ui';

export function CtaSection() {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12">
        {/* Image placeholder */}
        <div className="flex-1 w-full max-w-lg">
          <div className="w-full aspect-[4/3] rounded-2xl bg-surface flex items-center justify-center">
            <span className="text-6xl">🏠🚗👨‍👩‍👧</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 text-left">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text">
            Buy Insurance Online
          </h2>
          <p className="mt-4 text-sm text-text-muted leading-relaxed max-w-md">
            We&apos;re here for you every step of the way to help you find your
            ideal insurance plan. Whether you&apos;re getting insurance or
            filing claims, Shory is with you to meet your personal and business
            insurance requirements. You can use our website and app to explore
            personal insurance options or drop us an email at{' '}
            <a
              href="mailto:corporate@shory.com"
              className="text-primary hover:underline"
            >
              corporate@shory.com
            </a>{' '}
            for corporate insurance and we&apos;ll get in touch with you.
          </p>
          <Button
            size="lg"
            className="mt-6 rounded-full bg-primary text-white px-8 text-sm font-medium hover:bg-primary-hover transition-all duration-200"
          >
            Get started
          </Button>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/components/landing/cta-section.tsx
git commit -m "feat: add CTA section with Buy Insurance Online content"
```

---

### Task 7: Rewrite the Footer

**Files:**
- Modify: `apps/web/components/layout/footer.tsx`

- [ ] **Step 1: Rewrite footer to match shory.com 4-column layout**

Replace the entire content of `apps/web/components/layout/footer.tsx` with:

```tsx
import Link from 'next/link';
import {Badge} from '@shory/ui';

const PERSONAL_LINKS = [
  'Car Insurance',
  'Non-UAE Vehicles Insurance',
  'Health insurance',
  'Home Insurance',
  'Pet insurance',
] as const;

const CORPORATE_LINKS = ['Travel Insurance for Agencies'] as const;

const COMPANY_LINKS = [
  'Help and Support',
  'Blogs',
  'Newsroom',
  'Sitemap',
  'Legal',
  'About Us',
  'Contact us',
] as const;

const SOCIAL_ICONS = ['f', '📷', '𝕏', 'in', '💬'] as const;

export function Footer() {
  return (
    <footer className="bg-white border-t border-border">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Personal Insurance */}
          <div>
            <h4 className="text-sm font-semibold text-text mb-4">
              Personal Insurance
            </h4>
            <ul className="space-y-2">
              {PERSONAL_LINKS.map((label) => (
                <li key={label}>
                  <Link
                    href="#"
                    className="text-sm text-text-muted hover:text-text transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Corporate Insurance */}
          <div>
            <h4 className="text-sm font-semibold text-text mb-4">
              Corporate Insurance
            </h4>
            <ul className="space-y-2">
              {CORPORATE_LINKS.map((label) => (
                <li key={label}>
                  <Link
                    href="#"
                    className="text-sm text-text-muted hover:text-text transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company & Help */}
          <div>
            <h4 className="text-sm font-semibold text-text mb-4">
              Company &amp; Help
            </h4>
            <ul className="space-y-2">
              {COMPANY_LINKS.map((label) => (
                <li key={label}>
                  <Link
                    href="#"
                    className="text-sm text-text-muted hover:text-text transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <Badge className="bg-primary text-white text-xs rounded-full px-3 py-1">
                  We&apos;re Hiring
                </Badge>
              </li>
            </ul>
          </div>

          {/* Download & Contact */}
          <div>
            <h4 className="text-sm font-semibold text-text mb-4">
              Download our app
            </h4>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-text text-white rounded-lg px-4 py-2 text-xs font-medium">
                <p>Download</p>
                <p className="font-bold">Shory App</p>
              </div>
              <div className="w-16 h-16 bg-surface rounded-lg flex items-center justify-center">
                <span className="text-xs text-text-muted">QR</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">📞</span>
                <span className="text-sm font-semibold text-text">
                  Call us at
                </span>
              </div>
              <div className="border border-border rounded-lg px-4 py-3 text-center">
                <p className="text-xs text-text-muted">
                  Mon - Sun: 08:00 AM - 10:00 PM
                </p>
                <p className="text-sm font-semibold text-primary mt-1">
                  800 SHORY (74679)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xl font-black italic text-text">Shory.</span>
            <div className="flex items-center gap-4">
              {SOCIAL_ICONS.map((icon, i) => (
                <Link
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-text-muted hover:text-text text-xs transition-colors duration-200"
                >
                  {icon}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-[10px] text-text-muted leading-relaxed max-w-2xl">
              <p>
                Shory Insurance Brokers LLC is authorized, regulated and
                licensed by the Central Bank of the UAE with License Number 287.
              </p>
              <p>
                Shory Insurance Brokers LLC is located in 29th Floor Al Khatem
                Tower, Al Maryah Island, Abu Dhabi, UAE &copy; 2026 Shory. All
                rights reserved.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {['MC', 'V', 'AP', 'AE', 'TB', 'MP'].map((pay) => (
                  <div
                    key={pay}
                    className="w-8 h-5 bg-surface rounded text-[8px] flex items-center justify-center text-text-muted"
                  >
                    {pay}
                  </div>
                ))}
              </div>
              <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center">
                <span className="text-[6px] text-text-muted text-center leading-tight">
                  Central
                  <br />
                  Bank
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/components/layout/footer.tsx
git commit -m "feat: rewrite footer with 4-column layout matching shory.com"
```

---

### Task 8: Remove Old Product Cards Component and Update Page

The product cards are now rendered inside the Hero component. Remove the old standalone component and wire up all new sections in the page.

**Files:**
- Delete: `apps/web/components/landing/product-cards.tsx`
- Modify: `apps/web/app/page.tsx`

- [ ] **Step 1: Delete the old product-cards component**

```bash
rm apps/web/components/landing/product-cards.tsx
```

- [ ] **Step 2: Update the page to compose all sections**

Replace the entire content of `apps/web/app/page.tsx` with:

```tsx
import {Hero} from '@/components/landing/hero';
import {TrustBadges} from '@/components/landing/trust-badges';
import {PromoBanner} from '@/components/landing/promo-banner';
import {StatsSection} from '@/components/landing/stats-section';
import {CtaSection} from '@/components/landing/cta-section';

export default function HomePage() {
  return (
    <main className="flex-1">
      <Hero />
      <TrustBadges />
      <PromoBanner />
      <StatsSection />
      <CtaSection />
    </main>
  );
}
```

- [ ] **Step 3: Update page metadata in layout**

In `apps/web/app/layout.tsx`, update the metadata to:

```tsx
export const metadata: Metadata = {
  title: 'Shory — Compare and Buy Insurance in the UAE',
  description:
    'Top insurers. Best prices. One app. Get instant insurance quotes from leading insurers.',
};
```

- [ ] **Step 4: Run the dev server and verify the full page**

Run: `cd apps/web && pnpm dev`

Open http://localhost:3000 and verify all sections render top to bottom:
1. Navbar with Shory. logo, nav links, عربي + Login buttons
2. Hero with subtitle, headline, Personal/Business toggle, product cards
3. Trust badges with Central Bank + Google Rating
4. Promo banner with pet story content
5. Stats section with 3 stat blocks
6. CTA section with Buy Insurance Online
7. Footer with 4-column layout + bottom bar

- [ ] **Step 5: Verify Business tab links to quote journey**

Click Business tab → click "Get a quote" on SME Business Insurance card → should navigate to `/quote/start`

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: wire up all landing page sections and remove old product cards"
```

---

### Task 9: Build and lint check

**Files:** None (verification only)

- [ ] **Step 1: Run the build**

```bash
cd /Users/ahmedosman/Developer/the-one-and-only/shory-sme && pnpm build --filter=@shory/web
```

Expected: Build succeeds with no errors.

- [ ] **Step 2: Run lint**

```bash
cd /Users/ahmedosman/Developer/the-one-and-only/shory-sme && pnpm lint --filter=@shory/web
```

Expected: No lint errors. Fix any issues that come up.

- [ ] **Step 3: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: address build and lint issues"
```
