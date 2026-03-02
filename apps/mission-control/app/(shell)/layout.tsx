"use client";

import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";
import { CommandPalette } from "@/components/shell/command-palette";
import { useAppStore } from "@/lib/stores/app-store";
import { cn } from "@/lib/utils";

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarCollapsed } = useAppStore();

  return (
    <div className="min-h-screen relative z-[1]">
      <Sidebar />
      <CommandPalette />
      <div
        className={cn(
          "transition-all duration-300",
          sidebarCollapsed ? "ml-16" : "ml-60",
        )}
      >
        <Topbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
