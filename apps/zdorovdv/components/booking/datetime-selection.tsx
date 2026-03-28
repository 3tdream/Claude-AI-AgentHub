"use client"

import { Button } from "@/components/ui/button"
import { useBookingStore } from "@/lib/stores/booking-store"
import { useLanguageStore } from "@/lib/use-language-store"
import { translations } from "@/lib/translations"
import { generateDateOptions, generateTimeSlots } from "@/data/time-slots"
import { cn } from "@/lib/utils"

export function DatetimeSelection() {
  const { selectedDate, selectedTime, setDate, setTime, nextStep, prevStep } = useBookingStore()
  const { language } = useLanguageStore()
  const t = translations[language]
  const dates = generateDateOptions()
  const times = generateTimeSlots()

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">{t.booking.selectDate}</h3>
      <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
        {dates.map((d) => (
          <button
            key={d.date}
            onClick={() => setDate(d.date)}
            className={cn(
              "shrink-0 flex flex-col items-center px-4 py-3 rounded-lg border transition-colors min-w-[70px]",
              selectedDate === d.date
                ? "border-primary bg-primary/5 text-primary"
                : "border-border hover:border-primary/50"
            )}
          >
            <span className="text-xs text-muted-foreground">{d.dayOfWeek}</span>
            <span className="text-sm font-semibold mt-0.5">{d.label}</span>
          </button>
        ))}
      </div>

      {selectedDate && (
        <>
          <h3 className="text-lg font-semibold mb-4 mt-8">{t.booking.selectTime}</h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {times.map((time) => (
              <button
                key={time}
                onClick={() => setTime(time)}
                className={cn(
                  "px-3 py-2 rounded-lg border text-sm font-medium transition-colors",
                  selectedTime === time
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary/50"
                )}
              >
                {time}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={prevStep}>
          {t.booking.back}
        </Button>
        <Button onClick={nextStep} disabled={!selectedDate || !selectedTime}>
          {t.booking.next}
        </Button>
      </div>
    </div>
  )
}
