"use client";

import { Zap } from "lucide-react";

/**
 * Animated Mission Control icon.
 * Renders a pulsing ring, a glowing container, and a zap-flash icon.
 * Keyframes are defined in app/globals.css (mc-ping, mc-glow, mc-zap).
 */
export function MissionControlIcon() {
  return (
    <div className="relative w-8 h-8 flex-shrink-0">
      {/* Expanding pulse ring */}
      <span
        className="absolute inset-0 rounded-lg bg-primary/30"
        style={{ animation: "mc-ping 2.4s ease-in-out infinite" }}
      />
      {/* Glowing icon container */}
      <div
        className="relative w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center"
        style={{ animation: "mc-glow 2.4s ease-in-out infinite" }}
      >
        {/* Zap flash */}
        <Zap
          className="w-4 h-4 text-primary"
          style={{ animation: "mc-zap 2.4s ease-in-out infinite" }}
        />
      </div>
    </div>
  );
}
