"use client";

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Datum = { label: string; value: number; color?: string };

const DEFAULT_COLOR = "#e0342b"; // signal-red — cor de acento padrão do gráfico

export function BarPanel({
  title,
  data,
  height,
  suffix = "",
  labelWidth = 110,
}: {
  title: string;
  data: Datum[];
  height?: number;
  suffix?: string;
  labelWidth?: number;
}) {
  const rowHeight = 34;
  const chartHeight = height ?? Math.max(data.length * rowHeight + 24, 120);

  return (
    <div className="rounded-md border border-border bg-surface p-5">
      <h3 className="font-display text-sm font-semibold text-ink">{title}</h3>
      <div style={{ width: "100%", height: chartHeight }} className="mt-3">
        <ResponsiveContainer>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 28, bottom: 0, left: 0 }}
            barCategoryGap={10}
          >
            <XAxis type="number" hide domain={[0, "dataMax"]} />
            <YAxis
              type="category"
              dataKey="label"
              width={labelWidth}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--ink-muted)", fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: "var(--surface-sunken)" }}
              contentStyle={{
                background: "var(--ink)",
                border: "none",
                borderRadius: 6,
                fontSize: 12,
                fontFamily: "var(--font-mono)",
              }}
              labelStyle={{ color: "white" }}
              itemStyle={{ color: "white" }}
              formatter={(value) => [`${value}${suffix}`, ""]}
            />
            <Bar dataKey="value" radius={[0, 3, 3, 0]} maxBarSize={18}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.color ?? DEFAULT_COLOR} />
              ))}
              <LabelList
                dataKey="value"
                position="right"
                formatter={(value) => `${value}${suffix}`}
                style={{
                  fill: "var(--ink)",
                  fontSize: 12,
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
