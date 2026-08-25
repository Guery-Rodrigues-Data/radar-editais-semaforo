import editaisRaw from "@/data/editais.json";
import tagsRaw from "@/data/tags.json";
import backlogRaw from "@/data/backlog.json";

export type Edital = {
  slug: string;
  pendingReview: boolean;
  cidade: string | null;
  uf: string | null;
  ano: number | null;
  temaPrincipal: string | null;
  tags: string[];
  revisadoGuery: boolean | null;
  editalRef: string | null;
  titulo: string | null;
  integracao: string | null;
  contratacao: string | null;
  equipamento: string | null;
  normas: string | null;
  pontosDeAtencao: string | null;
  statusDoDado: string | null;
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

export const editais = editaisRaw as Edital[];
export const tagCategories = tagsRaw as TagCategory[];
export const backlog = backlogRaw as BacklogRow[];

export function getEdital(slug: string): Edital | undefined {
  const clean = slug.replace(/^!/, "");
  return editais.find((e) => e.slug === clean);
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
  const madura = editaisByTag("central-maturidade/madura").length;
  const nova = editaisByTag("central-maturidade/nova").length;
  const semTag = editais.length - madura - nova;
  return [
    { maturidade: "Madura", total: madura },
    { maturidade: "Nova", total: nova },
    { maturidade: "Não classificada", total: semTag },
  ].filter((d) => d.total > 0);
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
