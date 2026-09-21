"use client";

import { useEffect, useState } from "react";
import { requisitosLista, nomeTag } from "@/lib/data";
import { useSelecaoEditais } from "./SelecaoEditaisContext";

const POR_PAGINA = 10;

const TEMA_LABEL: Record<string, string> = {
  "modulo/mapa-status": "Mapa e status da rede",
  "modulo/controle-acesso": "Controle de acesso",
  "modulo/relatorios-log": "Relatórios e logs",
  "protocolo/utmc": "Protocolo UTMC / UTMC2",
  "protocolo/ntcip": "Protocolo NTCIP",
  "protocolo/une-135401-4": "Protocolo UNE 135401-4",
  "modulo/cftv": "CFTV / câmeras",
  "modulo/painel-mensagem-variavel": "Painel de mensagem variável (PMV)",
  "modulo/notificacao-mensageria": "Notificação por WhatsApp / Telegram / SMS",
  "modulo/laco-virtual": "Laço virtual / detecção por vídeo",
  "modulo/multiagencia": "Operação multiagência",
  "modulo/video-wall-coi": "Video wall / COI",
  "modulo/prioridade-onibus-bsp": "Prioridade de ônibus (BSP)",
  "modulo/pluviometrico": "Módulo pluviométrico",
  "modulo/integracao-waze": "Integração com Waze",
};

export function RequisitosTable({
  tema,
  onClear,
  acao,
}: {
  /** filtra por tema de 1º nível; sem valor, mostra todos */
  tema?: string | null;
  /** chamado pelo botão "ver todos" quando há filtro ativo */
  onClear?: () => void;
  /** slot no canto superior direito do card (ex.: alternador de modo da lista) */
  acao?: React.ReactNode;
}) {
  // Quando há uma fatia selecionada no gráfico (ex.: clicou em "Médio"), a lista
  // de requisitos fica restrita a esses editais — senão mostra o catálogo todo.
  const { selecao } = useSelecaoEditais();
  const escopo = selecao
    ? new Set(selecao.editalSlugs.map((s) => s.replace(/^!/, "")))
    : null;
  const linhas = requisitosLista(tema).filter(
    (r) => !escopo || escopo.has(r.editalSlug)
  );

  // Hierarquia: N1 = tema (filtro lá em cima / "Requisitos mais comuns"), N2 = grupo
  // por sub-requisito (subSlug quando tem, senão o próprio tema), N3 = edital dentro
  // do grupo. A linha fechada mostra o N2; abrir mostra os N3 (edital + citação).
  const grupos: {
    key: string;
    label: string;
    temaSlug: string;
    itens: typeof linhas;
  }[] = [];
  const porChave = new Map<string, (typeof grupos)[number]>();
  for (const r of linhas) {
    const key = r.subSlug ?? r.temaSlug;
    let g = porChave.get(key);
    if (!g) {
      g = { key, label: nomeTag(key), temaSlug: r.temaSlug, itens: [] };
      porChave.set(key, g);
      grupos.push(g);
    }
    g.itens.push(r);
  }

  const [alternados, setAlternados] = useState<Set<string>>(new Set());
  const alternar = (key: string) =>
    setAlternados((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  const [pagina, setPagina] = useState(1);

  const totalPaginas = Math.max(1, Math.ceil(grupos.length / POR_PAGINA));
  useEffect(() => {
    setPagina(1);
    setAlternados(new Set());
  }, [tema, selecao]);
  const atual = Math.min(pagina, totalPaginas);
  const inicio = (atual - 1) * POR_PAGINA;
  const visiveis = grupos.slice(inicio, inicio + POR_PAGINA);

  // Até 5 N2 (grupos) na tela: todos abrem com os N3 (editais) já visíveis.
  // Mais de 5: todos começam fechados. Clique inverte pra aquele grupo específico.
  const abrePorPadrao = visiveis.length <= 5;
  const estaAberto = (key: string) =>
    abrePorPadrao ? !alternados.has(key) : alternados.has(key);

  return (
    <div className="panel p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-xl font-semibold text-ink">
          {tema ? TEMA_LABEL[tema] ?? tema : "Requisitos por edital"}{" "}
          <span className="text-ink-muted">
            · {linhas.length} pedidos em {grupos.length} requisitos
          </span>
        </h3>
        <div className="flex items-center gap-2">
          {tema && onClear && (
            <button
              onClick={onClear}
              className="rounded-lg border border-surface-sunken px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:bg-surface-sunken"
            >
              ← ver todos os temas
            </button>
          )}
          {acao}
        </div>
      </div>
      <p className="mt-1 text-xs text-ink-faint">
        {tema
          ? "Clique num requisito pra ver os editais que pedem isso, com a citação de cada um."
          : "Um requisito por linha, agrupado por sub-tipo. Clique num tema acima pra filtrar."}
      </p>

      <div className="mt-4 overflow-x-auto">
        <div className="min-w-[720px]">
          {/* cabeçalho de colunas */}
          <div className="flex items-center gap-3 border-b border-border pb-2 text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
            <span className="flex-1">Requisito</span>
            <span className="w-32 shrink-0">Tema</span>
          </div>

          <div className="divide-y divide-border">
            {visiveis.map((g) => {
              const open = estaAberto(g.key);
              return (
                <div key={g.key}>
                  <div className="flex items-start gap-3 py-3">
                    <button
                      onClick={() => alternar(g.key)}
                      className="flex flex-1 items-start gap-1.5 text-left"
                    >
                      <span
                        className="shrink-0 text-xs leading-relaxed text-ink-faint"
                        aria-hidden
                      >
                        {open ? "−" : "+"}
                      </span>
                      <span
                        className={`text-xs leading-relaxed text-ink ${open ? "font-semibold" : ""}`}
                      >
                        {g.label}
                      </span>
                    </button>

                    <span className="w-32 shrink-0">
                      <span
                        className="block truncate rounded-full bg-surface-sunken px-2 py-0.5 text-[10px] font-medium text-ink-muted"
                        title={nomeTag(g.temaSlug)}
                      >
                        {nomeTag(g.temaSlug)}
                      </span>
                    </span>
                  </div>

                  {open && (
                    <div className="divide-y divide-border/60 pb-2 pl-5 pr-1">
                      {g.itens.map((it) => (
                        <div
                          key={it.editalSlug}
                          className="grid grid-cols-[1fr_96px] items-start gap-3 py-2.5 text-xs"
                        >
                          <div>
                            {it.citacao ? (
                              <blockquote className="border-l-2 border-border pl-3 italic text-ink-muted">
                                “{it.citacao}”
                              </blockquote>
                            ) : (
                              <p className="text-ink-muted">{it.resumo}</p>
                            )}
                          </div>
                          <span className="text-right font-medium text-ink-muted">
                            {it.cidade}
                            {it.uf ? `/${it.uf}` : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {totalPaginas > 1 && (
        <div className="mt-4 flex items-center justify-between gap-3 text-xs text-ink-muted">
          <span>
            {inicio + 1}–{inicio + visiveis.length} de {grupos.length}
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
      )}
    </div>
  );
}
