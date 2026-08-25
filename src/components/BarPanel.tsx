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
import { useSelecaoEditais } from "./SelecaoEditaisContext";

type Datum = {
  label: string;
  value: number;
  color?: string;
  editalSlugs?: string[];
};

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
  const { selecao, selecionar } = useSelecaoEditais();
  const rowHeight = 38;
  const chartHeight = height ?? Math.max(data.length * rowHeight + 24, 120);
  const clickable = data.some((d) => d.editalSlugs?.length);

  return (
    <div className="panel p-6">
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-sm font-semibold text-ink">{title}</h3>
        {clickable && (
          <span className="text-[11px] text-ink-faint">clique numa barra</span>
        )}
      </div>
      <div style={{ width: "100%", height: chartHeight }} className="mt-4">
        <ResponsiveContainer>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 32, bottom: 0, left: 0 }}
            barCategoryGap={16}
            onClick={(state) => {
              const label = state?.activeLabel;
              if (typeof label !== "string") return;
              const datum = data.find((d) => d.label === label);
              if (!datum?.editalSlugs?.length) return;
              selecionar(
                selecao?.label === label
                  ? null
                  : { label, editalSlugs: datum.editalSlugs }
              );
            }}
          >
            <XAxis type="number" hide domain={[0, "dataMax"]} />
            <YAxis
              type="category"
              dataKey="label"
              width={labelWidth}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--ink-muted)", fontSize: 13 }}
            />
            <Tooltip
              cursor={{ fill: "var(--surface-sunken)", radius: 12 }}
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
              formatter={(value) => [`${value}${suffix}`, ""]}
            />
            <Bar
              dataKey="value"
              radius={10}
              maxBarSize={22}
              cursor={clickable ? "pointer" : undefined}
            >
              {data.map((d, i) => (
                <Cell key={i} fill={d.color ?? DEFAULT_COLOR} />
              ))}
              <LabelList
                dataKey="value"
                position="right"
                formatter={(value) => `${value}${suffix}`}
                style={{
                  fill: "var(--ink)",
                  fontSize: 13,
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
