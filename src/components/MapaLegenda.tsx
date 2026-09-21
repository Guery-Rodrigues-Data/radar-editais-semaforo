"use client";

import Link from "next/link";
import { getEdital } from "@/lib/data";
import { useSelecaoEditais } from "./SelecaoEditaisContext";

type UfRow = { uf: string; total: number; editalSlugs: string[] };

export function MapaLegenda({ porUf }: { porUf: UfRow[] }) {
  const { selecao, selecionar } = useSelecaoEditais();
  const ufSel = selecao
    ? porUf.find((r) => r.uf === selecao.label) ?? null
    : null;

  if (ufSel) {
    const porCidade = new Map<
      string,
      NonNullable<ReturnType<typeof getEdital>>[]
    >();
    for (const s of ufSel.editalSlugs) {
      const e = getEdital(s);
      if (!e) continue;
      const key = e.cidade ?? e.slug;
      const arr = porCidade.get(key) ?? [];
      arr.push(e);
      porCidade.set(key, arr);
    }
    const cidades = Array.from(porCidade.entries())
      .map(([cidade, eds]) => ({ cidade, eds }))
      .sort(
        (a, b) =>
          b.eds.length - a.eds.length ||
          a.cidade.localeCompare(b.cidade, "pt-BR")
      );
    const totalEditais = ufSel.editalSlugs.length;

    return (
      <div className="panel flex h-full flex-col p-6">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-display text-xl font-semibold text-ink">
            {ufSel.uf} · {cidades.length}{" "}
            {cidades.length === 1 ? "cidade" : "cidades"} · {totalEditais}{" "}
            {totalEditais === 1 ? "edital" : "editais"}
          </h3>
          <button
            onClick={() => selecionar(null)}
            className="text-xs font-medium text-ink-faint hover:text-ink"
          >
            todos os estados
          </button>
        </div>
        <ul className="mt-3 flex-1 space-y-0.5 overflow-y-auto">
          {cidades.map((c) => (
            <li key={c.cidade}>
              <Link
                href={`/editais/${encodeURIComponent(c.eds[0].slug)}`}
                title={c.eds.map((e) => e.titulo ?? e.cidade ?? e.slug).join(" · ")}
                className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm text-ink-muted hover:bg-surface-sunken hover:text-ink"
              >
                <span className="truncate">{c.cidade}</span>
                <span className="shrink-0 font-display font-semibold text-ink">
                  {c.eds.length}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const rows = [...porUf].sort((a, b) => b.total - a.total);
  const max = rows[0]?.total ?? 1;

  return (
    <div className="panel flex h-full flex-col p-6">
      <h3 className="font-display text-xl font-semibold text-ink">
        Editais por estado
      </h3>
      <p className="mt-1 text-xs text-ink-faint">
        clique num estado pra ver as cidades
      </p>
      <ul className="mt-3 flex-1 space-y-1 overflow-y-auto">
        {rows.map((r) => (
          <li key={r.uf}>
            <button
              onClick={() =>
                selecionar({ label: r.uf, editalSlugs: r.editalSlugs })
              }
              className="flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-surface-sunken"
            >
              <span className="w-7 shrink-0 text-sm font-medium text-ink">
                {r.uf}
              </span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-sunken">
                <span
                  className="block h-full rounded-full bg-signal-red"
                  style={{ width: `${(r.total / max) * 100}%` }}
                />
              </span>
              <span className="w-6 shrink-0 text-right font-display text-base font-semibold text-ink">
                {r.total}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
