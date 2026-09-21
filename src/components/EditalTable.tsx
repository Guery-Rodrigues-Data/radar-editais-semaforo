"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { editais, getEdital, pdfHref, detalheFuncionalidade } from "@/lib/data";
import { useSelecaoEditais } from "./SelecaoEditaisContext";

const POR_PAGINA = 10;

export function EditalTable({
  defaultSlugs,
  defaultLabel,
  acao,
}: {
  defaultSlugs?: string[];
  defaultLabel?: string;
  /** slot no canto superior direito do card */
  acao?: React.ReactNode;
} = {}) {
  const { selecao, selecionar } = useSelecaoEditais();

  const base = selecao
    ? selecao.editalSlugs
        .map((slug) => getEdital(slug))
        .filter((e): e is NonNullable<typeof e> => Boolean(e))
    : defaultSlugs
      ? defaultSlugs
          .map((slug) => getEdital(slug))
          .filter((e): e is NonNullable<typeof e> => Boolean(e))
      : editais;

  const linhas = [...base].sort((a, b) =>
    (a.cidade ?? "").localeCompare(b.cidade ?? "", "pt-BR")
  );

  const [pagina, setPagina] = useState(1);
  const [expandido, setExpandido] = useState<string | null>(null);
  const totalPaginas = Math.max(1, Math.ceil(linhas.length / POR_PAGINA));

  // Volta pra primeira página sempre que a seleção (e portanto a lista) muda.
  useEffect(() => {
    setPagina(1);
    setExpandido(null);
  }, [selecao]);

  const paginaAtual = Math.min(pagina, totalPaginas);
  const inicio = (paginaAtual - 1) * POR_PAGINA;
  const linhasVisiveis = linhas.slice(inicio, inicio + POR_PAGINA);

  return (
    <div className="panel p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h3 className="font-display text-xl font-semibold text-ink">
            {selecao ? "Editais selecionados" : (defaultLabel ?? "Editais")}
          </h3>
          <p className="mt-0.5 text-xs text-ink-faint">
            {selecao
              ? `Filtro: ${selecao.label} · ${linhas.length} ${linhas.length === 1 ? "edital" : "editais"}`
              : `${linhas.length} editais · clique numa fatia do gráfico acima pra filtrar.`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selecao && (
            <button
              onClick={() => selecionar(null)}
              className="text-xs font-medium text-ink-faint hover:text-ink"
            >
              limpar
            </button>
          )}
          {acao}
        </div>
      </div>

      {linhas.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-xs">
            <thead>
              <tr className="border-b border-surface-sunken text-left text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
                <th className="pb-2 pr-4">Edital</th>
                <th className="pb-2 pr-4">Cidade</th>
                <th className="pb-2 pr-4">UF</th>
                <th className="pb-2 pr-4">Ano</th>
                <th className="pb-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {linhasVisiveis.map((edital) => {
                const pdf = pdfHref(edital);
                const detalhe = selecao
                  ? detalheFuncionalidade(selecao.label, edital.slug)
                  : null;
                const aberto = expandido === edital.slug;
                return (
                  <Fragment key={edital.slug}>
                    <tr className="border-b border-surface-sunken/60 last:border-0">
                      <td className="max-w-[320px] py-2.5 pr-4">
                        <div className="flex items-center gap-1.5">
                          {detalhe && (
                            <button
                              onClick={() => setExpandido(aberto ? null : edital.slug)}
                              aria-label={aberto ? "Recolher" : "Ver o que pede"}
                              className="shrink-0 text-ink-faint hover:text-ink"
                            >
                              {aberto ? "−" : "+"}
                            </button>
                          )}
                          <Link
                            href={`/editais/${encodeURIComponent(edital.slug)}`}
                            title={edital.titulo ?? edital.cidade ?? edital.slug}
                            className="block truncate font-medium text-ink hover:underline"
                          >
                            {edital.titulo ?? edital.cidade ?? edital.slug}
                          </Link>
                        </div>
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
                      <div className="flex flex-nowrap items-center gap-1.5">
                        <Link
                          href={`/editais/${encodeURIComponent(edital.slug)}`}
                          className="inline-flex items-center whitespace-nowrap rounded-md border border-border-strong px-2.5 py-1 text-[11px] font-medium text-ink-muted transition-colors hover:border-ink hover:text-ink"
                        >
                          Nota
                        </Link>
                        {pdf ? (
                          <a
                            href={pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-border-strong px-2.5 py-1 text-[11px] font-medium text-ink-muted transition-colors hover:border-signal-red hover:text-signal-red"
                          >
                            <span aria-hidden>↓</span> PDF
                          </a>
                        ) : (
                          <span className="whitespace-nowrap text-[11px] text-ink-faint">
                            —
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                  {aberto && detalhe && (
                    <tr className="border-b border-surface-sunken/60 bg-surface-sunken/40 last:border-0">
                      <td colSpan={5} className="px-2 py-3 text-xs">
                        <p className="text-ink-muted">{detalhe.resumo}</p>
                        {detalhe.citacao && (
                          <blockquote className="mt-1.5 border-l-2 border-border pl-3 italic text-ink-faint">
                            “{detalhe.citacao}”
                          </blockquote>
                        )}
                      </td>
                    </tr>
                  )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>

          {totalPaginas > 1 && (
            <div className="mt-4 flex items-center justify-between gap-3 text-xs text-ink-muted">
              <span>
                {inicio + 1}–{inicio + linhasVisiveis.length} de {linhas.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  disabled={paginaAtual <= 1}
                  className="rounded-lg border border-surface-sunken px-3 py-1.5 font-medium transition-colors hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Anterior
                </button>
                <span className="tabular-nums">
                  {paginaAtual} / {totalPaginas}
                </span>
                <button
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                  disabled={paginaAtual >= totalPaginas}
                  className="rounded-lg border border-surface-sunken px-3 py-1.5 font-medium transition-colors hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
