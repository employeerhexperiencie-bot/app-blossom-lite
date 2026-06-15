import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { PageSection } from "@/components/AppShell";
import { motoristas } from "@/lib/mock-data";

export const Route = createFileRoute("/proprietario/motoristas")({
  head: () => ({ meta: [{ title: "Motoristas — Conect" }] }),
  component: Motoristas,
});

function Motoristas() {
  return (
    <PageSection>
      <div className="flex flex-col gap-3">
        {motoristas.map((m) => (
          <div key={m.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-accent font-bold">
              {m.nome.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="truncate font-semibold">{m.nome}</div>
              <div className="truncate text-xs text-muted-foreground">Aluga há {m.tempoAluguel}</div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm font-semibold">
                <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                {m.avaliacao}
              </div>
              <div className={`mt-1 text-[10px] font-semibold uppercase ${m.inadimplente ? "text-destructive" : "text-success"}`}>
                {m.inadimplente ? "Atrasado" : "Em dia"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageSection>
  );
}
