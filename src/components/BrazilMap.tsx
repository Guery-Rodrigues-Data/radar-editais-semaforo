"use client";

import { useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { geoMercator } from "d3-geo";
import brGeo from "@/data/br-states.geo.json";
import { IBGE_CODE_TO_UF } from "@/lib/br-uf-codes";
import { useSelecaoEditais } from "./SelecaoEditaisContext";

type GeoFeature = { properties: { codarea: string }; rsmKey: string };

export type MapCategory = { id: string; label: string; color: string };

export type MapLayer = {
  id: string;
  label: string;
  unit?: string; // ex.: "%"
  // Camada de gradiente (padrão):
  values?: Record<string, number>; // uf -> valor
  max?: number;
  colorFrom?: string;
  colorTo?: string;
  // Camada categórica: cada estado recebe a cor da sua categoria.
  kind?: "gradient" | "categorical";
  categoryOf?: Record<string, string>; // uf -> id da categoria
  categories?: MapCategory[];
};

export function BrazilMap({
  layers,
  editalSlugsByUf,
}: {
  layers: MapLayer[];
  editalSlugsByUf: Record<string, string[]>;
}) {
  const [activeLayerId, setActiveLayerId] = useState(layers[0].id);
  const [hoveredUf, setHoveredUf] = useState<string | null>(null);
  const { selecao, selecionar } = useSelecaoEditais();

  const activeLayer = layers.find((l) => l.id === activeLayerId) ?? layers[0];

  // Quando qualquer gráfico da página tem uma seleção ativa (não só o mapa),
  // destaca os estados que têm pelo menos um edital dessa seleção.
  const highlightUfs = useMemo(() => {
    if (!selecao) return null;
    return Object.entries(editalSlugsByUf)
      .filter(([, slugs]) => slugs.some((s) => selecao.editalSlugs.includes(s)))
      .map(([uf]) => uf);
  }, [selecao, editalSlugsByUf]);

  const colorFor = useMemo(() => {
    return (uf: string) => {
      if (highlightUfs) {
        return highlightUfs.includes(uf)
          ? "var(--signal-red)"
          : "var(--surface-sunken)";
      }
      if (activeLayer.kind === "categorical") {
        const cat = activeLayer.categoryOf?.[uf];
        const found = activeLayer.categories?.find((c) => c.id === cat);
        return found?.color ?? "var(--surface-sunken)";
      }
      const value = activeLayer.values?.[uf] ?? 0;
      if (value <= 0) return "var(--surface-sunken)";
      const t = Math.min(value / (activeLayer.max ?? 1), 1);
      return mixColor(
        activeLayer.colorFrom ?? "#eee",
        activeLayer.colorTo ?? "#333",
        t
      );
    };
  }, [activeLayer, highlightUfs]);

  const projection = useMemo(
    () =>
      geoMercator().fitSize(
        [480, 480],
        brGeo as unknown as Parameters<
          ReturnType<typeof geoMercator>["fitSize"]
        >[1]
      ),
    []
  );

  return (
    <div className="panel p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-xl font-semibold text-ink">
          Onde isso acontece
        </h3>
        {selecao ? (
          <button
            onClick={() => selecionar(null)}
            className="flex items-center gap-1.5 rounded-full bg-signal-red-tint px-3 py-1.5 text-xs font-semibold text-signal-red"
          >
            Filtro: {selecao.label} ✕
          </button>
        ) : layers.length > 1 ? (
          <div className="flex gap-1 rounded-full bg-surface-sunken p-1">
            {layers.map((layer) => (
              <button
                key={layer.id}
                onClick={() => setActiveLayerId(layer.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  layer.id === activeLayerId
                    ? "bg-ink text-white"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                {layer.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="relative mx-auto mt-4 max-w-[620px]">
        <ComposableMap
          // @types/react-simple-maps tipa `projection` como uma factory
          // (w,h)=>GeoProjection, mas o runtime da lib aceita uma instância
          // de projeção d3 já pronta (é assim que o próprio código-fonte
          // trata: `typeof projection === "function" ? projection : ...`).
          // fitSize precisa da instância já calculada, não de uma factory.
          projection={projection as unknown as string}
          width={480}
          height={480}
          style={{ width: "100%", height: "auto" }}
        >
          <Geographies geography={brGeo}>
            {({ geographies }: { geographies: GeoFeature[] }) =>
              geographies.map((geo) => {
                const uf = IBGE_CODE_TO_UF[geo.properties.codarea];
                const slugs = editalSlugsByUf[uf] ?? [];
                const hasData = slugs.length > 0;
                const isSelected = selecao?.label === uf;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => setHoveredUf(uf)}
                    onMouseLeave={() => setHoveredUf(null)}
                    onClick={() =>
                      hasData &&
                      selecionar(isSelected ? null : { label: uf, editalSlugs: slugs })
                    }
                    style={{
                      default: {
                        fill: colorFor(uf),
                        stroke: "var(--bg)",
                        strokeWidth: 1,
                        outline: "none",
                        cursor: hasData ? "pointer" : "default",
                      },
                      hover: {
                        fill: hasData ? "var(--signal-red-dark)" : colorFor(uf),
                        stroke: "var(--bg)",
                        strokeWidth: 1,
                        outline: "none",
                        cursor: hasData ? "pointer" : "default",
                      },
                      pressed: {
                        fill: "var(--signal-red-dark)",
                        stroke: "var(--bg)",
                        strokeWidth: 1,
                        outline: "none",
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>

        {hoveredUf && (
          <div className="pointer-events-none absolute left-2 top-2 rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-white shadow-lg">
            {activeLayer.kind === "categorical"
              ? `${hoveredUf} · ${
                  activeLayer.categories?.find(
                    (c) => c.id === activeLayer.categoryOf?.[hoveredUf]
                  )?.label ?? "—"
                }`
              : `${hoveredUf} · ${activeLayer.values?.[hoveredUf] ?? 0}${
                  activeLayer.unit ?? ""
                }`}
          </div>
        )}
      </div>

      {activeLayer.kind === "categorical" ? (
        <div className="mx-auto mt-2 flex max-w-[620px] flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-ink-faint">
          {activeLayer.categories?.map((c) => (
            <span key={c.id} className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: c.color }}
              />
              {c.label}
            </span>
          ))}
        </div>
      ) : (
        <div className="mx-auto mt-2 flex max-w-[620px] items-center gap-2 text-[11px] text-ink-faint">
          <span>0{activeLayer.unit ?? ""}</span>
          <span
            className="h-2 flex-1 rounded-full"
            style={{
              background: `linear-gradient(to right, ${activeLayer.colorFrom}, ${activeLayer.colorTo})`,
            }}
          />
          <span>
            {activeLayer.max}
            {activeLayer.unit ?? ""}
          </span>
        </div>
      )}
    </div>
  );
}

function mixColor(from: string, to: string, t: number): string {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}
