import { RadialGauge } from "./RadialGauge";

export function StatCard({
  value,
  label,
  pill,
  gauge,
}: {
  value: string;
  label: string;
  pill?: string;
  gauge?: { value: number; total: number };
}) {
  return (
    <div className="panel flex items-center gap-4 p-6">
      {gauge && (
        <RadialGauge value={gauge.value} total={gauge.total} size={64} />
      )}
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="font-display text-3xl font-semibold text-ink">
            {value}
          </span>
          {pill && (
            <span className="rounded-full bg-signal-red-tint px-2.5 py-1 text-xs font-semibold text-signal-red">
              {pill}
            </span>
          )}
        </div>
        <span className="text-sm text-ink-muted">{label}</span>
      </div>
    </div>
  );
}
