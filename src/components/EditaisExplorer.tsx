"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { pdfHref, requisitos, type Edital } from "@/lib/data";

const POR_PAGINA = 15;

const DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

function normalize(text: string): string {
  return text.normalize("NFD").replace(DIACRITICS, "").toLowerCase();
}

const MATURIDADE_LABEL: Record<string, string> = {
  "central-maturidade/madura": "Madura",
  "central-maturidade/nova": "Nova",
};

const CONTEUDO_LABEL: Record<string, string> = {
  central: "Central",
  equipamento: "Equipamento",
  "outro-dominio": "Outro domínio",
};

// Passos do pipeline (sem depender de revisão manual — ver
// Análise/00 - Definicao de Pronto.md, a referência canônica desses critérios):
// 1. Extraído (texto do PDF disponível) — implícito, todo edital aqui já passou por isso.
// 2. Categorizado — `conteudo`/`software` preenchidos, nenhum "indefinido".
// 3. Aprofundado — só se `conteudo: central`: TODA tag `modulo/*`/`protocolo/*` do
//    frontmatter tem pelo menos 1 linha correspondente no Catálogo de Requisitos
//    (não basta ter uma linha qualquer — cada tag precisa da sua).
// 4. Sincronizado no site — implícito, é o que está sendo renderizado aqui.
function isCategorizado(edital: Edital): boolean | null {
  if (edital.semNota) return null; // PDF sem nota própria (2ª via/anexo/complemento) — não se aplica
  return (
    !!edital.conteudo &&
    edital.conteudo !== "indefinido" &&
    !!edital.software &&
    edital.software !== "indefinido"
  );
}

function anoDoEdital(edital: Edital): number | null {
  if (edital.ano) return edital.ano;
  const m = edital.dataEdital?.match(/^\d{4}/);
  return m ? Number(m[0]) : null;
}

function temasDoEdital(edital: Edital): string[] {
  return edital.tags.filter(
    (t) => t.startsWith("modulo/") || t.startsWith("protocolo/")
  );
}

function isAprofundado(edital: Edital): boolean | null {
  if (edital.conteudo !== "central") return null; // não se aplica
  const temas = temasDoEdital(edital);
  if (temas.length === 0) {
    // Sem tag de tema não é sempre "ainda não lido a fundo" — pode ser uma nota completa
    // que já concluiu que não há requisito extraível (central como item de planilha, sem
    // spec técnica, ex.: AN_BA_Jequie). `integracao` só existe quando a nota tem a seção
    // "Integração / Software Central" preenchida — ou seja, já passou pela leitura de Fase 2.
    return !!edital.integracao;
  }
  return temas.every((t) =>
    requisitos.some(
      (r) => r.editalSlug === edital.slug && (r.temaSlug === t || r.subSlug === t)
    )
  );
}

type SortKey =
  | "id"
  | "arquivo"
  | "cidade"
  | "uf"
  | "ano"
  | "conteudo"
  | "resumo"
  | "maturidade"
  | "categorizado"
  | "aprofundado";

function sortValue(edital: Edital, key: SortKey): string | number | null {
  switch (key) {
    case "id":
      return edital.numero;
    case "arquivo":
      return normalize(edital.pdfName ?? edital.slug);
    case "cidade":
      return edital.cidade ? normalize(edital.cidade) : null;
    case "uf":
      return edital.uf;
    case "ano":
      return anoDoEdital(edital);
    case "conteudo":
      return edital.conteudo ? normalize(CONTEUDO_LABEL[edital.conteudo] ?? edital.conteudo) : null;
    case "resumo":
      return edital.resumo ? normalize(edital.resumo) : null;
    case "maturidade": {
      const t = edital.tags.find((tag) => tag.startsWith("central-maturidade/"));
      return t ? normalize(MATURIDADE_LABEL[t] ?? t) : null;
    }
    case "categorizado": {
      const v = isCategorizado(edital);
      return v === null ? null : v ? 1 : 0;
    }
    case "aprofundado": {
      const v = isAprofundado(edital);
      return v === null ? null : v ? 1 : 0;
    }
  }
}

