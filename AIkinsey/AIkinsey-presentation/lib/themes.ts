export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    cardBg: string;
    border: string;
  };
  gradients: {
    hero: string;
    card: string;
    button: string;
  };
  isCustom?: boolean;
}

export const defaultThemes: ThemePreset[] = [
  {
    id: "dark-professional",
    name: "Dark Professional",
    description: "Modern dark theme with blue accents",
    colors: {
      primary: "#3B82F6",
      secondary: "#8B5CF6",
      accent: "#10B981",
      background: "#0F172A",
      text: "#F8FAFC",
      cardBg: "#1E293B",
      border: "#334155",
    },
    gradients: {
      hero: "linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e40af 100%)",
      card: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
      button: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    },
  },
  {
    id: "light-professional",
    name: "Light Professional",
    description: "Clean light theme with blue accents",
    colors: {
      primary: "#2563EB",
      secondary: "#7C3AED",
      accent: "#059669",
      background: "#FFFFFF",
      text: "#0F172A",
      cardBg: "#F8FAFC",
      border: "#E2E8F0",
    },
    gradients: {
      hero: "linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #dbeafe 100%)",
      card: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
      button: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    },
  },
  {
    id: "blue-ocean",
    name: "Blue Ocean",
    description: "Refreshing blue water theme",
    colors: {
      primary: "#0EA5E9",
      secondary: "#06B6D4",
      accent: "#14B8A6",
      background: "#0C4A6E",
      text: "#F0F9FF",
      cardBg: "#075985",
      border: "#0284C7",
    },
    gradients: {
      hero: "linear-gradient(135deg, #0c4a6e 0%, #075985 50%, #0284c7 100%)",
      card: "linear-gradient(135deg, #075985 0%, #0369a1 100%)",
      button: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
    },
  },
  {
    id: "purple-gradient",
    name: "Purple Gradient",
    description: "Vibrant purple and pink theme",
    colors: {
      primary: "#A855F7",
      secondary: "#EC4899",
      accent: "#F59E0B",
      background: "#581C87",
      text: "#FAF5FF",
      cardBg: "#6B21A8",
      border: "#7C3AED",
    },
    gradients: {
      hero: "linear-gradient(135deg, #581c87 0%, #7c3aed 50%, #a855f7 100%)",
      card: "linear-gradient(135deg, #6b21a8 0%, #7c3aed 100%)",
      button: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)",
    },
  },
  {
    id: "green-nature",
    name: "Green Nature",
    description: "Fresh green and earth tones",
    colors: {
      primary: "#10B981",
      secondary: "#059669",
      accent: "#84CC16",
      background: "#064E3B",
      text: "#F0FDF4",
      cardBg: "#065F46",
      border: "#047857",
    },
    gradients: {
      hero: "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)",
      card: "linear-gradient(135deg, #065f46 0%, #047857 100%)",
      button: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    },
  },
  {
    id: "red-energy",
    name: "Red Energy",
    description: "Bold red and orange theme",
    colors: {
      primary: "#EF4444",
      secondary: "#F97316",
      accent: "#FCD34D",
      background: "#7F1D1D",
      text: "#FEF2F2",
      cardBg: "#991B1B",
      border: "#B91C1C",
    },
    gradients: {
      hero: "linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #dc2626 100%)",
      card: "linear-gradient(135deg, #991b1b 0%, #b91c1c 100%)",
      button: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    },
  },
  {
    id: "midnight-blue",
    name: "Midnight Blue",
    description: "Deep blue midnight theme",
    colors: {
      primary: "#60A5FA",
      secondary: "#818CF8",
      accent: "#34D399",
      background: "#1E3A8A",
      text: "#EFF6FF",
      cardBg: "#1E40AF",
      border: "#2563EB",
    },
    gradients: {
      hero: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)",
      card: "linear-gradient(135deg, #1e40af 0%, #2563eb 100%)",
      button: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
    },
  },
  {
    id: "sunset-gradient",
    name: "Sunset Gradient",
    description: "Warm sunset orange and pink",
    colors: {
      primary: "#FB923C",
      secondary: "#F472B6",
      accent: "#FBBF24",
      background: "#7C2D12",
      text: "#FFF7ED",
      cardBg: "#9A3412",
      border: "#C2410C",
    },
    gradients: {
      hero: "linear-gradient(135deg, #7c2d12 0%, #ea580c 50%, #f97316 100%)",
      card: "linear-gradient(135deg, #9a3412 0%, #c2410c 100%)",
      button: "linear-gradient(135deg, #fb923c 0%, #f97316 100%)",
    },
  },
];
