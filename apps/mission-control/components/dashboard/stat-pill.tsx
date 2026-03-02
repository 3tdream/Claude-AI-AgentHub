export function StatPill({
  value,
  label,
  color,
}: {
  value: string | number;
  label: string;
  color?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl px-5 py-3 text-center">
      <div
        className="text-2xl font-extrabold"
        style={
          color
            ? { color }
            : {
                background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }
        }
      >
        {value}
      </div>
      <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider mt-0.5">
        {label}
      </div>
    </div>
  );
}
