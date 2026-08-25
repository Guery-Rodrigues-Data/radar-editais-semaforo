import Link from "next/link";
import { SignalMark } from "./SignalMark";

const NAV = [
  { href: "/achados", label: "Achados" },
  { href: "/backlog", label: "Backlog" },
  { href: "/editais", label: "Editais" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <SignalMark />
          <span className="font-display text-sm font-semibold tracking-tight text-ink">
            Radar de Editais
          </span>
        </Link>
        <nav className="flex items-center gap-6">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-mono text-xs uppercase tracking-wide text-ink-muted transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
