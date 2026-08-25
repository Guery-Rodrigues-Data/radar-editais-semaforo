import Link from "next/link";
import type { Achado } from "@/data/achados";

const SIGNAL_COLOR: Record<string, string> = {
  red: "bg-signal-red",
  amber: "bg-signal-amber",
  green: "bg-signal-green",
};

export function AchadoChip({ achado }: { achado: Achado }) {
  return (
    <Link
      href={`/achados/${achado.id}`}
      className="group flex items-center gap-3 border-b border-border py-3 last:border-0"
    >
      <span
        aria-hidden
        className={`h-2 w-2 shrink-0 rounded-full ${
          SIGNAL_COLOR[achado.signal ?? ""] ?? "bg-ink-faint"
        }`}
      />
      <span className="flex-1 font-display text-sm font-medium text-ink group-hover:underline">
        {achado.title}
      </span>
      <span className="shrink-0 font-mono text-xs text-ink-faint">
        {achado.editalSlugs.length}×
      </span>
    </Link>
  );
}
