# Shory Landing Page Redesign

## Goal
Rebuild the web app landing page to be a pixel-perfect replica of the real shory.com site. The page has a Personal/Business tab toggle in the hero. The Business tab includes an "SME Business Insurance" card that links into the existing quote journey.

## Sections (top to bottom)

### 1. Navbar
- Left: Bold italic "Shory." logo
- Center: Nav links — Personal, Business, Company, Help
- Right: UAE flag + "عربي" button, "Login" bordered button
- Sticky top, white background, subtle bottom border

### 2. Hero
- Subtitle: "Compare and buy insurance in the UAE"
- Headline: "Top insurers. Best prices. One app."
- Personal/Business pill toggle (Personal selected by default, dark fill on selected)

### 3. Product Cards (tab-dependent)
**Personal tab (default):** 4 cards in a row
- Car Insurance — image placeholder, "Get a quote" blue button
- Health Insurance — image placeholder, "Get a quote" blue button
- Home Insurance — image placeholder, "Get a quote" blue button
- Pet Insurance — image placeholder, "Get a quote" blue button

**Business tab:** 2 cards centered
- Visit Visa for Agencies — image placeholder, "Buy a quota" blue button + "Learn more" outline button
- SME Business Insurance — image placeholder, "Get a quote" blue button linking to `/quote/start`

Cards have rounded corners, subtle border, hover shadow.

### 4. Trust Badges
- Central Bank license icon + "Licensed by the Central Bank with License Number 287"
- Google "G" icon + "Google Rating 4.9" + 5 gold stars + "More than 10,000 reviews"

### 5. Promo Banner
- Light gray (`#F5F5F5`) rounded container, full-width within max-w
- Left: "Every pet has a story Shory." text + "Learn more" blue button + "T&Cs apply" link
- Right: Image placeholder (pet collage with gift box)

### 6. Stats Section
- Heading: "Trusted by over 1 million customers."
- Subtitle: "Get instant insurance quotes from leading insurers, compare great prices, and enjoy instant coverage, all in one seamless app."
- Three stats with icons above:
  - 50B+ — "worth of assets insured" / "for residential, commercial and industrial properties"
  - 3B+ — "worth of marine fleets" / "insured, some of them being the largest"
  - #1 — "insurance app" / "on the UAE App Store and Play Store"

### 7. CTA Section
- Left: Large image placeholder (house/car/family scene)
- Right: "Buy Insurance Online" heading + description paragraph + "Get started" blue button
- Description mentions personal and business insurance, links corporate@shory.com

### 8. Footer
**Top section (4 columns):**
- Personal Insurance: Car, Non-UAE Vehicles, Health, Home, Pet
- Corporate Insurance: Travel Insurance for Agencies
- Company & Help: Help and Support, Blogs, Newsroom, Sitemap, Legal, About Us, Contact us, "We're Hiring" blue badge
- Download our app: "Download Shory App" button + QR code placeholder, "Call us at" + phone hours + "800 SHORY (74679)" link

**Bottom bar:**
- Left: "Shory." logo
- Right: Social icons (Facebook, Instagram, X, LinkedIn, WhatsApp)
- Legal text: Central Bank authorization, address, copyright
- Payment icons + Central Bank badge (right-aligned)

## Technical Decisions

### Tab Toggle
- Client component (`"use client"`) with `useState` for active tab
- Only the hero + product cards section needs client interactivity
- Wrap the tab toggle and cards in a single client component

### Images
- Use placeholder `<div>` elements with background colors and descriptive text
- Structured so real images can be dropped in later via `next/image`
- Create a `/public/images/landing/` directory for future assets

### File Structure
Reuse existing component files, add new ones:
```
components/landing/
  hero.tsx          — rewrite (add tabs, new text)
  product-cards.tsx — rewrite (tab-dependent cards)
  trust-badges.tsx  — update (add icons, new text)
  promo-banner.tsx  — NEW
  stats-section.tsx — update styling
  cta-section.tsx   — NEW
components/layout/
  navbar.tsx        — rewrite (new links, language toggle, login)
  footer.tsx        — rewrite (4-column layout, social, legal)
```

### Styling
- Tailwind CSS v4 (no config file, `@theme inline` in CSS)
- Primary blue: `#1D68FF`
- Max width: `max-w-7xl` container pattern
- Rounded cards: `rounded-2xl`
- Pill toggle: `rounded-full` with dark/white states
