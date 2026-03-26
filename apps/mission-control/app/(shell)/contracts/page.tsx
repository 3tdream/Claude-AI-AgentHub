"use client";

import { ContractsTab } from "@/components/orchestration/contracts-tab";

export default function ContractsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Stage Contracts</h1>
      </div>

      <ContractsTab />
    </div>
  );
}
