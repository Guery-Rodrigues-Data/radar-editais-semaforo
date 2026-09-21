import editaisRaw from "@/data/editais.json";
import tagsRaw from "@/data/tags.json";
import backlogRaw from "@/data/backlog.json";
import requisitosRaw from "@/data/requisitos.json";
import funcionalidadesRaw from "@/data/funcionalidades.json";

export type Edital = {
  slug: string;
  numero: number;
  pendingReview: boolean;
  cidade: string | null;
  uf: string | null;
  ano: number | null;
  dataEdital: string | null;
  pdfName: string | null;
  pdfInVault: boolean;
  software: string | null;
  conteudo: string | null;
  temCentral: string | null;
  tipoProjeto: string | null;
  temaPrincipal: string | null;
  tags: string[];
  revisadoGuery: boolean | null;
  editalRef: string | null;
  titulo: string | null;
  resumo: string | null;
  integracao: string | null;
  contratacao: string | null;
  equipamento: string | null;
  normas: string | null;
  pontosDeAtencao: string | null;
  statusDoDado: string | null;
  semNota?: boolean;
};

export type Tag = { id: string; description: string };
export type TagCategory = { id: string; label: string; tags: Tag[] };

export type BacklogRow = {
  requisito: string;
  apareceEm: string;
  count: number | null;
  total: number | null;
  observacao: string;
};

export type Requisito = {
  tema: string;
  temaSlug: string;
  sub: string | null;
  subSlug: string | null;
  resumo: string;
  citacao: string | null;
  editalSlug: string;
};

export type NivelFuncionalidade = "essencial" | "frequente" | "raro";

export type Funcionalidade = {
  funcionalidade: string;
  temaSlug: string;
  total: number;
  nivel: NivelFuncionalidade;
  editalSlugs: string[];
  detalhes: Record<string, { resumo: string; citacao: string | null }>;
};

/** Detalhe (resumo/citação) de um edital pra uma funcionalidade do backlog,
 * usado pra expandir a linha na tabela de editais e mostrar o que ele pede. */
export function detalheFuncionalidade(label: string, editalSlug: string) {
  const f = funcionalidades.find((x) => x.funcionalidade === label);
  return f?.detalhes[editalSlug] ?? null;
}

export const editais = editaisRaw as Edital[];
export const tagCategories = tagsRaw as TagCategory[];
export const backlog = backlogRaw as BacklogRow[];
export const requisitos = requisitosRaw as Requisito[];
export const funcionalidades = funcionalidadesRaw as unknown as Funcionalidade[];

export function getEdital(slug: string): Edital | undefined {
  const clean = slug.replace(/^!/, "");
  return editais.find((e) => e.slug === clean);
}

/** URL da rota que serve o PDF original do edital (funciona só rodando local —
 *  os PDFs não vão pro deploy). `null` quando a nota não tem PDF mapeado. */
export function pdfHref(e: Pick<Edital, "slug" | "pdfName">): string | null {
  if (!e.pdfName) return null;
  return `/api/editais/${encodeURIComponent(e.slug)}/pdf`;
}

/** "2024-03-15" -> "15/03/2024"; "2024-03" -> "03/2024"; null -> "—". */
export function formatDataEdital(d: string | null): string {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  if (day) return `${day}/${m}/${y}`;
  if (m) return `${m}/${y}`;
  return y;
}

export function editaisByTag(tagId: string): Edital[] {
  return editais.filter((e) => e.tags.includes(tagId));
}

export function findTag(tagId: string): { category: TagCategory; tag: Tag } | undefined {
  for (const category of tagCategories) {
    const tag = category.tags.find((t) => t.id === tagId);
    if (tag) return { category, tag };
  }
  return undefined;
}

/**
 * Texto das notas do vault carrega wikilinks `[[Nota|Rótulo]]` e ênfase
 * markdown. Pra exibição em prosa simples (cards, tooltips), converte pra
 * texto plano: mantém o rótulo do link, remove `**negrito**`/`` `código` ``.
 */
