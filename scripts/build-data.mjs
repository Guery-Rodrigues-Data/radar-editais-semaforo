// Lê o vault Obsidian (../../Análise) e gera JSON estático em src/data/.
// Roda com `npm run sync-data`. Não modifica nada no vault, só lê.

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT_ROOT = path.resolve(__dirname, "..", "..");
const POR_EDITAL_DIR = path.join(VAULT_ROOT, "Análise", "Por Edital");
const TEMAS_DIR = path.join(VAULT_ROOT, "Análise", "Temas");
const EDITAIS_DIR = path.join(VAULT_ROOT, "Editais");
const OUT_DIR = path.join(__dirname, "..", "src", "data");
// Pasta externa com os PDFs originais (fora do repo, só existe no PC do Guery).
// Mesma env var usada pela rota de download do PDF.
const EXTERNAL_PDF_DIR =
  process.env.EDITAIS_PDF_DIR ?? "C:\\Users\\guery.braga\\Documents\\Editais";

function slugify(filename) {
  return filename.replace(/^!/, "").replace(/\.md$/, "");
}

// `pdf_original` no frontmatter vem como link `file:///.../NOME.pdf` (PDF na
// pasta externa do Guery) ou wikilink `[[NOME.pdf]]` (PDF que está no vault,
// em `Editais/PDF/`). Extrai só o nome do arquivo + de onde ele vem.
function parsePdfOriginal(value) {
  if (!value || typeof value !== "string") {
    return { pdfName: null, pdfInVault: false };
  }
  const wiki = value.match(/^\[\[(.+?)\]\]$/);
  if (wiki) return { pdfName: wiki[1].trim(), pdfInVault: true };
  const file = value.match(/([^/\\]+\.(?:pdf|docx?|PDF))\s*$/);
  return {
    pdfName: file ? decodeURIComponent(file[1]).trim() : null,
    pdfInVault: false,
  };
}

// `data_edital` pode ser AAAA-MM-DD, AAAA-MM ou vazio. Normaliza pra string ou null.
function parseDataEdital(value) {
  if (value == null) return null;
  const s = String(value).trim();
  return /^\d{4}(-\d{2}){0,2}$/.test(s) ? s : null;
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

// Resumo curto pra listagem (usado sobretudo nos editais `equipamento`/`outro-dominio`,
// que raramente têm título próprio — só as notas `central` mais ricas têm H1).
// Pega a primeira linha de `## Confirma` (nota fina/mínima) ou, se não tiver, o começo
// de `## Integração / Software Central` (nota completa).
function extractResumo(sections) {
  const fonte = sections["Confirma"] ?? sections["Integração / Software Central"];
  if (!fonte) return null;
  const primeiraLinha = fonte
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.length > 0 && l !== "—");
  if (!primeiraLinha) return null;
  return primeiraLinha
    .replace(/^-\s*/, "")
    .replace(/\*\*/g, "")
    .slice(0, 240);
}

function parseEditalFile(fullPath, filename) {
  const raw = fs.readFileSync(fullPath, "utf-8");
  const { data, content } = matter(raw);
  const sections = extractSections(content);
  const { pdfName, pdfInVault } = parsePdfOriginal(data.pdf_original ?? null);
  return {
    slug: slugify(filename),
    pendingReview: filename.startsWith("!"),
    cidade: data.cidade ?? null,
    uf: data.uf ?? null,
    ano: resolveAno(data.edital ?? null),
    dataEdital: parseDataEdital(data.data_edital),
    pdfName,
    pdfInVault,
    // Schema novo (lote-piloto/lote 2 em diante): classificação leve do edital.
    software: data.software ?? null, // nao-menciona | basico | avancado | dados-ia | indefinido
    conteudo: data.conteudo ?? null, // central | equipamento | outro-dominio | indefinido
    temCentral: data.tem_central ?? null, // sim | nao | nao-diz
    tipoProjeto: data.tipo_projeto ?? null,
    temaPrincipal: data.tema_principal ?? null,
    tags: data.tags ?? [],
    revisadoGuery: data.revisado_guery ?? null,
    editalRef: data.edital ?? null,
    titulo: extractTitle(content),
    resumo: extractResumo(sections),
    integracao: sections["Integração / Software Central"] ?? null,
    contratacao: sections["Modelo de contratação"] ?? null,
    equipamento: sections["Equipamento (resumido)"] ?? null,
    normas: sections["Normas citadas"] ?? null,
    pontosDeAtencao: sections["Pontos de atenção"] ?? null,
    statusDoDado: sections["Status do dado"] ?? null,
  };
}

