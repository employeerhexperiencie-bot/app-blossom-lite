import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { PageSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { carros, type Carro } from "@/lib/mock-data";
import { documentosMock } from "@/lib/mock-proprietario";

export const Route = createFileRoute("/proprietario/frota/")({
  head: () => ({ meta: [{ title: "Frota — TCHI LÉVA Proprietário" }] }),
  component: Frota,
});

const statusInfo: Record<Carro["status"], { label: string; cls: string }> = {
  disponivel: { label: "Disponível", cls: "bg-success/15 text-success" },
  alugado: { label: "Alugado", cls: "bg-primary/15 text-primary" },
  manutencao: { label: "Manutenção", cls: "bg-warning/20 text-warning-foreground" },
};

type Filtro = "todos" | Carro["status"];

function Frota() {
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const lista = filtro === "todos" ? carros : carros.filter((c) => c.status === filtro);

  const alertaCarro = (id: string) =>
    documentosMock.some((d) => d.carroId === id && (d.status === "vencendo" || d.status === "vencido"));

  return (
    <>
      <PageSection>
        <Link to="/proprietario/frota/novo">
          <Button className="w-full rounded-xl gradient-primary text-primary-foreground shadow-glow">
            <Plus className="mr-2 h-4 w-4" /> Cadastrar carro
          </Button>
        </Link>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {(["todos", "disponivel", "alugado", "manutencao"] as Filtro[]).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                filtro === f ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
              }`}
            >
              {f === "todos" ? "Todos" : statusInfo[f].label}
            </button>
          ))}
        </div>
      </PageSection>

      <PageSection className="pt-0">
        <div className="flex flex-col gap-3">
          {lista.map((c) => {
            const st = statusInfo[c.status];
            const alerta = alertaCarro(c.id);
            return (
              <Link
                key={c.id}
                to="/proprietario/frota/$carroId"
                params={{ carroId: c.id }}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card hover:border-primary/40"
              >
                <img src={c.foto} alt={c.modelo} className="h-16 w-16 shrink-0 rounded-xl object-cover" loading="lazy" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-semibold">{c.marca} {c.modelo}</span>
                    {alerta && <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-warning-foreground" />}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">{c.placa} · R$ {c.diaria}/dia</div>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${st.cls}`}>{st.label}</span>
              </Link>
            );
          })}
          {lista.length === 0 && (
            <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
              Nenhum veículo neste filtro.
            </div>
          )}
        </div>
      </PageSection>
    </>
  );
}
