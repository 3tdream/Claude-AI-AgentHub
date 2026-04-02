"use client";

import { useState, useCallback } from "react";
import { AgentKPITable } from "@/components/dashboard/agent-kpi-table";
import { AgentPerformanceMatrix } from "@/components/dashboard/agent-performance-matrix";

export default function DashboardPage() {
  const [perfData, setPerfData] = useState<{ totalRuns: number; avgSuccessRate: number } | null>(null);

  const handlePerfDataLoaded = useCallback((data: { totalRuns: number; avgSuccessRate: number }) => {
    setPerfData(data);
  }, []);

  return (
    <div className="space-y-6">
      <AgentKPITable
        pipelineRuns={perfData?.totalRuns}
        avgSuccessRate={perfData?.avgSuccessRate}
      />
      <AgentPerformanceMatrix onDataLoaded={handlePerfDataLoaded} />
    </div>
  );
}
