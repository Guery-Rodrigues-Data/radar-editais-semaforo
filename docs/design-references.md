# Referências de design — análise (25/08/2026)

Análise das 8 imagens em `../referencias/` (salvas pelo Guery a partir de shots do
Dribbble). Feita uma vez, pra não precisar reabrir/reanalisar toda vez que a gente
mexer no design do site. Se novas referências entrarem na pasta, atualizar este
arquivo.

## Imagens analisadas
1. `original-e2870003...webp` — "Coursue" (dashboard de plataforma de curso, roxo)
2. `1d60937832...webp` — "ACRU" (dashboard financeiro, verde)
3. `original-d92951d6...webp` — "Codename.com" CRM de vendas (rosa/magenta)
4. `original-e876b767...webp` — "Sequence" (dashboard financeiro, verde-petróleo escuro)
5. `original-158677b1...webp` — "LoopAI" Overview (CRM B2B com IA, roxo/lavanda)
6. `original-3afb8ea7...webp` — "LoopAI" widgets soltos (mesma família)
7. `original-86bf3f9b...webp` — "LoopAI" Clientes (mesma família)
8. `2026-08-25 11_16_44-FloatingWidget.png` — "Financial Dashboard №" (laranja/coral)

## Padrão comum às 8 (não é 1 referência isolada — repete nas 8)

- **Fundo da página nunca é branco/cinza puro** — sempre um gradiente suave
  (lavanda, menta, cinza levemente azulado). O dashboard "flutua" como uma janela
  sobre esse fundo colorido, com sombra suave.
- **Cards brancos com raio de borda grande** (~16–20px, não 4–8px) — bem mais
  arredondado que o padrão "SaaS técnico" que eu tinha usado.
- **Uma cor de acento só, mas forte, por produto** — cada referência escolhe UMA
  cor (roxo, verde, rosa, laranja) e usa ela em quase tudo daquele produto:
  botão primário, gráfico, ícone ativo do menu. Nenhuma mistura várias cores de
  acento como "paleta de gráfico".
- **Número grande + badge de variação ao lado** — o padrão mais repetido de
  todos: `$12,450` seguido de uma pílula colorida `+7.9%`/`-8%`. É a métrica-herói
  de cada card, não um gráfico.
- **Gráficos "macios", não barra sólida técnica** — em vez de barra reta tipo
  BI, aparecem: matriz de bolinhas empilhadas (LoopAI "Revenue Analytics"),
  anéis/círculos concêntricos (Financial Dashboard "Annual profits"), barra com
  esquinas bem arredondadas e paleta pastel (ACRU). Nenhuma delas usa a barra
  reta cinza/vermelha tipo Metabase que eu construí.
- **Tags/categorias em formato pílula (fully rounded), fundo pastel + texto na
  cor** — não é label mono uppercase pequeno. Ex.: fundo roxo claro + texto roxo
  "UI/UX Design".
- **Tipografia: só uma família sans em pesos diferentes** — nenhuma das 8 usa
  fonte monoespaçada em lugar nenhum, nem pros números. Números grandes usam a
  mesma sans do resto, só mais bold/maior. Isso contraria a escolha que eu fiz
  (IBM Plex Mono pra número/tag) — essas referências são "SaaS amigável", não
  "painel técnico denso".
- **Muito espaço em branco entre cards, nada encostado na borda** — respiro
  generoso, não é grid denso tipo planilha.
- **Avatares/fotos circulares em quase todo card** (equipe, cliente, "+12") —
  humaniza o dado. Não temos um equivalente direto (não é gente, é edital), mas
  o princípio de "elemento pequeno e redondo pra dar textura" pode virar, por
  exemplo, bandeirinha/sigla de UF num círculo.
- **3 das 8 têm uma caixa de "pergunte à IA" embutida no dashboard** ("Ask
  something...", "How can I help you?"). Não é prioridade pro v1, mas é uma
  pista de para onde esse estilo de dashboard tende (relevante lá na frente se
  o pitch de IA generativa do vault entrar na página).

## O que isso muda em relação ao que eu já construí

| Já construído | Referências pedem |
|---|---|
| Fundo cinza-claro chapado (`--bg: #f4f5f7`) | Gradiente suave, mais "produto", menos "ferramenta interna" |
| Cards `rounded-md`, borda fina cinza | Cards bem mais arredondados, sombra suave em vez de borda |
| IBM Plex Mono em números e tags | Só a sans (Inter/Space Grotesk), números grandes em bold |
| Vermelho sólido como cor única de todos os gráficos | Tudo bem, mas os gráficos em si podem ficar mais "macios"/arredondados |
| Label pequeno uppercase mono como "eyebrow" | Pílula colorida (pastel bg + texto colorido), sem uppercase forçado |
| Gráfico de barra reto tipo BI | Vale considerar formato mais orgânico (bolha/anel) pros números-chave, mantendo barra simples só onde fizer sentido (ranking de frequência) |

## Ainda não decidido
- Qual das 5 cores de acento (roxo/verde/rosa/laranja/petróleo) usar — hoje
  temos vermelho `#e0342b` do croqui-prototipo. Perguntar ao Guery se mantém o
  vermelho (já é a cor de marca de outro projeto dele) ou se abre pra outra,
  já que nenhuma referência usa vermelho como acento principal.
- Se vale reaproveitar o padrão de "número grande + badge de variação" no
  nosso caso — não temos "mês passado vs. esse mês" (não é métrica temporal
  recorrente), teria que adaptar pra algo tipo "8/34 → +1 desde o último lote".
