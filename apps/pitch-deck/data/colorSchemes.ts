/**
 * Color Schemes - Modern teal-cyan based palette with variants
 * Based on design token system
 */

import { ColorScheme } from '@/types/deck';

export const colorSchemes: ColorScheme[] = [
  // Primary: Teal-Cyan (Modern, Tech-focused)
  {
    primary: "bg-gradient-to-br from-primary-500 to-secondary-500",
    secondary: "bg-primary-50",
    accent: "text-primary-600",
    button: "bg-primary-600 hover:bg-primary-700"
  },
  // Variant: Cyan-Teal Reverse
  {
    primary: "bg-gradient-to-br from-secondary-500 to-primary-500",
    secondary: "bg-secondary-50",
    accent: "text-secondary-600",
    button: "bg-secondary-600 hover:bg-secondary-700"
  },
  // Variant: Deep Teal
  {
    primary: "bg-gradient-to-br from-primary-600 to-primary-800",
    secondary: "bg-primary-50",
    accent: "text-primary-700",
    button: "bg-primary-700 hover:bg-primary-800"
  },
  // Variant: Light Cyan
  {
    primary: "bg-gradient-to-br from-secondary-400 to-secondary-600",
    secondary: "bg-secondary-50",
    accent: "text-secondary-700",
    button: "bg-secondary-600 hover:bg-secondary-700"
  },
  // Accent: Teal with Purple
  {
    primary: "bg-gradient-to-br from-primary-500 via-primary-600 to-purple-600",
    secondary: "bg-primary-50",
    accent: "text-primary-700",
    button: "bg-primary-600 hover:bg-primary-700"
  },
  // Accent: Cyan with Blue
  {
    primary: "bg-gradient-to-br from-secondary-500 via-blue-500 to-blue-600",
    secondary: "bg-secondary-50",
    accent: "text-secondary-700",
    button: "bg-secondary-600 hover:bg-secondary-700"
  },
  // Modern: Teal Mono
  {
    primary: "bg-gradient-to-br from-primary-400 to-primary-600",
    secondary: "bg-gray-50",
    accent: "text-primary-600",
    button: "bg-primary-600 hover:bg-primary-700"
  }
];
