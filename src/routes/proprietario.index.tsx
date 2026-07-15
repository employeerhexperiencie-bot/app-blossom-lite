import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { PageSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { carros, type Carro } from "@/lib/mock-data";

export const Route = createFileRoute("/proprietario/")({
  head: () => ({ meta: [{ title: "Frota — TCHI LÉVA Proprietário" }] }),
  component: Frota,
});

const statusInfo: Record<Carro["status"], { label: string; cls: string }> = {
  disponivel: { label: "Disponível", cls: "bg-success/15 text-success" },
  alugado: { label: "Alugado", cls: "bg-primary/15 text-primary" },
  manutencao: { label: "Manutenção", cls: "bg-warning/20 text-warning-foreground" },
};

function Frota() {
  return (
    <>
      <PageSection>
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Total" value={carros.length} />
          <Stat label="Alugados" value={carros.filter((c) => c.status === "alugado").length} />
          <Stat label="Livres" value={carros.filter((c) => c.status === "disponivel").length} />
        </div>
        <Link to="/proprietario/frota/novo">
          <Button className="mt-4 w-full rounded-xl gradient-primary text-primary-foreground shadow-glow">
            <Plus className="mr-2 h-4 w-4" /> Cadastrar carro
          </Button>
        </Link>
      </PageSection>

      <PageSection className="pt-0">
        <div className="flex flex-col gap-3">
          {carros.map((c) => {
            const st = statusInfo[c.status];
            return (
              <Link
                key={c.id}
                to="/proprietario/frota/$carroId"
                params={{ carroId: c.id }}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card hover:border-primary/40"
              >
                <img src={c.foto} alt={c.modelo} className="h-16 w-16 shrink-0 rounded-xl object-cover" loading="lazy" />
                <div className="min-w-0">
                  <div className="truncate font-semibold">{c.marca} {c.modelo}</div>
                  <div className="truncate text-xs text-muted-foreground">{c.placa} · R$ {c.diaria}/dia</div>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${st.cls}`}>{st.label}</span>
              </Link>
            );
          })}
        </div>
      </PageSection>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3 text-center shadow-card">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display text-2xl font-bold">{value}</div>
    </div>
  );
}
