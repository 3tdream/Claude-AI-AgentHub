// ============================================================
// BookingWidget — Main container orchestrating all 4 booking steps
// Handles step transitions with Framer Motion slide animations
// ============================================================

"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, AlertCircle, RefreshCw } from "lucide-react";
import { useBooking } from "../../lib/hooks/use-booking";
import { StepIndicator } from "./step-indicator";
import { ServiceCard, ServiceCardSkeleton } from "./service-card";
import { MasterCard, MasterCardSkeleton } from "./master-card";
import { TimeSlotGrid } from "./time-slot-grid";
import { BookingForm } from "./booking-form";
import { ConfirmationScreen } from "./confirmation-screen";
import type { BookingConfirmation, Shop } from "../../types/booking";

// ── Slide animation variants ─────────────────────────────────

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -200 : 200,
    opacity: 0,
  }),
};

const slideTransition = {
  x: { type: "spring" as const, stiffness: 400, damping: 35 },
  opacity: { duration: 0.2 },
};

// ── Props ────────────────────────────────────────────────────

interface BookingWidgetProps {
  /** Shop slug from the URL */
  slug: string;
  /** Pre-loaded shop data (optional, from server component) */
  initialShop?: Shop;
}

export function BookingWidget({ slug, initialShop }: BookingWidgetProps) {
  const {
    state,
    nextStep,
    prevStep,
    loadShopAndServices,
    selectService,
    selectMaster,
    selectDate,
    selectTime,
    updateFormData,
    submitBooking,
    canProceed,
  } = useBooking();

  const [confirmation, setConfirmation] =
    useState<BookingConfirmation | null>(null);
  const [slideDirection, setSlideDirection] = useState(1);

  // ── Load shop data on mount ────────────────────────

  useEffect(() => {
    void loadShopAndServices(slug);
  }, [slug, loadShopAndServices]);

  // ── Navigation handlers ────────────────────────────

  const handleNext = useCallback(() => {
    if (!canProceed) return;
    setSlideDirection(1);
    nextStep();
  }, [canProceed, nextStep]);

  const handleBack = useCallback(() => {
    setSlideDirection(-1);
    prevStep();
  }, [prevStep]);

  const handleSubmit = useCallback(async () => {
    const result = await submitBooking();
    if (result) {
      setConfirmation(result);
    }
  }, [submitBooking]);

  const handleBookAnother = useCallback(() => {
    setConfirmation(null);
    setSlideDirection(-1);
    void loadShopAndServices(slug);
  }, [slug, loadShopAndServices]);

  // ── Step titles ────────────────────────────────────

  const stepTitles: Record<number, string> = {
    1: "Choose a Service",
    2: "Choose a Specialist",
    3: "Pick Date & Time",
    4: "Contact Information",
  };

  // ── Render confirmation if booking complete ────────

  if (confirmation) {
    return (
      <div className="mx-auto min-h-screen max-w-md bg-[#FAF8F5]">
        <ConfirmationScreen
          confirmation={confirmation}
          shopName={state.shop?.name ?? ""}
          onBookAnother={handleBookAnother}
        />
      </div>
    );
  }

  // ── Fatal error state ──────────────────────────────

  if (state.error && state.step === 1 && state.services.length === 0) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center bg-[#FAF8F5] px-6">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <AlertCircle className="h-8 w-8 text-[#D42020]" />
          </div>
          <h2 className="text-lg font-semibold text-[#282320]">
            Something went wrong
          </h2>
          <p className="mt-2 text-sm text-[#8A7F76]">{state.error}</p>
          <button
            type="button"
            onClick={() => void loadShopAndServices(slug)}
            className="mt-6 flex h-12 items-center gap-2 rounded-full bg-[#C94B6E] px-6 text-sm font-semibold text-white shadow-lg shadow-[#C94B6E]/25 transition-colors hover:bg-[#B8405F]"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-[#FAF8F5]">
      {/* ── Header ──────────────────────────────────── */}
      <header className="sticky top-0 z-20 bg-[#FAF8F5]/95 backdrop-blur-sm border-b border-[#E0D9D0]/50">
        {/* Shop name + back button */}
        <div className="flex items-center gap-3 px-4 pt-3 pb-1">
          {state.step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E0D9D0] bg-white transition-colors hover:bg-[#FAF8F5]"
              aria-label="Go back"
            >
              <ChevronLeft className="h-4 w-4 text-[#282320]" />
            </button>
          )}
          <div className="flex-1">
            {state.shop && (
              <h1 className="text-base font-bold text-[#282320] truncate">
                {state.shop.name}
              </h1>
            )}
          </div>
        </div>

        {/* Step indicator */}
        <StepIndicator currentStep={state.step} />
      </header>

      {/* ── Content ─────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto px-4 pb-28 pt-4">
        {/* Step Title */}
        <h2 className="mb-4 text-lg font-bold text-[#282320]">
          {stepTitles[state.step]}
        </h2>

        {/* Non-fatal error banner */}
        {state.error && state.step !== 1 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex items-start gap-2 rounded-xl border border-[#D42020]/20 bg-red-50 p-3"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#D42020]" />
            <p className="text-sm text-[#D42020]">{state.error}</p>
          </motion.div>
        )}

        <AnimatePresence mode="wait" custom={slideDirection}>
          {/* ── Step 1: Services ─────────────────────── */}
          {state.step === 1 && (
            <motion.div
              key="step-1"
              custom={slideDirection}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTransition}
            >
              {state.isLoadingServices ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <ServiceCardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {state.services.map((category) => (
                    <div key={category.id}>
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#8A7F76]">
                        {category.name}
                      </h3>
                      <div className="space-y-2">
                        {category.services.map((service) => (
                          <ServiceCard
                            key={service.id}
                            service={service}
                            isSelected={
                              state.selectedService?.id === service.id
                            }
                            onSelect={selectService}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Step 2: Masters ──────────────────────── */}
          {state.step === 2 && (
            <motion.div
              key="step-2"
              custom={slideDirection}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTransition}
            >
              {state.isLoadingMasters ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <MasterCardSkeleton key={i} />
                  ))}
                </div>
              ) : state.masters.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E0D9D0] bg-white py-12">
                  <p className="text-sm font-medium text-[#8A7F76]">
                    No specialists available
                  </p>
                  <p className="mt-1 text-xs text-[#8A7F76]">
                    Try selecting a different service
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {state.masters.map((master) => (
                    <MasterCard
                      key={master.id}
                      master={master}
                      isSelected={
                        state.selectedMaster?.id === master.id
                      }
                      onSelect={selectMaster}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Step 3: Date & Time ──────────────────── */}
          {state.step === 3 && (
            <motion.div
              key="step-3"
              custom={slideDirection}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTransition}
            >
              <TimeSlotGrid
                availability={state.availability}
                selectedDate={state.selectedDate}
                selectedTime={state.selectedTime}
                isLoading={state.isLoadingAvailability}
                onSelectDate={selectDate}
                onSelectTime={selectTime}
                shopTimezone={state.shop?.timezone ?? "UTC"}
              />
            </motion.div>
          )}

          {/* ── Step 4: Contact Form ─────────────────── */}
          {state.step === 4 &&
            state.selectedService &&
            state.selectedMaster &&
            state.selectedDate &&
            state.selectedTime && (
              <motion.div
                key="step-4"
                custom={slideDirection}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={slideTransition}
              >
                <BookingForm
                  service={state.selectedService}
                  master={state.selectedMaster}
                  date={state.selectedDate}
                  timeSlot={state.selectedTime}
                  shopName={state.shop?.name ?? ""}
                  formData={state.formData}
                  isSubmitting={state.isSubmitting}
                  error={state.error}
                  onUpdateForm={updateFormData}
                  onSubmit={handleSubmit}
                />
              </motion.div>
            )}
        </AnimatePresence>
      </main>

      {/* ── Bottom CTA (steps 1-3 only) ─────────────── */}
      {state.step < 4 && (
        <div className="fixed bottom-0 left-0 right-0 mx-auto max-w-md border-t border-[#E0D9D0]/50 bg-[#FAF8F5]/95 px-4 pb-6 pt-3 backdrop-blur-sm">
          <motion.button
            type="button"
            onClick={handleNext}
            disabled={!canProceed}
            className={`
              flex h-14 w-full items-center justify-center rounded-full
              text-base font-semibold text-white
              transition-all duration-200
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C94B6E] focus-visible:ring-offset-2
              ${
                canProceed
                  ? "bg-[#C94B6E] shadow-lg shadow-[#C94B6E]/25 hover:bg-[#B8405F] active:bg-[#A73754]"
                  : "bg-[#E0D9D0] cursor-not-allowed"
              }
            `}
            whileTap={canProceed ? { scale: 0.98 } : undefined}
          >
            {state.step === 3 ? "Continue to Booking" : "Continue"}
          </motion.button>
        </div>
      )}
    </div>
  );
}