// Nulls sempre por último, em qualquer direção — não faz sentido "—"/N/A competir
// com valor real pela primeira posição só porque inverteu a ordem.
function compareSortValues(a: string | number | null, b: string | number | null, dir: 1 | -1): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  if (typeof a === "number" && typeof b === "number") return (a - b) * dir;
  return String(a).localeCompare(String(b), "pt-BR") * dir;
}

function SortIcon({ direction }: { direction: "asc" | "desc" | null }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={`h-3 w-3 shrink-0 transition-colors ${direction ? "text-ink" : "text-ink-faint"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direction === "desc" ? <path d="M5 7l5 5 5-5" /> : direction === "asc" ? <path d="M5 13l5-5 5 5" /> : <path d="M5 8l5-5 5 5M5 12l5 5 5-5" />}
    </svg>
  );
}

type Status = "pendente" | "concluido" | "fora-do-escopo";

// Status geral do edital nessa auditoria (ver Análise/00 - Definicao de Pronto.md):
// - "fora-do-escopo": não é edital de central (equipamento/outro-domínio) ou é PDF sem
//   nota própria (2ª via/anexo) — os passos 3/4 simplesmente não existem pra esses, então
//   eles nunca contam como "pendente" nem "concluído" no sentido de central.
// - "concluido": só quando TODOS os passos que se aplicam (2 e 3) estão ok.
// - "pendente": qualquer coisa que ainda precisa de trabalho.
function statusGeral(edital: Edital): Status {
  if (edital.semNota) return "fora-do-escopo";
  if (edital.conteudo === "equipamento" || edital.conteudo === "outro-dominio") {
    return "fora-do-escopo";
  }
  if (!isCategorizado(edital)) return "pendente";
  return isAprofundado(edital) ? "concluido" : "pendente";
}

export function EditaisExplorer({ editais }: { editais: Edital[] }) {
  const [aba, setAba] = useState<Status>("pendente");
  const [query, setQuery] = useState("");
  const [uf, setUf] = useState("todos");
  const [maturidade, setMaturidade] = useState("todos");
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const contagem = useMemo(() => {
    const c = { pendente: 0, concluido: 0, "fora-do-escopo": 0 } as Record<
      Status,
      number
    >;
    editais.forEach((e) => c[statusGeral(e)]++);
    return c;
  }, [editais]);

  const ufs = useMemo(
    () =>
      Array.from(new Set(editais.map((e) => e.uf).filter(Boolean))).sort() as string[],
    [editais]
  );

  const filtered = useMemo(() => {
    return editais.filter((e) => {
      if (statusGeral(e) !== aba) return false;
      if (uf !== "todos" && e.uf !== uf) return false;
      if (
        maturidade !== "todos" &&
        !e.tags.includes(`central-maturidade/${maturidade}`)
      )
        return false;
      if (query) {
        const haystack = normalize(
          `${e.cidade ?? ""} ${e.titulo ?? ""} ${e.resumo ?? ""} ${e.tags.join(" ")}`
        );
        if (!haystack.includes(normalize(query))) return false;
      }
      return true;
    });
  }, [editais, aba, uf, maturidade, query]);

  const sorted = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) =>
      compareSortValues(sortValue(a, sortKey), sortValue(b, sortKey), dir)
    );
  }, [filtered, sortKey, sortDir]);

  const [pagina, setPagina] = useState(1);
  const totalPaginas = Math.max(1, Math.ceil(sorted.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const inicio = (paginaAtual - 1) * POR_PAGINA;
  const visiveis = sorted.slice(inicio, inicio + POR_PAGINA);

  // Volta pra primeira página sempre que o filtro muda.
  useEffect(() => {
    setPagina(1);
  }, [query, uf, maturidade, aba]);

  const foraDoEscopo = aba === "fora-do-escopo";

  // Colunas de step (maturidade/categorizado/aprofundado/resumo) não existem nas
  // duas visões — ao trocar de aba, volta pro ID pra não ordenar por uma coluna
  // que nem aparece mais.
  useEffect(() => {
    setSortKey("id");
    setSortDir("asc");
  }, [aba]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function Th({ label, sortKey: key }: { label: string; sortKey: SortKey }) {
    return (
      <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
        <button
          onClick={() => toggleSort(key)}
          className="flex items-center gap-1 uppercase tracking-wide hover:text-ink"
        >
          {label}
          <SortIcon direction={sortKey === key ? sortDir : null} />
        </button>
      </th>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar por cidade, título ou tag…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-w-[220px] flex-1 rounded-full border border-border-strong bg-surface px-4 py-2 text-sm text-ink outline-none focus:border-ink"
        />
        {aba !== "pendente" && (
          <select
            value={uf}
            onChange={(e) => setUf(e.target.value)}
            className="rounded-full border border-border-strong bg-surface px-4 py-2 text-sm text-ink outline-none focus:border-ink"
          >
            <option value="todos">Todos os estados</option>
            {ufs.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        )}
        {aba === "concluido" && (
          <select
            value={maturidade}
            onChange={(e) => setMaturidade(e.target.value)}
            className="rounded-full border border-border-strong bg-surface px-4 py-2 text-sm text-ink outline-none focus:border-ink"
          >
            <option value="todos">Toda maturidade</option>
            <option value="madura">Central madura</option>
            <option value="nova">Central nova</option>
          </select>
        )}
      </div>

      <div className="mt-4 flex gap-1 rounded-full bg-surface-sunken p-1 sm:inline-flex">
        <button
          onClick={() => setAba("pendente")}
          className={`flex-1 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors sm:flex-none ${
            aba === "pendente" ? "bg-ink text-white" : "text-ink-muted hover:text-ink"
          }`}
        >
          Pendentes ({contagem.pendente})
        </button>
        <button
          onClick={() => setAba("concluido")}
          className={`flex-1 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors sm:flex-none ${
            aba === "concluido" ? "bg-ink text-white" : "text-ink-muted hover:text-ink"
          }`}
        >
          Concluído ({contagem.concluido})
        </button>
        <button
          onClick={() => setAba("fora-do-escopo")}
          className={`flex-1 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors sm:flex-none ${
            aba === "fora-do-escopo"
              ? "bg-ink text-white"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          Fora do escopo ({contagem["fora-do-escopo"]})
        </button>
      </div>

      <p className="mt-4 text-xs text-ink-faint">
        {filtered.length} de {contagem[aba]}{" "}
        {aba === "pendente"
          ? "pendentes"
          : aba === "concluido"
          ? "concluídos"
          : "fora do escopo"}
        {foraDoEscopo
          ? " · editais de equipamento/outro-domínio (não é central) e PDFs sem nota própria — não entram na contagem de pendente/concluído."
          : " · só editais de central entram aqui; equipamento/outro-domínio ficam na aba \"Fora do escopo\"."}
      </p>

      <div className="panel mt-4 overflow-x-auto">
        <table className="w-full min-w-[880px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <Th label="ID" sortKey="id" />
              <Th label="Arquivo" sortKey="arquivo" />
              {!foraDoEscopo && (
                <>
                  <Th label="Categorizado" sortKey="categorizado" />
                  <Th label="Aprofundado" sortKey="aprofundado" />
                  <Th label="Cidade" sortKey="cidade" />
                  <Th label="UF" sortKey="uf" />
                  <Th label="Ano" sortKey="ano" />
                </>
              )}
              <Th label="Conteúdo" sortKey="conteudo" />
              {foraDoEscopo ? (
                <Th label="Resumo" sortKey="resumo" />
              ) : (
                <Th label="Maturidade" sortKey="maturidade" />
              )}
              <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
                PDF
              </th>
            </tr>
          </thead>
          <tbody>
            {visiveis.map((edital) => {
              const maturidadeTag = edital.tags.find((t) =>
                t.startsWith("central-maturidade/")
              );
              const id = String(edital.numero).padStart(2, "0");
              return (
                <tr
                  key={edital.slug}
                  className="border-b border-border last:border-0 hover:bg-surface-sunken"
                >
                  <td className="px-5 py-4 tabular-nums text-ink-faint">{id}</td>
                  <td className="px-5 py-4">
                    {edital.semNota ? (
                      <span className="font-mono text-xs text-ink-muted">
                        {edital.pdfName ?? edital.slug}
                      </span>
                    ) : (
                      <Link
                        href={`/editais/${encodeURIComponent(edital.slug)}`}
                        className="block"
                      >
                        <span className="font-mono text-xs text-ink hover:underline">
                          {edital.pdfName ?? edital.slug}
                        </span>
                        {edital.titulo && (
                          <span className="block max-w-xs truncate text-xs text-ink-faint">
                            {edital.titulo.replace(/^[A-Z]{2}\s*-\s*[^—]+—\s*/, "")}
                          </span>
                        )}
                      </Link>
                    )}
                  </td>
                  {!foraDoEscopo && (
                    <>
                      <td
                        className="px-5 py-4"
                        title={
                          edital.semNota
                            ? "PDF sem nota própria (2ª via, anexo ou complemento de outro já processado)"
                            : `conteúdo: ${edital.conteudo ?? "—"} · software: ${edital.software ?? "—"}`
                        }
                      >
                        {isCategorizado(edital) === null ? (
                          <span className="text-ink-faint">—</span>
                        ) : isCategorizado(edital) ? (
                          <span className="text-signal-green">✅</span>
                        ) : (
                          <span className="text-signal-amber">❌</span>
                        )}
                      </td>
                      <td
                        className="px-5 py-4"
                        title={
                          isAprofundado(edital) === null
                            ? "Não se aplica (não é edital de central)"
                            : `Temas: ${temasDoEdital(edital).join(", ") || "nenhum ainda"}`
                        }
                      >
                        {isAprofundado(edital) === null ? (
                          <span className="text-ink-faint">N/A</span>
                        ) : isAprofundado(edital) ? (
                          <span className="text-signal-green">✅</span>
                        ) : (
                          <span className="text-signal-amber">⏳</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-ink-muted">{edital.cidade ?? "—"}</td>
                      <td className="px-5 py-4 text-ink-muted">{edital.uf ?? "—"}</td>
                      <td className="px-5 py-4 tabular-nums text-ink-muted">
                        {anoDoEdital(edital) ?? "—"}
                      </td>
                    </>
                  )}
                  <td className="px-5 py-4 text-ink-muted">
                    {edital.conteudo ? CONTEUDO_LABEL[edital.conteudo] ?? edital.conteudo : "—"}
                  </td>
                  {foraDoEscopo ? (
                    <td className="px-5 py-4 text-xs text-ink-muted">
                      {edital.resumo ?? (
                        <span className="text-ink-faint">
                          sem resumo (nota vazia ou PDF sem nota)
                        </span>
                      )}
                    </td>
                  ) : (
                    <td className="px-5 py-4 text-ink-muted">
                      {maturidadeTag ? (
                        MATURIDADE_LABEL[maturidadeTag]
                      ) : edital.conteudo === "central" ? (
                        <span className="text-ink-faint">—</span>
                      ) : (
                        <span
                          className="text-ink-faint"
                          title="Não se aplica (não é edital de central)"
                        >
                          N/A
                        </span>
                      )}
                    </td>
                  )}
                  <td className="px-5 py-4">
                    {pdfHref(edital) ? (
                      <a
                        href={pdfHref(edital)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full bg-surface-sunken px-3 py-1 text-[11px] font-medium text-ink-muted hover:bg-signal-red-tint hover:text-signal-red"
                      >
                        ↓ PDF
                      </a>
                    ) : (
                      <span className="text-[11px] text-ink-faint">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {totalPaginas > 1 && (
          <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-4 text-xs text-ink-muted">
            <span>
              {inicio + 1}–{inicio + visiveis.length} de {filtered.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={paginaAtual <= 1}
                className="rounded-lg border border-border-strong px-3 py-1.5 font-medium transition-colors hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="tabular-nums">
                {paginaAtual} / {totalPaginas}
              </span>
              <button
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                disabled={paginaAtual >= totalPaginas}
                className="rounded-lg border border-border-strong px-3 py-1.5 font-medium transition-colors hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-40"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
