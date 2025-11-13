"use client";

import { useState } from "react";
import { Sparkles, Check, RotateCcw, Play } from "lucide-react";
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
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";

export interface AnimationConfig {
  type: 'fade' | 'slide' | 'scale' | 'flip' | 'zoom';
  duration: number;
  ease: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'spring';
  delay: number;
}

const defaultConfig: AnimationConfig = {
  type: 'fade',
  duration: 0.5,
  ease: 'easeOut',
  delay: 0,
};

interface AnimationEditorProps {
  onSave?: (config: AnimationConfig) => void;
}

export function AnimationEditor({ onSave }: AnimationEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<AnimationConfig>(defaultConfig);
  const [preview, setPreview] = useState(false);

  const handleOpen = () => {
    const saved = localStorage.getItem('animation-config');
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load animation config:', e);
      }
    }
    setIsOpen(true);
  };

  const handleSave = () => {
    localStorage.setItem('animation-config', JSON.stringify(config));
    if (onSave) {
      onSave(config);
    }
    setIsOpen(false);
  };

  const handleReset = () => {
    setConfig(defaultConfig);
    localStorage.removeItem('animation-config');
  };

  const getAnimationVariants = () => {
    const variants: Record<string, any> = {
      fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      },
      slide: {
        initial: { opacity: 0, x: 100 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -100 },
      },
      scale: {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.8 },
      },
      flip: {
        initial: { opacity: 0, rotateY: 90 },
        animate: { opacity: 1, rotateY: 0 },
        exit: { opacity: 0, rotateY: -90 },
      },
      zoom: {
        initial: { opacity: 0, scale: 1.5 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.5 },
      },
    };

    return variants[config.type] || variants.fade;
  };

  const triggerPreview = () => {
    setPreview(false);
    setTimeout(() => setPreview(true), 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={handleOpen}
          variant="outline"
          size="icon"
          className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-md"
          title="Animation Editor"
        >
          <Sparkles className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Animation & Transition Editor</DialogTitle>
          <DialogDescription>
            Customize slide transition animations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Preview Area */}
          <div className="bg-muted rounded-lg p-8 flex items-center justify-center h-48 overflow-hidden">
            {preview && (
              <motion.div
                className="bg-primary text-primary-foreground rounded-lg p-6 text-center font-bold"
                initial={getAnimationVariants().initial}
                animate={getAnimationVariants().animate}
                exit={getAnimationVariants().exit}
                transition={{
                  duration: config.duration,
                  ease: config.ease,
                  delay: config.delay,
                }}
              >
                Preview Animation
              </motion.div>
            )}
          </div>

          <Button onClick={triggerPreview} variant="outline" className="w-full">
            <Play className="w-4 h-4 mr-2" />
            Preview Animation
          </Button>

          {/* Animation Type */}
          <div className="space-y-2">
            <Label>Animation Type</Label>
            <Select
              value={config.type}
              onValueChange={(value) => setConfig({ ...config, type: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fade">Fade</SelectItem>
                <SelectItem value="slide">Slide</SelectItem>
                <SelectItem value="scale">Scale</SelectItem>
                <SelectItem value="flip">Flip</SelectItem>
                <SelectItem value="zoom">Zoom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Duration</Label>
              <span className="text-sm text-muted-foreground">{config.duration}s</span>
            </div>
            <Slider
              value={[config.duration]}
              onValueChange={([value]) => setConfig({ ...config, duration: value })}
              min={0.1}
              max={2}
              step={0.1}
            />
          </div>

          {/* Easing */}
          <div className="space-y-2">
            <Label>Easing Function</Label>
            <Select
              value={config.ease}
              onValueChange={(value) => setConfig({ ...config, ease: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="linear">Linear</SelectItem>
                <SelectItem value="easeIn">Ease In</SelectItem>
                <SelectItem value="easeOut">Ease Out</SelectItem>
                <SelectItem value="easeInOut">Ease In Out</SelectItem>
                <SelectItem value="spring">Spring</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Delay */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Delay</Label>
              <span className="text-sm text-muted-foreground">{config.delay}s</span>
            </div>
            <Slider
              value={[config.delay]}
              onValueChange={([value]) => setConfig({ ...config, delay: value })}
              min={0}
              max={1}
              step={0.1}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Check className="w-4 h-4 mr-2" />
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
