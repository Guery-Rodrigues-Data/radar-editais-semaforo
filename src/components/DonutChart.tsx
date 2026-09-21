"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useSelecaoEditais } from "./SelecaoEditaisContext";

type Slice = {
  label: string;
  value: number;
  color: string;
  editalSlugs?: string[];
};

export function DonutChart({
  title,
  subtitle,
  caption,
  captionPorFatia,
  data,
  centerValue,
  centerLabel,
}: {
  title: string;
  subtitle?: React.ReactNode;
  caption?: React.ReactNode;
  /** legenda que substitui `caption` quando a fatia de mesmo rótulo está selecionada */
  captionPorFatia?: Record<string, React.ReactNode>;
  data: Slice[];
  centerValue: string;
  centerLabel: string;
}) {
  const { selecao, selecionar } = useSelecaoEditais();
  const isAtivo = (label: string) => selecao?.label === label;
  const temSelecao = data.some((d) => isAtivo(d.label));
  const fatiaAtiva = data.find((d) => isAtivo(d.label));
  const captionAtual =
    (fatiaAtiva && captionPorFatia?.[fatiaAtiva.label]) ?? caption;

  const toggle = (slice: Slice) => {
    if (!slice.editalSlugs?.length) return;
    selecionar(
      isAtivo(slice.label)
        ? null
        : { label: slice.label, editalSlugs: slice.editalSlugs }
    );
  };

  return (
    <div className="panel flex h-full flex-col p-6">
      <h3 className="font-display text-xl font-semibold text-ink">{title}</h3>
      {subtitle && <p className="mt-1 text-xs text-ink-faint">{subtitle}</p>}
      <div className="mt-3 flex flex-1 flex-wrap items-center justify-center gap-6">
        <div className="relative h-[224px] w-[224px] shrink-0">
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
                  <Cell
                    key={i}
                    fill={d.color}
                    opacity={temSelecao && !isAtivo(d.label) ? 0.3 : 1}
                    cursor={d.editalSlugs?.length ? "pointer" : undefined}
                    onClick={() => toggle(d)}
                  />
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
        <div className="flex flex-col gap-1">
          {data.map((d) => {
            const ativo = isAtivo(d.label);
            const podeClicar = Boolean(d.editalSlugs?.length);
            return (
              <button
                key={d.label}
                type="button"
                disabled={!podeClicar}
                onClick={() => toggle(d)}
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors ${
                  ativo
                    ? "bg-signal-red-tint"
                    : podeClicar
                      ? "hover:bg-surface-sunken"
                      : "cursor-default"
                }`}
              >
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                <span
                  className={`text-sm ${ativo ? "font-medium text-signal-red" : "text-ink-muted"}`}
                >
                  {d.label}
                </span>
                <span className="ml-auto font-display text-base font-semibold text-ink">
                  {d.value}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {captionAtual && (
        <div className="mt-3 border-t border-border pt-3 text-center text-[11px] leading-relaxed text-ink-faint">
          {captionAtual}
        </div>
      )}
    </div>
  );
}
