import { SiteHeader } from "@/components/SiteHeader";
import { AchadoCard } from "@/components/AchadoCard";
import { achados } from "@/data/achados";

export default function AchadosPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="page-container px-6 py-12">
          <p className="text-xs font-semibold text-signal-red">Achados</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
            O que só aparece cruzando vários editais
          </h1>
          <p className="mt-2 max-w-xl text-sm text-ink-muted">
            Cada achado abaixo veio de comparar textos entre editais
            diferentes — não de ler um edital isolado.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {achados.map((achado) => (
              <AchadoCard key={achado.id} achado={achado} />
            ))}

            <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-border-strong p-6">
              <span className="w-fit rounded-full bg-signal-amber-tint px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-signal-amber">
                construção
              </span>
              <h3 className="font-display text-xl font-semibold leading-snug text-ink">
                Mais achados a caminho
              </h3>
              <p className="text-sm leading-relaxed text-ink-muted">
                Essa é só uma seleção do que já separamos até agora, não é a lista
                completa. Conforme a análise avança, mais achados entram aqui.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
