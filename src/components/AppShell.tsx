import { Link, useRouterState } from "@tanstack/react-router";
import { type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type Tab = { to: string; label: string; icon: LucideIcon };

export function AppShell({
  title,
  tabs,
  children,
  right,
}: {
  title: string;
  tabs: Tab[];
  children: ReactNode;
  right?: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-screen-sm flex-col bg-background">
      <header className="sticky top-0 z-30 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-background/85 px-5 py-4 backdrop-blur">
        <h1 className="truncate font-display text-xl font-bold">{title}</h1>
        {right}
      </header>

      <main className="flex-1 pb-24">{children}</main>

      <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-screen-sm -translate-x-1/2 border-t border-border bg-card/95 backdrop-blur">
        <ul className="grid" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
          {tabs.map((t) => {
            const active = pathname === t.to || (t.to !== "/" && pathname.startsWith(t.to + "/"));
            const Icon = t.icon;
            return (
              <li key={t.to}>
                <Link
                  to={t.to}
                  className={`flex flex-col items-center gap-0.5 py-3 text-[11px] font-medium transition-colors ${
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? "scale-110" : ""} transition-transform`} />
                  <span className="truncate">{t.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export function PageSection({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`px-5 py-5 ${className}`}>{children}</section>;
}
