"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

type Slice = { label: string; value: number; color: string };

export function DonutChart({
  title,
  data,
  centerValue,
  centerLabel,
}: {
  title: string;
  data: Slice[];
  centerValue: string;
  centerLabel: string;
}) {
  return (
    <div className="panel p-6">
      <h3 className="font-display text-sm font-semibold text-ink">{title}</h3>
      <div className="mt-2 flex items-center gap-6">
        <div className="relative h-[180px] w-[180px] shrink-0">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                innerRadius="70%"
                outerRadius="100%"
                paddingAngle={3}
                cornerRadius={8}
                startAngle={90}
                endAngle={-270}
                stroke="none"
              >
                {data.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--ink)",
                  border: "none",
                  borderRadius: 12,
                  fontSize: 13,
                  fontFamily: "var(--font-body)",
                  padding: "8px 12px",
                }}
                labelStyle={{ color: "white" }}
                itemStyle={{ color: "white" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-2xl font-semibold text-ink">
              {centerValue}
            </span>
            <span className="text-xs text-ink-faint">{centerLabel}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2.5">
          {data.map((d) => (
            <div key={d.label} className="flex items-center gap-2">
              <span
                aria-hidden
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              <span className="text-sm text-ink-muted">{d.label}</span>
              <span className="font-display text-sm font-semibold text-ink">
                {d.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
