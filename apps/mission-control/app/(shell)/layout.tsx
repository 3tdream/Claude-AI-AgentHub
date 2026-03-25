"use client";

import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";
import { CommandPalette } from "@/components/shell/command-palette";
import { ThemeProvider } from "@/components/shell/theme-provider";
import { DynamicToaster } from "@/components/shell/dynamic-toaster";
import { ActivitySidebar } from "@/components/shell/activity-sidebar";
import { useAppStore } from "@/lib/stores/app-store";
import { useActivityStore } from "@/lib/stores/activity-store";
import { cn } from "@/lib/utils";
import { TimestampFooter } from "@/components/shell/timestamp-footer";

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarCollapsed } = useAppStore();
  const activityVisible = useActivityStore((s) => s.visible);

  return (
    <ThemeProvider>
      <div className="min-h-screen relative z-[1]">
        <Sidebar />
        <CommandPalette />
        <ActivitySidebar />
        <div
          className={cn(
            "transition-all duration-300",
            sidebarCollapsed ? "ml-16" : "ml-60",
            activityVisible ? "mr-72" : "",
          )}
        >
          <Topbar />
          <main className="p-6">{children}</main>
          <TimestampFooter />
        </div>
      </div>
      <DynamicToaster />
    </ThemeProvider>
  );
}
