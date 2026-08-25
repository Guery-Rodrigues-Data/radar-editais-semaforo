import Link from "next/link";
import type { Achado } from "@/data/achados";

const SIGNAL_COLOR: Record<string, string> = {
  red: "bg-signal-red",
  amber: "bg-signal-amber",
  green: "bg-signal-green",
};

export function AchadoCard({ achado }: { achado: Achado }) {
  return (
    <Link
      href={`/achados/${achado.id}`}
      className="group flex flex-col gap-3 rounded-lg border border-border bg-surface p-6 transition-colors hover:border-ink-faint"
    >
      <div className="flex items-center gap-2">
        {achado.signal && (
          <span
            aria-hidden
            className={`h-2 w-2 rounded-full ${SIGNAL_COLOR[achado.signal]}`}
          />
        )}
        <span className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
          {achado.label}
        </span>
      </div>
      <h3 className="font-display text-lg font-semibold leading-snug text-ink">
        {achado.title}
      </h3>
      <p className="text-sm leading-relaxed text-ink-muted">{achado.body}</p>
      <span className="mt-auto pt-2 font-mono text-xs text-ink-faint transition-colors group-hover:text-ink">
        {achado.editalSlugs.length} editais →
      </span>
    </Link>
  );
}
