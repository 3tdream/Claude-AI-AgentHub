"use client";

import { useState, useEffect } from "react";
import { Paintbrush, Check, Plus, Trash2, Download, Upload, Eye } from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { defaultThemes, ThemePreset } from "@/lib/themes";

interface ThemeManagerProps {
  onApply?: (theme: ThemePreset) => void;
  presentationData?: any;
  onDataUpdate?: (data: any) => void;
}

export function ThemeManager({ onApply, presentationData, onDataUpdate }: ThemeManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [themes, setThemes] = useState<ThemePreset[]>(defaultThemes);
  const [selectedTheme, setSelectedTheme] = useState<string>("dark-professional");
  const [customThemeName, setCustomThemeName] = useState("");
  const [currentTheme, setCurrentTheme] = useState<ThemePreset>(defaultThemes[0]);

  useEffect(() => {
    // Load custom themes from localStorage
    const saved = localStorage.getItem("custom-themes");
    if (saved) {
      try {
        const customThemes = JSON.parse(saved);
        setThemes([...defaultThemes, ...customThemes]);
      } catch (e) {
        console.error("Failed to load custom themes:", e);
      }
    }

    // Load current theme
    const savedTheme = localStorage.getItem("current-theme");
    if (savedTheme) {
      const theme = themes.find(t => t.id === savedTheme) || defaultThemes[0];
      setCurrentTheme(theme);
      setSelectedTheme(savedTheme);
    }
  }, []);

  const applyTheme = (theme: ThemePreset) => {
    const root = document.documentElement;

    // Apply colors
    root.style.setProperty("--theme-primary", theme.colors.primary);
    root.style.setProperty("--theme-secondary", theme.colors.secondary);
    root.style.setProperty("--theme-accent", theme.colors.accent);
    root.style.setProperty("--theme-background", theme.colors.background);
    root.style.setProperty("--theme-text", theme.colors.text);
    root.style.setProperty("--theme-card-bg", theme.colors.cardBg);
    root.style.setProperty("--theme-border", theme.colors.border);

    // Apply gradients
    root.style.setProperty("--theme-gradient-hero", theme.gradients.hero);
    root.style.setProperty("--theme-gradient-card", theme.gradients.card);
    root.style.setProperty("--theme-gradient-button", theme.gradients.button);

    // Update presentation data with theme colors
    if (presentationData && onDataUpdate) {
      const updatedData = JSON.parse(JSON.stringify(presentationData));

      // Update slide backgrounds with theme gradients
      updatedData.slides = updatedData.slides.map((slide: any, index: number) => {
        if (slide.background) {
          // Change background type to gradient and apply theme gradient
          slide.background.type = "gradient";

          // Apply hero gradient to title slides
          if (slide.type === "title") {
            slide.background.source = theme.gradients.hero;
          }
          // Apply card gradient to content, stats, and cards slides
          else if (slide.type === "content" || slide.type === "stats" || slide.type === "cards" || slide.type === "dual-list") {
            slide.background.source = theme.gradients.card;
          }
          // Apply button gradient to CTA slides
          else if (slide.type === "cta") {
            slide.background.source = theme.gradients.button;
          }
          // Default to card gradient
          else {
            slide.background.source = theme.gradients.card;
          }

          // Set overlay to false for gradient backgrounds
          slide.overlay = false;
        }
        return slide;
      });

      onDataUpdate(updatedData);
    }

    // Save current theme
    localStorage.setItem("current-theme", theme.id);
    localStorage.setItem("theme-applied", JSON.stringify(theme));
    setCurrentTheme(theme);

    if (onApply) {
      onApply(theme);
    }

    // Reload to apply theme
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleApplyTheme = () => {
    const theme = themes.find(t => t.id === selectedTheme);
    if (theme) {
      applyTheme(theme);
    }
  };

  const saveCurrentAsCustom = () => {
    if (!customThemeName.trim()) return;

    const newTheme: ThemePreset = {
      ...currentTheme,
      id: `custom-${Date.now()}`,
      name: customThemeName,
      description: "Custom theme",
      isCustom: true,
    };

    const customThemes = themes.filter(t => t.isCustom);
    customThemes.push(newTheme);

    localStorage.setItem("custom-themes", JSON.stringify(customThemes));
    setThemes([...defaultThemes, ...customThemes]);
    setCustomThemeName("");
  };

  const deleteCustomTheme = (themeId: string) => {
    const updatedThemes = themes.filter(t => t.id !== themeId);
    const customThemes = updatedThemes.filter(t => t.isCustom);

    localStorage.setItem("custom-themes", JSON.stringify(customThemes));
    setThemes(updatedThemes);
  };

  const exportTheme = () => {
    const theme = themes.find(t => t.id === selectedTheme);
    if (!theme) return;

    const blob = new Blob([JSON.stringify(theme, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${theme.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importTheme = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          imported.isCustom = true;
          imported.id = `custom-${Date.now()}`;

          const customThemes = [...themes.filter(t => t.isCustom), imported];
          localStorage.setItem("custom-themes", JSON.stringify(customThemes));
          setThemes([...defaultThemes, ...customThemes]);
        } catch (err) {
          console.error("Failed to import theme:", err);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          size="icon"
          className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-md"
          title="Theme Manager"
        >
          <Paintbrush className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Theme Manager</DialogTitle>
          <DialogDescription>
            Choose a preset theme or create your own custom theme
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-6 mt-4">
            {/* Theme Selection */}
            <div className="space-y-4">
              <Label>Select Theme</Label>
              <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <div className="font-semibold text-xs text-muted-foreground px-2 py-1">
                    Built-in Themes
                  </div>
                  {themes.filter(t => !t.isCustom).map(theme => (
                    <SelectItem key={theme.id} value={theme.id}>
                      {theme.name}
                    </SelectItem>
                  ))}
                  {themes.some(t => t.isCustom) && (
                    <>
                      <div className="font-semibold text-xs text-muted-foreground px-2 py-1 mt-2">
                        Custom Themes
                      </div>
                      {themes.filter(t => t.isCustom).map(theme => (
                        <SelectItem key={theme.id} value={theme.id}>
                          {theme.name}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Theme Preview */}
            {selectedTheme && (() => {
              const theme = themes.find(t => t.id === selectedTheme);
              if (!theme) return null;

              return (
                <div className="space-y-4 border rounded-lg p-4">
                  <div>
                    <h3 className="font-bold text-lg">{theme.name}</h3>
                    <p className="text-sm text-muted-foreground">{theme.description}</p>
                  </div>

                  {/* Color Swatches */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Colors</Label>
                    <div className="grid grid-cols-7 gap-2">
                      {Object.entries(theme.colors).map(([key, value]) => (
                        <div key={key} className="space-y-1">
                          <div
                            className="w-full h-12 rounded border-2"
                            style={{ backgroundColor: value }}
                          />
                          <p className="text-xs text-center capitalize">{key}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gradient Previews */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Gradients</Label>
                    <div className="space-y-2">
                      {Object.entries(theme.gradients).map(([key, value]) => (
                        <div key={key} className="space-y-1">
                          <div
                            className="w-full h-16 rounded border-2"
                            style={{ background: value }}
                          />
                          <p className="text-xs capitalize">{key} Gradient</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delete Custom Theme */}
                  {theme.isCustom && (
                    <Button
                      onClick={() => deleteCustomTheme(theme.id)}
                      variant="destructive"
                      size="sm"
                      className="w-full"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Custom Theme
                    </Button>
                  )}
                </div>
              );
            })()}

            {/* Save Current as Custom */}
            <div className="space-y-2 border-t pt-4">
              <Label>Save Current Theme as Custom</Label>
              <div className="flex gap-2">
                <Input
                  value={customThemeName}
                  onChange={(e) => setCustomThemeName(e.target.value)}
                  placeholder="Enter custom theme name"
                />
                <Button onClick={saveCurrentAsCustom} disabled={!customThemeName.trim()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>

            {/* Import/Export */}
            <div className="flex gap-2 border-t pt-4">
              <Button onClick={importTheme} variant="outline" className="flex-1">
                <Upload className="w-4 h-4 mr-2" />
                Import Theme
              </Button>
              <Button onClick={exportTheme} variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Export Theme
              </Button>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleApplyTheme}>
            <Check className="w-4 h-4 mr-2" />
            Apply Theme
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
