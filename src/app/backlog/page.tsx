import { SiteHeader } from "@/components/SiteHeader";
import { BacklogTable } from "@/components/BacklogTable";
import { backlog } from "@/lib/data";

export default function BacklogPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <p className="font-mono text-xs uppercase tracking-wider text-ink-faint">
            Candidatos a backlog
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
            O que os editais mais pedem
          </h1>
          <p className="mt-2 max-w-xl text-sm text-ink-muted">
            Rascunho de backlog, não decisão fechada — cada linha mostra em
            quantos dos editais lidos aquele requisito aparece.
          </p>

          <div className="mt-8">
            <BacklogTable rows={backlog} />
          </div>
        </div>
      </main>
    </>
  );
}
