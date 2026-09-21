import { SiteHeader } from "@/components/SiteHeader";
import { DashboardTabs } from "@/components/DashboardTabs";
import { SelecaoEditaisProvider } from "@/components/SelecaoEditaisContext";
import {
  baseStats,
  softwareSplitCentral,
  tipoProjetoSplit,
  editaisPorConteudo,
  editaisPorUf,
} from "@/lib/data";

export default function Home() {
  const base = baseStats();
  // "Não menciona" fica de fora do donut de nível — não é um nível, é ausência de dado;
  // só polui a leitura "Básico/Médio/Avançado". A aba "Software" conta a partir dessa
  // mesma lista (DashboardTabs soma softwareComCentral), não do total de 50 "central".
  const softwareComCentral = softwareSplitCentral().filter(
    (d) => d.id !== "nao-menciona"
  );
  const centralSlugs = editaisPorConteudo("central");
  const equipamentoSlugs = editaisPorConteudo("equipamento");
  const outroDominioSlugs = editaisPorConteudo("outro-dominio");
  const tipoProjetoEquip = tipoProjetoSplit((e) => e.conteudo === "equipamento");

  const todosPorUf = editaisPorUf();
  const editalSlugsByUf = Object.fromEntries(
    todosPorUf.map((d) => [d.uf, d.editalSlugs])
  );

  const mapLayers = [
    {
      id: "total",
      label: "Editais por estado",
      values: Object.fromEntries(todosPorUf.map((d) => [d.uf, d.total])),
      max: Math.max(...todosPorUf.map((d) => d.total)),
      colorFrom: "#fdeceb",
      colorTo: "#e0342b",
    },
  ];

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="page-container px-6 py-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h1 className="font-display text-2xl font-semibold text-ink">
              Radar de Editais — Sinalização Semafórica
            </h1>
            <span className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-ink-faint shadow-sm">
              versão prévia · 27/08/2026
            </span>
          </div>
          <p className="mt-1 text-sm text-ink-muted">
            <strong className="text-ink">{base.classificados}</strong> editais de
            licitação de sinalização semafórica classificados pelo que o contrato
            inclui.
          </p>

          <SelecaoEditaisProvider>
            <div className="mt-6">
              <DashboardTabs
                classificados={base.classificados}
                softwareComCentral={softwareComCentral}
                centralSlugs={centralSlugs}
                equipamentoSlugs={equipamentoSlugs}
                tipoProjetoEquip={tipoProjetoEquip}
                outroDominioSlugs={outroDominioSlugs}
                mapLayers={mapLayers}
                editalSlugsByUf={editalSlugsByUf}
                porUf={todosPorUf}
              />
            </div>
          </SelecaoEditaisProvider>

          <p className="mt-8 max-w-2xl text-xs leading-relaxed text-ink-faint">
            Versão prévia (27/08/2026) — {base.classificados} editais
            classificados. A primeira leva foi filtrada por palavra-chave; o
            restante foi lido aleatoriamente pra evitar viés de amostra. Não é o
            universo do mercado, é o conjunto que reunimos aqui.
          </p>
        </div>
      </main>
    </>
  );
}
