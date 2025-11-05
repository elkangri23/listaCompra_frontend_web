export const colorTokens = {
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  primary: 'hsl(var(--primary))',
  primaryForeground: 'hsl(var(--primary-foreground))',
  secondary: 'hsl(var(--secondary))',
  secondaryForeground: 'hsl(var(--secondary-foreground))',
  accent: 'hsl(var(--accent))',
  accentForeground: 'hsl(var(--accent-foreground))',
  muted: 'hsl(var(--muted))',
  mutedForeground: 'hsl(var(--muted-foreground))',
  destructive: 'hsl(var(--destructive))',
  destructiveForeground: 'hsl(var(--destructive-foreground))',
  ring: 'hsl(var(--ring))',
  border: 'hsl(var(--border))',
  card: 'hsl(var(--card))',
  cardForeground: 'hsl(var(--card-foreground))',
}

export const typographyTokens = {
  fontSans: 'var(--font-sans)',
  fontDisplay: 'var(--font-display)',
  heading: {
    xl: 'clamp(2.5rem, 1.2vw + 2.1rem, 3.25rem)',
    lg: 'clamp(2rem, 1vw + 1.8rem, 2.75rem)',
    md: 'clamp(1.5rem, 0.8vw + 1.4rem, 2.1rem)',
    sm: 'clamp(1.25rem, 0.6vw + 1.1rem, 1.75rem)',
  },
  body: {
    lg: '1.125rem',
    base: '1rem',
    sm: '0.875rem',
  },
  lineHeight: {
    relaxed: 1.7,
    snug: 1.35,
  },
}

export const spacingTokens = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
  '2xl': '2rem',
}

export const radiusTokens = {
  sm: 'calc(var(--radius) - 4px)',
  md: 'calc(var(--radius) - 2px)',
  lg: 'var(--radius)',
  pill: '999px',
}

export type DesignTokens = {
  colors: typeof colorTokens
  typography: typeof typographyTokens
  spacing: typeof spacingTokens
  radius: typeof radiusTokens
}

export const designTokens: DesignTokens = {
  colors: colorTokens,
  typography: typographyTokens,
  spacing: spacingTokens,
  radius: radiusTokens,
}
