// ============================================================
// TimeSlotGrid — Horizontal scrollable date chips + 3-column time grid
// Date chips: w-14 h-16 | Time slots: h-11 in 3-col grid
// ============================================================

"use client";

import { useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import type { DayAvailability, TimeSlot } from "../../types/booking";

// ── Helpers ──────────────────────────────────────────────────

/** Generate the next N days starting from today in the shop's timezone */
function generateDateRange(days: number = 14, timezone: string = "UTC"): DateChip[] {
  const result: DateChip[] = [];

  // Get "today" in the shop's timezone
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const todayStr = formatter.format(now); // "YYYY-MM-DD" format
  const today = new Date(todayStr + "T00:00:00");

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const iso = date.toISOString().split("T")[0];
    const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "short" });
    const dayOfMonth = date.getDate();
    const month = date.toLocaleDateString("en-US", { month: "short" });

    result.push({
      date: iso,
      dayOfWeek,
      dayOfMonth,
      month,
      isToday: i === 0,
    });
  }

  return result;
}

interface DateChip {
  date: string;
  dayOfWeek: string;
  dayOfMonth: number;
  month: string;
  isToday: boolean;
}

// ── Props ────────────────────────────────────────────────────

interface TimeSlotGridProps {
  availability: DayAvailability[];
  selectedDate: string | null;
  selectedTime: TimeSlot | null;
  isLoading: boolean;
  onSelectDate: (date: string) => void;
  onSelectTime: (slot: TimeSlot) => void;
  /** Shop timezone for correct date generation, e.g. "Asia/Jerusalem" */
  shopTimezone?: string;
}

export function TimeSlotGrid({
  availability,
  selectedDate,
  selectedTime,
  isLoading,
  onSelectDate,
  onSelectTime,
  shopTimezone = "UTC",
}: TimeSlotGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dateChips = useMemo(() => generateDateRange(14, shopTimezone), [shopTimezone]);

  /** Slots for the currently selected date */
  const currentDaySlots = useMemo(() => {
    if (!selectedDate) return [];
    const day = availability.find((d) => d.date === selectedDate);
    return day?.slots ?? [];
  }, [availability, selectedDate]);

  const availableSlots = currentDaySlots.filter((s) => s.isAvailable);
  const unavailableSlots = currentDaySlots.filter((s) => !s.isAvailable);

  // ── Scroll handlers ────────────────────────────────

  const scrollDates = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = direction === "left" ? -200 : 200;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <div className="space-y-5">
      {/* ── Date Picker ─────────────────────────────── */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-[#282320]">
          Select Date
        </h3>

        <div className="relative">
          {/* Scroll arrows */}
          <button
            type="button"
            onClick={() => scrollDates("left")}
            className="absolute -left-1 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-sm border border-[#E0D9D0] hover:bg-white"
            aria-label="Scroll dates left"
          >
            <ChevronLeft className="h-4 w-4 text-[#8A7F76]" />
          </button>

          <button
            type="button"
            onClick={() => scrollDates("right")}
            className="absolute -right-1 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-sm border border-[#E0D9D0] hover:bg-white"
            aria-label="Scroll dates right"
          >
            <ChevronRight className="h-4 w-4 text-[#8A7F76]" />
          </button>

          {/* Scrollable date chips */}
          <div
            ref={scrollRef}
            className="flex gap-2 overflow-x-auto scroll-smooth px-6 pb-1 scrollbar-hide"
            role="listbox"
            aria-label="Available dates"
          >
            {dateChips.map((chip) => {
              const isActive = selectedDate === chip.date;

              return (
                <button
                  key={chip.date}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => onSelectDate(chip.date)}
                  className={`
                    flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-xl
                    transition-all duration-200
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C94B6E]
                    ${
                      isActive
                        ? "bg-[#C94B6E] text-white shadow-md shadow-[#C94B6E]/25"
                        : "bg-white border border-[#E0D9D0] text-[#282320] hover:border-[#C94B6E]/40"
                    }
                  `}
                >
                  <span
                    className={`text-[10px] font-medium ${
                      isActive ? "text-white/80" : "text-[#8A7F76]"
                    }`}
                  >
                    {chip.isToday ? "Today" : chip.dayOfWeek}
                  </span>
                  <span className="text-lg font-bold leading-tight">
                    {chip.dayOfMonth}
                  </span>
                  <span
                    className={`text-[9px] font-medium ${
                      isActive ? "text-white/70" : "text-[#8A7F76]"
                    }`}
                  >
                    {chip.month}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Time Slots Grid ─────────────────────────── */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#282320]">
            Select Time
          </h3>
          {selectedDate && !isLoading && (
            <span className="text-xs text-[#8A7F76]">
              {availableSlots.length} available
            </span>
          )}
        </div>

        <AnimatePresence mode="wait">
          {/* No date selected */}
          {!selectedDate && (
            <motion.div
              key="no-date"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E0D9D0] bg-[#FAF8F5] py-10"
            >
              <Clock className="mb-2 h-8 w-8 text-[#E0D9D0]" />
              <p className="text-sm text-[#8A7F76]">
                Select a date to see available times
              </p>
            </motion.div>
          )}

          {/* Loading */}
          {selectedDate && isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-3 gap-2"
            >
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="h-11 animate-pulse rounded-xl bg-[#EDE9E3]"
                />
              ))}
            </motion.div>
          )}

          {/* No slots */}
          {selectedDate && !isLoading && currentDaySlots.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E0D9D0] bg-[#FAF8F5] py-10"
            >
              <p className="text-sm font-medium text-[#8A7F76]">
                No available times
              </p>
              <p className="mt-1 text-xs text-[#8A7F76]">
                Try selecting a different date
              </p>
            </motion.div>
          )}

          {/* Slots grid */}
          {selectedDate && !isLoading && currentDaySlots.length > 0 && (
            <motion.div
              key="slots"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {/* Available slots */}
              {availableSlots.length > 0 && (
                <div
                  className="grid grid-cols-3 gap-2"
                  role="listbox"
                  aria-label="Available time slots"
                >
                  {availableSlots.map((slot) => {
                    const isActive =
                      selectedTime?.datetime === slot.datetime;

                    return (
                      <button
                        key={slot.datetime}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        onClick={() => onSelectTime(slot)}
                        className={`
                          flex h-11 items-center justify-center rounded-xl
                          text-sm font-medium
                          transition-all duration-200
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C94B6E]
                          ${
                            isActive
                              ? "bg-[#C94B6E] text-white shadow-md shadow-[#C94B6E]/25"
                              : "border border-[#E0D9D0] bg-white text-[#282320] hover:border-[#C94B6E]/40 hover:bg-[#F5E8EC]/30"
                          }
                        `}
                      >
                        {slot.displayTime}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Unavailable slots (greyed out) */}
              {unavailableSlots.length > 0 && (
                <div className="mt-3">
                  <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-[#8A7F76]">
                    Booked
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {unavailableSlots.map((slot) => (
                      <div
                        key={slot.datetime}
                        className="flex h-11 items-center justify-center rounded-xl border border-[#EDE9E3] bg-[#EDE9E3]/50 text-sm font-medium text-[#8A7F76]/60 line-through"
                      >
                        {slot.displayTime}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
