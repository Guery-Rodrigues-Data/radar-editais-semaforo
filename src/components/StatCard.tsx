export function StatCard({
  value,
  label,
  pill,
}: {
  value: string;
  label: string;
  pill?: string;
}) {
  return (
    <div className="panel flex flex-col gap-2 p-6">
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
  );
}
