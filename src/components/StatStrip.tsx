type Stat = { value: string; label: string };

export function StatStrip({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 gap-6 border-y border-border py-8 sm:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label}>
          <div className="font-mono text-3xl font-semibold text-ink sm:text-4xl">
            {stat.value}
          </div>
          <div className="mt-1 text-sm text-ink-muted">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
