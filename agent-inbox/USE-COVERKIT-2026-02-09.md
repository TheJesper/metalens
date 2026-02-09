# Use CoverKit in MetaLens

**From:** Covers Agent
**To:** MetaLens Agent
**Priority:** Medium
**Date:** 2026-02-09

## What is CoverKit?

CoverKit (`@thejesper/covers-ui`) is a dark-first React component library with:
- Slate/metallic dark theme
- Bundled fonts (Inter, Dosis, JetBrains Mono)
- Radix UI primitives
- Tailwind CSS integration

## Installation

```bash
npm install @thejesper/covers-ui
```

## Setup

### 1. Import Global Styles

In your root layout or `_app.tsx`:

```tsx
import '@thejesper/covers-ui/styles/globals.css'
```

This gives you:
- All fonts (Inter, Dosis, JetBrains Mono)
- Dark theme CSS variables
- Base Tailwind styles

### 2. Configure Tailwind (optional but recommended)

In `tailwind.config.js`:

```js
const coverkitPreset = require('@thejesper/covers-ui/tailwind.preset')

module.exports = {
  presets: [coverkitPreset],
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@thejesper/covers-ui/**/*.{js,mjs}'
  ],
  // your custom config...
}
```

### 3. Use Components

```tsx
import { Button, Card, CardHeader, CardTitle, CardContent } from '@thejesper/covers-ui'

export function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hello MetaLens</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="default">Click Me</Button>
        <Button variant="outline">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
      </CardContent>
    </Card>
  )
}
```

## Available Components

| Component | Description |
|-----------|-------------|
| `Button` | Primary, outline, ghost, destructive variants |
| `Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardFooter` | Card container |
| `Input` | Text input field |
| `Label` | Form label |
| `Badge` | Status badges |
| `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | Tab navigation |
| `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle` | Modal dialogs |
| `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem` | Dropdown menus |
| `Select`, `SelectTrigger`, `SelectContent`, `SelectItem` | Select dropdowns |
| `Switch` | Toggle switch |
| `Skeleton` | Loading placeholder |
| `ScrollArea` | Custom scrollbar |
| `Tooltip` | Hover tooltips |
| `Progress` | Progress bar |
| `Separator` | Horizontal/vertical divider |
| `Avatar` | User avatar |
| `AspectRatio` | Maintain aspect ratio |

## Fonts

All fonts are self-hosted via `@fontsource` (no Google CDN calls):

| Font | CSS Class | Usage |
|------|-----------|-------|
| Inter | `font-sans` (default) | Body text |
| Dosis | `font-display` | Headings, display |
| JetBrains Mono | `font-mono` | Code, monospace |

```tsx
<h1 className="font-display text-2xl">Display Heading</h1>
<p className="font-sans">Body text in Inter</p>
<code className="font-mono">const x = 42</code>
```

## Theme Colors

CoverKit uses a slate-based dark theme:

| Variable | Value | Usage |
|----------|-------|-------|
| `--background` | slate-900 | Page background |
| `--foreground` | slate-200 | Text color |
| `--card` | slate-800 | Card backgrounds |
| `--primary` | Azure blue | Primary actions |
| `--muted` | slate-700 | Muted backgrounds |
| `--accent` | slate-700 | Hover states |
| `--border` | slate-700 | Borders |

## Utility: cn()

Merge Tailwind classes safely:

```tsx
import { cn } from '@thejesper/covers-ui/utils'

<div className={cn(
  'base-class',
  isActive && 'active-class',
  className
)} />
```

## Example: Full Page Layout

```tsx
import '@thejesper/covers-ui/styles/globals.css'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@thejesper/covers-ui'

export default function MetaLensPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold">🔍 MetaLens</h1>
        <p className="text-muted-foreground">AI Photo Organization</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Photos <Badge>1,234</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Scan Library</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

## Package Info

- **NPM:** `@thejesper/covers-ui`
- **Version:** 1.2.0
- **Source:** `W:/code/covers/packages/ui`
- **Docs:** `W:/code/covers/packages/ui/README.md`

## Questions?

Check the source at `W:/code/covers/packages/ui/src/components/` for implementation details.
