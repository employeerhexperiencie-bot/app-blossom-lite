import { createFileRoute, Link } from "@tanstack/react-router";
import { Star, FileText } from "lucide-react";
import { useMemo, useState } from "react";
import { PageSection } from "@/components/AppShell";
import { FiltroBar } from "@/components/FiltroBar";
import { motoristas } from "@/lib/mock-data";
import { fmtBRL, fmtData, statusContratoLabel } from "@/lib/mock-proprietario";
import { useProprietario } from "@/lib/store-proprietario";
import { motoristasDosContratos } from "@/lib/motoristas-proprietario";
import { ContratosNav } from "@/components/proprietario/ContratosNav";

export const Route = createFileRoute("/proprietario/contratos/motoristas")({
  head: () => ({ meta: [{ title: "Motoristas — TCHI LÉVA" }] }),
  component: Motoristas,
});

// Notas que o app já conhece dos motoristas simulados.
const notasConhecidas = Object.fromEntries(motoristas.map((m) => [m.id, m.avaliacao]));

function Motoristas() {
  const contratos = useProprietario((s) => s.contratos);
  const pagamentos = useProprietario((s) => s.pagamentos);
  const solicitacoes = useProprietario((s) => s.solicitacoes);
  const [status, setStatus] = useState<string>("todos");
  const [notaMin, setNotaMin] = useState<string>("todos");
  const [busca, setBusca] = useState("");

  const todos = useMemo(
    () => motoristasDosContratos(contratos, pagamentos, solicitacoes, notasConhecidas),
    [contratos, pagamentos, solicitacoes],
  );

  const lista = todos.filter((m) => {
    if (busca && !m.nome.toLowerCase().includes(busca.toLowerCase())) return false;
    if (status === "atrasado" && m.atrasadosQtd === 0) return false;
    if (status === "emdia" && m.atrasadosQtd > 0) return false;
    if (status === "atual" && !m.contratoAtual) return false;
    const minimo = notaMin === "todos" ? 0 : Number(notaMin) / 10;
    if (minimo && (m.avaliacao ?? 0) < minimo) return false;
    return true;
  });

  const ativos = (status !== "todos" ? 1 : 0) + (notaMin !== "todos" ? 1 : 0);

  return (
    <PageSection>
      <ContratosNav atual="motoristas" />
      <div className="mb-3">
        <FiltroBar
          busca={busca}
          onBusca={setBusca}
          buscaPlaceholder="Buscar motorista..."
          ativos={ativos}
          onLimpar={() => {
            setStatus("todos");
            setNotaMin("todos");
            setBusca("");
          }}
          chips={[
            {
              key: "st",
              label: "Status",
              value: status,
              onChange: setStatus,
              options: [
                { value: "todos", label: "Todos" },
                { value: "atual", label: "Com contrato atual" },
                { value: "emdia", label: "Em dia" },
                { value: "atrasado", label: "Com atraso" },
              ],
            },
            {
              key: "nt",
              label: "Nota mínima",
              value: notaMin,
              onChange: setNotaMin,
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
        {lista.map((m) => (
          <div key={m.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-accent font-bold">
                {m.nome.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="truncate font-semibold">{m.nome}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {m.contratos.length} contrato{m.contratos.length > 1 ? "s" : ""} · desde{" "}
                  {fmtData(m.desde)}
                </div>
              </div>
              <div className="text-right">
                {m.avaliacao != null && (
                  <div className="flex items-center justify-end gap-1 text-sm font-semibold">
                    <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                    {m.avaliacao.toFixed(1)}
                  </div>
                )}
                <div
                  className={`mt-1 text-[10px] font-semibold uppercase ${
                    m.atrasadosQtd > 0 ? "text-destructive" : "text-success"
                  }`}
                >
                  {m.atrasadosQtd > 0 ? "Com atraso" : "Em dia"}
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl border border-border bg-background p-2">
                <div className="text-[10px] uppercase text-muted-foreground">Pago</div>
                <div className="font-semibold">
                  {fmtBRL(m.pagoTotal)} · {m.pagosQtd}x
                </div>
              </div>
              <div className="rounded-xl border border-border bg-background p-2">
                <div className="text-[10px] uppercase text-muted-foreground">Em atraso</div>
                <div className={`font-semibold ${m.atrasadosQtd > 0 ? "text-destructive" : ""}`}>
                  {fmtBRL(m.atrasadoTotal)} · {m.atrasadosQtd}x
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {m.contratos.map((c) => (
                <Link
                  key={c.id}
                  to="/proprietario/contratos/$id"
                  params={{ id: c.id }}
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                    c === m.contratoAtual
                      ? "border-primary/50 text-primary"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  <FileText className="h-3 w-3" /> {statusContratoLabel[c.status]} ·{" "}
                  {fmtData(c.inicio)}
                </Link>
              ))}
            </div>
          </div>
        ))}
        {lista.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum motorista neste filtro.</p>
        )}
      </div>
    </PageSection>
  );
}
