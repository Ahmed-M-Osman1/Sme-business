# Add UI Component

Add a shadcn/ui component styled for the Shory design system.

Usage: `/add-component <component-name>`

## Steps

1. Check if `components.json` exists — if not, run `pnpm dlx shadcn@latest init` first
2. Check if the component already exists in `components/ui/`
3. Run: `pnpm dlx shadcn@latest add $ARGUMENTS`
4. Verify the component was added to `components/ui/`
5. Show import: `import { ComponentName } from "@/components/ui/component-name"`

## After adding, remind about Shory style overrides

- Buttons: `rounded-xl`, `hover:opacity-80`, primary = `bg-primary`
- Cards: `rounded-2xl`, `shadow-sm hover:shadow-md`, `transition-all duration-200`
- Inputs: `rounded-xl`, `focus-visible:ring-primary`
- Dialogs: `rounded-2xl`
- All interactive elements: `transition-all duration-200 ease-in-out`
