import { SiteHeader } from "@/components/SiteHeader";
import { FuncionalidadesBacklog } from "@/components/FuncionalidadesBacklog";
import { EditalTable } from "@/components/EditalTable";
import { SelecaoEditaisProvider } from "@/components/SelecaoEditaisContext";

export default function BacklogPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="page-container px-6 py-12">
          <h1 className="font-display text-2xl font-semibold text-ink">
            Backlog de funcionalidades
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-ink-muted">
            Cada funcionalidade é uma frase de escopo de produto (tipo título de user
            story), reagrupada a partir do que os editais pedem de verdade. O nível vem
            direto da contagem: quantos dos editais que pedem central pedem essa
            funcionalidade específica.
          </p>

          <SelecaoEditaisProvider>
            <div className="mt-6 space-y-6">
              <FuncionalidadesBacklog />
              <EditalTable defaultLabel="Clique numa funcionalidade acima pra ver os editais" />
            </div>
          </SelecaoEditaisProvider>
        </div>
      </main>
    </>
  );
}
