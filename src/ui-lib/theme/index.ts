/**
 * Covers UI Theme System
 *
 * Dark-first design with HSL colors for CSS custom properties
 */

export const colors = {
  // Primary - Blue
  primary: {
    50: '213 100% 96%',
    100: '213 100% 91%',
    200: '213 100% 82%',
    300: '213 100% 72%',
    400: '213 94% 68%',
    500: '217 91% 60%',
    600: '221 83% 53%',
    700: '224 76% 48%',
    800: '226 71% 40%',
    900: '224 64% 33%',
  },

  // Gold accent
  gold: {
    light: '48 100% 85%',
    DEFAULT: '44 100% 73%',
    dark: '40 89% 60%',
  },

  // Semantic colors
  success: '142 76% 36%',
  warning: '38 92% 50%',
  error: '0 84% 60%',
  info: '217 91% 60%',

  // Neutrals (Slate)
  slate: {
    50: '210 40% 98%',
    100: '210 40% 96%',
    200: '214 32% 91%',
    300: '213 27% 84%',
    400: '215 20% 65%',
    500: '215 16% 47%',
    600: '215 19% 35%',
    700: '215 25% 27%',
    800: '217 33% 17%',
    900: '222 47% 11%',
    950: '229 84% 5%',
  },
}

export const darkTheme = {
  background: colors.slate[900],
  foreground: colors.slate[50],
  card: colors.slate[800],
  cardForeground: colors.slate[50],
  popover: colors.slate[800],
  popoverForeground: colors.slate[50],
  primary: colors.primary[500],
  primaryForeground: colors.slate[950],
  secondary: colors.slate[700],
  secondaryForeground: colors.slate[50],
  muted: colors.slate[700],
  mutedForeground: colors.slate[400],
  accent: colors.slate[700],
  accentForeground: colors.slate[50],
  destructive: colors.error,
  destructiveForeground: colors.slate[50],
  border: colors.slate[700],
  input: colors.slate[700],
  ring: colors.primary[500],
}

export const lightTheme = {
  background: colors.slate[50],
  foreground: colors.slate[900],
  card: 'white',
  cardForeground: colors.slate[900],
  popover: 'white',
  popoverForeground: colors.slate[900],
  primary: colors.primary[600],
  primaryForeground: colors.slate[50],
  secondary: colors.slate[100],
  secondaryForeground: colors.slate[900],
  muted: colors.slate[100],
  mutedForeground: colors.slate[500],
  accent: colors.slate[100],
  accentForeground: colors.slate[900],
  destructive: colors.error,
  destructiveForeground: colors.slate[50],
  border: colors.slate[200],
  input: colors.slate[200],
  ring: colors.primary[500],
}

/**
 * Generate CSS custom properties for a theme
 */
export function generateThemeCSS(theme: typeof darkTheme): string {
  return Object.entries(theme)
    .map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
      return `  --${cssKey}: ${value};`
    })
    .join('\n')
}

export const typography = {
  fontSans: 'Inter, system-ui, sans-serif',
  fontMono: 'JetBrains Mono, monospace',
  fontDisplay: 'Dosis, sans-serif',
}

export const spacing = {
  px: '1px',
  0: '0px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
}

export const borderRadius = {
  none: '0',
  sm: '0.125rem',
  DEFAULT: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
}
