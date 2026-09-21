"use client";

import { useState } from "react";
import { DonutChart } from "./DonutChart";
import { RequisitosDaSelecao } from "./RequisitosDaSelecao";
import { RequisitosTable } from "./RequisitosTable";
import { BrazilMap, type MapLayer } from "./BrazilMap";
import { MapaLegenda } from "./MapaLegenda";
import { EditalTable } from "./EditalTable";

type UfRow = { uf: string; total: number; editalSlugs: string[] };

type Slice = {
  id: string;
  label: string;
  total: number;
  editalSlugs: string[];
};

const SOFTWARE_COLOR: Record<string, string> = {
  basico: "var(--signal-amber)",
  avancado: "var(--signal-red)",
  "dados-ia": "var(--signal-green)",
};

const PROJETO_COLOR: Record<string, string> = {
  implantacao: "var(--signal-green)",
  ampliacao: "var(--signal-red)",
  modernizacao: "var(--signal-amber)",
  manutencao: "#3a5bd9",
  "aquisicao-equipamento": "var(--ink-faint)",
};

type TabId = "geral" | "software" | "equipamento" | "outro";

export function DashboardTabs({
  classificados,
  softwareComCentral,
  centralSlugs,
  equipamentoSlugs,
  tipoProjetoEquip,
  outroDominioSlugs,
  mapLayers,
  editalSlugsByUf,
  porUf,
}: {
  classificados: number;
  softwareComCentral: Slice[];
  centralSlugs: string[];
  equipamentoSlugs: string[];
  tipoProjetoEquip: Slice[];
  outroDominioSlugs: string[];
  mapLayers: MapLayer[];
  editalSlugsByUf: Record<string, string[]>;
  porUf: UfRow[];
}) {
  const [tab, setTab] = useState<TabId>("geral");
  // tema selecionado no painel "Requisitos mais comuns" (aba Software) —
  // filtra a lista de requisitos quando o modo é "requisito"
  const [temaReq, setTemaReq] = useState<string | null>(null);
  // modo da lista de baixo da aba Software: por requisito (padrão) ou por edital
  const [listaModo, setListaModo] = useState<"requisito" | "edital">("requisito");

  // Escopado igual ao centro do donut (só quem tem nível de software definido),
  // pra aba e donut baterem no mesmo número.
  const softwareTotal = softwareComCentral.reduce((acc, d) => acc + d.total, 0);

  const recortes: { id: TabId; label: string; emConstrucao?: boolean }[] = [
    { id: "software", label: `Software (${softwareTotal})` },
    {
      id: "equipamento",
      label: `Equipamento (${equipamentoSlugs.length})`,
      emConstrucao: true,
    },
    {
      id: "outro",
      label: `Outro domínio (${outroDominioSlugs.length})`,
      emConstrucao: true,
    },
  ];

  const btn = (ativo: boolean) =>
    `flex-1 inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
      ativo ? "bg-ink text-white" : "text-ink-muted hover:text-ink"
    }`;

  // alternador da lista da aba Software (renderizado dentro do card, à direita do título)
  const listaToggle = (
    <div className="flex shrink-0 gap-1 rounded-full bg-surface-sunken p-1">
      {(
        [
          ["requisito", "Por requisito"],
          ["edital", "Por edital"],
        ] as const
      ).map(([id, rotulo]) => (
        <button
          key={id}
          onClick={() => setListaModo(id)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            listaModo === id ? "bg-ink text-white" : "text-ink-muted hover:text-ink"
          }`}
        >
          {rotulo}
        </button>
      ))}
    </div>
  );

  return (
    <div className="mt-4">
      {/* "Geral" fica por cima, ocupando a largura toda; os 3 recortes ficam
          numa faixa abaixo, pra passar a ideia de que estão dentro do Geral. */}
      <div className="rounded-2xl bg-surface p-1 shadow-sm">
        <button
          onClick={() => setTab("geral")}
          className={`block w-full rounded-full px-4 py-2 text-center text-sm font-medium transition-colors ${
            tab === "geral"
              ? "bg-ink text-white"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          Geral ({classificados})
        </button>
        <div className="mt-1 flex flex-wrap gap-1 rounded-xl bg-surface-sunken p-1">
          {recortes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={btn(tab === t.id)}
            >
              {t.label}
              {t.emConstrucao && (
                <span className="rounded-full bg-signal-amber-tint px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-signal-amber">
                  construção
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {tab === "geral" && (
          <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
            <BrazilMap layers={mapLayers} editalSlugsByUf={editalSlugsByUf} />
            <MapaLegenda porUf={porUf} />
          </div>
        )}

        {tab === "software" && (
          <>
          <div className="grid gap-4 lg:grid-cols-2">
            <DonutChart
              title="Nível de requisito de software"
              subtitle={
                <>
                  Classificamos cada edital pela especificação de software
                  que ele pede: básica, média ou avançada.
                  <br />
                  Clique em uma fatia pra ver os detalhes.
                </>
              }
              centerValue={String(softwareTotal)}
              centerLabel="editais"
              captionPorFatia={{
                Básico: (
                  <>
                    <strong className="text-ink-muted">Básico:</strong> a
                    central faz o essencial, com mapa de status por cor,
                    login com perfis, relatório de falha e monitoramento em
                    tempo real. Perfil típico de município pequeno ou médio.
                  </>
                ),
                Médio: (
                  <>
                    <strong className="text-ink-muted">Médio:</strong>{" "}
                    central com módulos além do monitoramento, como CFTV,
                    gestão de eventos/incidentes, multiagência e prioridade
                    de ônibus (BSP). Compradores com central já madura.
                  </>
                ),
                Avançado: (
                  <>
                    <strong className="text-ink-muted">Avançado:</strong> a
                    central vira plataforma de dados, com analytics de ML/BI,
                    consulta em linguagem natural (LLM) e integração
                    profunda com Waze. Só 4 editais (Indaiatuba, Santo André,
                    Alfenas, São Bernardo).
                  </>
                ),
              }}
              data={softwareComCentral.map((d) => ({
                label: d.label,
                value: d.total,
                editalSlugs: d.editalSlugs,
                color: SOFTWARE_COLOR[d.id] ?? "var(--ink-faint)",
              }))}
            />
            <RequisitosDaSelecao
              fallbackSlugs={centralSlugs}
              onPick={(t) => setTemaReq((cur) => (cur === t ? null : t))}
              picked={temaReq}
            />
          </div>

          {listaModo === "requisito" ? (
            <RequisitosTable
              tema={temaReq}
              onClear={() => setTemaReq(null)}
              acao={listaToggle}
            />
          ) : (
            <EditalTable
              defaultSlugs={centralSlugs}
              defaultLabel={`${centralSlugs.length} editais que pedem central`}
              acao={listaToggle}
            />
          )}
          </>
        )}

        {tab === "equipamento" && (
          <>
            <div className="grid gap-4 lg:grid-cols-2">
              <DonutChart
                title="Tipo de projeto"
                centerValue={String(equipamentoSlugs.length)}
                centerLabel="editais"
                caption={
                  <>
                    <strong className="text-ink-muted">Implantação</strong> parque
                    novo · <strong className="text-ink-muted">Ampliação</strong> /{" "}
                    <strong className="text-ink-muted">Modernização</strong> /{" "}
                    <strong className="text-ink-muted">Manutenção</strong> de
                    parque existente · <strong className="text-ink-muted">
                      Aquisição
                    </strong>{" "}
                    de equipamento avulso. Clique numa fatia pra filtrar.
                  </>
                }
                data={[...tipoProjetoEquip]
                  .sort((a, b) => b.total - a.total)
                  .map((d) => ({
                    label: d.label,
                    value: d.total,
                    editalSlugs: d.editalSlugs,
                    color: PROJETO_COLOR[d.id] ?? "var(--ink-faint)",
                  }))}
              />
              <div className="panel p-6">
                <h3 className="font-display text-xl font-semibold text-ink">
                  O que mais pedem
                </h3>
                <p className="mt-3 text-sm text-ink-muted">
                  A análise de requisitos de equipamento ainda não foi feita.
                  Os editais deste grupo foram classificados por leitura
                  preliminar, olhando só o objeto do contrato. A distribuição
                  de requisitos será exibida aqui após a leitura aprofundada.
                </p>
              </div>
            </div>
            <EditalTable
              defaultSlugs={equipamentoSlugs}
              defaultLabel={`${equipamentoSlugs.length} editais só de equipamento`}
            />
          </>
        )}

        {tab === "outro" && (
          <>
            <div className="panel p-6">
              <p className="max-w-2xl text-sm text-ink-muted">
                Caíram no radar por serem tecnicamente “sinalização semafórica”,
                mas tratam de outro assunto: fiscalização eletrônica / radar
                (DER-RJ) e sinalização horizontal de pavimento (Teresina 2020,
                Manaus). Ficam <strong>fora</strong> das contagens de mercado.
              </p>
            </div>
            <EditalTable
              defaultSlugs={outroDominioSlugs}
              defaultLabel={`${outroDominioSlugs.length} editais de outro domínio`}
            />
          </>
        )}
      </div>
    </div>
  );
}
