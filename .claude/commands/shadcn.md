# shadcn/ui — Shory Style

## Setup

If `components.json` does not exist, initialize first:

```bash
pnpm dlx shadcn@latest init
```

Options:
- Style: **New York**
- Base color: **Neutral**
- CSS variables: **yes**

After init, update the generated CSS variables in `globals.css` to match the Shory palette (see `/tailwind` command for colors).

## Adding Components

Always use the CLI:

```bash
pnpm dlx shadcn@latest add <component-name>
```

## Shory Component Styling Overrides

When using shadcn components, apply these Shory-style overrides:

### Buttons
```tsx
// Primary CTA — Shory blue, rounded, hover fade
<Button className="bg-primary text-white rounded-xl px-6 py-3 font-medium hover:opacity-80">
  Get a Quote
</Button>

// Secondary / outline
<Button variant="outline" className="rounded-xl border-primary text-primary hover:bg-primary-light">
  Learn More
</Button>
```

### Cards (product cards like shory.com)
```tsx
<Card className="rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 text-center p-6 group cursor-pointer">
  <CardContent className="flex flex-col items-center gap-4">
    {/* Icon */}
    <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center">
      <Icon className="w-8 h-8 text-primary" />
    </div>
    <h3 className="font-semibold text-text">{title}</h3>
    <p className="text-text-muted text-sm">{description}</p>
  </CardContent>
</Card>
```

### Navigation
```tsx
// Sticky top nav, white bg, subtle border
<nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
    {/* Logo, nav items, CTA */}
  </div>
</nav>
```

### Dialogs / Sheets
```tsx
// Bottom sheet pattern (mobile) like shory.com
<Sheet>
  <SheetContent side="bottom" className="rounded-t-2xl">
    {/* Drag handle */}
    <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-4" />
    {content}
  </SheetContent>
</Sheet>
```

## Rules

1. **Use shadcn components** — don't build what shadcn provides
2. **Don't modify `components/ui/`** directly — wrap and extend instead
3. **Use `cn()`** from `@/lib/utils` for class merging
4. **Apply Shory overrides** via className props, not by editing base components
5. **Import from** `@/components/ui/<component>`
6. **Check `components/ui/`** before adding — avoid duplicates

## Common Components

| Need | Component |
|------|-----------|
| CTAs | `button` |
| Product cards | `card` |
| Forms | `form`, `input`, `label`, `select` |
| Navigation | `navigation-menu`, `sheet` (mobile) |
| Overlays | `dialog`, `sheet`, `popover`, `dropdown-menu` |
| Feedback | `alert`, `badge`, `sonner` (toast) |
| Data | `table`, `tabs` |
| Trust badges | `badge` + custom layout |
