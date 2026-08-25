"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import { geoMercator } from "d3-geo";
import brGeo from "@/data/br-states.geo.json";
import { IBGE_CODE_TO_UF } from "@/lib/br-uf-codes";
import { getEdital } from "@/lib/data";

type GeoFeature = { properties: { codarea: string }; rsmKey: string };

export type MapLayer = {
  id: string;
  label: string;
  unit?: string; // ex.: "%"
  values: Record<string, number>; // uf -> valor (já na escala certa, ex. 0-100 pra %)
  max: number;
  colorFrom: string; // cor do valor mínimo (tint claro)
  colorTo: string; // cor do valor máximo (cor cheia)
};

export function BrazilMap({
  layers,
  editalSlugsByUf,
  highlight,
  onClearHighlight,
}: {
  layers: MapLayer[];
  editalSlugsByUf: Record<string, string[]>;
  /** Quando setado, ignora as layers e só pinta os UFs da lista (uso: filtro cruzado de outro gráfico, ex. protocolo). */
  highlight?: { label: string; ufs: string[] } | null;
  onClearHighlight?: () => void;
}) {
  const [activeLayerId, setActiveLayerId] = useState(layers[0].id);
  const [selectedUf, setSelectedUf] = useState<string | null>(null);
  const [hoveredUf, setHoveredUf] = useState<string | null>(null);

  const activeLayer = layers.find((l) => l.id === activeLayerId) ?? layers[0];

  const colorFor = useMemo(() => {
    return (uf: string) => {
      if (highlight) {
        return highlight.ufs.includes(uf)
          ? "var(--signal-red)"
          : "var(--surface-sunken)";
      }
      const value = activeLayer.values[uf] ?? 0;
      if (value <= 0) return "var(--surface-sunken)";
      const t = Math.min(value / activeLayer.max, 1);
      return mixColor(activeLayer.colorFrom, activeLayer.colorTo, t);
    };
  }, [activeLayer, highlight]);

  const selectedSlugs = selectedUf ? editalSlugsByUf[selectedUf] ?? [] : [];

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
        <h3 className="font-display text-sm font-semibold text-ink">
          Onde isso acontece
        </h3>
        {highlight ? (
          <button
            onClick={onClearHighlight}
            className="flex items-center gap-1.5 rounded-full bg-signal-red-tint px-3 py-1.5 text-xs font-semibold text-signal-red"
          >
            Filtro: {highlight.label} ✕
          </button>
        ) : (
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
        )}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <div className="relative">
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
                  const hasData = Boolean(editalSlugsByUf[uf]?.length);
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={() => setHoveredUf(uf)}
                      onMouseLeave={() => setHoveredUf(null)}
                      onClick={() => hasData && setSelectedUf(uf)}
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
              {hoveredUf} · {activeLayer.values[hoveredUf] ?? 0}
              {activeLayer.unit ?? ""}
            </div>
          )}

          <div className="mt-2 flex items-center gap-2 text-[11px] text-ink-faint">
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
        </div>

        <div>
          {selectedUf ? (
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-ink-faint">
                  Editais — {selectedUf}
                </p>
                <button
                  onClick={() => setSelectedUf(null)}
                  className="text-xs text-ink-faint hover:text-ink"
                >
                  limpar
                </button>
              </div>
              <ul className="mt-2 max-h-[380px] space-y-1.5 overflow-y-auto">
                {selectedSlugs.map((slug) => {
                  const edital = getEdital(slug);
                  if (!edital) return null;
                  return (
                    <li key={slug}>
                      <Link
                        href={`/editais/${encodeURIComponent(edital.slug)}`}
                        className="block rounded-xl bg-surface-sunken px-3 py-2 text-sm font-medium text-ink hover:underline"
                      >
                        {edital.cidade}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-ink-muted">
              Clique num estado colorido pra ver os editais de lá.
            </p>
          )}
        </div>
      </div>
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
