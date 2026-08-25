"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
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
    <div className="max-w-xs rounded-2xl bg-ink p-4 text-white shadow-xl">
      <p className="font-display text-sm font-semibold">{row.requisito}</p>
      <p className="mt-1 text-xs text-white/60">{row.apareceEm}</p>
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
    return [...filtered]
      .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
      .map((r) => ({
        ...r,
        requisitoCurto:
          r.requisito.length > 42
            ? `${r.requisito.slice(0, 41)}…`
            : r.requisito,
      }));
  }, [rows, query]);

  const chartHeight = Math.max(sorted.length * 34 + 20, 200);

  return (
    <div>
      <input
        type="text"
        placeholder="Buscar requisito…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full max-w-sm rounded-full border border-border-strong bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-ink"
      />

      <p className="mt-3 text-xs text-ink-faint">
        {sorted.length} de {rows.length} requisitos · passe o mouse pra ver o
        detalhe
      </p>

      <div style={{ width: "100%", height: chartHeight }} className="mt-4">
        <ResponsiveContainer>
          <BarChart
            data={sorted}
            layout="vertical"
            margin={{ top: 4, right: 36, bottom: 4, left: 0 }}
            barCategoryGap={8}
          >
            <XAxis type="number" hide domain={[0, "dataMax"]} />
            <YAxis
              type="category"
              dataKey="requisitoCurto"
              width={280}
              tickLine={false}
              axisLine={false}
              interval={0}
              tick={{ fill: "var(--ink-muted)", fontSize: 12 }}
            />
            <Tooltip content={<TooltipContent />} cursor={{ fill: "var(--surface-sunken)", radius: 10 }} />
            <Bar dataKey="count" radius={8} maxBarSize={18} fill="var(--signal-green)">
              <LabelList
                dataKey="count"
                position="right"
                style={{
                  fill: "var(--ink)",
                  fontSize: 12,
                  fontFamily: "var(--font-display)",
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
