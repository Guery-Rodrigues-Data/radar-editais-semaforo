import { SiteHeader } from "@/components/SiteHeader";
import { AchadoCard } from "@/components/AchadoCard";
import { achados } from "@/data/achados";

export default function AchadosPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <p className="font-mono text-xs uppercase tracking-wider text-ink-faint">
            Achados
          </p>
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
          </div>
        </div>
      </main>
    </>
  );
}
