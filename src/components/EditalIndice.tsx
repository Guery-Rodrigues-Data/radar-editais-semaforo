"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatDataEdital, pdfHref, type Edital } from "@/lib/data";

const POR_PAGINA = 10;

const DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");
function normalize(text: string): string {
  return text.normalize("NFD").replace(DIACRITICS, "").toLowerCase();
}

const MATURIDADE_LABEL: Record<string, string> = {
  "central-maturidade/madura": "Madura",
  "central-maturidade/nova": "Nova",
};

type SortKey = "cidade" | "data" | "uf";

export function EditalIndice({ editais }: { editais: Edital[] }) {
  const [query, setQuery] = useState("");
  const [uf, setUf] = useState("todos");
  const [maturidade, setMaturidade] = useState("todos");
  const [tag, setTag] = useState("todas");
  const [sort, setSort] = useState<SortKey>("cidade");
  const [asc, setAsc] = useState(true);

  const ufs = useMemo(
    () =>
      (
        Array.from(new Set(editais.map((e) => e.uf).filter(Boolean))) as string[]
      ).sort(),
    [editais]
  );

  const tags = useMemo(
    () =>
      Array.from(new Set(editais.flatMap((e) => e.tags))).sort((a, b) =>
        a.localeCompare(b, "pt-BR")
      ),
    [editais]
  );

  const filtered = useMemo(() => {
    const rows = editais.filter((e) => {
      if (uf !== "todos" && e.uf !== uf) return false;
      if (
        maturidade !== "todos" &&
        !e.tags.includes(`central-maturidade/${maturidade}`)
      )
        return false;
      if (tag !== "todas" && !e.tags.includes(tag)) return false;
      if (query) {
        const haystack = normalize(
          `${e.cidade ?? ""} ${e.titulo ?? ""} ${e.tags.join(" ")}`
        );
        if (!haystack.includes(normalize(query))) return false;
      }
      return true;
    });

    const dir = asc ? 1 : -1;
    return rows.sort((a, b) => {
      if (sort === "data") {
        // sem data vai pro fim, independente da direção
        if (!a.dataEdital && !b.dataEdital) return 0;
        if (!a.dataEdital) return 1;
        if (!b.dataEdital) return -1;
        return a.dataEdital.localeCompare(b.dataEdital) * dir;
      }
      if (sort === "uf") {
        return (a.uf ?? "").localeCompare(b.uf ?? "", "pt-BR") * dir;
      }
      return (a.cidade ?? "").localeCompare(b.cidade ?? "", "pt-BR") * dir;
    });
  }, [editais, uf, maturidade, query, sort, asc]);

  const comData = filtered.filter((e) => e.dataEdital).length;
  const comPdf = filtered.filter((e) => e.pdfName).length;

  const [pagina, setPagina] = useState(1);
  const totalPaginas = Math.max(1, Math.ceil(filtered.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const inicio = (paginaAtual - 1) * POR_PAGINA;
  const visiveis = filtered.slice(inicio, inicio + POR_PAGINA);

  // Volta pra primeira página sempre que filtro/ordenação muda.
  useEffect(() => {
    setPagina(1);
  }, [query, uf, maturidade, tag, sort, asc]);

  function toggleSort(key: SortKey) {
    if (sort === key) setAsc((v) => !v);
    else {
      setSort(key);
      setAsc(true);
    }
  }
  const arrow = (key: SortKey) => (sort === key ? (asc ? " ↑" : " ↓") : "");

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
        <select
          value={maturidade}
          onChange={(e) => setMaturidade(e.target.value)}
          className="rounded-full border border-border-strong bg-surface px-4 py-2 text-sm text-ink outline-none focus:border-ink"
        >
          <option value="todos">Toda maturidade</option>
          <option value="madura">Central madura</option>
          <option value="nova">Central nova</option>
        </select>
        <select
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="max-w-[220px] rounded-full border border-border-strong bg-surface px-4 py-2 text-sm text-ink outline-none focus:border-ink"
        >
          <option value="todas">Todas as tags</option>
          {tags.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <p className="mt-4 text-xs text-ink-faint">
        {filtered.length} de {editais.length} editais · {comData} com data ·{" "}
        {comPdf} com PDF
      </p>

      <div className="panel mt-4 overflow-x-auto">
        <table className="w-full min-w-[880px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
                <button
                  onClick={() => toggleSort("cidade")}
                  className="uppercase tracking-wide hover:text-ink"
                >
                  Cidade{arrow("cidade")}
                </button>
              </th>
              <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
                <button
                  onClick={() => toggleSort("uf")}
                  className="uppercase tracking-wide hover:text-ink"
                >
                  UF{arrow("uf")}
                </button>
              </th>
              <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
                <button
                  onClick={() => toggleSort("data")}
                  className="uppercase tracking-wide hover:text-ink"
                >
                  Data do edital{arrow("data")}
                </button>
              </th>
              <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
                Maturidade
              </th>
              <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
                Tags
              </th>
              <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
                Atalhos
              </th>
            </tr>
          </thead>
          <tbody>
            {visiveis.map((edital) => {
              const maturidadeTag = edital.tags.find((t) =>
                t.startsWith("central-maturidade/")
              );
              const pdf = pdfHref(edital);
              return (
                <tr
                  key={edital.slug}
                  className="border-b border-border last:border-0 hover:bg-surface-sunken"
                >
                  <td className="px-5 py-4">
                    <Link
                      href={`/editais/${encodeURIComponent(edital.slug)}`}
                      className="block"
                    >
                      <span className="font-medium text-ink hover:underline">
                        {edital.cidade}
                      </span>
                      {edital.titulo && (
                        <span className="block max-w-[240px] truncate text-xs text-ink-faint">
                          {edital.titulo.replace(/^[A-Z]{2}\s*-\s*[^—]+—\s*/, "")}
                        </span>
                      )}
                    </Link>
                    {edital.pendingReview && (
                      <span className="mt-1 inline-block rounded-full bg-signal-amber-tint px-2 py-0.5 text-[10px] font-semibold text-signal-amber">
                        pendente de revisão
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-ink-muted">{edital.uf}</td>
                  <td className="px-5 py-4 tabular-nums text-ink-muted">
                    {formatDataEdital(edital.dataEdital)}
                  </td>
                  <td className="px-5 py-4 text-ink-muted">
                    {maturidadeTag ? MATURIDADE_LABEL[maturidadeTag] : "—"}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-nowrap items-center gap-1.5">
                      {edital.tags.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          title={t}
                          className="whitespace-nowrap rounded-full bg-surface-sunken px-2.5 py-1 text-[11px] text-ink-muted"
                        >
                          {t.includes("/") ? t.slice(t.indexOf("/") + 1) : t}
                        </span>
                      ))}
                      {edital.tags.length > 3 && (
                        <span
                          title={edital.tags.slice(3).join(", ")}
                          className="whitespace-nowrap text-[11px] text-ink-faint"
                        >
                          +{edital.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-nowrap items-center gap-2">
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
                          sem PDF
                        </span>
                      )}
                    </div>
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
