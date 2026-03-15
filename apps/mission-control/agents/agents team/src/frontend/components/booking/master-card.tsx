// ============================================================
// MasterCard — Selectable specialist card
// Avatar, name, specialization, star rating, availability badge
// ============================================================

"use client";

import { motion } from "motion/react";
import { Star, User } from "lucide-react";
import type { Master } from "../../types/booking";

interface MasterCardProps {
  master: Master;
  isSelected: boolean;
  onSelect: (master: Master) => void;
}

export function MasterCard({
  master,
  isSelected,
  onSelect,
}: MasterCardProps) {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(master)}
      className={`
        group relative w-full rounded-2xl p-4
        text-left transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C94B6E] focus-visible:ring-offset-2
        ${
          isSelected
            ? "border-2 border-[#C94B6E] bg-[#F5E8EC]/60 shadow-sm"
            : "border border-[#E0D9D0] bg-white hover:border-[#C94B6E]/40 hover:shadow-sm"
        }
        ${!master.isAvailable ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
      disabled={!master.isAvailable}
      whileTap={master.isAvailable ? { scale: 0.98 } : undefined}
      aria-pressed={isSelected}
      aria-label={`${master.name}, ${master.specialization}, rating ${master.rating}`}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative h-14 w-14 shrink-0">
          {master.avatarUrl ? (
            <img
              src={master.avatarUrl}
              alt={`${master.name}'s photo`}
              className={`
                h-14 w-14 rounded-xl object-cover
                transition-all duration-200
                ${isSelected ? "ring-2 ring-[#C94B6E] ring-offset-1" : ""}
              `}
            />
          ) : (
            <div
              className={`
                flex h-14 w-14 items-center justify-center rounded-xl
                transition-colors duration-200
                ${
                  isSelected
                    ? "bg-[#C94B6E] text-white"
                    : "bg-[#F5E8EC] text-[#C94B6E]"
                }
              `}
            >
              <User className="h-6 w-6" />
            </div>
          )}

          {/* Online/available indicator dot */}
          {master.isAvailable && (
            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#3D9467]" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3
            className={`text-sm font-semibold leading-tight ${
              isSelected ? "text-[#C94B6E]" : "text-[#282320]"
            }`}
          >
            {master.name}
          </h3>

          <p className="mt-0.5 text-xs text-[#8A7F76] truncate">
            {master.specialization}
          </p>

          <div className="mt-1.5 flex items-center gap-2">
            {/* Star rating */}
            <div className="flex items-center gap-0.5">
              <Star
                className="h-3.5 w-3.5 fill-[#E8931A] text-[#E8931A]"
              />
              <span className="text-xs font-semibold text-[#282320]">
                {(master.rating ?? 0).toFixed(1)}
              </span>
              <span className="text-[10px] text-[#8A7F76]">
                ({master.reviewCount})
              </span>
            </div>

            {/* Availability badge */}
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                master.isAvailable
                  ? "bg-[#3D9467]/10 text-[#3D9467]"
                  : "bg-red-50 text-[#D42020]"
              }`}
            >
              {master.isAvailable ? "Available" : "Busy"}
            </span>
          </div>
        </div>
      </div>

      {/* Bio (if available) */}
      {master.bio && (
        <p className="mt-2 text-[11px] leading-relaxed text-[#8A7F76] line-clamp-2">
          {master.bio}
        </p>
      )}

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

export function MasterCardSkeleton() {
  return (
    <div className="w-full animate-pulse rounded-2xl border border-[#E0D9D0] bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="h-14 w-14 shrink-0 rounded-xl bg-[#EDE9E3]" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 rounded bg-[#EDE9E3]" />
          <div className="h-3 w-1/2 rounded bg-[#EDE9E3]" />
          <div className="flex gap-2">
            <div className="h-3.5 w-10 rounded bg-[#EDE9E3]" />
            <div className="h-3.5 w-14 rounded-full bg-[#EDE9E3]" />
          </div>
        </div>
      </div>
    </div>
  );
}
