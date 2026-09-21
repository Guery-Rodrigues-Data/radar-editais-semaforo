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
      className="panel group flex flex-col gap-3 p-6 transition-transform hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-2">
        {achado.signal && (
          <span
            aria-hidden
            className={`h-2.5 w-2.5 rounded-full ${SIGNAL_COLOR[achado.signal]}`}
          />
        )}
        <span className="text-xs font-semibold text-signal-red">
          {achado.label}
        </span>
      </div>
      <h3 className="font-display text-xl font-semibold leading-snug text-ink">
        {achado.title}
      </h3>
      <p className="text-sm leading-relaxed text-ink-muted">{achado.body}</p>
      <span className="mt-auto w-fit rounded-full bg-surface-sunken px-3 py-1 pt-1 text-xs font-medium text-ink-faint transition-colors group-hover:text-ink">
        {achado.editalSlugs.length} editais →
      </span>
    </Link>
  );
}
