import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin } from "lucide-react";
import { PageSection } from "@/components/AppShell";
import { FiltroBar } from "@/components/FiltroBar";
import { Button } from "@/components/ui/button";
import { useOficina } from "@/lib/store-oficina";
import { categoriasServico, fmtBRL, iconeCategoria, statusOSInfo, totalOS } from "@/lib/mock-oficina";
import { toast } from "sonner";

type Busca = { status?: string };

export const Route = createFileRoute("/oficina/servicos/")({
  validateSearch: (s: Record<string, unknown>): Busca => ({
    status: typeof s.status === "string" ? s.status : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Serviços — Centro de Serviços TCHI LÉVA" },
      { name: "description", content: "Fila de ordens de serviço e solicitações do marketplace TCHI LÉVA." },
      { property: "og:title", content: "Serviços — Centro de Serviços TCHI LÉVA" },
      { property: "og:description", content: "Gerencie ordens de serviço do início à conclusão." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Servicos,
});

function Servicos() {
  const { status: statusInicial } = Route.useSearch();
  const ordens = useOficina((s) => s.ordens);
  const aceitar = useOficina((s) => s.aceitarSolicitacao);
  const recusar = useOficina((s) => s.recusarSolicitacao);

  const [aba, setAba] = useState<"fila" | "marketplace">("fila");
  const [status, setStatus] = useState(statusInicial ?? "todos");
  const [categoria, setCategoria] = useState("todas");
  const [busca, setBusca] = useState("");

  const marketplace = ordens.filter((o) => o.origem === "marketplace" && o.status === "solicitado");

  const fila = ordens
    .filter((o) => !(o.origem === "marketplace" && o.status === "solicitado"))
    .filter((o) => status === "todos" || o.status === status)
    .filter((o) => categoria === "todas" || o.categoria === categoria)
    .filter((o) => {
      const q = busca.trim().toLowerCase();
      return !q || o.veiculo.toLowerCase().includes(q) || o.placa.toLowerCase().includes(q) || o.clienteNome.toLowerCase().includes(q) || o.codigo.toLowerCase().includes(q);
    });

  const ativos = (status !== "todos" ? 1 : 0) + (categoria !== "todas" ? 1 : 0) + (busca ? 1 : 0);

  return (
    <>
      <PageSection>
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
          {(["fila", "marketplace"] as const).map((a) => (
            <button
              key={a}
              onClick={() => setAba(a)}
              className={`rounded-lg py-2 text-xs font-bold uppercase tracking-wider ${
                aba === a ? "bg-card shadow-card" : "text-muted-foreground"
              }`}
            >
              {a === "fila" ? "Ordens de serviço" : `Marketplace (${marketplace.length})`}
            </button>
          ))}
        </div>
      </PageSection>

      {aba === "fila" ? (
        <>
          <PageSection className="pt-0">
            <FiltroBar
              busca={busca}
              onBusca={setBusca}
              buscaPlaceholder="OS, placa, veículo ou cliente"
              ativos={ativos}
              onLimpar={() => { setStatus("todos"); setCategoria("todas"); setBusca(""); }}
              chips={[
                {
                  key: "status",
                  label: "Status",
                  value: status,
                  onChange: setStatus,
                  options: [
                    { value: "todos", label: "Todos" },
                    { value: "solicitado", label: "Solicitado" },
                    { value: "aceito", label: "Aceito" },
                    { value: "agendado", label: "Agendado" },
                    { value: "em_atendimento", label: "Em atendimento" },
                    { value: "aguardando_aprovacao", label: "Aprovação" },
                    { value: "concluido", label: "Concluído" },
                  ],
                },
                {
                  key: "categoria",
                  label: "Tipo de serviço",
                  value: categoria,
                  onChange: setCategoria,
                  options: [
                    { value: "todas", label: "Todas" },
                    ...categoriasServico.map((c) => ({ value: c.key, label: c.label })),
                  ],
                },
              ]}
            />
          </PageSection>

          <PageSection className="pt-0">
            {fila.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Nenhuma ordem encontrada com esses filtros.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {fila.map((o) => (
                  <Link
                    key={o.id}
                    to="/oficina/servicos/$osId"
                    params={{ osId: o.id }}
                    className="rounded-2xl border border-border bg-card p-4 shadow-card"
                  >
                    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-muted text-lg">{iconeCategoria(o.categoria)}</div>
                      <div className="min-w-0">
                        <div className="truncate font-semibold">{o.veiculo}</div>
                        <div className="truncate text-xs text-muted-foreground">{o.codigo} · {o.placa} · {o.clienteNome}</div>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${statusOSInfo[o.status].cls}`}>
                        {statusOSInfo[o.status].label}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="truncate">{o.descricao}</span>
                      <span className="ml-2 shrink-0 font-display font-bold text-foreground">
                        {fmtBRL(totalOS(o) || o.valorEstimado || 0)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </PageSection>
        </>
      ) : (
        <PageSection className="pt-0">
          {marketplace.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Nenhuma solicitação aberta na sua região agora.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {marketplace.map((o) => (
                <div key={o.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
                  <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-lg">{iconeCategoria(o.categoria)}</div>
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{o.veiculo}</div>
                      <div className="truncate text-xs text-muted-foreground">{o.clienteNome} · {o.placa}</div>
                    </div>
                  </div>
                  <p className="mt-2 rounded-xl bg-muted/60 p-2.5 text-sm">"{o.descricao}"</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {o.distanciaKm} km</span>
                    <span>Estimado {fmtBRL(o.valorEstimado ?? 0)}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button variant="outline" className="rounded-xl" onClick={() => { recusar(o.id); toast("Solicitação recusada."); }}>
                      Recusar
                    </Button>
                    <Button
                      className="rounded-xl gradient-primary text-primary-foreground"
                      onClick={() => { aceitar(o.id); toast.success("Solicitação aceita! Agende o horário."); setAba("fila"); }}
                    >
                      Aceitar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PageSection>
      )}
    </>
  );
}
