import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageSection } from "@/components/AppShell";
import { FiltroBar } from "@/components/FiltroBar";
import { useOficina } from "@/lib/store-oficina";
import { iconeCategoria, statusOSInfo } from "@/lib/mock-oficina";

export const Route = createFileRoute("/oficina/agenda")({
  head: () => ({
    meta: [
      { title: "Agenda — Centro de Serviços TCHI LÉVA" },
      { name: "description", content: "Agenda de atendimentos do centro de serviços, por dia e por status." },
      { property: "og:title", content: "Agenda — Centro de Serviços TCHI LÉVA" },
      { property: "og:description", content: "Organize os atendimentos da semana." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Agenda,
});

function diasDaSemana(): { iso: string; label: string; num: string }[] {
  const base = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base.getTime() + i * 864e5);
    return {
      iso: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""),
      num: String(d.getDate()).padStart(2, "0"),
    };
  });
}

function Agenda() {
  const ordens = useOficina((s) => s.ordens);
  const dias = useMemo(diasDaSemana, []);
  const [dia, setDia] = useState(dias[0].iso);
  const [status, setStatus] = useState("todos");
  const [busca, setBusca] = useState("");

  const lista = ordens
    .filter((o) => o.dataAgendada === dia)
    .filter((o) => status === "todos" || o.status === status)
    .filter((o) => {
      const q = busca.trim().toLowerCase();
      return !q || o.veiculo.toLowerCase().includes(q) || o.placa.toLowerCase().includes(q) || o.clienteNome.toLowerCase().includes(q);
    })
    .sort((a, b) => (a.hora ?? "").localeCompare(b.hora ?? ""));

  const ativos = (status !== "todos" ? 1 : 0) + (busca ? 1 : 0);

  return (
    <>
      <PageSection>
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5">
          {dias.map((d) => (
            <button
              key={d.iso}
              onClick={() => setDia(d.iso)}
              className={`shrink-0 rounded-xl border px-3 py-2 text-center ${
                dia === d.iso ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider">{d.label}</div>
              <div className="font-display text-base font-black">{d.num}</div>
            </button>
          ))}
        </div>
      </PageSection>

      <PageSection className="pt-0">
        <FiltroBar
          busca={busca}
          onBusca={setBusca}
          buscaPlaceholder="Placa, veículo ou cliente"
          ativos={ativos}
          onLimpar={() => { setStatus("todos"); setBusca(""); }}
          chips={[
            {
              key: "status",
              label: "Status",
              value: status,
              onChange: setStatus,
              options: [
                { value: "todos", label: "Todos" },
                { value: "agendado", label: "Agendado" },
                { value: "em_atendimento", label: "Em atendimento" },
                { value: "aguardando_aprovacao", label: "Aprovação" },
                { value: "concluido", label: "Concluído" },
              ],
            },
          ]}
        />
      </PageSection>

      <PageSection className="pt-0">
        {lista.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Nenhum atendimento nesse dia.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {lista.map((o) => (
              <Link
                key={o.id}
                to="/oficina/servicos/$osId"
                params={{ osId: o.id }}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border-l-4 border-primary bg-card p-3 shadow-card"
              >
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-center">
                  <div className="text-base">{iconeCategoria(o.categoria)}</div>
                  <div className="font-display text-[11px] font-bold">{o.hora}</div>
                </div>
                <div className="min-w-0">
                  <div className="truncate font-semibold">{o.veiculo}</div>
                  <div className="truncate text-xs text-muted-foreground">{o.descricao} · {o.clienteNome}</div>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${statusOSInfo[o.status].cls}`}>
                  {statusOSInfo[o.status].label}
                </span>
              </Link>
            ))}
          </div>
        )}
      </PageSection>
    </>
  );
}
