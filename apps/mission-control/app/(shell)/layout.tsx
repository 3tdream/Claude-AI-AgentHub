"use client";

import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";
import { CommandPalette } from "@/components/shell/command-palette";
import { ThemeProvider } from "@/components/shell/theme-provider";
import { DynamicToaster } from "@/components/shell/dynamic-toaster";
import { useAppStore } from "@/lib/stores/app-store";
import { cn } from "@/lib/utils";

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarCollapsed } = useAppStore();

  return (
    <ThemeProvider>
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
      <DynamicToaster />
    </ThemeProvider>
  );
}
