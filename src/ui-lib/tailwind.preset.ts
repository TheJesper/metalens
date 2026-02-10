/**
 * CoverKit Tailwind CSS Preset
 *
 * Usage in tailwind.config.ts:
 * ```ts
 * import coversPreset from '@/ui-lib/tailwind.preset'
 * export default { presets: [coversPreset] }
 * ```
 */

import { colors, typography, borderRadius } from './theme'

const coversPreset = {
  darkMode: 'class' as const,
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        gold: {
          light: `hsl(${colors.gold.light})`,
          DEFAULT: `hsl(${colors.gold.DEFAULT})`,
          dark: `hsl(${colors.gold.dark})`,
          foreground: 'hsl(0 0% 0%)', // Black text on gold background
        },
      },
      fontFamily: {
        sans: [typography.fontSans],
        mono: [typography.fontMono],
        display: [typography.fontDisplay],
      },
      borderRadius: {
        lg: borderRadius.lg,
        md: borderRadius.md,
        sm: borderRadius.sm,
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
}

export default coversPreset
