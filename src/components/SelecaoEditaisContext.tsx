"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type Selecao = { label: string; editalSlugs: string[] } | null;

type Ctx = { selecao: Selecao; selecionar: (s: Selecao) => void };

const SelecaoContext = createContext<Ctx | null>(null);

export function SelecaoEditaisProvider({ children }: { children: ReactNode }) {
  const [selecao, setSelecao] = useState<Selecao>(null);
  const value = useMemo(() => ({ selecao, selecionar: setSelecao }), [selecao]);
  return (
    <SelecaoContext.Provider value={value}>{children}</SelecaoContext.Provider>
  );
}

// Cada gráfico clicável (mapa, protocolo, barra) chama `selecionar` com o
// mesmo formato { label, editalSlugs } — a tabela no fim da página lê daqui,
// então não precisa de lista própria dentro de cada card.
export function useSelecaoEditais() {
  const ctx = useContext(SelecaoContext);
  if (!ctx) {
    throw new Error("useSelecaoEditais precisa estar dentro de <SelecaoEditaisProvider>");
  }
  return ctx;
}
