import { SiteHeader } from "@/components/SiteHeader";
import { EditaisExplorer } from "@/components/EditaisExplorer";
import { editais } from "@/lib/data";

export default function EditaisPage() {
  const analisados = editais.filter((e) => !e.semNota).length;
  const semNota = editais.length - analisados;

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="page-container px-4 py-12 sm:px-6">
          <p className="text-xs font-semibold text-signal-red">Base completa</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
            {editais.length} arquivos · {analisados} analisados
          </h1>
          <p className="mt-2 max-w-xl text-sm text-ink-muted">
            Cada linha com nota abre a ficha completa do edital: integração/central,
            modelo de contratação, equipamento e pontos de atenção.
            {semNota > 0 && (
              <> Os outros {semNota} são 2ª via, anexo ou complemento de um PDF já processado — aparecem na lista, mas sem ficha própria.</>
            )}
          </p>

          <div className="mt-8">
            <EditaisExplorer editais={editais} />
          </div>
        </div>
      </main>
    </>
  );
}
