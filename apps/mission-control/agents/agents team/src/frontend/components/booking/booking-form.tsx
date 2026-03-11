// ============================================================
// BookingForm — Contact form + booking summary + submit
// Summary in secondary bg, inputs h-12, submit h-14 rounded-full
// ============================================================

"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  Sparkles,
  User,
  Phone,
  MessageSquare,
  Calendar,
  Clock,
  Scissors,
  MapPin,
  AlertCircle,
  Loader2,
} from "lucide-react";
import type {
  Service,
  Master,
  TimeSlot,
  BookingFormData,
} from "../../types/booking";

// ── Validation ───────────────────────────────────────────────

interface ValidationErrors {
  name?: string;
  phone?: string;
}

function validate(data: BookingFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.name.trim() || data.name.trim().length < 2) {
    errors.name = "Please enter your name (at least 2 characters)";
  }

  // Basic phone validation: at least 7 digits
  const digits = data.phone.replace(/\D/g, "");
  if (digits.length < 7) {
    errors.phone = "Please enter a valid phone number";
  }

  return errors;
}

// ── Props ────────────────────────────────────────────────────

interface BookingFormProps {
  service: Service;
  master: Master;
  date: string;
  timeSlot: TimeSlot;
  shopName: string;
  formData: BookingFormData;
  isSubmitting: boolean;
  error: string | null;
  onUpdateForm: (data: Partial<BookingFormData>) => void;
  onSubmit: () => void;
}

export function BookingForm({
  service,
  master,
  date,
  timeSlot,
  shopName,
  formData,
  isSubmitting,
  error,
  onUpdateForm,
  onSubmit,
}: BookingFormProps) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const validationErrors = validate(formData);

  /** Format the selected date for display */
  const formattedDate = new Date(date + "T00:00:00").toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
    },
  );

  /** Format price */
  const formattedPrice = new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: service.currency || "RUB",
    maximumFractionDigits: 0,
  }).format(service.price / 100);

  const hasErrors = Object.keys(validationErrors).length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched to show errors
    setTouched({ name: true, phone: true });

    if (!hasErrors) {
      onSubmit();
    }
  };

  return (
    <div className="space-y-5">
      {/* ── Booking Summary Card ─────────────────────── */}
      <div className="rounded-2xl bg-[#F5E8EC] p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#C94B6E]">
          Booking Summary
        </h3>

        <div className="space-y-2.5">
          {/* Salon */}
          <div className="flex items-center gap-2.5">
            <MapPin className="h-4 w-4 shrink-0 text-[#C94B6E]" />
            <span className="text-sm text-[#282320]">{shopName}</span>
          </div>

          {/* Service */}
          <div className="flex items-center gap-2.5">
            <Scissors className="h-4 w-4 shrink-0 text-[#C94B6E]" />
            <div className="flex flex-1 items-center justify-between">
              <span className="text-sm text-[#282320]">{service.name}</span>
              <span className="text-sm font-bold text-[#E8931A]">
                {formattedPrice}
              </span>
            </div>
          </div>

          {/* Master */}
          <div className="flex items-center gap-2.5">
            <User className="h-4 w-4 shrink-0 text-[#C94B6E]" />
            <span className="text-sm text-[#282320]">{master.name}</span>
          </div>

          {/* Date */}
          <div className="flex items-center gap-2.5">
            <Calendar className="h-4 w-4 shrink-0 text-[#C94B6E]" />
            <span className="text-sm text-[#282320]">{formattedDate}</span>
          </div>

          {/* Time + Duration */}
          <div className="flex items-center gap-2.5">
            <Clock className="h-4 w-4 shrink-0 text-[#C94B6E]" />
            <span className="text-sm text-[#282320]">
              {timeSlot.displayTime} ({service.duration} min)
            </span>
          </div>
        </div>
      </div>

      {/* ── Contact Form ─────────────────────────────── */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <h3 className="text-sm font-semibold text-[#282320]">
          Your Contact Info
        </h3>

        {/* Name */}
        <div>
          <label
            htmlFor="booking-name"
            className="mb-1.5 block text-xs font-medium text-[#8A7F76]"
          >
            Name *
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A7F76]" />
            <input
              id="booking-name"
              type="text"
              placeholder="Your name"
              value={formData.name}
              onChange={(e) => onUpdateForm({ name: e.target.value })}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              className={`
                h-12 w-full rounded-xl border bg-white pl-10 pr-4
                text-sm text-[#282320] placeholder-[#8A7F76]/50
                transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-[#C94B6E]/50 focus:border-[#C94B6E]
                ${
                  touched.name && validationErrors.name
                    ? "border-[#D42020]"
                    : "border-[#E0D9D0]"
                }
              `}
              autoComplete="name"
              required
            />
          </div>
          {touched.name && validationErrors.name && (
            <p className="mt-1 text-xs text-[#D42020]">
              {validationErrors.name}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label
            htmlFor="booking-phone"
            className="mb-1.5 block text-xs font-medium text-[#8A7F76]"
          >
            Phone *
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A7F76]" />
            <input
              id="booking-phone"
              type="tel"
              placeholder="+7 (999) 123-45-67"
              value={formData.phone}
              onChange={(e) => onUpdateForm({ phone: e.target.value })}
              onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
              className={`
                h-12 w-full rounded-xl border bg-white pl-10 pr-4
                text-sm text-[#282320] placeholder-[#8A7F76]/50
                transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-[#C94B6E]/50 focus:border-[#C94B6E]
                ${
                  touched.phone && validationErrors.phone
                    ? "border-[#D42020]"
                    : "border-[#E0D9D0]"
                }
              `}
              autoComplete="tel"
              required
            />
          </div>
          {touched.phone && validationErrors.phone && (
            <p className="mt-1 text-xs text-[#D42020]">
              {validationErrors.phone}
            </p>
          )}
        </div>

        {/* Comment (optional) */}
        <div>
          <label
            htmlFor="booking-comment"
            className="mb-1.5 block text-xs font-medium text-[#8A7F76]"
          >
            Comment{" "}
            <span className="text-[#8A7F76]/60">(optional)</span>
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3.5 top-3.5 h-4 w-4 text-[#8A7F76]" />
            <textarea
              id="booking-comment"
              placeholder="Any special requests..."
              value={formData.comment}
              onChange={(e) => onUpdateForm({ comment: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-[#E0D9D0] bg-white pl-10 pr-4 pt-3 text-sm text-[#282320] placeholder-[#8A7F76]/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#C94B6E]/50 focus:border-[#C94B6E] resize-none"
            />
          </div>
        </div>

        {/* API Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 rounded-xl border border-[#D42020]/20 bg-red-50 p-3"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#D42020]" />
            <p className="text-sm text-[#D42020]">{error}</p>
          </motion.div>
        )}

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isSubmitting}
          className={`
            flex h-14 w-full items-center justify-center gap-2 rounded-full
            text-base font-semibold text-white
            transition-all duration-200
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C94B6E] focus-visible:ring-offset-2
            ${
              isSubmitting
                ? "bg-[#C94B6E]/60 cursor-not-allowed"
                : "bg-[#C94B6E] hover:bg-[#B8405F] active:bg-[#A73754] shadow-lg shadow-[#C94B6E]/25"
            }
          `}
          whileTap={isSubmitting ? undefined : { scale: 0.98 }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Booking...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              <span>Confirm Booking</span>
            </>
          )}
        </motion.button>

        <p className="text-center text-[10px] text-[#8A7F76]">
          By booking you agree to the salon&apos;s cancellation policy
        </p>
      </form>
    </div>
  );
}
