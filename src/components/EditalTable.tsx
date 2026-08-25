"use client";

import Link from "next/link";
import { getEdital } from "@/lib/data";
import { useSelecaoEditais } from "./SelecaoEditaisContext";

function maturidadeDe(tags: string[]): { label: string; color: string } {
  if (tags.includes("central-maturidade/madura")) {
    return { label: "Madura", color: "var(--signal-green)" };
  }
  if (tags.includes("central-maturidade/nova")) {
    return { label: "Nova", color: "var(--signal-amber)" };
  }
  return { label: "—", color: "var(--ink-faint)" };
}

export function EditalTable() {
  const { selecao, selecionar } = useSelecaoEditais();

  const linhas = (selecao?.editalSlugs ?? [])
    .map((slug) => getEdital(slug))
    .filter((e): e is NonNullable<typeof e> => Boolean(e))
    .sort((a, b) => (a.cidade ?? "").localeCompare(b.cidade ?? "", "pt-BR"));

  return (
    <div className="panel p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h3 className="font-display text-sm font-semibold text-ink">
            Editais selecionados
          </h3>
          <p className="mt-0.5 text-xs text-ink-faint">
            {selecao
              ? `Filtro: ${selecao.label} · ${linhas.length} ${linhas.length === 1 ? "edital" : "editais"}`
              : "Clique num estado no mapa, num protocolo ou numa barra dos gráficos acima pra listar aqui."}
          </p>
        </div>
        {selecao && (
          <button
            onClick={() => selecionar(null)}
            className="text-xs font-medium text-ink-faint hover:text-ink"
          >
            limpar
          </button>
        )}
      </div>

      {selecao && linhas.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-surface-sunken text-left text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
                <th className="pb-2 pr-4">Edital</th>
                <th className="pb-2 pr-4">Cidade</th>
                <th className="pb-2 pr-4">UF</th>
                <th className="pb-2 pr-4">Ano</th>
                <th className="pb-2">Maturidade</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((edital) => {
                const maturidade = maturidadeDe(edital.tags);
                return (
                  <tr
                    key={edital.slug}
                    className="border-b border-surface-sunken/60 last:border-0"
                  >
                    <td className="max-w-[320px] py-2.5 pr-4">
                      <Link
                        href={`/editais/${encodeURIComponent(edital.slug)}`}
                        title={edital.titulo ?? edital.cidade ?? edital.slug}
                        className="block truncate font-medium text-ink hover:underline"
                      >
                        {edital.titulo ?? edital.cidade ?? edital.slug}
                      </Link>
                    </td>
                    <td className="py-2.5 pr-4 text-ink-muted">
                      {edital.cidade ?? "—"}
                    </td>
                    <td className="py-2.5 pr-4 text-ink-muted">
                      {edital.uf ?? "—"}
                    </td>
                    <td className="py-2.5 pr-4 text-ink-muted">
                      {edital.ano ?? "—"}
                    </td>
                    <td className="py-2.5">
                      <span className="inline-flex items-center gap-1.5 text-ink-muted">
                        <span
                          aria-hidden
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: maturidade.color }}
                        />
                        {maturidade.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
