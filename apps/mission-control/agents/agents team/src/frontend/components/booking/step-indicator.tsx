// ============================================================
// StepIndicator — 4-step progress dots with connectors
// Active = primary (rose), completed = success + check, upcoming = muted
// ============================================================

"use client";

import { Check } from "lucide-react";
import { motion } from "motion/react";
import type { BookingStep } from "../../types/booking";

interface StepIndicatorProps {
  currentStep: BookingStep;
  /** Labels shown under each dot */
  labels?: [string, string, string, string];
}

const defaultLabels: [string, string, string, string] = [
  "Service",
  "Specialist",
  "Date & Time",
  "Contact",
];

export function StepIndicator({
  currentStep,
  labels = defaultLabels,
}: StepIndicatorProps) {
  const steps = [1, 2, 3, 4] as const;

  return (
    <nav aria-label="Booking progress" className="w-full px-4 py-3">
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step;
          const isActive = currentStep === step;
          const isUpcoming = currentStep < step;

          return (
            <li
              key={step}
              className="flex flex-1 items-center"
              aria-current={isActive ? "step" : undefined}
            >
              {/* Dot */}
              <div className="flex flex-col items-center gap-1.5">
                <motion.div
                  className={`
                    relative flex items-center justify-center rounded-full
                    transition-colors duration-200
                    ${
                      isCompleted
                        ? "h-7 w-7 bg-[#3D9467]"
                        : isActive
                          ? "h-7 w-7 bg-[#C94B6E]"
                          : "h-6 w-6 bg-[#EDE9E3]"
                    }
                  `}
                  initial={false}
                  animate={{
                    scale: isActive ? 1 : 0.9,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {isCompleted ? (
                    <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                  ) : (
                    <span
                      className={`text-[11px] font-semibold ${
                        isActive ? "text-white" : "text-[#8A7F76]"
                      }`}
                    >
                      {step}
                    </span>
                  )}

                  {/* Active ring pulse */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-[#C94B6E]"
                      initial={{ opacity: 0, scale: 1 }}
                      animate={{ opacity: [0.6, 0], scale: [1, 1.5] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                    />
                  )}
                </motion.div>

                {/* Label */}
                <span
                  className={`text-[10px] font-medium leading-tight text-center max-w-[60px] ${
                    isActive
                      ? "text-[#C94B6E]"
                      : isCompleted
                        ? "text-[#3D9467]"
                        : "text-[#8A7F76]"
                  }`}
                >
                  {labels[index]}
                </span>
              </div>

              {/* Connector line (not after last step) */}
              {index < steps.length - 1 && (
                <div className="relative mx-1 mb-5 h-[2px] flex-1">
                  {/* Background track */}
                  <div className="absolute inset-0 rounded-full bg-[#EDE9E3]" />
                  {/* Filled portion */}
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full bg-[#3D9467]"
                    initial={false}
                    animate={{
                      width: isCompleted ? "100%" : isActive ? "0%" : "0%",
                    }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
