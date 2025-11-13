import spacingData from './spacing.json';

export const spacing = spacingData.spacing;
export const borderRadius = spacingData.borderRadius;
export const breakpoints = spacingData.breakpoints;

export type SpacingScale = typeof spacingData.spacing;
export type BorderRadiusScale = typeof spacingData.borderRadius;
export type Breakpoints = typeof spacingData.breakpoints;

export type SpacingTokens = {
  spacing: SpacingScale;
  borderRadius: BorderRadiusScale;
  breakpoints: Breakpoints;
};
