import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { StatStrip } from "@/components/StatStrip";
import { AchadoCard } from "@/components/AchadoCard";
import { achados, curatedStats } from "@/data/achados";
import { editais, backlog } from "@/lib/data";

export default function Home() {
  const featured = achados.find((a) => a.featured) ?? achados[0];
  const rest = achados.filter((a) => a.id !== featured.id);
  const topBacklog = [...backlog]
    .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
    .slice(0, 5);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 pt-16 pb-12 sm:pt-24">
          <p className="font-mono text-xs uppercase tracking-wider text-ink-faint">
            {editais.length} editais lidos · sinalização semafórica · Brasil
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl">
            Nenhuma prefeitura lê o edital da vizinha.
            <br />A gente leu {editais.length} ao mesmo tempo.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted">
            Isso é o que apareceu: um fornecedor com o mesmo texto em 3
            estados, um protocolo que virou padrão de fato, e o primeiro
            edital do Brasil pedindo IA generativa pra trânsito.
          </p>
        </section>

        {/* Achado em destaque */}
        <section className="mx-auto max-w-6xl px-6 pb-6">
          <Link
            href={`/achados/${featured.id}`}
            className="group grid gap-6 rounded-xl border border-border-strong bg-surface p-8 transition-colors hover:border-ink-faint sm:grid-cols-[1fr_auto] sm:items-center"
          >
            <div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-signal-red">
                {featured.label}
              </span>
              <h2 className="mt-2 max-w-xl font-display text-2xl font-semibold leading-snug text-ink sm:text-3xl">
                {featured.title}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted">
                {featured.body}
              </p>
            </div>
            <div className="flex items-center gap-3 sm:flex-col sm:items-end">
              {["SP", "MG", "MS"].map((uf) => (
                <span
                  key={uf}
                  className="rounded-full border border-border-strong bg-surface-sunken px-3 py-1 font-mono text-xs text-ink-muted"
                >
                  {uf}
                </span>
              ))}
            </div>
          </Link>
        </section>

        {/* Stats */}
        <section className="mx-auto max-w-6xl px-6 py-4">
          <StatStrip
            stats={[
              { value: String(editais.length), label: "editais analisados" },
              {
                value: `${curatedStats.protocoloAbertoPleno}/${curatedStats.protocoloAbertoTotal}`,
                label: "exigem protocolo aberto pleno",
              },
              {
                value: `${curatedStats.utmc2Pleno}×`,
                label: "UTMC2 é o protocolo líder",
              },
              {
                value: String(curatedStats.fornecedoresIdentificados),
                label: "fornecedores identificados por nome",
              },
            ]}
          />
        </section>

        {/* Grid de achados */}
        <section className="mx-auto max-w-6xl px-6 py-12">
          <h2 className="font-display text-xl font-semibold text-ink">
            Mais achados que só aparecem cruzando vários editais
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((achado) => (
              <AchadoCard key={achado.id} achado={achado} />
            ))}
          </div>
        </section>

        {/* Teasers pro nível 2 */}
        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/backlog"
              className="rounded-lg border border-border bg-surface p-6 transition-colors hover:border-ink-faint"
            >
              <span className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
                Candidatos a backlog
              </span>
              <h3 className="mt-2 font-display text-lg font-semibold text-ink">
                O que os editais mais pedem, ordenado por frequência
              </h3>
              <p className="mt-2 text-sm text-ink-muted">
                {backlog.length} requisitos, do mais universal (
                {topBacklog[0]?.requisito.toLowerCase()}) ao mais raro.
              </p>
            </Link>
            <Link
              href="/editais"
              className="rounded-lg border border-border bg-surface p-6 transition-colors hover:border-ink-faint"
            >
              <span className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
                Base completa
              </span>
              <h3 className="mt-2 font-display text-lg font-semibold text-ink">
                Explore os {editais.length} editais um por um
              </h3>
              <p className="mt-2 text-sm text-ink-muted">
                Filtre por estado, protocolo, módulo ou maturidade da
                central.
              </p>
            </Link>
          </div>
        </section>

        {/* Rodapé de rigor */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-6 py-8">
            <p className="max-w-2xl text-xs leading-relaxed text-ink-faint">
              Versão prévia (25/08/2026) — amostra em crescimento, {editais.length}{" "}
              de ~121 editais do vault, escolhidos por perfil de central/
              plataforma. Achados vêm de leitura e cruzamento manual dos
              editais publicados; ainda não é validação técnica profunda de
              cada cláusula.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
