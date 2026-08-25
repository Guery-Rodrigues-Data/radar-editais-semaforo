import { SiteHeader } from "@/components/SiteHeader";
import { BacklogChart } from "@/components/BacklogChart";
import { backlog } from "@/lib/data";

export default function BacklogPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h1 className="font-display text-2xl font-semibold text-ink">
            Candidatos a backlog — o que os editais mais pedem
          </h1>

          <div className="panel mt-6 p-6">
            <BacklogChart rows={backlog} />
          </div>
        </div>
      </main>
    </>
  );
}