// "Foo-2.pdf" -> "Foo.pdf": muitos editais têm o PDF partido em volumes (edital +
// aviso de publicação, termo de referência à parte, etc.), nomeados "-1"/"-2"/etc.
// pelo próprio Guery ao salvar. É o mesmo processo licitatório, não um edital novo.
function stripVolumeSuffix(filename) {
  return filename.replace(/-\d+(\.[a-zA-Z0-9]+)$/, "$1");
}

function fileHash(filePath) {
  return crypto.createHash("md5").update(fs.readFileSync(filePath)).digest("hex");
}

// PDFs em `EXTERNAL_PDF_DIR` que nenhuma nota referencia via `pdf_original`
// (2ª via de um edital duplicado, anexo, ou complemento — ver
// `Análise/00 - Rastreabilidade.md` § Casos especiais). Viram linha na lista
// mesmo sem nota própria, só pra aparecer no "todos os arquivos que temos".
//
// Dois jeitos de já estar "coberto" mesmo sem bater o nome exato:
// 1. Mesmo nome-base, só varia o sufixo de volume ("-1" vs "-2").
// 2. Cópia com nome bem diferente mas conteúdo idêntico (mesmo hash) a um PDF
//    já coberto — ex.: renomeou ao copiar pra outra pasta.
function buildExtrasSemNota(editaisComNota) {
  if (!fs.existsSync(EXTERNAL_PDF_DIR)) return []; // só existe no PC do Guery
  const cobertosExatos = new Set(
    editaisComNota.filter((e) => e.pdfName && !e.pdfInVault).map((e) => e.pdfName)
  );
  const cobertosBase = new Set([...cobertosExatos].map(stripVolumeSuffix));

  let cobertosHashes = null;
  function getCobertosHashes() {
    if (cobertosHashes) return cobertosHashes;
    cobertosHashes = new Set();
    for (const nome of cobertosExatos) {
      const p = path.join(EXTERNAL_PDF_DIR, nome);
      if (fs.existsSync(p)) cobertosHashes.add(fileHash(p));
    }
    return cobertosHashes;
  }

  return fs
    .readdirSync(EXTERNAL_PDF_DIR)
    .filter((f) => /\.(pdf|docx?)$/i.test(f) && !cobertosExatos.has(f))
    .filter((f) => {
      if (cobertosBase.has(stripVolumeSuffix(f))) return false;
      return !getCobertosHashes().has(fileHash(path.join(EXTERNAL_PDF_DIR, f)));
    })
    .map((f) => ({
      slug: `arquivo:${f}`,
      pendingReview: false,
      cidade: null,
      uf: null,
      ano: null,
      dataEdital: null,
      pdfName: f,
      pdfInVault: false,
      software: null,
      conteudo: null,
      temCentral: null,
      tipoProjeto: null,
      temaPrincipal: null,
      tags: [],
      revisadoGuery: null,
      editalRef: null,
      titulo: null,
      resumo: null,
      integracao: null,
      contratacao: null,
      equipamento: null,
      normas: null,
      pontosDeAtencao: null,
      statusDoDado: null,
      semNota: true,
    }));
}

