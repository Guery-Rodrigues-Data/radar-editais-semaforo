import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { StatCard } from "@/components/StatCard";
import { BarPanel } from "@/components/BarPanel";
import { DonutChart } from "@/components/DonutChart";
import { AchadoChip } from "@/components/AchadoChip";
import { ProtocoloEMapa } from "@/components/ProtocoloEMapa";
import { EditalTable } from "@/components/EditalTable";
import { SelecaoEditaisProvider } from "@/components/SelecaoEditaisContext";
import { achados, curatedStats, protocoloPlenoChart } from "@/data/achados";
import {
  editais,
  backlog,
  maturidadeSplit,
  editaisPorUf,
  maturidadePorUf,
} from "@/lib/data";

export default function Home() {
  const maturidade = maturidadeSplit();
  const todosPorUf = editaisPorUf();
  const porUf = todosPorUf.slice(0, 8);
  const editalSlugsByUf = Object.fromEntries(
    todosPorUf.map((d) => [d.uf, d.editalSlugs])
  );
  const maturidadeUf = maturidadePorUf();
  const mapLayers = [
    {
      id: "total",
      label: "Editais por estado",
      values: Object.fromEntries(todosPorUf.map((d) => [d.uf, d.total])),
      max: Math.max(...todosPorUf.map((d) => d.total)),
      colorFrom: "#fdeceb",
      colorTo: "#e0342b",
    },
    {
      id: "maturidade",
      label: "% central madura",
      unit: "%",
      values: Object.fromEntries(
        maturidadeUf.map((d) => [d.uf, d.pctMadura])
      ),
      max: 100,
      colorFrom: "#e7f7ee",
      colorTo: "#1f9d5c",
    },
  ];
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
        <div className="mx-auto max-w-6xl px-6 py-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h1 className="font-display text-2xl font-semibold text-ink">
              Radar de Editais — Sinalização Semafórica
            </h1>
            <span className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-ink-faint shadow-sm">
              versão prévia · 25/08/2026
            </span>
          </div>
          <p className="mt-1 text-sm text-ink-muted">
            Padrões de mercado extraídos de {editais.length} editais de
            licitação de sinalização semafórica pelo Brasil.
          </p>

          {/* KPIs */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              value={`${editais.length}/${curatedStats.totalVault}`}
              label="editais lidos a fundo (do vault todo)"
              gauge={{ value: editais.length, total: curatedStats.totalVault }}
            />
            <StatCard
              value={`${curatedStats.protocoloAbertoPleno}/${curatedStats.protocoloAbertoTotal}`}
              label="dos lidos exigem protocolo aberto pleno"
            />
            <StatCard
              value="UTMC2"
              label="protocolo líder"
              pill={`${curatedStats.utmc2Pleno} casos`}
            />
            <StatCard
              value={String(curatedStats.fornecedoresIdentificados)}
              label="fornecedores identificados por nome"
            />
          </div>

          <SelecaoEditaisProvider>
            {/* Mapa + protocolo */}
            <div className="mt-4">
              <ProtocoloEMapa
                protocolos={protocoloPlenoChart}
                mapLayers={mapLayers}
                editalSlugsByUf={editalSlugsByUf}
              />
            </div>

            {/* Charts */}
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <DonutChart
                title="Maturidade da central"
                centerValue={String(editais.length)}
                centerLabel="editais"
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
                data={porUf.map((d) => ({
                  label: d.uf,
                  value: d.total,
                  editalSlugs: d.editalSlugs,
                }))}
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
            <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
              <div className="panel p-6">
                <div className="flex items-baseline justify-between">
                  <h2 className="font-display text-sm font-semibold text-ink">
                    Achados — só aparecem cruzando vários editais
                  </h2>
                  <Link
                    href="/achados"
                    className="text-xs font-medium text-ink-faint hover:text-ink"
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
                  className="panel flex-1 p-6 transition-transform hover:-translate-y-0.5"
                >
                  <span className="font-display text-2xl font-semibold text-ink">
                    {backlog.length}
                  </span>
                  <p className="mt-1 text-sm text-ink-muted">
                    requisitos candidatos a backlog, por frequência
                  </p>
                </Link>
                <Link
                  href="/editais"
                  className="panel flex-1 p-6 transition-transform hover:-translate-y-0.5"
                >
                  <span className="font-display text-2xl font-semibold text-ink">
                    {editais.length}
                  </span>
                  <p className="mt-1 text-sm text-ink-muted">
                    editais explorados um por um, com filtro
                  </p>
                </Link>
              </div>
            </div>

            {/* Lista única de editais — alimentada pelo clique em qualquer
                gráfico acima (mapa, protocolo, barra), em vez de cada card
                ter sua própria lista embutida. */}
            <div className="mt-4">
              <EditalTable />
            </div>
          </SelecaoEditaisProvider>

          <p className="mt-8 max-w-2xl text-xs leading-relaxed text-ink-faint">
            Versão prévia (25/08/2026) — amostra em crescimento, {editais.length}
            {" "}de ~121 editais do vault. Leitura e cruzamento manual, ainda
            não é validação técnica profunda de cada cláusula.
          </p>
        </div>
      </main>
    </>
  );
}
