// ============================================================
// ConfirmationScreen — Success screen after booking
// Animated success circle + booking details card
// ============================================================

"use client";

import { motion } from "motion/react";
import {
  Check,
  Calendar,
  Clock,
  User,
  Scissors,
  MapPin,
  Copy,
  Share2,
} from "lucide-react";
import { useState } from "react";
import type { BookingConfirmation } from "../../types/booking";

interface ConfirmationScreenProps {
  confirmation: BookingConfirmation;
  shopName: string;
  onBookAnother: () => void;
}

export function ConfirmationScreen({
  confirmation,
  shopName,
  onBookAnother,
}: ConfirmationScreenProps) {
  const [copied, setCopied] = useState(false);

  /** Format the datetime for display */
  const dateObj = new Date(confirmation.datetime);
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  /** Format price */
  const formattedPrice = new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: confirmation.currency || "RUB",
    maximumFractionDigits: 0,
  }).format(confirmation.price / 100);

  /** Copy booking code to clipboard */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(confirmation.bookingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may not be available
    }
  };

  return (
    <div className="flex flex-col items-center px-4 py-6">
      {/* ── Success Animation ─────────────────────────── */}
      <div className="relative mb-6">
        {/* Outer ring pulse */}
        <motion.div
          className="absolute inset-0 rounded-full bg-[#3D9467]/20"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: [1, 1.4, 1.4], opacity: [0.6, 0.3, 0] }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />

        {/* Success circle */}
        <motion.div
          className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[#3D9467]"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: 0.1,
          }}
        >
          {/* Checkmark */}
          <motion.div
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Check className="h-10 w-10 text-white" strokeWidth={3} />
          </motion.div>
        </motion.div>
      </div>

      {/* ── Title ─────────────────────────────────────── */}
      <motion.div
        className="mb-6 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-xl font-bold text-[#282320]">
          Booking Confirmed!
        </h2>
        <p className="mt-1 text-sm text-[#8A7F76]">
          We&apos;ve sent the details to your phone
        </p>
      </motion.div>

      {/* ── Booking Code ──────────────────────────────── */}
      <motion.div
        className="mb-5 flex items-center gap-2 rounded-full bg-[#F5E8EC] px-4 py-2"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
      >
        <span className="text-xs font-medium text-[#8A7F76]">
          Booking Code:
        </span>
        <span className="text-sm font-bold text-[#C94B6E]">
          {confirmation.bookingCode}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="ml-1 flex h-6 w-6 items-center justify-center rounded-full hover:bg-[#C94B6E]/10 transition-colors"
          aria-label="Copy booking code"
        >
          {copied ? (
            <Check className="h-3 w-3 text-[#3D9467]" />
          ) : (
            <Copy className="h-3 w-3 text-[#C94B6E]" />
          )}
        </button>
      </motion.div>

      {/* ── Booking Details Card ──────────────────────── */}
      <motion.div
        className="w-full rounded-2xl border border-[#E0D9D0] bg-white p-5"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#8A7F76]">
          Booking Details
        </h3>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 shrink-0 text-[#C94B6E]" />
            <span className="text-sm text-[#282320]">{shopName}</span>
          </div>

          <div className="flex items-center gap-3">
            <Scissors className="h-4 w-4 shrink-0 text-[#C94B6E]" />
            <div className="flex flex-1 items-center justify-between">
              <span className="text-sm text-[#282320]">
                {confirmation.serviceName}
              </span>
              <span className="text-sm font-bold text-[#E8931A]">
                {formattedPrice}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <User className="h-4 w-4 shrink-0 text-[#C94B6E]" />
            <span className="text-sm text-[#282320]">
              {confirmation.masterName}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 shrink-0 text-[#C94B6E]" />
            <span className="text-sm text-[#282320]">{formattedDate}</span>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 shrink-0 text-[#C94B6E]" />
            <span className="text-sm text-[#282320]">
              {formattedTime} ({confirmation.duration} min)
            </span>
          </div>
        </div>

        {/* Status badge */}
        <div className="mt-4 flex items-center justify-center">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
              confirmation.status === "confirmed"
                ? "bg-[#3D9467]/10 text-[#3D9467]"
                : "bg-[#E8931A]/10 text-[#E8931A]"
            }`}
          >
            {confirmation.status === "confirmed"
              ? "Confirmed"
              : "Pending Confirmation"}
          </span>
        </div>
      </motion.div>

      {/* ── Action Buttons ────────────────────────────── */}
      <motion.div
        className="mt-6 flex w-full flex-col gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        {/* Share button */}
        <button
          type="button"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[#E0D9D0] bg-white text-sm font-semibold text-[#282320] transition-colors hover:bg-[#FAF8F5]"
          aria-label="Share booking details"
        >
          <Share2 className="h-4 w-4" />
          <span>Share Details</span>
        </button>

        {/* Book another */}
        <button
          type="button"
          onClick={onBookAnother}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#C94B6E] text-base font-semibold text-white shadow-lg shadow-[#C94B6E]/25 transition-all hover:bg-[#B8405F] active:bg-[#A73754]"
        >
          Book Another Service
        </button>
      </motion.div>
    </div>
  );
}
