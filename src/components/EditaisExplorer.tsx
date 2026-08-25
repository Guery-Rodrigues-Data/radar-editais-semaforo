"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Edital } from "@/lib/data";

const DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

function normalize(text: string): string {
  return text.normalize("NFD").replace(DIACRITICS, "").toLowerCase();
}

const MATURIDADE_LABEL: Record<string, string> = {
  "central-maturidade/madura": "Madura",
  "central-maturidade/nova": "Nova",
};

export function EditaisExplorer({ editais }: { editais: Edital[] }) {
  const [query, setQuery] = useState("");
  const [uf, setUf] = useState("todos");
  const [maturidade, setMaturidade] = useState("todos");

  const ufs = useMemo(
    () =>
      Array.from(new Set(editais.map((e) => e.uf).filter(Boolean))).sort() as string[],
    [editais]
  );

  const filtered = useMemo(() => {
    return editais.filter((e) => {
      if (uf !== "todos" && e.uf !== uf) return false;
      if (
        maturidade !== "todos" &&
        !e.tags.includes(`central-maturidade/${maturidade}`)
      )
        return false;
      if (query) {
        const haystack = normalize(
          `${e.cidade ?? ""} ${e.titulo ?? ""} ${e.tags.join(" ")}`
        );
        if (!haystack.includes(normalize(query))) return false;
      }
      return true;
    });
  }, [editais, uf, maturidade, query]);

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar por cidade, título ou tag…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-w-[220px] flex-1 rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-ink"
        />
        <select
          value={uf}
          onChange={(e) => setUf(e.target.value)}
          className="rounded-md border border-border-strong bg-surface px-3 py-2 font-mono text-sm text-ink outline-none focus:border-ink"
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
          className="rounded-md border border-border-strong bg-surface px-3 py-2 font-mono text-sm text-ink outline-none focus:border-ink"
        >
          <option value="todos">Toda maturidade</option>
          <option value="madura">Central madura</option>
          <option value="nova">Central nova</option>
        </select>
      </div>

      <p className="mt-4 font-mono text-xs text-ink-faint">
        {filtered.length} de {editais.length} editais
      </p>

      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-sunken text-left">
              <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-wide text-ink-faint">
                Cidade
              </th>
              <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-wide text-ink-faint">
                UF
              </th>
              <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-wide text-ink-faint">
                Maturidade
              </th>
              <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-wide text-ink-faint">
                Tags
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((edital) => {
              const maturidadeTag = edital.tags.find((t) =>
                t.startsWith("central-maturidade/")
              );
              return (
                <tr
                  key={edital.slug}
                  className="border-b border-border last:border-0 hover:bg-surface-sunken"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/editais/${encodeURIComponent(edital.slug)}`}
                      className="block"
                    >
                      <span className="font-medium text-ink hover:underline">
                        {edital.cidade}
                      </span>
                      {edital.titulo && (
                        <span className="block max-w-xs truncate text-xs text-ink-faint">
                          {edital.titulo.replace(/^[A-Z]{2}\s*-\s*[^—]+—\s*/, "")}
                        </span>
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-ink-muted">
                    {edital.uf}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">
                    {maturidadeTag ? MATURIDADE_LABEL[maturidadeTag] : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {edital.tags.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-surface-sunken px-2 py-0.5 font-mono text-[10px] text-ink-muted"
                        >
                          {t}
                        </span>
                      ))}
                      {edital.tags.length > 3 && (
                        <span className="font-mono text-[10px] text-ink-faint">
                          +{edital.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
