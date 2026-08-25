"use client";

import { useMemo, useState } from "react";
import type { BacklogRow } from "@/lib/data";
import { plainText } from "@/lib/data";

const DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

function normalize(text: string): string {
  return text.normalize("NFD").replace(DIACRITICS, "").toLowerCase();
}

type SortKey = "count" | "requisito";

export function BacklogTable({ rows }: { rows: BacklogRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("count");
  const [query, setQuery] = useState("");

  const sorted = useMemo(() => {
    const filtered = query
      ? rows.filter((r) => normalize(r.requisito).includes(normalize(query)))
      : rows;
    return [...filtered].sort((a, b) => {
      if (sortKey === "count") return (b.count ?? 0) - (a.count ?? 0);
      return a.requisito.localeCompare(b.requisito, "pt-BR");
    });
  }, [rows, sortKey, query]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Buscar requisito…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-w-[220px] flex-1 rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-ink"
        />
        <div className="flex gap-1 rounded-md border border-border-strong bg-surface p-1">
          <button
            onClick={() => setSortKey("count")}
            className={`rounded px-3 py-1 font-mono text-xs ${
              sortKey === "count"
                ? "bg-ink text-white"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            Frequência
          </button>
          <button
            onClick={() => setSortKey("requisito")}
            className={`rounded px-3 py-1 font-mono text-xs ${
              sortKey === "requisito"
                ? "bg-ink text-white"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            A–Z
          </button>
        </div>
      </div>

      <p className="mt-4 font-mono text-xs text-ink-faint">
        {sorted.length} de {rows.length} requisitos
      </p>

      <ul className="mt-4 space-y-3">
        {sorted.map((row) => {
          const pct = row.count && row.total ? (row.count / row.total) * 100 : 0;
          return (
            <li
              key={row.requisito}
              className="rounded-lg border border-border bg-surface p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-base font-semibold text-ink">
                  {row.requisito}
                </h3>
                <span className="font-mono text-sm text-ink-muted">
                  {row.apareceEm.split(" ")[0]}
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken">
                <div
                  className="h-full rounded-full bg-signal-green"
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                {plainText(row.observacao)}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
