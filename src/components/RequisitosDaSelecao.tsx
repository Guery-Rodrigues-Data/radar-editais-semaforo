"use client";

import { useEffect, useState } from "react";
import { tagFreq, requisitoTemaSlugs, nomeTag } from "@/lib/data";
import { useSelecaoEditais } from "./SelecaoEditaisContext";

const POR_PAGINA = 8;

export function RequisitosDaSelecao({
  fallbackSlugs,
  titulo = "Requisitos mais comuns",
  prefixes = ["modulo/", "protocolo/"],
  vazio = "Esses editais não especificam módulos nem protocolo.",
  onPick,
  picked,
}: {
  fallbackSlugs: string[];
  titulo?: string;
  prefixes?: string[];
  vazio?: string;
  /** quando passado, as barras com catálogo de requisitos viram clicáveis */
  onPick?: (temaSlug: string) => void;
  picked?: string | null;
}) {
  const { selecao } = useSelecaoEditais();
  const slugs = selecao?.editalSlugs ?? fallbackSlugs;
  const freq = tagFreq(slugs, prefixes);
  const max = freq[0]?.count ?? 1;
  const comCatalogo = requisitoTemaSlugs();

  const [pagina, setPagina] = useState(1);
  const totalPaginas = Math.max(1, Math.ceil(freq.length / POR_PAGINA));
  useEffect(() => setPagina(1), [selecao]);
  const atual = Math.min(pagina, totalPaginas);
  const inicio = (atual - 1) * POR_PAGINA;
  const visiveis = freq.slice(inicio, inicio + POR_PAGINA);

  return (
    <div className="panel p-6">
      <h3 className="font-display text-xl font-semibold text-ink">{titulo}</h3>
      <p className="mt-1 text-xs text-ink-faint">
        {selecao ? (
          <>nos {slugs.length} editais de “{selecao.label}”</>
        ) : (
          <>
            Contamos quantos editais pedem cada módulo ou protocolo, pra
            mostrar o que o mercado mais exige.
          </>
        )}
        <br />
        Clique em um item pra ver mais detalhes.
      </p>

      {freq.length === 0 ? (
        <p className="mt-4 text-sm text-ink-muted">{vazio}</p>
      ) : (
        <>
          <div className="mt-4 space-y-1">
            {visiveis.map((f) => {
              const clicavel = !!onPick && comCatalogo.has(f.tag);
              const ativo = picked === f.tag;
              const conteudo = (
                <>
                  <span
                    className={`truncate text-sm ${
                      ativo ? "font-medium text-ink" : "text-ink-muted"
                    }`}
                    title={f.tag}
                  >
                    {nomeTag(f.tag)}
                  </span>
                  <span className="h-1.5 w-[320px] justify-self-end overflow-hidden rounded-full bg-surface-sunken">
                    <span
                      className="block h-full rounded-full bg-signal-red"
                      style={{ width: `${(f.count / max) * 100}%` }}
                    />
                  </span>
                  <span className="text-right font-display text-base font-semibold text-ink">
                    {f.count}
                  </span>
                </>
              );
              return clicavel ? (
                <button
                  key={f.tag}
                  onClick={() => onPick!(f.tag)}
                  className={`grid w-full grid-cols-[minmax(0,1fr)_320px_28px] items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors ${
                    ativo ? "bg-surface-sunken" : "hover:bg-surface-sunken"
                  }`}
                  title="Ver os requisitos deste tema"
                >
                  {conteudo}
                </button>
              ) : (
                <div
                  key={f.tag}
                  className="grid grid-cols-[minmax(0,1fr)_320px_28px] items-center gap-3 px-2 py-1.5"
                >
                  {conteudo}
                </div>
              );
            })}
            {Array.from({ length: POR_PAGINA - visiveis.length }).map(
              (_, i) => (
                <div
                  key={`pad-${i}`}
                  aria-hidden
                  className="invisible grid grid-cols-[minmax(0,1fr)_320px_28px] items-center gap-3 px-2 py-1.5"
                >
                  <span className="truncate text-sm">placeholder</span>
                  <span className="h-1.5 w-[320px] justify-self-end overflow-hidden rounded-full">
                    <span className="block h-full" />
                  </span>
                  <span className="text-right font-display text-base font-semibold">
                    0
                  </span>
                </div>
              )
            )}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 text-xs text-ink-muted">
            <span>
              {inicio + 1}–{inicio + visiveis.length} de {freq.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={atual <= 1}
                className="rounded-lg border border-surface-sunken px-3 py-1.5 font-medium transition-colors hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="tabular-nums">
                {atual} / {totalPaginas}
              </span>
              <button
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                disabled={atual >= totalPaginas}
                className="rounded-lg border border-surface-sunken px-3 py-1.5 font-medium transition-colors hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-40"
              >
                Próxima
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
