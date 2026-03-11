// ============================================================
// ServiceCard — Selectable service card with icon, name, duration, price
// Selected state: border-2 primary + light background
// ============================================================

"use client";

import { motion } from "motion/react";
import {
  Scissors,
  Sparkles,
  Palette,
  Droplets,
  Heart,
  Sun,
  Flower2,
  Star,
  type LucideIcon,
} from "lucide-react";
import type { Service } from "../../types/booking";

/** Map icon names from backend to Lucide components */
const iconMap: Record<string, LucideIcon> = {
  scissors: Scissors,
  sparkles: Sparkles,
  palette: Palette,
  droplets: Droplets,
  heart: Heart,
  sun: Sun,
  flower: Flower2,
  star: Star,
};

interface ServiceCardProps {
  service: Service;
  isSelected: boolean;
  onSelect: (service: Service) => void;
}

export function ServiceCard({
  service,
  isSelected,
  onSelect,
}: ServiceCardProps) {
  const Icon = iconMap[service.icon] ?? Sparkles;

  /** Format price with currency symbol */
  const formattedPrice = new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: service.currency || "RUB",
    maximumFractionDigits: 0,
  }).format(service.price / 100);

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(service)}
      className={`
        group relative w-full rounded-2xl p-4
        text-left transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C94B6E] focus-visible:ring-offset-2
        ${
          isSelected
            ? "border-2 border-[#C94B6E] bg-[#F5E8EC]/60 shadow-sm"
            : "border border-[#E0D9D0] bg-white hover:border-[#C94B6E]/40 hover:shadow-sm"
        }
        ${!service.isAvailable ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
      disabled={!service.isAvailable}
      whileTap={service.isAvailable ? { scale: 0.98 } : undefined}
      aria-pressed={isSelected}
      aria-label={`${service.name}, ${service.duration} minutes, ${formattedPrice}`}
    >
      <div className="flex items-start gap-3">
        {/* Icon circle */}
        <div
          className={`
            flex h-11 w-11 shrink-0 items-center justify-center rounded-xl
            transition-colors duration-200
            ${
              isSelected
                ? "bg-[#C94B6E] text-white"
                : "bg-[#F5E8EC] text-[#C94B6E] group-hover:bg-[#C94B6E]/10"
            }
          `}
        >
          <Icon className="h-5 w-5" />
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <h3
            className={`text-sm font-semibold leading-tight ${
              isSelected ? "text-[#C94B6E]" : "text-[#282320]"
            }`}
          >
            {service.name}
          </h3>

          {service.description && (
            <p className="mt-0.5 text-xs text-[#8A7F76] line-clamp-1">
              {service.description}
            </p>
          )}

          <div className="mt-2 flex items-center gap-2">
            {/* Duration badge */}
            <span className="inline-flex items-center rounded-full bg-[#EDE9E3] px-2 py-0.5 text-[10px] font-medium text-[#8A7F76]">
              {service.duration} min
            </span>

            {!service.isAvailable && (
              <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-[#D42020]">
                Unavailable
              </span>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="shrink-0 text-right">
          <span
            className={`text-sm font-bold ${
              isSelected ? "text-[#C94B6E]" : "text-[#E8931A]"
            }`}
          >
            {formattedPrice}
          </span>
        </div>
      </div>

      {/* Selected checkmark */}
      {isSelected && (
        <motion.div
          className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#C94B6E]"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <svg
            className="h-3 w-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={3}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </motion.div>
      )}
    </motion.button>
  );
}

// ── Loading Skeleton ─────────────────────────────────────────

export function ServiceCardSkeleton() {
  return (
    <div className="w-full animate-pulse rounded-2xl border border-[#E0D9D0] bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="h-11 w-11 shrink-0 rounded-xl bg-[#EDE9E3]" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-[#EDE9E3]" />
          <div className="h-3 w-1/2 rounded bg-[#EDE9E3]" />
          <div className="h-4 w-14 rounded-full bg-[#EDE9E3]" />
        </div>
        <div className="h-4 w-12 rounded bg-[#EDE9E3]" />
      </div>
    </div>
  );
}
