// Curadoria editorial pro Nível 1/2 do site — combina achados de várias
// notas de `Análise/Temas/`. Diferente de editais.json/tags.json/backlog.json,
// isso NÃO é gerado automaticamente do vault (não tem uma nota única
// "achados.md" pra parsear) — é escrito à mão e precisa ser revisado
// manualmente se os achados de origem mudarem. Números de protocolo "pleno"
// são conferidos na nota `Interoperabilidade e Protocolos Abertos` — não
// dá pra derivar contando a tag `protocolo/*`, porque a tag também marca
// casos parciais/capacidade-de-integrar, não só o link pleno controlador-central.

export type Signal = "red" | "amber" | "green" | null;

export type Achado = {
  id: string;
  label: string;
  title: string;
  body: string;
  signal: Signal;
  editalSlugs: string[];
  featured?: boolean;
};

export const achados: Achado[] = [
  {
    id: "central-otto",
    label: "Concorrente identificado",
    title: "A “Central OTTO” aparece em 3 estados diferentes",
    body: "Santo André (SP), Alfenas (MG) e Dourados (MS) pedem a mesma central, com o mesmo texto de especificação quase palavra por palavra — até o mesmo SLA. Dourados fecha a dúvida: a central já está instalada lá, com o nome “CENTRAL OTTO”.",
    signal: null,
    editalSlugs: ["AN_SP_Santo-Andre", "AN_MG_Alfenas", "AN_MS_Dourados"],
    featured: true,
  },
  {
    id: "utmc2-lider",
    label: "Padrão técnico",
    title: "UTMC2 é o protocolo mais exigido — e citam a mesma norma, palavra por palavra",
    body: "4 editais de estados diferentes exigem esse protocolo britânico pra central falar com o controlador. Dois deles citam a mesma especificação técnica exata (UTMC TS003_003:2009) — sinal de que é literalmente o texto de referência que circula no mercado.",
    signal: "green",
    editalSlugs: [
      "AN_PR_Foz-do-Iguacu",
      "AN_CE_Fortaleza",
      "AN_SP_Cubatao",
      "!AN_SP_Detran",
    ],
  },
  {
    id: "central-prateleira",
    label: "Segmento de mercado",
    title: "Em município menor, a central vira item de planilha",
    body: "Guaíba, Jequié e Lajeado compram a central junto com o controlador, sem nenhuma especificação de software — e dois deles evitam dividir o contrato justamente pra não arriscar incompatibilidade entre fornecedores diferentes.",
    signal: "amber",
    editalSlugs: ["!AN_RS_Guaiba", "!AN_BA_Jequie", "!AN_RS_Lajeado"],
  },
  {
    id: "ia-llm",
    label: "Fronteira do mercado",
    title: "3 editais já pedem consulta em linguagem natural sobre dado de trânsito",
    body: "Indaiatuba foi o primeiro; Santo André e Alfenas pediram quase o mesmo pacote depois (ML/BI, LLM, integração com Waze). É o requisito mais avançado que já vimos — e o que mais conecta com uma futura inicativa de IA.",
    signal: null,
    editalSlugs: ["AN_SP_Indaiatuba", "AN_SP_Santo-Andre", "AN_MG_Alfenas"],
  },
  {
    id: "minuta-estadual",
    label: "Canal de distribuição",
    title: "Dois estados já publicam um edital-modelo pronto pra qualquer prefeitura usar",
    body: "Bahia e São Paulo têm minutas estaduais de registro de preços que qualquer município pode aderir — uma única licitação pode valer por dezenas de prefeituras de uma vez.",
    signal: null,
    editalSlugs: ["AN_BA_Detran-Salvador", "!AN_SP_Detran"],
  },
];

// Números verificados manualmente (ver nota de rodapé no lib/data.ts sobre
// a diferença entre "pleno" e apenas citado/parcial).
export const curatedStats = {
  totalVault: 121, // total de editais/documentos catalogados em Editais/00 - Indice.md
  protocoloAbertoPleno: 8,
  protocoloAbertoTotal: 34,
  utmc2Pleno: 4,
  fornecedoresIdentificados: 3, // OTTO, ANTARES, CTAFOR/SCOOT
};

// Contagem de protocolo "pleno" por família — conferida manualmente na nota
// Interoperabilidade e Protocolos Abertos (soma bate com curatedStats.protocoloAbertoPleno).
// editalSlugs aqui é só quem é PLENO daquele protocolo — não confundir com a
// tag `protocolo/*` (que também marca capacidade/parcial, ver editaisByTag).
export const protocoloPlenoChart = [
  {
    protocolo: "UTMC2",
    casos: 4,
    editalSlugs: [
      "AN_PR_Foz-do-Iguacu",
      "AN_CE_Fortaleza",
      "AN_SP_Cubatao",
      "!AN_SP_Detran",
    ],
  },
  {
    protocolo: "UNE 135401-4",
    casos: 3,
    editalSlugs: ["AN_RS_Farroupilha", "AN_SP_Ribeirao-Preto", "AN_PR_Paranagua"],
  },
  { protocolo: "NTCIP", casos: 1, editalSlugs: ["AN_MT_Cuiaba"] },
];
