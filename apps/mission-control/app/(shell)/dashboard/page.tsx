"use client";

import { AgentKPITable } from "@/components/dashboard/agent-kpi-table";
import { AgentPerformanceMatrix } from "@/components/dashboard/agent-performance-matrix";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <AgentKPITable />
      <AgentPerformanceMatrix />
    </div>
  );
}
