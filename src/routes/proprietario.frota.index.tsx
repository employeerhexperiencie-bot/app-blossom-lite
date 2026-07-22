import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, AlertTriangle, Megaphone } from "lucide-react";
import { useMemo, useState } from "react";
import { PageSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { FiltroBar } from "@/components/FiltroBar";
import type { Carro } from "@/lib/mock-data";
import { documentosMock } from "@/lib/mock-proprietario";
import { useCarros, useProprietario, useFinanceiroPorVeiculo } from "@/lib/store-proprietario";

export const Route = createFileRoute("/proprietario/frota/")({
  head: () => ({ meta: [{ title: "Frota — TCHI LÉVA Proprietário" }] }),
  component: Frota,
});

const statusInfo: Record<Carro["status"], { label: string; cls: string }> = {
  disponivel: { label: "Disponível", cls: "bg-success/15 text-success" },
  alugado: { label: "Alugado", cls: "bg-primary/15 text-primary" },
  manutencao: { label: "Manutenção", cls: "bg-warning/20 text-warning-foreground" },
};

function Frota() {
  const carros = useCarros();
  const anuncios = useProprietario((s) => s.anuncios);
  const financeiro = useFinanceiroPorVeiculo();

  const [status, setStatus] = useState<string>("todos");
  const [publicacao, setPublicacao] = useState<string>("todos");
  const [alerta, setAlerta] = useState<string>("todos");
  const [ordem, setOrdem] = useState<string>("novo");
  const [busca, setBusca] = useState("");

  const alertaCarro = (id: string) =>
    documentosMock.some((d) => d.carroId === id && (d.status === "vencendo" || d.status === "vencido"));

  const lista = useMemo(() => {
    let l = carros.slice();
    if (status !== "todos") l = l.filter((c) => c.status === status);
    if (publicacao === "publicado") l = l.filter((c) => anuncios[c.id]?.publicado);
    if (publicacao === "nao") l = l.filter((c) => !anuncios[c.id]?.publicado);
    if (alerta === "sim") l = l.filter((c) => alertaCarro(c.id));
    if (busca) {
      const q = busca.toLowerCase();
      l = l.filter((c) => `${c.marca} ${c.modelo} ${c.placa}`.toLowerCase().includes(q));
    }
    if (ordem === "km") l = l.sort((a, b) => b.km - a.km);
    if (ordem === "receita") {
      l = l.sort((a, b) => {
        const ra = financeiro.find((f) => f.carroId === a.id)?.receita ?? 0;
        const rb = financeiro.find((f) => f.carroId === b.id)?.receita ?? 0;
        return rb - ra;
      });
    }
    return l;
  }, [carros, status, publicacao, alerta, busca, ordem, anuncios, financeiro]);

  const ativos = (status !== "todos" ? 1 : 0) + (publicacao !== "todos" ? 1 : 0) + (alerta !== "todos" ? 1 : 0) + (ordem !== "novo" ? 1 : 0);

  return (
    <>
      <PageSection>
        <Link to="/proprietario/frota/novo">
          <Button className="w-full rounded-xl gradient-primary text-primary-foreground shadow-glow">
            <Plus className="mr-2 h-4 w-4" /> Cadastrar carro
          </Button>
        </Link>
        <div className="mt-4">
          <FiltroBar
            busca={busca}
            onBusca={setBusca}
            buscaPlaceholder="Buscar por modelo ou placa..."
            ativos={ativos}
            onLimpar={() => { setStatus("todos"); setPublicacao("todos"); setAlerta("todos"); setOrdem("novo"); setBusca(""); }}
            chips={[
              {
                key: "status", label: "Status", value: status, onChange: setStatus,
                options: [
                  { value: "todos", label: "Todos" },
                  { value: "disponivel", label: "Disponível" },
                  { value: "alugado", label: "Alugado" },
                  { value: "manutencao", label: "Manutenção" },
                ],
              },
              {
                key: "pub", label: "Publicação", value: publicacao, onChange: setPublicacao,
                options: [
                  { value: "todos", label: "Todos" },
                  { value: "publicado", label: "Publicado" },
                  { value: "nao", label: "Não publicado" },
                ],
              },
              {
                key: "alerta", label: "Documentos", value: alerta, onChange: setAlerta,
                options: [
                  { value: "todos", label: "Todos" },
                  { value: "sim", label: "Com alerta" },
                ],
              },
              {
                key: "ord", label: "Ordenar por", value: ordem, onChange: setOrdem,
                options: [
                  { value: "novo", label: "Mais novo" },
                  { value: "km", label: "Km rodado" },
                  { value: "receita", label: "Receita" },
                ],
              },
            ]}
          />
        </div>
      </PageSection>

      <PageSection className="pt-0">
        <div className="flex flex-col gap-3">
          {lista.map((c) => {
            const st = statusInfo[c.status];
            const alertaC = alertaCarro(c.id);
            const publicado = anuncios[c.id]?.publicado;
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
                    {alertaC && <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-warning-foreground" />}
                    {publicado && <Megaphone className="h-3.5 w-3.5 shrink-0 text-primary" />}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">{c.placa} · R$ {c.diaria}/dia · {c.km.toLocaleString("pt-BR")} km</div>
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
