import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { PageSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { FiltroBar } from "@/components/FiltroBar";
import { fmtBRL, fmtData } from "@/lib/mock-proprietario";
import { useProprietario, useCarros } from "@/lib/store-proprietario";

export const Route = createFileRoute("/proprietario/contratos/")({
  head: () => ({ meta: [{ title: "Contratos — TCHI LÉVA" }] }),
  component: Contratos,
});

function Contratos() {
  const contratos = useProprietario((s) => s.contratos);
  const carros = useCarros();
  const [status, setStatus] = useState<string>("todos");
  const [carroId, setCarroId] = useState<string>("todos");
  const [busca, setBusca] = useState("");
  const [faixa, setFaixa] = useState<string>("todos");

  const lista = useMemo(() => {
    return contratos.filter((c) => {
      if (status !== "todos" && c.status !== status) return false;
      if (carroId !== "todos" && c.carroId !== carroId) return false;
      if (busca && !c.motoristaNome.toLowerCase().includes(busca.toLowerCase())) return false;
      if (faixa === "ate100" && c.valor > 100) return false;
      if (faixa === "100a200" && (c.valor < 100 || c.valor > 200)) return false;
      if (faixa === "acima200" && c.valor <= 200) return false;
      return true;
    });
  }, [contratos, status, carroId, busca, faixa]);

  const ativos = (status !== "todos" ? 1 : 0) + (carroId !== "todos" ? 1 : 0) + (faixa !== "todos" ? 1 : 0);

  return (
    <>
      <PageSection>
        <Link to="/proprietario/contratos/novo">
          <Button className="w-full rounded-xl gradient-primary text-primary-foreground shadow-glow">
            <Plus className="mr-2 h-4 w-4" /> Novo contrato
          </Button>
        </Link>
        <div className="mt-4">
          <FiltroBar
            busca={busca}
            onBusca={setBusca}
            buscaPlaceholder="Buscar motorista..."
            ativos={ativos}
            onLimpar={() => { setStatus("todos"); setCarroId("todos"); setBusca(""); setFaixa("todos"); }}
            chips={[
              {
                key: "st", label: "Status", value: status, onChange: setStatus,
                options: [
                  { value: "todos", label: "Todos" },
                  { value: "ativo", label: "Ativo" },
                  { value: "suspenso", label: "Suspenso" },
                  { value: "encerrado", label: "Encerrado" },
                ],
              },
              {
                key: "car", label: "Veículo", value: carroId, onChange: setCarroId,
                options: [
                  { value: "todos", label: "Todos" },
                  ...carros.map((c) => ({ value: c.id, label: `${c.marca} ${c.modelo}` })),
                ],
              },
              {
                key: "fx", label: "Valor", value: faixa, onChange: setFaixa,
                options: [
                  { value: "todos", label: "Todos" },
                  { value: "ate100", label: "Até R$100" },
                  { value: "100a200", label: "R$100–200" },
                  { value: "acima200", label: "Acima R$200" },
                ],
              },
            ]}
          />
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
