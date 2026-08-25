// Lê o vault Obsidian (../../Análise) e gera JSON estático em src/data/.
// Roda com `npm run sync-data`. Não modifica nada no vault, só lê.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT_ROOT = path.resolve(__dirname, "..", "..");
const POR_EDITAL_DIR = path.join(VAULT_ROOT, "Análise", "Por Edital");
const TEMAS_DIR = path.join(VAULT_ROOT, "Análise", "Temas");
const EDITAIS_DIR = path.join(VAULT_ROOT, "Editais");
const OUT_DIR = path.join(__dirname, "..", "src", "data");

function slugify(filename) {
  return filename.replace(/^!/, "").replace(/\.md$/, "");
}

// A nota de análise (`Por Edital/AN_*.md`) não guarda `ano` no próprio
// frontmatter — só o edital bruto em `Editais/*.md` tem. Resolve via o
// wikilink `edital: "[[Nome Do Arquivo]]"` de volta pro arquivo cru.
function resolveAno(editalRef) {
  if (!editalRef) return null;
  const m = editalRef.match(/^\[\[(.+)\]\]$/);
  if (!m) return null;
  const filePath = path.join(EDITAIS_DIR, `${m[1]}.md`);
  if (!fs.existsSync(filePath)) return null;
  const { data } = matter(fs.readFileSync(filePath, "utf-8"));
  return typeof data.ano === "number" ? data.ano : null;
}

function stripCallouts(body) {
  // Remove callouts tipo "> [!question] ..." (pendente de revisão etc.) do corpo.
  return body
    .split("\n")
    .filter((line) => !line.trim().startsWith(">"))
    .join("\n")
    .trim();
}

function extractSections(body) {
  const clean = stripCallouts(body);
  const headerRe = /^##\s+(.+)$/gm;
  const matches = [...clean.matchAll(headerRe)];
  const sections = {};
  for (let i = 0; i < matches.length; i++) {
    const title = matches[i][1].trim();
    const start = matches[i].index + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : clean.length;
    sections[title] = clean.slice(start, end).trim();
  }
  return sections;
}

function extractTitle(body) {
  const m = body.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : null;
}

function parseEditalFile(fullPath, filename) {
  const raw = fs.readFileSync(fullPath, "utf-8");
  const { data, content } = matter(raw);
  const sections = extractSections(content);
  return {
    slug: slugify(filename),
    pendingReview: filename.startsWith("!"),
    cidade: data.cidade ?? null,
    uf: data.uf ?? null,
    ano: resolveAno(data.edital ?? null),
    temaPrincipal: data.tema_principal ?? null,
    tags: data.tags ?? [],
    revisadoGuery: data.revisado_guery ?? null,
    editalRef: data.edital ?? null,
    titulo: extractTitle(content),
    integracao: sections["Integração / Software Central"] ?? null,
    contratacao: sections["Modelo de contratação"] ?? null,
    equipamento: sections["Equipamento (resumido)"] ?? null,
    normas: sections["Normas citadas"] ?? null,
    pontosDeAtencao: sections["Pontos de atenção"] ?? null,
    statusDoDado: sections["Status do dado"] ?? null,
  };
}

function buildEditais() {
  const files = fs
    .readdirSync(POR_EDITAL_DIR)
    .filter((f) => f.endsWith(".md"));
  return files
    .map((f) => parseEditalFile(path.join(POR_EDITAL_DIR, f), f))
    .sort((a, b) => (a.cidade ?? "").localeCompare(b.cidade ?? "", "pt-BR"));
}

function parseTagIndex() {
  const filePath = path.join(TEMAS_DIR, "Índice de Tags.md");
  const raw = fs.readFileSync(filePath, "utf-8");
  const { content } = matter(raw);
  // Blocos "## `categoria/*` — descrição da categoria" seguidos de bullets "- `tag/valor` — texto"
  const categoryRe = /^##\s+`([a-z-]+)\/\*`\s+—\s+(.+)$/gm;
  const catMatches = [...content.matchAll(categoryRe)];
  const categories = [];
  for (let i = 0; i < catMatches.length; i++) {
    const [, catId, catLabel] = catMatches[i];
    const start = catMatches[i].index + catMatches[i][0].length;
    const end = i + 1 < catMatches.length ? catMatches[i + 1].index : content.length;
    const block = content.slice(start, end);
    const tagRe = /^-\s+`([a-z0-9-]+\/[a-z0-9-]+)`\s+—\s+(.+?)(?=\n- `|\n##|\n\n##|$)/gms;
    const tags = [...block.matchAll(tagRe)].map((m) => ({
      id: m[1],
      description: m[2].trim().replace(/\s+/g, " "),
    }));
    categories.push({ id: catId, label: catLabel.trim(), tags });
  }
  return categories;
}

function parseBacklogTable() {
  const filePath = path.join(TEMAS_DIR, "Requisitos de Plataforma - Candidatos a Backlog.md");
  const raw = fs.readFileSync(filePath, "utf-8");
  const { content } = matter(raw);
  const tableStart = content.indexOf("## Frequência — o que mais aparece");
  const tableEnd = content.indexOf("## Quem pede bem");
  const block = content.slice(tableStart, tableEnd === -1 ? undefined : tableEnd);
  const lines = block.split("\n").filter((l) => l.trim().startsWith("|"));
  // Primeira linha = header, segunda = separador, resto = dados
  const rows = lines.slice(2).map((line) => {
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());
    const [requisito, aparece, observacao] = cells;
    const freqMatch = aparece?.match(/(\d+)\/(\d+)/);
    return {
      requisito: requisito?.replace(/\*\*/g, "") ?? "",
      apareceEm: aparece ?? "",
      count: freqMatch ? Number(freqMatch[1]) : null,
      total: freqMatch ? Number(freqMatch[2]) : null,
      observacao: observacao ?? "",
    };
  });
  return rows.filter((r) => r.requisito);
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  if (!fs.existsSync(POR_EDITAL_DIR)) {
    // Builda na Vercel: só o `site/` foi enviado pro repo, o vault
    // (`../../Análise`) não existe nesse ambiente. Os JSONs já commitados
    // em src/data/ seguem valendo — não há nada a regenerar aqui.
    console.log(
      "Vault não encontrado (esperado em builds fora do PC do Guery) — mantendo src/data/*.json já commitado."
    );
    return;
  }

  const editais = buildEditais();
  fs.writeFileSync(
    path.join(OUT_DIR, "editais.json"),
    JSON.stringify(editais, null, 2),
    "utf-8"
  );

  const tagCategories = parseTagIndex();
  fs.writeFileSync(
    path.join(OUT_DIR, "tags.json"),
    JSON.stringify(tagCategories, null, 2),
    "utf-8"
  );

  const backlog = parseBacklogTable();
  fs.writeFileSync(
    path.join(OUT_DIR, "backlog.json"),
    JSON.stringify(backlog, null, 2),
    "utf-8"
  );

  console.log(
    `OK: ${editais.length} editais, ${tagCategories.reduce((a, c) => a + c.tags.length, 0)} tags em ${tagCategories.length} categorias, ${backlog.length} linhas de backlog.`
  );
}

main();
