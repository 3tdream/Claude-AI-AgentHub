"use client";

import { useAppStore } from "@/lib/stores/app-store";
import type { Theme, ToastPosition } from "@/lib/stores/app-store";
import type { ExecutionMode } from "@/types";
import {
  Settings,
  Sun,
  Moon,
  Monitor,
  Bell,
  Volume2,
  VolumeX,
  GitBranch,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Sub-components ────────────────────────────────────────────────────────

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-5">
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-primary" />
        <h2 className="font-semibold text-base text-card-foreground">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-0.5 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

// ─── Theme Toggle ──────────────────────────────────────────────────────────

const themeOptions: { value: Theme; label: string; icon: React.ElementType }[] =
  [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

function ThemeToggle({
  value,
  onChange,
}: {
  value: Theme;
  onChange: (v: Theme) => void;
}) {
  return (
    <div className="flex rounded-lg border border-border overflow-hidden">
      {themeOptions.map(({ value: v, label, icon: Icon }) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors min-h-[44px]",
            value === v
              ? "bg-primary text-primary-foreground"
              : "bg-background text-muted-foreground hover:text-foreground hover:bg-muted",
          )}
          aria-pressed={value === v}
        >
          <Icon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Toggle Switch ─────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 min-h-[44px] min-w-[44px] justify-center",
        checked ? "bg-primary" : "bg-muted",
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-2.5" : "-translate-x-2.5",
        )}
      />
    </button>
  );
}

// ─── Select ────────────────────────────────────────────────────────────────

function Select<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="rounded-lg border border-border bg-background text-foreground text-sm px-3 py-2 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

// ─── Toast Position Picker ─────────────────────────────────────────────────

const toastPositions: { value: ToastPosition; label: string }[] = [
  { value: "top-left", label: "Top Left" },
  { value: "top-center", label: "Top Center" },
  { value: "top-right", label: "Top Right" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "bottom-center", label: "Bottom Center" },
  { value: "bottom-right", label: "Bottom Right" },
];

const positionGrid: ToastPosition[][] = [
  ["top-left", "top-center", "top-right"],
  ["bottom-left", "bottom-center", "bottom-right"],
];

function ToastPositionPicker({
  value,
  onChange,
}: {
  value: ToastPosition;
  onChange: (v: ToastPosition) => void;
}) {
  return (
    <div className="space-y-1.5">
      {positionGrid.map((row, ri) => (
        <div key={ri} className="flex gap-1.5">
          {row.map((pos) => (
            <button
              key={pos}
              onClick={() => onChange(pos)}
              title={toastPositions.find((p) => p.value === pos)?.label}
              className={cn(
                "w-10 h-7 rounded border text-[10px] font-medium transition-colors",
                value === pos
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-muted border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
              )}
              aria-pressed={value === pos}
            >
              {pos
                .split("-")
                .map((w) => w[0].toUpperCase())
                .join("")}
            </button>
          ))}
        </div>
      ))}
      <p className="text-xs text-muted-foreground">
        {toastPositions.find((p) => p.value === value)?.label}
      </p>
    </div>
  );
}

// ─── Execution Mode Options ────────────────────────────────────────────────

const executionModeOptions: { value: ExecutionMode; label: string; description: string }[] = [
  { value: "quick", label: "Quick", description: "Fast, skips optional steps" },
  { value: "medium", label: "Medium", description: "Balanced speed & quality" },
  { value: "full", label: "Full", description: "All steps, highest quality" },
];

// ─── Page ──────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { settings, updateSettings } = useAppStore();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Settings className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">
            App preferences — persisted locally
          </p>
        </div>
      </div>

      {/* Appearance */}
      <SectionCard title="Appearance" icon={Monitor}>
        <SettingRow
          label="Theme"
          description="Choose between light, dark, or follow your system preference."
        >
          <ThemeToggle
            value={settings.theme}
            onChange={(v) => updateSettings({ theme: v })}
          />
        </SettingRow>
      </SectionCard>

      {/* Notifications */}
      <SectionCard title="Notifications" icon={Bell}>
        <SettingRow
          label="Toast position"
          description="Where toast notifications appear on screen."
        >
          <ToastPositionPicker
            value={settings.toastPosition}
            onChange={(v) => updateSettings({ toastPosition: v })}
          />
        </SettingRow>

        <div className="border-t border-border" />

        <SettingRow
          label="Sound effects"
          description="Play a sound when a pipeline completes or fails."
        >
          <div className="flex items-center gap-2">
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-primary" />
            ) : (
              <VolumeX className="w-4 h-4 text-muted-foreground" />
            )}
            <Toggle
              checked={settings.soundEnabled}
              onChange={(v) => updateSettings({ soundEnabled: v })}
              label="Toggle sound effects"
            />
          </div>
        </SettingRow>
      </SectionCard>

      {/* Pipeline Defaults */}
      <SectionCard title="Pipeline Defaults" icon={GitBranch}>
        <SettingRow
          label="Default execution mode"
          description="Pre-selected mode when starting a new pipeline run."
        >
          <Select<ExecutionMode>
            value={settings.defaultExecutionMode}
            onChange={(v) => updateSettings({ defaultExecutionMode: v })}
            options={executionModeOptions.map(({ value, label }) => ({
              value,
              label,
            }))}
          />
        </SettingRow>

        <div className="border-t border-border" />

        <SettingRow
          label="Default project context"
          description="Pre-filled project context for new pipeline executions."
        >
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              value={settings.defaultProjectContext}
              onChange={(e) =>
                updateSettings({ defaultProjectContext: e.target.value })
              }
              placeholder="e.g. my-project-id"
              className="rounded-lg border border-border bg-background text-foreground text-sm px-3 py-2 min-h-[44px] w-48 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 placeholder:text-muted-foreground"
            />
          </div>
        </SettingRow>

        {/* Mode descriptions */}
        <div className="rounded-lg bg-muted/50 border border-border p-3 space-y-1.5">
          {executionModeOptions.map(({ value, label, description }) => (
            <div key={value} className="flex items-center gap-2 text-xs">
              <span
                className={cn(
                  "font-semibold w-14",
                  settings.defaultExecutionMode === value
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              >
                {label}
              </span>
              <span className="text-muted-foreground">{description}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
