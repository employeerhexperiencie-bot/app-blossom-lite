import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { PageSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { carros } from "@/lib/mock-data";
import { fmtBRL, fmtData, type Contrato } from "@/lib/mock-proprietario";
import { useProprietario } from "@/lib/store-proprietario";

export const Route = createFileRoute("/proprietario/contratos/")({
  head: () => ({ meta: [{ title: "Contratos — TCHI LÉVA" }] }),
  component: Contratos,
});

type Filtro = "todos" | Contrato["status"];

function Contratos() {
  const contratos = useProprietario((s) => s.contratos);
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const lista = filtro === "todos" ? contratos : contratos.filter((c) => c.status === filtro);

  return (
    <>
      <PageSection>
        <Link to="/proprietario/contratos/novo">
          <Button className="w-full rounded-xl gradient-primary text-primary-foreground shadow-glow">
            <Plus className="mr-2 h-4 w-4" /> Novo contrato
          </Button>
        </Link>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {(["todos", "ativo", "suspenso", "encerrado"] as Filtro[]).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${
                filtro === f ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </PageSection>

      <PageSection className="pt-0">
        <div className="flex flex-col gap-2">
          {lista.map((ct) => {
            const carro = carros.find((c) => c.id === ct.carroId);
            return (
              <Link
                key={ct.id}
                to="/proprietario/contratos/$id"
                params={{ id: ct.id }}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card hover:border-primary/40"
              >
                <div className="min-w-0">
                  <div className="truncate font-semibold">{ct.motoristaNome}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {carro ? `${carro.marca} ${carro.modelo}` : "—"} · {fmtBRL(ct.valor)} / {ct.periodicidade}
                  </div>
                  <div className="text-[10px] uppercase text-muted-foreground">Desde {fmtData(ct.inicio)}</div>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${
                  ct.status === "ativo" ? "bg-success/15 text-success" :
                  ct.status === "suspenso" ? "bg-warning/20 text-warning-foreground" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {ct.status}
                </span>
              </Link>
            );
          })}
          {lista.length === 0 && (
            <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
              Nenhum contrato neste filtro.
            </div>
          )}
        </div>
      </PageSection>
    </>
  );
}
