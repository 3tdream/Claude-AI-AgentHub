"use client";

import { useState } from "react";
import { Palette, Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ColorScheme {
  light: {
    background: string;
    foreground: string;
    card: string;
    primary: string;
    secondary: string;
    muted: string;
    accent: string;
    destructive: string;
    border: string;
  };
  dark: {
    background: string;
    foreground: string;
    card: string;
    primary: string;
    secondary: string;
    muted: string;
    accent: string;
    destructive: string;
    border: string;
  };
}

const defaultScheme: ColorScheme = {
  light: {
    background: "0 0% 100%",
    foreground: "0 0% 3.9%",
    card: "0 0% 100%",
    primary: "0 0% 9%",
    secondary: "0 0% 96.1%",
    muted: "0 0% 96.1%",
    accent: "0 0% 96.1%",
    destructive: "0 84.2% 60.2%",
    border: "0 0% 89.8%",
  },
  dark: {
    background: "0 0% 3.9%",
    foreground: "0 0% 98%",
    card: "0 0% 3.9%",
    primary: "0 0% 98%",
    secondary: "0 0% 14.9%",
    muted: "0 0% 14.9%",
    accent: "0 0% 14.9%",
    destructive: "0 62.8% 30.6%",
    border: "0 0% 14.9%",
  },
};

interface ColorPaletteEditorProps {
  onSave?: (scheme: ColorScheme) => void;
}

export function ColorPaletteEditor({ onSave }: ColorPaletteEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scheme, setScheme] = useState<ColorScheme>(defaultScheme);

  const handleOpen = () => {
    // Try to load from localStorage first
    const saved = localStorage.getItem("color-scheme");
    if (saved) {
      try {
        const savedScheme = JSON.parse(saved);
        setScheme(savedScheme);
        setIsOpen(true);
        return;
      } catch (e) {
        console.error('Failed to load saved color scheme:', e);
      }
    }

    // Fallback: Load current colors from CSS variables
    const root = document.documentElement;
    const style = getComputedStyle(root);

    const lightScheme = { ...defaultScheme.light };
    const darkScheme = { ...defaultScheme.dark };

    // Try to load from CSS variables
    Object.keys(lightScheme).forEach((key) => {
      const value = style.getPropertyValue(`--${key}`).trim();
      if (value) {
        lightScheme[key as keyof typeof lightScheme] = value;
      }
    });

    setScheme({ light: lightScheme, dark: darkScheme });
    setIsOpen(true);
  };

  const handleSave = () => {
    const root = document.documentElement;

    // Check if we're in dark mode
    const isDarkMode = root.classList.contains('dark');

    // Apply the appropriate color scheme based on current mode
    const currentScheme = isDarkMode ? scheme.dark : scheme.light;
    Object.entries(currentScheme).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });

    // Save to localStorage
    localStorage.setItem("color-scheme", JSON.stringify(scheme));

    if (onSave) {
      onSave(scheme);
    }

    setIsOpen(false);
  };

  const handleReset = () => {
    setScheme(defaultScheme);
    localStorage.removeItem("color-scheme");
  };

  const updateColor = (mode: 'light' | 'dark', key: string, value: string) => {
    setScheme(prev => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        [key]: value,
      },
    }));
  };

  // Helper function to convert HSL to Hex
  const hslToHex = (hsl: string): string => {
    try {
      const [h, s, l] = hsl.split(' ').map(v => parseFloat(v.replace('%', '')));
      const hue = h / 360;
      const saturation = s / 100;
      const lightness = l / 100;

      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      let r, g, b;
      if (saturation === 0) {
        r = g = b = lightness;
      } else {
        const q = lightness < 0.5 ? lightness * (1 + saturation) : lightness + saturation - lightness * saturation;
        const p = 2 * lightness - q;
        r = hue2rgb(p, q, hue + 1/3);
        g = hue2rgb(p, q, hue);
        b = hue2rgb(p, q, hue - 1/3);
      }

      const toHex = (x: number) => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };

      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    } catch {
      return '#000000';
    }
  };

  // Helper function to convert Hex to HSL
  const hexToHsl = (hex: string): string => {
    try {
      let r = 0, g = 0, b = 0;
      if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
      } else if (hex.length === 7) {
        r = parseInt(hex.slice(1, 3), 16);
        g = parseInt(hex.slice(3, 5), 16);
        b = parseInt(hex.slice(5, 7), 16);
      }

      r /= 255;
      g /= 255;
      b /= 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
        }
      }

      h = Math.round(h * 360);
      s = Math.round(s * 100);
      l = Math.round(l * 100);

      return `${h} ${s}% ${l}%`;
    } catch {
      return '0 0% 0%';
    }
  };

  const ColorInput = ({ mode, colorKey, label }: { mode: 'light' | 'dark', colorKey: string, label: string }) => {
    const hslValue = scheme[mode][colorKey as keyof typeof scheme.light];
    const hexValue = hslToHex(hslValue);

    const handleHexChange = (hex: string) => {
      const hsl = hexToHsl(hex);
      updateColor(mode, colorKey, hsl);
    };

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="flex gap-2 items-center">
          <div className="flex-1 space-y-2">
            <div className="flex gap-2 items-center">
              <Input
                type="color"
                value={hexValue}
                onChange={(e) => handleHexChange(e.target.value)}
                className="w-16 h-10 p-1 cursor-pointer"
                title="Pick a color"
              />
              <Input
                type="text"
                value={hexValue}
                onChange={(e) => handleHexChange(e.target.value)}
                className="font-mono text-sm flex-1"
                placeholder="#000000"
              />
            </div>
            <Input
              type="text"
              value={hslValue}
              onChange={(e) => updateColor(mode, colorKey, e.target.value)}
              className="font-mono text-sm w-full"
              placeholder="0 0% 100%"
            />
          </div>
          <div
            className="w-16 h-16 rounded-lg border-2 border-border shadow-sm"
            style={{ backgroundColor: `hsl(${hslValue})` }}
          />
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={handleOpen}
          variant="outline"
          size="icon"
          className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-md"
          title="Color Palette Editor"
        >
          <Palette className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Color Palette Editor</DialogTitle>
          <DialogDescription>
            Customize the color scheme for your presentation. Colors use HSL format (e.g., "0 0% 100%")
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="light" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="light">Light Mode</TabsTrigger>
            <TabsTrigger value="dark">Dark Mode</TabsTrigger>
          </TabsList>

          <TabsContent value="light" className="space-y-4 mt-4">
            <ColorInput mode="light" colorKey="background" label="Background" />
            <ColorInput mode="light" colorKey="foreground" label="Foreground" />
            <ColorInput mode="light" colorKey="card" label="Card" />
            <ColorInput mode="light" colorKey="primary" label="Primary" />
            <ColorInput mode="light" colorKey="secondary" label="Secondary" />
            <ColorInput mode="light" colorKey="muted" label="Muted" />
            <ColorInput mode="light" colorKey="accent" label="Accent" />
            <ColorInput mode="light" colorKey="destructive" label="Destructive" />
            <ColorInput mode="light" colorKey="border" label="Border" />
          </TabsContent>

          <TabsContent value="dark" className="space-y-4 mt-4">
            <ColorInput mode="dark" colorKey="background" label="Background" />
            <ColorInput mode="dark" colorKey="foreground" label="Foreground" />
            <ColorInput mode="dark" colorKey="card" label="Card" />
            <ColorInput mode="dark" colorKey="primary" label="Primary" />
            <ColorInput mode="dark" colorKey="secondary" label="Secondary" />
            <ColorInput mode="dark" colorKey="muted" label="Muted" />
            <ColorInput mode="dark" colorKey="accent" label="Accent" />
            <ColorInput mode="dark" colorKey="destructive" label="Destructive" />
            <ColorInput mode="dark" colorKey="border" label="Border" />
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Default
          </Button>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Check className="w-4 h-4 mr-2" />
            Apply Colors
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
