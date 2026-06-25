import { Link, useRouterState } from "@tanstack/react-router";
import { type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/BrandMark";

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
      <header className="sticky top-0 z-30 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-background/80 px-5 py-3.5 backdrop-blur-xl">
        <BrandMark size={30} />
        <div className="min-w-0">
          <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-primary/80">Tchi Léva</div>
          <h1 className="truncate font-street text-[19px] font-black uppercase tracking-wide leading-none">{title}</h1>
        </div>
        {right}
      </header>

      <main className="flex-1 pb-24">{children}</main>

      <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-screen-sm -translate-x-1/2 border-t border-border bg-card/95 backdrop-blur-xl">
        <ul className="grid" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
          {tabs.map((t) => {
            const active = pathname === t.to || (t.to !== "/" && pathname.startsWith(t.to + "/"));
            const Icon = t.icon;
            return (
              <li key={t.to}>
                <Link
                  to={t.to}
                  className={`relative flex flex-col items-center gap-0.5 py-3 text-[11px] font-semibold transition-colors ${
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {active && (
                    <span className="absolute top-0 h-[3px] w-8 rounded-b-full bg-primary shadow-[0_0_12px_var(--primary)]" />
                  )}
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
