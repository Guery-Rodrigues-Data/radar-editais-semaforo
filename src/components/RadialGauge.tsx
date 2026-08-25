"use client";

import { RadialBar, RadialBarChart, PolarAngleAxis } from "recharts";

export function RadialGauge({
  value,
  total,
  size = 96,
  color = "var(--signal-red)",
}: {
  value: number;
  total: number;
  size?: number;
  color?: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const data = [{ pct }];

  return (
    <div style={{ width: size, height: size }} className="relative shrink-0">
      <RadialBarChart
        width={size}
        height={size}
        data={data}
        innerRadius="72%"
        outerRadius="100%"
        startAngle={90}
        endAngle={-270}
      >
        <PolarAngleAxis
          type="number"
          domain={[0, 100]}
          angleAxisId={0}
          tick={false}
        />
        <RadialBar
          dataKey="pct"
          background={{ fill: "var(--surface-sunken)" }}
          cornerRadius={99}
          fill={color}
        />
      </RadialBarChart>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-display text-sm font-semibold text-ink">
          {pct}%
        </span>
      </div>
    </div>
  );
}
