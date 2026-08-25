import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { StatStrip } from "@/components/StatStrip";
import { BarPanel } from "@/components/BarPanel";
import { AchadoChip } from "@/components/AchadoChip";
import { achados, curatedStats, protocoloPlenoChart } from "@/data/achados";
import { editais, backlog, maturidadeSplit, editaisPorUf } from "@/lib/data";

export default function Home() {
  const maturidade = maturidadeSplit();
  const porUf = editaisPorUf().slice(0, 8);
  const topBacklog = [...backlog]
    .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
    .slice(0, 6)
    .map((r) => ({
      label:
        r.requisito.length > 38
          ? `${r.requisito.slice(0, 37)}…`
          : r.requisito,
      value: r.count ?? 0,
    }));

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h1 className="font-display text-2xl font-semibold text-ink">
              Radar de Editais — Sinalização Semafórica
            </h1>
            <span className="font-mono text-xs text-ink-faint">
              versão prévia · 25/08/2026
            </span>
          </div>
          <p className="mt-1 text-sm text-ink-muted">
            Padrões de mercado extraídos de {editais.length} editais de
            licitação de sinalização semafórica pelo Brasil.
          </p>

          {/* KPIs */}
          <div className="mt-8">
            <StatStrip
              stats={[
                { value: String(editais.length), label: "editais analisados" },
                {
                  value: `${curatedStats.protocoloAbertoPleno}/${curatedStats.protocoloAbertoTotal}`,
                  label: "exigem protocolo aberto pleno",
                },
                {
                  value: "UTMC2",
                  label: `protocolo líder (${curatedStats.utmc2Pleno} casos)`,
                },
                {
                  value: String(curatedStats.fornecedoresIdentificados),
                  label: "fornecedores identificados por nome",
                },
              ]}
            />
          </div>

          {/* Charts */}
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <BarPanel
              title="Protocolo aberto pleno, por família"
              data={protocoloPlenoChart.map((d) => ({
                label: d.protocolo,
                value: d.casos,
              }))}
            />
            <BarPanel
              title="Maturidade da central"
              data={maturidade.map((d) => ({
                label: d.maturidade,
                value: d.total,
                color:
                  d.maturidade === "Madura"
                    ? "var(--signal-green)"
                    : d.maturidade === "Nova"
                      ? "var(--signal-amber)"
                      : "var(--ink-faint)",
              }))}
            />
            <BarPanel
              title="Editais por estado (top 8)"
              data={porUf.map((d) => ({ label: d.uf, value: d.total }))}
            />
          </div>

          <div className="mt-4">
            <BarPanel
              title="Top 6 requisitos mais pedidos"
              data={topBacklog}
              height={260}
              labelWidth={260}
            />
          </div>

          {/* Achados + links, lado a lado */}
          <div className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-md border border-border bg-surface p-5">
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-sm font-semibold text-ink">
                  Achados — só aparecem cruzando vários editais
                </h2>
                <Link
                  href="/achados"
                  className="font-mono text-xs text-ink-faint hover:text-ink"
                >
                  ver todos
                </Link>
              </div>
              <div className="mt-2">
                {achados.map((achado) => (
                  <AchadoChip key={achado.id} achado={achado} />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Link
                href="/backlog"
                className="flex-1 rounded-md border border-border bg-surface p-5 transition-colors hover:border-ink-faint"
              >
                <span className="font-mono text-2xl font-semibold text-ink">
                  {backlog.length}
                </span>
                <p className="mt-1 text-sm text-ink-muted">
                  requisitos candidatos a backlog, por frequência
                </p>
              </Link>
              <Link
                href="/editais"
                className="flex-1 rounded-md border border-border bg-surface p-5 transition-colors hover:border-ink-faint"
              >
                <span className="font-mono text-2xl font-semibold text-ink">
                  {editais.length}
                </span>
                <p className="mt-1 text-sm text-ink-muted">
                  editais explorados um por um, com filtro
                </p>
              </Link>
            </div>
          </div>

          <p className="mt-10 max-w-2xl font-mono text-[11px] leading-relaxed text-ink-faint">
            Versão prévia (25/08/2026) — amostra em crescimento, {editais.length}
            {" "}de ~121 editais do vault. Leitura e cruzamento manual, ainda
            não é validação técnica profunda de cada cláusula.
          </p>
        </div>
      </main>
    </>
  );
}
