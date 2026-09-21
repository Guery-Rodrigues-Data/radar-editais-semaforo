import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { getEdital, plainText, findTag } from "@/lib/data";

const SECTIONS: { key: keyof NonNullable<ReturnType<typeof getEdital>>; label: string }[] = [
  { key: "integracao", label: "Integração / Software Central" },
  { key: "contratacao", label: "Modelo de contratação" },
  { key: "equipamento", label: "Equipamento (resumido)" },
  { key: "normas", label: "Normas citadas" },
  { key: "pontosDeAtencao", label: "Pontos de atenção" },
];

export default async function EditalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const edital = getEdital(slug);
  if (!edital) notFound();

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="page-container px-6 py-12">
          <Link
            href="/editais"
            className="text-xs font-medium text-ink-faint hover:text-ink"
          >
            ← todos os editais
          </Link>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-ink-muted">
              {edital.cidade} · {edital.uf}
            </span>
            {edital.pendingReview && (
              <span className="rounded-full bg-signal-amber-tint px-2.5 py-1 text-[11px] font-semibold text-signal-amber">
                pendente de revisão
              </span>
            )}
          </div>

          <h1 className="mt-2 font-display text-2xl font-semibold leading-snug text-ink sm:text-3xl">
            {edital.titulo ?? edital.cidade}
          </h1>

          {edital.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {edital.tags.map((tagId) => {
                const found = findTag(tagId);
                return (
                  <Link
                    key={tagId}
                    href={`/tags/${tagId}`}
                    className="rounded-full bg-surface-sunken px-3 py-1 text-xs font-medium text-ink-muted hover:text-ink"
                    title={found ? plainText(found.tag.description) : undefined}
                  >
                    {tagId}
                  </Link>
                );
              })}
            </div>
          )}

          <div className="mt-10 space-y-8">
            {SECTIONS.map(({ key, label }) => {
              const value = edital[key];
              if (!value || typeof value !== "string") return null;
              return (
                <div key={key}>
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                    {label}
                  </h2>
                  <div className="prose-sm mt-2 whitespace-pre-line text-sm leading-relaxed text-ink">
                    {plainText(value)}
                  </div>
                </div>
              );
            })}
          </div>

          {edital.editalRef && (
            <p className="mt-12 border-t border-border pt-6 text-xs text-ink-faint">
              Fonte: {plainText(edital.editalRef)} (documento original no vault)
            </p>
          )}
        </div>
      </main>
    </>
  );
}
