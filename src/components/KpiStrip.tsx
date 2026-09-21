export type Kpi = { value: string; label: string };

export function KpiStrip({ items }: { items: Kpi[] }) {
  return (
    <div className="grid grid-cols-2 divide-y divide-border rounded-2xl border border-border sm:flex sm:divide-x sm:divide-y-0">
      {items.map((k, i) => (
        <div key={i} className="flex-1 px-5 py-4">
          <div className="font-display text-2xl font-semibold text-ink">
            {k.value}
          </div>
          <div className="mt-1 text-xs leading-snug text-ink-muted">
            {k.label}
          </div>
        </div>
      ))}
    </div>
  );
}
