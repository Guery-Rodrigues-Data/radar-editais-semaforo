import editaisRaw from "@/data/editais.json";
import tagsRaw from "@/data/tags.json";
import backlogRaw from "@/data/backlog.json";

export type Edital = {
  slug: string;
  pendingReview: boolean;
  cidade: string | null;
  uf: string | null;
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
  return editais.find((e) => e.slug === slug || e.slug === `!${slug}`);
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
