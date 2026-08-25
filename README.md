# Radar de Editais

Página web (Next.js) que apresenta os achados do vault Obsidian "Editais
Licitacao" — inteligência de mercado a partir de editais de licitação de
sinalização semafórica pelo Brasil. Versão prévia pra mostrar pro chefe do
Guery e pra quem lê edital no dia a dia.

> Este projeto vive **dentro** do vault (pasta `site/`), mas o vault nunca
> deve tratar o conteúdo daqui como edital/dado de licitação — ver aviso no
> `CLAUDE.md` da raiz.

## Estrutura de navegação (3 níveis)

- **Nível 1 — `/`**: visão geral. Hero editorial, achado em destaque, stat
  tiles, grid de achados, teasers pro backlog e pra base completa.
- **Nível 2 — `/achados`, `/backlog`, `/editais`, `/tags/[categoria/tag]`**:
  exploração por tema — achados individuais, tabela de candidatos a
  backlog, tabela filtrável dos editais, editais por tag.
- **Nível 3 — `/editais/[slug]`**: ficha completa de um edital (mesmo
  conteúdo da nota `AN_...md` correspondente no vault).

## Dados

Os dados **não são editados diretamente** em `src/data/*.json` — esses
arquivos são gerados a partir do vault:

```bash
npm run sync-data
```

Isso lê `../Análise/Por Edital/*.md` e `../Análise/Temas/*.md` e regenera
`src/data/editais.json`, `tags.json` e `backlog.json`. O script roda
automaticamente antes de `npm run dev` e `npm run build` (via
`predev`/`prebuild`), então normalmente não precisa rodar à mão — só se
quiser conferir os dados sem subir o servidor.

A exceção é `src/data/achados.ts` — é **curadoria editorial manual** (não
gerado), porque não existe uma nota única no vault com essa lista. Se um
achado mudar de conteúdo numa nota de tema, precisa atualizar esse arquivo
à mão.

**Importante sobre o deploy**: só a pasta `site/` vai pro GitHub/Vercel, o
vault (`Análise/`) fica só no PC do Guery. Por isso os arquivos gerados em
`src/data/*.json` **são commitados** (não ficam no `.gitignore`) — na
Vercel, o script de sync detecta que o vault não existe e simplesmente
mantém o JSON já commitado. Isso significa que **atualizar o site exige
rodar `npm run sync-data` localmente e dar commit/push nos JSONs
atualizados** — não é automático a partir do vault sozinho.

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # e edite os valores
npm run dev
```

Abra http://localhost:3000 — vai pedir a senha configurada em
`SITE_PASSWORD` (`.env.local`).

## Variáveis de ambiente

| Variável | Pra que serve |
| --- | --- |
| `SITE_PASSWORD` | Senha do gate de acesso (ver `/entrar`) |
| `AUTH_SECRET` | Segredo usado pra assinar o cookie de sessão — qualquer string longa e aleatória |

Essas mesmas variáveis precisam ser configuradas em **Project Settings →
Environment Variables** no Vercel antes do primeiro deploy.

## Deploy (Vercel)

1. `git push` pro repositório no GitHub (já configurado como remoto deste
   repo — ver `git remote -v`).
2. No [dashboard da Vercel](https://vercel.com/new), importar esse
   repositório.
3. Configurar `SITE_PASSWORD` e `AUTH_SECRET` nas Environment Variables do
   projeto na Vercel.
4. Deploy. Toda vez que um novo edital for processado no vault e a gente
   rodar `npm run sync-data` + commit + push, o site atualiza sozinho.

## Stack

Next.js 16 (App Router) · Tailwind CSS v4 · TypeScript · gray-matter
(parse de frontmatter) · Recharts (gráficos, uso futuro) · Framer Motion
(uso futuro).

Paleta e tipografia (Space Grotesk / Inter / IBM Plex Mono) reaproveitadas
do projeto irmão `croqui-prototipo`.
