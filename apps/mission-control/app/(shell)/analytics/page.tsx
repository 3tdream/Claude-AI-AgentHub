"use client";

import { AnalyticsTab } from "@/components/orchestration/analytics-tab";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pipeline performance, quality trends, and system health
        </p>
      </div>

      <AnalyticsTab />
    </div>
  );
}
