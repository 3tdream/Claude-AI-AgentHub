import { z } from 'zod'

export const ColorTokenSchema = z.object({
  primary: z.string(),
  'primary-foreground': z.string(),
  secondary: z.string(),
  'secondary-foreground': z.string(),
  background: z.string(),
  foreground: z.string(),
  muted: z.string(),
  'muted-foreground': z.string(),
  accent: z.string(),
  'accent-foreground': z.string(),
  destructive: z.string(),
  'destructive-foreground': z.string(),
  border: z.string(),
  input: z.string(),
  ring: z.string(),
  card: z.string(),
  'card-foreground': z.string(),
  popover: z.string(),
  'popover-foreground': z.string(),
})

export const TypographyTokenSchema = z.object({
  fontFamily: z.object({
    sans: z.string(),
    heading: z.string(),
    mono: z.string().optional(),
  }),
  fontSize: z.object({
    xs: z.string(),
    sm: z.string(),
    base: z.string(),
    lg: z.string(),
    xl: z.string(),
    '2xl': z.string(),
    '3xl': z.string(),
    '4xl': z.string(),
  }),
  fontWeight: z.object({
    normal: z.string(),
    medium: z.string(),
    semibold: z.string(),
    bold: z.string(),
  }),
  lineHeight: z.object({
    tight: z.string(),
    normal: z.string(),
    relaxed: z.string(),
  }),
})

export const SpacingTokenSchema = z.object({
  xs: z.string(),
  sm: z.string(),
  md: z.string(),
  lg: z.string(),
  xl: z.string(),
  '2xl': z.string(),
})

export const RadiusTokenSchema = z.object({
  none: z.string(),
  sm: z.string(),
  md: z.string(),
  lg: z.string(),
  xl: z.string(),
  full: z.string(),
})

export const ShadowTokenSchema = z.object({
  sm: z.string(),
  md: z.string(),
  lg: z.string(),
  xl: z.string(),
})

export const MotionTokenSchema = z.object({
  duration: z.object({
    fast: z.string(),
    normal: z.string(),
    slow: z.string(),
  }),
  ease: z.object({
    in: z.string(),
    out: z.string(),
    inOut: z.string(),
  }),
})

export const ThemeSchema = z.object({
  name: z.string(),
  colors: ColorTokenSchema,
})

export const DesignTokensSchema = z.object({
  themes: z.array(ThemeSchema),
  typography: TypographyTokenSchema,
  spacing: SpacingTokenSchema,
  radius: RadiusTokenSchema,
  shadows: ShadowTokenSchema,
  motion: MotionTokenSchema,
})

export type ColorToken = z.infer<typeof ColorTokenSchema>
export type TypographyToken = z.infer<typeof TypographyTokenSchema>
export type SpacingToken = z.infer<typeof SpacingTokenSchema>
export type RadiusToken = z.infer<typeof RadiusTokenSchema>
export type ShadowToken = z.infer<typeof ShadowTokenSchema>
export type MotionToken = z.infer<typeof MotionTokenSchema>
export type Theme = z.infer<typeof ThemeSchema>
export type DesignTokens = z.infer<typeof DesignTokensSchema>
