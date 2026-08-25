import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { editaisByTag, findTag, plainText } from "@/lib/data";

export default async function TagPage({
  params,
}: {
  params: Promise<{ id: string[] }>;
}) {
  const { id } = await params;
  const tagId = id.join("/");
  const found = findTag(tagId);
  if (!found) notFound();

  const editaisRelacionados = editaisByTag(tagId);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <p className="font-mono text-xs uppercase tracking-wider text-ink-faint">
            {found.category.label}
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
            {tagId}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted">
            {plainText(found.tag.description)}
          </p>

          <div className="mt-10">
            <h2 className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
              {editaisRelacionados.length} editais com essa tag
            </h2>
            <ul className="mt-4 space-y-3">
              {editaisRelacionados.map((edital) => (
                <li key={edital.slug}>
                  <Link
                    href={`/editais/${encodeURIComponent(edital.slug)}`}
                    className="block rounded-lg border border-border bg-surface p-4 transition-colors hover:border-ink-faint"
                  >
                    <span className="font-medium text-ink">
                      {edital.cidade} · {edital.uf}
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
