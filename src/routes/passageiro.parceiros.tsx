import { createFileRoute } from "@tanstack/react-router";
import { PageSection } from "@/components/AppShell";
import { lojas } from "@/lib/mock-data";

export const Route = createFileRoute("/passageiro/parceiros")({
  head: () => ({ meta: [{ title: "Lojas parceiras — Conect" }] }),
  component: Parceiros,
});

function Parceiros() {
  return (
    <PageSection>
      <div className="flex flex-col gap-3">
        {lojas.map((l) => (
          <div key={l.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent text-xl">🏪</div>
            <div className="min-w-0">
              <div className="truncate font-semibold">{l.nome}</div>
              <div className="truncate text-xs text-muted-foreground">{l.categoria} · {l.distanciaKm} km</div>
            </div>
            <div className="shrink-0 rounded-full bg-success/15 px-2.5 py-1 text-xs font-bold text-success">{l.cashback}% volta</div>
          </div>
        ))}
      </div>
    </PageSection>
  );
}
