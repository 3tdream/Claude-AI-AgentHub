"use client";

import * as LucideIcons from "lucide-react";
import { LucideProps } from "lucide-react";

interface LucideIconProps extends Omit<LucideProps, "ref"> {
  name: string;
  className?: string;
}

export function LucideIcon({ name, className, ...props }: LucideIconProps) {
  const IconComponent = (LucideIcons as any)[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in lucide-react`);
    return null;
  }

  return <IconComponent className={className} {...props} />;
}

/**
 * Parse icon from text format like "[IconName] Text content"
 * Returns { icon: "IconName", text: "Text content" }
 */
export function parseIconText(text: string): { icon: string | null; text: string } {
  const match = text.match(/^\[([^\]]+)\]\s*(.+)$/);
  if (match) {
    return { icon: match[1], text: match[2] };
  }
  return { icon: null, text };
}