export function plainText(md: string | null | undefined): string {
  if (!md) return "";
  return md
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

export function maturidadeSplit() {
  const slugs: Record<string, string[]> = {
    Madura: [],
    Nova: [],
    "Não classificada": [],
  };
  for (const e of editais) {
    if (e.tags.includes("central-maturidade/madura")) slugs.Madura.push(e.slug);
    else if (e.tags.includes("central-maturidade/nova")) slugs.Nova.push(e.slug);
    else slugs["Não classificada"].push(e.slug);
  }
  return (["Madura", "Nova", "Não classificada"] as const)
    .map((maturidade) => ({
      maturidade,
      total: slugs[maturidade].length,
      editalSlugs: slugs[maturidade],
    }))
    .filter((d) => d.total > 0);
}

export function editaisPorUf() {
  const grouped = new Map<string, string[]>();
  for (const e of editais) {
    if (!e.uf) continue;
    grouped.set(e.uf, [...(grouped.get(e.uf) ?? []), e.slug]);
  }
  return Array.from(grouped.entries())
    .map(([uf, slugs]) => ({ uf, total: slugs.length, editalSlugs: slugs }))
    .sort((a, b) => b.total - a.total);
}

export function maturidadePorUf() {
  const grouped = new Map<
    string,
    { madura: number; nova: number; total: number }
  >();
  for (const e of editais) {
    if (!e.uf) continue;
    const entry = grouped.get(e.uf) ?? { madura: 0, nova: 0, total: 0 };
    entry.total += 1;
    if (e.tags.includes("central-maturidade/madura")) entry.madura += 1;
    if (e.tags.includes("central-maturidade/nova")) entry.nova += 1;
    grouped.set(e.uf, entry);
  }
  return Array.from(grouped.entries()).map(([uf, v]) => ({
    uf,
    ...v,
    pctMadura: v.total > 0 ? Math.round((v.madura / v.total) * 100) : 0,
  }));
}

// ---- Classificação leve (schema novo: software / conteudo) ----

const SOFTWARE_ORDER = ["nao-menciona", "basico", "avancado", "dados-ia"] as const;
const SOFTWARE_LABEL: Record<string, string> = {
  "nao-menciona": "Não menciona",
  basico: "Básico",
  avancado: "Médio",
  "dados-ia": "Avançado",
};
const CONTEUDO_ORDER = ["equipamento", "central", "outro-dominio"] as const;
const CONTEUDO_LABEL: Record<string, string> = {
  equipamento: "Só equipamento",
  central: "Inclui central",
  "outro-dominio": "Outro domínio",
};

function splitBy(
  field: "software" | "conteudo",
  order: readonly string[],
  labels: Record<string, string>,
  predicate?: (e: Edital) => boolean
) {
  const g = new Map<string, string[]>();
  for (const e of editais) {
    if (predicate && !predicate(e)) continue;
    const v = e[field];
    if (!v || !order.includes(v)) continue;
    g.set(v, [...(g.get(v) ?? []), e.slug]);
  }
  return order
    .filter((k) => g.has(k))
    .map((k) => ({ id: k, label: labels[k], total: g.get(k)!.length, editalSlugs: g.get(k)! }));
}

// Escopado por conteudo === "central" (não por software !== "nao-menciona"), senão os 4
// editais com central como objeto do contrato mas sem spec de software ficam de fora.
export function softwareSplitCentral() {
  return splitBy("software", SOFTWARE_ORDER, SOFTWARE_LABEL, (e) => e.conteudo === "central");
}

export function conteudoSplit() {
  return splitBy("conteudo", CONTEUDO_ORDER, CONTEUDO_LABEL);
}

const TIPO_PROJETO_ORDER = [
  "implantacao",
  "ampliacao",
  "modernizacao",
  "manutencao",
  "aquisicao-equipamento",
] as const;
const TIPO_PROJETO_LABEL: Record<string, string> = {
  implantacao: "Implantação",
  ampliacao: "Ampliação",
  modernizacao: "Modernização",
  manutencao: "Manutenção",
  "aquisicao-equipamento": "Aquisição de equipamento",
};

/** Distribuição por `tipo_projeto`, opcionalmente restrita a um subconjunto. */
export function tipoProjetoSplit(filter?: (e: Edital) => boolean) {
  const g = new Map<string, string[]>();
  for (const e of editais) {
    if (filter && !filter(e)) continue;
    const v = e.tipoProjeto;
    if (!v || !TIPO_PROJETO_ORDER.includes(v as (typeof TIPO_PROJETO_ORDER)[number]))
      continue;
    g.set(v, [...(g.get(v) ?? []), e.slug]);
  }
  return TIPO_PROJETO_ORDER.filter((k) => g.has(k)).map((k) => ({
    id: k,
    label: TIPO_PROJETO_LABEL[k],
    total: g.get(k)!.length,
    editalSlugs: g.get(k)!,
  }));
}

export function editaisPorConteudo(conteudo: string): string[] {
  return editais.filter((e) => e.conteudo === conteudo).map((e) => e.slug);
}

export function editaisComTag(tag: string): string[] {
  return editais.filter((e) => e.tags.includes(tag)).map((e) => e.slug);
}

/** Contagem por UF de um conjunto de editais (por slug). */
export function contagemPorUf(slugs: string[]): Record<string, number> {
  const set = new Set(slugs.map((s) => s.replace(/^!/, "")));
  const c: Record<string, number> = {};
  for (const e of editais) {
    if (!e.uf || !set.has(e.slug)) continue;
    c[e.uf] = (c[e.uf] ?? 0) + 1;
  }
  return c;
}

/** Frequência de tags num conjunto de editais (por slug). `prefixes` filtra
 *  categorias (ex.: ["modulo/", "protocolo/"]). Ordenado por contagem. */
export function tagFreq(slugs: string[], prefixes?: string[]) {
  const set = new Set(slugs.map((s) => s.replace(/^!/, "")));
  const c = new Map<string, number>();
  for (const e of editais) {
    if (!set.has(e.slug)) continue;
    for (const t of e.tags) {
      if (prefixes && !prefixes.some((p) => t.startsWith(p))) continue;
      c.set(t, (c.get(t) ?? 0) + 1);
    }
  }
  return Array.from(c.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

/** Slugs de tema (`modulo/...`) que têm ao menos 1 linha no catálogo de requisitos. */
export function requisitoTemaSlugs(): Set<string> {
  return new Set(requisitos.map((r) => r.temaSlug));
}

/** Ordem fixa de exibição dos temas de 1º nível no catálogo de requisitos.
 *  v1 (basico): os 3 primeiros. v2 (avancado / "Médio"): os 12 seguintes. */
export const REQUISITO_TEMA_ORDEM = [
  "modulo/mapa-status",
  "modulo/controle-acesso",
  "modulo/relatorios-log",
  "protocolo/utmc",
  "protocolo/ntcip",
  "protocolo/une-135401-4",
  "modulo/cftv",
  "modulo/painel-mensagem-variavel",
  "modulo/notificacao-mensageria",
  "modulo/laco-virtual",
  "modulo/multiagencia",
  "modulo/video-wall-coi",
  "modulo/prioridade-onibus-bsp",
  "modulo/pluviometrico",
  "modulo/integracao-waze",
];

/** Linhas do catálogo, já com cidade/uf/pdf do edital. `temaSlug` filtra por
 *  tema; sem ele, devolve tudo. Ordenado por tema (ordem fixa) e depois cidade.
 *  Uma linha = um pedido de um edital. */
export function requisitosLista(temaSlug?: string | null) {
  return requisitos
    .filter((r) => !temaSlug || r.temaSlug === temaSlug)
    .map((r) => {
      const e = getEdital(r.editalSlug);
      return {
        ...r,
        cidade: e?.cidade ?? r.editalSlug,
        uf: e?.uf ?? null,
        pendingReview: e?.pendingReview ?? false,
        pdfName: e?.pdfName ?? null,
      };
    })
    .sort((a, b) => {
      const ta = REQUISITO_TEMA_ORDEM.indexOf(a.temaSlug);
      const tb = REQUISITO_TEMA_ORDEM.indexOf(b.temaSlug);
      if (ta !== tb) return ta - tb;
      return String(a.cidade).localeCompare(String(b.cidade), "pt");
    });
}

/** Estatísticas da base classificada (exclui stubs `indefinido`). */
export function baseStats() {
  const classificados = editais.filter(
    (e) => e.software && e.software !== "indefinido"
  );
  const naoMenciona = classificados.filter(
    (e) => e.software === "nao-menciona"
  ).length;
  // Escopado por conteudo (contrato é a central), não pelo campo software sozinho —
  // ver softwareSplitCentral() pro motivo.
  const pedeCentral = classificados.filter((e) => e.conteudo === "central").length;
  const dadosIa = classificados.filter((e) => e.software === "dados-ia").length;
  // "lido a fundo" = nota no formato antigo (tem a seção Integração/Software Central)
  const aFundo = editais.filter((e) => e.integracao).length;
  return {
    classificados: classificados.length,
    naoMenciona,
    pedeCentral,
    pctNaoMenciona:
      classificados.length > 0
        ? Math.round((100 * naoMenciona) / classificados.length)
        : 0,
    dadosIa,
    aFundo,
  };
}

/** Editais `avancado` + `dados-ia` por UF — onde está a demanda de plataforma. */
export function softwarePorUf() {
  const g = new Map<string, { total: number; plataforma: number; slugs: string[] }>();
  for (const e of editais) {
    if (!e.uf || !e.software || e.software === "indefinido") continue;
    const entry = g.get(e.uf) ?? { total: 0, plataforma: 0, slugs: [] };
    entry.total += 1;
    if (e.software === "avancado" || e.software === "dados-ia") {
      entry.plataforma += 1;
      entry.slugs.push(e.slug);
    }
    g.set(e.uf, entry);
  }
  return Array.from(g.entries()).map(([uf, v]) => ({ uf, ...v }));
}

// Rótulo legível pra tag de módulo/protocolo/contratação, usado na legenda de
// requisitos e na tabela de requisitos por edital.
const TAG_ROTULO: Record<string, string> = {
  "contratacao/srp": "Registro de Preços",
  "contratacao/pregao-eletronico": "Pregão eletrônico",
  "contratacao/tomada-de-precos": "Tomada de Preços",
  "contratacao/servico-continuado": "Serviço continuado",
  "contratacao/operacao-terceirizada": "Operação terceirizada",
  "contratacao/manutencao-ampliacao": "Manutenção / ampliação",
  "contratacao/hardware-apenas": "Só hardware",
  "contratacao/integracao-protocolo-avulsa": "Integração de protocolo avulsa",
  "protocolo/utmc": "UTMC / UTMC2",
  "protocolo/ntcip": "NTCIP",
  "protocolo/une-135401-4": "UNE 135401-4",
  "protocolo/scoot": "SCOOT",
  "protocolo/onvif-ntcip-snmp-cftv": "ONVIF+NTCIP+SNMP (câmera)",
  "modulo/mapa-status": "Mapa e status em tempo real",
  "modulo/controle-acesso": "Controle de acesso",
  "modulo/relatorios-log": "Relatórios e logs",
  "modulo/central-web-saas": "Central web / SaaS",
  "modulo/cftv": "CFTV",
  "modulo/multiagencia": "Multiagência",
  "modulo/notificacao-tradicional": "Notificação (SMS / e-mail)",
  "modulo/plataforma-dados-ia": "Plataforma de dados / IA",
  "modulo/pluviometrico": "Sensor pluviométrico",
  "modulo/simulacao-trafego": "Simulação de tráfego",
  "modulo/integracao-waze/plataforma-dados": "Waze, plataforma de dados",
  "modulo/painel-mensagem-variavel": "Painel de mensagem variável",
  "modulo/notificacao-mensageria": "Notificação WhatsApp / Telegram",
  "modulo/laco-virtual": "Laço virtual (vídeo)",
  "modulo/video-wall-coi": "Video wall / COI",
  "modulo/prioridade-onibus-bsp": "Prioridade de ônibus (BSP)",
  "modulo/integracao-waze": "Integração com Waze",
  "modulo/gestao-falhas-om": "Gestão de falhas / O&M",
  "modulo/lpr-cerco-eletronico": "Leitura de placa (LPR)",
  "modulo/dai-deteccao-incidente": "Detecção de incidente (DAI)",
  "modulo/plano-resposta-automatizado": "Plano de resposta automatizado",
  "modulo/cftv/onvif-ntcip-snmp": "CFTV com ONVIF+NTCIP+SNMP",
  "modulo/controle-acesso/multi-tenant": "Controle de acesso multi-tenant",
  "modulo/controle-acesso/sso-corporativo": "SSO corporativo",
  "modulo/mapa-status/heatmap": "Mapa de calor",
  "modulo/mapa-status/localizacao-gps": "Localização georreferenciada (GPS)",
  "modulo/mapa-status/mapa-sinotico": "Mapa sinótico da rede",
  "modulo/relatorios-log/alarme-falha-controlador": "Alarme de falha do controlador",
  "modulo/relatorios-log/auditoria": "Trilha de auditoria",
  "modulo/relatorios-log/log-ultimas-falhas": "Log das últimas falhas",
  "modulo/relatorios-log/alarme-divergencia-config": "Alarme de divergência de configuração",
  "modulo/relatorios-log/alarme-deteccao-fluxo": "Alarme do sistema de detecção de fluxo",
  "protocolo/utmc/nobreak-apenas": "UTMC só no No-Break/UPS",
};

// Fallback pra tag sem entrada em TAG_ROTULO: kebab-case vira "Palavra por palavra"
// em vez de aparecer cru na tela.
function humanizarSlug(slug: string) {
  return slug
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

/** Rótulo legível pra uma tag (com ou sem prefixo modulo/protocolo/contratacao). */
export function nomeTag(tag: string) {
  if (TAG_ROTULO[tag]) return TAG_ROTULO[tag];
  const semPrefixo = tag.includes("/") ? tag.slice(tag.indexOf("/") + 1) : tag;
  return humanizarSlug(semPrefixo);
}

export function stats() {
  const total = editais.length;
  const protocoloAbertoTag = tagCategories.find((c) => c.id === "protocolo");
  const editaisComProtocolo = editais.filter((e) =>
    e.tags.some((t) => t.startsWith("protocolo/"))
  ).length;
  const utmc2 = editaisByTag("protocolo/utmc").length;
  const iaLlm = editaisByTag("modulo/plataforma-dados-ia").length;
  return {
    total,
    editaisComProtocolo,
    utmc2,
    iaLlm,
    protocolosCount: protocoloAbertoTag?.tags.length ?? 0,
  };
}
