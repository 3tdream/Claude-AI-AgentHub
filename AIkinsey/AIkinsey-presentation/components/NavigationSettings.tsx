"use client";

import { useState } from "react";
import {
  Settings,
  GripVertical,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Share2,
  Circle,
  Volume2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface NavigationConfig {
  bottomNav: {
    order: ('prev' | 'indicators' | 'next')[];
    visible: {
      prev: boolean;
      indicators: boolean;
      next: boolean;
    };
    position: 'left' | 'center' | 'right';
  };
  topNav: {
    order: ('share' | 'counter' | 'sound')[];
    visible: {
      share: boolean;
      counter: boolean;
      sound: boolean;
    };
    position: 'left' | 'right';
  };
  keyboardHint: {
    visible: boolean;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  };
}

const defaultConfig: NavigationConfig = {
  bottomNav: {
    order: ['prev', 'indicators', 'next'],
    visible: {
      prev: true,
      indicators: true,
      next: true,
    },
    position: 'center',
  },
  topNav: {
    order: ['sound', 'share', 'counter'],
    visible: {
      sound: true,
      share: true,
      counter: true,
    },
    position: 'right',
  },
  keyboardHint: {
    visible: true,
    position: 'top-left',
  },
};

interface NavigationSettingsProps {
  config: NavigationConfig;
  onConfigChange: (config: NavigationConfig) => void;
}

export function NavigationSettings({ config, onConfigChange }: NavigationSettingsProps) {
  const [localConfig, setLocalConfig] = useState<NavigationConfig>(config);

  const updateConfig = (newConfig: NavigationConfig) => {
    setLocalConfig(newConfig);
    onConfigChange(newConfig);
  };

  const moveItem = (
    section: 'bottomNav' | 'topNav',
    index: number,
    direction: 'up' | 'down'
  ) => {
    const newConfig = { ...localConfig };
    const items = [...newConfig[section].order];

    if (direction === 'up' && index > 0) {
      [items[index], items[index - 1]] = [items[index - 1], items[index]];
    } else if (direction === 'down' && index < items.length - 1) {
      [items[index], items[index + 1]] = [items[index + 1], items[index]];
    }

    newConfig[section].order = items as any;
    updateConfig(newConfig);
  };

  const toggleVisibility = (
    section: 'bottomNav' | 'topNav',
    item: string
  ) => {
    const newConfig = { ...localConfig };
    newConfig[section].visible = {
      ...newConfig[section].visible,
      [item]: !newConfig[section].visible[item as keyof typeof newConfig[typeof section]['visible']],
    };
    updateConfig(newConfig);
  };

  const updatePosition = (
    section: 'bottomNav' | 'topNav',
    position: string
  ) => {
    const newConfig = { ...localConfig };
    newConfig[section].position = position as any;
    updateConfig(newConfig);
  };

  const resetToDefault = () => {
    updateConfig(defaultConfig);
  };

  const getIcon = (item: string) => {
    switch (item) {
      case 'prev':
        return <ChevronLeft className="w-4 h-4" />;
      case 'next':
        return <ChevronRight className="w-4 h-4" />;
      case 'indicators':
        return <Circle className="w-4 h-4" />;
      case 'share':
        return <Share2 className="w-4 h-4" />;
      case 'sound':
        return <Volume2 className="w-4 h-4" />;
      case 'counter':
        return <span className="text-xs font-bold">1/16</span>;
      default:
        return null;
    }
  };

  const getLabel = (item: string) => {
    const labels: Record<string, string> = {
      prev: 'Previous Button',
      next: 'Next Button',
      indicators: 'Slide Indicators',
      share: 'Share Button',
      sound: 'Sound Control',
      counter: 'Slide Counter',
    };
    return labels[item] || item;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-md"
          title="Navigation Settings"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Navigation Settings</DialogTitle>
          <DialogDescription>
            Customize the order and visibility of navigation controls
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Bottom Navigation */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Bottom Navigation</h3>

            <div className="space-y-2">
              <Label>Position</Label>
              <Select
                value={localConfig.bottomNav.position}
                onValueChange={(value) => updatePosition('bottomNav', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Button Order</Label>
              <div className="space-y-2 bg-muted p-3 rounded-lg">
                {localConfig.bottomNav.order.map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 bg-background p-3 rounded-md"
                  >
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => moveItem('bottomNav', index, 'up')}
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => moveItem('bottomNav', index, 'down')}
                        disabled={index === localConfig.bottomNav.order.length - 1}
                      >
                        ↓
                      </Button>
                    </div>

                    <GripVertical className="w-4 h-4 text-muted-foreground" />

                    <div className="flex items-center gap-2 flex-1">
                      {getIcon(item)}
                      <span className="text-sm font-medium">{getLabel(item)}</span>
                    </div>

                    <Switch
                      checked={localConfig.bottomNav.visible[item as keyof typeof localConfig.bottomNav.visible]}
                      onCheckedChange={() => toggleVisibility('bottomNav', item)}
                    />
                    {localConfig.bottomNav.visible[item as keyof typeof localConfig.bottomNav.visible] ? (
                      <Eye className="w-4 h-4 text-green-500" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Navigation */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Top Navigation</h3>

            <div className="space-y-2">
              <Label>Position</Label>
              <Select
                value={localConfig.topNav.position}
                onValueChange={(value) => updatePosition('topNav', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Button Order</Label>
              <div className="space-y-2 bg-muted p-3 rounded-lg">
                {localConfig.topNav.order.map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 bg-background p-3 rounded-md"
                  >
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => moveItem('topNav', index, 'up')}
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => moveItem('topNav', index, 'down')}
                        disabled={index === localConfig.topNav.order.length - 1}
                      >
                        ↓
                      </Button>
                    </div>

                    <GripVertical className="w-4 h-4 text-muted-foreground" />

                    <div className="flex items-center gap-2 flex-1">
                      {getIcon(item)}
                      <span className="text-sm font-medium">{getLabel(item)}</span>
                    </div>

                    <Switch
                      checked={localConfig.topNav.visible[item as keyof typeof localConfig.topNav.visible]}
                      onCheckedChange={() => toggleVisibility('topNav', item)}
                    />
                    {localConfig.topNav.visible[item as keyof typeof localConfig.topNav.visible] ? (
                      <Eye className="w-4 h-4 text-green-500" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Keyboard Hint */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Keyboard Hint</h3>

            <div className="flex items-center justify-between">
              <Label>Show keyboard navigation hint</Label>
              <Switch
                checked={localConfig.keyboardHint.visible}
                onCheckedChange={(checked) => {
                  const newConfig = { ...localConfig };
                  newConfig.keyboardHint.visible = checked;
                  updateConfig(newConfig);
                }}
              />
            </div>

            {localConfig.keyboardHint.visible && (
              <div className="space-y-2">
                <Label>Position</Label>
                <Select
                  value={localConfig.keyboardHint.position}
                  onValueChange={(value) => {
                    const newConfig = { ...localConfig };
                    newConfig.keyboardHint.position = value as any;
                    updateConfig(newConfig);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top-left">Top Left</SelectItem>
                    <SelectItem value="top-right">Top Right</SelectItem>
                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Reset Button */}
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={resetToDefault}
              className="w-full"
            >
              Reset to Default
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { defaultConfig };
