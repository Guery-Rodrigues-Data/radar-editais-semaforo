import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { achados } from "@/data/achados";
import { getEdital } from "@/lib/data";

const SIGNAL_COLOR: Record<string, string> = {
  red: "bg-signal-red",
  amber: "bg-signal-amber",
  green: "bg-signal-green",
};

export default async function AchadoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const achado = achados.find((a) => a.id === id);
  if (!achado) notFound();

  const editaisRelacionados = achado.editalSlugs
    .map((slug) => getEdital(slug))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="page-container px-6 py-12">
          <Link
            href="/achados"
            className="text-xs font-medium text-ink-faint hover:text-ink"
          >
            ← todos os achados
          </Link>

          <div className="mt-4 flex items-center gap-2">
            {achado.signal && (
              <span
                aria-hidden
                className={`h-2.5 w-2.5 rounded-full ${SIGNAL_COLOR[achado.signal]}`}
              />
            )}
            <span className="text-xs font-semibold text-signal-red">
              {achado.label}
            </span>
          </div>

          <h1 className="mt-2 font-display text-3xl font-semibold leading-snug text-ink">
            {achado.title}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-muted">
            {achado.body}
          </p>

          <div className="mt-10">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
              Editais que sustentam esse achado
            </h2>
            <ul className="mt-4 space-y-3">
              {editaisRelacionados.map((edital) => (
                <li key={edital.slug}>
                  <Link
                    href={`/editais/${encodeURIComponent(edital.slug)}`}
                    className="panel block p-4 transition-transform hover:-translate-y-0.5"
                  >
                    <span className="font-medium text-ink">
                      {edital.cidade} · {edital.uf}
                    </span>
                    <span className="ml-2 text-sm text-ink-muted">
                      {edital.titulo}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </>
  );
}
