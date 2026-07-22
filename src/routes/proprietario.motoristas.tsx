import { createFileRoute, Link } from "@tanstack/react-router";
import { Star, FileText } from "lucide-react";
import { useMemo, useState } from "react";
import { PageSection } from "@/components/AppShell";
import { FiltroBar } from "@/components/FiltroBar";
import { motoristas } from "@/lib/mock-data";
import { useProprietario } from "@/lib/store-proprietario";

export const Route = createFileRoute("/proprietario/motoristas")({
  head: () => ({ meta: [{ title: "Motoristas — TCHI LÉVA" }] }),
  component: Motoristas,
});

function Motoristas() {
  const contratos = useProprietario((s) => s.contratos);
  const [status, setStatus] = useState<string>("todos");
  const [notaMin, setNotaMin] = useState<string>("todos");
  const [busca, setBusca] = useState("");

  const lista = useMemo(() => motoristas.filter((m) => {
    if (busca && !m.nome.toLowerCase().includes(busca.toLowerCase())) return false;
    if (status === "atrasado" && !m.inadimplente) return false;
    if (status === "emdia" && m.inadimplente) return false;
    if (notaMin === "45" && m.avaliacao < 4.5) return false;
    if (notaMin === "47" && m.avaliacao < 4.7) return false;
    if (notaMin === "49" && m.avaliacao < 4.9) return false;
    return true;
  }), [busca, status, notaMin]);

  const ativos = (status !== "todos" ? 1 : 0) + (notaMin !== "todos" ? 1 : 0);

  return (
    <PageSection>
      <div className="mb-3">
        <FiltroBar
          busca={busca}
          onBusca={setBusca}
          buscaPlaceholder="Buscar motorista..."
          ativos={ativos}
          onLimpar={() => { setStatus("todos"); setNotaMin("todos"); setBusca(""); }}
          chips={[
            {
              key: "st", label: "Status", value: status, onChange: setStatus,
              options: [
                { value: "todos", label: "Todos" },
                { value: "emdia", label: "Em dia" },
                { value: "atrasado", label: "Atrasado" },
              ],
            },
            {
              key: "nt", label: "Nota mínima", value: notaMin, onChange: setNotaMin,
              options: [
                { value: "todos", label: "Todas" },
                { value: "45", label: "≥ 4,5" },
                { value: "47", label: "≥ 4,7" },
                { value: "49", label: "≥ 4,9" },
              ],
            },
          ]}
        />
      </div>

      <div className="flex flex-col gap-3">
        {lista.map((m) => {
          const contrato = contratos.find((c) => c.motoristaId === m.id && c.status === "ativo");
          return (
            <div key={m.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-accent font-bold">
                {m.nome.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="truncate font-semibold">{m.nome}</div>
                <div className="truncate text-xs text-muted-foreground">Aluga há {m.tempoAluguel}</div>
                {contrato && (
                  <Link
                    to="/proprietario/contratos/$id"
                    params={{ id: contrato.id }}
                    className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-primary underline"
                  >
                    <FileText className="h-3 w-3" /> Contrato ativo
                  </Link>
                )}
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
          );
        })}
        {lista.length === 0 && <p className="text-sm text-muted-foreground">Nenhum motorista neste filtro.</p>}
      </div>
    </PageSection>
  );
}
