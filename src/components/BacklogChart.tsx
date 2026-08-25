"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BacklogRow } from "@/lib/data";
import { plainText } from "@/lib/data";

function TooltipContent({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: BacklogRow }[];
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="max-w-xs rounded-md border border-border-strong bg-ink p-3 text-white shadow-lg">
      <p className="font-display text-sm font-semibold">{row.requisito}</p>
      <p className="mt-1 font-mono text-xs text-white/60">{row.apareceEm}</p>
      <p className="mt-2 text-xs leading-relaxed text-white/80">
        {plainText(row.observacao)}
      </p>
    </div>
  );
}

export function BacklogChart({ rows }: { rows: BacklogRow[] }) {
  const [query, setQuery] = useState("");

  const sorted = useMemo(() => {
    const filtered = query
      ? rows.filter((r) =>
          r.requisito.toLowerCase().includes(query.toLowerCase())
        )
      : rows;
    return [...filtered].sort((a, b) => (b.count ?? 0) - (a.count ?? 0));
  }, [rows, query]);

  const chartHeight = Math.max(sorted.length * 32 + 20, 200);

  return (
    <div>
      <input
        type="text"
        placeholder="Buscar requisito…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full max-w-sm rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-ink"
      />

      <p className="mt-3 font-mono text-xs text-ink-faint">
        {sorted.length} de {rows.length} requisitos · passe o mouse pra ver o
        detalhe
      </p>

      <div style={{ width: "100%", height: chartHeight }} className="mt-4">
        <ResponsiveContainer>
          <BarChart
            data={sorted}
            layout="vertical"
            margin={{ top: 4, right: 36, bottom: 4, left: 0 }}
            barCategoryGap={6}
          >
            <CartesianGrid horizontal={false} stroke="var(--border)" />
            <XAxis type="number" hide domain={[0, "dataMax"]} />
            <YAxis
              type="category"
              dataKey="requisito"
              width={260}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--ink-muted)", fontSize: 11 }}
            />
            <Tooltip content={<TooltipContent />} cursor={{ fill: "var(--surface-sunken)" }} />
            <Bar dataKey="count" radius={[0, 3, 3, 0]} maxBarSize={16} fill="var(--signal-green)">
              <LabelList
                dataKey="count"
                position="right"
                style={{
                  fill: "var(--ink)",
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  fontWeight: 600,
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
