import Link from "next/link";
import { SignalMark } from "./SignalMark";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/backlog", label: "Backlog" },
  { href: "/editais", label: "Editais" },
  { href: "/achados", label: "Achados" },
];

export function SiteHeader() {
  return (
    <header>
      <div className="page-container flex items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-3">
          <SignalMark />
          <span className="font-display text-sm font-semibold tracking-tight text-ink">
            Radar de Editais
          </span>
        </Link>
        <nav className="flex items-center gap-1 rounded-full bg-surface p-1 shadow-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-1.5 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
