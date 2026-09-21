"use client";

import { useSelecaoEditais } from "./SelecaoEditaisContext";

type Protocolo = { protocolo: string; casos: number; editalSlugs: string[] };

export function ProtocoloPanel({ protocolos }: { protocolos: Protocolo[] }) {
  const { selecao, selecionar } = useSelecaoEditais();
  const maxCasos = Math.max(...protocolos.map((p) => p.casos));

  return (
    <div className="panel p-6">
      <h3 className="font-display text-xl font-semibold text-ink">
        Protocolo aberto pleno, por família
      </h3>
      <p className="mt-1 text-xs text-ink-faint">
        clique num protocolo pra ver os editais lá embaixo
      </p>
      <div className="mt-4 space-y-3">
        {protocolos.map((p) => {
          const isAtivo = selecao?.label === p.protocolo;
          return (
            <button
              key={p.protocolo}
              onClick={() =>
                selecionar(
                  isAtivo ? null : { label: p.protocolo, editalSlugs: p.editalSlugs }
                )
              }
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
              <span className="w-6 shrink-0 text-right font-display text-base font-semibold text-ink">
                {p.casos}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
