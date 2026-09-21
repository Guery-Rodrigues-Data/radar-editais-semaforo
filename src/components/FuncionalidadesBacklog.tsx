"use client";

import { useState } from "react";
import {
  funcionalidades,
  baseStats,
  type Funcionalidade,
  type NivelFuncionalidade,
} from "@/lib/data";
import { useSelecaoEditais } from "./SelecaoEditaisContext";

const NIVEL_INFO: Record<
  NivelFuncionalidade,
  { label: string; desc: string; color: string }
> = {
  essencial: {
    label: "Essencial",
    desc: "a maioria dos editais pede",
    color: "var(--signal-green)",
  },
  frequente: {
    label: "Frequente",
    desc: "aparece com regularidade, mas não é maioria",
    color: "var(--signal-amber)",
  },
  raro: {
    label: "Raro",
    desc: "poucos casos, sinal fraco ou emergente",
    color: "var(--ink-faint)",
  },
};

const ORDEM: NivelFuncionalidade[] = ["essencial", "frequente", "raro"];
const POR_PAGINA = 10;

function Coluna({
  nivel,
  itens,
  total,
}: {
  nivel: NivelFuncionalidade;
  itens: Funcionalidade[];
  total: number;
}) {
  const { selecao, selecionar } = useSelecaoEditais();
  const [expandido, setExpandido] = useState(false);
  const info = NIVEL_INFO[nivel];
  const visiveis = expandido ? itens : itens.slice(0, POR_PAGINA);

  return (
    <div className="panel overflow-hidden">
      <div className="px-6 py-4" style={{ backgroundColor: info.color }}>
        <h3 className="font-display text-xl font-semibold text-white">
          {info.label}
          <span className="ml-2 text-sm font-normal text-white/80">
            {itens.length}
          </span>
        </h3>
        <p className="mt-1 text-xs text-white/80">{info.desc}</p>
      </div>

      <div className="space-y-1 p-6">
        {visiveis.map((f) => {
          const ativo = selecao?.label === f.funcionalidade;
          const pct = Math.round((f.total / total) * 100);
          return (
            <button
              key={f.funcionalidade}
              onClick={() =>
                selecionar(
                  ativo ? null : { label: f.funcionalidade, editalSlugs: f.editalSlugs }
                )
              }
              disabled={f.editalSlugs.length === 0}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                ativo ? "bg-signal-red-tint" : "hover:bg-surface-sunken"
              }`}
            >
              <span className={`flex-1 ${ativo ? "font-medium text-ink" : "text-ink"}`}>
                {f.funcionalidade}
              </span>
              <span className="shrink-0 text-right text-[11px] text-ink-muted">
                {pct}%
              </span>
            </button>
          );
        })}

        {itens.length > POR_PAGINA && (
          <button
            onClick={() => setExpandido((v) => !v)}
            className="mt-1 w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-ink-faint hover:bg-surface-sunken hover:text-ink"
          >
            {expandido
              ? "Mostrar menos"
              : `Mostrar mais (${itens.length - POR_PAGINA} restantes)`}
          </button>
        )}
      </div>
    </div>
  );
}

export function FuncionalidadesBacklog() {
  const total = baseStats().pedeCentral;

  const grupos: Record<NivelFuncionalidade, Funcionalidade[]> = {
    essencial: [],
    frequente: [],
    raro: [],
  };
  for (const f of funcionalidades) grupos[f.nivel].push(f);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {ORDEM.map((nivel) => {
        const itens = grupos[nivel];
        if (itens.length === 0) return null;
        return <Coluna key={nivel} nivel={nivel} itens={itens} total={total} />;
      })}
    </div>
  );
}
