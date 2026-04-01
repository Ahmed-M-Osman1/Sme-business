# Build UI — Shory Design Language

Create components and pages following the Shory design language: **modern, clean, professional, and approachable**.

## Before writing code

1. Read `node_modules/next/dist/docs/index.md` for Next.js 16 conventions
2. Check `components/ui/` for available shadcn components
3. Check `globals.css` for current theme variables

## Shory Design Principles

1. **Clean white space** — generous padding, never cramped
2. **Blue accent (#1D68FF)** drives attention to CTAs and interactive elements
3. **Rounded everything** — `rounded-xl` buttons, `rounded-2xl` cards
4. **Subtle elevation** — `shadow-sm` default, `shadow-md` on hover
5. **Smooth transitions** — `transition-all duration-200 ease-in-out` on all interactive elements
6. **Trust-forward** — badges, ratings, license info prominently displayed
7. **Mobile-first** — bottom sheets, thumb-friendly tap targets, stacked layouts

## Page Structure (following shory.com)

```
┌─────────────────────────────────┐
│  Sticky Navbar                  │  white bg, blur, border-b
│  Logo | Nav Links | Lang | CTA  │
├─────────────────────────────────┤
│  Hero Section                   │  tagline, subtitle, CTA buttons
│  (full-width, py-16+)          │
├─────────────────────────────────┤
│  Product Cards Grid             │  icon + title + CTA per card
│  (3-5 cols on desktop)         │
├─────────────────────────────────┤
│  Trust / Social Proof           │  stats, ratings, license badge
├─────────────────────────────────┤
│  Feature Sections               │  alternating image + text
├─────────────────────────────────┤
│  CTA Banner                     │  promotional section
├─────────────────────────────────┤
│  Footer                         │  multi-col links, app download,
│                                 │  contact, social, payments
└─────────────────────────────────┘
```

## Component Conventions

### File naming

- Components: `components/<feature>/<ComponentName>.tsx`
- Pages: `app/<route>/page.tsx`
- Layouts: `app/<route>/layout.tsx`

### Component template

```tsx
import {cn} from '@/lib/utils';

interface Props {
  className?: string;
}

export function ComponentName({className}: Props) {
  return <div className={cn('', className)}>{/* content */}</div>;
}
```

### Hero section

```tsx
<section className="py-16 sm:py-20 lg:py-24 text-center">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text tracking-tight">
      Headline
    </h1>
    <p className="mt-4 text-lg text-text-muted max-w-2xl mx-auto">
      Subheadline
    </p>
    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
      <Button className="bg-primary text-white rounded-xl px-8 py-3">
        Primary CTA
      </Button>
      <Button variant="outline" className="rounded-xl">
        Secondary CTA
      </Button>
    </div>
  </div>
</section>
```

### Product card grid

```tsx
<section className="py-16 bg-surface">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
      {products.map((p) => (
        <Card
          key={p.id}
          className="rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 text-center p-6">
          ...
        </Card>
      ))}
    </div>
  </div>
</section>
```

### Stats / social proof

```tsx
<section className="py-12 border-y border-border">
  <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
    <div>
      <p className="text-3xl font-bold text-primary">50B+</p>
      <p className="text-text-muted text-sm mt-1">Assets insured</p>
    </div>
    ...
  </div>
</section>
```

### Footer

```tsx
<footer className="bg-text text-white py-12">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
    {/* Link columns, app download, contact, social icons */}
  </div>
</footer>
```

## Accessibility

- Semantic HTML (`nav`, `main`, `section`, `footer`)
- `aria-label` on icon-only buttons
- Keyboard navigable
- Focus-visible rings (`focus-visible:ring-2 focus-visible:ring-primary`)
- Color contrast: text on white must pass WCAG AA

## Responsive Breakpoints

- **Mobile**: default (< 640px) — single column, bottom sheets, stacked
- **Tablet** `sm:` (640px) — 2 columns, side-by-side
- **Desktop** `md:` (768px) — expanded nav, multi-column
- **Wide** `lg:` (1024px) — full layout, 5-col grids
