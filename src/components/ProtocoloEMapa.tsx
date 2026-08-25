"use client";

import { useMemo, useState } from "react";
import { BrazilMap, type MapLayer } from "./BrazilMap";
import { getEdital } from "@/lib/data";

type Protocolo = { protocolo: string; casos: number; editalSlugs: string[] };

export function ProtocoloEMapa({
  protocolos,
  mapLayers,
  editalSlugsByUf,
}: {
  protocolos: Protocolo[];
  mapLayers: MapLayer[];
  editalSlugsByUf: Record<string, string[]>;
}) {
  const [ativo, setAtivo] = useState<string | null>(null);

  const maxCasos = Math.max(...protocolos.map((p) => p.casos));
  const selecionado = protocolos.find((p) => p.protocolo === ativo);

  const highlightUfs = useMemo(() => {
    if (!selecionado) return [];
    const ufs = selecionado.editalSlugs
      .map((slug) => getEdital(slug)?.uf)
      .filter((uf): uf is string => Boolean(uf));
    return Array.from(new Set(ufs));
  }, [selecionado]);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
      <div className="panel p-6">
        <h3 className="font-display text-sm font-semibold text-ink">
          Protocolo aberto pleno, por família
        </h3>
        <p className="mt-1 text-xs text-ink-faint">
          clique num protocolo pra destacar no mapa
        </p>
        <div className="mt-4 space-y-3">
          {protocolos.map((p) => {
            const isAtivo = p.protocolo === ativo;
            return (
              <button
                key={p.protocolo}
                onClick={() => setAtivo(isAtivo ? null : p.protocolo)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                  isAtivo ? "bg-signal-red-tint" : "hover:bg-surface-sunken"
                }`}
              >
                <span
                  className={`w-20 shrink-0 text-sm font-medium ${
                    isAtivo ? "text-signal-red" : "text-ink"
                  }`}
                >
                  {p.protocolo}
                </span>
                <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-sunken">
                  <span
                    className="block h-full rounded-full bg-signal-red"
                    style={{ width: `${(p.casos / maxCasos) * 100}%` }}
                  />
                </span>
                <span className="w-6 shrink-0 text-right font-display text-sm font-semibold text-ink">
                  {p.casos}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <BrazilMap
        layers={mapLayers}
        editalSlugsByUf={editalSlugsByUf}
        highlight={selecionado ? { label: selecionado.protocolo, ufs: highlightUfs } : null}
        onClearHighlight={() => setAtivo(null)}
      />
    </div>
  );
}
