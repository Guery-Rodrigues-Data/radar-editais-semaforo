import { SiteHeader } from "@/components/SiteHeader";
import { EditalIndice } from "@/components/EditalIndice";
import { editais } from "@/lib/data";

export const metadata = {
  title: "Índice de Editais — Radar de Editais",
};

export default function IndicePage() {
  // Só editais com nota própria — os PDFs sem nota (2ª via/anexo/complemento,
  // ver página Editais) não têm ficha de análise pra essa lista abrir.
  const analisados = editais.filter((e) => !e.semNota);
  const comData = analisados.filter((e) => e.dataEdital).length;
  const comPdf = analisados.filter((e) => e.pdfName).length;

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="page-container px-4 py-12 sm:px-6">
          <p className="text-xs font-semibold text-signal-red">Índice</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
            Todos os editais, num lugar só
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-muted">
            Visão organizada dos {analisados.length} editais analisados, com
            data, maturidade da central e tags. Cada linha é um atalho: abre a{" "}
            <strong>nota</strong> de análise no site ou baixa o{" "}
            <strong>edital em PDF</strong> original.
          </p>
          <p className="mt-2 max-w-2xl text-xs text-ink-faint">
            {comData} dos {analisados.length} já têm data capturada · {comPdf}{" "}
            têm PDF vinculado. O download do PDF só funciona com o site
            rodando na máquina do Guery (os PDFs não vão pro deploy).
          </p>

          <div className="mt-8">
            <EditalIndice editais={analisados} />
          </div>
        </div>
      </main>
    </>
  );
}
