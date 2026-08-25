export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; erro?: string }>;
}) {
  const { next = "/", erro } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="panel w-full max-w-sm p-8">
        <div className="mb-8 flex items-center gap-3">
          <span
            aria-hidden
            className="flex h-8 w-8 flex-col items-center justify-center gap-[3px] rounded-full bg-ink p-1.5"
          >
            <span className="h-1 w-1 rounded-full bg-signal-red" />
            <span className="h-1 w-1 rounded-full bg-signal-amber" />
            <span className="h-1 w-1 rounded-full bg-signal-green" />
          </span>
          <span className="font-display text-sm font-semibold tracking-tight text-ink-muted">
            Radar de Editais
          </span>
        </div>

        <h1 className="font-display text-2xl font-semibold text-ink">
          Acesso restrito
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Essa é uma versão prévia, ainda não pública. Peça a senha pra quem te
          mandou o link.
        </p>

        <form action="/api/login" method="POST" className="mt-8 space-y-4">
          <input type="hidden" name="next" value={next} />
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-xs font-medium text-ink-faint"
            >
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoFocus
              required
              className="w-full rounded-full border border-border-strong bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink focus-visible:ring-2 focus-visible:ring-ink/20"
            />
          </div>

          {erro && (
            <p className="text-sm text-signal-red" role="alert">
              Senha incorreta. Tenta de novo.
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Entrar
          </button>
        </form>
      </div>
    </main>
  );
}
