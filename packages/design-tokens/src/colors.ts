import colorsData from './colors.json';

export const colors = colorsData.colors;

export type ColorScale = {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
};

export type SemanticColors = {
  light: string;
  main: string;
  dark: string;
};

export type ColorTokens = {
  primary: ColorScale;
  secondary: ColorScale;
  neutral: ColorScale;
  semantic: {
    success: SemanticColors;
    error: SemanticColors;
    warning: SemanticColors;
    info: SemanticColors;
  };
  background: {
    light: string;
    dark: string;
    lightSecondary: string;
    darkSecondary: string;
  };
  text: {
    light: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
    dark: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
  };
};
