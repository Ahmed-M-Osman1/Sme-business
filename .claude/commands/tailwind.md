# Tailwind CSS v4 — Shory Design System

This project uses **Tailwind CSS v4** with a design system inspired by shory.com.

## Tailwind v4 — NOT v3

- **No `tailwind.config.js`** — all theme config lives in `globals.css` under `@theme inline`
- Use CSS variables for tokens (`--color-*`, `--font-*`, `--spacing-*`)

## Shory Color Palette

```css
@theme inline {
  /* Primary */
  --color-primary: #1D68FF;
  --color-primary-hover: #1555D4;
  --color-primary-light: #E8F0FF;

  /* Neutral */
  --color-background: #FFFFFF;
  --color-surface: #F7F8FA;
  --color-border: #E5E7EB;
  --color-text: #1A1A2E;
  --color-text-muted: #6B7280;

  /* Accent */
  --color-success: #22C55E;
  --color-warning: #F59E0B;
  --color-error: #EF4444;

  /* Dark mode overrides */
  --color-dark-bg: #0A0A0A;
  --color-dark-surface: #1A1A2E;
  --color-dark-text: #EDEDED;
}
```

## Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| Border radius (buttons) | `rounded-xl` (12px) | Buttons, inputs |
| Border radius (cards) | `rounded-2xl` (16px) | Cards, containers |
| Shadow (cards) | `shadow-sm` | Subtle card elevation |
| Shadow (hover) | `shadow-md` | Card hover states |
| Transition | `transition-all duration-200 ease-in-out` | All interactive elements |
| Max container | `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` | Page content wrapper |

## Common Patterns

### Container
```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
```

### Section spacing
```tsx
<section className="py-16 sm:py-20 lg:py-24">
```

### Card
```tsx
<div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-6">
```

### Button (primary)
```tsx
<button className="bg-primary text-white rounded-xl px-6 py-3 font-medium hover:opacity-80 transition-all duration-200">
```

## Rules

1. **Utility classes only** — no CSS modules or inline styles
2. **Theme via `@theme inline`** in `globals.css` — never create `tailwind.config.js`
3. **Mobile-first** — build for mobile, enhance with `sm:`, `md:`, `lg:`
4. **Use design tokens** — always reference `--color-primary` etc., not raw hex values
5. **Consistent spacing** — use Tailwind's spacing scale, prefer `4`, `6`, `8`, `12`, `16`, `20`, `24`