function buildEditais() {
  const files = fs
    .readdirSync(POR_EDITAL_DIR)
    .filter((f) => f.endsWith(".md"));
  const comNota = files.map((f) => parseEditalFile(path.join(POR_EDITAL_DIR, f), f));
  const semNota = buildExtrasSemNota(comNota);
  const todos = [...comNota, ...semNota];

  // `numero` é um ID fixo por edital, atribuído pelo nome do arquivo (pdfName), que não
  // muda quando a gente corrige `cidade`/`conteudo`/etc. numa auditoria. Nunca recalcular
  // isso a partir da ordem de exibição (cidade, filtro, página) — só a partir do pdfName,
  // que é a única coisa aqui que é estável de verdade.
  const porArquivo = [...todos].sort((a, b) =>
    (a.pdfName ?? a.slug).localeCompare(b.pdfName ?? b.slug, "pt-BR")
  );
  porArquivo.forEach((e, i) => {
    e.numero = i + 1;
  });

  // Ordem de exibição padrão = pelo `numero` fixo (mesma ordem usada pra atribuí-lo).
  return porArquivo;
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
    const tagRe = /^-\s+`([a-z0-9-]+(?:\/[a-z0-9-]+)+)`\s+—\s+(.+?)(?=\n- `|\n##|\n\n##|$)/gms;
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

// Catálogo de requisitos: uma linha por (edital × tema), pra lista clicável da aba Software.
// Tabela em "Requisitos de Software — Catálogo.md", entre "## Catálogo" e "## Como manter".
function parseRequisitos() {
  const filePath = path.join(TEMAS_DIR, "Requisitos de Software — Catálogo.md");
  if (!fs.existsSync(filePath)) return [];
  const { content } = matter(fs.readFileSync(filePath, "utf-8"));
  const start = content.indexOf("## Catálogo");
  if (start === -1) return [];
  const end = content.indexOf("## Como manter", start);
  const block = content.slice(start, end === -1 ? undefined : end);
  // Temas de 1º nível cuja tag no frontmatter vive sob `protocolo/`, não `modulo/`.
  // O catálogo escreve só o nome curto ("utmc"); aqui resolvemos o prefixo certo
  // pra `temaSlug` casar com a tag do edital (senão a barra não fica clicável).
  const PROTOCOLO_TEMAS = new Set([
    "utmc",
    "ntcip",
    "une-135401-4",
    "scoot",
    "onvif-ntcip-snmp-cftv",
  ]);
  const prefixoDe = (tema) => (PROTOCOLO_TEMAS.has(tema) ? "protocolo" : "modulo");
  const lines = block.split("\n").filter((l) => l.trim().startsWith("|"));
  return lines
    .slice(2) // pula header + separador
    .map((line) => {
      const c = line.split("|").slice(1, -1).map((x) => x.trim());
      const [tema, sub, resumo, citacao, editalRef] = c;
      const wiki = editalRef?.match(/\[\[(.+?)\]\]/);
      const editalSlug = wiki ? slugify(wiki[1].trim()) : null;
      if (!tema || !editalSlug) return null;
      const pref = prefixoDe(tema);
      return {
        tema, // curto: "mapa-status"
        temaSlug: `${pref}/${tema}`, // casa com a tag no frontmatter dos editais
        sub: sub || null,
        subSlug: sub ? `${pref}/${tema}/${sub}` : null,
        resumo: resumo?.replace(/\*\*/g, "") ?? "",
        citacao: citacao || null,
        editalSlug,
      };
    })
    .filter(Boolean);
}

// Backlog de Funcionalidades: reagrupa temas/sub-requisitos do Catálogo em
// "funcionalidade" (frase de escopo de produto). Curadoria manual é só o
// agrupamento (tabela em "Backlog de Funcionalidades.md"); a contagem de
// quantos editais pedem cada uma, e o nível (Essencial/Frequente/Raro), são
// sempre calculados aqui a partir dos dados — nunca hardcoded na nota.
function parseFuncionalidades(editais, requisitos) {
  const filePath = path.join(TEMAS_DIR, "Backlog de Funcionalidades.md");
  if (!fs.existsSync(filePath)) return [];
  const { content } = matter(fs.readFileSync(filePath, "utf-8"));

  const centralSlugs = new Set(
    editais.filter((e) => e.conteudo === "central").map((e) => e.slug)
  );

  // Seção "Resolução manual das divisões marcadas com *": linhas tipo
  // "- **Título** (6): [[a]], [[b]], ..." — usado quando a divisão não dá pra
  // derivar de uma tag sozinha (ex.: "status por controlador" é só parte de
  // `modulo/mapa-status`, precisou reler o resumo de cada linha do catálogo).
  const resolucaoManual = new Map();
  const resolStart = content.indexOf("## Resolução manual");
  const resolEnd = content.indexOf("## Como manter", resolStart);
  if (resolStart !== -1) {
    const bloco = content.slice(resolStart, resolEnd === -1 ? undefined : resolEnd);
    for (const linha of bloco.split("\n")) {
      const m = linha.match(/^- \*\*(.+?)\*\*\s*\(\d+\):\s*(.+)$/);
      if (!m) continue;
      const [, titulo, resto] = m;
      const slugs = [...resto.matchAll(/\[\[(.+?)\]\]/g)].map((x) => slugify(x[1].trim()));
      resolucaoManual.set(titulo.trim(), slugs);
    }
  }

  const start = content.indexOf("## Funcionalidades");
  const end = content.indexOf("## Resolução manual", start);
  const block = content.slice(start, end === -1 ? undefined : end);
  const lines = block.split("\n").filter((l) => l.trim().startsWith("|"));

  const linhas = lines
    .slice(2)
    .map((line) => {
      const [funcionalidade, temaRaw] = line
        .split("|")
        .slice(1, -1)
        .map((x) => x.trim());
      if (!funcionalidade || !temaRaw) return null;
      const manual = temaRaw.endsWith("*");
      const temaSlug = temaRaw.replace(/\*$/, "").replace(/`/g, "").trim();

      let editalSlugs;
      if (manual) {
        if (resolucaoManual.has(funcionalidade)) {
          editalSlugs = resolucaoManual.get(funcionalidade);
        } else if (temaSlug === "modulo/relatorios-log") {
          // "Gerar relatório de funcionamento e falhas": só quem tem uma linha
          // de relatorios-log SEM sub-padrão (os sub-padrões viraram
          // funcionalidade própria, não contam aqui de novo).
          editalSlugs = [
            ...new Set(
              requisitos
                .filter((r) => r.temaSlug === "modulo/relatorios-log" && !r.subSlug)
                .map((r) => r.editalSlug)
            ),
          ];
        } else {
          editalSlugs = [];
        }
      } else if (temaSlug.includes("/", temaSlug.indexOf("/") + 1)) {
        // tem sub (ex. "modulo/relatorios-log/auditoria") — sub não fica no
        // frontmatter do edital, só no Catálogo, então busca lá.
        editalSlugs = [
          ...new Set(
            requisitos.filter((r) => r.subSlug === temaSlug).map((r) => r.editalSlug)
          ),
        ];
      } else {
        // tag simples de 1º nível, direto do frontmatter.
        editalSlugs = editais
          .filter((e) => e.conteudo === "central" && e.tags.includes(temaSlug))
          .map((e) => e.slug);
      }

      editalSlugs = editalSlugs.filter((s) => centralSlugs.has(s));
      const total = editalSlugs.length;
      const nivel = total >= 15 ? "essencial" : total >= 5 ? "frequente" : "raro";

      // Resumo/citação por edital (pro "+" expandir na tabela do site ver
      // exatamente o que aquele edital pede) — busca a linha do Catálogo que
      // bateu com esse edital pra essa funcionalidade. `subKey` é null pros
      // casos "genéricos" (funcionalidade manual sem sub, ou tag simples).
      const subKey = temaSlug.includes("/", temaSlug.indexOf("/") + 1)
        ? temaSlug
        : null;
      const detalhes = {};
      for (const slug of editalSlugs) {
        const r = requisitos.find(
          (x) =>
            x.editalSlug === slug &&
            (subKey ? x.subSlug === subKey : x.temaSlug === temaSlug && !x.subSlug)
        );
        if (r) detalhes[slug] = { resumo: r.resumo, citacao: r.citacao };
      }

      return { funcionalidade, temaSlug, total, nivel, editalSlugs, detalhes };
    })
    .filter(Boolean);

  return linhas.sort((a, b) => b.total - a.total);
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

  const requisitos = parseRequisitos();
  fs.writeFileSync(
    path.join(OUT_DIR, "requisitos.json"),
    JSON.stringify(requisitos, null, 2),
    "utf-8"
  );

  const funcionalidades = parseFuncionalidades(editais, requisitos);
  fs.writeFileSync(
    path.join(OUT_DIR, "funcionalidades.json"),
    JSON.stringify(funcionalidades, null, 2),
    "utf-8"
  );

  console.log(
    `OK: ${editais.length} editais, ${tagCategories.reduce((a, c) => a + c.tags.length, 0)} tags em ${tagCategories.length} categorias, ${backlog.length} linhas de backlog, ${requisitos.length} requisitos, ${funcionalidades.length} funcionalidades.`
  );
}

main();
