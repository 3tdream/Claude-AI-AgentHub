// ============================================================
// Booking Page — /[slug]/book
// Server component that loads initial shop data and renders BookingWidget
// ============================================================

import { Suspense } from "react";
import { BookingWidget } from "../../../components/booking/booking-widget";

// ── Loading Skeleton ─────────────────────────────────────────

function BookingPageSkeleton() {
  return (
    <div className="mx-auto min-h-screen max-w-md bg-[#FAF8F5]">
      {/* Header skeleton */}
      <div className="border-b border-[#E0D9D0]/50 px-4 pb-3 pt-4">
        <div className="mb-3 h-5 w-40 animate-pulse rounded bg-[#EDE9E3]" />
        {/* Step indicator skeleton */}
        <div className="flex items-center justify-between py-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div className="h-7 w-7 animate-pulse rounded-full bg-[#EDE9E3]" />
                <div className="h-2 w-10 animate-pulse rounded bg-[#EDE9E3]" />
              </div>
              {i < 4 && (
                <div className="mx-1 mb-5 h-[2px] flex-1 rounded-full bg-[#EDE9E3]" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content skeleton */}
      <div className="space-y-3 px-4 pt-6">
        <div className="mb-4 h-6 w-44 animate-pulse rounded bg-[#EDE9E3]" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-20 w-full animate-pulse rounded-2xl border border-[#E0D9D0] bg-white"
          />
        ))}
      </div>
    </div>
  );
}

// ── Page Component ───────────────────────────────────────────

interface BookingPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { slug } = await params;

  return (
    <main className="min-h-screen bg-[#FAF8F5]">
      <Suspense fallback={<BookingPageSkeleton />}>
        <BookingWidget slug={slug} />
      </Suspense>
    </main>
  );
}

// ── Metadata ─────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: BookingPageProps) {
  const { slug } = await params;
  const shopName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    title: `Book an Appointment — ${shopName}`,
    description: `Book beauty services online at ${shopName}. Choose your service, specialist, and time.`,
  };
}
