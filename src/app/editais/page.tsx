import { SiteHeader } from "@/components/SiteHeader";
import { EditaisExplorer } from "@/components/EditaisExplorer";
import { editais } from "@/lib/data";

export default function EditaisPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <p className="font-mono text-xs uppercase tracking-wider text-ink-faint">
            Base completa
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
            {editais.length} editais explorados
          </h1>
          <p className="mt-2 max-w-xl text-sm text-ink-muted">
            Cada linha abre a ficha completa do edital: integração/central,
            modelo de contratação, equipamento e pontos de atenção.
          </p>

          <div className="mt-8">
            <EditaisExplorer editais={editais} />
          </div>
        </div>
      </main>
    </>
  );
}
